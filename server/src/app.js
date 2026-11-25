import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { ensureDb, isRemoteTurso } from './db.js';
import equiposRoutes from './routes/equipos.js';
import clientesRoutes from './routes/clientes.js';
import catalogosRoutes from './routes/catalogos.js';
import estadisticasRoutes from './routes/estadisticas.js';
import repuestosRoutes from './routes/repuestos.js';
import herramientasRoutes from './routes/herramientas.js';
import reportesRoutes from './routes/reportes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Garantiza que las tablas y catálogos existan antes de atender peticiones API (esencial en cold starts de Vercel)
app.use('/api', async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    console.error('Error inicializando base de datos:', err);
    res.status(500).json({
      success: false,
      message: 'Error conectando con la base de datos',
      error: err.message
    });
  }
});

// API Routes
app.use('/api/equipos', equiposRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/repuestos', repuestosRoutes);
app.use('/api/herramientas', herramientasRoutes);
app.use('/api/reportes', reportesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const storageMode = isRemoteTurso
    ? 'turso-cloud'
    : process.env.VERCEL
      ? 'ephemeral-tmp-configure-turso'
      : 'local-sqlite';

  res.json({
    status: 'online',
    app: 'ARBASONIC Reparación Electrónica API',
    storage: storageMode,
    timestamp: new Date().toISOString()
  });
});

// En modo local (no Vercel), servir el frontend compilado desde client/dist
if (!process.env.VERCEL) {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

export default app;

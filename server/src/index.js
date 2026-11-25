import 'dotenv/config';
import app from './app.js';
import { ensureDb, isRemoteTurso } from './db.js';

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  ensureDb()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log('========================================================');
        console.log('  ARBASONIC - Reparación Electrónica | Sistema en Línea');
        console.log('========================================================');
        console.log(`  Aplicación disponible en: http://localhost:${PORT}`);
        console.log(`  Base de datos: ${isRemoteTurso ? 'Turso Cloud (SQLite en la nube)' : 'server/data/arbasonic.db (Local)'}`);
        console.log('  Presiona Ctrl + C en esta ventana para cerrar el sistema.');
        console.log('========================================================');
      });
    })
    .catch((err) => {
      console.error('Error fatal al inicializar la base de datos:', err);
      process.exit(1);
    });
}

export default app;

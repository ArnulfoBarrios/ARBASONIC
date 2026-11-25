import { Router } from 'express';
import { queryAll, queryOne } from '../db.js';

const router = Router();

// GET /api/clientes - Buscar clientes por nombre o cédula
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM clientes';
    const params = [];

    if (search && search.trim()) {
      query += ' WHERE nombre LIKE ? OR cedula LIKE ?';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }
    query += ' ORDER BY nombre ASC LIMIT 20';

    const clientes = await queryAll(query, params);
    res.json({ success: true, data: clientes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/clientes/cedula/:cedula - Buscar cliente exacto por cédula para autocompletar
router.get('/cedula/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const cliente = await queryOne('SELECT * FROM clientes WHERE cedula = ?', [cedula.trim()]);

    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    res.json({ success: true, data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

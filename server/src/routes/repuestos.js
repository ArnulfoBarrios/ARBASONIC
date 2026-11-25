import { Router } from 'express';
import { queryAll, execute } from '../db.js';

const router = Router();

const normalizeText = (str) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// GET /api/repuestos
router.get('/', async (req, res) => {
  try {
    const { search, categoria, stock_bajo } = req.query;
    let query = 'SELECT * FROM repuestos WHERE 1=1';
    const params = [];

    if (categoria && categoria !== 'Todas') {
      query += ' AND categoria = ?';
      params.push(categoria.trim());
    }

    if (stock_bajo === 'true') {
      query += ' AND stock_actual <= stock_minimo';
    }

    query += ' ORDER BY descripcion ASC';

    let repuestos = await queryAll(query, params);

    if (search && search.trim()) {
      const tokens = normalizeText(search).split(/\s+/).filter(Boolean);
      repuestos = repuestos.filter((r) => {
        const searchable = normalizeText([r.codigo, r.descripcion, r.marca, r.referencia, r.categoria, r.ubicacion].join(' '));
        return tokens.every((tok) => searchable.includes(tok));
      });
    }

    res.json({ success: true, count: repuestos.length, data: repuestos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/repuestos
router.post('/', async (req, res) => {
  try {
    const {
      codigo, categoria, descripcion, marca, referencia,
      estado_main, estado_tcon, estado_fuente,
      stock_minimo, stock_actual, precio_costo, precio_venta, ubicacion, proveedor, observaciones
    } = req.body;

    if (!codigo || !categoria || !descripcion) {
      return res.status(400).json({ success: false, message: 'Código, categoría y descripción son obligatorios' });
    }

    const info = await execute(`
      INSERT INTO repuestos (
        codigo, categoria, descripcion, marca, referencia,
        estado_main, estado_tcon, estado_fuente,
        stock_minimo, stock_actual, precio_costo, precio_venta, ubicacion, proveedor, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo.trim().toUpperCase(),
      categoria.trim(),
      descripcion.trim(),
      marca?.trim() || '',
      referencia?.trim() || '',
      estado_main || 'No aplica',
      estado_tcon || 'No aplica',
      estado_fuente || 'No aplica',
      Number(stock_minimo) || 1,
      Number(stock_actual) || 0,
      Number(precio_costo) || 0,
      Number(precio_venta) || 0,
      ubicacion?.trim() || '',
      proveedor?.trim() || '',
      observaciones?.trim() || ''
    ]);

    res.status(201).json({ success: true, message: 'Repuesto registrado con éxito', id: info.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/repuestos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo, categoria, descripcion, marca, referencia,
      estado_main, estado_tcon, estado_fuente,
      stock_minimo, stock_actual, precio_costo, precio_venta, ubicacion, proveedor, observaciones
    } = req.body;

    await execute(`
      UPDATE repuestos SET
        codigo = COALESCE(?, codigo),
        categoria = COALESCE(?, categoria),
        descripcion = COALESCE(?, descripcion),
        marca = COALESCE(?, marca),
        referencia = COALESCE(?, referencia),
        estado_main = COALESCE(?, estado_main),
        estado_tcon = COALESCE(?, estado_tcon),
        estado_fuente = COALESCE(?, estado_fuente),
        stock_minimo = COALESCE(?, stock_minimo),
        stock_actual = COALESCE(?, stock_actual),
        precio_costo = COALESCE(?, precio_costo),
        precio_venta = COALESCE(?, precio_venta),
        ubicacion = COALESCE(?, ubicacion),
        proveedor = COALESCE(?, proveedor),
        observaciones = COALESCE(?, observaciones),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      codigo?.trim()?.toUpperCase() || null,
      categoria?.trim() || null,
      descripcion?.trim() || null,
      marca?.trim() || null,
      referencia?.trim() || null,
      estado_main || null,
      estado_tcon || null,
      estado_fuente || null,
      stock_minimo !== undefined ? Number(stock_minimo) : null,
      stock_actual !== undefined ? Number(stock_actual) : null,
      precio_costo !== undefined ? Number(precio_costo) : null,
      precio_venta !== undefined ? Number(precio_venta) : null,
      ubicacion?.trim() || null,
      proveedor?.trim() || null,
      observaciones?.trim() || null,
      id
    ]);

    res.json({ success: true, message: 'Repuesto actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/repuestos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await execute('DELETE FROM repuestos WHERE id = ?', [id]);
    res.json({ success: true, message: 'Repuesto eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

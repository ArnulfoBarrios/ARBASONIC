import { Router } from 'express';
import { queryAll, queryOne, execute, runTransaction } from '../db.js';

const router = Router();

const normalizeText = (str) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// GET /api/herramientas
router.get('/', async (req, res) => {
  try {
    const { search, categoria, estado } = req.query;
    let query = 'SELECT * FROM herramientas WHERE 1=1';
    const params = [];

    if (categoria && categoria !== 'Todas') {
      query += ' AND categoria = ?';
      params.push(categoria.trim());
    }

    if (estado && estado !== 'Todos') {
      query += ' AND estado = ?';
      params.push(estado.trim());
    }

    query += ' ORDER BY codigo ASC';

    let herramientas = await queryAll(query, params);

    if (search && search.trim()) {
      const tokens = normalizeText(search).split(/\s+/).filter(Boolean);
      herramientas = herramientas.filter((h) => {
        const searchable = normalizeText([h.codigo, h.nombre, h.responsable, h.ubicacion, h.categoria].join(' '));
        return tokens.every((tok) => searchable.includes(tok));
      });
    }

    res.json({ success: true, count: herramientas.length, data: herramientas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/herramientas
router.post('/', async (req, res) => {
  try {
    const { codigo, nombre, categoria, ubicacion, responsable, estado, costo_adquisicion } = req.body;

    if (!codigo || !codigo.trim() || !nombre || !nombre.trim() || !categoria || !categoria.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Código, nombre y categoría son campos obligatorios'
      });
    }

    const codigoNorm = codigo.trim().toUpperCase();
    const exists = await queryOne('SELECT id FROM herramientas WHERE codigo = ?', [codigoNorm]);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: `Ya existe una herramienta registrada con el código ${codigoNorm}`
      });
    }

    const info = await execute(
      'INSERT INTO herramientas (codigo, nombre, categoria, ubicacion, responsable, estado, costo_adquisicion) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        codigoNorm,
        nombre.trim(),
        categoria.trim(),
        ubicacion?.trim() || 'Taller',
        responsable?.trim() || 'Taller',
        estado?.trim() || 'Disponible',
        Number(costo_adquisicion) || 0
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Herramienta registrada exitosamente',
      id: info.lastInsertRowid
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/herramientas/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const current = await queryOne('SELECT * FROM herramientas WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Herramienta no encontrada' });
    }

    const { codigo, nombre, categoria, ubicacion, responsable, estado, costo_adquisicion } = req.body;

    const codigoNorm = codigo ? codigo.trim().toUpperCase() : current.codigo;
    if (codigoNorm !== current.codigo) {
      const dup = await queryOne('SELECT id FROM herramientas WHERE codigo = ? AND id != ?', [codigoNorm, id]);
      if (dup) {
        return res.status(409).json({
          success: false,
          message: `El código ${codigoNorm} ya pertenece a otra herramienta`
        });
      }
    }

    await execute(`
      UPDATE herramientas SET
        codigo = ?,
        nombre = COALESCE(?, nombre),
        categoria = COALESCE(?, categoria),
        ubicacion = COALESCE(?, ubicacion),
        responsable = COALESCE(?, responsable),
        estado = COALESCE(?, estado),
        costo_adquisicion = COALESCE(?, costo_adquisicion)
      WHERE id = ?
    `, [
      codigoNorm,
      nombre?.trim() || null,
      categoria?.trim() || null,
      ubicacion !== undefined ? ubicacion.trim() : null,
      responsable !== undefined ? responsable.trim() : null,
      estado?.trim() || null,
      costo_adquisicion !== undefined && costo_adquisicion !== '' ? Number(costo_adquisicion) : null,
      id
    ]);

    res.json({ success: true, message: 'Herramienta actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/herramientas/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const info = await execute('DELETE FROM herramientas WHERE id = ?', [id]);

    if (info.rowsAffected === 0) {
      return res.status(404).json({ success: false, message: 'Herramienta no encontrada' });
    }

    res.json({ success: true, message: 'Herramienta eliminada del inventario' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/herramientas/prestamos
router.get('/prestamos', async (req, res) => {
  try {
    const { search, estado } = req.query;
    const rows = await queryAll(`
      SELECT 
        p.*,
        h.codigo AS herramienta_codigo,
        h.nombre AS herramienta_nombre,
        h.categoria AS herramienta_categoria
      FROM prestamos_herramientas p
      JOIN herramientas h ON p.herramienta_id = h.id
      ORDER BY p.fecha_prestamo DESC, p.id DESC
    `);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let prestamos = rows.map((p) => {
      if (p.estado_prestamo === 'Devuelto') return p;
      const prevista = new Date(`${p.devolucion_prevista}T00:00:00`);
      if (!Number.isNaN(prevista.getTime()) && hoy > prevista) {
        const dias = Math.ceil((hoy - prevista) / (1000 * 60 * 60 * 24));
        return { ...p, estado_prestamo: 'Retrasado', dias_retraso: dias };
      }
      return p;
    });

    if (search && search.trim()) {
      const tokens = normalizeText(search).split(/\s+/).filter(Boolean);
      prestamos = prestamos.filter((p) => {
        const searchable = normalizeText([
          p.codigo_prestamo,
          p.herramienta_codigo,
          p.herramienta_nombre,
          p.persona_recibe,
          p.departamento
        ].join(' '));
        return tokens.every((tok) => searchable.includes(tok));
      });
    }

    if (estado && estado !== 'Todos') {
      prestamos = prestamos.filter((p) => p.estado_prestamo === estado);
    }

    res.json({ success: true, count: prestamos.length, data: prestamos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/herramientas/prestamos
router.post('/prestamos', async (req, res) => {
  try {
    const { herramienta_id, persona_recibe, departamento, fecha_prestamo, devolucion_prevista, observaciones } = req.body;

    if (!herramienta_id || !persona_recibe?.trim() || !fecha_prestamo || !devolucion_prevista) {
      return res.status(400).json({ success: false, message: 'Herramienta, persona y fechas son obligatorios' });
    }

    const herramienta = await queryOne('SELECT * FROM herramientas WHERE id = ?', [herramienta_id]);
    if (!herramienta) {
      return res.status(404).json({ success: false, message: 'Herramienta no encontrada' });
    }
    if (herramienta.estado !== 'Disponible') {
      return res.status(400).json({
        success: false,
        message: `La herramienta ${herramienta.codigo} no está disponible (estado actual: ${herramienta.estado})`
      });
    }

    const maxId = (await queryOne('SELECT COALESCE(MAX(id), 0) as m FROM prestamos_herramientas'))?.m || 0;
    const codigo_prestamo = `PR-${String(maxId + 1).padStart(3, '0')}`;

    const newId = await runTransaction(async (tx) => {
      const info = await tx.execute(`
        INSERT INTO prestamos_herramientas (
          codigo_prestamo, herramienta_id, persona_recibe, departamento,
          fecha_prestamo, devolucion_prevista, estado_prestamo, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, 'En curso', ?)
      `, [
        codigo_prestamo,
        herramienta_id,
        persona_recibe.trim(),
        departamento?.trim() || 'Taller',
        fecha_prestamo,
        devolucion_prevista,
        observaciones?.trim() || ''
      ]);

      await tx.execute("UPDATE herramientas SET estado = 'En uso', responsable = ? WHERE id = ?", [
        persona_recibe.trim(),
        herramienta_id
      ]);

      return info.lastInsertRowid;
    });

    res.status(201).json({ success: true, message: 'Préstamo registrado exitosamente', id: newId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/herramientas/prestamos/:id/devolver
router.put('/prestamos/:id/devolver', async (req, res) => {
  try {
    const { id } = req.params;
    const { devolucion_real } = req.body;
    const fechaReal = devolucion_real || new Date().toISOString().split('T')[0];

    const prestamo = await queryOne('SELECT * FROM prestamos_herramientas WHERE id = ?', [id]);
    if (!prestamo) {
      return res.status(404).json({ success: false, message: 'Préstamo no encontrado' });
    }

    const fPrevista = new Date(prestamo.devolucion_prevista);
    const fReal = new Date(fechaReal);
    const diffDays = Math.max(0, Math.ceil((fReal - fPrevista) / (1000 * 60 * 60 * 24)));

    await runTransaction(async (tx) => {
      await tx.execute(
        "UPDATE prestamos_herramientas SET devolucion_real = ?, estado_prestamo = 'Devuelto', dias_retraso = ? WHERE id = ?",
        [fechaReal, diffDays, id]
      );
      await tx.execute(
        "UPDATE herramientas SET estado = 'Disponible', responsable = 'Taller' WHERE id = ?",
        [prestamo.herramienta_id]
      );
    });

    res.json({ success: true, message: 'Herramienta devuelta y disponible en el taller' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

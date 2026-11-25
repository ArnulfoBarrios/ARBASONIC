import { Router } from 'express';
import { queryAll, queryOne, execute, runTransaction } from '../db.js';

const router = Router();

const TIPOS_VALIDOS = ['marca', 'tipo_equipo', 'accesorio', 'dano'];

const EQUIPO_COL_BY_TIPO = {
  marca: 'marca',
  tipo_equipo: 'tipo_equipo',
  accesorio: 'accesorios',
  dano: 'dano_reportado'
};

// GET /api/catalogos - Retorna todos los catálogos activos agrupados
router.get('/', async (req, res) => {
  try {
    const rows = await queryAll('SELECT id, tipo_catalogo, valor, activo FROM catalogos WHERE activo = 1 ORDER BY valor ASC');

    const catalogos = {
      marcas: rows.filter(r => r.tipo_catalogo === 'marca').map(r => r.valor),
      tipos: rows.filter(r => r.tipo_catalogo === 'tipo_equipo').map(r => r.valor),
      accesorios: rows.filter(r => r.tipo_catalogo === 'accesorio').map(r => r.valor),
      danos: rows.filter(r => r.tipo_catalogo === 'dano').map(r => r.valor)
    };

    res.json({ success: true, data: catalogos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/catalogos/detalle - Listado completo con ID, estado y conteo de uso en órdenes
router.get('/detalle', async (req, res) => {
  try {
    const rows = await queryAll(`
      SELECT id, tipo_catalogo, valor, activo, created_at
      FROM catalogos
      ORDER BY tipo_catalogo ASC, valor ASC
    `);

    const countsByTipo = {};
    for (const [tipo, col] of Object.entries(EQUIPO_COL_BY_TIPO)) {
      const counts = await queryAll(`SELECT ${col} AS val, COUNT(*) AS total FROM equipos GROUP BY ${col}`);
      countsByTipo[tipo] = new Map(counts.map(c => [c.val, c.total]));
    }

    const enriched = rows.map(r => ({
      ...r,
      uso_count: countsByTipo[r.tipo_catalogo]?.get(r.valor) || 0
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/catalogos - Agrega o reactiva un elemento en el catálogo
router.post('/', async (req, res) => {
  try {
    const { tipo_catalogo, valor } = req.body;
    if (!TIPOS_VALIDOS.includes(tipo_catalogo) || !valor || !valor.trim()) {
      return res.status(400).json({ success: false, message: 'Tipo de catálogo válido y valor son obligatorios' });
    }

    const valorTrim = valor.trim();
    const existing = await queryOne(
      'SELECT id, activo FROM catalogos WHERE tipo_catalogo = ? AND LOWER(valor) = LOWER(?)',
      [tipo_catalogo, valorTrim]
    );

    if (existing) {
      if (existing.activo === 1) {
        return res.status(409).json({ success: false, message: `"${valorTrim}" ya existe en este catálogo` });
      }
      await execute('UPDATE catalogos SET activo = 1, valor = ? WHERE id = ?', [valorTrim, existing.id]);
      return res.status(200).json({
        success: true,
        message: 'Elemento reactivado en el catálogo',
        id: existing.id,
        valor: valorTrim
      });
    }

    const info = await execute(
      'INSERT INTO catalogos (tipo_catalogo, valor, activo) VALUES (?, ?, 1)',
      [tipo_catalogo, valorTrim]
    );

    res.status(201).json({
      success: true,
      message: 'Elemento añadido al catálogo',
      id: info.lastInsertRowid,
      valor: valorTrim
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/catalogos/:id - Editar nombre o estado activo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { valor, activo, actualizar_equipos } = req.body;

    const current = await queryOne('SELECT * FROM catalogos WHERE id = ?', [id]);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Elemento de catálogo no encontrado' });
    }

    const nuevoValor = valor !== undefined ? valor.trim() : current.valor;
    if (!nuevoValor) {
      return res.status(400).json({ success: false, message: 'El valor no puede quedar vacío' });
    }

    if (nuevoValor.toLowerCase() !== current.valor.toLowerCase()) {
      const dup = await queryOne(
        'SELECT id FROM catalogos WHERE tipo_catalogo = ? AND LOWER(valor) = LOWER(?) AND id != ?',
        [current.tipo_catalogo, nuevoValor, id]
      );
      if (dup) {
        return res.status(409).json({ success: false, message: `Ya existe "${nuevoValor}" en este catálogo` });
      }
    }

    const nuevoActivo = activo !== undefined ? (activo ? 1 : 0) : current.activo;

    await runTransaction(async (tx) => {
      await tx.execute('UPDATE catalogos SET valor = ?, activo = ? WHERE id = ?', [nuevoValor, nuevoActivo, id]);

      if (actualizar_equipos && nuevoValor !== current.valor) {
        const col = EQUIPO_COL_BY_TIPO[current.tipo_catalogo];
        if (col) {
          await tx.execute(`UPDATE equipos SET ${col} = ? WHERE ${col} = ?`, [nuevoValor, current.valor]);
        }
      }
    });

    res.json({ success: true, message: 'Catálogo actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/catalogos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const info = await execute('DELETE FROM catalogos WHERE id = ?', [id]);
    if (info.rowsAffected === 0) {
      return res.status(404).json({ success: false, message: 'Elemento no encontrado' });
    }
    res.json({ success: true, message: 'Elemento eliminado del catálogo' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

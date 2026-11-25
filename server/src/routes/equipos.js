import { Router } from 'express';
import { queryAll, queryOne, execute, runTransaction } from '../db.js';

const router = Router();

const normalizeText = (str) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// GET /api/equipos - Listado con filtros dinámicos por todos los parámetros y búsqueda tolerante a tildes
router.get('/', async (req, res) => {
  try {
    const {
      search,
      cliente,
      cedula,
      tipo_equipo,
      marca,
      modelo,
      accesorios,
      dano,
      estado,
      fecha_desde,
      fecha_hasta
    } = req.query;

    let query = `
      SELECT 
        e.id, 
        e.cliente_id, 
        c.nombre AS cliente_nombre, 
        c.cedula AS cliente_cedula, 
        c.telefono AS cliente_telefono, 
        c.direccion AS cliente_direccion,
        e.tipo_equipo, 
        e.marca, 
        e.modelo, 
        e.numero_serie, 
        e.accesorios, 
        e.dano_reportado, 
        e.diagnostico_tecnico, 
        e.estado, 
        e.costo_estimado, 
        e.costo_final, 
        e.fecha_ingreso, 
        e.fecha_entrega, 
        e.notas,
        e.tecnico_encargado,
        e.condicion_ingreso,
        e.estado_main,
        e.estado_fuente,
        e.estado_tcon,
        e.estado_pantalla,
        e.trabajo_realizado,
        e.repuestos_utilizados,
        e.created_at, 
        e.updated_at
      FROM equipos e
      JOIN clientes c ON e.cliente_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (estado && estado !== 'Todos los Estados' && estado !== 'Todos') {
      query += ' AND e.estado = ?';
      params.push(estado.trim());
    }

    if (fecha_desde && fecha_desde.trim()) {
      query += ' AND e.fecha_ingreso >= ?';
      params.push(fecha_desde.trim());
    }

    if (fecha_hasta && fecha_hasta.trim()) {
      query += ' AND e.fecha_ingreso <= ?';
      params.push(fecha_hasta.trim());
    }

    query += ' ORDER BY e.fecha_ingreso DESC, e.id DESC';

    let equipos = await queryAll(query, params);

    if (cliente && cliente.trim()) {
      const term = normalizeText(cliente);
      equipos = equipos.filter((e) => normalizeText(e.cliente_nombre).includes(term));
    }

    if (cedula && cedula.trim()) {
      const term = normalizeText(cedula);
      equipos = equipos.filter((e) => normalizeText(e.cliente_cedula).includes(term));
    }

    if (tipo_equipo && tipo_equipo !== 'Todos los Tipos' && tipo_equipo !== 'Todos') {
      const term = normalizeText(tipo_equipo);
      equipos = equipos.filter((e) => normalizeText(e.tipo_equipo) === term);
    }

    if (marca && marca !== 'Todas las Marcas' && marca !== 'Todas') {
      const term = normalizeText(marca);
      equipos = equipos.filter((e) => normalizeText(e.marca) === term);
    }

    if (modelo && modelo.trim()) {
      const term = normalizeText(modelo);
      equipos = equipos.filter((e) => normalizeText(e.modelo).includes(term));
    }

    if (accesorios && accesorios !== 'Todos los Accesorios' && accesorios !== 'Todos') {
      const term = normalizeText(accesorios);
      equipos = equipos.filter((e) => normalizeText(e.accesorios).includes(term));
    }

    if (dano && dano !== 'Todos los Daños' && dano !== 'Todos') {
      const term = normalizeText(dano);
      equipos = equipos.filter((e) => normalizeText(e.dano_reportado).includes(term));
    }

    if (search && search.trim()) {
      const tokens = normalizeText(search).split(/\s+/).filter(Boolean);
      equipos = equipos.filter((e) => {
        const searchable = normalizeText([
          `#${e.id}`,
          e.cliente_nombre,
          e.cliente_cedula,
          e.cliente_telefono,
          e.tipo_equipo,
          e.marca,
          e.modelo,
          e.numero_serie,
          e.dano_reportado,
          e.accesorios
        ].join(' '));
        return tokens.every((tok) => searchable.includes(tok));
      });
    }

    res.json({ success: true, count: equipos.length, data: equipos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/equipos/:id - Detalle completo de un equipo
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const equipo = await queryOne(`
      SELECT 
        e.*, 
        c.nombre AS cliente_nombre, 
        c.cedula AS cliente_cedula, 
        c.telefono AS cliente_telefono, 
        c.direccion AS cliente_direccion
      FROM equipos e
      JOIN clientes c ON e.cliente_id = c.id
      WHERE e.id = ?
    `, [id]);

    if (!equipo) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    const historial = await queryAll(
      'SELECT * FROM historial_estados WHERE equipo_id = ? ORDER BY fecha DESC',
      [id]
    );

    res.json({ success: true, data: { ...equipo, historial } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/equipos - Registrar nuevo equipo con diagnóstico técnico completo
router.post('/', async (req, res) => {
  try {
    const {
      cliente_nombre,
      cliente_cedula,
      cliente_telefono,
      cliente_direccion,
      tipo_equipo,
      marca,
      modelo,
      numero_serie,
      accesorios,
      dano_reportado,
      diagnostico_tecnico,
      estado,
      costo_estimado,
      fecha_ingreso,
      notas,
      tecnico_encargado,
      condicion_ingreso,
      estado_main,
      estado_fuente,
      estado_tcon,
      estado_pantalla,
      trabajo_realizado,
      repuestos_utilizados,
      guardar_en_catalogo
    } = req.body;

    if (!cliente_nombre || !cliente_cedula || !tipo_equipo || !marca || !dano_reportado) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, cédula, tipo de equipo, marca y daño reportado son campos obligatorios'
      });
    }

    const newId = await runTransaction(async (tx) => {
      let cliente = await tx.queryOne('SELECT id FROM clientes WHERE cedula = ?', [cliente_cedula.trim()]);
      let clienteId;

      if (cliente) {
        clienteId = cliente.id;
        await tx.execute(
          'UPDATE clientes SET nombre = ?, telefono = COALESCE(?, telefono), direccion = COALESCE(?, direccion) WHERE id = ?',
          [cliente_nombre.trim(), cliente_telefono?.trim() || null, cliente_direccion?.trim() || null, clienteId]
        );
      } else {
        const infoCliente = await tx.execute(
          'INSERT INTO clientes (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)',
          [cliente_nombre.trim(), cliente_cedula.trim(), cliente_telefono?.trim() || '', cliente_direccion?.trim() || '']
        );
        clienteId = infoCliente.lastInsertRowid;
      }

      const estadoFinal = estado || 'Pendiente';
      const fechaIngresoFinal = fecha_ingreso || new Date().toISOString().split('T')[0];

      const infoEquipo = await tx.execute(`
        INSERT INTO equipos (
          cliente_id, tipo_equipo, marca, modelo, numero_serie,
          accesorios, dano_reportado, diagnostico_tecnico, estado,
          costo_estimado, fecha_ingreso, notas, tecnico_encargado,
          condicion_ingreso, estado_main, estado_fuente, estado_tcon,
          estado_pantalla, trabajo_realizado, repuestos_utilizados
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clienteId,
        tipo_equipo.trim(),
        marca.trim(),
        modelo?.trim() || '',
        numero_serie?.trim() || '',
        accesorios?.trim() || 'No aplica',
        dano_reportado.trim(),
        diagnostico_tecnico?.trim() || '',
        estadoFinal,
        Number(costo_estimado) || 0,
        fechaIngresoFinal,
        notas?.trim() || '',
        tecnico_encargado?.trim() || 'Arnulfo Barrios',
        condicion_ingreso?.trim() || 'Normal',
        estado_main?.trim() || 'Por revisar',
        estado_fuente?.trim() || 'Por revisar',
        estado_tcon?.trim() || 'No aplica',
        estado_pantalla?.trim() || 'Por revisar',
        trabajo_realizado?.trim() || '',
        repuestos_utilizados?.trim() || ''
      ]);

      const equipoId = infoEquipo.lastInsertRowid;

      await tx.execute(
        "INSERT INTO historial_estados (equipo_id, estado_anterior, estado_nuevo, nota) VALUES (?, NULL, ?, 'Ingreso inicial al taller')",
        [equipoId, estadoFinal]
      );

      if (guardar_en_catalogo) {
        if (guardar_en_catalogo.marca) {
          await tx.execute('INSERT OR IGNORE INTO catalogos (tipo_catalogo, valor) VALUES (?, ?)', ['marca', marca.trim()]);
        }
        if (guardar_en_catalogo.tipo_equipo) {
          await tx.execute('INSERT OR IGNORE INTO catalogos (tipo_catalogo, valor) VALUES (?, ?)', ['tipo_equipo', tipo_equipo.trim()]);
        }
        if (guardar_en_catalogo.dano) {
          await tx.execute('INSERT OR IGNORE INTO catalogos (tipo_catalogo, valor) VALUES (?, ?)', ['dano', dano_reportado.trim()]);
        }
      }

      return equipoId;
    });

    res.status(201).json({
      success: true,
      message: 'Equipo registrado exitosamente en el sistema',
      equipoId: newId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/equipos/:id - Actualizar equipo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const current = await queryOne('SELECT * FROM equipos WHERE id = ?', [id]);

    if (!current) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    const {
      cliente_nombre,
      cliente_telefono,
      cliente_direccion,
      tipo_equipo,
      marca,
      modelo,
      numero_serie,
      accesorios,
      dano_reportado,
      diagnostico_tecnico,
      estado,
      costo_estimado,
      costo_final,
      fecha_ingreso,
      fecha_entrega,
      notas,
      tecnico_encargado,
      condicion_ingreso,
      estado_main,
      estado_fuente,
      estado_tcon,
      estado_pantalla,
      trabajo_realizado,
      repuestos_utilizados,
      nota_cambio_estado
    } = req.body;

    await runTransaction(async (tx) => {
      if (cliente_nombre || cliente_telefono || cliente_direccion) {
        await tx.execute(`
          UPDATE clientes 
          SET 
            nombre = COALESCE(?, nombre),
            telefono = COALESCE(?, telefono),
            direccion = COALESCE(?, direccion)
          WHERE id = ?
        `, [
          cliente_nombre?.trim() || null,
          cliente_telefono?.trim() || null,
          cliente_direccion?.trim() || null,
          current.cliente_id
        ]);
      }

      let entregaDate = fecha_entrega;
      if (estado === 'Entregado' && !entregaDate && current.estado !== 'Entregado') {
        entregaDate = new Date().toISOString().split('T')[0];
      }

      await tx.execute(`
        UPDATE equipos SET
          tipo_equipo = COALESCE(?, tipo_equipo),
          marca = COALESCE(?, marca),
          modelo = COALESCE(?, modelo),
          numero_serie = COALESCE(?, numero_serie),
          accesorios = COALESCE(?, accesorios),
          dano_reportado = COALESCE(?, dano_reportado),
          diagnostico_tecnico = COALESCE(?, diagnostico_tecnico),
          estado = COALESCE(?, estado),
          costo_estimado = COALESCE(?, costo_estimado),
          costo_final = COALESCE(?, costo_final),
          fecha_ingreso = COALESCE(?, fecha_ingreso),
          fecha_entrega = COALESCE(?, fecha_entrega),
          notas = COALESCE(?, notas),
          tecnico_encargado = COALESCE(?, tecnico_encargado),
          condicion_ingreso = COALESCE(?, condicion_ingreso),
          estado_main = COALESCE(?, estado_main),
          estado_fuente = COALESCE(?, estado_fuente),
          estado_tcon = COALESCE(?, estado_tcon),
          estado_pantalla = COALESCE(?, estado_pantalla),
          trabajo_realizado = COALESCE(?, trabajo_realizado),
          repuestos_utilizados = COALESCE(?, repuestos_utilizados),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        tipo_equipo?.trim() || null,
        marca?.trim() || null,
        modelo?.trim() || null,
        numero_serie?.trim() || null,
        accesorios?.trim() || null,
        dano_reportado?.trim() || null,
        diagnostico_tecnico?.trim() || null,
        estado || null,
        costo_estimado !== undefined && costo_estimado !== '' ? Number(costo_estimado) : null,
        costo_final !== undefined && costo_final !== '' ? Number(costo_final) : null,
        fecha_ingreso || null,
        entregaDate || null,
        notas?.trim() || null,
        tecnico_encargado?.trim() || null,
        condicion_ingreso?.trim() || null,
        estado_main?.trim() || null,
        estado_fuente?.trim() || null,
        estado_tcon?.trim() || null,
        estado_pantalla?.trim() || null,
        trabajo_realizado?.trim() || null,
        repuestos_utilizados?.trim() || null,
        id
      ]);

      if (estado && estado !== current.estado) {
        await tx.execute(
          'INSERT INTO historial_estados (equipo_id, estado_anterior, estado_nuevo, nota) VALUES (?, ?, ?, ?)',
          [id, current.estado, estado, nota_cambio_estado?.trim() || `Estado cambiado de ${current.estado} a ${estado}`]
        );
      }
    });

    res.json({ success: true, message: 'Equipo actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/equipos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const info = await execute('DELETE FROM equipos WHERE id = ?', [id]);

    if (info.rowsAffected === 0) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    res.json({ success: true, message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

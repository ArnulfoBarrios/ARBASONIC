import { Router } from 'express';
import fs from 'fs';
import db, { queryAll, queryOne, isRemoteTurso, localDbPath } from '../db.js';

const router = Router();

const escapeCsvCell = (val) => {
  const s = val === null || val === undefined ? '' : String(val);
  if (s.includes(';') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const buildCsv = (headers, rows) => {
  const lines = [
    headers.map(escapeCsvCell).join(';'),
    ...rows.map((row) => row.map(escapeCsvCell).join(';'))
  ];
  return '\uFEFF' + lines.join('\r\n');
};

// GET /api/reportes
router.get('/', async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    const whereClauses = ['1=1'];
    const params = [];

    if (fecha_desde && fecha_desde.trim()) {
      whereClauses.push('fecha_ingreso >= ?');
      params.push(fecha_desde.trim());
    }
    if (fecha_hasta && fecha_hasta.trim()) {
      whereClauses.push('fecha_ingreso <= ?');
      params.push(fecha_hasta.trim());
    }
    const whereSql = whereClauses.join(' AND ');

    const ordenesStats = (await queryOne(`
      SELECT
        COUNT(*) AS total,
        COUNT(DISTINCT cliente_id) AS clientesUnicos,
        SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN estado = 'En Reparación' THEN 1 ELSE 0 END) AS enReparacion,
        SUM(CASE WHEN estado = 'Reparado' THEN 1 ELSE 0 END) AS reparados,
        SUM(CASE WHEN estado = 'Entregado' THEN 1 ELSE 0 END) AS entregados,
        COALESCE(SUM(costo_final), 0) AS ingresosCobrados,
        COALESCE(SUM(costo_estimado), 0) AS totalEstimadoPeriodo,
        COALESCE(SUM(CASE WHEN estado IN ('Pendiente', 'En Reparación', 'Reparado') THEN costo_estimado ELSE 0 END), 0) AS ingresosEstimadosActivos
      FROM equipos
      WHERE ${whereSql}
    `, params)) || {};

    const porMarca = await queryAll(`
      SELECT marca AS nombre, COUNT(*) AS cantidad
      FROM equipos WHERE ${whereSql}
      GROUP BY marca ORDER BY cantidad DESC, nombre ASC LIMIT 8
    `, params);

    const porTipo = await queryAll(`
      SELECT tipo_equipo AS nombre, COUNT(*) AS cantidad
      FROM equipos WHERE ${whereSql}
      GROUP BY tipo_equipo ORDER BY cantidad DESC, nombre ASC LIMIT 8
    `, params);

    const porDano = await queryAll(`
      SELECT dano_reportado AS nombre, COUNT(*) AS cantidad
      FROM equipos WHERE ${whereSql}
      GROUP BY dano_reportado ORDER BY cantidad DESC, nombre ASC LIMIT 8
    `, params);

    const porEstado = await queryAll(`
      SELECT estado AS nombre, COUNT(*) AS cantidad
      FROM equipos WHERE ${whereSql}
      GROUP BY estado ORDER BY cantidad DESC
    `, params);

    const repStats = (await queryOne(`
      SELECT
        COUNT(*) AS totalRepuestos,
        COALESCE(SUM(stock_actual), 0) AS unidadesStock,
        SUM(CASE WHEN stock_actual <= stock_minimo THEN 1 ELSE 0 END) AS repuestosBajoStock,
        COALESCE(SUM(stock_actual * precio_costo), 0) AS valorCostoRepuestos,
        COALESCE(SUM(stock_actual * precio_venta), 0) AS valorVentaRepuestos
      FROM repuestos
    `)) || {};

    const stockBajo = await queryAll(`
      SELECT id, codigo, descripcion, categoria, stock_actual, stock_minimo, ubicacion
      FROM repuestos WHERE stock_actual <= stock_minimo ORDER BY stock_actual ASC LIMIT 10
    `);

    const herStats = (await queryOne(`
      SELECT
        COUNT(*) AS totalHerramientas,
        SUM(CASE WHEN estado = 'Disponible' THEN 1 ELSE 0 END) AS disponibles,
        SUM(CASE WHEN estado = 'En uso' THEN 1 ELSE 0 END) AS enUso,
        COALESCE(SUM(costo_adquisicion), 0) AS valorHerramientas
      FROM herramientas
    `)) || {};

    const prestamosAbiertos = await queryAll(`
      SELECT
        p.id, p.codigo_prestamo, p.persona_recibe, p.departamento,
        p.fecha_prestamo, p.devolucion_prevista, p.estado_prestamo, p.dias_retraso,
        h.codigo AS herramienta_codigo, h.nombre AS herramienta_nombre
      FROM prestamos_herramientas p
      JOIN herramientas h ON p.herramienta_id = h.id
      WHERE p.estado_prestamo != 'Devuelto'
      ORDER BY p.devolucion_prevista ASC
    `);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const prestamosVencidos = prestamosAbiertos
      .map((p) => {
        const prevista = new Date(`${p.devolucion_prevista}T00:00:00`);
        const dias = !Number.isNaN(prevista.getTime()) && hoy > prevista
          ? Math.ceil((hoy - prevista) / (1000 * 60 * 60 * 24))
          : p.dias_retraso || 0;
        return { ...p, dias_retraso: dias, vencido: dias > 0 || p.estado_prestamo === 'Retrasado' };
      })
      .filter((p) => p.vencido);

    res.json({
      success: true,
      data: {
        resumenOrdenes: {
          total: ordenesStats.total || 0,
          clientesUnicos: ordenesStats.clientesUnicos || 0,
          pendientes: ordenesStats.pendientes || 0,
          enReparacion: ordenesStats.enReparacion || 0,
          reparados: ordenesStats.reparados || 0,
          entregados: ordenesStats.entregados || 0,
          ingresosCobrados: ordenesStats.ingresosCobrados || 0,
          totalEstimadoPeriodo: ordenesStats.totalEstimadoPeriodo || 0,
          ingresosEstimadosActivos: ordenesStats.ingresosEstimadosActivos || 0
        },
        inventario: {
          totalRepuestos: repStats.totalRepuestos || 0,
          unidadesStock: repStats.unidadesStock || 0,
          repuestosBajoStock: repStats.repuestosBajoStock || 0,
          valorCostoRepuestos: repStats.valorCostoRepuestos || 0,
          valorVentaRepuestos: repStats.valorVentaRepuestos || 0,
          gananciaPotencialRepuestos: (repStats.valorVentaRepuestos || 0) - (repStats.valorCostoRepuestos || 0),
          totalHerramientas: herStats.totalHerramientas || 0,
          herramientasDisponibles: herStats.disponibles || 0,
          herramientasEnUso: herStats.enUso || 0,
          valorHerramientas: herStats.valorHerramientas || 0,
          prestamosRetrasados: prestamosVencidos.length
        },
        rankings: { porMarca, porTipo, porDano, porEstado },
        alertas: { stockBajo, prestamosVencidos }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reportes/export/:tipo
router.get('/export/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    const { fecha_desde, fecha_hasta } = req.query;
    const today = new Date().toISOString().split('T')[0];

    let csv = '';
    const filename = `arbasonic_${tipo}_${today}.csv`;

    if (tipo === 'ordenes') {
      const where = ['1=1'];
      const params = [];
      if (fecha_desde && fecha_desde.trim()) {
        where.push('e.fecha_ingreso >= ?');
        params.push(fecha_desde.trim());
      }
      if (fecha_hasta && fecha_hasta.trim()) {
        where.push('e.fecha_ingreso <= ?');
        params.push(fecha_hasta.trim());
      }

      const rows = await queryAll(`
        SELECT
          e.id, e.fecha_ingreso, c.nombre, c.cedula, c.telefono, c.direccion,
          e.tipo_equipo, e.marca, e.modelo, e.numero_serie, e.accesorios,
          e.dano_reportado, e.condicion_ingreso, e.tecnico_encargado,
          e.estado_main, e.estado_fuente, e.estado_tcon, e.estado_pantalla,
          e.diagnostico_tecnico, e.trabajo_realizado, e.repuestos_utilizados,
          e.estado, e.costo_estimado, e.costo_final, e.fecha_entrega
        FROM equipos e
        JOIN clientes c ON e.cliente_id = c.id
        WHERE ${where.join(' AND ')}
        ORDER BY e.fecha_ingreso DESC, e.id DESC
      `, params);

      const headers = [
        'N° Orden', 'Fecha Ingreso', 'Cliente', 'Cédula', 'Teléfono', 'Dirección',
        'Tipo de Aparato', 'Marca', 'Modelo', 'N° Serie', 'Accesorios',
        'Daño Reportado', 'Condición Ingreso', 'Técnico',
        'Tarjeta Main', 'Tarjeta Fuente', 'Tarjeta T-Con', 'Pantalla',
        'Diagnóstico', 'Trabajo Realizado', 'Repuestos Usados',
        'Estado', 'Costo Estimado', 'Costo Final', 'Fecha Entrega'
      ];
      csv = buildCsv(headers, rows.map((r) => [
        r.id, r.fecha_ingreso, r.nombre, r.cedula, r.telefono, r.direccion,
        r.tipo_equipo, r.marca, r.modelo, r.numero_serie, r.accesorios,
        r.dano_reportado, r.condicion_ingreso, r.tecnico_encargado,
        r.estado_main, r.estado_fuente, r.estado_tcon, r.estado_pantalla,
        r.diagnostico_tecnico, r.trabajo_realizado, r.repuestos_utilizados,
        r.estado, r.costo_estimado, r.costo_final, r.fecha_entrega || ''
      ]));
    } else if (tipo === 'repuestos') {
      const rows = await queryAll('SELECT * FROM repuestos ORDER BY codigo ASC');
      const headers = [
        'Código', 'Categoría', 'Descripción', 'Marca', 'Referencia',
        'Stock Actual', 'Stock Mínimo', 'Precio Costo', 'Precio Venta',
        'Valor Total Costo', 'Ubicación', 'Proveedor', 'Observaciones'
      ];
      csv = buildCsv(headers, rows.map((r) => [
        r.codigo, r.categoria, r.descripcion, r.marca, r.referencia,
        r.stock_actual, r.stock_minimo, r.precio_costo, r.precio_venta,
        (r.stock_actual || 0) * (r.precio_costo || 0), r.ubicacion, r.proveedor, r.observaciones
      ]));
    } else if (tipo === 'herramientas') {
      const rows = await queryAll('SELECT * FROM herramientas ORDER BY codigo ASC');
      const headers = ['Código', 'Nombre', 'Categoría', 'Ubicación', 'Responsable', 'Estado', 'Costo Adquisición'];
      csv = buildCsv(headers, rows.map((h) => [
        h.codigo, h.nombre, h.categoria, h.ubicacion, h.responsable, h.estado, h.costo_adquisicion
      ]));
    } else if (tipo === 'prestamos') {
      const rows = await queryAll(`
        SELECT p.*, h.codigo AS herramienta_codigo, h.nombre AS herramienta_nombre
        FROM prestamos_herramientas p
        JOIN herramientas h ON p.herramienta_id = h.id
        ORDER BY p.fecha_prestamo DESC
      `);
      const headers = [
        'ID Préstamo', 'Código Herramienta', 'Herramienta', 'Persona Recibe',
        'Departamento', 'Fecha Préstamo', 'Devolución Prevista', 'Devolución Real',
        'Estado', 'Días Retraso', 'Observaciones'
      ];
      csv = buildCsv(headers, rows.map((p) => [
        p.codigo_prestamo, p.herramienta_codigo, p.herramienta_nombre, p.persona_recibe,
        p.departamento, p.fecha_prestamo, p.devolucion_prevista, p.devolucion_real || '',
        p.estado_prestamo, p.dias_retraso, p.observaciones
      ]));
    } else {
      return res.status(400).json({ success: false, message: 'Tipo de exportación no válido' });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reportes/backup - Descarga copia .db en local o respaldo completo .json en nube/Turso
router.get('/backup', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    if (!isRemoteTurso && !process.env.VERCEL && fs.existsSync(localDbPath)) {
      try {
        await db.execute('PRAGMA wal_checkpoint(TRUNCATE)');
      } catch {
        // ignore if not WAL
      }
      return res.download(localDbPath, `arbasonic_backup_${today}.db`);
    }

    // En Turso / Vercel: respaldo completo en JSON con todas las tablas
    const dump = {
      exported_at: new Date().toISOString(),
      source: isRemoteTurso ? 'turso' : 'serverless',
      clientes: await queryAll('SELECT * FROM clientes ORDER BY id ASC'),
      equipos: await queryAll('SELECT * FROM equipos ORDER BY id ASC'),
      catalogos: await queryAll('SELECT * FROM catalogos ORDER BY id ASC'),
      historial_estados: await queryAll('SELECT * FROM historial_estados ORDER BY id ASC'),
      repuestos: await queryAll('SELECT * FROM repuestos ORDER BY id ASC'),
      movimientos_repuestos: await queryAll('SELECT * FROM movimientos_repuestos ORDER BY id ASC'),
      herramientas: await queryAll('SELECT * FROM herramientas ORDER BY id ASC'),
      prestamos_herramientas: await queryAll('SELECT * FROM prestamos_herramientas ORDER BY id ASC')
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="arbasonic_backup_${today}.json"`);
    res.send(JSON.stringify(dump, null, 2));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

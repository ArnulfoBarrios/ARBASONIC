import { Router } from 'express';
import { queryAll, queryOne } from '../db.js';

const router = Router();

// GET /api/estadisticas - Métricas globales para el Dashboard
router.get('/', async (req, res) => {
  try {
    const totalEquipos = (await queryOne('SELECT COUNT(*) as count FROM equipos'))?.count || 0;
    const enReparacion = (await queryOne("SELECT COUNT(*) as count FROM equipos WHERE estado = 'En Reparación'"))?.count || 0;
    const reparados = (await queryOne("SELECT COUNT(*) as count FROM equipos WHERE estado = 'Reparado'"))?.count || 0;
    const entregados = (await queryOne("SELECT COUNT(*) as count FROM equipos WHERE estado = 'Entregado'"))?.count || 0;
    const pendientes = (await queryOne("SELECT COUNT(*) as count FROM equipos WHERE estado = 'Pendiente'"))?.count || 0;

    const totalRepuestos = (await queryOne('SELECT COUNT(*) as count FROM repuestos'))?.count || 0;
    const repuestosBajoStock = (await queryOne('SELECT COUNT(*) as count FROM repuestos WHERE stock_actual <= stock_minimo'))?.count || 0;
    const valorInventario = (await queryOne('SELECT COALESCE(SUM(stock_actual * precio_costo), 0) as total FROM repuestos'))?.total || 0;

    const totalHerramientas = (await queryOne('SELECT COUNT(*) as count FROM herramientas'))?.count || 0;
    const herramientasEnUso = (await queryOne("SELECT COUNT(*) as count FROM herramientas WHERE estado = 'En uso'"))?.count || 0;
    const prestamosRetrasados = (await queryOne("SELECT COUNT(*) as count FROM prestamos_herramientas WHERE estado_prestamo = 'Retrasado'"))?.count || 0;

    const totalParaPorcentaje = totalEquipos > 0 ? totalEquipos : 1;
    const distribucion = [
      { nombre: 'Entregados', cantidad: entregados, porcentaje: Math.round((entregados / totalParaPorcentaje) * 100), color: '#00d2ff' },
      { nombre: 'En Reparación', cantidad: enReparacion, porcentaje: Math.round((enReparacion / totalParaPorcentaje) * 100), color: '#38bdf8' },
      { nombre: 'Pendientes', cantidad: pendientes, porcentaje: Math.round((pendientes / totalParaPorcentaje) * 100), color: '#818cf8' },
      { nombre: 'Reparados', cantidad: reparados, porcentaje: Math.round((reparados / totalParaPorcentaje) * 100), color: '#10b981' }
    ];

    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const meses = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const mesClave = `${year}-${monthStr}`;
      const mesLabel = mesesNombres[d.getMonth()];

      const count = (await queryOne(
        "SELECT COUNT(*) as c FROM equipos WHERE strftime('%Y-%m', fecha_ingreso) = ?",
        [mesClave]
      ))?.c || 0;

      meses.push({ mes: mesLabel, clave: mesClave, total: count });
    }

    res.json({
      success: true,
      data: {
        kpis: { totalRecibidos: totalEquipos, enReparacion, reparados, entregados, pendientes },
        taller: { totalRepuestos, repuestosBajoStock, valorInventario, totalHerramientas, herramientasEnUso, prestamosRetrasados },
        distribucion,
        evolucionMensual: meses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/estadisticas/notificaciones - Alertas reales y accionables del taller
router.get('/notificaciones', async (req, res) => {
  try {
    const notificaciones = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const prestamosAbiertos = await queryAll(`
      SELECT p.id, p.codigo_prestamo, p.persona_recibe, p.devolucion_prevista, p.estado_prestamo, p.dias_retraso,
             h.codigo AS herramienta_codigo, h.nombre AS herramienta_nombre
      FROM prestamos_herramientas p
      JOIN herramientas h ON p.herramienta_id = h.id
      WHERE p.estado_prestamo != 'Devuelto'
      ORDER BY p.devolucion_prevista ASC
    `);

    for (const p of prestamosAbiertos) {
      const prevista = new Date(`${p.devolucion_prevista}T00:00:00`);
      const dias = !Number.isNaN(prevista.getTime()) && hoy > prevista
        ? Math.ceil((hoy - prevista) / (1000 * 60 * 60 * 24))
        : (p.dias_retraso || 0);
      if (dias > 0 || p.estado_prestamo === 'Retrasado') {
        notificaciones.push({
          id: `prestamo-${p.id}`,
          tipo: 'prestamo_retrasado',
          severidad: 'alta',
          titulo: `Préstamo retrasado (${dias} días)`,
          mensaje: `${p.herramienta_nombre} (${p.herramienta_codigo}) — ${p.persona_recibe}`,
          fecha: p.devolucion_prevista,
          targetTab: 'herramientas'
        });
      }
    }

    const stockBajo = await queryAll(`
      SELECT id, codigo, descripcion, stock_actual, stock_minimo
      FROM repuestos
      WHERE stock_actual <= stock_minimo
      ORDER BY stock_actual ASC
      LIMIT 10
    `);

    for (const r of stockBajo) {
      notificaciones.push({
        id: `repuesto-${r.id}`,
        tipo: 'stock_bajo',
        severidad: 'media',
        titulo: 'Repuesto con stock bajo',
        mensaje: `${r.codigo} · ${r.descripcion} (${r.stock_actual}/${r.stock_minimo})`,
        fecha: '',
        targetTab: 'repuestos'
      });
    }

    const reparados = await queryAll(`
      SELECT e.id, e.tipo_equipo, e.marca, e.fecha_ingreso, c.nombre AS cliente_nombre
      FROM equipos e
      JOIN clientes c ON e.cliente_id = c.id
      WHERE e.estado = 'Reparado'
      ORDER BY e.updated_at DESC
      LIMIT 8
    `);

    for (const e of reparados) {
      notificaciones.push({
        id: `reparado-${e.id}`,
        tipo: 'listo_entrega',
        severidad: 'exito',
        titulo: 'Listo para entregar al cliente',
        mensaje: `Orden #${String(e.id).padStart(5, '0')} · ${e.cliente_nombre} (${e.tipo_equipo} ${e.marca})`,
        fecha: e.fecha_ingreso,
        targetTab: 'inventario',
        equipoId: e.id,
        action: 'view'
      });
    }

    const pendientes = await queryAll(`
      SELECT e.id, e.tipo_equipo, e.marca, e.fecha_ingreso, c.nombre AS cliente_nombre
      FROM equipos e
      JOIN clientes c ON e.cliente_id = c.id
      WHERE e.estado = 'Pendiente'
      ORDER BY e.fecha_ingreso ASC
      LIMIT 8
    `);

    for (const e of pendientes) {
      notificaciones.push({
        id: `pendiente-${e.id}`,
        tipo: 'equipo_pendiente',
        severidad: 'info',
        titulo: 'Pendiente de diagnóstico',
        mensaje: `Orden #${String(e.id).padStart(5, '0')} · ${e.cliente_nombre} (${e.tipo_equipo} ${e.marca})`,
        fecha: e.fecha_ingreso,
        targetTab: 'inventario',
        equipoId: e.id,
        action: 'edit'
      });
    }

    res.json({ success: true, count: notificaciones.length, data: notificaciones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

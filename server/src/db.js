import 'dotenv/config';
import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const isRemoteTurso = Boolean(process.env.TURSO_DATABASE_URL);
export const localDbPath = path.join(__dirname, '../data/arbasonic.db');

const getDbConfig = () => {
  if (process.env.TURSO_DATABASE_URL) {
    return {
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    };
  }

  // En Vercel sin TURSO_DATABASE_URL configurado todavía, usar /tmp para evitar crash EROFS
  if (process.env.VERCEL) {
    console.warn('⚠️ TURSO_DATABASE_URL no configurado en Vercel. Usando /tmp temporal hasta configurar Turso.');
    return { url: 'file:/tmp/arbasonic.db' };
  }

  // Entorno local en Windows/Mac/Linux: archivo persistente server/data/arbasonic.db
  const dataDir = path.dirname(localDbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return { url: pathToFileURL(localDbPath).href };
};

export const db = createClient(getDbConfig());

// Convierte filas de libSQL a objetos JS planos seguros para JSON (sin BigInt)
const toPlainRow = (row) => {
  if (!row) return null;
  const obj = {};
  for (const [k, v] of Object.entries(row)) {
    obj[k] = typeof v === 'bigint' ? Number(v) : v;
  }
  return obj;
};

export const queryAll = async (sql, args = []) => {
  const res = await db.execute({ sql, args });
  return res.rows.map(toPlainRow);
};

export const queryOne = async (sql, args = []) => {
  const res = await db.execute({ sql, args });
  return res.rows.length > 0 ? toPlainRow(res.rows[0]) : null;
};

export const execute = async (sql, args = []) => {
  const res = await db.execute({ sql, args });
  return {
    rowsAffected: Number(res.rowsAffected || 0),
    lastInsertRowid: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : null
  };
};

export const runTransaction = async (fn) => {
  const tx = await db.transaction('write');
  try {
    const txApi = {
      queryAll: async (sql, args = []) => (await tx.execute({ sql, args })).rows.map(toPlainRow),
      queryOne: async (sql, args = []) => {
        const r = await tx.execute({ sql, args });
        return r.rows.length > 0 ? toPlainRow(r.rows[0]) : null;
      },
      execute: async (sql, args = []) => {
        const r = await tx.execute({ sql, args });
        return {
          rowsAffected: Number(r.rowsAffected || 0),
          lastInsertRowid: r.lastInsertRowid !== undefined ? Number(r.lastInsertRowid) : null
        };
      }
    };
    const result = await fn(txApi);
    await tx.commit();
    return result;
  } catch (err) {
    try {
      await tx.rollback();
    } catch {
      // ignore rollback errors
    }
    throw err;
  } finally {
    tx.close();
  }
};

// Inicialización idempotente (ejecutada 1 vez por arranque o cold start)
let initPromise = null;

async function initializeDatabase() {
  if (!isRemoteTurso) {
    try {
      await db.execute('PRAGMA journal_mode = WAL');
    } catch {
      // ignore if unsupported
    }
  }
  try {
    await db.execute('PRAGMA foreign_keys = ON');
  } catch {
    // ignore
  }

  // 1. Crear tablas base
  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cedula TEXT NOT NULL UNIQUE,
      telefono TEXT,
      direccion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS equipos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      tipo_equipo TEXT NOT NULL,
      marca TEXT NOT NULL,
      modelo TEXT,
      numero_serie TEXT,
      accesorios TEXT,
      dano_reportado TEXT NOT NULL,
      diagnostico_tecnico TEXT,
      estado TEXT NOT NULL DEFAULT 'Pendiente',
      costo_estimado REAL DEFAULT 0,
      costo_final REAL DEFAULT 0,
      fecha_ingreso DATE NOT NULL DEFAULT (CURRENT_DATE),
      fecha_entrega DATE,
      notas TEXT,
      tecnico_encargado TEXT DEFAULT 'Arnulfo Barrios',
      condicion_ingreso TEXT DEFAULT 'Normal',
      estado_main TEXT DEFAULT 'Por revisar',
      estado_fuente TEXT DEFAULT 'Por revisar',
      estado_tcon TEXT DEFAULT 'No aplica',
      estado_pantalla TEXT DEFAULT 'Por revisar',
      trabajo_realizado TEXT,
      repuestos_utilizados TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS catalogos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_catalogo TEXT NOT NULL,
      valor TEXT NOT NULL,
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(tipo_catalogo, valor)
    )`,
    `CREATE TABLE IF NOT EXISTS historial_estados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipo_id INTEGER NOT NULL,
      estado_anterior TEXT,
      estado_nuevo TEXT NOT NULL,
      nota TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS repuestos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      categoria TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      marca TEXT,
      referencia TEXT,
      estado_main TEXT,
      estado_tcon TEXT,
      estado_fuente TEXT,
      stock_minimo INTEGER DEFAULT 1,
      stock_actual INTEGER DEFAULT 0,
      precio_costo REAL DEFAULT 0,
      precio_venta REAL DEFAULT 0,
      ubicacion TEXT,
      proveedor TEXT,
      observaciones TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS movimientos_repuestos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repuesto_id INTEGER NOT NULL,
      tipo_movimiento TEXT NOT NULL,
      cantidad INTEGER NOT NULL,
      costo_unitario REAL DEFAULT 0,
      orden_id INTEGER,
      responsable TEXT,
      fecha DATE NOT NULL DEFAULT (CURRENT_DATE),
      observaciones TEXT,
      FOREIGN KEY (repuesto_id) REFERENCES repuestos(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS herramientas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      ubicacion TEXT,
      responsable TEXT,
      estado TEXT NOT NULL DEFAULT 'Disponible',
      costo_adquisicion REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS prestamos_herramientas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_prestamo TEXT NOT NULL,
      herramienta_id INTEGER NOT NULL,
      persona_recibe TEXT NOT NULL,
      departamento TEXT,
      fecha_prestamo DATE NOT NULL,
      devolucion_prevista DATE NOT NULL,
      devolucion_real DATE,
      estado_prestamo TEXT NOT NULL DEFAULT 'En curso',
      dias_retraso INTEGER DEFAULT 0,
      observaciones TEXT,
      FOREIGN KEY (herramienta_id) REFERENCES herramientas(id) ON DELETE CASCADE
    )`
  ];

  await db.batch(schemaStatements, 'write');

  // 2. Migración segura de columnas en equipos si ya existía tabla antigua
  const cols = (await queryAll('PRAGMA table_info(equipos)')).map((c) => c.name);
  const migrations = [
    ['tecnico_encargado', "TEXT DEFAULT 'Arnulfo Barrios'"],
    ['condicion_ingreso', "TEXT DEFAULT 'Normal'"],
    ['estado_main', "TEXT DEFAULT 'Por revisar'"],
    ['estado_fuente', "TEXT DEFAULT 'Por revisar'"],
    ['estado_tcon', "TEXT DEFAULT 'No aplica'"],
    ['estado_pantalla', "TEXT DEFAULT 'Por revisar'"],
    ['trabajo_realizado', 'TEXT'],
    ['repuestos_utilizados', 'TEXT']
  ];
  for (const [colName, colType] of migrations) {
    if (!cols.includes(colName)) {
      await db.execute(`ALTER TABLE equipos ADD COLUMN ${colName} ${colType}`);
    }
  }

  // 3. Sembrar catálogos base si está vacío
  const catCount = (await queryOne('SELECT COUNT(*) AS c FROM catalogos'))?.c || 0;
  if (catCount === 0) {
    const marcas = [
      'Sony', 'Samsung', 'LG', 'Panasonic', 'Philips', 'TCL', 'Hisense',
      'Vizio', 'Sharp', 'Toshiba', 'Haier', 'JVC', 'Hitachi', 'RCA',
      'Sanyo', 'Pioneer', 'Zenith', 'Westinghouse', 'Sansui', 'Olimpo', 'Kalley'
    ];
    const tiposEquipos = [
      'Televisor', 'Equipo de sonido', 'Amplificador de sonido', 'Dividi',
      'Grabadora', 'Caja amplificada', 'Computador', 'Portátil', 'Celular', 'Tablet'
    ];
    const accesorios = [
      'Cable de poder', 'Control remoto', 'Baterias', 'Cable de entrada de señal',
      'Bafles', 'No aplica', 'Cable de poder y control remoto',
      'Cable de poder, control remoto y bateria', 'Bafles y control remoto',
      'Bafles, control remoto y baterias'
    ];
    const danos = [
      'No enciende', 'No presenta video', 'No tiene audio',
      'Presenta rayas verticales', 'Presenta rayas horizontales',
      'Presenta rayas verticales y horizontales', 'El video es intermitente',
      'Tiene led de standy encendido pero no prende.',
      'Enciende pero no da video', 'Enciende pero no tiene sonido',
      'No sintoniza canales', 'No coge Internet', 'Rayas en la pantalla',
      'Pantalla partida', 'Aparato rayado / golpeado', 'Sin bafles',
      'Sin control remoto', 'Sin cable de poder'
    ];

    const batchStmts = [];
    for (const v of marcas) batchStmts.push({ sql: 'INSERT OR IGNORE INTO catalogos (tipo_catalogo, valor) VALUES (?, ?)', args: ['marca', v] });
    for (const v of tiposEquipos) batchStmts.push({ sql: 'INSERT OR IGNORE INTO catalogos (tipo_catalogo, valor) VALUES (?, ?)', args: ['tipo_equipo', v] });
    for (const v of accesorios) batchStmts.push({ sql: 'INSERT OR IGNORE INTO catalogos (tipo_catalogo, valor) VALUES (?, ?)', args: ['accesorio', v] });
    for (const v of danos) batchStmts.push({ sql: 'INSERT OR IGNORE INTO catalogos (tipo_catalogo, valor) VALUES (?, ?)', args: ['dano', v] });
    await db.batch(batchStmts, 'write');
  }

  // 4. Sembrar datos iniciales de muestra solo si no hay órdenes
  const eqCount = (await queryOne('SELECT COUNT(*) AS c FROM equipos'))?.c || 0;
  if (eqCount === 0) {
    await runTransaction(async (tx) => {
      const cArnulfo = (await tx.execute(
        'INSERT INTO clientes (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)',
        ['Arnulfo Barrios Bustamante', '11908332', '3023123654', 'Calle 60A #15E 33']
      )).lastInsertRowid;
      const c1 = (await tx.execute(
        'INSERT INTO clientes (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)',
        ['Juan Pérez', '1032456789', '3012345678', 'Calle 45 #20-10, Soledad']
      )).lastInsertRowid;
      const c2 = (await tx.execute(
        'INSERT INTO clientes (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)',
        ['María López', '1023678901', '3109876543', 'Cra 15 #10-33, Barranquilla']
      )).lastInsertRowid;
      const c3 = (await tx.execute(
        'INSERT INTO clientes (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)',
        ['Carlos Ramírez', '1012345678', '3205556677', 'Calle 60A #15E-12, Soledad']
      )).lastInsertRowid;
      const c4 = (await tx.execute(
        'INSERT INTO clientes (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)',
        ['Ana Torres', '1098765432', '3001234455', 'Av. Murillo #24-18, Soledad']
      )).lastInsertRowid;
      const c5 = (await tx.execute(
        'INSERT INTO clientes (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)',
        ['Diego Sánchez', '1076543210', '3149998877', 'Calle 18 #8-50, Soledad']
      )).lastInsertRowid;

      const eqSql = `INSERT INTO equipos (
        cliente_id, tipo_equipo, marca, modelo, numero_serie,
        accesorios, dano_reportado, diagnostico_tecnico, estado,
        costo_estimado, fecha_ingreso, fecha_entrega, tecnico_encargado,
        condicion_ingreso, estado_main, estado_fuente, estado_tcon, estado_pantalla
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      await tx.execute(eqSql, [cArnulfo, 'Equipo de sonido', 'LG', 'as', '23565', 'Cable de poder y control remoto', 'No enciende', 'Revisión etapa de potencia y diodos de fuente primaria', 'En Reparación', 150000, '2026-10-20', null, 'Arnulfo Barrios', 'Buen estado general', 'En revisión', 'Dañada / En corto', 'No aplica', 'No aplica']);
      await tx.execute(eqSql, [c1, 'Televisor', 'Samsung', 'UN55AU7000', 'SN-SAM-8891', 'Cable de poder y control remoto', 'No enciende', 'Revisión fuente de poder y diodos rectificadores', 'En Reparación', 180000, '2025-11-15', null, 'Arnulfo Barrios', 'Normal', 'Por revisar', 'Por revisar', 'No aplica', 'Por revisar']);
      await tx.execute(eqSql, [c2, 'Equipo de sonido', 'Sony', 'MHC-V73D', 'SN-SNY-3312', 'Cable de poder', 'No tiene audio', 'Salida de audio quemada, sustitución de integrados STK', 'Entregado', 220000, '2025-11-14', '2025-11-18', 'Arnulfo Barrios', 'Normal', 'Buena', 'Buena', 'No aplica', 'No aplica']);
      await tx.execute(eqSql, [c3, 'Caja amplificada', 'Kalley', 'K-SPK15', 'SN-KLL-9011', 'Cable de poder', 'Tiene led de standy encendido pero no prende.', 'Revisión regulador de voltaje en tarjeta principal', 'Pendiente', 120000, '2025-11-13', null, 'Arnulfo Barrios', 'Normal', 'Por revisar', 'Por revisar', 'No aplica', 'No aplica']);
      await tx.execute(eqSql, [c4, 'Televisor', 'LG', '43UP7500', 'SN-LG-4422', 'Control remoto', 'No presenta video', 'Tiras de LED dañadas, requiere cambio de backlights completo', 'En Reparación', 210000, '2025-11-12', null, 'Arnulfo Barrios', 'Normal', 'Buena', 'Buena', 'Buena', 'Tiras LED dañadas']);
      await tx.execute(eqSql, [c5, 'Amplificador de sonido', 'Pioneer', 'VSX-534', 'SN-PIO-1190', 'Cable de entrada de señal', 'No tiene audio', 'Limpieza de potenciómetros y reemplazo de relés de protección', 'Reparado', 150000, '2025-11-11', null, 'Arnulfo Barrios', 'Normal', 'Reparada', 'Buena', 'No aplica', 'No aplica']);
    });
  }

  // 5. Sembrar repuestos iniciales si está vacío
  const repCount = (await queryOne('SELECT COUNT(*) AS c FROM repuestos'))?.c || 0;
  if (repCount === 0) {
    const repSql = `INSERT INTO repuestos (
      codigo, categoria, descripcion, marca, referencia,
      estado_main, estado_fuente, estado_tcon,
      stock_minimo, stock_actual, precio_costo, precio_venta, ubicacion, proveedor
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const repSeed = [
      ['REP-001', 'Tarjetas electrónicas', 'Tarjeta Main Board Smart TV 43"', 'LG', 'EAX68253604', 'Disponible', 'No aplica', 'No aplica', 2, 4, 120000, 220000, 'Estante A1 - Cajón 3', 'Electrónica del Norte'],
      ['REP-002', 'Fuentes de poder', 'Fuente de alimentación TV 55"', 'Samsung', 'L55S6_FHS', 'No aplica', 'Disponible', 'No aplica', 1, 3, 140000, 250000, 'Estante A2 - Cajón 1', 'Importadora Barranquilla'],
      ['REP-003', 'Tarjetas electrónicas', 'Tarjeta T-Con 4K UHD', 'Sony', '18Y_43FU11APTA4V0.0', 'No aplica', 'No aplica', 'Disponible', 2, 5, 65000, 130000, 'Estante B1 - Gaveta 2', 'Electrónica del Norte'],
      ['REP-004', 'Pantallas', 'Tiras de LED Backlight 32" (Kit x 3)', 'Samsung', 'D2GE-320SC0-R3', 'No aplica', 'No aplica', 'No aplica', 3, 8, 35000, 85000, 'Estante C1', 'LED Pro Colombia'],
      ['REP-005', 'Integrados', 'Circuito Integrado Amplificador STK412-150', 'Sanyo', 'STK412-150C', 'No aplica', 'No aplica', 'No aplica', 2, 6, 45000, 95000, 'Caja Componentes #4', 'Audio Repuestos Cali'],
      ['REP-006', 'Condensadores', 'Condensador Electrolítico 450V 100uF', 'Nichicon', '105°C Low ESR', 'No aplica', 'No aplica', 'No aplica', 10, 25, 4500, 12000, 'Organizador D - Gaveta 12', 'Ferretería Electrónica']
    ];
    await db.batch(repSeed.map((args) => ({ sql: repSql, args })), 'write');
  }

  // 6. Sembrar herramientas y préstamos si está vacío
  const herCount = (await queryOne('SELECT COUNT(*) AS c FROM herramientas'))?.c || 0;
  if (herCount === 0) {
    await runTransaction(async (tx) => {
      const hSql = `INSERT INTO herramientas (codigo, nombre, categoria, ubicacion, responsable, estado, costo_adquisicion) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const hSeed = [
        ['HT-0001', 'Taladro Percutor Industrial', 'Herramienta eléctrica', 'Mesa de Trabajo 1', 'Marta Gómez', 'Disponible', 320000],
        ['HT-0002', 'Multímetro Digital True RMS', 'Herramienta de medición', 'Banco Diagnóstico A', 'Carlos Ruiz', 'En uso', 280000],
        ['HT-0004', 'Estación de Soldadura y Calor SMD', 'Herramienta eléctrica', 'Banco Soldadura B', 'Javier Sánchez', 'En uso', 450000],
        ['HT-0005', 'Prensa Hidráulica de Mesa', 'Herramienta hidráulica', 'Área Mecánica', 'Elena Torres', 'Disponible', 650000],
        ['HT-0006', 'Osciloscopio Digital 100MHz 2Ch', 'Herramienta de medición', 'Laboratorio', 'Daniel Moreno', 'En uso', 1250000],
        ['HT-0007', 'Pistola de Calor Regulable', 'Herramienta eléctrica', 'Mesa de Trabajo 2', 'Carlos Ruiz', 'Disponible', 180000],
        ['HT-0010', 'Nivel Láser Autonivelante', 'Herramienta de medición', 'Maletín Herramientas', 'Javier Sánchez', 'En uso', 240000]
      ];
      const ids = [];
      for (const h of hSeed) {
        ids.push((await tx.execute(hSql, h)).lastInsertRowid);
      }

      const pSql = `INSERT INTO prestamos_herramientas (
        codigo_prestamo, herramienta_id, persona_recibe, departamento,
        fecha_prestamo, devolucion_prevista, devolucion_real, estado_prestamo, dias_retraso, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const pSeed = [
        ['PR-001', ids[1], 'Lucía Fernández', 'Taller', '2026-07-06', '2026-07-20', '2026-07-18', 'Devuelto', 0, 'Trabajo de torcería en nave 2'],
        ['PR-002', ids[4], 'Daniel Moreno', 'Mantenimiento', '2026-07-12', '2026-07-26', null, 'Retrasado', 111, 'Diagnóstico eléctrico de línea'],
        ['PR-003', ids[2], 'Javier Sánchez', 'Producción', '2026-07-15', '2026-07-29', null, 'Retrasado', 108, 'Montaje de bancada neumática'],
        ['PR-004', ids[5], 'Carlos Ruiz', 'Taller', '2026-06-22', '2026-07-06', '2026-07-09', 'Devuelto', 3, 'Desmontaje de ruedas flota'],
        ['PR-005', ids[6], 'Javier Sánchez', 'Instalaciones', '2026-07-20', '2026-08-03', null, 'Retrasado', 103, 'Nivelación en obra cliente']
      ];
      for (const p of pSeed) {
        await tx.execute(pSql, p);
      }
    });
  }
}

export const ensureDb = () => {
  if (!initPromise) {
    initPromise = initializeDatabase().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
};

export default db;

# Guía Paso a Paso: Subir ARBASONIC a GitHub y Desplegar en Vercel (con Turso Gratis)

Tu proyecto ya quedó completamente configurado con:
* **Base de datos dual (`@libsql/client`)**: en tu PC usa `server/data/arbasonic.db` y en Vercel se conecta automáticamente a **Turso (SQLite en la nube gratis)** para que ningún dato se pierda jamás.
* **Entrada Serverless (`api/index.js`)** y **`vercel.json`** listos para Vercel.
* **`.gitignore`** configurado para no subir `node_modules/`, `.env` ni archivos `.db` locales.

---

## Paso 1: Crear la Base de Datos Gratis en Turso (2 minutos)

1. Entra a **[https://app.turso.tech](https://app.turso.tech)** e inicia sesión con tu cuenta de **GitHub** (plan Starter es **$0 / Gratis**).
2. Haz clic en **"Create Database"**:
   * **Nombre**: `arbasonic`
   * **Ubicación / Group**: elige la más cercana (ej. `Miami` o `Virginia`).
   * Pulsa **Create Database**.
3. Dentro de la base de datos recién creada, busca el botón **"Connect"** o **"Generate Token"**:
   * Copia la **Database URL** (empieza por `libsql://arbasonic-....turso.io`).
   * Genera un **Auth Token** (con expiración *Never* / Sin vencimiento y permiso *Read & Write*) y cópialo.

> [!TIP]
> No necesitas crear tablas manualmente en Turso: la primera vez que abras tu web en Vercel, el sistema creará automáticamente todas las tablas y cargará las 60 opciones oficiales de tus catálogos.

---

## Paso 2: Subir el Proyecto a GitHub

1. Entra a **[https://github.com/new](https://github.com/new)** y crea un repositorio nuevo (puede ser **Private** o **Public**):
   * **Repository name**: `arbasonic-inventario` (o el nombre que prefieras).
   * **No marques** *"Add a README"* ni *".gitignore"* (el proyecto ya los trae listos).
   * Haz clic en **Create repository**.
2. Abre una terminal (PowerShell) dentro de `d:\Proyecto Arnulfo (Padre)` y ejecuta estos 2 comandos usando la URL de tu repositorio nuevo:

```powershell
git remote add origin https://github.com/TU_USUARIO/arbasonic-inventario.git
git push -u origin main
```

---

## Paso 3: Desplegar en Vercel

1. Entra a **[https://vercel.com/new](https://vercel.com/new)** e inicia sesión con **GitHub**.
2. Selecciona el repositorio `arbasonic-inventario` y haz clic en **Import**.
3. Vercel detectará automáticamente la configuración de `vercel.json` (no necesitas cambiar *Build Command* ni *Output Directory*).
4. Antes de desplegar, abre la sección **Environment Variables** y agrega exactamente estas **2 variables** con los datos que copiaste de Turso:

| Name | Value |
| :--- | :--- |
| `TURSO_DATABASE_URL` | `libsql://tu-base-de-datos.turso.io` |
| `TURSO_AUTH_TOKEN` | `eyJhbGciOi...` *(tu token de Turso)* |

5. Haz clic en **Deploy** y espera ~1 minuto.

---

## Paso 4: Verificar que la Base de Datos en la Nube quedó Conectada

Una vez termine el despliegue, entra a:
`https://tu-proyecto.vercel.app/api/health`

Deberías ver:
```json
{
  "status": "online",
  "app": "ARBASONIC Reparación Electrónica API",
  "storage": "turso-cloud"
}
```

¡Si dice `"storage": "turso-cloud"`, tu aplicación ya está en línea 24/7 con base de datos permanente, gratis y accesible desde cualquier computador o celular!

---

## Respaldos desde Vercel
En la pestaña **Reportes ➔ Respaldo BD**, cuando la app corre en Vercel descargará automáticamente un respaldo completo en formato `.json` con todos tus clientes, órdenes, repuestos, herramientas y catálogos.

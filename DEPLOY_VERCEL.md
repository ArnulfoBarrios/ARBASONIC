# Guía Paso a Paso: Subir ARBASONIC a GitHub y Desplegar en Vercel (Multi-Services + Turso)

Tu proyecto está configurado para desplegar en **Vercel con arquitectura Multi-Services** (`vercel.json`):
* **`client`** (`root: "client"`, `framework: "vite"`): interfaz React + Vite servida en `/(.*)`.
* **`server`** (`root: "server"`, `framework: "express"`, `entrypoint: "src/app.js"`): API REST servida en `/api/(.*)`.
* **Base de datos dual (`@libsql/client`)**: en local usa `server/data/arbasonic.db` y en Vercel se conecta automáticamente a **Turso (SQLite en la nube gratis)**.

---

## Paso 1: Crear la Base de Datos Gratis en Turso (2 minutos)

1. Entra a **[https://app.turso.tech](https://app.turso.tech)** e inicia sesión con **GitHub** (plan Starter gratis).
2. Haz clic en **"Create Database"** (nombre: `arbasonic`, región cercana como `Miami` o `Virginia`).
3. Copia la **Database URL** (`libsql://...`) y genera un **Auth Token** (*Never expire*, *Read & Write*).

---

## Paso 2: Subir el Proyecto a GitHub

1. Crea un repositorio vacío en **[https://github.com/new](https://github.com/new)** (sin README ni `.gitignore`).
2. Desde PowerShell en `d:\Proyecto Arnulfo (Padre)`:

```powershell
git remote add origin https://github.com/TU_USUARIO/arbasonic-inventario.git
git push -u origin main
```

---

## Paso 3: Desplegar en Vercel

1. Entra a **[https://vercel.com/new](https://vercel.com/new)** e importa tu repositorio de GitHub.
2. En **Environment Variables** agrega estas **2 variables** (compartidas por los servicios del proyecto):

| Name | Value |
| :--- | :--- |
| `TURSO_DATABASE_URL` | `libsql://tu-base-de-datos.turso.io` |
| `TURSO_AUTH_TOKEN` | `eyJhbGciOi...` |

3. Pulsa **Deploy**.

---

## Pruebas locales con Vercel CLI (opcional)

Puedes probar ambos servicios juntos localmente con las mismas reglas de enrutamiento de producción:

```powershell
npx vercel dev
```

Y verificar el estado de la API en `/api/health` (`"storage": "turso-cloud"` cuando las variables de Turso estén configuradas).

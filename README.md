# ARBASONIC - Reparación Electrónica
## Sistema Web de Inventario y Control de Equipos

Aplicación web diseñada a la medida para la gestión de ingresos, diagnósticos, seguimiento, inventario y comprobantes de servicio técnico del taller **ARBASONIC Reparación Electrónica**.

---

## 🚀 ¿Cómo Iniciar el Sistema?

### Opción 1: Acceso Directo de 1 Clic (Recomendada para el taller)
Solo haz **doble clic** sobre el archivo:
👉 **`Iniciar ARBASONIC.bat`**

Esto hará todo automáticamente:
1. Iniciará el servidor interno y la base de datos SQLite.
2. Abrirá automáticamente la aplicación en tu navegador web en `http://localhost:5000`.

---

## 📱 ¿Cómo Conectarte desde el Celular o Tablet en el Taller?
Si tu computador y tu celular están conectados a la **misma red Wi-Fi**:
1. Averigua la dirección IP local de tu computador (ejecuta `ipconfig` en Windows, por ejemplo: `192.168.1.50`).
2. Desde el navegador de tu celular abre: `http://192.168.1.50:5000`.
3. Podrás consultar el inventario, buscar por cédula y registrar equipos directamente desde tu móvil.

---

## 💾 Copias de Seguridad (Backups)
Toda la información del taller (clientes, historial, marcas, reparaciones, fechas y costos) se guarda permanentemente en un solo archivo:

📂 **`server/data/arbasonic.db`**

Para hacer un respaldo de seguridad:
* Copia ese archivo `arbasonic.db` a una memoria USB, a Google Drive o a OneDrive.
* Si algún día cambias de computador, solo pegas ese archivo en la misma carpeta y tendrás todo tu historial intacto.

---

## 🛠️ Funcionalidades Principales

1. **Dashboard y Métricas en Tiempo Real**:
   - 4 Tarjetas de control: *Equipos Recibidos*, *En Reparación*, *Reparados*, *Entregados*.
   - Gráfico circular de distribución de estados.
   - Gráfico de tendencia mensual de ingresos al taller.

2. **Formulario Inteligente de Registro**:
   - Búsqueda y autocompletado automático por número de cédula.
   - Listas oficiales del taller para **Marcas** (21 marcas), **Tipos de Aparato**, **Accesorios** y **Daños Frecuentes**.
   - Soporte dinámico para la opción **`+ Otro (especificar...)`** con casilla para agregarlo permanentemente al catálogo.

3. **Tabla de Inventario Dinámica con Filtros**:
   - Búsqueda en vivo (por nombre de cliente, cédula, modelo, serie o marca).
   - Filtros desplegables por *Marca*, *Estado* y *Rango de Fechas*.
   - Botón para restablecer filtros.

4. **Ficha Técnica & Comprobante Imprimible (Ticket)**:
   - Botón 👁️ para abrir la ficha detallada.
   - Botón para contactar directamente al cliente por **WhatsApp** con mensaje pre-cargado.
   - **Ticket de Entrega para el Cliente**: Imprimible o descargable en PDF con logo de ARBASONIC, dirección en Soledad, WhatsApp, detalle de accesorios y espacio para firmas.

---

## 🏢 Datos Comerciales de ARBASONIC
* **Taller**: ARBASONIC Reparación Electrónica
* **Dirección**: Calle 60A #15E-33 Bella Murillo • Soledad, Atlántico
* **WhatsApp / Teléfono**: 300 703 9741
* **Especialidad**: Diagnóstico electrónico, Reparación de TV LED/LCD, Reparación de parlantes y audio, Mantenimiento preventivo.

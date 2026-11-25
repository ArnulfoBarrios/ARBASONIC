@echo off
title ARBASONIC - Reparacion Electronica
color 0b
cls
echo ======================================================================
echo              ARBASONIC - REPARACION ELECTRONICA
echo              Iniciando Sistema de Gestion e Inventario...
echo ======================================================================
echo.
echo  [+] Iniciando el servidor local...
echo  [+] Abriendo la aplicacion web en tu navegador...
start http://localhost:5000
echo.
echo  [+] Sistema disponible en: http://localhost:5000
echo  [+] Base de datos SQLite activa en: server\data\arbasonic.db
echo.
echo  IMPORTANTE: No cierres esta ventana mientras uses el programa.
echo  Para apagar el sistema, simplemente cierra esta ventana.
echo ======================================================================
echo.
cd /d "%~dp0server"
node src/index.js
pause

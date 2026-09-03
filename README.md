# Emma

Ranking informativo de alfajores conectado a Google Sheets.

## Actualizar imágenes

La pestaña `ranking` debe conservar esta estructura:

- Columna A: Nombre
- Columna B: Imagen insertada en la celda o sobre la fila
- Columna C: Categoría
- Columna D: Puntaje final
- Columna E: URL pública de la imagen

El script para Google Apps Script está en `google-apps-script/generar-urls-imagenes.js`.

1. En Google Sheets, abrir **Extensiones > Apps Script**.
2. Pegar el contenido del script y guardar.
3. Recargar la hoja.
4. Usar **Imágenes > Generar URLs públicas**.
5. Aceptar los permisos la primera vez.

El script procesa las imágenes de la pestaña `ranking`, las copia a una carpeta pública de Google Drive y escribe el enlace directo en la columna E. Si E ya tiene una URL, deja esa fila sin cambios. Al ejecutarlo nuevamente, procesa las imágenes nuevas.

## Desarrollo

```bash
npm install
npm run dev
npm run build
```

# Mundial de Alfajores

Ranking informativo de alfajores conectado a Google Sheets.

## Actualizar imágenes

La pestaña `ranking` debe conservar esta estructura:

- Columna A: Nombre
- Columna B: opcional; las imágenes se cargan desde `public/imagenes`
- Columna C: Categoría
- Columna D: Puntaje final

Copiá cada imagen en `public/imagenes`. El nombre debe coincidir exactamente con el nombre del alfajor en la pestaña `podios`. Se admiten `.jpg`, `.jpeg`, `.png` y `.webp`; por ejemplo, `Luccianos dark 70.jpg`. La página busca esas imágenes localmente, sin depender de URLs públicas, Google Drive o la columna B.

## Fotos de los jurados

Copiá la foto grupal en `public/jurados/jurado.png`. También podés usar `jurado.jpg`.

Las fotos individuales del carrusel deben estar en `public/jurados` con estos nombres:

- `tomas.png`
- `isabella.png`
- `jazmin.png`
- `gaston.png`
- `emma.png`

El carrusel muestra únicamente el nombre, la foto y el testimonio de cada jurado.

## Desarrollo

```bash
npm install
npm run dev
npm run build
```

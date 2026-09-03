function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Imágenes')
    .addItem('Generar URLs públicas', 'generarUrlsImagenes')
    .addToUi();
}

function generarUrlsImagenes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ranking');
  if (!sheet) throw new Error('No existe la pestaña ranking.');

  const folder = getOrCreateFolder_('alfajores-ranking-images');
  const images = sheet.getImages();
  let generated = 0;

  images.forEach(function (image) {
    const row = image.getAnchorCell().getRow();
    if (row < 2) return;

    const name = String(sheet.getRange(row, 1).getValue()).trim();
    const currentUrl = String(sheet.getRange(row, 5).getValue()).trim();
    if (!name || currentUrl) return;

    const blob = image.getBlob();
    const extension = getExtension_(blob.getContentType());
    const file = folder.createFile(blob.setName(`${sanitize_(name)}.${extension}`));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    sheet.getRange(row, 5).setValue(
      `https://drive.google.com/uc?export=view&id=${file.getId()}`
    );
    generated += 1;
  });

  SpreadsheetApp.getUi().alert(
    generated
      ? `Se generaron ${generated} URL(s) públicas en la columna E.`
      : 'No hay imágenes nuevas para procesar.'
  );
}

function getOrCreateFolder_(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

function getExtension_(contentType) {
  const extensions = {
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/jpeg': 'jpg'
  };
  return extensions[contentType] || 'jpg';
}

function sanitize_(value) {
  return value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

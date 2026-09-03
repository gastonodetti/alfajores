const FOLDER_ID = '1OTnZ8pqCa4k2sumygzr4Uij6y_5_ePc4';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Imágenes')
    .addItem('Buscar imágenes en Drive', 'generarUrlsImagenes')
    .addToUi();
}

function generarUrlsImagenes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ranking');
  if (!sheet) throw new Error('No existe la pestaña ranking.');

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const filesByName = indexImageFiles_(folder);
  const lastRow = sheet.getLastRow();
  const names = sheet.getRange(2, 1, Math.max(lastRow - 1, 0), 1).getValues();
  const urls = [];
  const missing = [];

  names.forEach(function (row) {
    const name = String(row[0]).trim();
    if (!name) {
      urls.push(['']);
      return;
    }

    const file = filesByName[name];
    if (!file) {
      urls.push(['']);
      missing.push(name);
      return;
    }

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    urls.push([`https://drive.google.com/thumbnail?id=${file.getId()}&sz=w1200`]);
  });

  if (urls.length) sheet.getRange(2, 2, urls.length, 1).setValues(urls);

  let message = `Se actualizaron ${urls.length - missing.length} URL(s) en la columna B.`;
  if (missing.length) message += `\nNo se encontraron ${missing.length}:\n${missing.slice(0, 10).join('\n')}`;
  SpreadsheetApp.getUi().alert(message);
}

function indexImageFiles_(folder) {
  const files = folder.getFiles();
  const filesByName = {};

  while (files.hasNext()) {
    const file = files.next();
    if (!file.getMimeType().startsWith('image/')) continue;

    const fileName = file.getName();
    const nameWithoutExtension = fileName.replace(/\.[^.]+$/, '');
    filesByName[fileName] = file;
    filesByName[nameWithoutExtension] = file;
  }

  return filesByName;
}

// js/utils.js

// Lee el archivo y fuerza decodificación UTF-8
async function fetchCSV(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${path}`);
  const buf = await res.arrayBuffer();
  const dec = new TextDecoder('utf-8');
  let text = dec.decode(buf);
  // sacá BOM si existe
  text = text.replace(/^\uFEFF/, '');
  return text;
}

// Parser CSV simple pero que maneja comillas y saltos de línea (RFC-lite)
function parseCSV(text) {
  const rows = [];
  let cur = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      // doble comilla dentro de comillas -> comilla literal
      if (inQuotes && text[i+1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cur.push(field);
      field = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // manejar CRLF
      if (ch === '\r' && text[i+1] === '\n') { /* saltar, se manejará en este bloque */ }
      cur.push(field);
      rows.push(cur);
      cur = [];
      field = '';
      if (ch === '\r' && text[i+1] === '\n') i++;
    } else {
      field += ch;
    }
  }

  // fila final si hay
  if (field !== '' || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }

  // eliminar fila vacía final (común si termina con salto de línea)
  if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
    rows.pop();
  }

  return rows;
}

// Convierte filas a objetos del tipo {hanzi, pinyin, esp}
function rowsToObjects(rows) {
  // si hay header, lo ignoramos; asumimos 3 columnas: hanzi,pinyin,esp
  const data = rows.slice(1).map(r => {
    return {
      hanzi: (r[0] || '').trim(),
      pinyin: (r[1] || '').trim(),
      esp: (r[2] || '').trim()
    };
  }).filter(o => o.hanzi || o.pinyin || o.esp);
  return data;
}
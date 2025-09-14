let searchData = [];

async function loadSearchData() {
  const level = document.getElementById("search-level").value;
  try {
    const raw = await fetchCSV(`data/HSK${level}.csv`);
    const rows = parseCSV(raw);
    console.log("Search rows:", rows.slice(0,4));
    searchData = rowsToObjects(rows);
    showResults("");
  } catch (err) {
    console.error(err);
    alert("Error cargando datos de búsqueda: " + err.message);
  }
}

function showResults(query) {
  const q = (query || '').toLowerCase();
  const tbody = document.getElementById("search-results");
  tbody.innerHTML = "";
  searchData
    .filter(w => !q || w.hanzi.toLowerCase().includes(q) || w.pinyin.toLowerCase().includes(q) || w.esp.toLowerCase().includes(q))
    .forEach(w => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${w.hanzi}</td><td>${w.pinyin}</td><td>${w.esp}</td>`;
      tbody.appendChild(tr);
    });
}

document.getElementById("search-level").addEventListener("change", loadSearchData);
document.getElementById("search-input").addEventListener("input", e => showResults(e.target.value));
window.addEventListener("load", loadSearchData);

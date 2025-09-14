let searchData = [];

async function loadSearchData() {
  const level = document.getElementById("search-level").value;
  const response = await fetch(`data/HSK${level}.csv`);
  const text = await response.text();
  searchData = text.trim().split("\n").slice(1).map(line => {
    const [hanzi, pinyin, esp] = line.split(",");
    return {hanzi, pinyin, esp};
  });
  showResults("");
}

function showResults(query) {
  const tbody = document.getElementById("search-results");
  tbody.innerHTML = "";
  searchData
    .filter(w => w.hanzi.includes(query) || w.pinyin.includes(query) || w.esp.includes(query))
    .forEach(w => {
      tbody.innerHTML += `<tr><td>${w.hanzi}</td><td>${w.pinyin}</td><td>${w.esp}</td></tr>`;
    });
}

document.getElementById("search-level").addEventListener("change", loadSearchData);
document.getElementById("search-input").addEventListener("input", e => showResults(e.target.value));

// cargar datos iniciales
window.addEventListener("load", loadSearchData);
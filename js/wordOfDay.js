async function showWordOfDay() {
  const level = document.getElementById("day-level").value;
  const response = await fetch(`data/HSK${level}.csv`);
  const text = await response.text();
  const words = text.trim().split("\n").slice(1).map(line => {
    const [hanzi, pinyin, esp] = line.split(",");
    return {hanzi, pinyin, esp};
  });

  const today = new Date().toISOString().split("T")[0];
  const key = `wordOfDay_HSK${level}_${today}`;

  let word = localStorage.getItem(key);
  if (!word) {
    const usedKey = `usedWords_HSK${level}`;
    let used = JSON.parse(localStorage.getItem(usedKey) || "[]");

    const remaining = words.filter(w => !used.some(u => u.hanzi === w.hanzi));
    if (remaining.length === 0) {
      used = []; // reiniciar ciclo
    }

    word = remaining[Math.floor(Math.random() * remaining.length)];
    used.push(word);
    localStorage.setItem(key, JSON.stringify(word));
    localStorage.setItem(usedKey, JSON.stringify(used));
  } else {
    word = JSON.parse(word);
  }

  document.getElementById("day-word").innerHTML = `
    <p><strong>${word.hanzi}</strong></p>
    <p>${word.pinyin}</p>
    <p>${word.esp}</p>
  `;
}
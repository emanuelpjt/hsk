async function showWordOfDay() {
  const level = document.getElementById("day-level").value;
  try {
    const raw = await fetchCSV(`data/HSK${level}.csv`);
    const rows = parseCSV(raw);
    const words = rowsToObjects(rows);

    if (!words.length) {
      document.getElementById("day-word").textContent = "No hay palabras en este nivel";
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const keyToday = `wordOfDay_HSK${level}_${today}`;
    let word = localStorage.getItem(keyToday);

    if (!word) {
      const usedKey = `usedWords_HSK${level}`;
      let used = JSON.parse(localStorage.getItem(usedKey) || "[]");
      // elegir remaining
      const remaining = words.filter(w => !used.includes(w.hanzi));
      if (remaining.length === 0) used = []; // reiniciar ciclo
      const pick = (remaining.length ? remaining[Math.floor(Math.random() * remaining.length)] : words[0]);
      used.push(pick.hanzi);
      localStorage.setItem(usedKey, JSON.stringify(used));
      localStorage.setItem(keyToday, JSON.stringify(pick));
      word = pick;
    } else {
      word = JSON.parse(word);
    }

    document.getElementById("day-word").innerHTML = `
      <p style="font-size:40px;"><strong>${word.hanzi}</strong></p>
      <p>${word.pinyin}</p>
      <p>${word.esp}</p>
    `;
  } catch (err) {
    console.error(err);
    alert("Error con Palabra del Día: " + err.message);
  }
}

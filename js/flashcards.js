let flashcards = [];
let currentIndex = 0;

async function loadFlashcards(mode) {
  const level = document.getElementById("flash-level").value;
  try {
    const raw = await fetchCSV(`data/HSK${level}.csv`); // o data/hsk${level}.csv según tu nombre
    const rows = parseCSV(raw);
    console.log("Primeras filas HSK"+level, rows.slice(0,5));
    flashcards = rowsToObjects(rows);

    if (mode === "random") {
      // shuffle
      for (let i = flashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
      }
    }

    currentIndex = 0;
    showFlashcard();
  } catch (err) {
    console.error(err);
    alert("Error cargando flashcards: " + err.message);
  }
}

function showFlashcard() {
  if (!flashcards.length) {
    document.getElementById("flashcard-container").textContent = "No hay datos";
    return;
  }
  const card = flashcards[currentIndex];
  document.getElementById("flashcard-container").innerHTML = `
    <p style="font-size:40px;"><strong>${card.hanzi}</strong></p>
    <p>${card.pinyin}</p>
    <p>${card.esp}</p>
    <div>
      <button onclick="prevFlash()">⏮</button>
      <button onclick="nextFlash()">⏭</button>
    </div>
  `;
}

function nextFlash() {
  currentIndex = (currentIndex + 1) % flashcards.length;
  showFlashcard();
}

function prevFlash() {
  currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
  showFlashcard();
}
function prevFlash() {
  currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
  showFlashcard();

}

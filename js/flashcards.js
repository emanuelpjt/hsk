let flashcards = [];
let currentIndex = 0;

async function loadFlashcards(mode) {
  const level = document.getElementById("flash-level").value;
  const response = await fetch(`data/HSK${level}.csv`);
  const text = await response.text();
  flashcards = text.trim().split("\n").slice(1).map(line => {
    const [hanzi, pinyin, esp] = line.split(",");
    return {hanzi, pinyin, esp};
  });
  
  if (mode === "random") {
    flashcards = flashcards.sort(() => Math.random() - 0.5);
  }
  
  currentIndex = 0;
  showFlashcard();
}

function showFlashcard() {
  if (flashcards.length === 0) return;
  const card = flashcards[currentIndex];
  document.getElementById("flashcard-container").innerHTML = `
    <p><strong>${card.hanzi}</strong></p>
    <p>${card.pinyin}</p>
    <p>${card.esp}</p>
    <button onclick="prevFlash()">⏮</button>
    <button onclick="nextFlash()">⏭</button>
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
// Variables globales
let vocabulary = {};
let currentLevel = 1;
let currentMode = 'sequential';
let currentIndex = 0;
let currentDeck = [];
let viewedWords = {};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  // Configurar eventos de navegación
  document.getElementById('btn-flashcards').addEventListener('click', () => showSection('flashcards'));
  document.getElementById('btn-search').addEventListener('click', () => showSection('search'));
  document.getElementById('btn-wordOfDay').addEventListener('click', () => showSection('wordOfDay'));
  
  // Configurar eventos de flashcards
  document.getElementById('btn-sequential').addEventListener('click', () => loadFlashcards('sequential'));
  document.getElementById('btn-random').addEventListener('click', () => loadFlashcards('random'));
  document.getElementById('btn-prev').addEventListener('click', prevCard);
  document.getElementById('btn-next').addEventListener('click', nextCard);
  document.getElementById('btn-flip').addEventListener('click', flipCard);
  
  // Configurar eventos de búsqueda
  document.getElementById('search-input').addEventListener('input', filterWords);
  document.getElementById('search-level').addEventListener('change', function() {
    const level = this.value;
    loadSearchResults(level);
  });
  
  // Configurar eventos de palabra del día
  document.getElementById('btn-show-all').addEventListener('click', showAllWordsOfDay);
  
  // Cargar niveles en selects
  ["flash-level", "search-level", "day-level"].forEach(selectId => {
    const sel = document.getElementById(selectId);
    for (let i = 1; i <= 6; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.textContent = "HSK " + i;
      sel.appendChild(opt);
    }
  });

  // Inicializar palabras vistas
  for (let i = 1; i <= 6; i++) {
    viewedWords[i] = JSON.parse(localStorage.getItem(`viewedWords-${i}`)) || [];
  }

  // Cargar datos iniciales para el nivel 1
  loadVocabularyData(1).then(() => {
    loadSearchResults(1);
  });
  
  // Cargar palabras del día automáticamente
  loadWordsOfDay();
});

// Cargar datos desde CSV
async function loadVocabularyData(level) {
  try {
    const response = await fetch(`data/hsk${level}.csv`);
    if (!response.ok) {
      throw new Error(`No se pudo cargar el archivo HSK ${level}`);
    }
    
    const csvText = await response.text();
    const words = parseCSV(csvText);
    
    // Almacenar en el objeto vocabulary
    vocabulary[level] = words;
    
    return words;
  } catch (error) {
    console.error('Error cargando vocabulario:', error);
    document.getElementById('search-results').innerHTML = 
      `<div class="error">Error cargando el vocabulario: ${error.message}</div>`;
    return [];
  }
}

// Parsear CSV a array de objetos
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const words = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 3) {
      words.push({
        hanzi: parts[0].trim(),
        pinyin: parts[1].trim(),
        translation: parts[2].trim()
      });
    }
  }
  
  return words;
}

// Cambiar secciones
function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`btn-${id}`).classList.add("active");

  // Si es la sección de búsqueda, cargar resultados
  if (id === 'search') {
    const level = document.getElementById('search-level').value;
    loadSearchResults(level);
  }
}

// Cargar flashcards
async function loadFlashcards(mode) {
  const level = document.getElementById('flash-level').value;
  currentLevel = parseInt(level);
  currentMode = mode;
  
  // Cargar datos si no están en memoria
  if (!vocabulary[currentLevel]) {
    document.getElementById('flashcard-container').innerHTML = '<div class="loading">Cargando vocabulario...</div>';
    await loadVocabularyData(currentLevel);
  }
  
  currentDeck = [...vocabulary[currentLevel]];
  
  if (mode === 'random') {
    shuffleArray(currentDeck);
  }
  
  currentIndex = 0;
  showCurrentCard();
}

// Mostrar la tarjeta actual
function showCurrentCard() {
  if (currentDeck.length === 0) {
    document.getElementById('flashcard-container').innerHTML = '<div class="error">No hay tarjetas para mostrar</div>';
    return;
  }
  
  const card = currentDeck[currentIndex];
  const container = document.getElementById('flashcard-container');
  
  container.innerHTML = `
    <div class="flashcard">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="hanzi">${card.hanzi}</div>
          <div class="pinyin">${card.pinyin}</div>
          <p>Haz clic para voltear</p>
        </div>
        <div class="flashcard-back">
          <div class="translation">${card.translation}</div>
        </div>
      </div>
    </div>
  `;
  
  // Añadir evento de clic para voltear
  container.querySelector('.flashcard-inner').addEventListener('click', function() {
    this.parentElement.classList.toggle('flipped');
  });
}

// Voltear tarjeta
function flipCard() {
  const flashcard = document.querySelector('.flashcard');
  if (flashcard) {
    flashcard.classList.toggle('flipped');
  }
}

// Tarjeta anterior
function prevCard() {
  if (currentDeck.length === 0) return;
  
  currentIndex = (currentIndex - 1 + currentDeck.length) % currentDeck.length;
  showCurrentCard();
}

// Siguiente tarjeta
function nextCard() {
  if (currentDeck.length === 0) return;
  
  currentIndex = (currentIndex + 1) % currentDeck.length;
  showCurrentCard();
}

// Mezclar array (para modo aleatorio)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Cargar resultados de búsqueda
async function loadSearchResults(level) {
  const resultsContainer = document.getElementById('search-results');
  resultsContainer.innerHTML = '<div class="loading">Cargando vocabulario...</div>';
  
  // Cargar datos si no están en memoria
  if (!vocabulary[level]) {
    await loadVocabularyData(level);
  }
  
  if (!vocabulary[level] || vocabulary[level].length === 0) {
    resultsContainer.innerHTML = '<div class="error">No se pudo cargar el vocabulario</div>';
    return;
  }
  
  // Crear tabla con resultados
  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Hanzi</th>
          <th>Pinyin</th>
          <th>Español</th>
          <th>HSK</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  vocabulary[level].forEach(word => {
    tableHTML += `
      <tr>
        <td>${word.hanzi}</td>
        <td>${word.pinyin}</td>
        <td>${word.translation}</td>
        <td>${level}</td>
      </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  resultsContainer.innerHTML = tableHTML;
}

// Filtrar palabras en el buscador
function filterWords() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const level = document.getElementById('search-level').value;
  const resultsContainer = document.getElementById('search-results');
  
  if (!vocabulary[level] || vocabulary[level].length === 0) {
    resultsContainer.innerHTML = '<div class="error">No hay vocabulario para filtrar</div>';
    return;
  }
  
  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Hanzi</th>
          <th>Pinyin</th>
          <th>Español</th>
          <th>HSK</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  let foundResults = false;
  
  vocabulary[level].forEach(word => {
    if (
      word.hanzi.toLowerCase().includes(searchTerm) ||
      word.pinyin.toLowerCase().includes(searchTerm) ||
      word.translation.toLowerCase().includes(searchTerm)
    ) {
      foundResults = true;
      tableHTML += `
        <tr>
          <td>${word.hanzi}</td>
          <td>${word.pinyin}</td>
          <td>${word.translation}</td>
          <td>${level}</td>
        </tr>
      `;
    }
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  if (!foundResults) {
    resultsContainer.innerHTML = '<div class="loading">No se encontraron resultados</div>';
  } else {
    resultsContainer.innerHTML = tableHTML;
  }
}

// Generar palabra del día para un nivel específico
function generateWordOfDay(level) {
  if (!vocabulary[level] || vocabulary[level].length === 0) {
    return null;
  }
  
  // Obtener la fecha actual en formato YYYY-MM-DD
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  // Usar la fecha y el nivel como semilla para el generador de números aleatorios
  const seed = xmur3(`${dateStr}-hsk${level}`);
  const random = mulberry32(seed());
  
  // Seleccionar una palabra aleatoria pero consistente para el día y nivel
  const wordIndex = Math.floor(random() * vocabulary[level].length);
  return vocabulary[level][wordIndex];
}

// Generador de semillas a partir de string (para random consistente)
function xmur3(str) {
  for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  } return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

// Generador de números aleatorios con semilla
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Cargar palabras del día para todos los niveles
async function loadWordsOfDay() {
  const wordsContainer = document.getElementById('day-words');
  wordsContainer.innerHTML = '<div class="loading">Cargando palabras del día...</div>';
  
  // Cargar datos para todos los niveles
  for (let level = 1; level <= 6; level++) {
    if (!vocabulary[level]) {
      await loadVocabularyData(level);
    }
  }
  
  // Generar HTML para las palabras del día
  let wordsHTML = '<div class="word-of-day-container">';
  
  for (let level = 1; level <= 6; level++) {
    if (vocabulary[level] && vocabulary[level].length > 0) {
      const wordOfDay = generateWordOfDay(level);
      if (wordOfDay) {
        wordsHTML += `
          <div class="word-of-day-card">
            <span class="word-level">HSK ${level}</span>
            <div class="word-hanzi">${wordOfDay.hanzi}</div>
            <div class="word-pinyin">${wordOfDay.pinyin}</div>
            <div class="word-translation">${wordOfDay.translation}</div>
          </div>
        `;
      }
    }
  }
  
  wordsHTML += '</div>';
  wordsContainer.innerHTML = wordsHTML;
}

// Mostrar todas las palabras de un nivel (para el botón "Mostrar Todas")
async function showAllWordsOfDay() {
  const level = document.getElementById('day-level').value;
  const wordsContainer = document.getElementById('day-words');
  
  // Cargar datos si no están en memoria
  if (!vocabulary[level]) {
    wordsContainer.innerHTML = '<div class="loading">Cargando vocabulario...</div>';
    await loadVocabularyData(level);
  }
  
  if (!vocabulary[level] || vocabulary[level].length === 0) {
    wordsContainer.innerHTML = '<div class="error">No se pudo cargar el vocabulario</div>';
    return;
  }
  
  // Generar HTML para todas las palabras del nivel
  let wordsHTML = '<div class="word-of-day-container">';
  
  vocabulary[level].forEach(word => {
    wordsHTML += `
      <div class="word-of-day-card">
        <div class="word-hanzi">${word.hanzi}</div>
        <div class="word-pinyin">${word.pinyin}</div>
        <div class="word-translation">${word.translation}</div>
      </div>
    `;
  });
  
  wordsHTML += '</div>';
  wordsContainer.innerHTML = wordsHTML;
}

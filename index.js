const diceFaces = [
  ["RIFOBX", "IFEHEY", "DENOWS", "UTOKND"],
  ["HMSRAO", "LUPETS", "ACITOA", "YLGKUE"],
  ["QBMJOA", "EHISPN", "VETIGN", "BALIYT"],
  ["EZAVND", "RALESC", "UWILRG", "PACEMD"]
];

const scoreTable = {
  3: 100,
  4: 400,
  5: 800,
  6: 1400,
  7: 1800,
  8: 2200,
  9: 2600,
  10: 3000,
  11: 3400,
  12: 3800,
  13: 4200,
  14: 4600,
  15: 5000,
  16: 5400
};

let selectedLetters = [];
let timer;
let score = 0;
let timeLeft = 80;
let foundWords = new Set(); // To store unique words found

function createBoard() {
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = ''; // Clear previous board

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const randomIndex = Math.floor(Math.random() * diceFaces[i].length);
      const letter = diceFaces[i][randomIndex][Math.floor(Math.random() * 6)];
      const tile = document.createElement('div');
      tile.classList.add('tile');
      tile.textContent = letter;
      tile.dataset.letter = letter; // Store the letter in the dataset
      boardElement.appendChild(tile);
    }
  }
}

function startGame() {
  resetTimer();
  score = 0; // Reset score when starting a new game
  foundWords.clear(); // Clear found words when starting a new game
  updateScoreDisplay(); // Update score display
  createBoard(); // Create the board first
  timer = setInterval(updateTimer, 1000); // Start the timer after board creation
}

function resetTimer() {
  timeLeft = 10; // Set timer to 80 seconds 
  document.getElementById('time').textContent = `Timer: ${timeLeft}`; 
}

function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    document.getElementById('time').textContent = `Timer: ${timeLeft}`;
  } else {
    clearInterval(timer);
    endGame();
  }
}

function endGame() {
  clearInterval(timer);
  document.getElementById('final-score').textContent = score;
  showFinalWords();
  document.getElementById('modal').style.display = 'block'; // Show modal
}

function showFinalWords() {
  const finalWordsList = document.getElementById('final-words');
  finalWordsList.innerHTML = ''; // Clear previous words

  // Convert foundWords to an array and sort
  const sortedWords = Array.from(foundWords).sort((a, b) => {
    return b.length - a.length || a.localeCompare(b); // Sort by length (longest first), then alphabetically
  });

  // Display sorted words
  sortedWords.forEach(word => {
    const listItem = document.createElement('li');
    listItem.textContent = `${word} (Score: ${scoreTable[word.length] || 0})`;
    finalWordsList.appendChild(listItem);
  });
}

async function isValidWord(word) {
  // Check for length and if it's already found
  if (word.length < 3 || foundWords.has(word)) {
    return false;
  }

  try {
    // Fetch word data from the dictionary API
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    
    // Check if the API request was successful
    if (!response.ok) {
      return false;  // Word not found or error occurred
    }

    const data = await response.json();
    
    // If the word is valid, the API should return an array with word details
    return data.length > 0;
  } catch (error) {
    console.error('Error fetching word from dictionary:', error);
    return false;  // In case of a network error or API issue
  }
}

async function calculateScore() {
  const word = selectedLetters.join('');
  
  // Wait for the word validation from the API
  const valid = await isValidWord(word);
  
  if (valid) {
    foundWords.add(word); // Add valid word to foundWords set
    const wordLength = selectedLetters.length;
    score += scoreTable[wordLength] || 0; // Update score based on word length
    updateScoreDisplay(); // Update the score display after scoring
  }
}

function updateScoreDisplay() {
  document.getElementById('score-value').textContent = score; // Update the score display
}

// Await calculateScore in mouseup event
document.addEventListener('mouseup', async () => {
  await calculateScore(); // Calculate score on mouse up
  const tiles = document.querySelectorAll('.tile.selected');
  tiles.forEach(tile => tile.classList.remove('selected')); // Deselect all
  selectedLetters = []; // Clear selected letters for the next word
});

document.getElementById('board').addEventListener('mousedown', (event) => {
  if (event.target.classList.contains('tile')) {
    const tile = event.target;
    if (!tile.classList.contains('selected')) {
      tile.classList.add('selected');
      selectedLetters.push(tile.dataset.letter); // Use dataset to store letter
    }
  }
});

document.getElementById('board').addEventListener('mouseover', (event) => {
  if (event.target.classList.contains('tile') && event.buttons === 1) { // Only highlight if mouse is pressed
    const tile = event.target;
    if (!tile.classList.contains('selected')) {
      tile.classList.add('selected');
      selectedLetters.push(tile.dataset.letter); // Use dataset to store letter
    }
  }
});

// Play Again button functionality
document.getElementById('play-again-popup').addEventListener('click', () => {
  resetGame();
});

// Function to reset the game
function resetGame() {
  score = 0; // Reset score
  foundWords.clear(); // Clear found words
  updateScoreDisplay(); // Reset score display
  document.getElementById('final-words').innerHTML = ''; // Clear final words
  document.getElementById('modal').style.display = 'none'; // Hide modal
  startGame(); // Restart the game
}

document.addEventListener('DOMContentLoaded', () => {
  startGame(); // Start the game once the DOM is loaded
});

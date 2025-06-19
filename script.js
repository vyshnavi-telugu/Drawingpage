/* script.js */
var numSquares = 6;
var colors = [];
var pickedColor;

var squares = document.querySelectorAll(".square");
var colorDisplay = document.getElementById("color-display");
var messageDisplay = document.getElementById("message");
var h1 = document.querySelector("h1");
var resetButton = document.getElementById("reset");
var modeButtons = document.querySelectorAll(".mode");

init();

function init() {
  setupModeButtons();
  setupSquares();
  reset();
}

function setupModeButtons() {
  modeButtons.forEach(function(btn, i) {
    btn.addEventListener("click", function() {
      modeButtons.forEach(b => b.classList.remove("selected"));
      this.classList.add("selected");
      numSquares = (i === 0) ? 3 : 6;
      reset();
    });
  });
}

function setupSquares() {
  squares.forEach((sq, i) => {
    sq.addEventListener("click", function() {
      var clicked = this.style.backgroundColor;
      if (clicked === pickedColor) {
        messageDisplay.textContent = "Correct!";
        resetButton.textContent = "Play Again?";
        changeColors(pickedColor);
        h1.style.backgroundColor = pickedColor;
      } else {
        this.style.backgroundColor = "#232323";
        messageDisplay.textContent = "Try Again";
      }
    });
  });
}

function reset() {
  colors = generateRandomColors(numSquares);
  pickedColor = pickColor();
  colorDisplay.textContent = pickedColor;
  resetButton.textContent = "New Colors";
  messageDisplay.textContent = "";
  squares.forEach((sq, i) => {
    if (colors[i]) {
      sq.style.display = "block";
      sq.style.backgroundColor = colors[i];
    } else {
      sq.style.display = "none";
    }
  });
  h1.style.backgroundColor = "steelblue";
}

resetButton.addEventListener("click", reset);

function changeColors(color) {
  squares.forEach(sq => {
    sq.style.backgroundColor = color;
  });
}

function pickColor() {
  var rnd = Math.floor(Math.random() * colors.length);
  return colors[rnd];
}

function generateRandomColors(n) {
  var arr = [];
  for (var i = 0; i < n; i++) {
    arr.push(randomColor());
  }
  return arr;
}

function randomColor() {
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

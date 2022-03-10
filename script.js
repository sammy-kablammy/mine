// script.js handles user input and interfacing with the html file

import * as extra from "./extra.js";
import * as minesweeper from "./minesweeper.js";


minesweeper.stuff();

function startGame() {
  var rows = 8;
  var columns = 8;
  var mines = 12;
  // MAKE SURE TO HAVE CONDITIONS FOR THE INPUT VALUES AND STUFF
  var board = new MinesweeperGame(rows, columns, mines);
}



function mouseDownFunc(e) {
  if(e.button == 2) {
    var position = getIndexAtCoords(e.clientX, e.clientY); // should this be e.screenX and Y ?
    if(position != null) {
      placeFlag(position.row, position.column);
    }
  }
  if(interval == -1 && e.button == 0) {
    var position = getIndexAtCanvasCoords(getCanvasPos(e));
    if(position != null) {
      interval = setInterval(placeFlag, flagDelay, position.row, position.column);
    }
  }
}
function mouseUpFunc(e) {
  if(e.button == 0) {
    if(interval != -1) {
      click(getIndexAtCanvasCoords(getCanvasPos(e)));
      clearInterval(interval);
      interval = -1;
    }
  }
}

// returns grid index values (r and c) based on the given cursor position on the webpage
function getIndexAtCoords(x, y) {
  var rect = canvas.getBoundingClientRect();
  // relative coordinates are relative to the canvas instead of relative to the webpage as a whole
  var relativeX = parseInt(x - rect.left);
  var relativeY = parseInt(y - rect.top);
  // now that we have the canvas coords, find the index values
  for(var r = 0; r < board.rows; r++) {
    for(var c = 0; c < board.columns; c++) {
      var withinX = x > c * canvas.width / board.columns && x < (c * canvas.width / board.columns) + squareSize;
      var withinY = y > r * canvas.height / board.rows && y < (r * canvas.height / board.rows) + squareSize;
      if(withinX && withinY) {
        return {
          row: r,
          column: c
        }
      }
    }
  }
}


// move the drawgrid function back here at some point




// converts position on the webpage to its position relative to the canvas
function getCanvasPos(e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: parseInt(e.clientX - rect.left),
    y: parseInt(e.clientY - rect.top)
  }
}
// converts mouse (or touch) position in the canvas to index values in the 2D array
function getIndexAtCanvasCoords(position) {
  var x = position.x;
  var y = position.y;
  for(var r = 0; r < gridRowCount; r++) {
    for(var c = 0; c < gridColumnCount; c++) {
      var withinX = x > c * canvas.width / gridColumnCount && x < (c * canvas.width / gridColumnCount) + squareSize;
      var withinY = y > r * canvas.height / gridRowCount && y < (r * canvas.height / gridRowCount) + squareSize;
      if(withinX && withinY) {
        return {
          row: r,
          column: c
        }
      }
    }
  }
}















// minesweeper.stuff();

var canvas = document.getElementById("canv");
var ctx = canvas.getContext("2d");
var rowsInput = document.getElementById("rows");
var columnsInput = document.getElementById("columns");
var minesInput = document.getElementById("mines");
var title = document.getElementById("title");
var flags = document.getElementById("flags");
var victoryImage = document.getElementById("victoryImage");
var loseImage = document.getElementById("loseImage");
var free = document.getElementById("free");
var timerText = document.getElementById("timer");
var score = document.getElementById("score");
var delayInput = document.getElementById("flagdelay");

var numOfMines;
var gridColumnCount;
var gridRowCount;
var squareSize = 32;
var grid = []; // holds all the mines and numbers and stuff
var numFlags = 0;
var interval = -1;
var isGameOver;
var gameStarted = false; // changes when the first move has been made
var timerInterval;
var time = 0;
var flagDelay = 200;

function resetGame() {
  isGameOver = true; // stop the game from continuing whenever reset button is clicked
  
  // these come from the html <input> elements
  var doFreeClick = free.checked;
  gridRowCount = rowsInput.value;
  gridColumnCount = columnsInput.value;
  numOfMines = minesInput.value;
  
  // check if the user input is valid
  if(isNaN(gridRowCount) || gridRowCount != parseInt(gridRowCount) || gridRowCount <= 0) {
    title.innerHTML = "uh oh bucko. that's not a valid row count";
  }
  else if(isNaN(gridColumnCount) || gridColumnCount != parseInt(gridColumnCount) || gridColumnCount <= 0) {
    title.innerHTML = "uh oh bucko. that's not a valid column count";
  }
  else if(isNaN(numOfMines) || numOfMines != parseInt(numOfMines) || numOfMines <= 0 || numOfMines > gridRowCount * gridColumnCount - 1) {
    title.innerHTML = "uh oh bucko. that's not a valid mine count";
  }
  else {
    // everything has passed, so reset the game
    numFlags = 0;
    victoryImage.style = "visibility: hidden";
    loseImage.style = "visibility: hidden";
    score.style = "visibility: hidden";
    flags.innerHTML = "Mines Left: " + (numOfMines - numFlags);
    canvas.width = gridColumnCount * squareSize;
    canvas.height = gridRowCount * squareSize;
    gameStarted = false;
    isGameOver = false;
    time = 0;
    updateFlagDelay();
    clearInterval(timerInterval);

    // new
    var board = new MinesweeperGame();

    
    generateMines();
    generateEmptySpaces();
    if(doFreeClick) freeClick();
    drawGrid();
    title.innerHTML = "mine sweep 💣💯";
  }
}

// click handles pretty much all of the game logic
function click(position) {
  if(!isGameOver) {
    if(position != null && !grid[position.row][position.column].flagged) {
      if(grid[position.row][position.column].val == "M") gameOver();
      else revealSquare(position.row, position.column);
      if(!gameStarted) {
        gameStarted = true;
        timerInterval = setInterval(timeTick, 1000);
      }
    }
  attemptWin();
  drawGrid();
  }
}

// you lose, bucko
function gameOver() {
  isGameOver = true;
  clearInterval(timerInterval);
  title.innerHTML = "L bozo you lose";
  flags.innerHTML = "Mines Left: 0";
  loseImage.style = "visibility: initial";
  // reveal all the mines
  for(var r = 0; r < gridRowCount; r++) {
    for(var c = 0; c < gridColumnCount; c++) {
      if(grid[r][c].val == "M") {
        grid[r][c].hidden = false;
        grid[r][c].flagged = false;
      }
    }
  }
}
// attemptWin checks if the game has been won, then does the game-winny things
function attemptWin() {
  var numExposedSquares = 0;
  for(var r = 0; r < gridRowCount; r++) {
    for(var c = 0; c < gridColumnCount; c++) {
      if(grid[r][c].val != "M" && !grid[r][c].hidden) {
        numExposedSquares++;
      }
    }
  }
  if(numExposedSquares == (gridRowCount * gridColumnCount) - numOfMines) {
    isGameOver = true;
    clearInterval(timerInterval);
    flags.innerHTML = "Mines Left: 0";
    title.innerHTML = "winner winner chicken dinner";
    victoryImage.style = "visibility: initial";
    score.innerHTML = "Score: " + (numOfMines / time).toFixed(3) + " mines per second";
    score.style = "visibility: initial";
    // reveal all the flags
    for(var r = 0; r < gridRowCount; r++) {
      for(var c = 0; c < gridColumnCount; c++) {
        if(grid[r][c].val == "M") {
          grid[r][c].flagged = true;
        }
      }
    }
  }
}

// place a flag at given row and column
// kinda moved to minesweeper.js
function placeFlag(r, c) {
  if(!isGameOver) {
    clearInterval(interval);
    interval = -1;
    if(!isGameOver && gameStarted && !grid[r][c].flagged && grid[r][c].hidden) {
      grid[r][c].flagged = true;
      numFlags++;
    }
    else if(!isGameOver && grid[r][c].flagged) {
      grid[r][c].flagged = false;
      numFlags--;
    }
    drawGrid();
    flags.innerHTML = "Mines Left: " + (numOfMines - numFlags);
  }
}
// finds an available non-mine square and reveals it
// kinda moved to minesweeper.js
function freeClick() {
  var foundIt = false;
  for(var num = 0; num <= 8; num++) {
    for(var r = 0; r < gridRowCount; r++) {
      for(var c = 0; c < gridColumnCount; c++) {
        if(!foundIt && grid[r][c].val == num) {
          revealSquare(r, c);
          foundIt = true;
          gameStarted = true;
          timerInterval = setInterval(timeTick, 1000);
        }
      }
    }
  }
}



function setDifficulty(r, c, m) {
  rowsInput.value = r;
  columnsInput.value = c;
  minesInput.value = m;
}

function timeTick() {
  time += 1;
}
function infiniteLoop() {
  timerText.innerHTML = "Time: " + time + "s";
  requestAnimationFrame(infiniteLoop);
}

function updateFlagDelay() {
  var delay = delayInput.value;
  if(!isNaN(delay) && delay == parseInt(delay) && delay > 0) {
    flagDelay = delay;
    return;
  }
  flagDelay = 200;
  delayInput.value = 200;
}

// only purpose of this is to prevent right click menu
function rightClickFunc(e) {
  if(e.button == 2) e.preventDefault();
}



function touchStartFunc(e) {
  if(interval == -1) {
    var position = getIndexAtCanvasCoords(getCanvasPos(e.changedTouches[0]));
    if(position != null) {
      interval = setInterval(placeFlag, flagDelay, position.row, position.column);
    }
  }
}
function touchEndFunc(e) {
  if(interval != -1) {
    click(getIndexAtCanvasCoords(getCanvasPos(e.changedTouches[0])));
    clearInterval(interval);
    interval = -1;
  }
}

/*
document.getElementById("reset").addEventListener("click", resetGame);
document.getElementById("easy").addEventListener("click", function(){
  setDifficulty(10, 10, 16);
});
document.getElementById("medium").addEventListener("click", function(){
  setDifficulty(20, 20, 50);
});
document.getElementById("hard").addEventListener("click", function(){
  setDifficulty(30, 30, 200);
});
document.getElementById("updateflagdelay").addEventListener("click", updateFlagDelay);

document.addEventListener("contextmenu", rightClickFunc);
canvas.addEventListener("mousedown", mouseDownFunc);
canvas.addEventListener("mouseup", mouseUpFunc);
canvas.addEventListener("touchstart", touchStartFunc);
canvas.addEventListener("touchend", touchEndFunc);
infiniteLoop();
resetGame();
*/
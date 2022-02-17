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

function resetGame() {
  isGameOver = true; // stop the game from continuing whenever reset button is clicked
  
  // these come from the html <input> elements
  var doFreeClick = free.checked;
  gridRowCount = rowsInput.value;
  gridColumnCount = columnsInput.value;
  numOfMines = minesInput.value;
  
  var areNumeric = !isNaN(gridRowCount) && !isNaN(gridColumnCount) && !isNaN(numOfMines);
  var areInts = gridRowCount == parseInt(gridRowCount) && gridColumnCount == parseInt(gridColumnCount) && numOfMines == parseInt(numOfMines);
  // this section actually resets the game
  if(areNumeric && areInts && gridRowCount > 0 && gridColumnCount > 0 && numOfMines > 0 && numOfMines <= gridRowCount * gridColumnCount - 1) {
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
    clearInterval(timerInterval);
    initializeGrid();
    generateMines();
    generateEmptySpaces();
    // do free first click
    if(doFreeClick) freeClick();
    drawGrid();
    title.innerHTML = "mine sweep 💣💯";
  }
  else if(gridRowCount <= 0 || isNaN(gridRowCount) || gridRowCount != parseInt(gridRowCount)) {
    title.innerHTML = "uh oh bucko. that's not a valid row count";
  }
  else if(gridColumnCount <= 0 || isNaN(gridColumnCount) || gridColumnCount != parseInt(gridColumnCount)) {
    title.innerHTML = "uh oh bucko. that's not a valid column count";
  }
  else if(numOfMines <= 0 || numOfMines > gridRowCount * gridColumnCount - 1 || isNaN(numOfMines) || numOfMines != parseInt(numOfMines)) {
    title.innerHTML = "uh oh bucko. that's not a valid mine count";
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

// actually converts the values of the grid array into visuals
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(var r = 0; r < gridRowCount; r++) {
    for(var c = 0; c < gridColumnCount; c++) {
      ctx.beginPath();
      // draw the covered squares
      if(grid[r][c].hidden == true) {
        // draw a blank grey square
        ctx.rect(c * canvas.width / gridColumnCount, r * canvas.height / gridRowCount, squareSize, squareSize);
        ctx.fillStyle = "grey";
        ctx.fill();
        // draw the flags
        if(grid[r][c].flagged) {
          var textOffset = (squareSize - ctx.measureText(grid[r][c].val).width) / 2;
          ctx.fillStyle = "pink";
          ctx.rect(c * canvas.width / gridColumnCount, r * canvas.height / gridRowCount, squareSize, squareSize);
          ctx.fill();
          ctx.fillStyle = "black";
          ctx.font = "18px Arial";
          ctx.fillText("F", (c * canvas.width / gridColumnCount) + textOffset, (r * canvas.height / gridRowCount) + textOffset);
        }
      }
      // draw the uncovered squares
      else if(!grid[r][c].hidden && !grid[r][c].flagged) {
        ctx.font = "18px Arial";
        ctx.textBaseline = "top";
        // figure out what color the text should be
        var color;
        switch(grid[r][c].val) {
          case 0:
          color = "#eeeeee"; // to blend in with background color
          break;
          case 1:
          color = "blue";
          break;
          case 2:
          color = "green";
          break;
          case 3:
          color = "red";
          break;
          case 4:
          color = "darkBlue";
          break;
          case 5:
          color = "darkRed";
          break;
          case 6:
          color = "turquoise";
          break;
          case 7:
          color = "black";
          break;
          case 8:
          color = "darkGrey";
          break;
          default:
          color = "purple"; // should never happen
        }
        var textOffset = (squareSize - ctx.measureText(grid[r][c].val).width) / 2;
        ctx.fillStyle = color;
        ctx.fillText(grid[r][c].val, (c * canvas.width / gridColumnCount) + textOffset, (r * canvas.height / gridRowCount) + textOffset);
        ctx.fill();
      }
      // regardless of visibility, add black outline around the square
      ctx.rect(c * canvas.width / gridColumnCount, r * canvas.height / gridRowCount, squareSize, squareSize);
      // if it's a mine (and not hidden and flagged of course), make red THEN draw text
      if(!grid[r][c].hidden && !grid[r][c].flagged && grid[r][c].val == "M") {
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.fillText(grid[r][c].val, (c * canvas.width / gridColumnCount) + textOffset, (r * canvas.height / gridRowCount) + textOffset);
      }
      ctx.strokeStyle = "black";
      ctx.stroke();
      ctx.closePath();
    }
  }
}

// generates mines (duh)
function generateMines() {
  var minesGenerated = 0;
  while(minesGenerated < numOfMines) {
    var mineRow = Math.floor(Math.random() * gridRowCount);
    var mineColumn = Math.floor(Math.random() * gridColumnCount);
    if(grid[mineRow][mineColumn].val != "M") {
      grid[mineRow][mineColumn].val = "M";
      minesGenerated++;
    }
  }
}
// figures out what number should be in each square based on # of mines near it
function generateEmptySpaces() {
  for(var r = 0; r < gridRowCount; r++) {
    for(var c = 0; c < gridColumnCount; c++) {
      if(grid[r][c].val != "M") {
        var mineCount = getNearbyMineCount(r, c);
        grid[r][c].val = mineCount;
      }
    }
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

// reveal the given square; also handles chains of zeroes being revealed
function revealSquare(r, c) {
  grid[r][c].hidden = false;
  // handles clicking on a number to reveal the non-flags around it
  if(!grid[r][c].flagged && grid[r][c].val != "M") {
    if(getNearbyMineCount(r, c) <= getNearbyFlagCount(r, c)) {
      // reveal 8 around r, c
      for(var localR = -1; localR < 2; localR++) {
        for(var localC = -1; localC < 2; localC++) {
          var isInBounds = (r + localR >= 0 && r + localR < gridRowCount && c + localC >= 0 && c + localC < gridColumnCount)
          if(isInBounds && grid[r + localR][c + localC].hidden && !grid[r + localR][c + localC].flagged) {
            if(grid[r + localR][c + localC].val == "M") {
              gameOver();
            }
            revealSquare(r + localR, c + localC);
          }
        }
      }
    }
  }
  // handles zero chain shenanigans
  for(var localR = -1; localR < 2; localR++) {
    for(var localC = -1; localC < 2; localC++) {
      var isInBounds = (r + localR >= 0 && r + localR < gridRowCount && c + localC >= 0 && c + localC < gridColumnCount)
      // if r, c is zero, reveal everything around it
      if(grid[r][c].val == 0 && isInBounds && grid[r + localR][c + localC].hidden) {
        revealSquare(r + localR, c + localC);
      }
      // if one of the "8 squares around me" is zero, reveal that square
      else if(isInBounds && grid[r + localR][c + localC].val == 0 && grid[r + localR][c + localC].hidden) {
        revealSquare(r + localR, c + localC);
      }
    }
  }
}
// place a flag at given row and column
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

// converts mouse (or touch) position on the webpage to its position relative to the canvas
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

// returns number of mines in 8 blocks around r, c
function getNearbyMineCount(r, c) {
  var mineCount = 0;
  for(var localR = -1; localR < 2; localR++) {
    for(var localC = -1; localC < 2; localC++) {
      var isInBounds = (r + localR >= 0 && r + localR < gridRowCount && c + localC >= 0 && c + localC < gridColumnCount)
      if(isInBounds) {
        if(grid[r + localR][c + localC].val == "M") {
          mineCount++;
        }
      }
    }
  }
  return mineCount;
}
// returns number of flags in 8 blocks around r, c
function getNearbyFlagCount(r, c) {
  var localFlagCount = 0;
  for(var localR = -1; localR < 2; localR++) {
    for(var localC = -1; localC < 2; localC++) {
      var isInBounds = (r + localR >= 0 && r + localR < gridRowCount && c + localC >= 0 && c + localC < gridColumnCount)
      if(isInBounds) {
        if(grid[r + localR][c + localC].flagged) {
          localFlagCount++;
        }
      }
    }
  }
  return localFlagCount;
}

function setDifficulty(r, c, m) {
  rowsInput.value = r;
  columnsInput.value = c;
  minesInput.value = m;
}
function initializeGrid() {
  for(var r = 0; r < gridRowCount; r++) {
    grid[r] = [];
    for(var c = 0; c < gridColumnCount; c++) {
      grid[r][c] = {
        val: 0,
        hidden: true,
        flagged: false
      }
    }
  }
}

function timeTick() {
  time += 1;
}
function infiniteLoop() {
  timerText.innerHTML = "Time: " + time + "s";
  requestAnimationFrame(infiniteLoop);
}

// only purpose of this is to prevent right click menu
function rightClickFunc(e) {
  if(e.button == 2) e.preventDefault();
}

function mouseDownFunc(e) {
  if(e.button == 2) {
    var position = getIndexAtCanvasCoords(getCanvasPos(e));
    if(position != null) {
      placeFlag(position.row, position.column);
    }
  }
  if(interval == -1 && e.button == 0) {
    var position = getIndexAtCanvasCoords(getCanvasPos(e));
    if(position != null) {
      interval = setInterval(placeFlag, 400, position.row, position.column);
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

function touchStartFunc(e) {
  if(interval == -1) {
    var position = getIndexAtCanvasCoords(getCanvasPos(e.changedTouches[0]));
    if(position != null) {
      interval = setInterval(placeFlag, 400, position.row, position.column);
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

document.addEventListener("contextmenu", rightClickFunc);
canvas.addEventListener("mousedown", mouseDownFunc);
canvas.addEventListener("mouseup", mouseUpFunc);
canvas.addEventListener("touchstart", touchStartFunc);
canvas.addEventListener("touchend", touchEndFunc);
infiniteLoop();
resetGame();
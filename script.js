var canvas = document.getElementById("canv");
var ctx = canvas.getContext("2d");
var rowsInput = document.getElementById("rows");
var columnsInput = document.getElementById("columns");
var bombsInput = document.getElementById("bombs");
var title = document.getElementById("title");
var flags = document.getElementById("flags");

var numOfMines;
var gridColumnCount;
var gridRowCount;
var squareSize = 32;
var mouseX = 0;
var mouseY = 0;
var grid = []; // holds all the mines and numbers and stuff
var numFlags = 0;
var interval = -1;
var isGameOver = false;
var gameStarted = false; // changes when the first move has been made

function resetGame() {
  // these come from the html <input> elements
  gridRowCount = rowsInput.value;
  gridColumnCount = columnsInput.value;
  numOfMines = bombsInput.value;

  numFlags = 0;
  flags.innerHTML = "Mines Left: " + (numOfMines - numFlags);
  canvas.width = gridColumnCount * squareSize;
  canvas.height = gridRowCount * squareSize;
  gameStarted = false;
  isGameOver = false;
  initializeGrid();
  generateMines();
  generateEmptySpaces();
  drawGrid();
  title.innerHTML = "mine sweep 💣💯";
}

// click handles pretty much all of the game logic
function click(e) {
  if(e.button == 0) {
    var position = getIndexAtMouseCoords();
    if(position != null && !isGameOver && !grid[position.row][position.column].flagged) {
      if(grid[position.row][position.column].val == "M") gameOver();
      else revealSquare(position.row, position.column);
      if(!gameStarted) gameStarted = true;
    }
    attemptWin();
  }
  drawGrid();
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

function gameOver() {
  isGameOver = true;
  title.innerHTML = "L bozo you lose";
  flags.innerHTML = "Mines Left: 0";
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
    flags.innerHTML = "Mines Left: 0";
    title.innerHTML = "winner winner chicken dinner";
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

function placeFlag(r, c) {
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

// converts mouse position in pixels to the index values in the 2D array
function getIndexAtMouseCoords() {
  for(var r = 0; r < gridRowCount; r++) {
    for(var c = 0; c < gridColumnCount; c++) {
      var withinX = mouseX > c * canvas.width / gridColumnCount && mouseX < (c * canvas.width / gridColumnCount) + squareSize;
      var withinY = mouseY > r * canvas.height / gridRowCount && mouseY < (r * canvas.height / gridRowCount) + squareSize;
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

function mouseDownFunc(e) {
  if(e.button == 2) {
    var position = getIndexAtMouseCoords();
    if(position != null) {
      placeFlag(position.row, position.column);
    }
  }
  if(interval == -1 && e.button == 0) {
    var position = getIndexAtMouseCoords();
    if(position != null) {
      interval = setInterval(placeFlag, 400, position.row, position.column);
    }
  }
}

function mouseUpFunc(e) {
  if(e.button == 0) {
    if(interval != -1) {
      click(e);
      clearInterval(interval);
      interval = -1;
    }
  }
}

// only purpose of this is to prevent right click menu
function rightClickFunc(e) {
  // i think the reason this can't happen in the mouseDownFunc is because click events are cancellable while mousedown events are not ?
  if(e.button == 2) e.preventDefault();
}

function mouseMove(e) {
  var rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
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

document.addEventListener("contextmenu", rightClickFunc);
canvas.addEventListener("mousemove", mouseMove);
canvas.addEventListener("mousedown", mouseDownFunc);
canvas.addEventListener("mouseup", mouseUpFunc);
resetGame();
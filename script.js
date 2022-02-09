var canvas = document.getElementById("canv");
var ctx = canvas.getContext("2d");
var rowsInput = document.getElementById("rows");
var columnsInput = document.getElementById("columns");
var bombsInput = document.getElementById("bombs");

var numOfMines;
var gridColumnCount;
var gridRowCount;

var squareSize = 32;
var textOffset = 7; // come up with a dynamic way to determine this
var isGameOver = false;
var mouseX = 0;
var mouseY = 0;
var grid = [];

function resetGame() {
  // these come from the html <input> elements
  gridRowCount = rowsInput.value;
  gridColumnCount = columnsInput.value;
  numOfMines = bombsInput.value;

  canvas.width = gridColumnCount * squareSize;
  canvas.height = gridRowCount * squareSize;
  isGameOver = false;
  initializeGrid();
  generateMines();
  generateEmptySpaces();
  drawGrid();
}

// handles pretty much all of the game logic
function clickFunc(e) {
  // make sure only left click is considered
  if(e.button == 0) {
    // check if the click happened on a button, not just anywhere
    for(var r = 0; r < gridRowCount; r++) {
      for(var c = 0; c < gridColumnCount; c++) {
        var withinX = mouseX > c * canvas.width / gridColumnCount && mouseX < (c * canvas.width / gridColumnCount) + squareSize;
        var withinY = mouseY > r * canvas.height / gridRowCount && mouseY < (r * canvas.height / gridRowCount) + squareSize;
        if(withinX && withinY && !isGameOver) {
          if(grid[r][c].val == "M") {
            gameOver();
          }
          else {
            revealSquare(r, c);
          }
        }
      }
    }
    attemptWin();
  }
  drawGrid();
}

function generateMines() {
  var minesGenerated = 0;
  while(minesGenerated < numOfMines) {
    var mineRow = Math.floor(Math.random() * gridRowCount);
    var mineColumn = Math.floor(Math.random() * gridColumnCount);
    if(grid[mineRow][mineColumn].val != "M") {
      grid[mineRow][mineColumn].val = "M";
      minesGenerated++;
      // console.log("mine generated at row: " + mineRow + " and column: " + mineColumn);
    }
  }
}

// figures out what number should be in each square based on # of mines near it
function generateEmptySpaces() {
  for(var r = 0; r < gridRowCount; r++) {
    for(var c = 0; c < gridColumnCount; c++) {
      if(grid[r][c].val != "M") {
        // figure out what number goes in this square
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
        // now, put that number in the square
        grid[r][c].val = mineCount;
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
        ctx.rect(c * canvas.width / gridColumnCount, r * canvas.height / gridRowCount, squareSize, squareSize);
        ctx.fillStyle = "grey";
        ctx.fill();
      }
      // draw the uncovered squares
      else { // hidden is false
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
        ctx.fillStyle = color;
        ctx.fillText(grid[r][c].val, (c * canvas.width / gridColumnCount) + textOffset, (r * canvas.height / gridRowCount) + textOffset);
        ctx.fill();
      }
      // regardless of visibility, add black outline around the square
      ctx.rect(c * canvas.width / gridColumnCount, r * canvas.height / gridRowCount, squareSize, squareSize);
      // if it's a mine (and not hidden of course), make red THEN draw text
      if(!grid[r][c].hidden && grid[r][c].val == "M") {
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

// reveal the given square; also handles chains of zeroes being revealed
function revealSquare(r, c) {
  grid[r][c].hidden = false;
  if(grid[r][c].val == 0) {
    for(var localR = -1; localR < 2; localR++) {
      for(var localC = -1; localC < 2; localC++) {
        var isInBounds = (r + localR >= 0 && r + localR < gridRowCount && c + localC >= 0 && c + localC < gridColumnCount)
        if(isInBounds && grid[r + localR][c + localC].hidden) {
          revealSquare(r + localR, c + localC);
        }
      }
    }
  }
}

// make this do something
function rightClickFunc(e) {
  // console.log("right click   x" + mouseX + "   y" + mouseY);
  e.preventDefault();
}

function gameOver() {
  isGameOver = true;
  console.log("L Bozo   ".repeat(5));

  // reveal all the mines
  for(var r = 0; r < gridRowCount; r++) {
    for(var c = 0; c < gridColumnCount; c++) {
      if(grid[r][c].val == "M") grid[r][c].hidden = false;
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
    console.log("you win bozo   ".repeat(5));
  }
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
        hidden: true
      }
    }
  }
}

canvas.addEventListener("mousemove", mouseMove);
canvas.addEventListener("click", clickFunc);
canvas.addEventListener("contextmenu", rightClickFunc);
resetGame();
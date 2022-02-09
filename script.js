var canvas = document.getElementById("canv");
var ctx = canvas.getContext("2d");
var debugLabel = document.getElementById("debug");

var numOfMines = 10;
var gridColumnCount = 8;
var gridRowCount = 8;
var squareSize = 32;

var mouseX = 0;
var mouseY = 0;
var currentSquare = {
  x: -1,
  y: -1
}

var grid = [];
{ // initialize grid
  for(var r = 0; r < 10; r++) {
    grid[r] = [];
    for(var c = 0; c < 10; c++) {
      grid[r][c] = 0;
    }
  }
}
/*
grid can be 0 (empty) or "mine" (mine)
*/

/* this is useful

  for(var r = 0; r < 10; r++) {}
    for(var c = 0; c < 10; c++) {

    }
  }

*/

// i dont like this repeating forever - just make it update whenever
// then again, the debug function will probably be removed eventually anyway soo...
function debug() {
  debugLabel.innerHTML = "row: " + currentSquare.y + " column: " + currentSquare.x;
  requestAnimationFrame(debug);
}

function generateMines() {
  var minesGenerated = 0;
  while(minesGenerated < numOfMines) {
    var mineRow = Math.floor(Math.random() * gridColumnCount);
    var mineColumn = Math.floor(Math.random() * gridRowCount);
    if(grid[mineRow][mineColumn] != "mine") {
      grid[mineRow][mineColumn] = "mine";
      minesGenerated++;
      console.log("mine generated at row: " + mineRow + " and column: " + mineColumn);
    }
  }
}

function generateEmptySpaces() {
  for(var r = 0; r < 10; r++) {
    for(var c = 0; c < 10; c++) {
      if(grid[r][c] != "mine") {
        // figure out what number goes here, then put it here
        var mineCount = 0;
        for(var localR = -1; localR < 2; localR++) {
          for(var localC = -1; localC < 2; localC++) {
            var isInBounds = (r + localR > 0 && r + localR < gridColumnCount && c + localC > 0 && c + localC < gridRowCount)
            if(isInBounds) {
              if(grid[r + localR][c + localC] == "mine") {
                mineCount++;
              }
            }
          }
        }

        // now, put the mine count in the square
        grid[r][c] = mineCount;


      }
    }
  }
}

// this needs to be updated to account for non-mine squares
function drawGrid() {
  for(var r = 0; r < gridRowCount; r++) {
    for(var c = 0; c < gridColumnCount; c++) {
      ctx.beginPath();
      ctx.rect(c * canvas.width / gridColumnCount, r * canvas.height / gridRowCount, squareSize, squareSize);

      // this first if should be removed at some point
      if(currentSquare.x == c && currentSquare.y == r) ctx.fillStyle = "blue";
      else if(grid[r][c] == "mine") ctx.fillStyle = "red";
      else ctx.fillStyle = "grey";

      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();
      ctx.closePath();
    }
  }
}

function mouseMove(e) {
  var rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
}

function clickFunc(e) {
  // make sure only left click is considered
  if(e.button == 0) {
    // check if the click happened on a button
    for(var r = 0; r < gridRowCount; r++) {
      for(var c = 0; c < gridColumnCount; c++) {
        var withinX = mouseX > c * canvas.width / gridColumnCount && mouseX < (c * canvas.width / gridColumnCount) + squareSize;
        var withinY = mouseY > r * canvas.height / gridRowCount && mouseY < (r * canvas.height / gridRowCount) + squareSize;
        if(withinX && withinY) {
          currentSquare.x = c;
          currentSquare.y = r;
        }
      }
    }
  }
  drawGrid();
}

// make this do something
function rightClickFunc(e) {
  // console.log("right click   x" + mouseX + "   y" + mouseY);
  e.preventDefault();
}

function resetGame() {
  // make all the squares blank
  for(var r = 0; r < 10; r++) {
    for(var c = 0; c < 10; c++) {
      grid[r][c] = 0;
    }
  }

  // do this too
  currentSquare = {
    x: -1,
    y: -1
  }

  console.log("clear stuff");
  console.clear(); // why doesnt this work ?????
  generateMines();
  generateEmptySpaces()
  drawGrid();
}

canvas.addEventListener("mousemove", mouseMove);
canvas.addEventListener("click", clickFunc);
canvas.addEventListener("contextmenu", rightClickFunc);
debug();
resetGame();
var canvas = document.getElementById("canv");
var ctx = canvas.getContext("2d");
var debugLabel = document.getElementById("debug");

var numOfMines = 20;
var gridColumnCount = 8;
var gridRowCount = 8;
var squareSize = 32;
var textOffset = 7; // (in pixels) used to offset text (duh)

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
      grid[r][c] = {
        val: 0,
        hidden: false
      }
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
    if(grid[mineRow][mineColumn].val != "M") {
      grid[mineRow][mineColumn].val = "M";
      minesGenerated++;
      console.log("mine generated at row: " + mineRow + " and column: " + mineColumn);
    }
  }
}

// figures out what number should be in each square based on # of mines near it
function generateEmptySpaces() {
  for(var r = 0; r < 10; r++) {
    for(var c = 0; c < 10; c++) {
      if(grid[r][c].val != "M") {
        // figure out what number goes in this square
        var mineCount = 0;
        for(var localR = -1; localR < 2; localR++) {
          for(var localC = -1; localC < 2; localC++) {
            var isInBounds = (r + localR >= 0 && r + localR < gridColumnCount && c + localC >= 0 && c + localC < gridRowCount)
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

// this needs to be updated to account for non-mine squares
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
      // if it's a mine, make red THEN draw text
      if(grid[r][c].val == "M") {
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
      grid[r][c].val = 0;
    }
  }

  // do this too
  currentSquare = {
    x: -1,
    y: -1
  }

  console.log("clear stuff");
  console.log("\n\n\n\n\n\n\n\n\n\n\n");
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
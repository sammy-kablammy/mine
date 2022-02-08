var canvas = document.getElementById("canv");
var ctx = canvas.getContext("2d");
var debugLabel = document.getElementById("debug");

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

/* this is useful

  for(var r = 0; r < 10; r++) {}
    for(var c = 0; c < 10; c++) {

    }
  }

*/

function debug() {
  debugLabel.innerHTML = "row: " + currentSquare.y + " column: " + currentSquare.x;
  requestAnimationFrame(debug);
}

function generateMines() {
  for(var r = 0; r < 10; r++) {
    for(var c = 0; c < 10; c++) {
      if(Math.random() * 8 < 1) {
        grid[r][c] = "mine";
        console.log("mine placed at " + r + " " + c);
      }
      else {
        grid[r][c] = 0;
      }
    }
  }
}

function drawGrid() {
  for(var r = 0; r < gridRowCount; r++) {
    for(var c = 0; c < gridColumnCount; c++) {
      ctx.beginPath();
      ctx.rect(c * canvas.width / gridColumnCount, r * canvas.height / gridRowCount, squareSize, squareSize);
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

canvas.addEventListener("mousemove", mouseMove);
canvas.addEventListener("click", clickFunc);
canvas.addEventListener("contextmenu", rightClickFunc);
debug();
generateMines();
drawGrid();
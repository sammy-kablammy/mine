// minesweeper.js has minesweeper-specific code

var canvas = document.getElementById("canv");
console.log(canvas);
var ctx = canvas.getContext("2d");
var squareSize = 32; // used in drawGrid method

// a MinesweeperSquare contains a value 0-8 inclusive, it can be hidden/visible and/or it can be flagged or not flagged
// change this have a status property that can be revealed, hidden, or flagged
class MinesweeperSquare {
  constructor() {
    this.val = 0;
    this.hidden = true;
    this.flagged = false;
  }
}

// a MinesweeperGame is a 2d grid of MinesweeperSquare objects
class MinesweeperGame {
  constructor(rows, columns, mines) {
    this.rows = rows;
    this.columns = columns;
    this.mines = mines;
    this.grid = [];
    for(var r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for(var c = 0; c < this.columns; c++) {
        this.grid[r][c] = new MinesweeperSquare();
      }
    }
    this.generateMines();
    this.generateEmptySpaces();
  }

  // used for debugging
  printGrid() {
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    for(var r = 0; r < this.rows; r++) {
      var str = "";
      for(var c = 0; c < this.columns; c++) {
        str += this.grid[r][c].val;
      }
      console.log(str);
    }
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  }


  // returns number of mines in 8 blocks around r, c
  getNearbyMineCount(r, c) {
    var mineCount = 0;
    for(var localR = -1; localR < 2; localR++) {
      for(var localC = -1; localC < 2; localC++) {
        var isInBounds = (r + localR >= 0 && r + localR < this.rows && c + localC >= 0 && c + localC < this.columns)
        if(isInBounds) {
          if(this.grid[r + localR][c + localC].val == "M") {
            mineCount++;
          }
        }
      }
    }
    return mineCount;
  }
  // returns number of flags in 8 blocks around r, c
  getNearbyFlagCount(r, c) {
    var localFlagCount = 0;
    for(var localR = -1; localR < 2; localR++) {
      for(var localC = -1; localC < 2; localC++) {
        var isInBounds = (r + localR >= 0 && r + localR < this.rows && c + localC >= 0 && c + localC < this.columns)
        if(isInBounds) {
          if(this.grid[r + localR][c + localC].flagged) {
            localFlagCount++;
          }
        }
      }
    }
    return localFlagCount;
  }
  
  
  // fills the grid with mines
  generateMines() {
    var minesGenerated = 0;
    while(minesGenerated < this.mines) {
      var mineRow = Math.floor(Math.random() * this.rows);
      var mineColumn = Math.floor(Math.random() * this.columns);
      if(this.grid[mineRow][mineColumn].val != "M") {
        this.grid[mineRow][mineColumn].val = "M";
        minesGenerated++;
      }
    }
  }
  // figures out what number should be in each square based on # of mines near it
  generateEmptySpaces() {
    for(var r = 0; r < this.rows; r++) {
      for(var c = 0; c < this.columns; c++) {
        if(this.grid[r][c].val != "M") {
          var mineCount = this.getNearbyMineCount(r, c);
          this.grid[r][c].val = mineCount;
        }
      }
    }
  }



  // reveal the given square; also handles chains of zeroes being revealed
  revealSquare(r, c) {
    this.grid[r][c].hidden = false;
    // clicking on a revealed number reveals the non-flags around it
    if(!this.grid[r][c].flagged && this.grid[r][c].val != "M") {
      if(this.getNearbyMineCount(r, c) <= this.getNearbyFlagCount(r, c)) {
        // reveal 8 around r, c
        for(var localR = -1; localR < 2; localR++) {
          for(var localC = -1; localC < 2; localC++) {
            var isInBounds = (r + localR >= 0 && r + localR < this.rows && c + localC >= 0 && c + localC < this.columns)
            if(isInBounds && this.grid[r + localR][c + localC].hidden && !this.grid[r + localR][c + localC].flagged) {
              if(this.grid[r + localR][c + localC].val == "M") {
                // gameOver(); // this isnt implemented yet :/
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
        var isInBounds = (r + localR >= 0 && r + localR < this.rows && c + localC >= 0 && c + localC < this.columns)
        // if r, c is zero, reveal everything around it
        if(this.grid[r][c].val == 0 && isInBounds && this.grid[r + localR][c + localC].hidden) {
          revealSquare(r + localR, c + localC);
        }
        // if one of the "8 squares around me" is zero, reveal that square
        else if(isInBounds && this.grid[r + localR][c + localC].val == 0 && this.grid[r + localR][c + localC].hidden) {
          revealSquare(r + localR, c + localC);
        }
      }
    }
  }
  
  // place a flag at given row and column
  flag(r, c) {
    this.grid[r][c].flagged = true;
  }
  
  // finds an available non-mine square and returns its position
  findFreeClick() {
    for(var num = 0; num <= 8; num++) {
      for(var r = 0; r < this.rows; r++) {
        for(var c = 0; c < this.columns; c++) {
          if(this.grid[r][c].val == num) {
            return {
              row: r,
              col: c
            }
          }
        }
      }
    }
  }





  // actually converts the values of the grid array into visuals
  drawGrid() {

    // this is needed somewhere, maybe not in this function
    canvas.width = this.columns * squareSize;
    canvas.height = this.rows * squareSize;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var r = 0; r < this.rows; r++) {
      for(var c = 0; c < this.columns; c++) {
        ctx.beginPath();
        // draw the covered squares
        if(this.grid[r][c].hidden == true) {
          // draw a blank grey square
          ctx.rect(c * canvas.width / this.columns, r * canvas.height / this.rows, squareSize, squareSize);
          ctx.fillStyle = "grey";
          ctx.fill();
          // draw the flags
          if(this.grid[r][c].flagged) {
            var textOffset = (squareSize - ctx.measureText(this.grid[r][c].val).width) / 2;
            ctx.fillStyle = "pink";
            ctx.rect(c * canvas.width / this.columns, r * canvas.height / this.rows, squareSize, squareSize);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.font = "18px Arial";
            ctx.fillText("F", (c * canvas.width / this.columns) + textOffset, (r * canvas.height / this.rows) + textOffset);
          }
        }
        // draw the uncovered squares
        else if(!this.grid[r][c].hidden && !this.grid[r][c].flagged) {
          ctx.font = "18px Arial";
          ctx.textBaseline = "top";
          // figure out what color the text should be
          var color;
          switch(this.grid[r][c].val) {
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
          var textOffset = (squareSize - ctx.measureText(this.grid[r][c].val).width) / 2;
          ctx.fillStyle = color;
          ctx.fillText(this.grid[r][c].val, (c * canvas.width / this.columns) + textOffset, (r * canvas.height / this.rows) + textOffset);
          ctx.fill();
        }
        // regardless of visibility, add black outline around the square
        ctx.rect(c * canvas.width / this.columns, r * canvas.height / this.rows, squareSize, squareSize);
        // if it's a mine (and not hidden and flagged of course), make red THEN draw text
        if(!this.grid[r][c].hidden && !this.grid[r][c].flagged && this.grid[r][c].val == "M") {
          ctx.fillStyle = "red";
          ctx.fill();
          ctx.fillStyle = "black";
          ctx.fillText(this.grid[r][c].val, (c * canvas.width / this.columns) + textOffset, (r * canvas.height / this.rows) + textOffset);
        }
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
      }
    }
  }







  
}




// testing
function stuff() {
  var board = new MinesweeperGame(3, 4, 5);
  board.printGrid();
  board.drawGrid();
}

export {stuff};
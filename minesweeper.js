// minesweeper.js has minesweeper-specific code

class MinesweeperSquare {
  constructor() {
    this.val = 0;
    this.hidden = true;
    this.flagged = false;
  }
}





class MinesweeperGame {
  constructor(width, height, mines) {
    this.width = width;
    this.height = height;
    this.mines = mines;
    this.grid = [];
    for(var r = 0; r < this.height; r++) {
      this.grid[r] = [];
      for(var c = 0; c < this.width; c++) {
        this.grid[r][c] = new MinesweeperSquare();
      }
    }
  }

  // used for debugging
  printGrid() {
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    for(var r = 0; r < this.height; r++) {
      var str = "";
      for(var c = 0; c < this.width; c++) {
        str += this.grid[r][c].val;
      }
      console.log(str);
    }
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  }
  
  generateMines() {
    var minesGenerated = 0;
    while(minesGenerated < this.mines) {
      var mineRow = Math.floor(Math.random() * this.height);
      var mineColumn = Math.floor(Math.random() * this.width);
      if(this.grid[mineRow][mineColumn].val != "M") {
        this.grid[mineRow][mineColumn].val = "M";
        minesGenerated++;
      }
    }
  }


  // returns number of mines in 8 blocks around r, c
  getNearbyMineCount(r, c) {
    var mineCount = 0;
    for(var localR = -1; localR < 2; localR++) {
      for(var localC = -1; localC < 2; localC++) {
        var isInBounds = (r + localR >= 0 && r + localR < this.height && c + localC >= 0 && c + localC < this.width)
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
        var isInBounds = (r + localR >= 0 && r + localR < this.height && c + localC >= 0 && c + localC < this.width)
        if(isInBounds) {
          if(this.grid[r + localR][c + localC].flagged) {
            localFlagCount++;
          }
        }
      }
    }
    return localFlagCount;
  }






  // reveal the given square; also handles chains of zeroes being revealed
  revealSquare(r, c) {
    this.grid[r][c].hidden = false;
    // handles clicking on a number to reveal the non-flags around it
    if(!this.grid[r][c].flagged && this.grid[r][c].val != "M") {
      if(getNearbyMineCount(r, c) <= getNearbyFlagCount(r, c)) {
        // reveal 8 around r, c
        for(var localR = -1; localR < 2; localR++) {
          for(var localC = -1; localC < 2; localC++) {
            var isInBounds = (r + localR >= 0 && r + localR < this.height && c + localC >= 0 && c + localC < this.width)
            if(isInBounds && this.grid[r + localR][c + localC].hidden && !this.grid[r + localR][c + localC].flagged) {
              if(this.grid[r + localR][c + localC].val == "M") {
                gameOver(); // this isnt implemented yet :/
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
        var isInBounds = (r + localR >= 0 && r + localR < this.height && c + localC >= 0 && c + localC < this.width)
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
      for(var r = 0; r < this.height; r++) {
        for(var c = 0; c < this.width; c++) {
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

  
  


  
  
  
}






// testing
function stuff() {
  var board = new MinesweeperGame(3, 4, 5); // 3 wide, 4 tall, 5 mines
  board.printGrid();
  board.generateMines();
  board.printGrid();
  console.log(board.getNearbyMineCount(1, 1));
  console.log(board.getNearbyFlagCount(1, 1));
}

export {stuff};
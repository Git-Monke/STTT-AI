const WIN_CONDITIONS = [
  0b111000000, 0b000111000, 0b000000111, 0b100100100, 0b010010010, 0b001001001,
  0b100010001, 0b001010100,
];

/*
  Counts the amount of bits in a binary number by &ing that number repeatedly with itself minus one.
  This works because subtracting one from a binary number flips the rightmost bit and all bits to the right of it
  0101 - 1 = 0100
  0100 - 1 = 0011
  01101000 - 1 = 01100111
  etc...
  Therefore, performing the & operation on a binary number with itself minus one will always remove the rightmost bit
  due to the fact that that bit and all bits to the right will be the inverse of what they previously were, and consequently
  will be 0 after the & operation
  Counting the number of times we can remove a bit until the number is zero yields the bit count in the number,
  as there will be 1 removal per bit in the number. 
*/
function bitcount(b) {
  let count = 0;

  while (b != 0) {
    b = b & (b - 1);
    count += 1;
  }

  return count;
}

class Board {
  constructor() {
    /*
      Two boards are used to represent a single board
      the first is for player X
      the second is for player O

      X O _
      _ _ O
      O X O
      
      would be encoded as

      0b100000010
      0b010001101

      The reason I used this data structure is due to the efficiency that operations can be performed on binary numbers, demonstrated later
    */
    this.boards = [0b000000000, 0b000000000];
  }

  moveWins(i, p) {
    let board = this.boards[p] & (0b1 << i);
    return this.checkWin(board);
  }

  /*
    Checks if a move is legal
    -------------------------
    First constructs a mask, which represents all occupied spaces, by combining both players boards
    Then isolates the bit that encodes the index we are checking
    If that bit is still a zero, that means neither player occupies the spot and is therefore empty    
  */
  canPlay(i) {
    let mask = this.boards[0] | this.boards[1];
    return (mask & (0b1 << i)) == 0;
  }

  /*
    Makes a move for a given player at a given index
    ------------------------------------------------
    To make moves, we get the corresponding board and combine it with a binary number that encodes the move we want to make
    Playing at index 3, the operation 0b1 << 3 will produce 0b000010000, which when or'd with any binary number will set the
    4th bit to be 1. Which is what we want.
  */
  move(i, p) {
    this.boards[p] = this.boards[p] | (0b1 << i);
    return this.checkWin(this.boards[p]);
  }

  /*
    Produces an evaluation of a board. Positive for X, negative for O
    -----------------------------------------------------------------
    The output is equal to who has the greatest potential to make a three in a row.
    The following steps are run for every win condition:
      1.) Isolate the bits for player 1 that relate to the current win condition, and count them
      2.) Run the same operation for player 2, but negate the result
      3.) Sum them together, producing who has the greatest control of a win condition
      4.) If the sum is 0, neither player has control and so return 0
      4.) Otherwise, Raise 10 to the power of that sum (minus one), and adjust for which player has greatest control
    If X has two pieces along a diagonal, and O has none, the sum will be 2 and so the output of that condition will be 10 ** 1 (10).
    If X has two pieces along a diagonal, and O has 1, the sum will be 1 and the so output will be 1 (10 ** 0), reflecting the fact that
    X has more pieces, and so a greater potential to win later on, but isn't immediately threatening anything
    If X has three in a row, the result will be 10 ** 2, or 100;
  */
  score() {
    let score = 0;

    for (let i = 0; i < 8; i++) {
      let x = bitcount(this.boards[0] & WIN_CONDITIONS[i]);
      let o = -bitcount(this.boards[1] & WIN_CONDITIONS[i]);
      let s = o + x;

      if (s == 0) {
        continue;
      }

      score += 10 ** (Math.abs(s) - 1) * (s < 0 ? -1 : 1);
    }

    return score;
  }

  /*
    Checks if a board has been completed
    ------------------------------------
    1 = Player won
    -1 = Draw
    0 = No condition met

    For every win condition, isolate the bits in the board related to that condition
    If those isolated bits are equal to the win condition itself, we have a win!

    Example:
    Win condition: 111000000
    Board:         111010001
    Isolated Bits: 111000000

    Isolated Bits == Win Condition
    Therefore, win condition met.

    If no win condition is met but the board is completely full, return a draw
    511 = 0b111111111. A full board.
  */
  checkWin(board) {
    for (let i = 0; i < 8; i++) {
      let condition = WIN_CONDITIONS[i];
      if ((board & condition) == condition) {
        return 1;
      }
    }

    if ((this.boards[0] | this.boards[1]) == 511) {
      return -1;
    }

    return 0;
  }

  clone() {
    let board = new Board();
    board.boards = this.boards.slice();
    return board;
  }
}

export default Board;

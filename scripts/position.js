import Board from "./position/board.js";
import { hash } from "./transposition.js";

class Position {
  /*
    Implements the ability to clone a position. The reason being that beacuse everything is stored in binary,
    it is actually more than twice as fast to simply clone all of those values than it is to keep track of a history of
    moves and make and unmake those moves.
  */
  constructor(P) {
    if (P) {
      this.subboards = [];
      for (let i = 0; i < 9; i++) {
        this.subboards[i] = P.subboards[i].clone();
      }
      this.board = P.board.clone();
      this.subboard = P.subboard;
      this.legalBoards = P.legalBoards;
      this.player = P.player;
      return;
    }

    this.subboards = new Array(9).fill(null).map((_) => new Board());
    this.legalBoards = 0b111111111;
    this.subboard = null;
    this.player = 0;
    this.board = new Board();
  }

  /*
    Makes a move
    ------------
    Although a bit messy, this function is straightforward.
      1.) If there is a current subboard we are forced to play on, use that.
      2.) Make the move and track the result.
        a.) If the board is complete, remove that from the list of legal subboards we can play on
        b.) If the board was won by a player, track that on the larger board
      3.) Invert the player
      4.) Update the current subboard we have to play on
        a.) Create a mask that represents the bit we want to check in legalBoards
        b.) If that bit is a 1, that means the board is legal and we are forced to play on it next move
        c.) Otherwise the board is illegal and so we can play on any other legal subboard.
  */
  move(s, i) {
    s = this.subboard || s;
    let p = this.player;
    let r1 = this.subboards[s].move(i, p);
    if (r1) {
      if (r1 == 1) {
        this.board.move(s, p);
      }
      this.legalBoards = this.legalBoards & ~(0b1 << s);
    }
    this.player = 1 - this.player;
    let mask = 0b1 << i;
    this.subboard = (this.legalBoards & mask) == mask ? i : null;
  }

  /*
    Evaluates the current position
    ------------------------------
    The return value is the sum of the evaluations of all of the positions subboards,
    with a high weight placed on the main board.
  */
  score() {
    let score = 0;

    for (let i = 0; i < 9; i++) {
      score += this.subboards[i].score();
    }

    score += this.board.score() * 10;
    return score;
  }

  /*
    Checks the legality of a move
    -----------------------------
    1.) Check if the subboard is not legal
    2.) Checks if that index on that subboard is not empty
    If either is true, returns false.
    Otherwise returns true.
  */
  canPlay(s, i) {
    if ((this.legalBoards & (0b1 << s)) == 0) {
      return false;
    }
    if (!this.subboards[s].canPlay(i)) {
      return false;
    }
    return true;
  }

  /*
    Gets a list of all legal moves in a position
    --------------------------------------------
    For every potential subboard (limited to the current subboard if there is one),
    checks every position on that subboard and adds it to the list of legal moves
    if that move is legal
  */
  getLegalMoves() {
    let moves = [];
    let start = this.subboard != null ? this.subboard : 0;
    let end = this.subboard != null ? this.subboard + 1 : 9;

    for (let s = start; s < end; s++) {
      for (let i = 0; i < 9; i++) {
        if (this.canPlay(s, i)) {
          moves.push([s, i]);
        }
      }
    }

    return moves;
  }

  hash() {
    return hash(this);
  }
}

export default Position;

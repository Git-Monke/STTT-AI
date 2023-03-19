const WIN_CONDITIONS = [
  0b111000000, 0b000111000, 0b000000111, 0b100100100, 0b010010010, 0b001001001,
  0b100010001, 0b001010100,
];

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
    this.boards = [0b000000000, 0b000000000];
  }

  moveWins(i, p) {
    let board = this.boards[p] & (0b1 << i);
    return this.checkWin(board);
  }

  canPlay(i) {
    let mask = this.boards[0] | this.boards[1];
    return (mask & (0b1 << i)) == 0;
  }

  move(i, p) {
    this.boards[p] = this.boards[p] | (0b1 << i);
    return this.checkWin(this.boards[p]);
  }

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

class Position {
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

  score() {
    let score = 0;

    for (let i = 0; i < 9; i++) {
      score += this.subboards[i].score();
    }

    score += this.board.score() * 10;
    return score;
  }
}

let P = new Position();
let iters = 1_000_000;
let start = performance.now();
console.profile();
for (let i = 0; i < iters; i++) {
  P.score();
}
console.profileEnd();
let time = performance.now() - start;
console.log(`${(time / iters) * 1_000_000}ns per move`);

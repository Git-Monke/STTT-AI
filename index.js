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

function random64Bit() {
  return BigInt(Math.floor(Math.random() * 2 ** 64));
}

function bitPair64() {
  return [random64Bit(), random64Bit()];
}

// Contains 164 randomized 64 bit numbers
// Each tile on the board gets 2 random 64 bit numbers, one for each player
// Then there are 2 more that represent whose turn it is to play
const zobristKeys = {
  boards: Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => bitPair64())
  ),
  player: bitPair64(),
};

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

  canPlay(s, i) {
    if ((this.legalBoards & (0b1 << s)) == 0) {
      return false;
    }
    if (!this.subboards[s].canPlay(i)) {
      return false;
    }
    return true;
  }

  getLegalMoves() {
    let moves = [];
    let start = this.subboard != null ? P.subboard : 0;
    let end = this.subboard != null ? P.subboard + 1 : 9;

    for (let s = start; s < end; s++) {
      for (let i = 0; i < 9; i++) {
        if (P.canPlay(s, i)) {
          moves.push([s, i]);
        }
      }
    }

    return moves;
  }
}

// 0 maximizing, 1 minimizing
function minimax(P, depth, alpha = -Infinity, beta = Infinity) {
  let board = P.board;
  let player = P.player;

  // Check for a win
  if (board.checkWin(board.boards[player])) {
    let sign = player == 1 ? -1 : 1;
    return 1_000_000 * sign;
  }

  // Check for a draw
  if (board.legalBoards == 0) {
    return 0;
  }

  // Check if the max search depth has been reached
  if (depth == 0) {
    return P.score();
  }

  let bestScore = player == 0 ? -Infinity : Infinity;
  let start = P.subboard != null ? P.subboard : 0;
  let end = P.subboard != null ? P.subboard + 1 : 9;

  for (let s = start; s < end; s++) {
    let subboard = P.subboards[s];

    for (let i = 0; i < 9; i++) {
      if (!subboard.canPlay(i)) {
        continue;
      }

      let P2 = new Position(P);
      P2.move(s, i);

      let score = minimax(P2, depth - 1, alpha, beta);

      if (player == 0) {
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(bestScore, alpha);
      } else {
        bestScore = Math.min(score, bestScore);
        beta = Math.min(bestScore, beta);
      }

      if (beta <= alpha) {
        break;
      }
    }
  }

  return bestScore;
}

function solve(P, depth) {
  let moves = P.getLegalMoves();
  let player = P.player;

  let bestScore = player == 0 ? -Infinity : Infinity;
  let bestMove = null;

  for (let i = 0; i < moves.length; i++) {
    let move = moves[i];
    let P2 = new Position(P);
    P2.move(move[0], move[1]);
    let score = minimax(P2, depth - 1);

    if (
      (player == 0 && score > bestScore) ||
      (player == 1 && score < bestScore)
    ) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function hash(P) {
  let hash = BigInt(0);

  for (let s = 0; s < 9; s++) {
    for (let i = 0; i < 9; i++) {
      let boards = P.subboards[s].boards;
      let m = 0b1 << i;
      if ((boards[0] & m) == m) {
        hash ^= zobristKeys.boards[s][i][0];
      } else if ((boards[1] & m) == m) {
        hash ^= zobristKeys.boards[s][i][1];
      }
    }
  }

  hash ^= zobristKeys.player[P.player];

  return hash;
}

// const container = document.getElementById("container");

let depth = 8;
let P = new Position();

for (let s = 0; s < 9; s++) {
  let newSub = document.createElement("div");
  newSub.classList.add("subboard");

  for (let i = 0; i < 9; i++) {
    let newTile = document.createElement("div");
    newTile.classList.add("tile");
    newTile.id = s * 9 + i;

    newTile.addEventListener("click", (_) => {
      let s = Math.floor(newTile.id / 9);
      let i = newTile.id % 9;

      newTile.classList.add("tile--red");
      P.move(s, i);
      console.log(hash(P));
      let move = solve(P, depth);
      document
        .getElementById(move[0] * 9 + move[1])
        .classList.add("tile--blue");
      P.move(move[0], move[1]);
      console.log(hash(P));
    });

    newSub.appendChild(newTile);
  }

  container.appendChild(newSub);
}

// P.move(4, 4);
// let start = performance.now();
// console.log(solve(P, depth));
// let end = performance.now();
// let time = end - start;
// console.log(`Depth ${depth}: ${time.toFixed(2)}ms`);
// console.log(`${n} nodes evaluted`);
// console.log(`${((n / time) * 1000).toFixed()} nodes per second`);

// let iters = 1_000_000;
// let start = performance.now();
// console.profile();
// for (let i = 0; i < iters; i++) {
//   hash(P);
// }
// console.profileEnd();
// let time = performance.now() - start;
// console.log(`${(time / iters) * 1_000_000}ns per hash`);

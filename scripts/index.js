import Position from "./position.js";
import { TranspositionTable, hash } from "./transposition.js";

/*
  Scores a position based on the best outcome for a given player
  --------------------------------------------------------------
  Fairy straightforward implementation of the minimax algorithm with alpha beta pruning.
  The idea is that the value of a node is equal to the best possible outcome for a player if both players
  play perfectly. This means that player X will always choose the move with the highest value, and player O
  will always choose the move with the lowest value. Optimized by storing the upper bound for X and the lower
  bound for O (alpha and beta), and not evaluating branches in which the lower bound is greater than the upper bound
  (as this means the move will never be better for X and so will never be played).

  1.) Check if the current position is terminal, or if we have reached the maximum search depth
    a.) If we have, then return the score of the current position
  2.) Otherwise, set the best score to be the worst possible value based on which player we are evalutating as
  3.) For every potential move, recursively run the minimax function on that node until we recieve a numerical evaluation.
  4.) Update the best score based on that value
    a.) If player X, set the best score to be the maximum of the current best score and the node we just evaluted
    b.) If player O, set the best score to be the minimum of the current best score and the node we just evaluted
  5.) Update alpha/beta values
    a.) If player X, set alpha to be the maximum of the current alpha and the best score
    b.) If player O, set the beta to be the minimum of the current beta and the best score
  6.) If beta is less than alpha, break out of the loop
  7.) Return the best score.
*/
function minimax(P, depth, alpha = -Infinity, beta = Infinity) {
  let board = P.board;
  let player = P.player;

  if (board.checkWin(board.boards[player])) {
    let sign = player == 1 ? -1 : 1;
    return 1_000_000 * sign;
  }

  if (board.legalBoards == 0) {
    return 0;
  }

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

/*
  Finds the best move in a given position up to a certain depth
  -------------------------------------------------------------
  All this function does is runs the minimax function on every move,
  and returns whichever move has the greatest value.
*/
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

const DEPTH = 8;
let P = new Position();
// I chose 10,000,19 because it's the closest prime to 10,000,000. Why 10,000,000? Just felt right.
let table = new TranspositionTable(10_000_019);

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
      console.log(hash(P).toString(2));
      let move = solve(P, DEPTH, 1000);
      document
        .getElementById(move[0] * 9 + move[1])
        .classList.add("tile--blue");
      P.move(move[0], move[1]);
      console.log(table);
    });

    newSub.appendChild(newTile);
  }

  container.appendChild(newSub);
}

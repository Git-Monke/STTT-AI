/*
    Generates a random 64 bit number by combining two 32 bit numbers.
    The reason for this being that Math.random() returns a random 56 bit number (the JavaScript maximum safe integer limit)
    So just doing Math.floor(Math.random() * 2 ** 64) isn't precise enough.
*/
function random64Bit() {
  let lo = Math.floor(Math.random() * 2 ** 32);
  let hi = Math.floor(Math.random() * 2 ** 32);
  return (BigInt(hi) << 32n) | BigInt(lo);
}

function bitPair64() {
  return [random64Bit(), random64Bit()];
}

/*
    These keys are used to generate almost-unique hashes for board positions
    zobristKeys contains 164 pre-calculated random 64 bit numbers
    2 for each tile on the board, one for each player that can occupy the tile
    2 more for whose turn it is
*/
const zobristKeys = {
  boards: Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => bitPair64())
  ),
  player: bitPair64(),
};

/*
    Produces an almost unique hash for a position
    ---------------------------------------------
    Writing a hashing function ended up being easier than I thought it would be 
    once I was able to grind through the wikipedia explanation of zobrist hashing.
    
    My hashing function is just the XOR sum of every tiles corrosponding value in the zobrist keys table,
    XOR'd with the player whose turn it is to play (also retrived from the zobrist keys).
*/
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

class TranspositionTable {
  constructor(size) {
    this.size = BigInt(size);
    this.table = {};
  }

  /*
    Returns a keys index in the transposition table
    -----------------------------------------------
    This is used to limit the amount of memory used by the table.
    The modulus operator ensures keys will stay within the range of the size of the table. If they
    go over the size of the table the remainer will loop back to 0 and increment from there until it
    once again becomes a divisor of the size of the table.
    Having a prime number for the size of the table is best in this case to reduce collisions as much as possible.
  */
  index(key) {
    return key % this.size;
  }

  get(key) {
    let i = this.index(key);
    if (this.table[i] && this.table[i].key == key) {
      return this.table[i].value;
    } else {
      return null;
    }
  }

  put(key, value) {
    let i = this.index(key);

    this.table[i] = {
      key: key,
      value: value,
    };
  }
}

export { TranspositionTable, hash };

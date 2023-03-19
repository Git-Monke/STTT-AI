const WIN_CONDITIONS = [
    0b111000000,
    0b000111000,
    0b000000111,
    0b100100100,
    0b010010010,
    0b001001001,
    0b100010001,
    0b001010100
]

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
        this.boards = [
            0b000000000,
            0b000000000
        ]
    }

    moveWins(i, p) {
        let board = this.boards[p] & 0b1 << i;
        return this.checkWin(board);
    }

    canPlay(i) {
        let mask = this.boards[0] | this.boards[1];
        return (mask & (0b1 << i)) == 0;
    }

    move(i, p) {
        this.boards[p] = this.boards[p] | 0b1 << i;
    }

    score() {
        let score = 0;

        for (let i = 0; i < 8; i++) {
            let x = bitcount(this.boards[0] & WIN_CONDITIONS[i]);
            let o = -bitcount(this.boards[1] & WIN_CONDITIONS[i]);
            let s = o + x;

            if (s == 0) { continue }
            
            score += (10 ** (Math.abs(s) - 1)) * (s < 0 ? -1 : 1)
        }

        return score;
    }

    checkWin(board) {
        for (let i = 0; i < 8; i++) {
            let condition = WIN_CONDITIONS[i];
            if ((board & condition) == condition) { return true }
        }

        return false;
    }
}
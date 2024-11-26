## Strategic Tic Tac Toe AI

**Please start by looking at scripts/index.js, as this is where the actual minimax is. Then move to board.js, as this is the most clever part of my solutionn! It can check for wins with only 8 binary and 8 equality comparisons!**

This is the code for the AI for strategic tic tac toe. This was a project that we had to do for CART 2022-2023. My partner made the frontend of the website, while I worked on the AI. 

I wrote a basic minimax algorithm with alpha-beta pruning for this. Pretty standard for this kind of AI. I optimized it by using a clever solution with bitboards for insanely fast operations, getting the AI to eventually evaluate hundreds of thousands of positions per second in the browser.

I tried to implement zobrist keys and hashing to optimize further, but this unfortunately didn't improve the speed of the bot, so that code is not included in the final solution.

You can play STTT [here](https://tictactoe2-0.netlify.app/)
Make sure to set player 2 to AI.
Thanks!

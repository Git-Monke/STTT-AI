## Strategic Tic Tac Toe AI


This is the code for the AI for strategic tic tac toe. This was a project that we had to do for CART 2022-2023. My partner made the frontend website, while I worked on the AI. 

I a basic minimax algorithm with alpha-beta pruning for this. Pretty standard for this kind of AI. I optimized it by using a clever solution with bitboard for insanely fast operations, getting the AI to eventually evlaute hundreds of thousands of positions per second.
I had to get the AI to work entirely on the browser, so I was extremely limited in terms of the how much I could optimize the bot and make use of the powers of a computer. But I did my best. 
I tried to implement zobrist keys and hashing to optimize further, but this unfortunately didn't improve the speed of the bot, so that code is not included in the final repository.
I made this in a weekend.

You can play STTT [here](https://tictactoe2-0.netlify.app/)
Make sure to set player 2 to AI.

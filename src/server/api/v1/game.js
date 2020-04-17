/* Copyright G. Hemingway, 2020 - All rights reserved */
"use strict";

const Joi = require("@hapi/joi");
const {
  initialState,
  shuffleCards,
  filterGameForProfile,
  filterMoveForResults
} = require("../../solitaire");

let toNumber = (value) => {
  if(value == "ace"){
    return 1;
  }
  if(value == "jack"){
    return 11;
  }
  if(value == "queen"){
    return 12;
  }
  if(value == "king"){
    return 13;
  }
  return parseInt(value);
}


let validateMove = (game, requestedMove) => {
  /* return error or new state */
  //move card from draw
  if(requestedMove.src == "draw"){
    console.log("source is draw");
    //const oldState = game.state;
    //reset draw pile if empty
    if(game.state.draw.length == 0){
      console.log("draw is empty");
      let newState = game.state;
      newState.draw = game.state.discard.reverse();
      for(let i = 0; i < newState.draw.length; ++i){
        newState.draw[i].up = false;
      }
      newState.discard = [];
      return {state: newState};
    }
    //draw card if not empty
    else{
      const oldState = game.state;
      const drawCount = game.drawCount;
      const newDraw = oldState.draw.slice(0, oldState.draw.length - drawCount);
      let newDiscard = oldState.discard;
      let drawCards = oldState.draw.slice(oldState.draw.length - drawCount);
      for(var i = 0; i < drawCards.length; ++i){
        drawCards[i].up = true;
        //console.log(drawCards[i]);
        newDiscard.push(drawCards[i]);
      }
      console.log(newDiscard);
      const newState = {
        pile1: oldState.pile1,
        pile2: oldState.pile2,
        pile3: oldState.pile3,
        pile4: oldState.pile4,
        pile5: oldState.pile5,
        pile6: oldState.pile6,
        pile7: oldState.pile7,
        stack1: oldState.stack1,
        stack2: oldState.stack2,
        stack3: oldState.stack3,
        stack4: oldState.stack4,
        draw: newDraw,
        discard: newDiscard,
      }
      return {state: newState};
    }
  }

  //move card from discard
  if(requestedMove.src == "discard"){
    console.log("source is discard");
    //to stack
    if(requestedMove.dst == "stack1" 
      || requestedMove.dst == "stack2" 
      || requestedMove.dst == "stack3" 
      || requestedMove.dst == "stack4"){
      const dstStack = game.state[requestedMove.dst];
      //to empty stack
      if(dstStack.length == 0){
        if(requestedMove.cards[0].value == "ace"){
          let newState = game.state;
          newState[requestedMove.dst].push(requestedMove.cards[0]);
          newState.discard = newState.discard.slice(0, newState.discard.length - 1);
          return {state: newState};
        }
        else{
          console.log(`can't move ${requestedMove.cards[0].suit}_${requestedMove.cards[0].value} to an empty ${requestedMove.dst}`);
          return {error: `can't move ${requestedMove.cards[0].suit}_${requestedMove.cards[0].value} to an empty ${requestedMove.dst}`};
        }
      }
      //to nonempty stack
      else{
        const targetCard = dstStack[dstStack.length - 1];
        const cardToMove = requestedMove.cards[0];
        if(targetCard.suit == cardToMove.suit && toNumber(targetCard.value) + 1 == toNumber(cardToMove.value)){
          let newState = game.state;
          newState[requestedMove.dst].push(cardToMove);
          newState.discard = newState.discard.slice(0, newState.discard.length - 1);
          return {state: newState};
        }
        else{
          console.log(`can't move ${requestedMove.cards[0].suit}_${requestedMove.cards[0].value} to ${requestedMove.dst}`);
          return {error: `can't move ${requestedMove.cards[0].suit}_${requestedMove.cards[0].value} to ${requestedMove.dst}`};
        }
      }
    }
    //to pile
    else if(requestedMove.dst == "pile1" 
      || requestedMove.dst == "pile2" 
      || requestedMove.dst == "pile3" 
      || requestedMove.dst == "pile4" 
      || requestedMove.dst == "pile5"
      || requestedMove.dst == "pile6"
      || requestedMove.dst == "pile7"){
        console.log("Moving to pile");
        const topCard = requestedMove.cards[0];
        const dstPile = game.state[requestedMove.dst];
        if(dstPile.length == 0){
          if(topCard.value = "king"){
            let newState = game.state;
            newState[requestedMove.dst].push(topCard);
            newState.discard = newState.discard.slice(0, newState.discard.length - 1);
            return {state: newState};
          }
          else{
            console.log(`can't move ${requestedMove.cards[0].suit}_${requestedMove.cards[0].value} to an empty ${requestedMove.dst}`);
            return {error: `can't move ${requestedMove.cards[0].suit}_${requestedMove.cards[0].value} to an empty ${requestedMove.dst}`}
          }
        }
        const bottomCard = dstPile[dstPile.length - 1];
        //check top is 1 larger than bottom
        if(toNumber(topCard.value) == toNumber(bottomCard.value) - 1){
          //check color
          if(topCard.suit == "diamonds" || topCard.suit == "hearts"){
            if(bottomCard.suit == "spades" || bottomCard.suit == "clubs"){
              let newState = game.state;
              newState.discard = newState.discard.slice(0, newState.discard.length - 1);
              newState[requestedMove.dst].push(topCard);
              //console.log(newState);
              return {state: newState};
            }
            else{
              console.log(`invalid move from ${requestedMove.src} to ${requestedMove.dst}. Reason: ${topCard} same color with ${bottomCard}`);
              return {error: `invalid move from ${requestedMove.src} to ${requestedMove.dst}. Reason: ${topCard} same color with ${bottomCard}`};
            }
          }
          //check color
          if(topCard.suit == "spades" || topCard.suit == "clubs"){
            if(bottomCard.suit == "diamonds" || bottomCard.suit == "hearts"){
              let newState = game.state;
              newState.discard = newState.discard.slice(0, newState.discard.length - 1);
              newState[requestedMove.dst].push(topCard);
              //console.log(newState);
              return {state: newState};
            }
            else{
              return {error: `invalid move from ${requestedMove.src} to ${requestedMove.dst}. Reason: ${topCard} same color with ${bottomCard}`};
            }
          }
        }
        else{
          console.log(`invalid move from ${requestedMove.src} to ${requestedMove.dst}. Reason: ${topCard.suit}_${topCard.value} not 1 less than ${bottomCard.suit}_${bottomCard.value}`);
          return {error: `invalid move from ${requestedMove.src} to ${requestedMove.dst}. Reason: ${topCard.suit}_${topCard.value} not 1 less than ${bottomCard.suit}_${bottomCard.value}`};
        }
    }
    else{
      return {error: `invalid move from ${requestedMove.src} to ${requestedMove.dst}. Reason: Not allowed`}
    }
  }

  //move card from pile
  if(requestedMove.src == "pile1"
    || requestedMove.src == "pile2"
    || requestedMove.src == "pile3"
    || requestedMove.src == "pile4"
    || requestedMove.src == "pile5"
    || requestedMove.src == "pile6"
    || requestedMove.src == "pile7"){
      //to pile
      if(requestedMove.dst == "pile1"
      || requestedMove.dst == "pile2"
      || requestedMove.dst == "pile3"
      || requestedMove.dst == "pile4"
      || requestedMove.dst == "pile5"
      || requestedMove.dst == "pile6"
      || requestedMove.dst == "pile7"){
        const srcPile = game.state[requestedMove.src];
        const dstPile = game.state[requestedMove.dst];
        const topCard = requestedMove.cards[0];
        if(!topCard.up){
          return {error: "can't move a faced-down card"};
        }

        //move one pile to an empty pile spot
        if(dstPile.length == 0){
          if(topCard.value == "king"){
            let newState = game.state;
            let startIndex;
            for(let i = 0; i < srcPile.length; ++i){
              //console.log(i, srcPile[i], topCard.suit, srcPile[i].suit == topCard.suit);
              if(srcPile[i].suit == topCard.suit && srcPile[i].value == topCard.value){
                startIndex = i;
              }
            }
            newState[requestedMove.src] = newState[requestedMove.src].slice(0, startIndex);
            if(newState[requestedMove.src].length > 0){
              newState[requestedMove.src][newState[requestedMove.src].length - 1].up = true;
            }
            for(let i = 0; i < requestedMove.cards.length; ++i){
              newState[requestedMove.dst].push(requestedMove.cards[i]);
            }
            return {state: newState};
          }
        }
        //move some cards to another pile with cards
        else{
          const bottomCard = dstPile[dstPile.length - 1];
          if(parseInt(toNumber(topCard.value)) == parseInt(toNumber(bottomCard.value) - 1)){
            if(topCard.suit == "diamonds" || topCard.suit == "hearts"){
              if(bottomCard.suit == "spades" || bottomCard.suit == "clubs"){
                let startIndex;
                for(let i = 0; i < srcPile.length; ++i){
                  //console.log(i, srcPile[i], topCard.suit, srcPile[i].suit == topCard.suit);
                  if(srcPile[i].suit == topCard.suit && srcPile[i].value == topCard.value){
                    startIndex = i;
                  }
                }
                let newState = game.state;
                newState[requestedMove.src] = newState[requestedMove.src].slice(0, startIndex);
                if(newState[requestedMove.src].length > 0){
                  newState[requestedMove.src][newState[requestedMove.src].length - 1].up = true;
                }
                for(let i = 0; i < requestedMove.cards.length; ++i){
                  newState[requestedMove.dst].push(requestedMove.cards[i]);
                }
                return {state: newState};
              }
              else{
                console.log(`invalid move from ${requestedMove.src} to ${requestedMove.dst}. Reason: ${topCard} same color with ${bottomCard}`);
                return {error: `invalid move from ${requestedMove.src} to ${requestedMove.dst}. Reason: ${topCard} same color with ${bottomCard}`};
              }
            }
            if(topCard.suit == "spades" || topCard.suit == "clubs"){
              if(bottomCard.suit == "diamonds" || bottomCard.suit == "hearts"){
                let startIndex;
                for(let i = 0; i < srcPile.length; ++i){
                  //console.log(i, srcPile[i], topCard.suit, srcPile[i].suit == topCard.suit);
                  if(srcPile[i].suit == topCard.suit && srcPile[i].value == topCard.value){
                    startIndex = i;
                  }
                }
                //console.log("starting index: ", startIndex);
                let newState = game.state;
                newState[requestedMove.src] = newState[requestedMove.src].slice(0, startIndex);
                if(newState[requestedMove.src].length > 0){
                  newState[requestedMove.src][newState[requestedMove.src].length - 1].up = true;
                }
                for(let i = 0; i < requestedMove.cards.length; ++i){
                  newState[requestedMove.dst].push(requestedMove.cards[i]);
                }
                return {state: newState};
              }
              else{
                return {error: `invalid move from ${requestedMove.src} to ${requestedMove.dst}. Reason: ${topCard} same color with ${bottomCard}`};
              }
            }
          }
          else{
            console.log(`invalid move from ${requestedMove.src} to ${requestedMove.dst}. Reason: ${topCard.suit}_${topCard.value} not 1 less than ${bottomCard.suit}_${bottomCard.value}`);
            return {error: `invalid move from ${requestedMove.src} to ${requestedMove.dst}. Reason: ${topCard.suit}_${topCard.value} not 1 less than ${bottomCard.suit}_${bottomCard.value}`};
          }
        }
      }

      //move card to stack
      if(requestedMove.dst == "stack1" 
      || requestedMove.dst == "stack2"
      || requestedMove.dst == "stack3"
      || requestedMove.dst == "stack4"){
        if(requestedMove.cards.length > 1){
          console.log("can't move more than 1 card to stack at a time");
          return {error: "can't move more than 1 card to stack at a time"};
        }
        else{
          const targetStack = game.state[requestedMove.dst];
          //to empty stack
          if(targetStack.length == 0){
            if(requestedMove.cards[0].value == "ace"){
              let newState = game.state;
              console.log(requestedMove.dst);
              newState[requestedMove.dst].push(requestedMove.cards[0]);
              newState[requestedMove.src] = newState[requestedMove.src].slice(0, newState[requestedMove.src].length - 1);
              if(newState[requestedMove.src].length > 0){
                newState[requestedMove.src][newState[requestedMove.src].length - 1].up = true;
              }
              console.log(`moving ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`);
              return {state: newState};
            }
            else{
              console.log(`can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`);
              return {error: `can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`};
            }
          }
          else if(targetStack.length > 0){  
            const targetCard = targetStack[targetStack.length - 1];
            const cardToMove = requestedMove.cards[0];
            if((targetCard.suit == cardToMove.suit) && ((parseInt(toNumber(targetCard.value))+1) == parseInt(toNumber(cardToMove.value)))){
                let newState = game.state;
                newState[requestedMove.dst].push(requestedMove.cards[0]);
                newState[requestedMove.src] = newState[requestedMove.src].slice(0, newState[requestedMove.src].length - 1);
                if(newState[requestedMove.src].length > 0){
                  newState[requestedMove.src][newState[requestedMove.src].length - 1].up = true;
                }
                console.log(`moving ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`);
                return {state: newState};
            }
            else{
              console.log(`can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`);
              return {error: `can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`}
            }
          }
        }
      }
  }

  //move card from stack
  if(requestedMove.src == "stack1" 
    || requestedMove.src == "stack2"
    || requestedMove.src == "stack3"
    || requestedMove.src == "stack4"){
      //to pile
      if(requestedMove.dst.includes("pile")){
        const dstPile = game.state[requestedMove.dst];
        const cardToMove = requestedMove.cards[0];
        //empty pile
        if(dstPile.length == 0){
          if(cardToMove.value == "king"){
            let newState = game.state;
            newState[requestedMove.dst].push(cardToMove);
            newState[requestedMove.src] = newState[requestedMove.src].slice(0, newState[requestedMove.src].length - 1);
            return {state: newState}
          }
          else{
            console.log(`can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to an empty ${requestedMove.dst}`);
            return {error: `can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to an empty ${requestedMove.dst}`}
          }
        }
        //nonempty pile
        else{
          const targetCard = dstPile[dstPile.length - 1];
          if(toNumber(cardToMove.value) + 1 == toNumber(targetCard.value)){
            if(targetCard.suit == "hearts" || targetCard.suit == "diamonds"){
              if(cardToMove.suit == "spades" || cardToMove.suit == "clubs"){
                let newState = game.state;
                newState[requestedMove.dst].push(cardToMove);
                newState[requestedMove.src] = newState[requestedMove.src].slice(0, newState[requestedMove.src].length - 1);
                return {state: newState};
              }
              else{
                console.log(`can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`);
                return {error: `can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`};
              }
            }
            else{
              if(cardToMove.suit == "hearts" || cardToMove.suit == "diamonds"){
                let newState = game.state;
                newState[requestedMove.dst].push(cardToMove);
                newState[requestedMove.src] = newState[requestedMove.src].slice(0, newState[requestedMove.src].length - 1);
                return {state: newState};
              }
              else{
                console.log(`can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`);
                return {error: `can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`};
              }
            }
          }
          else{
            console.log(`can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`);
            return {error: `can't move ${requestedMove.cards[0].value}_${requestedMove.cards[0].suit} to ${requestedMove.dst}`};
          }
        }
      }
  }
  return {error: "Not implemented"};
};

module.exports = app => {
  /**
   * Create a new game
   *
   * @param {req.body.game} Type of game to be played
   * @param {req.body.color} Color of cards
   * @param {req.body.draw} Number of cards to draw
   * @return {201 with { id: ID of new game }}
   */
  app.post("/v1/game", async (req, res) => {
    if (!req.session.user) {
      res.status(401).send({ error: "unauthorized" });
    } else {
      let data;
      try {
        // Validate user input
        let schema = Joi.object().keys({
          game: Joi.string()
            .lowercase()
            .required(),
          color: Joi.string()
            .lowercase()
            .required(),
          draw: Joi.any()
        });
        data = await schema.validateAsync(req.body);
      } catch (err) {
        const message = err.details[0].message;
        console.log(`Game.create validation failure: ${message}`);
        return res.status(400).send({ error: message });
      }

      // Set up the new game
      try {
        let newGame = {
          owner: req.session.user._id,
          active: true,
          cards_remaining: 52,
          color: data.color,
          game: data.game,
          score: 0,
          start: Date.now(),
          winner: "",
          state: []
        };
        switch (data.draw) {
          case "Draw 1":
            newGame.drawCount = 1;
            break;
          case "Draw 3":
            newGame.drawCount = 3;
            break;
          default:
            newGame.drawCount = 1;
        }
        // Generate a new initial game state
        newGame.state = initialState();
        let game = new app.models.Game(newGame);
        await game.save();
        const query = { $push: { games: game._id } };
        // Save game to user's document too
        await app.models.User.findByIdAndUpdate(req.session.user._id, query);
        res.status(201).send({ id: game._id });
      } catch (err) {
        console.log(`Game.create save failure: ${err}`);
        res.status(400).send({ error: "failure creating game" });
        // Much more error management needs to happen here
      }
    }
  });

  /**
   * Fetch game information
   *
   * @param (req.params.id} Id of game to fetch
   * @return {200} Game information
   */
  app.get("/v1/game/:id", async (req, res) => {
    try {
      let game = await app.models.Game.findById(req.params.id);
      if (!game) {
        res.status(404).send({ error: `unknown game: ${req.params.id}` });
      } else {
        const state = game.state.toJSON();
        let results = filterGameForProfile(game);
        results.start = Date.parse(results.start);
        results.cards_remaining =
          52 -
          (state.stack1.length +
            state.stack2.length +
            state.stack3.length +
            state.stack4.length);
        // Do we need to grab the moves
        if (req.query.moves === "") {
          const moves = await app.models.Move.find({ game: req.params.id });
          state.moves = moves.map(move => filterMoveForResults(move));
        }
        res.status(200).send(Object.assign({}, results, state));
      }
    } catch (err) {
      console.log(`Game.get failure: ${err}`);
      res.status(404).send({ error: `unknown game: ${req.params.id}` });
    }
  });

  app.put("/v1/game/:id", async (req, res) => {
    try {
      let game = await app.models.Game.findById(req.params.id);
      if (!game) {
        console.log("can't find game: ", req.params.id);
        res.status(404).send({ error: `unknown game: ${req.params.id}` });
      } else {
        console.log(game);
        if(req.session.user){
          if(game.owner == req.session.user._id){
            const result = validateMove(game.toJSON(), req.body);
            if(!result.error){
              console.log("Validation passed", req.body.cards);
              //update DB
              let newMove = {
                user: game.owner,
                game: game._id,
                cards: req.body.cards,
                src: req.body.src,
                dst: req.body.dst,
                date: Date.now(),
              }
              let move = new app.models.Move(newMove);
              try{
                await move.save();
              }
              catch(e){
                console.log("error saving move: ", e);
                //res.status(400).send({error: "error saving moves"});
              }
              const newState = result.state;
              const newMoveNum = game.moves + 1;
              try{
                //calculate score
                let newScore = game.score;
                if(req.body.src == "discard" && req.body.dst.includes("pile")){
                  newScore = game.score + 5;
                }
                if(req.body.src == "discard" && req.body.dst.includes("stack")){
                  newScore = game.score + 10;
                }
                if(req.body.src.includes("pile") && req.body.dst.includes("stack")){
                  newScore = game.score + 10;
                }
                if(req.body.src == "draw" && result.state.discard.length == 0){
                  newScore = game.score - 100;
                }
                if(req.body.src.includes("stack") && req.body.dst.includes("pile")){
                  newScore = game.score - 15;
                }
                newScore = newScore < 0 ? 0 : newScore;
                //check if game is won
                if(newState.stack1.length == 13 && newState.stack2.length == 13
                  && newState.stack3.length == 13 && newState.stack4.length == 13){
                    await app.models.Game.findByIdAndUpdate(game._id, {$set: {moves: newMoveNum, won: true, active: false, score: newScore, state: newState}});
                }
                else{
                  await app.models.Game.findByIdAndUpdate(game._id, {$set: {moves: newMoveNum, won: false, active: true, score: newScore, state: newState}});
                }
                res.status(200).send(result.state);
              }
              catch(e){
                console.log("error updating state");
                res.status(400).send({error: "error updating state"});
              }
            }
            else{
              console.log("Validation failed");
              res.status(400).send(result.error);
            }
          }
          else{
            console.log("unauthorized");
            res.status(401).send({error: "authorized"});
          }
        }
        else{
          console.log("unauthorized");
          res.status(401).send({error: "authorized"});
        }
      }
    } catch (err) {
      console.log(`Game.get failure: ${err}`);
      res.status(404).send({ error: `unknown game: ${req.params.id}` });
    }
  });

  // Provide end-point to request shuffled deck of cards and initial state - for testing
  app.get("/v1/cards/shuffle", (req, res) => {
    res.send(shuffleCards(false));
  });
  app.get("/v1/cards/initial", (req, res) => {
    res.send(initialState());
  });
};

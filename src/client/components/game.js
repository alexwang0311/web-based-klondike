/* Copyright G. Hemingway, @2020 - All rights reserved */
'use strict';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Pile } from './pile';
import styled from 'styled-components';
import $ from "jquery";

const CardRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2em;
`;

const CardRowGap = styled.div`
  flex-grow: 2;
`;

const GameBase = styled.div`
  grid-row: 2;
  grid-column: sb / main;
`;

export const Game = ({ match }) => {
  let [state, setState] = useState({
    pile1: [],
    pile2: [],
    pile3: [],
    pile4: [],
    pile5: [],
    pile6: [],
    pile7: [],
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
    draw: [],
    discard: []
  });
  let [target, setTarget] = useState(undefined);
  let [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const getGameState = async () => {
      const response = await fetch(`/v1/game/${match.params.id}`);
      const data = await response.json();
      setState({
        pile1: data.pile1,
        pile2: data.pile2,
        pile3: data.pile3,
        pile4: data.pile4,
        pile5: data.pile5,
        pile6: data.pile6,
        pile7: data.pile7,
        stack1: data.stack1,
        stack2: data.stack2,
        stack3: data.stack3,
        stack4: data.stack4,
        draw: data.draw,
        discard: data.discard
      });
    };
    getGameState();
  }, [match.params.id]);

  const onClick = ev => {
    ev.stopPropagation();
    let selected = ev.target;
    //if no target
    if(!target){
      //draw cards if first click on draw pile
      if(selected.id.split(":")[0] == "draw"){
        console.log("Draw pile clicked");
        const req = {
          cards: [],
          src: "draw",
          dst: "discard",
        }
        console.log(req);
        $.ajax({
          url: `/v1/game/${match.params.id}`,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify(req),
          success: (data) => {
            //console.log(data);
            setState({
              pile1: data.pile1,
              pile2: data.pile2,
              pile3: data.pile3,
              pile4: data.pile4,
              pile5: data.pile5,
              pile6: data.pile6,
              pile7: data.pile7,
              stack1: data.stack1,
              stack2: data.stack2,
              stack3: data.stack3,
              stack4: data.stack4,
              draw: data.draw,
              discard: data.discard,
            });
          },
          error: (xhr) => {
            console.log(xhr.responseText);
          }
        });
      }
      //set target
      else{
        console.log("First click:", selected);
        setTarget(selected);
      }
    }
    //set destination
    else{
      //console.log("Target: ", target, "Des: ", selected);
      const targetId = target.id.split(":");
      const desId = selected.id.split(":");
      const cardList = state[targetId[0]].slice(targetId[3]);
      //console.log(state[targetId[0]], cardList);
      const req = {
        cards: cardList,
        src: targetId[0],
        dst: desId[0],
      }
      console.log(req);
      $.ajax({
        url: `/v1/game/${match.params.id}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(req),
        success: (data) => {
          //console.log(data);
          setState({
            pile1: data.pile1,
            pile2: data.pile2,
            pile3: data.pile3,
            pile4: data.pile4,
            pile5: data.pile5,
            pile6: data.pile6,
            pile7: data.pile7,
            stack1: data.stack1,
            stack2: data.stack2,
            stack3: data.stack3,
            stack4: data.stack4,
            draw: data.draw,
            discard: data.discard,
          });
        },
        error: (xhr) => {
          console.log(xhr.responseText);
        },
      });
      setTarget(undefined);
    }
  };

  const onClickPile = ev => {
    //console.log(ev);
    const selected = ev.target;
    if(selected.id == "draw"){
      console.log("Empty draw pile clicked");
      const req = {
        cards: [],
        src: "draw",
        dst: "discard",
      }
      console.log(req);
      $.ajax({
        url: `/v1/game/${match.params.id}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(req),
        success: (data) => {
          //console.log(data);
          setState({
          pile1: data.pile1,
          pile2: data.pile2,
          pile3: data.pile3,
          pile4: data.pile4,
          pile5: data.pile5,
          pile6: data.pile6,
          pile7: data.pile7,
          stack1: data.stack1,
          stack2: data.stack2,
          stack3: data.stack3,
          stack4: data.stack4,
          draw: data.draw,
          discard: data.discard,
          });
        },
        error: (xhr) => {
          console.log(xhr.responseText);
        }
      });
    }
    else if(target){
      console.log(`empty ${target.id} selected`);
      const targetId = target.id.split(":");
      const cardList = state[targetId[0]].slice(targetId[3]);
      const req = {
        cards: cardList,
        src: targetId[0],
        dst: selected.id,
      }
      console.log(req);
      $.ajax({
        url: `/v1/game/${match.params.id}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(req),
        success: (data) => {
          //console.log(data);
          setState({
          pile1: data.pile1,
          pile2: data.pile2,
          pile3: data.pile3,
          pile4: data.pile4,
          pile5: data.pile5,
          pile6: data.pile6,
          pile7: data.pile7,
          stack1: data.stack1,
          stack2: data.stack2,
          stack3: data.stack3,
          stack4: data.stack4,
          draw: data.draw,
          discard: data.discard,
          });
        },
        error: (xhr) => {
          console.log(xhr.responseText);
        }
      });
      setTarget(undefined);
    }
  }

  return (
    <GameBase onClick={()=>{console.log("Background clicked"); setTarget(undefined)}}>
      <CardRow>
        <Pile name="stack1" cards={state.stack1} spacing={0} onClick={onClick} onClickPile={onClickPile}/>
        <Pile name="stack2" cards={state.stack2} spacing={0} onClick={onClick} onClickPile={onClickPile}/>
        <Pile name="stack3" cards={state.stack3} spacing={0} onClick={onClick} onClickPile={onClickPile}/>
        <Pile name="stack4" cards={state.stack4} spacing={0} onClick={onClick} onClickPile={onClickPile}/>
        <CardRowGap />
        <Pile name="draw" cards={state.draw} spacing={0} onClick={onClick} onClickPile={onClickPile}/>
        <Pile name="discard" cards={state.discard} spacing={0} onClick={onClick} onClickPile={onClickPile}/>
      </CardRow>
      <CardRow>
        <Pile name="pile1" cards={state.pile1} onClick={onClick} onClickPile={onClickPile}/>
        <Pile name="pile2" cards={state.pile2} onClick={onClick} onClickPile={onClickPile}/>
        <Pile name="pile3" cards={state.pile3} onClick={onClick} onClickPile={onClickPile}/>
        <Pile name="pile4" cards={state.pile4} onClick={onClick} onClickPile={onClickPile}/>
        <Pile name="pile5" cards={state.pile5} onClick={onClick} onClickPile={onClickPile}/>
        <Pile name="pile6" cards={state.pile6} onClick={onClick} onClickPile={onClickPile}/>
        <Pile name="pile7" cards={state.pile7} onClick={onClick} onClickPile={onClickPile}/>
      </CardRow>
    </GameBase>
  );
};

Game.propTypes = {
  match: PropTypes.object.isRequired
};

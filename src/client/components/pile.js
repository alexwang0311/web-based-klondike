/* Copyright G. Hemingway, @2020 - All rights reserved */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const CardImg = styled.img`
  position: absolute;
  height: auto;
  width: 100%;
`;

export const Card = ({ index,parent, card, top, left, onClick }) => {
  const source = card.up
    ? `/images/${card.value}_of_${card.suit}.png`
    : '/images/face_down.jpg';
  const style = { left: `${left}%`, top: `${top}%` };
  const id = `${parent}:${card.suit}:${card.value}:${index}`;
  return <CardImg id={id} onClick={onClick} style={style} src={source} />;
};

const PileBase = styled.div`
  margin: 5px;
  position: relative;
  display: inline-block;
  border: dashed 2px #808080;
  border-radius: 5px;
  width: 12%;
`;

const PileFrame = styled.div`
  margin-top: 140%;
`;

export const Pile = ({ name, cards, spacing, horizontal, up, onClick, onClickPile }) => {
  const children = cards.map((card, i) => {
    const top = horizontal ? 0 : i * spacing;
    const left = horizontal ? i * spacing : 0;
    return (
      <Card
        parent={name}
        index={i}
        key={i}
        card={card}
        up={up}
        top={top}
        left={left}
        onClick={onClick}
      />
    );
  });
  return (
    <PileBase id={name} onClick={onClickPile}>
      <PileFrame/>
      {children}
    </PileBase>
  );
};

Pile.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func,
  horizontal: PropTypes.bool,
  spacing: PropTypes.number,
  maxCards: PropTypes.number,
  top: PropTypes.number,
  left: PropTypes.number
};
Pile.defaultProps = {
  horizontal: false, // Layout horizontal?
  spacing: 8, // In percent,
  cards: []
};

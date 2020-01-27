import {useReducer, useState} from 'react';

export type Tile = {
  hasClick: boolean,
  hasFlag: boolean,
  isMine: boolean,
  value: number
};

type BoardDifficulty<x, y, mines> = { x: x, y: y, mines: mines };
type Difficulty = BoardDifficulty<9, 9, 10> | BoardDifficulty<16, 16, 40> | BoardDifficulty<24, 24, 99>;
type Board<Difficulty> = {
  difficulty: Difficulty,
  tiles: Array<Array<Tile>>,
};

type State = {
  board: Board<Difficulty>,
  cache: Set<string>,
  didLose: boolean,
  didWin: boolean
};

type TileAction = { type: string, payload: {count?: number, x: number, y: number} };
type GameAction = { type: string, payload: null };
type DifficultyAction = { type: 'NEW_GAME', payload: Difficulty };

type Action = GameAction | TileAction | DifficultyAction;

export const easy: Difficulty = {x: 9, y: 9, mines: 10};
export const medium: Difficulty = {x: 16, y: 16, mines: 40};
export const hard: Difficulty = {x: 24, y: 24, mines: 99};

const dCoords = [[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]];
function buildBoard(difficulty: Difficulty) {
  let mines = difficulty.mines;
  return {
    difficulty,
    tiles: Array.from({length: difficulty.x * difficulty.y}, () => (
      {
        hasClick: false,
        hasFlag: false,
        isMine: mines-- > 0,
        value: 0
      }
    )).reduce((_, _tile, i, arr) => {
      const j = Math.floor(Math.random()*difficulty.x*difficulty.y);
      [arr[j], arr[i]] = [arr[i], arr[j]];
      return arr;
    }, []).reduce(([head, ...tail], tile) => {
      return head.length < difficulty.x ? [[tile, ...head], ...tail] : [[tile], head, ...tail]
    }, [[]])
  };
}


const reducer = (state: State, action: Action): State => {
  const {type, payload} = action;
  switch(type) {
    case 'VISIT_TILE':
      // var {count, x, y} = payload;
      const visitedBoard = [...state.board.tiles];
      visitedBoard[payload.x] = [...state.board.tiles[payload.x]];
      visitedBoard[payload.x][payload.y] = {...state.board.tiles[payload.x][payload.y], hasClick: true, value: payload.count};
      return {...state, board: {...state.board, tiles: visitedBoard}};
    case 'ADD_FLAG':
      const temp = [...state.board.tiles];
      temp[payload.x] = [...state.board.tiles[payload.x]];
      temp[payload.x][payload.y] = {...state.board.tiles[payload.x][payload.y], hasFlag: !state.board.tiles[payload.x][payload.y].hasFlag};
      return {...state, board: {...state.board, tiles: temp}};
    case 'GAME_OVER':
      return {...state, didLose: true};
    case 'GAME_WON':
      return {...state, didWin: true};
    case 'NEW_GAME':
      return init(payload);
    default:
      return state;
  }
};

function init(difficulty: Difficulty) {
  return {
    board: buildBoard(difficulty),
    cache: new Set(''),
    mineCount: 0,
    didLose: false,
    didWin: false,
  };
}

export default function useMinesweeperReducer() {
  const [state, dispatch] = useReducer(reducer, easy, init);

  function leftClickAction(x: number, y: number) {
    const coord = `${x}-${y}`;
    if (state.cache.has(coord) || !state.board.tiles[x] || !state.board.tiles[x][y]) {
      return;
    }
    state.cache.add(coord); // yeah, yeah, i know...
    if (state.board.tiles[x][y].isMine) {
      return dispatch({type: 'GAME_OVER', payload: {x, y, count: undefined}});
    }
    let count = 0;
    dCoords.forEach(([oX, oY]) => {
      const dx = oX + x;
      const dy = oY + y;
      if (state.board.tiles[dx] && state.board.tiles[dx][dy]) {
        count += state.board.tiles[dx][dy].isMine ? 1 : 0;
      }
    });
    if (count === 0) {
      dCoords.forEach(([oX, oY]) => leftClickAction(oX + x, oY + y));
    }
    if (!state.board.tiles[x][y].hasFlag) {
      dispatch({type: 'VISIT_TILE', payload: {x, y, count}});
    }
  }

  function checkGame() {
    const {mines, x, y} = state.board.difficulty;
    const discoveredTiles = state.board.tiles.reduce((s, c) => s + c.filter(t => t.hasClick).length, 0);
    if (discoveredTiles === x*y - mines) {
      dispatch({type: 'GAME_WON', payload: null});
    }
  }

  function rightClickAction(x: number, y: number) {
    dispatch({type: 'ADD_FLAG', payload: {x, y, count: undefined}});
  }

  function newGame(diff: Difficulty = state.board.difficulty) {
    dispatch({type: 'NEW_GAME', payload: diff});
  }

  return {state, actions: {checkGame, leftClickAction, rightClickAction, newGame}};
}

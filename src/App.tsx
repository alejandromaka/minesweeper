import * as React from 'react';
import useMinesweeperReducer, {Tile, easy, medium, hard} from './reducerHook';
import TileView from './Tile';
import Time from './Time';
const styles = require('./App.scss');

const App = () => {
  const {state, actions} = useMinesweeperReducer();
  console.log(state)
  React.useEffect(() => !state.didWin ? actions.checkGame() : undefined);
  const mineCount = state.board.tiles.filter(row => row.filter(tile => tile.isMine && tile.hasClick).length);
  console.log(mineCount)
  return (
    <>
      <nav className={styles.menu}>
        <button className={styles.button} onClick={() => actions.newGame(easy)}>Easy</button>
        <button className={styles.button} onClick={() => actions.newGame(medium)}>Medium</button>
        <button className={styles.button} onClick={() => actions.newGame(hard)}>Hard</button>
      </nav>
      <main>
        <header className={styles.header}>
          <Time />
          <button onClick={_e => actions.newGame()} className={styles.gameButton}>{state.didLose ? '😵' : (state.didWin ? '😎' : '🙂')}</button>
          <div className={styles.sides}>{`${mineCount.length}`.padStart(3, '0')}</div>
        </header>
        <section className={styles.board}>
          {state.board.tiles.map((row: Array<Tile>, i: number) => {
            return (
              <div key={i}>
                {row.map((tile: Tile, j: number) => (
                  <TileView
                    key={`${i}-${j}`}
                    didLose={state.didLose}
                    tile={tile}
                    onLeftClick={() => {
                      actions.leftClickAction(i, j);
                    }}
                    onRightClick={(e) => {
                      e.preventDefault();
                      actions.rightClickAction(i, j);
                    }}
                  />
                ))}
              </div>
            )
          })}
        </section>
      </main>
    </>
  );
}

export default App;

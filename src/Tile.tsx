import * as React from 'react';
import {useReducer} from 'react';
import classnames from 'classnames';
import {Tile} from './reducerHook';
const styles = require('./Tile.scss');

type Props = {
  didLose: boolean,
  tile: Tile,
  onLeftClick: () => void,
  onRightClick: (e: React.SyntheticEvent) => void
};

const TileView = (props: Props) => {
  const {tile} = props;
  if (tile.hasFlag) {
    const flagClasses = classnames(styles.button, styles.icon);
    return <button className={flagClasses} onContextMenu={props.onRightClick}>🚩</button>;
  }
  if (tile.isMine && props.didLose) {
    const bombClasses = classnames(styles.button, styles.pressed, styles.icon);
    return <button className={bombClasses}>💣</button>;
  }
  if (tile.hasClick) {
    const clickedClasses = classnames(styles.button, styles.pressed, styles[`mine-${tile.value}`]);
    return (
      <button
        className={clickedClasses}
        onContextMenu={props.onRightClick}
        disabled
      >
        {!!tile.value && tile.value}
      </button>
    );
  }
  return <button onClick={props.onLeftClick} className={styles.button} onContextMenu={props.onRightClick}></button>;
};

export default TileView;

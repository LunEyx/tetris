import React from 'react';
import './Tetris.css';

import Tile from './Tile.js';

class Tetris extends React.Component {
  constructor(props) {
    super(props);

    const {map, height, width} = this.props;
    let board = new Array(height+1);
    for (let i = 0; i < board.length; i++) {
      board[i] = (new Array(width)).fill(-1);
    }

    let next = [];
    for (let i = 0; i < 5; i++) {
      next.push(Math.floor(Math.random() * 7));
    }

    this.state = {
      gameState: 'start',
      board: map || board,
      next: next
    };

    this.tiles = Tile.tiles;
    this.colors = Tile.colors;

    this.updateInterval = 100;
    this.autoDownInterval = 1000 / this.updateInterval;
    this.lockInterval = 1000;
    this.debug = false;
  }

  componentDidUpdate() {
    this.table.focus();
  }

  initializeGame = () => {
    this.tile = null;
    this.shadow = null;

    this.keyPressing = this.keyPressing || new Set();

    this.canSpawn = true;
    // TODO: this.canStore = true;
    // TODO: this.storage = null;
    this.iteration = 0;

    this.shouldFastForward = false;
    this.shouldDown = false;
    this.shouldLeft = false;
    this.shouldRight = false;
    this.shouldRotateClockwise = false;
    this.shouldRotateAntiClockwise = false;
    this.lastArrowKey = '';
    this.resume();
  }

  pause = () => {
    this.shouldFastForward = false;
    this.shouldDown = false;
    this.shouldLeft = false;
    this.shouldRight = false;
    this.shouldRotateClockwise = false;
    this.shouldRotateAntiClockwise = false;
    this.setState({ gameState: 'pause' });
    clearTimeout(this.updateTimer);
  }

  resume = () => {
    this.setState({ gameState: 'play' });
    this.updateTimer = setTimeout(this.loop, this.updateInterval);
  }

  restart = () => {
    const {map, height, width} = this.props;
    let board = new Array(height+1);
    for (let i = 0; i < board.length; i++) {
      board[i] = (new Array(width)).fill(-1);
    }

    let next = [];
    for (let i = 0; i < 5; i++) {
      next.push(Math.floor(Math.random() * 7));
    }

    this.setState({
      board: map || board,
      next: next
    });
    this.initializeGame();
  }

  loop = () => {
    if (this.canSpawn) {
      this.spawn();
    } else if (this.tile) {
      if (this.shouldFastForward) {
        if (this.debug) console.log('shouldFastForward');
        this.fastForward();
      } else {
        if (this.iteration === this.autoDownInterval) {
          if (this.debug) console.log('autoDown');
          this.down();
          this.iteration = 0;
        }
        if (this.shouldDown) {
          this.down();
        }
        if (this.shouldLeft || this.lastArrowKey === 'ArrowLeft') {
          this.left();
          this.shouldLeft = false;
        } else if (this.shouldRight || this.lastArrowKey === 'ArrowRight') {
          this.right();
          this.shouldRight = false;
        }
        if (this.shouldRotateClockwise) {
          this.rotateClockwise();
          this.shouldRotateClockwise = false;
        }
        if (this.shouldRotateAntiClockwise) {
          this.rotateAntiClockwise();
          this.shouldRotateAntiClockwise = false;
        }

        this.iteration += 1;
      }
      this.shouldFastForward = false;
    }
    if (this.state.gameState === 'play')
      this.updateTimer = setTimeout(this.loop, this.updateInterval);
  }

  spawn = () => {
    if (this.debug) console.log('spawn');
    // Turn off Spawn
    this.canSpawn = false;
    // Reset Lock Timer
    this.lockTimer = null;

    // Initialize the new tile
    this.tile = new Tile(this.getNextTileType());

    // Check and Place the new tile
    let board = this.state.board.map(row => row.slice());
    if (this.checkCanPlace(board, this.tile, true)) {
      this.placeTile(board, this.tile);
    } else {
      this.setState({
        gameState: 'gameover'
      });
    }
  }

  handleKeyDown = (event) => {
    if (this.state.gameState === 'start') {
      this.initializeGame();
    } else if (this.state.gameState === 'play') {
      if (!this.keyPressing.has(event.key)) {
        if (event.key === 'Escape') {
          this.pause();
        } else if (event.key === ' ') {
          this.shouldFastForward = true;
        } else if (event.key === 'ArrowLeft') {
          this.shouldLeft = true;
          this.lastArrowKey = 'ArrowLeft';
        } else if (event.key === 'ArrowRight') {
          this.shouldRight = true;
          this.lastArrowKey = 'ArrowRight';
        } else if (event.key === 'ArrowDown') {
          this.shouldDown = true;
        } else if (event.key === 'ArrowUp') {
          this.shouldRotateClockwise = true;
        } else if (event.key === 'z') {
          this.shouldRotateAntiClockwise = true;
        }
        this.keyPressing.add(event.key);
      }
    } else if (this.state.gameState === 'pause') {
      if (!this.keyPressing.has(event.key)) {
        if (event.key === 'Escape') {
          this.resume();
        }
      }
    } else if (this.state.gameState === 'gameover') {
      if (!this.keyPressing.has(event.key)) {
        if (event.key === 'Enter') {
          this.restart();
        }
      }
    }
  }

  handleKeyUp = (event) => {
    this.keyPressing.delete(event.key);
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      this.lastArrowKey = this.keyPressing.has('ArrowLeft') ? 'ArrowLeft' : this.keyPressing.has('ArrowRight') ? 'ArrowRight' : '';
    }
    if (event.key === 'ArrowDown')
      this.shouldDown = false;
  }

  fastForward = () => {
    if (this.debug) console.log('fastForward');

    let board = this.state.board.map(row => row.slice());
    let newTile = this.tile.clone();
    newTile.position[1] += 1;
    while (this.checkCanPlace(board, newTile)) {
      newTile.position[1] += 1;
    }
    newTile.position[1] -= 1;
    this.placeTile(board, newTile);
    this.lock();
  }

  down = () => {
    if (this.debug) console.log('down');

    let board = this.state.board.map(row => row.slice());
    let newTile = this.tile.clone();
    newTile.position[1] += 1;
    if (this.checkCanPlace(board, newTile)) {
      clearTimeout(this.lockTimer);
      this.lockTimer = null;
      this.placeTile(board, newTile);
      board = this.state.board.map(row => row.slice());
      newTile = this.tile.clone();
      newTile.position[1] += 1;
      if (!this.checkCanPlace(board, newTile)) {
        this.lockTimer = setTimeout(this.lock, this.lockInterval);
      }
    } else if (!this.lockTimer) {
      this.lockTimer = setTimeout(this.lock, this.lockInterval);
    }
  }

  left = () => {
    if (this.debug) console.log('left');

    let board = this.state.board.map(row => row.slice());
    let newTile = this.tile.clone();
    newTile.position[0] -= 1;
    if (this.checkCanPlace(board, newTile)) {
      this.placeTile(board, newTile);
    }
  }

  right = () => {
    if (this.debug) console.log('right');

    let board = this.state.board.map(row => row.slice());
    let newTile = this.tile.clone();
    newTile.position[0] += 1;
    if (this.checkCanPlace(board, newTile)) {
      this.placeTile(board, newTile);
    }
  }

  rotateClockwise = () => {
    if (this.debug) console.log('rotateClockwise');

    let board = this.state.board.map(row => row.slice());
    for (let i = 0; i < 5; i++) {
      let newTile = this.tile.clone();
      newTile.rotateClockwise(i);
      if (this.checkCanPlace(board, newTile)) {
        this.placeTile(board, newTile);
        break;
      }
    }
  }

  rotateAntiClockwise = () => {
    if (this.debug) console.log('rotateAntiClockwise');

    let board = this.state.board.map(row => row.slice());
    for (let i = 0; i < 5; i++) {
      let newTile = this.tile.clone();
      newTile.rotateAntiClockwise(i);
      if (this.checkCanPlace(board, newTile)) {
        this.placeTile(board, newTile);
        break;
      }
    }
  }

  lock = () => {
    if (this.debug) console.log('lock');

    clearTimeout(this.lockTimer);

    let board = this.state.board.map(row => row.slice());
    let newTile = this.tile.clone();
    newTile.position[1] += 1;
    if (this.checkCanPlace(board, newTile)) {
      console.log('can place????');
      return;
    }
    // Clear row if any
    this.clearRow();

    this.tile = null;

    // Unblock spawn
    this.canSpawn = true;
  }

  clearRow = () => {
    if (this.debug) console.log('clearRow');

    let tile = this.tile.tile;
    let position = this.tile.position;

    let board = this.state.board.map(row => row.slice());
    for (let y = position[1]; y < position[1]+tile.length; y++) {
      if (board[y].every(x => x > -1)) {
        for (let s = y; s > 0; s--) {
          board[s] = board[s-1];
        }
      }
    }

    this.setState({
      board: board
    });
  }

  checkInBoard = (board, tile) => {
    let [x, y] = tile.position;

    return x >= 0 && x + tile.tile[0].length <= board[0].length && y >= 0 && y + tile.tile.length <= board.length;
  }

  checkCanPlace = (board, nextTile, spawn) => {
    if (this.debug) console.log('checkCanPlace');
    let prevTile = this.tile;
    if (!this.checkInBoard(board, prevTile)) return false;
    if (!this.checkInBoard(board, nextTile)) return false;

    let tile = prevTile.tile;
    let position = prevTile.position;
    if (!spawn) {
      for (let y = 0; y < tile.length; y++) {
        for (let x = 0; x < tile[0].length; x++) {
          if (tile[y][x] === 1)
            board[y+position[1]][x+position[0]] = -1;
        }
      }
    }

    tile = nextTile.tile;
    position = nextTile.position;
    for (let y = 0; y < tile.length; y++) {
      for (let x = 0; x < tile[0].length; x++) {
        if (tile[y][x] === 1 && board[y+position[1]][x+position[0]] > -1)
          return false;
      }
    }

    return true;
  }

  placeShadow = (board, newTile) => {
    if (this.shadow) {
      let tile = this.shadow.tile;
      let position = this.shadow.position;
      for (let y = 0; y < tile.length; y++) {
        for (let x = 0; x < tile[0].length; x++) {
          if (tile[y][x] === 1 && board[y+position[1]][x+position[0]] === -2)
            board[y+position[1]][x+position[0]] = -1;
        }
      }
    }

    let newShadow = newTile.clone();
    let tile = newShadow.tile;
    let position = newShadow.position;
    for (let height = tile.length-1+position[1]; height < board.length; height++) {
      let check = true;
      for (let y = tile.length-1; check && y >= 0; y--) {
        for (let x = 0; check && x < tile[0].length; x++) {
          if (tile[y][x] === 1 && board[y+position[1]][x+position[0]] > -1) {
            check = false;
          }
        }
      }
      if (!check) break;
      newShadow.position[1] += 1;
    }
    newShadow.position[1] -= 1;

    this.shadow = newShadow;
    tile = this.shadow.tile;
    position = this.shadow.position;
    for (let y = 0; y < tile.length; y++) {
      for (let x = 0; x < tile[0].length; x++) {
        if (tile[y][x])
          board[y+position[1]][x+position[0]] = -2;
      }
    }
  }

  placeTile = (board, newTile) => {
    if (this.debug) console.log('placeTile');
    let tile = this.tile.tile;
    let position = this.tile.position;
    for (let y = 0; y < tile.length; y++) {
      for (let x = 0; x < tile[0].length; x++) {
        if (tile[y][x] === 1)
          board[y+position[1]][x+position[0]] = -1;
      }
    }

    this.placeShadow(board, newTile);

    this.tile = newTile;
    tile = this.tile.tile;
    position = this.tile.position;
    for (let y = 0; y < tile.length; y++) {
      for (let x = 0; x < tile[0].length; x++) {
        if (tile[y][x] === 1)
          board[y+position[1]][x+position[0]] = this.tile.type;
      }
    }

    this.setState({
      board: board
    });
  }

  getNextTileType = () => {
    const next = this.state.next[0];

    const newNext = Math.floor(Math.random() * 7);

    this.setState((state) => {
      state.next.shift();
      state.next.push(newNext);
      return { next: state.next };
    });

    return next;
  }

  createBoard = () => {
    const board = this.state.board;
    const {height, width} = this.props;
    let table = [];

    for (let j = 1; j < height+1; j++) {
      let row = [];

      for (let i = 0; i < width; i++) {
        row.push(<td key={j*width+i} className={(() => {const color = board[j][i]; return color === -2 ? this.colors[7] : this.colors[board[j][i]]})()}></td>);
      }

      table.push(<tr key={j}>{row}</tr>);
    }

    return <tbody>{table}</tbody>;
  }

  createNext = (i) => {
    // const type = this.state.next[i];

    let table = [];

    for (let j = 0; j < 3; j++) {
      let row = [];

      for (let i = 0; i < 3; i++) {
        row.push(<td></td>);
      }

      table.push(<tr key={j}>{row}</tr>);
    }

    return <tbody>{table}</tbody>;
  }

  displayText = () => {
    switch (this.state.gameState) {
      case 'start':
        return 'START';
      case 'pause':
        return 'PAUSE';
      case 'gameover':
        return 'GAME OVER';
      default:
        return '';
    }
  }

  onDisplayClick = () => {
    if (this.state.gameState === 'start') {
      this.initializeGame();
    } else if (this.state.gameState === 'pause') {
      this.resume();
    } else if (this.state.gameState === 'gameover') {
      this.restart();
    }
  }

  arrayClone = (arr) => {
    let newArr = new Array(arr.length);
    for (let i = 0; i < newArr.length; i++) {
      newArr[i] = Array.from(arr[i]);
    }

    return newArr;
  }

  render() {
    return (
      <div>
        <table border={1}>
          <tbody>
            <tr>
              <td>
                <div
                  className={this.state.gameState}
                  onClick={this.onDisplayClick}
                >
                  {this.displayText()}
                </div>
                <table
                  id='board'
                  onKeyDown={this.handleKeyDown}
                  onKeyUp={this.handleKeyUp}
                  tabIndex="0"
                  ref={table => this.table = table}
                >
                  {this.createBoard()}
                </table>
              </td>
              <td id='tetris-next'>
                {this.createNext(0)}
                {this.createNext(1)}
                {this.createNext(2)}
                {this.createNext(3)}
                {this.createNext(4)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default Tetris;

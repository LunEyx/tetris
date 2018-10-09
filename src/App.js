import React from 'react';
import { height, width } from './Setting.js';
import Tetris from './Tetris.js';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <div
        id="Tetris"
      >
        <Tetris
          height={height}
          width={width}
        />
      </div>
    );
  }
}

export default App;

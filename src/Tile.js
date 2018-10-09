class Tile {
  constructor(type, position) {
    this.type = type;
    this.tile = Tile.tiles[type];
    this.color = Tile.colors[type];
    this.position = position || this.getInitialPosition();
    this.rotation = 0;
  }

  clone() {
    let clone = new Tile(this.type, this.position);
    clone.tile = this.tile;
    clone.position = this.position.slice();
    clone.rotation = this.rotation;

    return clone;
  }

  getInitialPosition() {
    return [Math.floor((10 - this.tile[0].length) / 2), this.type === 5 ? 1 : 0];
  }

  rotateClockwise(test) {
    this.rotation = (this.rotation + 1) % 4;
    let offset = Tile.rotationClockwisePosition[this.type][this.rotation];
    let wallKick;
    if (this.type === 5)
      wallKick = Tile.clockwiseWallKickI[this.rotation][test];
    else
      wallKick = Tile.clockwiseWallKick[this.rotation][test];
    this.position[0] += offset[0] + wallKick[0];
    this.position[1] += offset[1] + wallKick[1];
    this.tile = this.tile[0].map((column, index) => this.tile.slice().reverse().map((row) => row[index]));

    return this;
  }

  rotateAntiClockwise(test) {
    this.rotation = (this.rotation + 3) % 4;
    let offset = Tile.rotationClockwisePosition[this.type][(this.rotation+1)%4];
    let wallKick;
    if (this.type === 5)
      wallKick = Tile.antiClockwiseWallKickI[this.rotation][test];
    else
      wallKick = Tile.antiClockwiseWallKick[this.rotation][test];
    this.position[0] -= offset[0] - wallKick[0];
    this.position[1] -= offset[1] - wallKick[1];
    this.tile = this.tile[0].map((column, index) => this.tile.map((row) => row[row.length - index - 1]));

    return this;
  }
}

Tile.tiles = [ [ [1, 1, 0], [0, 1, 1] ], [ [0, 0, 1], [1, 1, 1] ], [ [1, 1], [1, 1] ], [ [0, 1, 1], [1, 1, 0] ], [ [1, 0, 0], [1, 1, 1] ], [ [1, 1, 1, 1] ], [ [0, 1, 0], [1, 1, 1] ], ];

Tile.colors = ['red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'purple', 'grey'];

Tile.rotationClockwisePosition = [
  [ [0, 0], [1, 0], [-1, 1], [0, -1] ],
  [ [0, 0], [1, 0], [-1, 1], [0, -1] ],
  [ [0, 0], [0, 0], [0, 0], [0, 0] ],
  [ [0, 0], [1, 0], [-1, 1], [0, -1] ],
  [ [0, 0], [1, 0], [-1, 1], [0, -1] ],
  [ [-1, 1], [2, -1], [-2, 2], [1, -2] ],
  [ [0, 0], [1, 0], [-1, 1], [0, -1] ]
];

Tile.clockwiseWallKick = [
[ [ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2] ],
[ [ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2] ],
[ [ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2] ],
[ [ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2] ]
];

Tile.antiClockwiseWallKick = [
[ [ 0, 0], [ 1, 0],	[ 1,-1], [ 0, 2],	[ 1, 2] ],
[ [ 0, 0], [-1, 0],	[-1, 1], [ 0,-2],	[-1,-2] ],
[ [ 0, 0], [-1, 0],	[-1,-1], [ 0, 2],	[-1, 2] ],
[ [ 0, 0], [ 1, 0],	[ 1, 1], [ 0,-2],	[ 1,-2] ]
];

Tile.clockwiseWallKickI = [
[ [ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1] ],
[ [ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2] ],
[ [ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1] ],
[ [ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2] ]
];

Tile.antiClockwiseWallKickI = [
[ [ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2] ],
[ [ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1] ],
[ [ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2] ],
[ [ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1] ]
];

export default Tile;

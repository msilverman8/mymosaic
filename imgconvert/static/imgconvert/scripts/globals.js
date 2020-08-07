"use strict";

var Globals = {
  // mosaic: value added later // the ordered rgb values that make up the mosaic
  // materials: value added later // the amount of each color tile found in the mosaic
  color: 'BW', // one of ['CL', 'GR', 'BW']
  palette: [{r:0,g:0,b:0},{r:255,g:255,b:255}], // values related to color
  basePlate: 32, // assume square for now, the units of 1 base plate
  x: 64, // width of the mosaic
  y: 64, // height of the mosaic
  tileSize: 8, // pixel size of the onscreen mosaic display
  tileRealWidth: 0, // the size of the real 'lego' in cm ????? is this value useful?
  colordata: null, // the json data from the server that has the palette info
  init: function() {
    console.log('initializing globals')
    this.aspectRatio = this.x / this.y; // mosaic aspect ratio
    this.plateCount = (this.x / this.basePlate) + (this.y / this.basePlate); // how many plates in mosaic
  },

  // get the index of a 2d matrix notation array sotred as a 1d array
  matrixData: {
    // get the index of the 2d matrix grid
    getIndex: function(x, y){
      return x + (y * this.x);
    },
    getX: function(index, y){
      return index - (y * this.x);
    },
    getY: function(index, x){
      return (index - x) / this.x;
    }

  },

  // // round number to the nearest multiple of the baseplate
  roundToPlate: function(n) {
    // let b = (this.basePlate / 2) + this.basePlate;
    return Math.ceil(n/this.basePlate) * this.basePlate;
  },

  // converts the paleete rgb object to an array
  paletteAsArray: function(){
    // [[r,g,b]...]
    return this.palette.map(rgb => {
      return Object.values(rgb)
    });
  },
  // 3rd party
  ditherKernals: [null, 'FloydSteinberg', 'FalseFloydSteinberg', 'Stucki', 'Atkinson', 'Jarvis', 'Burkes', 'Sierra', 'TwoSierra', 'SierraLite'],
  colorDist: ['euclidean', 'manhattan'],

};

Globals.init();

module.exports = Globals;

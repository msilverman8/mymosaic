(()=>{"use strict";

// the user mosaic settings

var Globals = {
  // mosaic: value added later // the ordered rgb values that make up the mosaic
  // materials: value added later // the amount of each color tile found in the mosaic
  customPalettes: {}, // remember choices if user changes palette within the same upload
  get colorData() {
    return this._colorData ? this._colorData : {'BW': [{r:0,g:0,b:0},{r:255,g:255,b:255}]};
  },
  // check the json data from the server that has the palette info
  set colorData(obj){
    this._colorData = false;
    if (obj.constructor !== Object){
      throw new Error('color data is invalid! expecting a javascript Object!')
    }
    this._colorData = Object.assign({}, obj);
    this.resetPalette();
  },
  get color(){
    return this._color
  }, // one of ['CL', 'GR', 'BW']
  set color(newColor){
    console.log(`changing palette choice to color: ${newColor}`);
    this._color = newColor;
    this._checkUseCustom();
  },
  get palette(){
    if (this.useCustomPalette) { return this.customPalettes[this.color]; }
    // returns default all colors included palette
    return this.colorData[this.color];
  }, // values related to color
  resetPalette: function(){
    // clear custom palette stores
    this.customPalettes = Object.assign({}, this.colorData);
    this.useCustomPalette = false;
  },
  _checkUseCustom: function(){
    let c_len = this.customPalettes[this.color].length;
    let d_len = this.colorData[this.color].length;
    this.useCustomPalette = (c_len != d_len);
  },
  addColor: function(rgb){
    // adds color to custom palette
    if(typeof rgb !== 'string' || rgb.split(',').length != 3){
      throw new Error('invalid color passed to custom palette, expecting string "r,g,b" ');
    }
    let c = rgb.split(',').map(str => parseInt(str));
    this.customPalettes[this.color].push({ r:c[0], g:c[1], b:c[2] });
    this._checkUseCustom();
  }, // adds color to custom palette
  removeColor: function(rgb){
    // removes color from custom palette
    if(typeof rgb !== 'string' || rgb.split(',').length != 3){
      throw new Error('invalid color passed to custom palette, expecting string "r,g,b" ');
    }
    let newArry = this.customPalettes[this.color].filter(stored =>
      Object.values(stored).join(',') !== rgb
    );
    this.customPalettes[this.color] = newArry;
    this._checkUseCustom();
  }, // removes color from custom palette
  basePlate: 32, // assume square for now, the units of 1 base plate
  plateWidth: 2, // plate count width
  plateHeight: 2, // plate count height
  get x(){
    return this.plateWidth * this.basePlate
  }, // width of the mosaic
  get y(){
    return this.plateHeight * this.basePlate
  }, // height of the mosaic
  get aspectRatio(){
    return this.plateWidth / this.plateHeight
  }, // mosaic aspect ratio
  get plateCount() {
    return this.plateWidth * this.plateHeight
  }, // how many plates in mosaic
  // converts the palette rgb object to an array
  paletteAsArray: function(arry){
    // [[r,g,b]...]
    if(!arry){ arry = this.palette; }
    else if(!Array.isArray(arry)){
      throw new Error('invalid palette passed! expecting array of {r:g:b:}')
    }
    return arry.map(rgb => {
      return Object.values(rgb)
    });
  },
  tileSize: 4, // pixel size of the onscreen mosaic display
  tileRealWidth: 0, // the size of the real 'lego' in cm ????? is this value useful?
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

  // 3rd party
  // ditherjs properties
  // ditherKernals: [null, 'FloydSteinberg', 'FalseFloydSteinberg', 'Stucki', 'Atkinson', 'Jarvis', 'Burkes', 'Sierra', 'TwoSierra', 'SierraLite'],
  // colorDist: ['euclidean', 'manhattan'],

};

module.exports = Globals;
})();

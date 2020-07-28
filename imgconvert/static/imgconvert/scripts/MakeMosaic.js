(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.MakeMosaic = factory());
}(this, (function () { 'use strict';

  class MakeMosaic {
    constructor(options){
      console.log(' ~~ calling display mosaic ~~');
      const requiredOptions = ['targetCanvas', 'overlayCanvas', 'rgbaStringList', 'countContainer']
      requiredOptions.forEach((op) => {
        if (!options[op]) {
          throw new Error(`${op} not passed with options!`);
        }

      });

      let defaults = {
        tileWidth: 9,
        tileHeight: 9,
        plateSize: 32,
        opacity: 1,
        targetCanvas: null,
        overlayCanvas: null,
      };
      var tilesX = 0;
      var tilesY = 0;
      const arry = options.rgbaStringList;
      // check if array of mosaic tiles received is valid
      if(Array.isArray(arry)){
          tilesY = arry.length;
          console.log(` tilesY = ${tilesY}`);
          if(tilesY > 0 && Array.isArray(arry[0])){
            tilesX = arry[0].length;
            console.log(` tilesX = ${tilesX}`);
          }
          else {
            throw new Error('row at index zero of mosaic array is not an array!')
          }
      }
      else {
        throw new Error('mosaic is not an array!')
      }

      this.options = Object.assign(defaults, options);

      // the options object blew up, should refactor this to be more neat when logic becomes solid
      this.options['width'] = tilesX * defaults.tileWidth;
      this.options['height'] = tilesY * defaults.tileHeight;
      this.options.targetCanvas.height = this.options.overlayCanvas.height = this.options.height;
      this.options.targetCanvas.width = this.options.overlayCanvas.width = this.options.width;
      this.options['tilesX'] = tilesX;
      this.options['tilesY'] = tilesY;

      // values are in range 0 - this.options.tiles(X/Y)
      this.highlight = {
        x: 0, y: 0, w: 5, h: 1,
        widthActual: 5,
        heightActual: 1,
      };

      let p = this.options.plates;
      // the display object handles the plates ?
      // needs more clairty, come back to it after design
      this.display = {
        plateMax: p,
        plateCount: p,
        plateActive: null,
        plateGrid: this._getPlateGrid(p)

      };
      this.display.plateActive = this._getActivePlates(p);

      this._initDisplay();
    }

    /**
     * uses options saved tiles to recreate the mosaic, appends
     * mosaic to options targetCanvas
     */
    _initDisplay() {
      console.log('calling display mosaic');
      const canvas = this.options.targetCanvas;
      const context = canvas.getContext('2d');
      const arry = this.options.rgbaStringList;

      for (var i = 0; i < this.options.tilesY; i++) {
        for (var j = 0; j < this.options.tilesX; j++) {
          const x = j * this.options.tileWidth,
                y = i * this.options.tileHeight;
          context.fillStyle = arry[i][j];
          context.fillRect(x, y, this.options.tileWidth, this.options.tileHeight);
        }

      }
      this._createOverlay();
    }

    // will change when display gets customized by plate count
    // gets the tiles bounded by the highlight area
    _getTilesInBounds(){
      // logic for from highlight
      var y = this.highlight.y,
          x = this.highlight.x,
          countDisp = {};

      const rows = y + this.highlight.h,
            columns = x + this.highlight.w;

      // console.log('----getting tiles for ----');
      // console.log(`x: ${x}, y: ${y}, w: ${columns}, h: ${rows}`);
      // console.log('         ~~~~~~       ');
      for (var i = y; i < rows; i++) {
        for (var j = x; j < columns; j++) {
          const color = this.options.rgbaStringList[i][j];
          if(countDisp.hasOwnProperty(color)){countDisp[color]++}
          else{countDisp[color] = 1;}
        }
      }

      console.log(countDisp);

      this._setTileCountDisplay(countDisp);
    }
    /**
     * Creates DOM elements to display the tile count
     * receives the tiles from the focus section
     * @param  {Object} countDisp keys are rgba string, value is the number
     */
    _setTileCountDisplay(countDisp){
      console.log(' displaying color count ');
      const ul = document.createElement('ul');
      ul.classList.add('list-group', 'list-group-horizontal');

      for (const [color, amt] of Object.entries(countDisp)) {
        console.log(` color : ${color}  =  ${amt}`);

        const li = document.createElement('li');
        li.classList.add('list-group-item');
        const span1 = document.createElement('span');
        span1.classList.add('badge', 'badge-pill');
        span1.style.background = color;
        span1.textContent = '-';
        const span2 = document.createElement('span');
        span2.textContent = amt;

        li.appendChild(span1);
        li.appendChild(span2);
        ul.appendChild(li);
      }

      this.options.countContainer.innerHTML = '';
      this.options.countContainer.appendChild(ul);
    }


    // creates the focus area visual using stored boundries
    _createOverlay(){
      // console.log('updating overlay');
      let canvas = this.options.overlayCanvas;
      let ctx = canvas.getContext('2d');
      // clear existing higlight
      ctx.clearRect(0,0,canvas.width, canvas.height);

      // ctx.fillStyle = 'rgba(0,0,0,1)';
      const x = this.highlight.x * this.options.tileWidth;
      const y = this.highlight.y * this.options.tileHeight;
      const w = this.highlight.w * this.options.tileWidth;
      const h = this.highlight.h * this.options.tileHeight;

      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0,0,canvas.width, canvas.height);
      ctx.clearRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.strokeRect(x, y, w, h);


      this._getTilesInBounds();

      // ctx.fillRect(0, 0, this.options.width, this.options.height);
      // let clearWidth = this.options.amountX * this.options.tileWidth;
      // let clearHeight = this.options.amountY * this.options.tileHeight;
      // ctx.clearRect(this.options.posX, this.options.posY, clearWidth, clearHeight)
    }
    /**
     * called when there is a change in dimensions for the focus area bounding box
     * validates the values received and if valid updates the highlight object
     * @param  {Number} width width of the focus area
     * @param  {Number} height height of the focus area
     * @return {object} the auto defaulted new highlight dimensions and an isinvalid bool
     */
    updateHighlight(width, height){
      // get width height from user
      // validate parameters
      const validated = this._validateHighlight(width, height);
      // return values to dom to have display updated
      if(validated.isInvalid){return validated}
      // console.log(` highlight section is a :${width}: x :${height}: box`);
      // new bounds are valid, update highlight object
      // store actual form value, highlight display may be differnt
      this.highlight.w = this.highlight.widthActual = validated.w;
      this.highlight.h = this.highlight.heightActual = validated.h;

      // update overlay
      this._createOverlay();

      return validated.isInvalid;
    }
    /**
     * next+previous handler for highlight,
     * calls the calucator to get new highlight dimensions,
     * then updates the overlay
     * @param  {string} direction one of previous or next, to move the highlight segment
     */
    moveHighlight(direction){
      // called from listener
      // console.log(`updating highlight section to -- ${direction} --`);
      // gets the new bounds
      const nw = this._getMoveHighlight(direction);
      // console.log('new highlight');
      for (var variable in nw) {
        if (nw.hasOwnProperty(variable)) {
          console.log(`${variable}: ${nw[variable]}`);
          if(isNaN(Number(nw[variable]))){
            throw new Error('getMoveHighlight returned with an invalid value');
          }
        }
      }
      // update stored highlight value
      Object.assign(this.highlight, nw);
      //update overlay
      this._createOverlay();
    }
    /**
     * validates the new dimensions given to change the highlight
     * if invalid automatically set dimensions to the whole display
     * @param {Number} width  the new width
     * @param {Number} height the new height
     * @returns {object} returns the validated dimensions and an isinvalid bool
     */
    _validateHighlight(width, height){
      // console.log('previous bounds');
      // console.log(`${this.highlight.x}, ${this.highlight.y}, ${this.highlight.w}, ${this.highlight.h}`);
      // console.log(`setting to w: ${width}, h: ${height}`);
      [width, height].forEach((x) => {
        if(isNaN(Number(x))){
          throw new Error('new highlight bounds value is not a number!');
        }
      });
      const maxW = this.options.tilesX
      const maxH = this.options.tilesY
      var isInvalid = false;
      // make sure a valid number is entered
      if(width <= 0 || width > maxW){width = maxW; isInvalid = true;}
      if(height <= 0 || height > maxH){height = maxH; isInvalid = true;}
      return {
        w: width,
        h: height,
        isInvalid: isInvalid
      }
    }
    /**
     * the calculations for where the focus area (highlight) will be moved to
     * @param  {string} direction one of previous or next
     * @return {object}           the new highlight bounds
     */
    _getMoveHighlight(direction){
      // make sure direction is valid
      if(!['previous', 'next'].includes(direction)){
        throw new Error (`moveHighlight called with a bad direction -- "${direction}" is not a valid direction`);
      }

      // get current highlight origin
      const current = {
              x: this.highlight.x,
              y: this.highlight.y,
              h: this.highlight.h,
            },
            width = this.highlight.widthActual,
            height = this.highlight.heightActual,
            maxW = this.options.tilesX,
            maxH = this.options.tilesY;

      // create destination placeholder obj
      var destination = {
            x: 0,
            y: 0,
            w: width,
            h: height
      };

      if(direction == 'next'){
        // console.log('direction is next');
        // deal with wraps
        // if at bottom wrap, wrap to 0,0 which is default destination
        if ( ((current.x + width) >= maxW) && ((current.y + height) >= maxH) ){return destination;}
        // the last segment in a row
        if((current.x + width) >= maxW){
          // console.log(" new x coord is out of bounds");
          // x & width stay get y
          destination.y = current.y + height;
          // incase there is not full height left
          destination.h = Math.min(height, (maxH - destination.y));
          return destination;
        }
        // console.log('new x coord is in bounds');
        // no wrap keep y the same as current
        destination.y = current.y;
        destination.x = current.x + width;
        destination.h = Math.min(height, (maxH - destination.y));
        destination.w = Math.min(width, (maxW - destination.x));
        return destination;
      }
      else {
        const leftover = {
          w: maxW % width,
          y: maxH % height
        };
        // get previous
        // deal with wraps
        // if at head of a row, wrap to end of previous row
        if(current.x == 0){
          // console.log('------------------------------------------');
          // console.log('highlight is at the front of a row ');
          // console.log(`LEFTOVER width ${leftover.w} is falsy?? ${!(leftover.w)}`);
          // console.log(`WIDTH is ${width}`);
          destination.w = leftover.w || width;
          destination.x = maxW - destination.w;
          // if at top of the mosaic, wrap to end of canvas
          if(current.y == 0){
            // console.log('---------------------------------------------');
            // console.log(' highlight is at the top of the container! move it to the bottom!');
            // console.log(`LEFTOVER height ${leftover.h} is falsy?? ${!(leftover.h)}`);
            // console.log(`HEIGHT is ${height}`);
            destination.h = leftover.h || height;
            destination.y = maxH - destination.h;
            return destination;
          }
          // else not at top yet
          // if height is more than segment just get 0
          destination.y = Math.max((current.y - height), 0);
          // don't make the height include the previous row
          destination.h = Math.min(current.y, height);
          return destination;
        }
        // console.log('highlight is in the middle of the canvas');
        destination.x = Math.max(0, (current.x - width));
        destination.y = current.y;
        destination.w = Math.min(current.x, width);
        destination.h = current.h;
        return destination;

      }
    }


    // working plate display logic
    // NEED CLARITY FROM DESIGN
    _getPlateGrid(amt){
      // get plate dimensions
      const size = this.options.plateSize;
      const rows = this.options.tilesY / size;
      const cols = this.options.tilesX / size;
      const arry = this.options.rgbaStringList;
      var plateGrid = {}

      // divide into rows
      for (var i = 0; i < rows; i++) {
        var rowSegment = arry.slice( (i*size) , ((i*size) + size) - 1);
        for (var j = 0; j < cols; j++) {
            let key = i + '' + j;
            plateGrid[key] = rowSegment.slice ( (j*size), ((j*size) + size) - 1);
        }
      }

      return plateGrid
    }
     // NEED CLARITY FROM DESIGN
    _getActivePlates(amt){
      // returns an array of plategrid keys
      // should only be called on init
      if(amt == this.display.plateMax){
        return Object.keys(this.display.plateGrid)
      }
      else {
        throw new Error(' setting up the active plate variable encountered a problem ');
      }
    }
    // NEED CLARITY FROM DESIGN
    updatePlates(amt){
      // gets amount to display from user
      // make sure amt is valid
      // make usre amt is an even number
      // const current = this.display.plateActive;
      const arry = Array.from(this.display.plateActive, x => (Array.from(x)))
      console.log(arry);

    }
    // NEED CLARITY FROM DESIGN
    _getMosaicArryFromPlateGrid(coords){
      // easy to use for creating canvas element
      // this logic priorituzes going right before down
      const rows = this.options.tilesY;
      const cols = this.options.tilesX;
      coords.forEach((key) => {
        let indexes = Array.from(key);

      });

    }
    // NEED CLARITY FROM DESIGN
    _getArryIndexFromGridCoords(){
      const size = this.options.plateSize;
      const coords = Object.keys(this.display.plateGrid);
    }

  } // end class MakeMosaic

 return MakeMosaic;

})));

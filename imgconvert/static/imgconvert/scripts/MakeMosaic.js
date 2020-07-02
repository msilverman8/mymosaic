(function(window){
  'use-strict';

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
      this.display = {
        plateMax: p,
        plateCount: p,
        plateActive: null,
        plateGrid: this.getPlateGrid(p)

      };
      this.display.plateActive = this.getActivePlates(p);
    }

    /**
     * uses passed saved tiles to recreate the mosaic, appends
     * mosaic to targetCanvas passed in instance
     * @param  {[type]} rgbaString array of rows, ro values are rgba colors
     */
    displayMosaic() {
      console.log('calling sisplay mosaic');
      const canvas = this.options.targetCanvas;
      const context = canvas.getContext('2d');
      const arry = this.options.rgbaStringList;

      var countDisp = {};

      for (var i = 0; i < this.options.tilesY; i++) {
        for (var j = 0; j < this.options.tilesX; j++) {
          const x = j * this.options.tileWidth,
              y = i * this.options.tileHeight,
              color = arry[i][j];
          context.fillStyle = color;
          if(countDisp.hasOwnProperty(color)){countDisp[color]++}
          else{countDisp[color] = 1;}
          context.fillRect(x, y, this.options.tileWidth, this.options.tileHeight);
        }

      }

      // clear container and append mosaicCanvas to DOM
      // this.options.targetElement.innerHTML = '';
      // this.options.targetElement.appendChild(canvas);
      this.createOverlay();
      this.setTileCountDisplay(countDisp);

    }
    setTileCountDisplay(countDisp){
      console.log(' displaying color count ');
      const ul = document.createElement('ul');
      ul.classList.add('list-group', 'list-group-horizontal');

      for (const [color, amt] of Object.entries(countDisp)) {
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
    getPlateGrid(amt){
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
    getActivePlates(amt){
      // returns an array of plategrid keys
      // should only be called on init
      if(amt == this.display.plateMax){
        return Object.keys(this.display.plateGrid)
      }
      else {
        throw new Error(' setting up the active plate variable encountered a problem ');
      }
    }
    updatePlates(amt){
      // gets amount to display from user
      // make sure amt is valid
      // make usre amt is an even number
      // const current = this.display.plateActive;
      const arry = Array.from(this.display.plateActive, x => (Array.from(x)))
      console.log(arry);

    }

    getMosaicArryFromPlateGrid(coords){
      // easy to use for creating canvas element
      // this logic priorituzes going right before down
      const rows = this.options.tilesY;
      const cols = this.options.tilesX;
      coords.forEach((key) => {
        let indexes = Array.from(key);

      });

    }

    getArryIndexFromGridCoords(){
      const size = this.options.plateSize;
      const coords = Object.keys(this.display.plateGrid);
    }

    // tile count (materials) .color
    // # to highlight .x .y
    // current coords .x .y
    // previous coords .x .y
    // next coords .x .y
    // view plate count # to be displayed
    // view plate number .x .y
    //
    setView(x, y, type){
      // type one of
      // highlight, current, next, previous
      this.view[type].x = x;
      this.view[type].y = y;
    }

    createOverlay(){
      // console.log('updating overlay');
      let canvas = this.options.overlayCanvas;
      let ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(0,0,0,1)';
      const x = this.highlight.x * this.options.tileWidth;
      const y = this.highlight.y * this.options.tileHeight;
      const w = this.highlight.w * this.options.tileWidth;
      const h = this.highlight.h * this.options.tileHeight;
      ctx.fillRect(x, y, w, h);

      // ctx.fillRect(0, 0, this.options.width, this.options.height);
      // let clearWidth = this.options.amountX * this.options.tileWidth;
      // let clearHeight = this.options.amountY * this.options.tileHeight;
      // ctx.clearRect(this.options.posX, this.options.posY, clearWidth, clearHeight)
    }
    updateHighlight(width, height){
      // get width height from user
      // validate parameters
      const validated = this.setHighlightBounds(width, height);
      // return values to dom to have display updated
      if(validated.isInvalid){return validated}
      // console.log(` highlight section is a :${width}: x :${height}: box`);
      // new bounds are valid, update highlight object
      // store actual form value, highlight display may be differnt
      this.highlight.w = this.highlight.widthActual = validated.w;
      this.highlight.h = this.highlight.heightActual = validated.h;

      // update overlay
      this.createOverlay();
    }
    moveHighlight(direction){
      // console.log(`updating highlight section to -- ${direction} --`);
      // gets the new bounds
      const nw = this.getmoveHighlight(direction);
      // console.log('new highlight');
      for (var variable in nw) {
        if (nw.hasOwnProperty(variable)) {
          console.log(`${variable}: ${nw[variable]}`);
        }
      }
      // update stored highlight value
      Object.assign(this.highlight, nw);
      //update overlay
      this.createOverlay()
    }
    setHighlightBounds(width, height){
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
    getmoveHighlight(direction){
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

  } // end class MakeMosaic



window.MakeMosaic = MakeMosaic;


/*

display mosaic based on default view controls
  display mosaic thumbnail????
  display whole mosaic with a get started button that has instructions on controls

display tile count for highlight

display plate count value
display prev - next plate controls

display highlight bounds value
display prev - next controls


listen for change plate view control value
update plate view value
update mosaic display
listen for change to next / prev plate
update current plate
update mosaic display










 */



})(window)

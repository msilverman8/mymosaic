(function(window){
  'use-strict';

  class MakeMosaic {
    constructor(options){
      console.log(' ~~ calling display mosaic ~~');
      if (!options.targetElement) {
        throw new Error('targetElement not passed with options!');
      }
      this.defaults = {
        targetElement: null,
        tileWidth: 5,
        tileHeight: 5,
        tilesX: 64,
        tilesY: 64,
        opacity: 1,
      };
      this.options = this.assign(this.defaults, options);
    }

    /**
     * updates the old object with the new values
     * @param  {object} oldVals
     * @param  {object} newVals
     * @return {}
     */
    assign(oldVals, newVals) {
      for (var val in newVals) {
        if (newVals.hasOwnProperty(val)) {
            oldVals[val] = newVals[val];
        }
      }
      return oldVals;
    };

    /**
     * uses passed saved tiles to recreate the mosaic, appends
     * mosaic to targetElement passed in instance
     * @param  {[type]} rgbaString array of rows, ro values are rgba colors
     */
    displayMosaic(rgbaString) {
      if(!rgbaString){
        throw new Error('no list of tiles were available, cannot recreate canvas!');
      }

      var canvas = document.createElement('canvas');
      canvas.width = this.options.tilesX * this.options.tileWidth;
      canvas.height = this.options.tilesY * this.options.tileHeight;
      var context = canvas.getContext('2d');

      for (var i = 0; i < this.options.tilesY; i++) {
        for (var j = 0; j < this.options.tilesX; j++) {
          context.fillStyle = rgbaString[i][j];
          this.createTiles(x, y, context);
        }
      }

      // clear container and append mosaicCanvas to DOM
      this.options.targetElement.innerHTML = '';
      this.options.targetElement.appendChild(canvas);
    }

    /**
     * Creates a block of the mosaic. This is called tileCountX*tileCountY times to create all blocks
     * of the mosaic.
     * @param  {number} x          x coordinate of the block
     * @param  {number} y          y coordinate of the block
     * @param  {object} context    Context of the result canvas
     */
    createTiles(x, y, context) {
      var width = this.options.tileWidth;
      var height = this.options.tileHeight;
      context.beginPath();
      context.rect(x, y, width, height);
      context.fill();
      context.closePath();
    };

  } // end class MakeMosaic



window.MakeMosaic = MakeMosaic;
})(window)

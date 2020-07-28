(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.ConvertPhoto = factory());
}(this, (function () { 'use strict';

    class ConvertPhoto {
      constructor(options){
        console.log(' - calling convert - ');
        if (!options.canvas) {
          throw new Error('canvas options not passed!');
        }
        if (!options.palette) {
          throw new Error('palette options not passed!');
        }
        let defaults = {
            colorChoice: 'CL',
            grayType: 'lum',
            palette: null,
            canvas: null,
            targetElement: null,
            tileWidth: 5,
            tileHeight: 5,
            tilesX: 64,
            tilesY: 64,
            opacity: 1,
        };
        this.options = Object.assign(defaults, options);
        // super(Object.assign(defaults, options))

        this.utils = {
          // human perception of color gives weight to the importance of each channel
          weight: {
            r: 0.3,
            g: 0.59,
            b: 0.11,
          },
          // an alternate weight set was found
          altWeight: {
            r: 0.21,
            g: 0.72,
            b: 0.07,
          },
          rgb: {
            r: 0,
            g: 0,
            b: 0,
          }
        } // end this.utils

        // rgb values saved as a string python tuple. no alpha channel included
        // '(r, g, b)'
        // grouped by rows index 0 contains all tiles left to right at row 0
        this.mosaicTileCount = [];
        // stores arrat of rows of tiles left to right as rgba strings
        // ready for context.fillStyle
        this.mosaicRGBAStrings = [];

      } // end constructor

      /**
      * averages a cluster(data) of rgb values then matches the color to the palette
      * @param  {Array} data     The data received by using the getImage() method
      * @return {Object}         The object containing the best match RGB value
      */
      getAverageColor (data) {
        var i = -4,
            pixelInterval = this.options.tileWidth,
            count = 0,
            rgb = this.utils.rgb,
            length = data.length;

        switch(this.options.colorChoice){
          case 'AL':
          case 'CL': // color
            while ((i += pixelInterval * 4) < length) {
              count++;
              rgb.r += data[i] * data[i];
              rgb.g += data[i + 1] * data[i + 1];
              rgb.b += data[i + 2] * data[i + 2];

            }
            // Return the sqrt of the mean of squared R, G, and B sums
            rgb.r = Math.floor(Math.sqrt(rgb.r / count));
            rgb.g = Math.floor(Math.sqrt(rgb.g / count));
            rgb.b = Math.floor(Math.sqrt(rgb.b / count));
            break;
          case 'BW': // should bw use this same conversion????
          case 'GR': // grayscale
            while ((i += pixelInterval * 4) < length) {
              var avg = 0;
              // luminosity method
              if(this.options.grayType == 'lum'){
                avg = (this.utils.weight.r * data[i] +
                      this.utils.weight.g * data[i + 1] +
                      this.utils.weight.b * data[i + 2]);}
              // alternate weighted luminosity method
              else if(this.options.grayType == 'lum2'){
                avg = (this.utils.altWeight.r * data[i] +
                      this.utils.altWeight.g * data[i + 1] +
                      this.utils.altWeight.b * data[i + 2]);}
              // lightness method
              else if(this.options.grayType == 'lgt'){
                avg = (Math.max(data[i], data[i + 1], data[i + 2]) + Math.min(data[i], data[i + 1], data[i + 2])) / 2;
              }
              // average method of grayscale
              else {avg = (data[i] + data[i + 1] + data[i + 2]) / 3;}

              count++;
              rgb.r += avg;
              rgb.g += avg;
              rgb.b += avg;
            }
            rgb.r = Math.floor(rgb.r / count);
            rgb.g = Math.floor(rgb.g / count);
            rgb.b = Math.floor(rgb.b / count);

            break;

        }
        // convert averaged color to closes allowed match
        return this.mapColorToPalette(rgb.r, rgb.g, rgb.b);

        // return rgb;
      }

      /**
      * use Euclidian distance to find closest color
      * @param {integer} red the numerical value of the red data in the pixel
      * @param {integer} green the numerical value of the green data in the pixel
      * @param {integer} blue the numerical value of the blue data in the pixel
      * @returns {object} a dictionary of keys r,g,b values are integers
      */
      mapColorToPalette(red, green, blue)  {
        var diffR, diffG, diffB, diffDistance;
        var distance = 25000;
        var mappedColor = null;
        // WEIGHTED
        for (var i = 0; i < this.options.palette.length; i++) {
          let rgb = this.options.palette[i];
          diffR = ((rgb.r - red)   * this.utils.weight.r);
          diffG = ((rgb.g - green) * this.utils.weight.g);
          diffB = ((rgb.b - blue)  * this.utils.weight.b);
          diffDistance = diffR * diffR + diffG * diffG + diffB * diffB;
          if (diffDistance < distance) {
            distance = diffDistance;
            mappedColor = rgb;
          }
        }
        // this returned undefined once, can't get that bug to happen again
        // for now just ensure there is always a color returned
        if(mappedColor === null){
          mappedColor = this.utils.rgb;
        }
        return mappedColor;
      } // end map color

      /**
      * Divides the whole canvas into smaller tiles and finds the average
      * colour of each block. After calculating the average colour, it stores
      * an array of the tiles as rgba strings and appends canvas to the dom
      */
      tileCanvas() {
        console.log(' ! calling tile canvas ! ');
        var mosaicCanvas = document.createElement('canvas'),
            width = mosaicCanvas.width = this.options.canvas.width,
            height = mosaicCanvas.height = this.options.canvas.height,
            passedContext = this.options.canvas.getContext('2d'),
            originalImageData = passedContext.getImageData(0, 0, width, height),
            mosaicContext = mosaicCanvas.getContext('2d');

        this.mosaicTileCount = [];
        this.mosaicRGBAStrings = [];
        for (var i = 0; i < this.options.tilesY; i++) {
          this.mosaicTileCount[i] = [];
          this.mosaicRGBAStrings[i] = [];
          for (var j = 0; j < this.options.tilesX; j++) {
            var x = j * this.options.tileWidth,
                y = i * this.options.tileHeight;
            var clusterData = this.getClusterData(x, y, width, originalImageData),
                averageColor = this.getAverageColor(clusterData),
                commaSeparated = averageColor.r + ', ' + averageColor.g + ', ' + averageColor.b,
                color = 'rgba(' + commaSeparated + ', ' + this.options.opacity + ')';
            this.mosaicTileCount[i].push('(' + commaSeparated + ')');
            this.mosaicRGBAStrings[i].push(color);
            mosaicContext.fillStyle = color;
            mosaicContext.fillRect(x, y, this.options.tileWidth, this.options.tileHeight);
            // super.createTiles(x, y, mosaicContext);
          }
        }

        // clear container and append mosaicCanvas to DOM
        this.options.targetElement.innerHTML = '';
        this.options.targetElement.appendChild(mosaicCanvas);
        // this.options.targetElement.appendChild(this.options.canvas);
      };
      /**
      * Creates an array of the image data of the tile from the data of whole image
      * @param  {number} startX            x coordinate of the tile
      * @param  {number} startY            y coordinate of the tile
      * @param  {number} width             width of the canvas
      * @param  {object} originalImageData imageData if the whole canvas
      * @return {array}                    Image data of a tile
      */
      getClusterData(startX, startY, width, originalImageData) {
        var data = [];
        var tileWidth = this.options.tileWidth;
        var tileHeight = this.options.tileHeight;
        for (var x = startX; x < (startX + tileWidth); x++) {
          var xPos = x * 4;
          for (var y = startY; y < (startY + tileHeight); y++) {
            var yPos = y * width * 4;
            data.push(
              originalImageData.data[xPos + yPos + 0],
              originalImageData.data[xPos + yPos + 1],
              originalImageData.data[xPos + yPos + 2],
              originalImageData.data[xPos + yPos + 3]
            );
          }
        }
        return data;
      };


      getBillOfMaterials(){
        if(this.mosaicTileCount.length == 0){
          throw new Error('No tiles were saved!');
        }
        // count up each color
        var index = this.options.tilesY;
        var row = this.options.tilesX;
        var count = {};

        for (var i = 0; i < index; i++) {
          for (var j = 0; j < row; j++) {
            let key = this.mosaicTileCount[i][j];
            if(count.hasOwnProperty(key)){
              count[key] += 1;
            }else{
              count[key] = 1;
            }
          }
        }

        // eventually get a final key value pair, but for now
        return count
      }
    } // end class ConvertPhoto


    return ConvertPhoto;

   })));

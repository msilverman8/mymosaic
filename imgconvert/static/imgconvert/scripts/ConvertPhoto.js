// based on https://github.com/ritz078/photomosaic.js
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.ConvertPhoto = factory());
}(this, (function () { 'use strict';

  const DEFAULTS = {
    colorChoice: 'BW',
    palette: [{r:0,g:0,b:0},{r:255,g:255,b:255}],
    grayType: 'lum',
    canvas: null,
    targetElement: null,
    tileSize: 5,
    tilesX: 64,
    tilesY: 64,
    opacity: 1,
  };
  const UTILS = {
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
  };
  class ConvertPhoto {
    constructor(options){
      console.log(' - calling convert - ');
      if (!options.canvas) {
        throw new Error('canvas options not passed!');
      }

      this.options = Object.assign({}, DEFAULTS, options);
      this.utils = Object.assign({}, UTILS);


      // rgb values saved as a string python tuple. no alpha channel included
      // '(r, g, b)'
      // grouped by rows index 0 contains all tiles left to right at row 0
      this.mosaicTileCount = [];
      // stores array of rows of tiles left to right as rgba strings
      // ready for context.fillStyle
      this.mosaicRGBAStrings = [];

    } // end constructor

    /**
    * averages a cluster(data) of rgb values then matches the color to the palette
    * @param  {Array} data     The data received by using the getImage() method
    * @return {Object}         The object containing the best match RGB value
    */
    getAverageColor (data, clusterSize) {
      var i = -4;
      var pixelInterval = clusterSize;
      var count = 0;
      var rgb = {r: 0, g: 0, b: 0};
      var length = data.length;

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
        var rgb = this.options.palette[i];
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
        mappedColor = {r: 0, g: 0, b: 0};
      }
      return mappedColor;
    } // end map color

    mappedArrayColor(red, green, blue){
      var diffR, diffG, diffB, diffDistance;
      var distance = 25000;
      var mappedColor = null;
      // WEIGHTED
      for (var i = 0; i < this.options.palette.length; i++) {
        var rgb = this.options.palette[i];
        diffR = ((rgb.r - red)   * this.utils.weight.r);
        diffG = ((rgb.g - green) * this.utils.weight.g);
        diffB = ((rgb.b - blue)  * this.utils.weight.b);
        diffDistance = diffR * diffR + diffG * diffG + diffB * diffB;
        if (diffDistance < distance) {
          distance = diffDistance;
          mappedColor = [rgb.r, rgb.g, rgb.b];
        }
      }
      // this returned undefined once, can't get that bug to happen again
      // for now just ensure there is always a color returned
      if(mappedColor === null){
        mappedColor = [0, 0, 0];
      }
      return mappedColor;
    }

    convertColor(imageData) {
      var data = imageData.data;
      for (var i = 0; i < data.length; i+=4) {
        let newData = this.mappedArrayColor( data[i], data[i + 1], data[i + 2] );
        data[i] = newData[0];
        data[i + 1] = newData[0 + 1];
        data[i + 2] = newData[0 + 2];
      }
      return imageData
    }

    adjustMosaicDisplay(canvas, displaySize) {
      canvas.width = this.options.tilesX / this.options.displaySize;
      canvas.height = this.options.tilesY / this.options.displaySize;
    }

    resizeCreatedCanvas (newWidth, newHeight, canvas){
      // make sure there is a canvas
      if( !canvas || canvas instanceof HTMLCanvasElement ||
          !this.mosaicCanvas || !this.mosaicCanvas instanceof HTMLCanvasElement){
            throw new Error('no canvas to resize');
      }
      if( !this.mosaicRGBAStrings || !Array.isArray(this.mosaicRGBAStrings) ||
          this.mosaicRGBAStrings.length == 0){
            throw new Error('no stored tile list, make sure to create mosaic first');
      }
      // get new tile size
      const newTileSize = newWidth / this.options.tilesX;

      // get canvas context
      canvas = canvas || this.mosaicCanvas;
      const ctx = canvas.getContext('2d');
      for (var i = 0; i < newHeight; i++) {
        for (var j = 0; j < newWidth; j++) {
          // get cluster
          var x = j * newTileSize,
              y = i * newTileSize;
          // get stored color
          ctx.fillStyle = this.mosaicRGBAStrings[i][j];
          // output tile to canvas
          ctx.fillRect(x, y, newTileSize, newTileSize);
        }
      }

    } // end resize

    getOutputSize() {
      var clusterSize = 1;
      var cluster = false;
      if(this.options.canvas.width > this.options.tilesX){
        // cluster size is
        clusterSize = Math.floor(this.options.canvas.width / this.options.tilesX);


        this.clusterSpare = this.options.canvas.width % this.options.tilesX;
        cluster = true;
      }
      // this.options.canvas.width < this.options.tilesX
        // no cluster conversion needed but what do here

      return {
        w: this.options.tilesX * this.options.tileSize,
        h: this.options.tilesY * this.options.tileSize,
        clusterSize: clusterSize,
      }
    }

    /**
     * Hermite resize - fast image resize/resample using Hermite filter. 1 cpu version!
     *
     * @param {HtmlElement} canvas
     * @param {int} width
     * @param {int} height
     * @param {boolean} resize_canvas if true, canvas will be resized. Optional.
     */
    resample_single() {
      var width_source = this.options.canvas.width;
      var height_source = this.options.canvas.height;
      var width = this.options.tilesX;
      var height = this.options.tilesY;

      var ratio_w = width_source / width;
      var ratio_h = height_source / height;
      var ratio_w_half = Math.ceil(ratio_w / 2);
      var ratio_h_half = Math.ceil(ratio_h / 2);

      var ctx = this.options.canvas.getContext("2d");
      // get source image data with source dimensions
      var img = ctx.getImageData(0, 0, width_source, height_source);
      // create image data for the destination dimensions
      var img2 = ctx.createImageData(width, height);
      var data = img.data; // source
      var data2 = img2.data; // destination

      for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
          var x2 = (i + j * width) * 4; // get martrix grid index?
          var weight = 0;
          var weights = 0;
          var weights_alpha = 0;
          var gx_r = 0;
          var gx_g = 0;
          var gx_b = 0;
          var gx_a = 0;
          var center_y = (j + 0.5) * ratio_h;
          var yy_start = Math.floor(j * ratio_h);
          var yy_stop = Math.ceil((j + 1) * ratio_h);
          for (var yy = yy_start; yy < yy_stop; yy++) {
            var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
            var center_x = (i + 0.5) * ratio_w;
            var w0 = dy * dy; //pre-calc part of w
            var xx_start = Math.floor(i * ratio_w);
            var xx_stop = Math.ceil((i + 1) * ratio_w);
            for (var xx = xx_start; xx < xx_stop; xx++) {
              var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
              var w = Math.sqrt(w0 + dx * dx);
              if (w >= 1) {
                  //pixel too far
                  continue;
              }
              //hermite filter
              weight = 2 * w * w * w - 3 * w * w + 1;
              var pos_x = 4 * (xx + yy * width_source);
              //alpha
              gx_a += weight * data[pos_x + 3];
              weights_alpha += weight;
              //colors
              if (data[pos_x + 3] < 255) { weight = weight * data[pos_x + 3] / 250; }

              gx_r += weight * data[pos_x];
              gx_g += weight * data[pos_x + 1];
              gx_b += weight * data[pos_x + 2];
              weights += weight;
            }
          }
          data2[x2] = gx_r / weights;
          data2[x2 + 1] = gx_g / weights;
          data2[x2 + 2] = gx_b / weights;
          data2[x2 + 3] = gx_a / weights_alpha;
        }
      }
      //clear and resize canvas
      // this.options.canvas.width = width;
      // this.options.canvas.height = height;

      // match colors
      this.mosaicColorData = this.convertColor(img2).data;
      // img2 = this.convertColor(img2);
      // store color array as canvas imagedata.data
      // this.mosaicColorData = img2.data;
      //draw
      // ctx.putImageData(img2, 0, 0);

      // return this.options.canvas
    }

    createTiles(){
      // get values needed for process
      const s = this.options.tileSize;
      const w = this.options.tilesX;
      const h = this.options.tilesY;
      const canvas = this.options.canvas;
      // shrink canvas and convert color
      if(canvas.width != w || canvas.height != h){ this.resample_single(); }
      else { // already shrunk just convert color
        let ctx = canvas.getContext('2d');
        let imda = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // match  & store colors
        this.mosaicColorData = this.convertColor(imda).data;
      }
      // get output info
      const mosaicCanvas = document.createElement('canvas');
      const mosaicContext = mosaicCanvas.getContext('2d');
      mosaicCanvas.width = w * s;
      mosaicCanvas.height = h * s;

      const plateBorders = this.getCaps();
      // iterate through to get tiles
      for (var i = 0; i < h; i++) {
        for (var j = 0; j < w; j++) {
          let index = (j + (i * w)) * 4;
          // for dev color tiles lime green data errored
          let missing = [57, 255, 20, 255];
          var color = [];
          // get color from stored data
          getcolorloop:for (let c = 0; c < 4; c++) {
            var r = this.mosaicColorData[index + c];
            if(r === undefined || r === null){
              color = missing;
              break getcolorloop;
            }
            color.push(r);
          }
          // output tile to canvas
          mosaicContext.fillStyle = 'rgb('+ color[0] +','+ color[1] +','+ color[2] +','+ color[3]/255 +')';
          mosaicContext.fillRect((j * s) , (i * s), s, s);

          // // stroke each tile
          // mosaicContext.stroke = 'rgba(255, 255, 255, 255)';
          // mosaicContext.strokeRect((j * s) , (i * s), s, s);
          // // highlight borders of the plate
          // if(plateBorders.x.includes(j) || plateBorders.y.includes(i)){
          //   mosaicContext.fillStyle = 'rgba(255, 255, 255, .5)';
          //   mosaicContext.fillRect((j * s) , (i * s), s, s);
          // }
        }
      }

      this.mosaicCanvas = mosaicCanvas;
      return mosaicCanvas
    }


    /**
    * Divides the whole canvas into smaller tiles and finds the average
    * colour of each block. After calculating the average colour, it stores
    * an array of the tiles as rgba strings and appends canvas to the dom
    */
    tileCanvas() {
      console.log(' ! calling tile canvas ! ');
      // this.options.targetElement.appendChild(this.options.canvas);
      // get output info
      var mosaicCanvas = document.createElement('canvas');
      if(this.options.classname){mosaicCanvas.classList.add(this.options.classname);}
      var mosaicContext = mosaicCanvas.getContext('2d');
      const { w, h, clusterSize, cluster } = this.getOutputSize();
      mosaicCanvas.width = w;
      mosaicCanvas.height = h;
      // get tiler info
      var width = this.options.canvas.width;
      var height = this.options.canvas.height;
      var passedContext = this.options.canvas.getContext('2d');
      var passedImageData = this.options.imageData || passedContext.getImageData(0, 0, width, height);
      // var index = x + (y * width); // image data

      // set up storage of mosaic data
      this.mosaicTileCount = [];
      this.mosaicRGBAStrings = [];
      this.mosaicImageData = []; // 2d matrix notation
      var x, y, clusterData, averageColor, commaSeparated, color;
      var s = cluster ? clusterSize : this.options.tileSize;
      const plateBorders = this.getCaps();
      // iterate through to get tiles
      for (var i = 0; i < this.options.tilesY; i++) {
        // store colors
        this.mosaicTileCount[i] = [];
        this.mosaicRGBAStrings[i] = [];
        for (var j = 0; j < this.options.tilesX; j++) {
          // get cluster
          x = j * clusterSize;
          y = i * clusterSize;
          // convert colors for this cluster
          clusterData = this.getClusterData(x, y, passedImageData, clusterSize);
          averageColor = this.getAverageColor(clusterData, clusterSize);
          // get storable objects
          commaSeparated = averageColor.r + ', ' + averageColor.g + ', ' + averageColor.b;
          color = 'rgba(' + commaSeparated + ', ' + this.options.opacity + ')';
          // store tile color
          // this.mosaicImageData[(i * this.options.tilesX) + j].push([averageColor.r, averageColor.g, averageColor.b, this.options.opacity]);
          this.mosaicTileCount[i].push('(' + commaSeparated + ')');
          this.mosaicRGBAStrings[i].push(color);
          // output tile to canvas
          // output canvas may be different size than the clustered canvas
          mosaicContext.fillStyle = color;
          mosaicContext.fillRect((j * s) , (i * s), s, s);

          // stroke each tile
          mosaicContext.stroke = 'rgba(255, 255, 255, 255)';
          mosaicContext.strokeRect((j * s) , (i * s), s, s);
          // highlight borders of the plate
          if(plateBorders.x.includes(j) || plateBorders.y.includes(i)){
            mosaicContext.fillStyle = 'rgba(255, 255, 255, .5)';
            mosaicContext.fillRect((j * s) , (i * s), s, s);
          }
        }
      }

      // clear container and append mosaicCanvas to DOM
      // this.options.targetElement.innerHTML = '';
      // this.options.targetElement.appendChild(mosaicCanvas);
      // this.options.targetElement.appendChild(this.options.canvas);
      this.mosaicCanvas = mosaicCanvas;
      return mosaicCanvas
    };

    /**
     * calculates each plate border index for the mosaic imagedata array
     * @return {[object]} [returns array of indicies where the plate borders are]
     */
    getCaps() {
      const iterator = {x:[...Array(this.options.tilesX).keys()], y:[...Array(this.options.tilesY).keys()]}
      const size = 32;
      const caps = {x:[], y:[]};
      for(const [key, val] of Object.entries(iterator)) {
        let i = 0;
        while (i < val.length) {
          let chunk = val.slice(i, size + i);
          caps[key].push(chunk[0]);
          caps[key].push(chunk[chunk.length-1]);
          i += size;
        }
      };
      return caps;
    }

    /**
    * Creates an array of the image data of the tile from the data of whole image
    * @param  {number} startX            x coordinate of the first pixel in the tile
    * @param  {number} startY            y coordinate of the first pixel in the tile
    * @param  {number} width             width of the canvas
    * @param  {object} imageData         imageData if the whole canvas
    * @return {array}                    Image data cluster of a tile
    */
    getClusterData(startX, startY, imageData, clusterSize) {
      // should double check this doesn't combine the end of a row and
      // the start of the next row
      var data = [];
      const width = imageData.width;
      for (var x = startX; x < (startX + clusterSize); x++) {
        var xPos = x * 4;
        for (var y = startY; y < (startY + clusterSize); y++) {
          var yPos = y * width * 4;
          data.push(
            imageData.data[xPos + yPos + 0],
            imageData.data[xPos + yPos + 1],
            imageData.data[xPos + yPos + 2],
            imageData.data[xPos + yPos + 3]
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

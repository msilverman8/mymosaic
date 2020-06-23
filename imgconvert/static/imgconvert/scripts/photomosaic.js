//https://github.com/ritz078/photomosaic.js
(function(window) {

    'use-strict';

    function PhotoMosaic(options) {
        console.log(' ~~ calling photo mosaic ~~');
        if (!options.canvas) {
            throw new Error('canvas options is not passed');
        }
        if (!options.palette) {
            throw new Error('palette options is not passed');
        }
        if (!options.targetElement) {
            throw new Error('targetElement is not passed in options');
        }

        this.options = this.extend(this.defaults, options);

    }

    /**
     * Extends a Javascript Object
     * @param  {object} destination The object in which the final extended values are save
     * @param  {object} sources     The objects to be extended
     * @return {}
     */
    PhotoMosaic.prototype.extend = function(destination, sources) {
        for (var source in sources) {
            if (sources.hasOwnProperty(source)) {
                destination[source] = sources[source];
            }
        }
        return destination;
    };

    /**
     * The defaults options object
     * @type {Object}
     */
    PhotoMosaic.prototype.defaults = {
        'imageData': null,
        'palette': null,
        'canvas': null,
        'targetElement': null,
        'tileWidth': 5,
        'tileHeight': 5,
        'tileShape': 'circle',
        'opacity': 1,
        'width': null,
        'height': null
    };

    /**
     * Returns the average color of the canvas.
     * @param  {Array} data     The data received by using the getImage() method
     * @return {Object}         The object containing the RGB value
     */
    PhotoMosaic.prototype.getAverageColor = function(data) {
        var i = -4,
            pixelInterval = 5,
            // pixelInterval = this.options.tileWidth,
            count = 0,
            rgb = {
                r: 0,
                g: 0,
                b: 0
            },
            length = data.length;

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

        // convert averaged color to closes allowed match
        return this.mapColorToPalette(rgb.r, rgb.g, rgb.b);

        // return rgb;
    };


    /**
    * use Euclidian distance to find closest color
    * @param {integer} red the numerical value of the red data in the pixel
    * @param {integer} green the numerical value of the green data in the pixel
    * @param {integer} blue the numerical value of the blue data in the pixel
    * @returns {object} a dictionary of keys r,g,b values are integers
    */
    PhotoMosaic.prototype.mapColorToPalette = function(red, green, blue)  {
        var diffR, diffG, diffB, diffDistance, mappedColor;
        var distance = 25000;
        this.options.palette.forEach((rgb) => {
          diffR = (rgb.r - red);
          diffG = (rgb.g - green);
          diffB = (rgb.b - blue);
          diffDistance = diffR * diffR + diffG * diffG + diffB * diffB;
          if (diffDistance < distance) {
              distance = diffDistance;
              mappedColor = rgb;
          };
        });
        return (mappedColor);
    } // end map color

    /**
     * Divides the whole canvas into smaller tiles and finds the average
     * colour of each block. After calculating the average colour, it stores
     * the data into an array.
     *
     * @param context   Context of the canvas
     */
    PhotoMosaic.prototype.tileCanvas = function() {
        var width = this.options.canvas.width;
        var height = this.options.canvas.height;
        var passedContext = this.options.canvas.getContext('2d');
        var originalImageData = passedContext.getImageData(0, 0, this.options.canvas.width, this.options.canvas.height);

        for (var i = 0; i < this.options.divY; i++) {
            for (var j = 0; j < this.options.divX; j++) {
                var x = j * this.options.tileWidth,
                    y = i * this.options.tileHeight;
                var imageData = this.getImageData(x, y, width, originalImageData);
                var averageColor = this.getAverageColor(imageData);
                var color = 'rgba(' + averageColor.r + ',' + averageColor.g + ',' + averageColor.b + ',' + this.options.opacity + ')';
                passedContext.fillStyle = color;
                this.createMosaic(x, y, passedContext);
            }

        }

        // clear container
        this.options.targetElement.innerHTML = '';
        this.options.targetElement.appendChild(this.options.canvas);
    };


    /**
     * Creates an array of the image data of the tile from the data of whole image
     * @param  {number} startX            x coordinate of the tile
     * @param  {number} startY            y coordinate of the tile
     * @param  {number} width             width of the canvas
     * @param  {object} originalImageData imageData if the whole canvas
     * @return {array}                    Image data of a tile
     */
    PhotoMosaic.prototype.getImageData = function (startX, startY, width, originalImageData) {
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

    /**
     * Creates a block of the mosaic. This is called divX*divY times to create all blocks
     * of the mosaic.
     * @param  {number} x          x coordinate of the block
     * @param  {number} y          y coordinate of the block
     * @param  {object} context    Context of the result canvas
     * @return {}
     */
    PhotoMosaic.prototype.createMosaic = function(x, y, context) {

        var tileWidth = this.options.tileWidth;
        var tileHeight = this.options.tileHeight;

        if (this.options.tileShape === 'circle') {
            var centerX = x + tileWidth / 2;
            var centerY = y + tileHeight / 2;
            var radius = Math.min(tileWidth, tileHeight) / 2;
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            context.closePath();
            context.fill();
        } else if (this.options.tileShape === 'rectangle') {
            var height = tileHeight;
            var width = tileWidth;
            context.beginPath();
            context.rect(x, y, width, height);
            context.fill();
            context.closePath();
        }
    };

    window.PhotoMosaic = PhotoMosaic;
}(window));

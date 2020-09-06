(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

// detects the faces an image and returns the bounding box including all faces
(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : (0, _typeof2["default"])(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = global || self, global.AutoFace = factory());
})(void 0, function () {
  'use strict';

  var DEFAULTS = {
    image: null,
    aspectRatio: 1
  }; // get api

  var faceapi = window.faceapi; // load model

  loadModel()["catch"](function (e) {
    console.warn(e);
  }); // checks if model is loaded for face api, if not it loads it

  function loadModel() {
    return _loadModel.apply(this, arguments);
  }
  /**
   * uses face-api.js to detect faces and then returns dimension to auto crop area to include the faces
   */


  function _loadModel() {
    _loadModel = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var url;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              console.log('checking for face detect model'); // load the model for face-api

              if (faceapi.nets.tinyFaceDetector.isLoaded) {
                _context2.next = 6;
                break;
              }

              console.log('model not loaded, loading now');
              url = 'static/build/manualAdds/';
              _context2.next = 6;
              return faceapi.nets.tinyFaceDetector.loadFromUri(url);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _loadModel.apply(this, arguments);
  }

  var AutoFace = /*#__PURE__*/function () {
    function AutoFace(options) {
      (0, _classCallCheck2["default"])(this, AutoFace);

      if (!options.image) {
        throw new Error("image not passed with call to find face!");
      } // get instance options


      this.options = Object.assign({}, DEFAULTS, options); // get the display dimensions of the image to get accurate face bounds

      if (!options.hasOwnProperty('displaySize')) {
        var ic = this.options.image.parentElement;

        if (!ic) {
          ic = {
            clientWidth: 0,
            clientHeight: 0
          };
        }

        ;
        this.options.displaySize = {
          width: ic.clientWidth,
          height: ic.clientHeight
        };
      } // detect faces and get face detection object


      this.results = this._init()["catch"](function (e) {
        console.warn(e);
      });

      if (this.options.useOriginal) {
        // sending over getData
        this.maxWidth = this.options.image.naturalWidth;
        this.maxHeight = this.options.image.naturalHeight;
      } else {
        // calculating here based on display size and using set cropbox on main
        this.maxWidth = this.options.displaySize.width;
        this.maxHeight = this.options.displaySize.height;
      }
    }
    /**
     * loads the model for faceapi (using tiny model)
     * calls detect all faces, and resizes it to match the displayed image
     * and not the original upload dimensions
     *
     * @return {Promise} [the final crop area]
     */


    (0, _createClass2["default"])(AutoFace, [{
      key: "_init",
      value: function () {
        var _init2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
          var detections, finalDetections, method, faceBounds;
          return _regenerator["default"].wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  console.log('initializing face bounds'); // check if model loaded for face-api

                  _context.next = 3;
                  return loadModel();

                case 3:
                  _context.next = 5;
                  return faceapi.detectAllFaces(this.options.image, new faceapi.TinyFaceDetectorOptions());

                case 5:
                  detections = _context.sent;
                  method = "_getFaceArea";

                  if (this.options.zoomedDetections) {
                    finalDetections = faceapi.resizeResults(detections, this.options.zoomedSize);
                    method = "_getFaceArea2";
                  } else if (this.options.useOriginal) {
                    finalDetections = detections;
                  } else {
                    finalDetections = faceapi.resizeResults(detections, this.options.displaySize);
                  } // get the face bounds


                  faceBounds = this[method](finalDetections); // get the crop bounds

                  return _context.abrupt("return", this._getAutoCropBounds(faceBounds));

                case 10:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function _init() {
          return _init2.apply(this, arguments);
        }

        return _init;
      }() // end init

    }, {
      key: "_getFaceArea",
      value: function _getFaceArea(detections) {
        // get the data for cropper
        console.log('getting the face area');
        var x = this.maxWidth;
        var y = this.maxHeight;
        var bounds = {
          x: x,
          y: y,
          x_max: 0,
          y_max: 0,

          get w() {
            return this.x_max - this.x;
          },

          get h() {
            return this.y_max - this.y;
          }

        };

        if (detections.length) {
          console.log("".concat(detections.length, " faces found!"));

          for (var i = 0; i < detections.length; i++) {
            // the docs don't have anything on just returning the location?
            // maybe look into that method that returns a canvas of the face????
            var face = detections[i]._box;
            var _x = face._x;
            var _y = face._y; // console.log(`face-${i} coords: (${x}, ${y})`);

            var x_max = _x + face._width;
            var y_max = _y + face._height;
            bounds.x = Math.min(bounds.x, _x);
            bounds.y = Math.min(bounds.y, _y);
            bounds.x_max = Math.max(bounds.x_max, x_max);
            bounds.y_max = Math.max(bounds.y_max, y_max);
          }

          return bounds;
        }

        return false;
      }
      /**
       * calculations necessary to get the new crop area bounds based on received
       * detected face bounds
       * @param  {[object]} facebounds [x, y, w, h] of the detected face location
       * @return {[object]}            [top or y, left or x, width, height] of the new cropping area bounds
       */

    }, {
      key: "_getAutoCropBounds",
      value: function _getAutoCropBounds(facebounds) {
        // no faces detected
        if (!facebounds) {
          console.log('no faces detected');
          return false;
        } // get the values for the merged faces calculated bounds


        var w = facebounds.w,
            h = facebounds.h,
            x = facebounds.x,
            y = facebounds.y; // get aspect ratio

        var ar = this.options.aspectRatio; // final dimensions

        var outputHeight = h;
        var outputWidth = outputHeight * ar; // make sure using as much from found faces as possible

        if (outputWidth < w) {
          outputWidth = w;
          outputHeight = outputWidth / ar; // make sure new height does not exceed original image height

          if (outputHeight > this.maxHeight) {
            outputHeight = this.maxHeight;
            outputWidth = outputHeight * ar;
          }
        } // center bounds in image as much as possible


        var outputX = Math.max(0, x - (outputWidth - w) * 0.5);
        var outputY = Math.max(0, y - (outputHeight - h) * 0.5); // dictionary formatted specifically for cropper

        var cdata = {
          left: outputX,
          top: outputY,
          width: outputWidth,
          height: outputHeight
        }; // add padding around face box
        // const p = 0; // .08;
        // const padding = Math.ceil(Math.min(outputWidth, outputHeight) * p);
        //
        // let paddedWidth = outputWidth + padding;
        // let paddedHeight = outputHeight + padding;
        // // make sure padding doesn't make the area exceed original image
        // let usePadding = (paddedWidth <= this.options.displaySize.width && paddedHeight <= this.options.displaySize.height);
        //
        // let cdata;
        // if(usePadding) {
        //   cdata = {
        //     left: Math.max(0, (outputX - padding)),
        //     top: Math.max(0, (outputY - padding)),
        //     width: paddedWidth,
        //     height: paddedHeight,
        //   };
        // }

        console.table({
          'x, y': [x, y],
          'face': [w, h],
          'imag': [this.options.displaySize.width, this.options.displaySize.height],
          'n xy': [outputX, outputY],
          'finl': [outputWidth, outputHeight],
          'r XY': [cdata.left, cdata.top],
          'r WH': [cdata.width, cdata.height]
        }); // left and top is for set crop box
        // x and y is for set data

        if (this.options.useOriginal) {
          cdata.x = cdata.left;
          cdata.y = cdata.top;
          delete cdata.left;
          delete cdata.top;
        }

        return cdata;
      } // end get crop area

      /**
       * gets one box dimension from the array of boxes (face detections)
       * @param  {[array]} resizedDetections [the resized face detection array]
       * @return {[object]}                   [x, y, w, h that contains all faces]
       */

    }, {
      key: "_getFaceArea2",
      value: function _getFaceArea2(resizedDetections) {
        // get the data for cropper
        console.log('getting the face area');
        var x = this.maxWidth;
        var y = this.maxHeight;
        var bounds = {
          x: x,
          y: y,
          x_max: 0,
          y_max: 0,

          get w() {
            return this.x_max - this.x;
          },

          get h() {
            return this.y_max - this.y;
          }

        };

        if (resizedDetections.length) {
          console.log("".concat(resizedDetections.length, " faces found!"));
          var left = 0,
              top = 0; // the image is resized, but overflowing the container, so get the left and top amount to adjust

          if (this.options.zoomedDetections) {
            left = this.options.zoomedPosition.left;
            top = this.options.zoomedPosition.top;
          }

          for (var i = 0; i < resizedDetections.length; i++) {
            // the docs don't have anything on just returning the location?
            // maybe look into that method that returns a canvas of the face????
            var face = resizedDetections[i]._box;

            var _x2 = face._x + left;

            var _y2 = face._y + top; // console.log(`face-${i} coords: (${x}, ${y})`);


            var x_max = _x2 + face._width;
            var y_max = _y2 + face._height;
            bounds.x = Math.min(bounds.x, _x2);
            bounds.y = Math.min(bounds.y, _y2);
            bounds.x_max = Math.max(bounds.x_max, x_max);
            bounds.y_max = Math.max(bounds.y_max, y_max);
          }

          return bounds;
        }

        return false;
      } // end get face area

    }]);
    return AutoFace;
  }(); // end class


  return AutoFace;
});

},{"@babel/runtime/helpers/asyncToGenerator":9,"@babel/runtime/helpers/classCallCheck":10,"@babel/runtime/helpers/createClass":11,"@babel/runtime/helpers/interopRequireDefault":12,"@babel/runtime/helpers/typeof":19,"@babel/runtime/regenerator":21}],2:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

// based on https://github.com/ritz078/photomosaic.js
(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : (0, _typeof2["default"])(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = global || self, global.ConvertPhoto = factory());
})(void 0, function () {
  'use strict';

  var DEFAULTS = {
    colorChoice: 'BW',
    palette: [{
      r: 0,
      g: 0,
      b: 0
    }, {
      r: 255,
      g: 255,
      b: 255
    }],
    grayType: 'lum',
    canvas: null,
    targetElement: null,
    tileSize: 5,
    tilesX: 64,
    tilesY: 64,
    opacity: 1
  };
  var UTILS = {
    // human perception of color gives weight to the importance of each channel
    weight: {
      r: 0.3,
      g: 0.59,
      b: 0.11
    },
    // an alternate weight set was found
    altWeight: {
      r: 0.21,
      g: 0.72,
      b: 0.07
    },
    rgb: {
      r: 0,
      g: 0,
      b: 0
    }
  };

  var ConvertPhoto = /*#__PURE__*/function () {
    function ConvertPhoto(options) {
      (0, _classCallCheck2["default"])(this, ConvertPhoto);
      console.log(' - initializing convert - ');

      if (!options.canvas) {
        throw new Error('canvas options not passed!');
      }

      this.options = Object.assign({}, DEFAULTS, options);
      this.utils = Object.assign({}, UTILS); // rgb values saved as a string python tuple. no alpha channel included
      // '(r, g, b)'
      // grouped by rows index 0 contains all tiles left to right at row 0

      this.mosaicTileCount = []; // stores array of rows of tiles left to right as rgba strings
      // ready for context.fillStyle

      this.mosaicRGBAStrings = [];
    } // end constructor

    /**
    * averages a cluster(data) of rgb values then matches the color to the palette
    * @param  {Array} data     The data received by using the getImage() method
    * @return {Object}         The object containing the best match RGB value
    */


    (0, _createClass2["default"])(ConvertPhoto, [{
      key: "getAverageColor",
      value: function getAverageColor(data, clusterSize) {
        var i = -4;
        var pixelInterval = clusterSize;
        var count = 0;
        var rgb = {
          r: 0,
          g: 0,
          b: 0
        };
        var length = data.length;

        switch (this.options.colorChoice) {
          case 'AL':
          case 'CL':
            // color
            while ((i += pixelInterval * 4) < length) {
              count++;
              rgb.r += data[i] * data[i];
              rgb.g += data[i + 1] * data[i + 1];
              rgb.b += data[i + 2] * data[i + 2];
            } // Return the sqrt of the mean of squared R, G, and B sums


            rgb.r = Math.floor(Math.sqrt(rgb.r / count));
            rgb.g = Math.floor(Math.sqrt(rgb.g / count));
            rgb.b = Math.floor(Math.sqrt(rgb.b / count));
            break;

          case 'BW': // should bw use this same conversion????

          case 'GR':
            // grayscale
            while ((i += pixelInterval * 4) < length) {
              var avg = 0; // luminosity method

              if (this.options.grayType == 'lum') {
                avg = this.utils.weight.r * data[i] + this.utils.weight.g * data[i + 1] + this.utils.weight.b * data[i + 2];
              } // alternate weighted luminosity method
              else if (this.options.grayType == 'lum2') {
                  avg = this.utils.altWeight.r * data[i] + this.utils.altWeight.g * data[i + 1] + this.utils.altWeight.b * data[i + 2];
                } // lightness method
                else if (this.options.grayType == 'lgt') {
                    avg = (Math.max(data[i], data[i + 1], data[i + 2]) + Math.min(data[i], data[i + 1], data[i + 2])) / 2;
                  } // average method of grayscale
                  else {
                      avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    }

              count++;
              rgb.r += avg;
              rgb.g += avg;
              rgb.b += avg;
            }

            rgb.r = Math.floor(rgb.r / count);
            rgb.g = Math.floor(rgb.g / count);
            rgb.b = Math.floor(rgb.b / count);
            break;
        } // convert averaged color to closes allowed match


        return this.mapColorToPalette(rgb.r, rgb.g, rgb.b); // return rgb;
      }
      /**
      * use Euclidian distance to find closest color
      * @param {integer} red the numerical value of the red data in the pixel
      * @param {integer} green the numerical value of the green data in the pixel
      * @param {integer} blue the numerical value of the blue data in the pixel
      * @returns {object} a dictionary of keys r,g,b values are integers
      */

    }, {
      key: "mapColorToPalette",
      value: function mapColorToPalette(red, green, blue) {
        var diffR, diffG, diffB, diffDistance;
        var distance = 25000;
        var mappedColor = null; // WEIGHTED

        for (var i = 0; i < this.options.palette.length; i++) {
          var rgb = this.options.palette[i];
          diffR = (rgb.r - red) * this.utils.weight.r;
          diffG = (rgb.g - green) * this.utils.weight.g;
          diffB = (rgb.b - blue) * this.utils.weight.b;
          diffDistance = diffR * diffR + diffG * diffG + diffB * diffB;

          if (diffDistance < distance) {
            distance = diffDistance;
            mappedColor = rgb;
          }
        } // this returned undefined once, can't get that bug to happen again
        // for now just ensure there is always a color returned


        if (mappedColor === null) {
          mappedColor = {
            r: 0,
            g: 0,
            b: 0
          };
        }

        return mappedColor;
      } // end map color

    }, {
      key: "mappedArrayColor",
      value: function mappedArrayColor(red, green, blue) {
        var diffR, diffG, diffB, diffDistance;
        var distance = 25000;
        var mappedColor = null; // WEIGHTED

        for (var i = 0; i < this.options.palette.length; i++) {
          var rgb = this.options.palette[i];
          diffR = (rgb.r - red) * this.utils.weight.r;
          diffG = (rgb.g - green) * this.utils.weight.g;
          diffB = (rgb.b - blue) * this.utils.weight.b;
          diffDistance = diffR * diffR + diffG * diffG + diffB * diffB;

          if (diffDistance < distance) {
            distance = diffDistance;
            mappedColor = [rgb.r, rgb.g, rgb.b];
          }
        } // this returned undefined once, can't get that bug to happen again
        // for now just ensure there is always a color returned


        if (mappedColor === null) {
          mappedColor = [0, 0, 0];
        }

        return mappedColor;
      }
    }, {
      key: "convertColor",
      value: function convertColor(imageData) {
        var data = imageData.data;

        for (var i = 0; i < data.length; i += 4) {
          var newData = this.mappedArrayColor(data[i], data[i + 1], data[i + 2]);
          data[i] = newData[0];
          data[i + 1] = newData[0 + 1];
          data[i + 2] = newData[0 + 2];
        }

        return imageData;
      }
    }, {
      key: "adjustMosaicDisplay",
      value: function adjustMosaicDisplay(canvas, displaySize) {
        canvas.width = this.options.tilesX / this.options.displaySize;
        canvas.height = this.options.tilesY / this.options.displaySize;
      }
    }, {
      key: "resizeCreatedCanvas",
      value: function resizeCreatedCanvas(newWidth, newHeight, canvas) {
        // make sure there is a canvas
        if (!canvas || canvas instanceof HTMLCanvasElement || !this.mosaicCanvas || !this.mosaicCanvas instanceof HTMLCanvasElement) {
          throw new Error('no canvas to resize');
        }

        if (!this.mosaicRGBAStrings || !Array.isArray(this.mosaicRGBAStrings) || this.mosaicRGBAStrings.length == 0) {
          throw new Error('no stored tile list, make sure to create mosaic first');
        } // get new tile size


        var newTileSize = newWidth / this.options.tilesX; // get canvas context

        canvas = canvas || this.mosaicCanvas;
        var ctx = canvas.getContext('2d');

        for (var i = 0; i < newHeight; i++) {
          for (var j = 0; j < newWidth; j++) {
            // get cluster
            var x = j * newTileSize,
                y = i * newTileSize; // get stored color

            ctx.fillStyle = this.mosaicRGBAStrings[i][j]; // output tile to canvas

            ctx.fillRect(x, y, newTileSize, newTileSize);
          }
        }
      } // end resize

    }, {
      key: "getOutputSize",
      value: function getOutputSize() {
        var clusterSize = 1;
        var cluster = false;

        if (this.options.canvas.width > this.options.tilesX) {
          // cluster size is
          clusterSize = Math.floor(this.options.canvas.width / this.options.tilesX);
          this.clusterSpare = this.options.canvas.width % this.options.tilesX;
          cluster = true;
        } // this.options.canvas.width < this.options.tilesX
        // no cluster conversion needed but what do here


        return {
          w: this.options.tilesX * this.options.tileSize,
          h: this.options.tilesY * this.options.tileSize,
          clusterSize: clusterSize
        };
      }
      /**
       * Hermite resize - fast image resize/resample using Hermite filter. 1 cpu version!
       *
       * @param {HtmlElement} canvas
       * @param {int} width
       * @param {int} height
       * @param {boolean} resize_canvas if true, canvas will be resized. Optional.
       */

    }, {
      key: "resample_single",
      value: function resample_single() {
        var width_source = this.options.canvas.width;
        var height_source = this.options.canvas.height;
        var width = this.options.tilesX;
        var height = this.options.tilesY;
        var ratio_w = width_source / width;
        var ratio_h = height_source / height;
        var ratio_w_half = Math.ceil(ratio_w / 2);
        var ratio_h_half = Math.ceil(ratio_h / 2);
        var ctx = this.options.canvas.getContext("2d"); // get source image data with source dimensions

        var img = ctx.getImageData(0, 0, width_source, height_source); // create image data for the destination dimensions

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
                } //hermite filter


                weight = 2 * w * w * w - 3 * w * w + 1;
                var pos_x = 4 * (xx + yy * width_source); //alpha

                gx_a += weight * data[pos_x + 3];
                weights_alpha += weight; //colors

                if (data[pos_x + 3] < 255) {
                  weight = weight * data[pos_x + 3] / 250;
                }

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
        } //clear and resize canvas
        // this.options.canvas.width = width;
        // this.options.canvas.height = height;
        // match colors


        this.mosaicColorData = this.convertColor(img2).data; // img2 = this.convertColor(img2);
        // store color array as canvas imagedata.data
        // this.mosaicColorData = img2.data;
        //draw
        // ctx.putImageData(img2, 0, 0);
        // return this.options.canvas
      }
    }, {
      key: "createTiles",
      value: function createTiles() {
        // get values needed for process
        var s = this.options.tileSize;
        var w = this.options.tilesX;
        var h = this.options.tilesY;
        var canvas = this.options.canvas; // shrink canvas and convert color

        if (canvas.width != w || canvas.height != h) {
          console.log('%c using canvas downsample', 'color:brown;');
          this.resample_single();
        } else {
          // already shrunk just convert color
          console.log('%c preshrunk', 'color:green;');
          var ctx = canvas.getContext('2d');
          var imda = ctx.getImageData(0, 0, canvas.width, canvas.height); // match  & store colors

          this.mosaicColorData = this.convertColor(imda).data;
        } // get output info


        var mosaicCanvas = document.createElement('canvas');
        var mosaicContext = mosaicCanvas.getContext('2d');
        mosaicCanvas.width = w * s;
        mosaicCanvas.height = h * s;
        this.forCheck = [];
        var plateBorders = this.getCaps(); // iterate through to get tiles

        for (var i = 0; i < h; i++) {
          for (var j = 0; j < w; j++) {
            var index = (j + i * w) * 4; // for dev color tiles lime green data errored

            var missing = [57, 255, 20, 255];
            var color = []; // get color from stored data

            getcolorloop: for (var c = 0; c < 4; c++) {
              var r = this.mosaicColorData[index + c];

              if (r === undefined || r === null) {
                color = missing;
                break getcolorloop;
              }

              color.push(r);
            } // output tile to canvas


            mosaicContext.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] / 255 + ')';
            mosaicContext.fillRect(j * s, i * s, s, s);
            this.forCheck.push(color[0], color[1], color[2], color[3]); // // stroke each tile
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
        return mosaicCanvas;
      }
      /**
      * Divides the whole canvas into smaller tiles and finds the average
      * colour of each block. After calculating the average colour, it stores
      * an array of the tiles as rgba strings and appends canvas to the dom
      */

    }, {
      key: "tileCanvas",
      value: function tileCanvas() {
        console.log(' ! calling tile canvas ! '); // this.options.targetElement.appendChild(this.options.canvas);
        // get output info

        var mosaicCanvas = document.createElement('canvas');

        if (this.options.classname) {
          mosaicCanvas.classList.add(this.options.classname);
        }

        var mosaicContext = mosaicCanvas.getContext('2d');

        var _this$getOutputSize = this.getOutputSize(),
            w = _this$getOutputSize.w,
            h = _this$getOutputSize.h,
            clusterSize = _this$getOutputSize.clusterSize,
            cluster = _this$getOutputSize.cluster;

        mosaicCanvas.width = w;
        mosaicCanvas.height = h; // get tiler info

        var width = this.options.canvas.width;
        var height = this.options.canvas.height;
        var passedContext = this.options.canvas.getContext('2d');
        var passedImageData = this.options.imageData || passedContext.getImageData(0, 0, width, height); // var index = x + (y * width); // image data
        // set up storage of mosaic data

        this.mosaicTileCount = [];
        this.mosaicRGBAStrings = [];
        this.mosaicImageData = []; // 2d matrix notation

        var x, y, clusterData, averageColor, commaSeparated, color;
        var s = cluster ? clusterSize : this.options.tileSize;
        var plateBorders = this.getCaps(); // iterate through to get tiles

        for (var i = 0; i < this.options.tilesY; i++) {
          // store colors
          this.mosaicTileCount[i] = [];
          this.mosaicRGBAStrings[i] = [];

          for (var j = 0; j < this.options.tilesX; j++) {
            // get cluster
            x = j * clusterSize;
            y = i * clusterSize; // convert colors for this cluster

            clusterData = this.getClusterData(x, y, passedImageData, clusterSize);
            averageColor = this.getAverageColor(clusterData, clusterSize); // get storable objects

            commaSeparated = averageColor.r + ', ' + averageColor.g + ', ' + averageColor.b;
            color = 'rgba(' + commaSeparated + ', ' + this.options.opacity + ')'; // store tile color
            // this.mosaicImageData[(i * this.options.tilesX) + j].push([averageColor.r, averageColor.g, averageColor.b, this.options.opacity]);

            this.mosaicTileCount[i].push('(' + commaSeparated + ')');
            this.mosaicRGBAStrings[i].push(color); // output tile to canvas
            // output canvas may be different size than the clustered canvas

            mosaicContext.fillStyle = color;
            mosaicContext.fillRect(j * s, i * s, s, s); // stroke each tile

            mosaicContext.stroke = 'rgba(255, 255, 255, 255)';
            mosaicContext.strokeRect(j * s, i * s, s, s); // highlight borders of the plate

            if (plateBorders.x.includes(j) || plateBorders.y.includes(i)) {
              mosaicContext.fillStyle = 'rgba(255, 255, 255, .5)';
              mosaicContext.fillRect(j * s, i * s, s, s);
            }
          }
        } // clear container and append mosaicCanvas to DOM
        // this.options.targetElement.innerHTML = '';
        // this.options.targetElement.appendChild(mosaicCanvas);
        // this.options.targetElement.appendChild(this.options.canvas);


        this.mosaicCanvas = mosaicCanvas;
        return mosaicCanvas;
      }
    }, {
      key: "getCaps",

      /**
       * calculates each plate border index for the mosaic imagedata array
       * @return {[object]} [returns array of indicies where the plate borders are]
       */
      value: function getCaps() {
        var iterator = {
          x: (0, _toConsumableArray2["default"])(Array(this.options.tilesX).keys()),
          y: (0, _toConsumableArray2["default"])(Array(this.options.tilesY).keys())
        };
        var size = 32;
        var caps = {
          x: [],
          y: []
        };

        for (var _i = 0, _Object$entries = Object.entries(iterator); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2),
              key = _Object$entries$_i[0],
              val = _Object$entries$_i[1];

          var i = 0;

          while (i < val.length) {
            var chunk = val.slice(i, size + i);
            caps[key].push(chunk[0]);
            caps[key].push(chunk[chunk.length - 1]);
            i += size;
          }
        }

        ;
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

    }, {
      key: "getClusterData",
      value: function getClusterData(startX, startY, imageData, clusterSize) {
        // should double check this doesn't combine the end of a row and
        // the start of the next row
        var data = [];
        var width = imageData.width;

        for (var x = startX; x < startX + clusterSize; x++) {
          var xPos = x * 4;

          for (var y = startY; y < startY + clusterSize; y++) {
            var yPos = y * width * 4;
            data.push(imageData.data[xPos + yPos + 0], imageData.data[xPos + yPos + 1], imageData.data[xPos + yPos + 2], imageData.data[xPos + yPos + 3]);
          }
        }

        return data;
      }
    }, {
      key: "checkDiff",
      value: function checkDiff(list) {
        var toTest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.forCheck;

        if (this.options.methodname != 'createTiles') {
          throw new Error('this only works for createTiles');
        } // let missing = [57, 255, 20, 255];


        if (!toTest || !Array.isArray(toTest)) {
          throw new Error('stored mosaicColorData was abscent or invaliud');
        }

        var check = [];

        for (var j = 0; j < list.length; j++) {
          var mosaic = list[j];
          var len = mosaic.length;
          check[j] = 0;

          if (toTest.length == len) {
            for (var i = 0; i < len; i += 12) {
              var listPixel = '';
              var thisPixel = '';

              for (var k = i; k < i + 12; k += 4) {
                listPixel += mosaic[k] + '' + mosaic[k + 1] + '' + mosaic[k + 2] + '' + mosaic[k + 3];
                thisPixel += toTest[k] + '' + toTest[k + 1] + '' + toTest[k + 2] + '' + toTest[k + 3];
              }

              if (thisPixel != listPixel) {
                check[j]++;
              }
            }
          } else {
            check[j] = len / 4;
          }
        }

        return check;
      }
    }, {
      key: "getBillOfMaterials",
      value: function getBillOfMaterials() {
        if (this.mosaicTileCount.length == 0) {
          throw new Error('No tiles were saved!');
        } // count up each color


        var index = this.options.tilesY;
        var row = this.options.tilesX;
        var count = {};

        for (var i = 0; i < index; i++) {
          for (var j = 0; j < row; j++) {
            var key = this.mosaicTileCount[i][j];

            if (count.hasOwnProperty(key)) {
              count[key] += 1;
            } else {
              count[key] = 1;
            }
          }
        } // eventually get a final key value pair, but for now


        return count;
      }
    }]);
    return ConvertPhoto;
  }(); // end class ConvertPhoto


  return ConvertPhoto;
});

},{"@babel/runtime/helpers/classCallCheck":10,"@babel/runtime/helpers/createClass":11,"@babel/runtime/helpers/interopRequireDefault":12,"@babel/runtime/helpers/slicedToArray":17,"@babel/runtime/helpers/toConsumableArray":18,"@babel/runtime/helpers/typeof":19}],3:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// data pertaining to the uploaded image, to be reset on each new image upload
(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : (0, _typeof2["default"])(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = global || self, global.RawImage = factory());
})(void 0, function () {
  'use strict';

  var Globals = require('./globals.js');

  var RawImage = /*#__PURE__*/function () {
    function RawImage() {
      (0, _classCallCheck2["default"])(this, RawImage);
      // the crop event is called before ready on some initial options settings
      // endsure mosaic preview is not called too often / early with setting this boolean to keep track
      this.callOnCrop = false; // handle all filter checks / objects

      this._useOneFilter = false; // which key to use to get the filter list

      this.applyFilters = false; // a bool is true if a value in the filter list is not it's initial value

      this._baseFilterValues = {}; // gets the initial value of all filters to determine if applyFilters should be true
      // initialize the filter list storage

      this.initFilterList(); // init blank cropper data obj
    } // turns file upload into a image blob object and loads it in the dom


    (0, _createClass2["default"])(RawImage, [{
      key: "handleImage",
      value: function handleImage(options) {
        var _this = this;

        console.log('initiating upload');
        this.image = options.image; // the image object probably a blob

        this.URL = options.windowURL; // the global url window object
        // create new cropping image

        this.createdObjectURL = this.URL.createObjectURL(options.file);
        this.image.src = this.createdObjectURL;

        this.image.onload = function () {
          // set the default scale factor of the image vs display
          _this.scaleFactor = _this.image.naturalWidth / _this.image.parentElement.clientWidth; // keep track of the center of the crop box for this image

          _this.cropboxCenter = {
            x: _this.image.parentElement.clientWidth * .5,
            y: _this.image.parentElement.clientHeight * .5
          }; // make sure display is no larger than the natural size of the image???
          // might be needed for the cropper box data ???
          // needs testing

          _this.image.parentElement.style.maxHeight = _this.image.naturalHeight;
          _this.image.parentElement.style.maxWidth = _this.image.naturalWidth;
        };
      } // release upload url

    }, {
      key: "cleanUP",
      value: function cleanUP() {
        this.URL.revokeObjectURL(this.createdObjectURL);
      }
    }, {
      key: "setFilterList",
      // store speparate slider values for each color palette
      value: function setFilterList(key, value) {
        // set the value for this filter for the selected color palette choice
        // this._filterList[Globals.color][key] = value;
        this._filterList[key] = value;

        this._checkAppyFilterSingle(key, value);
      } // initialize the filter handling objects

    }, {
      key: "initFilterList",
      value: function initFilterList() {
        this._filterList = {};
        var list = document.getElementById('slidersContent').querySelectorAll('[data-option="reset"]');

        var _iterator = _createForOfIteratorHelper(list),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var el = _step.value;
            var name = el.getAttribute('data-method');
            var val = el.value;
            this._filterList[name] = val;
            this._baseFilterValues[name] = val;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        console.table(this._filterList);
      } // initialize the filter handling objects

    }, {
      key: "initFilterListByColor",
      value: function initFilterListByColor() {
        this._filterList = {};
        var list = document.getElementById('slidersContent').querySelectorAll('[data-option="reset"]');

        for (var _i = 0, _Object$keys = Object.keys(Globals.colorData); _i < _Object$keys.length; _i++) {
          var color = _Object$keys[_i];
          this._filterList[color] = {};

          var _iterator2 = _createForOfIteratorHelper(list),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var el = _step2.value;
              var name = el.getAttribute('data-method');
              var val = el.value;
              this._filterList[color][name] = val;
              this._baseFilterValues[name] = val;
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }

        console.table(this._filterList);
      }
    }, {
      key: "initCropperData",
      value: function initCropperData(toStore) {
        this.cropperData = Object.assign({}, toStore);
        console.log('storing ');
        console.table(toStore);
        console.table(this.cropperData);
      }
    }, {
      key: "_checkAppyFilterSingle",
      value: function _checkAppyFilterSingle(key, value) {
        this.applyFilters = this._baseFilterValues[key] != value;
      } // image instance created
      // sent to auto face
      // on return store the data received
      // UPLOADED_IMAGE.cropperData {box, data, the display container?????}
      // big data distance to the top of the cropbox >= box distance
      // if false
      // auto crop should happen?
      // store that cropbox data ? or still regulate data
      //

    }, {
      key: "filterList",
      get: function get() {
        // return this._filterList[Globals.color];
        return this._filterList;
      }
    }]);
    return RawImage;
  }();

  return RawImage;
});

},{"./globals.js":4,"@babel/runtime/helpers/classCallCheck":10,"@babel/runtime/helpers/createClass":11,"@babel/runtime/helpers/interopRequireDefault":12,"@babel/runtime/helpers/typeof":19}],4:[function(require,module,exports){
"use strict";

(function () {
  "use strict"; // the user mosaic settings

  var Globals = {
    // mosaic: value added later // the ordered rgb values that make up the mosaic
    // materials: value added later // the amount of each color tile found in the mosaic
    customPalettes: {},

    // remember choices if user changes palette within the same upload
    get colorData() {
      return this._colorData ? this._colorData : {
        'BW': [{
          r: 0,
          g: 0,
          b: 0
        }, {
          r: 255,
          g: 255,
          b: 255
        }]
      };
    },

    // check the json data from the server that has the palette info
    set colorData(obj) {
      this._colorData = false;

      if (obj.constructor !== Object) {
        throw new Error('color data is invalid! expecting a javascript Object!');
      }

      this._colorData = Object.assign({}, obj);
      this.resetPalette();
    },

    get color() {
      return this._color;
    },

    // one of ['CL', 'GR', 'BW']
    set color(newColor) {
      console.log("changing palette choice to color: ".concat(newColor));
      this._color = newColor;

      this._checkUseCustom();
    },

    get palette() {
      if (this.useCustomPalette) {
        return this.customPalettes[this.color];
      } // returns default all colors included palette


      return this.colorData[this.color];
    },

    // values related to color
    resetPalette: function resetPalette() {
      // clear custom palette stores
      this.customPalettes = Object.assign({}, this.colorData);
      this.useCustomPalette = false;
    },
    _checkUseCustom: function _checkUseCustom() {
      var c_len = this.customPalettes[this.color].length;
      var d_len = this.colorData[this.color].length;
      this.useCustomPalette = c_len != d_len;
    },
    addColor: function addColor(rgb) {
      // adds color to custom palette
      if (typeof rgb !== 'string' || rgb.split(',').length != 3) {
        throw new Error('invalid color passed to custom palette, expecting string "r,g,b" ');
      }

      var c = rgb.split(',').map(function (str) {
        return parseInt(str);
      });
      this.customPalettes[this.color].push({
        r: c[0],
        g: c[1],
        b: c[2]
      });

      this._checkUseCustom();
    },
    // adds color to custom palette
    removeColor: function removeColor(rgb) {
      // removes color from custom palette
      if (typeof rgb !== 'string' || rgb.split(',').length != 3) {
        throw new Error('invalid color passed to custom palette, expecting string "r,g,b" ');
      }

      var newArry = this.customPalettes[this.color].filter(function (stored) {
        return Object.values(stored).join(',') !== rgb;
      });
      this.customPalettes[this.color] = newArry;

      this._checkUseCustom();
    },
    // removes color from custom palette
    basePlate: 32,
    // assume square for now, the units of 1 base plate
    plateWidth: 2,
    // plate count width
    plateHeight: 2,

    // plate count height
    get x() {
      return this.plateWidth * this.basePlate;
    },

    // width of the mosaic
    get y() {
      return this.plateHeight * this.basePlate;
    },

    // height of the mosaic
    get aspectRatio() {
      return this.plateWidth / this.plateHeight;
    },

    // mosaic aspect ratio
    get plateCount() {
      return this.plateWidth * this.plateHeight;
    },

    // how many plates in mosaic
    // converts the palette rgb object to an array
    paletteAsArray: function paletteAsArray(arry) {
      // [[r,g,b]...]
      if (!arry) {
        arry = this.palette;
      } else if (!Array.isArray(arry)) {
        throw new Error('invalid palette passed! expecting array of {r:g:b:}');
      }

      return arry.map(function (rgb) {
        return Object.values(rgb);
      });
    },
    tileSize: 4,
    // pixel size of the onscreen mosaic display
    tileRealWidth: 0,
    // the size of the real 'lego' in cm ????? is this value useful?
    // get the index of a 2d matrix notation array sotred as a 1d array
    matrixData: {
      // get the index of the 2d matrix grid
      getIndex: function getIndex(x, y) {
        return x + y * this.x;
      },
      getX: function getX(index, y) {
        return index - y * this.x;
      },
      getY: function getY(index, x) {
        return (index - x) / this.x;
      }
    },
    // // round number to the nearest multiple of the baseplate
    roundToPlate: function roundToPlate(n) {
      // let b = (this.basePlate / 2) + this.basePlate;
      return Math.ceil(n / this.basePlate) * this.basePlate;
    },
    // 3rd party
    // ditherjs properties
    ditherKernals: [null, 'FloydSteinberg', 'FalseFloydSteinberg', 'Stucki', 'Atkinson', 'Jarvis', 'Burkes', 'Sierra', 'TwoSierra', 'SierraLite'],
    colorDist: ['euclidean', 'manhattan']
  };
  module.exports = Globals;
})();

},{}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _ConvertPhoto = _interopRequireDefault(require("./ConvertPhoto.js"));

var _AutoFace = _interopRequireDefault(require("./AutoFace.js"));

var _RawImage = _interopRequireDefault(require("./RawImage.js"));

// imports
var Globals = require('./globals.js');

// 3rd party imports
// import Cropper from 'cropperjs';
// const RgbQuant = require('rgbquant');
(function (window) {
  'use strict'; // get window objects
  // 3rd party

  var Cropper = window.Cropper;
  var Caman = window.Caman; // gets the color data passed to the template

  (function () {
    console.log('getting color palette'); // handle color choices from the template

    var jsonValueID = 'colorData';

    try {
      var cd = JSON.parse(document.getElementById(jsonValueID).textContent);
      Globals.colorData = cd;
      Globals.color = 'CL';
      Globals.resetPalette(); // for dev

      displayPalette();
    } catch (e) {
      console.warn(e);
    }
  })(); // cropper variables


  var URL = window.URL || window.webkitURL,
      CONTAINER_UPLOADED = document.getElementById('containerUploaded'),
      //uploaded image container
  CONTAINER_RESULT = document.getElementById('containerResult'),
      // parent of mosaic display
  PREVIEW_RESULT = document.getElementById('previewResult'),
      // preview container
  SLIDER_CROPPED = document.getElementById('previewSliderResult'),
      // preview the cropped non-tiled section w/ slider tweaks
  UPLOADED_IMAGE,
      ALL_UPLOADS = [],
      // options for the cropper object
  DISPLAY_MOSAICS = function DISPLAY_MOSAICS(options) {
    console.log(options); // called when the crop box has moved to a new area

    console.log('*****************************');
    console.log('displaying mosaics');
    console.log('converting for sample default preview'); // display raw preview
    // uses default cropper canvas options to optain a canvas

    canvasPreview({
      targetElement: PREVIEW_RESULT,
      tileSize: Math.max(1, Math.floor(PREVIEW_RESULT.clientWidth / Globals.x)),
      saveCanvas: false
    });
    console.log('converting for main mosaic container'); // display main alterable mosaic
    // CONTAINER_RESULT.innerHTML = '';

    var defaults = {
      // tileSize: Math.max( 1, Math.floor(CONTAINER_RESULT.clientWidth/Globals.x) ),
      tileSize: 8,
      saveCanvas: true
    };
    canvasPreview(defaults); // getCropboxCenter();

    SAVE_MOSAIC.disabled = false;
  },
      DEFAULT_READY = function DEFAULT_READY(e) {
    console.log('%c' + e.type, 'color:green;');
    var str = 'from default ready';
    DISPLAY_MOSAICS(str);
    UPLOADED_IMAGE.callOnCrop = true;
  },
      CROPPER_OPTIONS = {
    aspectRatio: Globals.aspectRatio,
    viewMode: 2,
    ready: DEFAULT_READY,
    // autoCrop: false,
    autoCropArea: 0,
    zoomOnWheel: false,
    zoomOnTouch: false,
    cropstart: function cropstart(e) {
      console.log('%c' + e.type, 'color:green;'); // console.log(e.type, e.detail.action);
    },
    cropmove: function cropmove(e) {
      console.log('%c' + e.type, 'color:orange;'); // so display mosaic isn;t calle da million times, if a move cropend will catch it

      UPLOADED_IMAGE.callOnCrop = false; // console.log(e.type, e.detail.action);
      // let wrapper = CROPPER.getCanvasData();
      // UPLOADED_IMAGE.cropperData.wrapper = Object.assign({},wrapper);
      // console.log(' left '+wrapper.left);
      // console.log(' width '+wrapper.width);
    },
    cropend: function cropend(e) {
      console.log('%c' + e.type, 'color:red;');
      var str = 'from cropend';
      DISPLAY_MOSAICS(str);
    },
    crop: function crop(e) {
      console.log('%c' + e.type, 'color:blue;'); // console.log(e.type, e.detail);
      // only if autocrop is true, this will initialize cropper
      // if(!CROPPER.cropped){CROPPER.setData( {x:0,y:0,width:0, height:0} );}
      // when window is resized

      var _CROPPER$getImageData = CROPPER.getImageData(),
          naturalWidth = _CROPPER$getImageData.naturalWidth,
          width = _CROPPER$getImageData.width;

      UPLOADED_IMAGE.scaleFactor = naturalWidth / width; // don't call this when ready will fire directly after(when CROPPER.autocrop == true
      // && CROPPER.setData() is called sometimes? )

      if (UPLOADED_IMAGE.callOnCrop) {
        var str = 'from crop';
        DISPLAY_MOSAICS(str);
      }

      UPLOADED_IMAGE.callOnCrop = true;
    },
    zoom: function zoom(e) {
      console.log('%c' + e.type, 'color:purple;'); // console.log(e.type, e.detail.ratio);
      // DISPLAY_MOSAICS();
    }
  },
      // keep track of image upload object values
  CROPPER; // IMAGE_CROPPER_DATA = [CROPPER.getImageData()],
  // CANVAS_CROPPER_DATA = [CROPPER.getCanvasData()];


  function getCropboxCenter() {
    // get the center of the crop box to store as zoom to value
    if (!CROPPER.cropped || !UPLOADED_IMAGE) {
      return;
    }

    var cbd = CROPPER.getCropBoxData();
    var left = cbd.left,
        top = cbd.top,
        width = cbd.width,
        height = cbd.height;
    UPLOADED_IMAGE.cropboxCenter = {
      x: left + width * .5,
      y: top + height * .5
    };
    console.log('-------------');
    console.log('cropbox center');
    console.table(UPLOADED_IMAGE.cropboxCenter);
    console.log('-------------');
    var wrapper = CROPPER.getCanvasData();
    var image = CROPPER.getImageData();
    var d = CROPPER.getData();
    var c = CROPPER.getContainerData();
    var table = [['name', 'x or left', 'y or top', 'width', 'height'], ['data', d.x + '', d.y + '', d.width + '', d.height + ''], ['container', '', '', c.width + '', c.height + '']];
    var prevZoom = d.y - cbd.top;
    console.log('data top ' + d.y);
    console.log('crop top ' + cbd.top);
    console.log('canv top ' + wrapper.top);
    console.log('crop * factor ' + cbd.top * UPLOADED_IMAGE.scaleFactor);
    console.log('d-c ', prevZoom); // let table = [
    //   ['name', 'x or left', 'y or top', 'width', 'height'],
    //   ['cropbox', left+'', top+'', width+'', height+''],
    //   ['wrapper', wrapper.left+'', wrapper.top+'', wrapper.width+'', wrapper.height+''],
    //   ['image', image.left+'', image.top+'', image.width+'', image.height+''],
    //   ['data', d.x+'', d.y+'', d.width+'', d.height+''],
    // ];
    // console.log('----    all together    ---');
    // console.table(table);
  } // get a canvas of the region outlined by the cropbox


  function getCropperCanvas(options) {
    // set maxWidth to not exceed the naturalWidth
    var boxD = CROPPER.getCropBoxData();
    var maxWidth = boxD.width * UPLOADED_IMAGE.scaleFactor;
    var maxHeight = boxD.height * UPLOADED_IMAGE.scaleFactor;
    var useOptions = options && (0, _typeof2["default"])(options) == 'object' ? true : false;
    console.log('---------------- cropper canvas extract ----------------------'); // console.log(`use passed options for cropper? ${useOptions}`);

    var defaults = {
      width: boxD.width,
      height: boxD.height,
      minWidth: Globals.x,
      minHeight: Globals.y,
      // maxWidth: maxWidth,
      // maxHeight: maxHeight,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      // one of ['low', 'medium', 'high']
      maxWidth: 4096,
      maxHeight: 4096 // fillColor: '#ccc', // set this value for default remove bg solid
      // fillColorList: [],
      // fillType: 'solid',

    };
    var ops = defaults;

    if (useOptions) {
      ops = Object.assign({}, defaults, options);
    }

    return CROPPER.getCroppedCanvas(ops);
  } // get options to sent to convert photo
  // kinda a options dictionary builder for the conversion to tiled mosaic


  function canvasPreview(options) {
    console.log(' --- canvas preview --- '); // const previewWidth = Globals.x * Globals.tileSize;
    // const previewHeight = Globals.y * Globals.tileSize;

    var useOptions = options && (0, _typeof2["default"])(options) == 'object' ? true : false;
    console.log('use canvas preview passed options ? ' + useOptions); // set up the options to be passed to conversion

    var defaults = {
      // where the mosoic is loaded should stay constant
      targetElement: CONTAINER_RESULT,
      // the ontly readon this should change is on responsive window resize
      tileSize: Globals.tileSize
    };
    var updateEveryCall = {
      colorChoice: Globals.color,
      palette: Globals.palette,
      tilesX: Globals.x,
      // number of tiles in the x axis
      tilesY: Globals.y // number of tiles in the y axis

    };
    var ops;

    if (useOptions) {
      ops = Object.assign({}, defaults, options, updateEveryCall);
    } else {
      ops = Object.assign({}, defaults, updateEveryCall);
    }

    if (!ops.hasOwnProperty('canvas')) {
      console.log('getting default canvas');
      ops.canvas = getCropperCanvas();
    } // store options for this image


    if (useOptions && options.saveCanvas) {
      UPLOADED_IMAGE.moasicOptions = Object.assign({}, ops);
    } // if filters have tweaked been applied, gotta apply them for this canvas


    if (UPLOADED_IMAGE.applyFilters) {
      // called from updating the cropper box and not from filter adjust
      // gotta apply existing stored filters
      if (!options.hasOwnProperty('filterCanvas')) {
        // regenerate canvas form new cropbox view, so canvas is null
        applyFilters(null, function (resp) {
          var ops = Object.assign({}, UPLOADED_IMAGE.moasicOptions, {
            canvas: resp
          });
          callConversion(ops); // for dev see what the non-tiled canvas image looks like with the filters

          SLIDER_CROPPED.innerHTML = '';
          SLIDER_CROPPED.appendChild(resp);
        });
        return;
      } // called with a filter canvas object passed, so was called from the filter listener


      ops.canvas = ops.filterCanvas;
    }

    callConversion(ops);
  } // end preview canvas


  function callConversion(ops) {
    // holdover from testing different tiling methods, might still use it so keep the format
    var method = 'createTiles';

    if (ops.hasOwnProperty('methodname')) {
      method = ops.methodname;
    } // create the mosaic instance


    var convertPhoto = new _ConvertPhoto["default"](ops); // call for the tiler

    var mosaic = convertPhoto[method](); // clear the copied filtered canvas from storage

    if (UPLOADED_IMAGE.moasicOptions && UPLOADED_IMAGE.moasicOptions.hasOwnProperty('filterCanvas')) {
      delete UPLOADED_IMAGE.moasicOptions.filterCanvas;
    } // add to dom


    ops.targetElement.innerHTML = '';
    ops.targetElement.appendChild(mosaic);
  } // setups the color palette buttons in the dom


  function displayPalette() {
    // get bg palette container
    var bgPalette = document.getElementById('bgPalette');
    var bgColors = []; // loop through every palette available

    for (var _i = 0, _Object$entries = Object.entries(Globals.colorData); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          palette = _Object$entries$_i[1];

      // the display container for each palette
      var parent = document.getElementById(key);
      parent.innerHTML = ''; // put all colors in container

      var paletteContainer = document.createElement('div');
      paletteContainer.classList.add('row');
      paletteContainer.classList.add('palette-container'); // get visuals of currently active palette set up

      if (Globals.color == key) {
        var pBtn = document.getElementById(key + '-tab');
        parent.classList.add('show');
        parent.classList.add('active');
        pBtn.classList.add('active');
      } // populate each dropdown with appropriate colors


      for (var i = 0; i < palette.length; i++) {
        var el = document.createElement('button');
        var rgb = Object.values(palette[i]).join(','); // store color on element

        el.setAttribute('data-rgb', rgb);
        el.setAttribute('data-main', 'palette');
        el.type = 'button';
        el.classList.add('m-2');
        el.classList.add('btn');
        el.classList.add('btn-palette-color');
        el.style.backgroundColor = 'rgba(' + rgb + ',1)'; // bg buttons use every color available, don't make duplicates

        if (!bgColors.includes(rgb)) {
          var bgEL = el.cloneNode();
          bgEL.setAttribute('data-method', 'bgColors');

          if (rgb === '255,255,255') {
            bgEL.classList.add('active'); // keep track of selected color order

            Globals.bgColors = [rgb];
          }

          bgPalette.appendChild(bgEL);
          bgColors.push(rgb);
        }

        el.setAttribute('data-method', 'palette');
        el.classList.add('active');
        paletteContainer.appendChild(el);
      }

      parent.appendChild(paletteContainer);
    }
  } // end display palette
  // listener for user uploaded image


  var IMAGE_INPUT = document.getElementById('importImage');

  if (URL) {
    IMAGE_INPUT.onchange = function () {
      var files = this.files;
      var file; // make sure a file was uploaded

      if (files && files.length) {
        file = files[0]; // make sure it's an image file

        if (/^image\/\w+/.test(file.type)) {
          console.log('file type'); // keep track of uploaded images for remove bg

          var count = ALL_UPLOADS.length;

          if (UPLOADED_IMAGE) {
            console.log(' user has previously uploaded an image ');
            UPLOADED_IMAGE.cleanUP();
          }

          UPLOADED_IMAGE = new _RawImage["default"]();
          UPLOADED_IMAGE.handleImage({
            windowURL: URL,
            image: document.getElementById('imgUploaded'),
            file: file
          });

          if (CROPPER) {
            CROPPER.destroy();
          } // create new crop object tro load the image for detect face


          CROPPER_OPTIONS.ready = function (e) {
            console.log('%c' + e.type, 'color:green;');
            useAutoFace();
            UPLOADED_IMAGE.callOnCrop = true; // UPLOADED_IMAGE.cropperData = getStoreCropperData();
          };

          CROPPER = new Cropper(UPLOADED_IMAGE.image, CROPPER_OPTIONS); // clear file upload input for next upload

          IMAGE_INPUT.value = null; // clear local stored mosaic adjustment values
          // the sliders
        } else {
          window.alert('Please choose an image file.');
        }
      }
    };
  } else {
    IMAGE_INPUT.disabled = true;
    IMAGE_INPUT.parentNode.className += ' disabled';
  } // function getStoreCropperData(){
  //   let display = CROPPER.getContainerData();
  //   let cbd = CROPPER.getCropBoxData();
  //   let cbd_r = display.width - cbd.left + cbd.width;
  //   let cbd_b = display.height - cbd.top + cbd.height;
  //   let wrapper = CROPPER.getCanvasData();
  //   let wl = Math.abs(wrapper.left);
  //   let wt = Math.abs(wrapper.top);
  //   let wb = wrapper.height - wt - display.height;
  //   let wr = wrapper.width - wl - display.width;
  //   // store initial cropper data
  //   return {
  //     // the original uploaded image datas uses x , y unlike everything else that uses top and left
  //     original: CROPPER.getData(),
  //
  //     // the image container
  //     display: display,
  //
  //     // data for the display container and the coordinates of the display area in reference to the (display sized or original?) image
  //     wrapper: {
  //       top: wt,
  //       left: wl,
  //       bottom: wb,
  //       right: wr,
  //       width: wrapper.width,
  //       height: wrapper.height,
  //     },
  //     // the corrdinates of the crop box
  //     box: {
  //       left: cbd.left,
  //       top: cbd.top,
  //       right: display.width - cbd.left + cbd.width,
  //       bottom: display.height - cbd.top + cbd.height,
  //     },
  //     // center of the box in relation to the wrapper
  //     boxCenter: {
  //       left: (cbd.left + cbd.width * .5),
  //       top: cbd.top + cbd.height * .5,
  //     },
  //
  //     boxSides: {
  //       left: wl + cbd.left,
  //       top: wt + cbd.top,
  //       right: wr + cbd_r,
  //       bottom: wb + cbd_b,
  //     },
  //
  //   };
  // }


  function getdisplayCrop() {
    // store current data
    var stored = CROPPER.getData();

    var _CROPPER$getContainer = CROPPER.getContainerData(),
        width = _CROPPER$getContainer.width,
        height = _CROPPER$getContainer.height; // console.log(`width: ${width}, height: ${height}`);
    // set triggers crop event which converts crop area to mosaic, which is unwanted right now


    UPLOADED_IMAGE.callOnCrop = false; // change the aspect ratio to get the full display image

    CROPPER.setAspectRatio(width / height); // set triggers crop event which converts crop area to mosaic, which is unwanted right now

    UPLOADED_IMAGE.callOnCrop = false; // get the canvas of the entire displayed area

    var getFull = CROPPER.setCropBoxData({
      left: 0,
      right: 0,
      width: width,
      height: height
    });
    var natDime = CROPPER.getData(); // console.table(natDime);

    var ar = width / height;
    var defaults = {
      width: width,
      height: height,
      maxWidth: width,
      maxHeight: height,
      minWidth: width,
      minHeight: height,
      fillColor: '#fff'
    }; // for some reason the above options clip the alpha space out of the returned canvas, seding over the incorect image to autoface
    // use this if rotated, will have to manually adjust for zoom tho

    var rotate = {
      width: width,
      height: height,
      maxWidth: 4096,
      maxHeight: 4096 / ar,
      minWidth: ar,
      minHeight: 1,
      fillColor: '#fff'
    };
    var ops = natDime.rotate != 0 ? rotate : defaults;
    console.log((natDime.rotate != 0) + ' - ' + (0, _typeof2["default"])(natDime.rotate));
    console.table(ops); // get the canvas

    var canvas = CROPPER.getCroppedCanvas(ops); // set triggers crop event which converts crop area to mosaic, which is unwanted right now

    UPLOADED_IMAGE.callOnCrop = false; // restore aspect ratio

    CROPPER.setAspectRatio(Globals.aspectRatio); // set triggers crop event which converts crop area to mosaic, which is unwanted right now

    UPLOADED_IMAGE.callOnCrop = false; // restore data

    CROPPER.setData(stored);
    return canvas;
  } // gets a snap of the whole display area in case of image transformations,
  // this sends the transformed image to autoface, instead of the default uploaded image


  function getImageForAutoFace(options) {
    if (!CROPPER.cropped) {
      return;
    } // get snap of entire visible image in the display


    var canvas = getdisplayCrop();
    canvas.toBlob(function (blob) {
      var newImg = new Image();
      var url = URL.createObjectURL(blob);
      newImg.src = url;

      newImg.onload = function () {
        useAutoFace({
          image: newImg,
          useOriginal: false,
          displaySize: {
            width: canvas.width,
            height: canvas.height
          }
        }); // no longer need to read the blob so it's revoked

        URL.revokeObjectURL(url);
      };
    });
  }

  function useAutoFace(options) {
    console.log('calling autoface'); // TODO: set up a loading overlay to give auto detect faces time to return
    // get the auto crop bound if there are faces

    var defaults = {
      image: UPLOADED_IMAGE.image,
      aspectRatio: Globals.aspectRatio,
      useOriginal: true
    };
    var ops = defaults;

    if (options && (0, _typeof2["default"])(options) == "object") {
      ops = Object.assign({}, defaults, options);
    } // get the bounds of the faceapi calculated to the passed aspect ratio


    new _AutoFace["default"](ops).results.then(function (resp) {
      console.log('-- autoface promise returned ---');

      if (resp) {
        if (ops.useOriginal) {
          console.log('using set data');
          CROPPER.setData(resp); // triggers cropper options crop event
        } else {
          console.log('setting just the crop box in relation to display');
          CROPPER.setCropBoxData(resp); // triggers cropper options crop event
        } // if the crop event does not call display mosaics, call it here
        // let str = 'from autoface promise return';
        // DISPLAY_MOSAICS(str);

      } else {
        // face api found no faces handle this
        console.warn('face api returned some falsey value');
      }
    })["catch"](function (err) {
      console.warn(err);
    });
  } // checkbox for remobe bg


  document.getElementById('useRemoveBG').onchange = function () {
    console.log('check changed');
    console.log('checked is ' + this.checked);
    var btn = document.getElementById('removeBG');
    var classname = 'show';
    var btnSelector = btn.getAttribute('data-target');
    var btnTarget = document.querySelector(btnSelector); // have check enable / disable button

    btn.disabled = !this.checked;

    if (this.checked) {// if checked
      // checked if called remove bg yet
      // call remove bg on original image
    } //  if dropdown is open, close it
    else if (btnTarget.classList.contains(classname)) {
        $(btnSelector).collapse('hide');
      }
  }; // container for sliders input
  // document.getElementById('slidersContent').onchange = handleClicks;
  // container for the cropper tools


  document.getElementById('cropToolbar').onclick = handleClicks; // container for mosaic tool controls

  document.getElementById('toolsDropdown').onclick = handleClicks;

  function handleClicks(e) {
    // add some checks here to make sure the event target is got on all browsers
    var target = e.target;
    var etype = e.type;
    console.log('the target is');
    console.log(target); // let updateCropper = this.id === 'cropToolbar';
    // console.log(`updating the cropping box? ${updateCropper}`);
    // some targets are the buttons children

    if (!target.getAttribute('data-method')) {
      console.log('target doesnt have a method!,using closest!');
      target = target.closest('[data-method]');
      console.log('target is now');
      console.log(target);
    } // if not a button click, or button is disabled, igore


    if (!target || target.disabled) {
      return;
    }

    var data = {
      main: target.getAttribute('data-main') || undefined,
      // instance object that has the method
      method: target.getAttribute('data-method'),
      // object method to call
      value: target.value,
      // value of an input tag
      effects: target.getAttribute('data-effects') || undefined,
      // does this value act on another value,
      option: target.getAttribute('data-option') || undefined,
      // value to pass to method
      secondOption: target.getAttribute('data-second-option') || undefined // second value to pass to method

    };
    var updateMosaic = false;

    switch (data.main) {
      // user changing a basic globals setting
      case 'globals':
        // plate count, color choice
        console.log(" - setting Globals.".concat(data.method, " = ").concat(data.option));
        Globals[data.method] = data.option;
        updateMosaic = true;
        break;
      // user changing a custom palette / bg color

      case 'palette':
        {
          var type = data.method;
          var classname = 'active';
          var rgb = target.getAttribute('data-rgb') || undefined;

          if (rgb !== undefined) {
            target.classList.toggle(classname);
          } // updates the custom palette, add removes colors


          if (type == 'palette') {
            var method = target.classList.contains(classname) ? 'addColor' : 'removeColor';
            Globals[method](rgb);
            updateMosaic = true;
            break;
          } // selected and deselecting the colors to use in the bg


          var max = data.option;

          if (type == 'bgColors') {
            // get colors allowed for bg pattern
            var selected = document.getElementById('bgContent').querySelector('input[type=radio]:checked');
            max = parseInt(selected.getAttribute('data-option')); // whether or not to select / dese;ect color for bg

            var add = target.classList.contains(classname);

            if (add) {
              Globals.bgColors.push(rgb);

              if (Globals.bgColors.length > max) {
                Globals.bgColors.shift();
              }
            } else {
              var temp = Globals.bgColors.filter(function (stored) {
                return stored !== rgb;
              });
              Globals.bgColors = temp;
            } // update bg to use the new selected colors in the Globals.bgColors list


            updateMosaic = true;
          } // changing the pattern of the removed background
          // make sure the selected color deisplay, is not selected more than allowed


          if (type == 'bgPattern') {
            Globals.bgPattern = data.value;

            if (Globals.bgColors.length <= max) {
              break;
            }

            Globals.bgColors.splice(max);
          } // update the selected color visuals for the new stored value changes


          var list = document.getElementById('bgPalette').querySelectorAll('.' + classname);

          for (var i = 0; i < list.length; i++) {
            if (!Globals.bgColors.includes(list[i].getAttribute('data-rgb'))) {
              list[i].classList.remove(classname);
            }
          } // needs some code for changing the bg and updating the mosaic display


          break;
        }
      // user is changing the crop of the image!!!

      case 'cropper':
        if (!CROPPER.cropped) {
          break;
        } // zoom, rotate


        var cropperResult = CROPPER[data.method](data.option, data.secondOption); // updateMosaic = true;

        break;

      case 'caman':
        // if reset, reset the slider
        if (!UPLOADED_IMAGE || data.option == 'reset') {
          document.getElementById(data.method + "Range").value = data.value;
        } // if no image uplaoded yet, cancel slider move


        if (!UPLOADED_IMAGE) {
          break;
        } // store slider value


        UPLOADED_IMAGE.setFilterList(data.method, data.value); // apply filter to cropped canvas BUT apply it to a copy

        applyFilters();
        break;
    }

    ; // end switch
    // this button affects another button!!!!!

    if (data.effects !== undefined) {
      // all effects should be formatted 'ID-type,...'
      // let allEffects = data.effects.split(',')
      var _data$effects$split = data.effects.split('-'),
          _data$effects$split2 = (0, _slicedToArray2["default"])(_data$effects$split, 2),
          btn = _data$effects$split2[0],
          category = _data$effects$split2[1];

      console.log("btn is ".concat(btn));
      console.log("category is ".concat(category));

      switch (category) {
        case 'dropdown':
          document.getElementById(btn).textContent = data.option;
          var prev = target.parentNode.querySelector('.active');

          if (prev) {
            prev.classList.remove('active');
          }

          target.classList.add('active');
          break;
      }
    } // handle effects cascade
    // user is changing the crop settings!!


    switch (data.method) {
      case 'zoom':
        // calling autoface from zoom is laggy and bad
        // but maybe moving the canvas so that on zoom the cropped selection stays in bounds of the display
        break;

      case 'plateHeight':
      case 'plateWidth':
        CROPPER_OPTIONS.aspectRatio = Globals.aspectRatio; // set ratio triggers the crop event, don't call need to call display mosaics then

        UPLOADED_IMAGE.callOnCrop = false;
        CROPPER.setAspectRatio(Globals.aspectRatio);

      case 'autoface':
        updateMosaic = false;
        getImageForAutoFace();
        break;
    }

    if (updateMosaic) {
      var str = 'from click listener updateMosaic bool';
      DISPLAY_MOSAICS(str);
    } // remove bg checkmark
    // bg disabled = !this.checked;
    // if checked && !Globals.sansBg
    // make a call to remove bg and set result to sansBg
    // call tile mosaic to display no bg mosaic
    // if !checked
    // change display to use bg and call tile mosaic
    // remove bg
    // solid or burst
    // change globals to use solid  / burst bg
    // swap colors
    // switch order of color for burst
    // make call to tile mosaic

  } // return a copty of a canvas


  function filterCopyCanvas(canvas) {
    if (!canvas) {
      canvas = UPLOADED_IMAGE.moasicOptions.canvas;
    }

    var imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    var copyCanvas = canvas.cloneNode();
    copyCanvas.getContext('2d').putImageData(imgData, 0, 0);
    return copyCanvas;
  } // apply filters to a copy of the canvas, these filters do stack, so a copy is necessary


  function applyFilters(canvas, done) {
    if (!canvas) {
      canvas = filterCopyCanvas();
    }

    if (!done) {
      console.log('no callback function passed! creating one!');

      done = function done(resp) {
        console.log(resp); // pass same options but use the copy canvas so the filters aren't layered on previous filters;

        var ops = Object.assign({}, UPLOADED_IMAGE.moasicOptions, {
          filterCanvas: resp
        });
        canvasPreview(ops); // for dev see what the non-tiled cropped section looks like

        SLIDER_CROPPED.innerHTML = '';
        SLIDER_CROPPED.appendChild(resp);
      };
    } // get all the slider values and reapply them


    var sliderList = Object.keys(UPLOADED_IMAGE.filterList);
    Caman(canvas, function () {
      for (var i = 0; i < sliderList.length; i++) {
        this[sliderList[i]](UPLOADED_IMAGE.filterList[sliderList[i]]);
      }

      this.render(function () {
        done(this.canvas);
      });
    });
  }

  var SAVE_MOSAIC = document.getElementById('save');

  SAVE_MOSAIC.onclick = function () {
    // needs a better check for accurate mosaic data
    if (!Globals.hasOwnProperty('mosaic') || !Globals.hasOwnProperty('materials')) {
      throw new Error('no mosaic data was saved');
    }

    var csrftoken = getCookie('csrftoken');
    var headers = {
      'X-CSRFToken': csrftoken,
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    };
    SAVE_MOSAIC.disabled = true;
    fetch("setColorData/", {
      method: 'POST',
      body: JSON.stringify({
        color: Globals.color,
        mosaic: Globals.mosaic,
        materials: Globals.materials,
        plates: Globals.plateCount
      }),
      headers: headers // credentials: 'same-origin',

    }).then(function (response) {
      if (response.status < 200 || response.status > 200) {
        console.log('save mosaic to server not ok. Status code: ' + response.status);
        SAVE_MOSAIC.disabled = false;
        return;
      }

      response.json().then(function (resp) {
        console.log('save mosaic came back ok: ' + resp);
        SAVE_MOSAIC.disabled = false;
      });
    })["catch"](function (err) {
      console.log('save mosaic data Error: ', err);
      SAVE_MOSAIC.disabled = false;
    });
  }; // end click save
  // a js snippit to get the cookie from a browser


  function getCookie(name) {
    var cookieValue = null;

    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');

      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim(); // Does this cookie string begin with the name we want?

        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }

    return cookieValue;
  } // setup use with dither js


  function ditherResult(canvas, options) {
    if (!options || !canvas) {
      canvas = getCropperCanvas();
    } // CONTAINER_RESULT.appendChild(canvas);
    // options with defaults (not required)


    var opts = {
      // Transparent pixels will result in a sparse indexed array
      reIndex: false,
      // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
      palette: Globals.paletteAsArray,
      // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
      colorDist: Globals.colorDist[0],
      // one of ['euclidean', 'manhattan']
      dithKern: Globals.ditherKernals[0],
      // dithering kernel name, see available kernels in docs below
      dithDelta: 0,
      // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
      dithSerp: false,
      // enable serpentine pattern dithering
      method: 2,
      // histogram method, 2: min-population threshold within subregions; 1: global top-population
      boxSize: [64, 64],
      // subregion dims (if method = 2)
      boxPxls: 2,
      // min-population threshold (if method = 2)
      initColors: 4096,
      // # of top-occurring colors  to start with (if method = 1)
      minHueCols: 0,
      // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
      useCache: false,
      // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
      cacheFreq: 10 // min color occurance count needed to qualify for caching
      // colors: 256,          // desired palette size

    };
    var q = new RgbQuant(Object.assign({}, opts, options)); // q.sample(canvas);
    // const palette = q.palette(true);

    var output = q.reduce(canvas); // console.log(output);

    var ctx = canvas.getContext('2d');
    ctx.putImageData(handleUnit8Array(canvas, output), 0, 0);
    return canvas;
  }

  function handleUnit8Array(canvas, arry) {
    var imageData = new ImageData(canvas.width, canvas.height);

    for (var i = 0; i < arry.length; i += 4) {
      imageData.data[i] = arry[i];
      imageData.data[i + 1] = arry[i + 1];
      imageData.data[i + 2] = arry[i + 2];
      imageData.data[i + 3] = arry[i + 3];
    }

    return imageData;
  } // clear sliders,
  // function resetSliders(toClear){
  //   let sliders = Object.keys(UPLOADED_IMAGE.filterList);
  //   if(!toClear){ toClear = sliders; }
  //   else if(!Array.isarray(toCLear)){
  //     if (typeof toClear == 'string' && sliders.inlcudes(toClear)){ toClear = [toClear]; }
  //     else{ throw new Error('invalid slider to clear, expected array of string names / one string name, of a slider'); }
  //   }
  //   else {
  //     let expectedEmpty = toClear.filter(s=> !sliders.includes(s));
  //     if (expectedEmpty.length > 0){ throw new Error('invalid slider array passed, contains invalid sliner name'); }
  //   }
  //   for(let i=0; i<toClear.length; i++){
  //     document.getElementById( toClear[i]+'Range' ).value = 0;
  //     UPLOADED_IMAGE.setFilterList( toClear[i] , 0 );
  //   }
  // }

})(window);

},{"./AutoFace.js":1,"./ConvertPhoto.js":2,"./RawImage.js":3,"./globals.js":4,"@babel/runtime/helpers/interopRequireDefault":12,"@babel/runtime/helpers/slicedToArray":17,"@babel/runtime/helpers/typeof":19}],6:[function(require,module,exports){
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray;
},{}],7:[function(require,module,exports){
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;
},{}],8:[function(require,module,exports){
var arrayLikeToArray = require("./arrayLikeToArray");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
}

module.exports = _arrayWithoutHoles;
},{"./arrayLikeToArray":6}],9:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],10:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],11:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{}],12:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],13:[function(require,module,exports){
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

module.exports = _iterableToArray;
},{}],14:[function(require,module,exports){
function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;
},{}],15:[function(require,module,exports){
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest;
},{}],16:[function(require,module,exports){
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableSpread;
},{}],17:[function(require,module,exports){
var arrayWithHoles = require("./arrayWithHoles");

var iterableToArrayLimit = require("./iterableToArrayLimit");

var unsupportedIterableToArray = require("./unsupportedIterableToArray");

var nonIterableRest = require("./nonIterableRest");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;
},{"./arrayWithHoles":7,"./iterableToArrayLimit":14,"./nonIterableRest":15,"./unsupportedIterableToArray":20}],18:[function(require,module,exports){
var arrayWithoutHoles = require("./arrayWithoutHoles");

var iterableToArray = require("./iterableToArray");

var unsupportedIterableToArray = require("./unsupportedIterableToArray");

var nonIterableSpread = require("./nonIterableSpread");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
},{"./arrayWithoutHoles":8,"./iterableToArray":13,"./nonIterableSpread":16,"./unsupportedIterableToArray":20}],19:[function(require,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],20:[function(require,module,exports){
var arrayLikeToArray = require("./arrayLikeToArray");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray;
},{"./arrayLikeToArray":6}],21:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":22}],22:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}]},{},[5]);

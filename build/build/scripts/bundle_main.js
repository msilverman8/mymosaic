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
        this.adjustTop = this.options.displaySize.top;
        this.adjustLeft = this.options.displaySize.left;
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
    }, {
      key: "_getWidthHeightForAspectRatio",
      value: function _getWidthHeightForAspectRatio(params) {
        var w = params.w,
            h = params.h,
            x = params.x,
            y = params.y; // get aspect ratio

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
        var outputY = Math.max(0, y - (outputHeight - h) * 0.5);
        return {
          'h': outputHeight,
          'w': outputWidth,
          'x': outputX,
          'y': outputY
        };
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
        } // get the output dimensions for an aspect ratio'd box that gits in the image bounds


        var fb = this._getWidthHeightForAspectRatio(facebounds);

        var w = fb.w,
            h = fb.h,
            x = fb.x,
            y = fb.y; // add padding around face box

        var p = .5;
        var padding = Math.ceil(Math.min(w, h) * p); // adjusted left/top for when display container is bigger than the image size

        var px = this.adjustLeft ? x + this.adjustLeft : x;
        var ph = this.adjustTop ? y + this.adjustTop : y;
        var cdata = {
          'w': Math.min(this.maxWidth, w + padding),
          'h': Math.min(this.maxHeight, h + padding)
        }; // center bounds in image as much as possible

        cdata.x = Math.max(0, px - (cdata.w - w) * 0.5);
        cdata.y = Math.max(0, ph - (cdata.h - h) * 0.5);

        var paddedOutputs = this._getWidthHeightForAspectRatio(cdata);

        var pdata = {
          left: paddedOutputs.x,
          top: paddedOutputs.y,
          width: paddedOutputs.w,
          height: paddedOutputs.h
        }; // pdata = facebounds;

        console.table(pdata); // left and top is for set crop box
        // x and y is for set data

        if (this.options.useOriginal) {
          pdata.x = pdata.left;
          pdata.y = pdata.top;
          delete pdata.left;
          delete pdata.top;
        }

        return pdata;
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
      // value is a string formatted like the csv (r,g,b)

      this.mosaicTileCountKey = []; // stores array of rows of tiles left to right as rgba strings
      // ready for context.fillStyle

      this.mosaicRGBAStrings = []; // image data from the canvas context

      this.mosaicColorData = []; // the converted canvas to be returned

      this.mosaicCanvas = null;
    } // end constructor

    /**
     * averages pixel passed and converts it to the closest match in the palette
     * @param  {[number]} red      the red value of the pixel
     * @param  {[number]} green    the green value of the pixel
     * @param  {[number]} blue     the blue value of the pixel
     * @param  {[array]} colorList the array of the palette allowed to convert to
     * @return {[array]}           an array to match the format of canvas imagedata
     */


    (0, _createClass2["default"])(ConvertPhoto, [{
      key: "mappedArrayColor",
      value: function mappedArrayColor(red, green, blue, colorList) {
        var diffR, diffG, diffB, diffDistance;
        var distance = 25000;
        var mappedColor = null; // WEIGHTED

        for (var i = 0; i < colorList.length; i++) {
          var rgb = colorList[i];
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
      /**
       * runs trhough all the imagedata passed and calls convert color on each pixel
       * @param  {[canvas context imagedata]} imageData image data of the canvas to be converted
       * @param  {[array]} colorList array of allowed colors for the mosaic [{r:number,g:number,b:number}, ...]
       * @return {[canvas context imagedata]} the color converted image data
       */

    }, {
      key: "convertColor",
      value: function convertColor(imageData, colorList) {
        var data = imageData.data;

        for (var i = 0; i < data.length; i += 4) {
          var newData = this.mappedArrayColor(data[i], data[i + 1], data[i + 2], colorList);
          data[i] = newData[0];
          data[i + 1] = newData[0 + 1];
          data[i + 2] = newData[0 + 2]; // manually set alpha to full opacity or keep it transparent
          // data[i + 3] = newData[0 + 3] > 0 ? 255 : 0;
        }

        return imageData;
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


        this.mosaicColorData = this.convertColor(img2, this.options.palette).data; // img2 = this.convertColor(img2);
        // store color array as canvas imagedata.data
        // this.mosaicColorData = img2.data;
        //draw
        // ctx.putImageData(img2, 0, 0);
        // return this.options.canvas
      } // THE MAIN TILER IN USE FOR NOW

      /**
       * converts the passed canvas into tilesusing imagedata objects
       * set up for when it was discovered that the way of downsampling was the best way to get a good start of a nice mosaic
       * downsampling options is now limited because of cropper max value causing clipping issues
       * @return {[type]} [description]
       */

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

          this.mosaicColorData = this.convertColor(imda, this.options.palette).data;
        } // get output info


        var mosaicCanvas = document.createElement('canvas');
        var mosaicContext = mosaicCanvas.getContext('2d');
        mosaicCanvas.width = w * s;
        mosaicCanvas.height = h * s; // if remove bg is checked, first fill the canvas with the bg

        console.log('%c using bg replacement pattern? ' + this.options.useBG, 'color:purple;');

        if (this.options.useBG) {
          this.renderBG(mosaicContext, mosaicCanvas.width, mosaicCanvas.height);
        } // for dev
        // this.forCheck = [];
        // plate borders for a visual of viewing the plate and tile division


        var plateBorders = this.getCaps(); // iterate through to get tiles

        for (var i = 0; i < h; i++) {
          for (var j = 0; j < w; j++) {
            var index = (j + i * w) * 4; // for dev color tiles lime green if data errored

            var missing = [57, 255, 20, 255];
            var color = []; // get color from stored data

            getcolorloop: for (var c = 0; c < 4; c++) {
              var r = this.mosaicColorData[index + c];

              if (r === undefined || r === null) {
                color = missing;
                break getcolorloop;
              }

              color.push(r);
            } // if(i> (h*.5) || j>(w*.5)){color[3] = 0;}
            // if(color[3]<1){color = missing;}
            // output tile to canvas


            mosaicContext.fillStyle = 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ',' + Math.ceil(color[3] / 255) + ')';
            mosaicContext.fillRect(j * s, i * s, s, s); // for dev
            // this.forCheck.push(color[0], color[1], color[2], color[3]);
            // for displaying plate division, this should eventually move to a function
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
        return mosaicCanvas;
      } // FOR DISPLAYING TO THE USER WHERE THE PLATES WILL END

      /**
       * calculates each plate border index for the mosaic imagedata array
       * @return {[object]} [returns object of array of indicies where the plate borders are]
       */

    }, {
      key: "getCaps",
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
       * returns to the caller the formatted color data of the mosaic
       * @return {[object]} [data to store in the database]
       */

    }, {
      key: "getStorableData",
      value: function getStorableData() {
        var _this$getTileData = this.getTileData(),
            tileCountKey = _this$getTileData.tileCountKey,
            rgbaSTR = _this$getTileData.rgbaSTR;

        var materials = this.getBillOfMaterials(tileCountKey);
        return {
          'materials': materials,
          'rgbaSTR': rgbaSTR
        };
      }
      /**
       * gets from mosaic the color of each tile in different formats
       * @return {[object]} returns diufferent format of color data for storage into a database
       */

    }, {
      key: "getTileData",
      value: function getTileData() {
        console.log('getting color data');
        var canvas = this.mosaicCanvas;
        var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data; // console.log(imageData);

        var h = this.options.tilesY;
        var w = this.options.tilesX;
        var data = {
          'imageData': imageData,
          'tileCountKey': [],
          'rgbaSTR': []
        }; // iterate through to get tiles

        for (var i = 0; i < h; i++) {
          // this.mosaicRGBAStrings[i] = [];
          // this.mosaicTileCountKey[i] = [];
          data.tileCountKey[i] = [];
          data.rgbaSTR[i] = [];

          for (var j = 0; j < w; j++) {
            var index = (j * this.options.tileSize + i * this.options.tileSize * canvas.width) * 4;
            var color = []; // get color from stored data

            for (var c = 0; c < 4; c++) {
              var r = imageData[index + c];

              if (r === undefined || r === null) {
                throw new Error('pixel in imagedata array was ' + r);
                break;
              }

              color.push(r);
            } // format color data for database


            var commaSeparated = color[0] + ', ' + color[1] + ', ' + color[2];
            var rgbaString = 'rgba(' + commaSeparated + ',' + Math.ceil(color[3] / 255) + ')'; // store data in objects
            // this.mosaicTileCountKey[i].push('(' + commaSeparated + ')');  // formatted for csv
            // this.mosaicRGBAStrings[i].push(rgbaString);                   // formatted for canvas context fill

            data.tileCountKey[i].push('(' + commaSeparated + ')'); // formatted for csv

            data.rgbaSTR[i].push(rgbaString); // formatted for canvas context fill
          }
        }

        return data;
      }
      /**
       * returns the value for the bill of materials property in the database
       * @param {[array]} tileCountKey nested array of the colors in the mosaic as a tuple rgb string
       * @return {[object]} key: string formatted to loook like the csv (r,g,b), value: number count of how many of that color in the mosaic
       */

    }, {
      key: "getBillOfMaterials",
      value: function getBillOfMaterials(tileCountKey) {
        if (!tileCountKey && this.mosaicTileCountKey.length == 0) {
          throw new Error('No tiles were saved!');
        } // count up each color


        var index = this.options.tilesY;
        var row = this.options.tilesX;
        var count = {};

        for (var i = 0; i < index; i++) {
          for (var j = 0; j < row; j++) {
            // get the key for materials and count value of each tile
            // let key = this.mosaicTileCountKey[i][j];
            var key = tileCountKey[i][j];

            if (count.hasOwnProperty(key)) {
              count[key] += 1;
            } else {
              count[key] = 1;
            }
          }
        } // eventually get a final key value pair, but for now


        return count;
      } // methods that deal with creating backgrounds

      /**
       * converts palette to a string value for css / canvas format
       * @return {[array]} the converted color palette
       */

    }, {
      key: "_convertColorListToRGBA",
      value: function _convertColorListToRGBA() {
        var rgbaString = [];

        for (var i = 0; i < this.options.fillColorList.length; i++) {
          var c = this.options.fillColorList[i].split(',');
          var color = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',1)';
          rgbaString.push(color);
        }

        return rgbaString;
      }
      /**
       * converts the palette format to be an array of key value (r:number,g:number,b:number}
       * @return {[array]} returns converted color palette
       */

    }, {
      key: "_convertColorListToDICT",
      value: function _convertColorListToDICT() {
        var obj = [];

        for (var i = 0; i < this.options.fillColorList.length; i++) {
          var c = this.options.fillColorList[i].split(',');
          var color = {
            r: c[0],
            g: c[1],
            b: c[2]
          };
          obj.push(color);
        }

        return obj;
      }
      /**
       * renders the background pattern selected
       * @param  {[canvas context]} ctx the canvas context
       * @param  {[number]} width the width of the canvas
       * @param  {[number]} height the height of the canvas
       */

    }, {
      key: "renderBG",
      value: function renderBG(ctx, width, height) {
        console.log('this.options.fillPattern');
        console.log(this.options.fillPattern); // make sure there is at least one color to use

        if (this.options.fillColorList.length == 0) {
          this.options.fillColorList.push('255,255,255');
        }

        var rgbaLIST = this._convertColorListToRGBA(); // cases for which pattern is selected


        switch (this.options.fillPattern) {
          case 'solid':
            ctx.fillStyle = rgbaLIST[0];
            console.log(rgbaLIST[0]);
            ctx.fillRect(0, 0, width, height);
            break;

          case 'burst':
            // make sure there are atleast 2 colors in this pattern
            if (this.options.fillColorList.length < 2) {
              this.options.fillColorList.push(this.options.fillColorList[0]);
            }

            var imda = this._pattern_burst(rgbaLIST);

            var palette = this._convertColorListToDICT();

            var data = this.convertColor(imda, palette).data;
            var checkColors = [];

            for (var i = 0; i < this.options.tilesY; i++) {
              for (var j = 0; j < this.options.tilesX; j++) {
                var index = (j + i * this.options.tilesX) * 4;
                var color = []; // get color from stored data

                for (var c = 0; c < 4; c++) {
                  var r = data[index + c];
                  color.push(r); // manually set alpha to full opacity
                  // color[3] = 255;
                } // output tile to canvas


                var fillColor = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',1)';
                ctx.fillStyle = fillColor;
                ctx.fillRect(j * this.options.tileSize, i * this.options.tileSize, this.options.tileSize, this.options.tileSize);

                if (!checkColors.includes(fillColor)) {
                  checkColors.push(fillColor);
                }
              }
            }

            console.log('check burst colors');
            console.table(checkColors);
            break;
        }
      } // end render bg

      /**
       * creats the star burst / sun ray pattern for removebg
       * @param  {[array]} colorList [the colors to use for the pattern]
       * @return {[canvas context]}  reutrns the image data context for the bg pattern to append to the canvas
       */

    }, {
      key: "_pattern_burst",
      value: function _pattern_burst(colorList) {
        var canvas = document.createElement('canvas');
        canvas.width = this.options.tilesX;
        canvas.height = this.options.tilesY;
        var ctx = canvas.getContext('2d');
        var side = Math.max(this.options.tilesX, this.options.tilesY);
        var radius = Math.sqrt(Math.pow(side * .5, 2) + Math.pow(side * .5, 2));
        var segments = 16;
        var segmentWidth = 360 / segments;
        var x = this.options.tilesX * .5;
        var y = this.options.tilesY * .5; // let segmentDepth = side / segments;

        var pieAngle = 2 * Math.PI / segments;

        for (var i = 0; i < segments; i++) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.arc(x, y, radius, i * pieAngle, (i + 1) * pieAngle, false);
          var index = i % 2 == 0 ? 0 : 1;
          ctx.fillStyle = colorList[index];
          ctx.fill();
        }

        return ctx.getImageData(0, 0, canvas.width, canvas.height);
      } // end burst pattern

      /**
      * averages a cluster(data) of rgb values then matches the color to the palette
      * @param  {Array} data     The data received by using the getImage() method
      * @return {Object}         The object containing the best match RGB value
      */
      // getAverageColor (data, clusterSize) {
      //   var i = -4;
      //   var pixelInterval = clusterSize;
      //   var count = 0;
      //   var rgb = {r: 0, g: 0, b: 0};
      //   var length = data.length;
      //
      //   switch(this.options.colorChoice){
      //     case 'AL':
      //     case 'CL': // color
      //       while ((i += pixelInterval * 4) < length) {
      //         count++;
      //         rgb.r += data[i] * data[i];
      //         rgb.g += data[i + 1] * data[i + 1];
      //         rgb.b += data[i + 2] * data[i + 2];
      //       }
      //       // Return the sqrt of the mean of squared R, G, and B sums
      //       rgb.r = Math.floor(Math.sqrt(rgb.r / count));
      //       rgb.g = Math.floor(Math.sqrt(rgb.g / count));
      //       rgb.b = Math.floor(Math.sqrt(rgb.b / count));
      //       break;
      //     case 'BW': // should bw use this same conversion????
      //     case 'GR': // grayscale
      //       while ((i += pixelInterval * 4) < length) {
      //         var avg = 0;
      //         // luminosity method
      //         if(this.options.grayType == 'lum'){
      //           avg = (this.utils.weight.r * data[i] +
      //                 this.utils.weight.g * data[i + 1] +
      //                 this.utils.weight.b * data[i + 2]);}
      //         // alternate weighted luminosity method
      //         else if(this.options.grayType == 'lum2'){
      //           avg = (this.utils.altWeight.r * data[i] +
      //                 this.utils.altWeight.g * data[i + 1] +
      //                 this.utils.altWeight.b * data[i + 2]);}
      //         // lightness method
      //         else if(this.options.grayType == 'lgt'){
      //           avg = (Math.max(data[i], data[i + 1], data[i + 2]) + Math.min(data[i], data[i + 1], data[i + 2])) / 2;
      //         }
      //         // average method of grayscale
      //         else {avg = (data[i] + data[i + 1] + data[i + 2]) / 3;}
      //
      //         count++;
      //         rgb.r += avg;
      //         rgb.g += avg;
      //         rgb.b += avg;
      //       }
      //       rgb.r = Math.floor(rgb.r / count);
      //       rgb.g = Math.floor(rgb.g / count);
      //       rgb.b = Math.floor(rgb.b / count);
      //
      //       break;
      //
      //   }
      //
      //   // convert averaged color to closes allowed match
      //   return this.mapColorToPalette(rgb.r, rgb.g, rgb.b);
      //
      //   // return rgb;
      // }

      /**
      * use Euclidian distance to find closest color
      * @param {integer} red the numerical value of the red data in the pixel
      * @param {integer} green the numerical value of the green data in the pixel
      * @param {integer} blue the numerical value of the blue data in the pixel
      * @returns {object} a dictionary of keys r,g,b values are integers
      */
      // mapColorToPalette(red, green, blue)  {
      //   var diffR, diffG, diffB, diffDistance;
      //   var distance = 25000;
      //   var mappedColor = null;
      //   // WEIGHTED
      //   for (var i = 0; i < this.options.palette.length; i++) {
      //     var rgb = this.options.palette[i];
      //     diffR = ((rgb.r - red)   * this.utils.weight.r);
      //     diffG = ((rgb.g - green) * this.utils.weight.g);
      //     diffB = ((rgb.b - blue)  * this.utils.weight.b);
      //     diffDistance = diffR * diffR + diffG * diffG + diffB * diffB;
      //     if (diffDistance < distance) {
      //       distance = diffDistance;
      //       mappedColor = rgb;
      //     }
      //   }
      //   // this returned undefined once, can't get that bug to happen again
      //   // for now just ensure there is always a color returned
      //   if(mappedColor === null){
      //     mappedColor = {r: 0, g: 0, b: 0};
      //   }
      //   return mappedColor;
      // } // end map color
      // CLUSTER DOES NOT WORK RIGHT

      /**
      * Creates an array of the image data of the tile from the data of whole image
      * @param  {number} startX            x coordinate of the first pixel in the tile
      * @param  {number} startY            y coordinate of the first pixel in the tile
      * @param  {number} width             width of the canvas
      * @param  {object} imageData         imageData if the whole canvas
      * @return {array}                    Image data cluster of a tile
      */
      // getClusterData(startX, startY, imageData, clusterSize) {
      //   // should double check this doesn't combine the end of a row and
      //   // the start of the next row
      //   var data = [];
      //   const width = imageData.width;
      //   for (var x = startX; x < (startX + clusterSize); x++) {
      //     var xPos = x * 4;
      //     for (var y = startY; y < (startY + clusterSize); y++) {
      //       var yPos = y * width * 4;
      //       data.push(
      //         imageData.data[xPos + yPos + 0],
      //         imageData.data[xPos + yPos + 1],
      //         imageData.data[xPos + yPos + 2],
      //         imageData.data[xPos + yPos + 3]
      //       );
      //     }
      //   }
      //
      //   return data;
      // };
      // for dev
      // checkDiff(list, toTest=this.forCheck){
      //   if(this.options.methodname != 'createTiles'){throw new Error('this only works for createTiles');}
      //   // let missing = [57, 255, 20, 255];
      //   if(!toTest || !Array.isArray(toTest)){ throw new Error('stored mosaicColorData was abscent or invaliud'); }
      //   let check = [];
      //   for (let j=0; j<list.length; j++){
      //     let mosaic = list[j];
      //     let len = mosaic.length;
      //     check[j] = 0;
      //     if(toTest.length == len){
      //       for (let i=0; i<len; i+=12){
      //         let listPixel ='';
      //         let thisPixel='';
      //         for(let k=i; k<i+12; k+=4){
      //           listPixel += mosaic[k] + '' + mosaic[k+1] + '' + mosaic[k+2]+ '' + mosaic[k+3];
      //           thisPixel += toTest[k]+ '' + toTest[k+1]+ '' + toTest[k+2]+ '' +toTest[k+3];
      //         }
      //         if (thisPixel != listPixel){ check[j]++; }
      //       }
      //     }
      //     else{check[j] = len/4;}
      //   }
      //
      //   return check;
      //
      // }
      // adjustMosaicDisplay(canvas, displaySize) {
      //   canvas.width = this.options.tilesX / this.options.displaySize;
      //   canvas.height = this.options.tilesY / this.options.displaySize;
      // }
      // resizeCreatedCanvas (newWidth, newHeight, canvas){
      //   // make sure there is a canvas
      //   if( !canvas || canvas instanceof HTMLCanvasElement ||
      //       !this.mosaicCanvas || !this.mosaicCanvas instanceof HTMLCanvasElement){
      //         throw new Error('no canvas to resize');
      //   }
      //   if( !this.mosaicRGBAStrings || !Array.isArray(this.mosaicRGBAStrings) ||
      //       this.mosaicRGBAStrings.length == 0){
      //         throw new Error('no stored tile list, make sure to create mosaic first');
      //   }
      //   // get new tile size
      //   const newTileSize = newWidth / this.options.tilesX;
      //
      //   // get canvas context
      //   canvas = canvas || this.mosaicCanvas;
      //   const ctx = canvas.getContext('2d');
      //   for (var i = 0; i < newHeight; i++) {
      //     for (var j = 0; j < newWidth; j++) {
      //       // get cluster
      //       var x = j * newTileSize,
      //           y = i * newTileSize;
      //       // get stored color
      //       ctx.fillStyle = this.mosaicRGBAStrings[i][j];
      //       // output tile to canvas
      //       ctx.fillRect(x, y, newTileSize, newTileSize);
      //     }
      //   }
      //
      // } // end resize
      // getOutputSize() {
      //   var clusterSize = 1;
      //   var cluster = false;
      //   if(this.options.canvas.width > this.options.tilesX){
      //     // cluster size is
      //     clusterSize = Math.floor(this.options.canvas.width / this.options.tilesX);
      //
      //
      //     this.clusterSpare = this.options.canvas.width % this.options.tilesX;
      //     cluster = true;
      //   }
      //   // this.options.canvas.width < this.options.tilesX
      //     // no cluster conversion needed but what do here
      //
      //   return {
      //     w: this.options.tilesX * this.options.tileSize,
      //     h: this.options.tilesY * this.options.tileSize,
      //     clusterSize: clusterSize,
      //   }
      // }

      /**
      * Divides the whole canvas into smaller tiles and finds the average
      * colour of each block. After calculating the average colour, it stores
      * an array of the tiles as rgba strings and appends canvas to the dom
      */
      // tileCanvas() {
      //   console.log(' ! calling tile canvas ! ');
      //   // this.options.targetElement.appendChild(this.options.canvas);
      //   // get output info
      //   var mosaicCanvas = document.createElement('canvas');
      //   if(this.options.classname){mosaicCanvas.classList.add(this.options.classname);}
      //   var mosaicContext = mosaicCanvas.getContext('2d');
      //   const { w, h, clusterSize, cluster } = this.getOutputSize();
      //   mosaicCanvas.width = w;
      //   mosaicCanvas.height = h;
      //   // get tiler info
      //   var width = this.options.canvas.width;
      //   var height = this.options.canvas.height;
      //   var passedContext = this.options.canvas.getContext('2d');
      //   var passedImageData = this.options.imageData || passedContext.getImageData(0, 0, width, height);
      //   // var index = x + (y * width); // image data
      //
      //   // set up storage of mosaic data
      //   this.mosaicTileCountKey = [];
      //   this.mosaicRGBAStrings = [];
      //   this.mosaicImageData = []; // 2d matrix notation
      //   var x, y, clusterData, averageColor, commaSeparated, color;
      //   var s = cluster ? clusterSize : this.options.tileSize;
      //   const plateBorders = this.getCaps();
      //   // iterate through to get tiles
      //   for (var i = 0; i < this.options.tilesY; i++) {
      //     // store colors
      //     this.mosaicTileCountKey[i] = [];
      //     this.mosaicRGBAStrings[i] = [];
      //     for (var j = 0; j < this.options.tilesX; j++) {
      //       // get cluster
      //       x = j * clusterSize;
      //       y = i * clusterSize;
      //       // convert colors for this cluster
      //       clusterData = this.getClusterData(x, y, passedImageData, clusterSize);
      //       averageColor = this.getAverageColor(clusterData, clusterSize);
      //       // get storable objects
      //       commaSeparated = averageColor.r + ', ' + averageColor.g + ', ' + averageColor.b;
      //       color = 'rgba(' + commaSeparated + ', ' + this.options.opacity + ')';
      //       // store tile color
      //       // this.mosaicImageData[(i * this.options.tilesX) + j].push([averageColor.r, averageColor.g, averageColor.b, this.options.opacity]);
      //       this.mosaicTileCountKey[i].push('(' + commaSeparated + ')');
      //       this.mosaicRGBAStrings[i].push(color);
      //       // output tile to canvas
      //       // output canvas may be different size than the clustered canvas
      //       mosaicContext.fillStyle = color;
      //       mosaicContext.fillRect((j * s) , (i * s), s, s);
      //
      //       // stroke each tile
      //       mosaicContext.stroke = 'rgba(255, 255, 255, 255)';
      //       mosaicContext.strokeRect((j * s) , (i * s), s, s);
      //       // highlight borders of the plate
      //       if(plateBorders.x.includes(j) || plateBorders.y.includes(i)){
      //         mosaicContext.fillStyle = 'rgba(255, 255, 255, .5)';
      //         mosaicContext.fillRect((j * s) , (i * s), s, s);
      //       }
      //     }
      //   }
      //
      //   // clear container and append mosaicCanvas to DOM
      //   // this.options.targetElement.innerHTML = '';
      //   // this.options.targetElement.appendChild(mosaicCanvas);
      //   // this.options.targetElement.appendChild(this.options.canvas);
      //   this.mosaicCanvas = mosaicCanvas;
      //   return mosaicCanvas
      // };

    }]);
    return ConvertPhoto;
  }(); // end class ConvertPhoto


  return ConvertPhoto;
});

},{"@babel/runtime/helpers/classCallCheck":10,"@babel/runtime/helpers/createClass":11,"@babel/runtime/helpers/interopRequireDefault":12,"@babel/runtime/helpers/slicedToArray":17,"@babel/runtime/helpers/toConsumableArray":18,"@babel/runtime/helpers/typeof":19}],3:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// data pertaining to the uploaded image, to be reset on each new image upload
(function () {
  "use strict";

  var Globals = require('./globals.js'); // object to keep cuurently active image adjustments all in one palce


  var UploadedImage = {
    original_uploadedImageURL: null,
    // a createObjectURL of the original uploaded image, neccessary for CROPPER to work
    removebg_uploadedImageURL: null,
    // see above, but for the image returned from the remove background api
    file: null,
    // the uploaded file
    // original: null,                   // img el of the original file
    // removebg: null,                   // img el of the nobg
    storedCropperData: {},
    // store cropper data for switching betweent nobg and original but keeping transforms
    moasicOptions: {},
    // the options relevant to creating the user's mosaic, used for copying the canvas for filter applications
    callOnCrop: false,
    // bool for CROPPER, sometimes the crop event fires before the ready event
    usePreset: false,
    // boll to apply a preset filter to mosaic'd image
    preset: '',
    // string name of the preset filter to apply
    applyFilters: false,
    // a bool is true if a value in the filter list is not it's initial value
    _baseFilterValues: {},

    // gets the initial value of all filters to determine if applyFilters should be true
    get filterList() {
      return this._filterList;
    },

    // set the value for the specific filter
    setFilterList: function setFilterList(key, value) {
      this._filterList[key] = value;

      this._updateApplyFilters();
    },
    // initialize the filter handling objects
    initFilterList: function initFilterList() {
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

      this.resetAllFilters();
      this.resetPresets();
    },
    // looks through all slider filter stores, if a value is not the reset value apply filters is true
    _updateApplyFilters: function _updateApplyFilters(key, value) {
      for (var _i = 0, _Object$entries = Object.entries(this._filterList); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2),
            _key = _Object$entries$_i[0],
            _value = _Object$entries$_i[1];

        if (this._filterList[_key] != this._baseFilterValues[_key]) {
          this.applyFilters = true;
          break;
        }

        this.applyFilters = false;
      }
    },
    // resets all filter values to their initial value
    resetAllFilters: function resetAllFilters() {
      for (var _i2 = 0, _Object$entries2 = Object.entries(this._filterList); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = (0, _slicedToArray2["default"])(_Object$entries2[_i2], 2),
            key = _Object$entries2$_i[0],
            value = _Object$entries2$_i[1];

        this._filterList[key] = this._baseFilterValues[key];
        document.getElementById(key + "Range").value = this._baseFilterValues[key];
      }

      this._updateApplyFilters();
    },
    // resets presets (eventually reset the DOM when active present style happens)
    resetPresets: function resetPresets() {
      this.usePreset = false;
      this.preset = '';
    },
    // all resets to be made on new image upload
    startFresh: function startFresh() {
      // reset image filters
      this.resetAllFilters(); // reset preset buttons

      this.resetPresets(); // reset the removebg api status

      this.removebgApiStatus = this.statusList.ready; // the transforms of the cropper instance on the image
      // not using it right now?

      this.storedCropperData = {};
    },
    // list of statuses for checking on the status of the removeapi call
    statusList: {
      ready: 'ready',
      pending: 'pending',
      success: 'success',
      // types of errors should be added and checked for later
      error: 'error'
    },

    // get and set the status of the call to removebg api
    get removebgApiStatus() {
      return this._removebgApiStatus;
    },

    set removebgApiStatus(status) {
      this._removebgApiStatus = status;
    },

    // initial values needed to be set for the UploadedImage obkect
    init: function init() {
      // set initial removebgapi status
      this.removebgApiStatus = this.statusList.ready; // initialize the filter list storage

      this.initFilterList();
    }
  };
  UploadedImage.init();
  module.exports = UploadedImage;
})();

},{"./globals.js":4,"@babel/runtime/helpers/interopRequireDefault":12,"@babel/runtime/helpers/slicedToArray":17}],4:[function(require,module,exports){
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
    } // 3rd party
    // ditherjs properties
    // ditherKernals: [null, 'FloydSteinberg', 'FalseFloydSteinberg', 'Stucki', 'Atkinson', 'Jarvis', 'Burkes', 'Sierra', 'TwoSierra', 'SierraLite'],
    // colorDist: ['euclidean', 'manhattan'],

  };
  module.exports = Globals;
})();

},{}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

// imports
var Globals = require('./globals.js');

var UploadedImage = require('./UploadedImage.js');

var ConvertPhoto = require('./ConvertPhoto.js');

var AutoFace = require('./AutoFace.js'); // 3rd party imports
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
      Globals.colorData = cd; // set globals object of palette choices

      Globals.color = 'CL'; // should eventually get this value from the views template defaults value

      Globals.resetPalette(); // initialize some globals objects

      displayPalette(); // populate the dom with the palette buttons
    } catch (e) {
      console.warn(e);
    } // initialize the bg pattern / any other globals defaults here, get the defaults from django views


    Globals.bgPattern = 'solid';
  })(); // cropper variables


  var URL = window.URL || window.webkitURL,
      // for ie
  CONTAINER_UPLOADED = document.getElementById('containerUploaded'),
      // uploaded image container
  IMG_EL = document.getElementById('imgUploaded'),
      // the HTMLImageELement for the uploaded image
  CONTAINER_RESULT = document.getElementById('containerResult'),
      // parent of mosaic display
  PREVIEW_RESULT = document.getElementById('previewResult'),
      // preview container
  SLIDER_CROPPED = document.getElementById('previewSliderResult'),
      // preview the cropped non-tiled section w/ slider tweaks
  MOSAIC_INSTANCE = null,
      // variable for the mosaic instance to be callable from whole page

  /**
   * main function to convert cropped section into a mosiac and display that mosaic to the dom
   * @param  {[object]} options [options for cropper canvas, may not be used always, created for development]
   * @return {[undefined]}      [doesn't return anything]
   */
  DISPLAY_MOSAICS = function DISPLAY_MOSAICS(options) {
    // should be called when new pixels in crop box area and the mosaic display needs refreshed
    console.log(options);
    console.log('--- display mosaics called ---'); // first call to conversion is for the preview beside the upload image, this mosaic should be filter free

    console.log('- converting for sample default preview -'); // display raw preview
    // uses default cropper canvas options to optain a canvas

    setConversionSettings({
      targetElement: PREVIEW_RESULT,
      tileSize: Math.max(1, Math.floor(PREVIEW_RESULT.clientWidth / Globals.x)),
      saveCanvas: false
    }); // second call to conversion for a larger preview that can be altered

    console.log('- converting for main mosaic container -'); // display main alterable mosaic
    // CONTAINER_RESULT.innerHTML = '';

    var defaults = {
      // tileSize: Math.max( 1, Math.floor(CONTAINER_RESULT.clientWidth/Globals.x) ),
      tileSize: 8,
      saveCanvas: true
    };
    setConversionSettings(defaults); // there are no more changes so no need to save again.

    SAVE_MOSAIC.disabled = false;
  },

  /**
   * a default ready callback for the cropper ready event
   * @param  {[event]} e [croppers custom event]
   */
  DEFAULT_READY = function DEFAULT_READY(e) {
    console.log('%c' + e.type, 'color:green;');
    console.log('default ready');
    var str = 'from default ready';
    DISPLAY_MOSAICS(str); // UploadedImage.callOnCrop = true;
  },
      // options for the cropper object
  // check the docs for clarification on these
  CROPPER_OPTIONS = {
    aspectRatio: Globals.aspectRatio,
    viewMode: 2,
    ready: DEFAULT_READY,
    autoCrop: false,
    autoCropArea: .01,
    zoomOnWheel: false,
    zoomOnTouch: false,
    // cropper events
    cropstart: function cropstart(e) {
      console.log('%c' + e.type, 'color:green;');
      console.log('%c' + e.detail.action, 'color:green;');
    },
    cropmove: function cropmove(e) {
      console.log('%c' + e.type, 'color:orange;');
      console.log('%c' + e.detail.action, 'color:orange;');
    },
    cropend: function cropend(e) {
      console.log('%c' + e.type, 'color:red;');
      console.log('%c' + e.detail.action, 'color:red;');
      var str = 'from cropend';
      DISPLAY_MOSAICS(str);
    },
    crop: function crop(e) {
      console.log('%c' + e.type, 'color:blue;'); // bool so that if a chain of cropper methods are called the mosaic will only be updated once

      if (UploadedImage.callOnCrop) {
        var str = 'from crop';
        DISPLAY_MOSAICS(str);
      }

      UploadedImage.callOnCrop = true;
    },
    zoom: function zoom(e) {
      console.log('%c' + e.type, 'color:purple;');
    }
  },
      // keep track of image upload object values
  CROPPER; // the cropper instance


  var IMAGE_INPUT = document.getElementById('importImage'); // the input for the uploaded photot

  /**
   * a function to call cropper's getCroppedCanvas inchludes some default options
   * cropper docs reccomend a max width and height value so a canvas is never returned blank if region is too large
   * setting these values causes a rotated image to return with incorrect bounds, making the result different from the crop box region
   * @param  {[object]} options [cropper getCroppedCanvas options]
   * @return {[HTMLCanvasElement]}  [returns the cropped region of the uploaded image as visialized by cropper's cropbox as a canvas element]
   */

  function getCropperCanvas(options) {
    // setting the max values like this causes problems, leaving it commented out for now
    // get a canvas of the region outlined by the cropbox
    // set maxWidth to not exceed the naturalWidth
    var boxD = CROPPER.getCropBoxData(); // let maxWidth = boxD.width * UploadedImage.scaleFactor;
    // let maxHeight = boxD.height * UploadedImage.scaleFactor;

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
      imageSmoothingQuality: 'high' // one of ['low', 'medium', 'high']
      // maxWidth: 4096,
      // maxHeight: 4096,

    };
    var ops = defaults;

    if (useOptions) {
      ops = Object.assign({}, defaults, options);
    }

    return CROPPER.getCroppedCanvas(ops);
  }
  /**
   * builds the settings for the conversion, calls the conversion function
   * @param  {[object]} options [takes in passed settings to override defaults]
   */


  function setConversionSettings(options) {
    // get options to sent to convert photo
    console.log(' --- canvas preview --- '); // const previewWidth = Globals.x * Globals.tileSize;
    // const previewHeight = Globals.y * Globals.tileSize;

    var useOptions = options && (0, _typeof2["default"])(options) == 'object' ? true : false;
    console.log('use canvas preview passed options ? ' + useOptions); // set up the options to be passed to conversion

    var defaults = {
      // where the mosoic is loaded should stay constant
      targetElement: CONTAINER_RESULT,
      // the only reason this should change is on responsive window resize?
      tileSize: Globals.tileSize
    };
    var updateEveryCall = {
      colorChoice: Globals.color,
      // the key name for the palette a string
      palette: Globals.palette,
      // array of the rgba colors
      tilesX: Globals.x,
      // number of tiles in the x axis
      tilesY: Globals.y,
      // number of tiles in the y axis
      // values below are only used if defaults useBG is true (remove bg is checked)
      useBG: Globals.useBG,
      // whether or not to use the bg pattern
      fillColorList: Globals.bgColors,
      // list of colors to use in the bg
      fillPattern: Globals.bgPattern // string of the bg pattern type

    }; // get option object from defaults + passed

    var ops;

    if (useOptions) {
      ops = Object.assign({}, defaults, options, updateEveryCall);
    } else {
      ops = Object.assign({}, defaults, updateEveryCall);
    }

    if (!ops.hasOwnProperty('canvas')) {
      console.log('getting default canvas');
      ops.canvas = getCropperCanvas();
    } // store options for this image, preview does not get saved


    if (useOptions && options.saveCanvas) {
      UploadedImage.moasicOptions = Object.assign({}, ops);
    } // if filters have been applied, gotta apply them for this canvas
    // only apply filters to the result mosaic, not the preview


    if (ops.targetElement == CONTAINER_RESULT && (UploadedImage.applyFilters || UploadedImage.usePreset)) {
      // called from updating the cropper box and not from filter adjust
      // gotta apply existing stored filters
      if (!options.hasOwnProperty('filterCanvas')) {
        // regenerate canvas form new cropbox view, so canvas is null
        applyFilters(function (resp) {
          var ops = Object.assign({}, UploadedImage.moasicOptions, {
            canvas: resp
          });
          callConversion(ops); // for dev see what the non-tiled canvas image looks like with the filters

          SLIDER_CROPPED.innerHTML = '';
          SLIDER_CROPPED.appendChild(resp);
        }); // applyFilters calls conversion

        return;
      } // called with a filter canvas object passed, so was called from the filter listener


      ops.canvas = ops.filterCanvas;
    }

    callConversion(ops);
  } // end preview canvas

  /**
   * [calls the method in convertPhoto, updates the dom, updates the current image tracking object]
   * @param  {[object]} ops [the options built in setConversionSettings]
   * @return {[type]}     [description]
   */


  function callConversion(ops) {
    var method = 'createTiles'; // holdover from testing different tiling methods, might still use it so keep the format

    if (ops.hasOwnProperty('methodname')) {
      method = ops.methodname;
    } // create new mosaic instance


    MOSAIC_INSTANCE = new ConvertPhoto(ops); // call for the tiler

    var mosaic = MOSAIC_INSTANCE[method](); // clear the copied filtered canvas from storage

    if (UploadedImage.moasicOptions && UploadedImage.moasicOptions.hasOwnProperty('filterCanvas')) {
      delete UploadedImage.moasicOptions.filterCanvas;
    } // add to dom


    console.log("updating container: ".concat(ops.targetElement.id));
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

  /**
   * either builds new cropper instance with new upload or switches out removebg/original image
   * @param  {[string]} typeSTR [whether or not it's a new upload or a switch out]
   */


  function appendCropperImageToDOM(typeSTR) {
    console.log('appending to dom');
    var suffix = '_uploadedImageURL'; // the suffix for the key for the objecturl

    var urlkey = typeSTR + suffix; // the full url key

    var src = UploadedImage[urlkey]; // the objecturl

    console.log('image source is');
    console.log(src); // set transformations of current cropper instance to apply to the impending image if swapping

    if (CROPPER && CROPPER.cropped) {
      console.log('%c--------------------------', 'color:red;');
      console.log('switching image'); // false becuase removebg returns a different sized image

      CROPPER.replace(src, false); // update the ready function to be different from a new upload

      CROPPER.options.ready = function (e) {
        console.log('%c' + e.type, 'color:green;');
        console.log('ready has been reset after replace'); // set values of transforms for this image session after ready
        // rotate

        UploadedImage.callOnCrop = false;
        CROPPER.rotateTo(UploadedImage.storedCropperData.naturalData.rotate); // zoom + move values

        UploadedImage.callOnCrop = false;
        CROPPER.setCanvasData({
          left: UploadedImage.storedCropperData.wrapperData.left,
          top: UploadedImage.storedCropperData.wrapperData.top,
          width: UploadedImage.storedCropperData.wrapperData.width,
          height: UploadedImage.storedCropperData.wrapperData.height
        }); // the cropbox position

        UploadedImage.callOnCrop = false;
        CROPPER.clear();
        UploadedImage.callOnCrop = false;
        CROPPER.crop(); // will call display mosaics from the crop event this triggers

        CROPPER.setCropBoxData(UploadedImage.storedCropperData.boxData);
      };
    } // a new image upload, no need to copy over any transformations
    else if (typeSTR == 'original') {
        console.log('new upload'); // new upload gets autoface

        CROPPER_OPTIONS.ready = function (e) {
          console.log('%c' + e.type, 'color:green;');
          console.log(this.cropper);
          console.log('upload ready');
          getImageForAutoFace();
        }; // create new cropper instance for new upload


        CROPPER = new Cropper(IMG_EL, CROPPER_OPTIONS);
      } // for dev clear the untiled filtered image


    SLIDER_CROPPED.innerHTML = ''; // for dev clear the full grab after transform to send to autoface

    document.getElementById('devImageResult').innerHTML = '';
  } // listener for user uploaded image


  if (URL) {
    IMAGE_INPUT.onchange = function () {
      var files = this.files;
      var file; // make sure a file was uploaded

      if (files && files.length) {
        file = files[0]; // make sure it's an image file

        if (/^image\/\w+/.test(file.type)) {
          // save file to image object
          UploadedImage.file = file; // revoke previous image and removebg image if exists on each new image upload

          if (UploadedImage.original_uploadedImageURL) {
            URL.revokeObjectURL(UploadedImage.original_uploadedImageURL); // revoke if exists the remove background image

            if (UploadedImage.removebg_uploadedImageURL) {
              URL.revokeObjectURL(UploadedImage.removebg_uploadedImageURL);
              UploadedImage.removebg_uploadedImageURL = null;
            }
          } // create new object url for this upload


          UploadedImage.original_uploadedImageURL = URL.createObjectURL(file);
          IMG_EL.src = UploadedImage.original_uploadedImageURL; // clear values pertaining to previous image upload

          UploadedImage.startFresh(); // clear previous cropper instance if exists

          if (CROPPER && CROPPER.cropped) {
            CROPPER.destroy();
          } // a new upload so type is original


          appendCropperImageToDOM('original'); // reset remove background ui option

          resetRemoveBG(false); // clear file upload input for next upload

          IMAGE_INPUT.value = null;
        } else {
          window.alert('Please choose an image file.');
        }
      }
    };
  } else {
    IMAGE_INPUT.disabled = true;
    IMAGE_INPUT.parentNode.className += ' disabled';
  }
  /**
   * calculates the bounds of the displayed portion of the image and grabs a full cropped canvas of that area
   * @return {[object]} [the full display as a HTMLCanvasElement, the left x coordinate, the top y coordinate]
   */


  function getdisplayCrop() {
    // wrapper - the transformed image container
    var wrapper = CROPPER.getCanvasData(); // console.log('%c wrapper', 'color:orange;');
    // console.table(wrapper);
    // let imgData = CROPPER.getImageData();
    // console.log('%c img data', 'color:orange;');
    // console.table(imgData);
    // grab current data

    var stored = CROPPER.getData(); // console.log('%c Data', 'color:orange;');
    // console.table(stored);
    // container - the div that the image is uploaded to, overflow is set to hidden

    var cd = CROPPER.getContainerData(); // console.log('%c container data', 'color:orange;');
    // console.table(cd);
    // object to hold the visible bounds of the image

    var fullCrop = {}; // get the full visible area of the image as a cropped region
    // find out if the right side of the image is out of bounds

    var wrapperWidth = wrapper.width + wrapper.left;

    if (wrapper.left < 0) {
      // left side of image out of bounds, set to 0
      fullCrop.left = 0; // if the right side of the image is out of bounds, use the display end point : else img is within bounds keep same value

      fullCrop.width = wrapperWidth > cd.width ? cd.width : wrapperWidth;
    } else {
      // left side of image is within bounds keep the left value the same
      fullCrop.left = wrapper.left; // if the right side of the image is out of bounds, calculate the distance to the display end point : else img is within bounds keep same value

      fullCrop.width = wrapperWidth > cd.width ? cd.width - fullCrop.left : wrapper.width;
    } // find out if the bottom of the image is out of bounds using same logic as above


    var wrapperHeight = wrapper.height + wrapper.top;

    if (wrapper.top < 0) {
      fullCrop.top = 0;
      fullCrop.height = wrapperHeight > cd.height ? cd.height : wrapperHeight;
    } else {
      fullCrop.top = wrapper.top;
      fullCrop.height = wrapperHeight > cd.height ? cd.height - wrapper.top : wrapper.height;
    } // set triggers crop event which converts crop area to mosaic, which is unwanted right now


    UploadedImage.callOnCrop = false; // change the aspect ratio to get the full display image from cropper getcroppedcanvas

    CROPPER.setAspectRatio(fullCrop.width / fullCrop.height);
    UploadedImage.callOnCrop = false; // get the canvas of the entire displayed area

    var getFull = CROPPER.setCropBoxData(fullCrop);
    var defaults = {
      width: fullCrop.width,
      height: fullCrop.height // maxWidth: fullCrop.width,
      // maxHeight: fullCrop.height,
      // minWidth: fullCrop.width,
      // minHeight: fullCrop.height,

    }; // if the image is rotated the wrapper will not be fillcrop value, so if setting max dimensions this needs to be considered
    // use this if rotated
    // let ar = (fullCrop.width / fullCrop.height);
    // let rotate = {
    //   width: fullCrop.width,
    //   height: fullCrop.height,
    // maxWidth: 4096,
    // maxHeight: 4096 / ar,
    // minWidth: ar,
    // minHeight: 1,
    // };
    // let ops = stored.rotate != 0 ? rotate : defaults;

    var ops = defaults; // console.log((stored.rotate != 0) + ' - ' + typeof stored.rotate);

    console.table(ops); // get the canvas

    var canvas = CROPPER.getCroppedCanvas(ops); // restore to user crop
    // restore aspect ratio

    UploadedImage.callOnCrop = false;
    CROPPER.setAspectRatio(Globals.aspectRatio); // restore data

    UploadedImage.callOnCrop = false;
    CROPPER.setData(stored);
    return {
      canvas: canvas,
      top: fullCrop.top,
      left: fullCrop.left
    };
  }
  /**
   * for dev, displays the displayed image section grabbed to send to autoface to clarify wat got grabbed
   * @param  {[HTMLImageELement]} image [the image sent to autoface]
   * @param  {[string]} str   [for logging, description of what is calling this function]
   * @param  {[bool]} clear [whether or not to clear the dom container element for display]
   */


  function devDisplaySentToAutoFace(image, str, clear) {
    console.log(str);
    var container = document.getElementById('devImageResult');

    if (clear) {
      container.innerHTML = '';
    }

    container.appendChild(image);
  }
  /**
   * setups for calling autoface
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */


  function getImageForAutoFace(options) {
    // calls functions to get a snap of the whole display area in case of image transformations,
    // sends the transformed image to autoface, instead of the default uploaded image
    if (CROPPER && !CROPPER.cropped) {
      CROPPER.crop();
    } // get snap of entire visible image in the display


    var results = getdisplayCrop();
    var canvas = results.canvas;
    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var newImg = document.createElement('img');
      newImg.src = url; // for dev, display the image that was sent to confirm the section was grabbed correctly

      devDisplaySentToAutoFace(newImg, 'called from getImageForAutoFace', true);

      newImg.onload = function () {
        // send transformed display to autoface to find face
        useAutoFace({
          image: newImg,
          useOriginal: false,
          displaySize: {
            width: canvas.width,
            height: canvas.height,
            top: results.top,
            left: results.left
          }
        }); // no longer need to read the blob so it's revoked

        URL.revokeObjectURL(url);
      };
    });
  }
  /**
   * calls the autoface function
   * @param  {[object]} options [settings to pass / append to defaults for autoface]
   */


  function useAutoFace(options) {
    console.log('calling autoface'); // TODO: set up a loading overlay to give auto detect faces time to return
    // get the auto crop bound if there are faces

    var defaults = {
      image: UploadedImage.file,
      aspectRatio: Globals.aspectRatio,
      useOriginal: true
    };
    var ops = defaults;

    if (options && (0, _typeof2["default"])(options) == "object") {
      ops = Object.assign({}, defaults, options);
    }

    console.log(ops.image); // for dev display image that was sent to autoface to confirm it is correct

    devDisplaySentToAutoFace(ops.image, 'called from AutoFace promise return', false); // get the bounds of the faceapi calculated to the passed aspect ratio

    new AutoFace(ops).results.then(function (resp) {
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
  }
  /**
   * resets the ui display for remove bg button
   * @param {[bool]} checked [sets the ui to match bool]
   */


  function resetRemoveBG(checked) {
    var box = document.getElementById('useRemoveBG');

    if (box.checked != checked) {
      box.checked = checked;
    }

    var btn = document.getElementById('removeBG');
    var btnSelector = btn.getAttribute('data-target');
    var classname = 'show';
    var btnTarget = document.querySelector(btnSelector); // have check enable / disable button

    btn.disabled = !checked; // close dropdown if open and use removed bg is no longer selected

    if (!checked && btnTarget.classList.contains(classname)) {
      $(btnSelector).collapse('hide');
    }
  }
  /**
   * listener for handling the remove bg call / switch if already called
   */


  document.getElementById('useRemoveBG').onchange = function () {
    // call for remove background / handle background tools display
    var typeSTR = this.checked ? 'removebg' : 'original';
    console.log('remove bg clicked, state is ' + typeSTR);
    var calledRemovebg = false; // indicate if pattern will be sent to convert photo

    Globals.useBG = this.checked;

    if (CROPPER && CROPPER.cropped) {
      // store current data for restoring crop box to the same spot
      // has to keep all transforms from original background to remove background
      UploadedImage.storedCropperData = {
        naturalData: CROPPER.getData(),
        // the cropbox position / other data in relation to original image size
        wrapperData: CROPPER.getCanvasData(),
        // the image wrapper - holds all transform data in relation to the container / display image
        boxData: CROPPER.getCropBoxData() // the cropbox position in relation to the container parent display div
        // imgData: CROPPER.getImageData(),         // uploaded image data - still unsure of how to use
        // containerData: CROPPER.getContainerData(),   // the block element parent container to the image

      };
    }

    if (this.checked) {
      // checked if called remove bg yet
      if (UploadedImage.removebgApiStatus === UploadedImage.statusList.ready) {
        // make request to removebg API
        UploadedImage.removebgApiStatus = UploadedImage.statusList.pending;
        uploadForRemoveBG()["catch"](function (e) {
          UploadedImage.removebgApiStatus = UploadedImage.statusList.error;
          console.warn(e);
        });
        calledRemovebg = true;
      }
    }

    resetRemoveBG(this.checked); // set visual based on check chagne
    // if a switch not a call remove bg, change dom

    if (!calledRemovebg) {
      appendCropperImageToDOM(typeSTR);
    }
  };
  /**
   * the post request for calling removebg api
   */


  function uploadForRemoveBG() {
    return _uploadForRemoveBG.apply(this, arguments);
  } // container for the cropper tools


  function _uploadForRemoveBG() {
    _uploadForRemoveBG = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var url, csrftoken, headers, imageField, formData;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              url = 'removebg/'; // the view to call

              csrftoken = getCookie('csrftoken'); // get csrf toekent from cookies

              headers = {
                // set the header of what to get from the server
                'X-CSRFToken': csrftoken,
                'Accept': '*/*'
              }; // create th body of the request

              imageField = UploadedImage.file;

              if (imageField) {
                _context.next = 6;
                break;
              }

              throw new Error('no uploaded image found');

            case 6:
              formData = new FormData();
              formData.append("image_file", imageField); // make the call

              _context.next = 10;
              return fetch(url, {
                method: 'POST',
                body: formData,
                headers: headers
              }) // for now only handles streaming response body
              .then(function (resp) {
                // resp is a readable stream
                var reader = resp.body.getReader();
                return new ReadableStream({
                  start: function start(controller) {
                    return pump();

                    function pump() {
                      return reader.read().then(function (_ref) {
                        var done = _ref.done,
                            value = _ref.value;

                        // When no more data needs to be consumed, close the stream
                        if (done) {
                          controller.close();
                          return;
                        } // Enqueue the next data chunk into our target stream


                        controller.enqueue(value);
                        return pump();
                      });
                    } // end pump

                  } // end start

                });
              }) // Create a new response out of the stream
              .then(function (rs) {
                return new Response(rs);
              }) // Create an object URL for the response
              .then(function (response) {
                return response.blob();
              }) // save the created url to be revoked upon new upload of image
              .then(function (blob) {
                UploadedImage.removebg_uploadedImageURL = URL.createObjectURL(blob); // call apply to dom

                appendCropperImageToDOM('removebg'); // update api call status

                UploadedImage.removebgApiStatus = UploadedImage.statusList.success;
              });

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _uploadForRemoveBG.apply(this, arguments);
  }

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
    var updateMosaic = false; // check which main category of command was called

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
          }

          updateMosaic = true; // updates the custom palette, add removes colors

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
            }
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
          }

          break;
        }
      // user is changing the crop of the image!!!

      case 'cropper':
        if (!CROPPER || !CROPPER.cropped) {
          break;
        } // zoom, rotate


        var cropperResult = CROPPER[data.method](data.option, data.secondOption); // updateMosaic = true;

        break;

      case 'caman':
        // console.table(Object.keys(Caman.prototype));
        // if no image uplaoded yet, cancel slider move and reset values
        if (UploadedImage.file === null) {
          UploadedImage.resetAllFilters();
          break;
        } // if reset, reset the slider


        if (data.option == 'reset') {
          document.getElementById(data.method + "Range").value = data.value;
        } // get preset bool


        var preset = target.getAttribute('data-preset'); // if reset all

        if (data.method == 'reset') {
          UploadedImage.resetPresets();
          UploadedImage.resetAllFilters();
        } else if (preset) {
          // a preset button hit
          // reset all sliders
          UploadedImage.resetAllFilters(); // apply selected preset

          UploadedImage.usePreset = true;
          UploadedImage.preset = data.method;
        } else {
          // a slider change
          // store slider value
          UploadedImage.setFilterList(data.method, data.value);
          console.log("method: ".concat(data.method, ", value: ").concat(data.value));
        } // apply filter to cropped canvas


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
        // no crop initialized, so no need to adjust the crop box
        if (!CROPPER || !CROPPER.cropped || UploadedImage.file === null) {
          CROPPER_OPTIONS.aspectRatio = Globals.aspectRatio;
          CROPPER.setAspectRatio(Globals.aspectRatio);
          break;
        }

        var changingWidth = data.method.split('plate')[0].toLowerCase() == 'width';
        var currentCBD = CROPPER.getCropBoxData();
        CROPPER_OPTIONS.aspectRatio = Globals.aspectRatio; // set ratio triggers the crop event, don't call need to call display mosaics then

        UploadedImage.callOnCrop = false;
        CROPPER.setAspectRatio(Globals.aspectRatio);
        var newWidth = changingWidth ? currentCBD.height * Globals.aspectRatio : currentCBD.width;
        var newHeight = !changingWidth ? currentCBD.width / Globals.aspectRatio : currentCBD.height;
        var newCBDdata = {
          width: newWidth,
          height: newHeight,
          left: currentCBD.left,
          top: currentCBD.top
        };
        UploadedImage.callOnCrop = false;
        CROPPER.setCropBoxData(newCBDdata);
        break;

      case 'autoface':
        updateMosaic = false;
        getImageForAutoFace();
        break;
    }

    if (updateMosaic) {
      var str = 'from click listener updateMosaic bool';
      DISPLAY_MOSAICS(str);
    }
  } // return a copty of the canvas


  function getFilterPrep(done) {
    var canvas = UploadedImage.moasicOptions.canvas;
    var imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    var copyCanvas = canvas.cloneNode();
    copyCanvas.getContext('2d').putImageData(imgData, 0, 0);

    if (!done) {
      console.log('no callback function passed! creating one!');

      done = function done(resp) {
        console.log(resp); // pass same options but use the copy canvas so the filters aren't layered on previous filters;

        var ops = Object.assign({}, UploadedImage.moasicOptions, {
          filterCanvas: resp
        });
        setConversionSettings(ops); // for dev see what the non-tiled cropped section looks like

        SLIDER_CROPPED.innerHTML = '';
        SLIDER_CROPPED.appendChild(resp);
      };
    }

    return {
      canvas: copyCanvas,
      done: done
    };
  } // apply filters to a copy of the canvas, these filters do stack, so a copy is necessary


  function applyFilters(done) {
    var prep = getFilterPrep(done);
    var canvas = prep.canvas;
    done = prep.done;
    Caman(canvas, function () {
      // use caman preset if preset bool
      if (UploadedImage.usePreset) {
        this[UploadedImage.preset]();
      }

      if (UploadedImage.applyFilters) {
        for (var _i2 = 0, _Object$entries2 = Object.entries(UploadedImage.filterList); _i2 < _Object$entries2.length; _i2++) {
          var _Object$entries2$_i = (0, _slicedToArray2["default"])(_Object$entries2[_i2], 2),
              key = _Object$entries2$_i[0],
              value = _Object$entries2$_i[1];

          this[key](value);
        }
      }

      this.render(function () {
        done(this.canvas);
      });
    });
  }

  var SAVE_MOSAIC = document.getElementById('save');

  SAVE_MOSAIC.onclick = function () {
    // call to get the data
    if (!MOSAIC_INSTANCE) {
      throw new Error('no mosaic data was saved');
    }

    var _MOSAIC_INSTANCE$getS = MOSAIC_INSTANCE.getStorableData(),
        materials = _MOSAIC_INSTANCE$getS.materials,
        rgbaSTR = _MOSAIC_INSTANCE$getS.rgbaSTR;

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
        plates: Globals.plateCount,
        mosaic: rgbaSTR,
        'materials': materials
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
  // function ditherResult(canvas, options){
  //
  //   if(!options || !canvas){canvas = getCropperCanvas();}
  //   // CONTAINER_RESULT.appendChild(canvas);
  //
  //   // options with defaults (not required)
  //   var opts = {
  //       // Transparent pixels will result in a sparse indexed array
  //       reIndex: false,                       // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
  //       palette: Globals.paletteAsArray,    // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
  //       colorDist: Globals.colorDist[0],      // one of ['euclidean', 'manhattan']
  //       dithKern: Globals.ditherKernals[0],   // dithering kernel name, see available kernels in docs below
  //       dithDelta: 0,            // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
  //       dithSerp: false,         // enable serpentine pattern dithering
  //       method: 2,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
  //       boxSize: [64,64],        // subregion dims (if method = 2)
  //       boxPxls: 2,              // min-population threshold (if method = 2)
  //       initColors: 4096,        // # of top-occurring colors  to start with (if method = 1)
  //       minHueCols: 0,           // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
  //       useCache: false,         // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
  //       cacheFreq: 10,           // min color occurance count needed to qualify for caching
  //       // colors: 256,          // desired palette size
  //   };
  //
  //   let q = new RgbQuant(Object.assign({}, opts, options));
  //
  //   // q.sample(canvas);
  //   // const palette = q.palette(true);
  //   let output = q.reduce(canvas);
  //   // console.log(output);
  //   let ctx = canvas.getContext('2d');
  //   ctx.putImageData(handleUnit8Array(canvas, output), 0, 0);
  //
  //   return canvas;
  //
  // }
  //
  // function handleUnit8Array(canvas, arry) {
  //   let imageData = new ImageData(canvas.width, canvas.height);
  //   for (var i=0;i < arry.length; i+=4) {
  //       imageData.data[i]   = arry[i];
  //       imageData.data[i+1] = arry[i+1];
  //       imageData.data[i+2] = arry[i+2];
  //       imageData.data[i+3] = arry[i+3];
  //   }
  //   return imageData;
  // }

})(window);

},{"./AutoFace.js":1,"./ConvertPhoto.js":2,"./UploadedImage.js":3,"./globals.js":4,"@babel/runtime/helpers/asyncToGenerator":9,"@babel/runtime/helpers/interopRequireDefault":12,"@babel/runtime/helpers/slicedToArray":17,"@babel/runtime/helpers/typeof":19,"@babel/runtime/regenerator":21}],6:[function(require,module,exports){
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

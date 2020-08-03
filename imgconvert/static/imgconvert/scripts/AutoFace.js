// detects the faces an image and returns the bounding box including all faces
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.AutoFace = factory());
}(this, (function () { 'use strict';

  const DEFAUTLS = {
    image: null,
    aspectRatio: 1,
  }
  class AutoFace {
    constructor(options){
      if (!options.image) {
        throw new Error(`image not passed with call to find face!`);
      }

      this.options = Object.assign({}, DEFAUTLS, options);
      // get the display dimensions of the image to get accurate face bounds
      const ic = this.options.image.parentElement;
      this.displaySize = { width: ic.clientWidth, height: ic.clientHeight };
      console.table(this.displaySize);
      // detect faces and get face detection object
      this.results = this._init().catch(e => { console.warn(e); });
    }

    async _init() {
      console.log('initializing face bounds');
      const faceapi = window.faceapi;
      // load the model for face-api
      if(!faceapi.nets.tinyFaceDetector.isLoaded){
        let url = 'static/build/manualAdds/';
        await faceapi.nets.tinyFaceDetector.loadFromUri(url);
      }

      // call detect the faces (this takes the longest)
      const detections = await faceapi.detectAllFaces(this.options.image, new faceapi.TinyFaceDetectorOptions());
      // resize the detected boxes in case your displayed image has a different size than the original
      const resizedDetections = faceapi.resizeResults(detections, this.displaySize);
      // get the face bounds
      const faceBounds = this._getFaceArea(resizedDetections);
      // get the crop bounds
      return this._getAutoCropBounds(faceBounds);

    } // end init

    _getFaceArea(resizedDetections) {
      // get the data for cropper
      console.log('init.2 - getting the face area');
      let x = this.displaySize.width;
      let y = this. displaySize.height;
      var bounds = {
        x: x,
        y: y,
        x_max: 0,
        y_max: 0,
        get w() { return this.x_max - this.x },
        get h() { return this.y_max - this.y },
      };

      if(resizedDetections.length){
        for (var i = 0; i < resizedDetections.length; i++) {
          // the docs don't have anything on just returning the location?
          // maybe look into that method that returns a canvas of the face????
          let face = resizedDetections[i]._box;

          let x = face._x;
          let y = face._y;
          let x_max = x + face._width;
          let y_max = y + face._height;

          bounds.x = Math.min(bounds.x, x);
          bounds.y = Math.min(bounds.y, y);
          bounds.x_max = Math.max(bounds.x_max, x_max);
          bounds.y_max = Math.max(bounds.y_max, y_max);
        }
        return bounds
      }
      return false
    } // end get face area

    // returns autocrop bounds to center on detected faces
    _getAutoCropBounds(facebounds) {
      console.log('init.3 crop bounds');
      // no faces detected
      if(!facebounds){
        console.log('no faces detected');
        return false
      }
      const {w , h, x, y} = facebounds;
      // get aspect ratio
      const ar = this.options.aspectRatio;
      // new values
      var nw = 0;
      var nh = 0;
      // get the width and height to contain the faces and meet aspect ratio
      // x is the long side
      if(ar != 1){ // not a square mosaic
        // h == 1
        nw = h * ar;
        if(nw < w){
          // w == 1
          nh = w / ar;
          nw = w;
        }
        else { nh = h; }
      }
      else { // square mosaic
        nw = nh = Math.max(w, h);
      }

      // adjust faces to fit in the middle of the containment bounds
      const nx = this._centerFaceBox(nw, w, x);
      const ny = this._centerFaceBox(nh, h, y);

      // add padding around face box
      const p = .08;
      const padding = Math.ceil(Math.min(nw, nh) * p);
      // dictionary formatted specifically for cropper
      const cdata = {
        left: Math.max(0, (nx - padding)),
        top: Math.max(0, (ny - padding)),
        width: Math.min(this.displaySize.width, (nw + padding)),
        height: Math.min(this.displaySize.height, (nh + padding)),
      };

      return cdata
    } // end get crop area

    _centerFaceBox(border, center, oldPos) {
      const move = (border - center) / 2;
      return Math.max(0, (oldPos - move))
    }

  } // end class


    return AutoFace;

   })));

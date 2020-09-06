// detects the faces an image and returns the bounding box including all faces
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.AutoFace = factory());
}(this, (function () { 'use strict';

  const DEFAULTS = {
    image: null,
    aspectRatio: 1,
  };
  // get api
  const faceapi = window.faceapi;
  // load model
  loadModel().catch(e=>{ console.warn(e); });

  // checks if model is loaded for face api, if not it loads it
  async function loadModel() {
    console.log('checking for face detect model');
    // load the model for face-api
    if(!faceapi.nets.tinyFaceDetector.isLoaded){
      console.log('model not loaded, loading now');
      let url = 'static/build/manualAdds/';
      await faceapi.nets.tinyFaceDetector.loadFromUri(url);
    }
  }



  /**
   * uses face-api.js to detect faces and then returns dimension to auto crop area to include the faces
   */
  class AutoFace {
    constructor(options){
      if (!options.image) {
        throw new Error(`image not passed with call to find face!`);
      }

      // get instance options
      this.options = Object.assign({}, DEFAULTS, options);

      // get the display dimensions of the image to get accurate face bounds
      if(!options.hasOwnProperty('displaySize')){
        let ic = this.options.image.parentElement;
        if(!ic){ ic = { clientWidth: 0, clientHeight: 0, } };
        this.options.displaySize = { width: ic.clientWidth, height: ic.clientHeight };
      }

      // detect faces and get face detection object
      this.results = this._init().catch(e => { console.warn(e); });

      if(this.options.useOriginal){ // sending over getData
        this.maxWidth = this.options.image.naturalWidth;
        this.maxHeight = this.options.image.naturalHeight;
      }
      else { // calculating here based on display size and using set cropbox on main
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
    async _init() {
      console.log('initializing face bounds');
      // check if model loaded for face-api
      await loadModel();
      // call detect the faces (this takes the longest)
      const detections = await faceapi.detectAllFaces(this.options.image, new faceapi.TinyFaceDetectorOptions());

      // resize the detected boxes in case displayed image has a different size than the original
      // there are 3 different sizes to consider (original, cropper zoomed, and the container display)
      let finalDetections;
      let method = "_getFaceArea";
      if(this.options.zoomedDetections){
        finalDetections = faceapi.resizeResults(detections, this.options.zoomedSize);
        method = "_getFaceArea2";
      }
      else if(this.options.useOriginal){
        finalDetections = detections;
      }
      else {
        finalDetections = faceapi.resizeResults(detections, this.options.displaySize);
      }

      // get the face bounds
      const faceBounds = this[method](finalDetections);
      // get the crop bounds
      return this._getAutoCropBounds(faceBounds);

    } // end init

    _getFaceArea(detections){
      // get the data for cropper
      console.log('getting the face area');
      let x = this.maxWidth;
      let y = this.maxHeight;
      let bounds = {
        x: x,
        y: y,
        x_max: 0,
        y_max: 0,
        get w() { return this.x_max - this.x },
        get h() { return this.y_max - this.y },
      };

      if(detections.length){
        console.log(`${detections.length} faces found!`);
        for (let i = 0; i < detections.length; i++) {
          // the docs don't have anything on just returning the location?
          // maybe look into that method that returns a canvas of the face????
          let face = detections[i]._box;

          let x = face._x;
          let y = face._y;
          // console.log(`face-${i} coords: (${x}, ${y})`);
          let x_max = x + face._width;
          let y_max = y + face._height;

          bounds.x = Math.min(bounds.x, x);
          bounds.y = Math.min(bounds.y, y);
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
    _getAutoCropBounds(facebounds) {
      // no faces detected
      if(!facebounds){
        console.log('no faces detected');
        return false;
      }
      // get the values for the merged faces calculated bounds
      const {w, h, x, y} = facebounds;
      // get aspect ratio
      const ar = this.options.aspectRatio;

      // final dimensions
      let outputHeight = h;
      let outputWidth = outputHeight * ar;
      // make sure using as much from found faces as possible
      if(outputWidth < w){
        outputWidth = w;
        outputHeight = outputWidth / ar;
        // make sure new height does not exceed original image height
        if(outputHeight > this.maxHeight){
          outputHeight = this.maxHeight;
          outputWidth = outputHeight * ar;
        }
      }

      // center bounds in image as much as possible
      let outputX = Math.max(0, (x - (outputWidth - w) * 0.5));
      let outputY = Math.max(0, (y - (outputHeight - h) * 0.5));


      // dictionary formatted specifically for cropper
      let cdata = {
        left: outputX,
        top: outputY,
        width: outputWidth,
        height: outputHeight,
      };



      // add padding around face box
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
      });

      // left and top is for set crop box
      // x and y is for set data
      if(this.options.useOriginal) {
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
    _getFaceArea2(resizedDetections) {
      // get the data for cropper
      console.log('getting the face area');
      let x = this.maxWidth;
      let y = this.maxHeight;

      let bounds = {
        x: x,
        y: y,
        x_max: 0,
        y_max: 0,
        get w() { return this.x_max - this.x },
        get h() { return this.y_max - this.y },
      };

      if(resizedDetections.length){
        console.log(`${resizedDetections.length} faces found!`);
        let left = 0, top = 0;
        // the image is resized, but overflowing the container, so get the left and top amount to adjust
        if(this.options.zoomedDetections){
          left = this.options.zoomedPosition.left;
          top = this.options.zoomedPosition.top;
        }
        for (let i = 0; i < resizedDetections.length; i++) {
          // the docs don't have anything on just returning the location?
          // maybe look into that method that returns a canvas of the face????
          let face = resizedDetections[i]._box;

          let x = face._x + left;
          let y = face._y + top;
          // console.log(`face-${i} coords: (${x}, ${y})`);
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




  } // end class


  return AutoFace;

})));

// data pertaining to the uploaded image, to be reset on each new image upload
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.RawImage = factory());
}(this, (function () { 'use strict';
const Globals = require('./globals.js');
class RawImage{
  constructor(){
    // the crop event is called before ready on some initial options settings
    // endsure mosaic preview is not called too often / early with setting this boolean to keep track
    this.callOnCrop = false;

    // handle all filter checks / objects
    this._useOneFilter = false;           // which key to use to get the filter list
    this.applyFilters = false;            // a bool is true if a value in the filter list is not it's initial value
    this._baseFilterValues = {};          // gets the initial value of all filters to determine if applyFilters should be true

    // initialize the filter list storage
    this.initFilterList();

    // init blank cropper data obj

  }

  // turns file upload into a image blob object and loads it in the dom
  handleImage(options){
    console.log('initiating upload');
    this.image = options.image;   // the image object probably a blob
    this.URL = options.windowURL; // the global url window object


    // create new cropping image
    this.createdObjectURL = this.URL.createObjectURL(options.file);
    this.image.src = this.createdObjectURL;

    this.image.onload = ()=>{
      // set the default scale factor of the image vs display
      this.scaleFactor = this.image.naturalWidth / this.image.parentElement.clientWidth;

      // keep track of the center of the crop box for this image
      this.cropboxCenter = {
        x: this.image.parentElement.clientWidth * .5,
        y: this.image.parentElement.clientHeight * .5,
      };

      // make sure display is no larger than the natural size of the image???
      // might be needed for the cropper box data ???
      // needs testing
      this.image.parentElement.style.maxHeight = this.image.naturalHeight
      this.image.parentElement.style.maxWidth = this.image.naturalWidth;
    };
  }

  // release upload url
  cleanUP(){ this.URL.revokeObjectURL(this.createdObjectURL); }


  get filterList() {
    // return this._filterList[Globals.color];
    return this._filterList;
  }
  // store speparate slider values for each color palette
  setFilterList(key, value){
    // set the value for this filter for the selected color palette choice

    // this._filterList[Globals.color][key] = value;
    this._filterList[key] = value;
    this._checkAppyFilterSingle(key, value);
  }

  // initialize the filter handling objects
  initFilterList(){
    this._filterList = {};
    let list = document.getElementById('slidersContent').querySelectorAll('[data-option="reset"]');
    for ( let el of list ) {
      let name = el.getAttribute('data-method');
      let val = el.value
      this._filterList[name] = val;
      this._baseFilterValues[name] = val;
    }

    console.table(this._filterList);
  }

  // initialize the filter handling objects
  initFilterListByColor(){
    this._filterList = {};
    let list = document.getElementById('slidersContent').querySelectorAll('[data-option="reset"]');
    for (let color of Object.keys(Globals.colorData)){
      this._filterList[color] = {};
      for ( let el of list ) {
        let name = el.getAttribute('data-method');
        let val = el.value
        this._filterList[color][name] = val;
        this._baseFilterValues[name] = val;
      }
    }

    console.table(this._filterList);
  }

  initCropperData(toStore){
    this.cropperData = Object.assign({}, toStore);
    console.log('storing ');
    console.table(toStore);
    console.table(this.cropperData);
  }

  _checkAppyFilterSingle(key, value){
    this.applyFilters = this._baseFilterValues[key] != value;
  }

  // image instance created
  // sent to auto face
  // on return store the data received
    // UPLOADED_IMAGE.cropperData {box, data, the display container?????}
      // big data distance to the top of the cropbox >= box distance
    // if false
    // auto crop should happen?
    // store that cropbox data ? or still regulate data
  //


}

return RawImage;

})));

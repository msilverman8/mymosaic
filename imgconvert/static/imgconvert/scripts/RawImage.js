// data pertaining to the uploaded image, to be reset on each new image upload
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.RawImage = factory());
}(this, (function () { 'use strict';
const Globals = require('./globals.js');
class RawImage{
  constructor(image){
    this.image = image;
    // the crop event is called before ready on some initial options settings
    // endsure mosaic preview is not called too often / early with setting this boolean to keep track
    this.callOnCrop = false;

    // handle all filter checks / objects
    // this._useOneFilter = false;           // which key to use to get the filter list
    this.applyFilters = false;            // a bool is true if a value in the filter list is not it's initial value
    this._baseFilterValues = {};          // gets the initial value of all filters to determine if applyFilters should be true

    // initialize the filter list storage
    this.initFilterList();

    // this.handleImage(options);

  }

  // is called onload of image
  handleImage(options){
    console.log('initiating image obj');
    if(!options || options.image){throw new Error('invalid image object'); console.log(image);}
    this.image = options.image;

    // set the default scale factor of the image vs display
    // not using scale factor anymore
    // this.scaleFactor = this.image.naturalWidth / this.imageContainer.clientWidth;

    // keep track of the center of the crop box for this image
    // this.cropboxCenter = {
    //   x: this.image.parentElement.clientWidth * .5,
    //   y: this.image.parentElement.clientHeight * .5,
    // };

    // make sure display is no larger than the natural size of the image???
    // might be needed for the cropper box data ???
    // needs testing
    // this.image.parentElement.style.maxHeight = this.image.naturalHeight
    // this.image.parentElement.style.maxWidth = this.image.naturalWidth;
    };



  get filterList() {
    // return this._filterList[Globals.color];
    return this._filterList;
  }
  // store speparate slider values for each color palette
  setFilterList(key, value){
    // set the value for this filter for the selected color palette choice

    // this._filterList[Globals.color][key] = value;
    this._filterList[key] = value;
    this._updateApplyFilters();
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
    this.resetAllFilters();
  }

  // looks through all slider filter stores, if a value is not the reset value apply filters is true
  _updateApplyFilters(key, value){
    for(let [key, value] of Object.entries(this._filterList)){
      if(this._filterList[key] != this._baseFilterValues[key]){
        this.applyFilters = true;
        break;
      }
      this.applyFilters = false;
    }
  }

  // resets all filter values to their initial value
  resetAllFilters(){
    for(let [key, value] of Object.entries(this._filterList)){
      this._filterList[key] = this._baseFilterValues[key];
      document.getElementById(key+"Range").value = this._baseFilterValues[key];
    }
    this._updateApplyFilters();
  }

  // // initialize the filter handling objects
  // initFilterListByColor(){
  //   this._filterList = {};
  //   let list = document.getElementById('slidersContent').querySelectorAll('[data-option="reset"]');
  //   for (let color of Object.keys(Globals.colorData)){
  //     this._filterList[color] = {};
  //     for ( let el of list ) {
  //       let name = el.getAttribute('data-method');
  //       let val = el.value
  //       this._filterList[color][name] = val;
  //       this._baseFilterValues[name] = val;
  //     }
  //   }
  //
  //   console.table(this._filterList);
  // }

  // initCropperData(toStore){
  //   this.cropperData = Object.assign({}, toStore);
  //   console.log('storing ');
  //   console.table(toStore);
  //   console.table(this.cropperData);
  // }


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

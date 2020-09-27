// data pertaining to the uploaded image, to be reset on each new image upload
(()=>{"use strict";

const Globals = require('./globals.js');
// object to keep cuurently active image adjustments all in one palce
var UploadedImage = {
  original_uploadedImageURL: null,   // a createObjectURL of the original uploaded image, neccessary for CROPPER to work
  removebg_uploadedImageURL: null,   // see above, but for the image returned from the remove background api
  file: null,                        // the uploaded file
  // original: null,                   // img el of the original file
  // removebg: null,                   // img el of the nobg
  storedCropperData: {},              // store cropper data for switching betweent nobg and original but keeping transforms
  moasicOptions: {},                 // the options relevant to creating the user's mosaic, used for copying the canvas for filter applications
  callOnCrop: false,                 // bool for CROPPER, sometimes the crop event fires before the ready event
  usePreset: false,                  // boll to apply a preset filter to mosaic'd image
  preset: '',                        // string name of the preset filter to apply
  applyFilters: false,               // a bool is true if a value in the filter list is not it's initial value
  _baseFilterValues: {},             // gets the initial value of all filters to determine if applyFilters should be true
  get filterList() {
    return this._filterList;
  },
  // set the value for the specific filter
  setFilterList: function(key, value){
    this._filterList[key] = value;
    this._updateApplyFilters();
  },

  // initialize the filter handling objects
  initFilterList: function(){
    this._filterList = {};
    let list = document.getElementById('slidersContent').querySelectorAll('[data-option="reset"]');
    for ( let el of list ) {
      let name = el.getAttribute('data-method');
      let val = el.value
      this._filterList[name] = val;
      this._baseFilterValues[name] = val;
    }
    this.resetAllFilters();
    this.resetPresets();
  },

  // looks through all slider filter stores, if a value is not the reset value apply filters is true
  _updateApplyFilters: function(key, value){
    for(let [key, value] of Object.entries(this._filterList)){
      if(this._filterList[key] != this._baseFilterValues[key]){
        this.applyFilters = true;
        break;
      }
      this.applyFilters = false;
    }
  },

  // resets all filter values to their initial value
  resetAllFilters: function(){
    for(let [key, value] of Object.entries(this._filterList)){
      this._filterList[key] = this._baseFilterValues[key];
      document.getElementById(key+"Range").value = this._baseFilterValues[key];
    }
    this._updateApplyFilters();
  },
  // resets presets (eventually reset the DOM when active present style happens)
  resetPresets: function(){
    this.usePreset = false;
    this.preset = '';
  },
  // all resets to be made on new image upload
  startFresh: function(){
    // reset image filters
    this.resetAllFilters();
    // reset preset buttons
    this.resetPresets();
    // reset the removebg api status
    this.removebgApiStatus = this.statusList.ready;
    // the transforms of the cropper instance on the image
    // not using it right now?
    this.storedCropperData = {};
  },

  // list of statuses for checking on the status of the removeapi call
  statusList: {
    ready: 'ready',
    pending: 'pending',
    success: 'success',
    // types of errors should be added and checked for later
    error: 'error',
  },
  // get and set the status of the call to removebg api
  get removebgApiStatus() {
    return this._removebgApiStatus
  },
  set removebgApiStatus(status) {
    this._removebgApiStatus = status;
  },

  // initial values needed to be set for the UploadedImage obkect
  init: function() {
    // set initial removebgapi status
    this.removebgApiStatus = this.statusList.ready;
    // initialize the filter list storage
    this.initFilterList();
  },


}

UploadedImage.init();

module.exports = UploadedImage;
})();

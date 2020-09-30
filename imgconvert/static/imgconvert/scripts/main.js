// imports
const Globals = require('./globals.js');
const UploadedImage = require('./UploadedImage.js');
const ConvertPhoto = require('./ConvertPhoto.js');
const AutoFace = require('./AutoFace.js');

// 3rd party imports
// import Cropper from 'cropperjs';
// const RgbQuant = require('rgbquant');

(function( window ) {'use strict';
  // get window objects
  // 3rd party
  const Cropper = window.Cropper;
  const Caman = window.Caman;

  // gets the color data passed to the template
  (()=>{
    console.log('getting color palette');
    // handle color choices from the template
    const jsonValueID = 'colorData';
    try {
      const cd = JSON.parse(document.getElementById(jsonValueID).textContent);
      Globals.colorData = cd; // set globals object of palette choices
      Globals.color = 'CL'; // should eventually get this value from the views template defaults value
      Globals.resetPalette(); // initialize some globals objects
      displayPalette(); // populate the dom with the palette buttons
    }
    catch(e) {console.warn(e)}

    // initialize the bg pattern / any other globals defaults here, get the defaults from django views
    Globals.bgPattern = 'solid';

  })();

  // cropper variables
  var URL = window.URL || window.webkitURL,                               // for ie
      CONTAINER_UPLOADED = document.getElementById('containerUploaded'),  // uploaded image container
      IMG_EL = document.getElementById('imgUploaded'),                    // the HTMLImageELement for the uploaded image
      CONTAINER_RESULT = document.getElementById('containerResult'),      // parent of mosaic display
      PREVIEW_RESULT = document.getElementById('previewResult'),          // preview container
      SLIDER_CROPPED = document.getElementById('previewSliderResult'),    // preview the cropped non-tiled section w/ slider tweaks
      MOSAIC_INSTANCE = null,  // variable for the mosaic instance to be callable from whole page
      /**
       * main function to convert cropped section into a mosiac and display that mosaic to the dom
       * @param  {[object]} options [options for cropper canvas, may not be used always, created for development]
       * @return {[undefined]}      [doesn't return anything]
       */
      DISPLAY_MOSAICS = function (options) {
        // should be called when new pixels in crop box area and the mosaic display needs refreshed
        console.log(options);
        console.log('--- display mosaics called ---');

        // first call to conversion is for the preview beside the upload image, this mosaic should be filter free
        console.log('- converting for sample default preview -');
        // display raw preview
        // uses default cropper canvas options to optain a canvas
        setConversionSettings({
          targetElement: PREVIEW_RESULT,
          tileSize: Math.max( 1, Math.floor(PREVIEW_RESULT.clientWidth/Globals.x) ),
          saveCanvas: false,
        });


        // second call to conversion for a larger preview that can be altered
        console.log('- converting for main mosaic container -');
        // display main alterable mosaic
        // CONTAINER_RESULT.innerHTML = '';
        let defaults = {
          // tileSize: Math.max( 1, Math.floor(CONTAINER_RESULT.clientWidth/Globals.x) ),
          tileSize: 8,
          saveCanvas: true,
        };

        setConversionSettings(defaults);


        // there are no more changes so no need to save again.
        SAVE_MOSAIC.disabled = false;
      },
      /**
       * a default ready callback for the cropper ready event
       * @param  {[event]} e [croppers custom event]
       */
      DEFAULT_READY = function(e){
        console.log('%c'+e.type,'color:green;');
        console.log('default ready');
        let str = 'from default ready';
        DISPLAY_MOSAICS(str);
        // UploadedImage.callOnCrop = true;

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
        cropstart: function (e) {
          console.log('%c'+e.type,'color:green;');
          console.log('%c'+e.detail.action,'color:green;');
        },
        cropmove: function (e) {
          console.log('%c'+e.type,'color:orange;');
          console.log('%c'+e.detail.action,'color:orange;');
        },
        cropend: function (e) {
          console.log('%c'+e.type,'color:red;');
          console.log('%c'+e.detail.action,'color:red;');
          let str = 'from cropend';
          DISPLAY_MOSAICS(str);
        },
        crop: function (e) {
          console.log('%c'+e.type,'color:blue;');

          // bool so that if a chain of cropper methods are called the mosaic will only be updated once
          if(UploadedImage.callOnCrop){
            let str = 'from crop';
            DISPLAY_MOSAICS(str);
          }

          UploadedImage.callOnCrop = true;
        },
        zoom: function (e) {
          console.log('%c'+e.type,'color:purple;');
        }
      },
      // keep track of image upload object values
      CROPPER; // the cropper instance
      const IMAGE_INPUT = document.getElementById('importImage'); // the input for the uploaded photot


  /**
   * a function to call cropper's getCroppedCanvas inchludes some default options
   * cropper docs reccomend a max width and height value so a canvas is never returned blank if region is too large
   * setting these values causes a rotated image to return with incorrect bounds, making the result different from the crop box region
   * @param  {[object]} options [cropper getCroppedCanvas options]
   * @return {[HTMLCanvasElement]}  [returns the cropped region of the uploaded image as visialized by cropper's cropbox as a canvas element]
   */
  function getCropperCanvas(options){
    // setting the max values like this causes problems, leaving it commented out for now
    // get a canvas of the region outlined by the cropbox
    // set maxWidth to not exceed the naturalWidth
    let boxD = CROPPER.getCropBoxData();
    // let maxWidth = boxD.width * UploadedImage.scaleFactor;
    // let maxHeight = boxD.height * UploadedImage.scaleFactor;

    let useOptions = (options && typeof options == 'object') ? true : false;
    console.log('---------------- cropper canvas extract ----------------------');
    // console.log(`use passed options for cropper? ${useOptions}`);

    let defaults = {
      width: boxD.width,
      height: boxD.height,
      minWidth: Globals.x,
      minHeight: Globals.y,
      // maxWidth: maxWidth,
      // maxHeight: maxHeight,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high', // one of ['low', 'medium', 'high']
      // maxWidth: 4096,
      // maxHeight: 4096,
    };
    let ops = defaults;

    if(useOptions) { ops = Object.assign({}, defaults, options); }
    return CROPPER.getCroppedCanvas(ops);
  }



  /**
   * builds the settings for the conversion, calls the conversion function
   * @param  {[object]} options [takes in passed settings to override defaults]
   */
  function setConversionSettings(options){
    // get options to sent to convert photo
    console.log(' --- canvas preview --- ');
    // const previewWidth = Globals.x * Globals.tileSize;
    // const previewHeight = Globals.y * Globals.tileSize;
    let useOptions = (options && typeof options == 'object') ? true : false;
    console.log('use canvas preview passed options ? ' + useOptions);

    // set up the options to be passed to conversion
    let defaults = {
      // where the mosoic is loaded should stay constant
      targetElement: CONTAINER_RESULT,
      // the only reason this should change is on responsive window resize?
      tileSize: Globals.tileSize,
    };
    let updateEveryCall = {
      colorChoice: Globals.color,       // the key name for the palette a string
      palette: Globals.palette,         // array of the rgba colors
      tilesX: Globals.x,                // number of tiles in the x axis
      tilesY: Globals.y,                // number of tiles in the y axis
      // values below are only used if defaults useBG is true (remove bg is checked)
      useBG: Globals.useBG,             // whether or not to use the bg pattern
      fillColorList: Globals.bgColors,  // list of colors to use in the bg
      fillPattern: Globals.bgPattern,   // string of the bg pattern type
    };
    // get option object from defaults + passed
    let ops;
    if(useOptions){ ops = Object.assign({}, defaults, options, updateEveryCall); }
    else { ops = Object.assign({}, defaults, updateEveryCall); }
    if(!ops.hasOwnProperty('canvas')){
      console.log('getting default canvas');
      ops.canvas = getCropperCanvas();
    }

    // store options for this image, preview does not get saved
    if(useOptions && options.saveCanvas){
      UploadedImage.moasicOptions = Object.assign({}, ops);
    }

    // if filters have been applied, gotta apply them for this canvas
    // only apply filters to the result mosaic, not the preview
    if(ops.targetElement == CONTAINER_RESULT && ( UploadedImage.applyFilters || UploadedImage.usePreset ) ){
      // called from updating the cropper box and not from filter adjust
      // gotta apply existing stored filters
      if(!options.hasOwnProperty('filterCanvas')){
        // regenerate canvas form new cropbox view, so canvas is null
        applyFilters(function(resp){
          let ops = Object.assign({}, UploadedImage.moasicOptions, {canvas: resp} );
          callConversion(ops);
          // for dev see what the non-tiled canvas image looks like with the filters
          SLIDER_CROPPED.innerHTML = '';
          SLIDER_CROPPED.appendChild(resp);
        });
        // applyFilters calls conversion
        return;
      }
      // called with a filter canvas object passed, so was called from the filter listener
      ops.canvas = ops.filterCanvas;
    }

    callConversion(ops);
  } // end preview canvas

  /**
   * [calls the method in convertPhoto, updates the dom, updates the current image tracking object]
   * @param  {[object]} ops [the options built in setConversionSettings]
   * @return {[type]}     [description]
   */
  function callConversion(ops){
    let method = 'createTiles';  // holdover from testing different tiling methods, might still use it so keep the format
    if( ops.hasOwnProperty('methodname') ){ method = ops.methodname; }

    // create new mosaic instance
    MOSAIC_INSTANCE = new ConvertPhoto(ops);
    // call for the tiler
    let mosaic = MOSAIC_INSTANCE[method]();

    // clear the copied filtered canvas from storage
    if(UploadedImage.moasicOptions && UploadedImage.moasicOptions.hasOwnProperty('filterCanvas')){
      delete UploadedImage.moasicOptions.filterCanvas;
    }
    // add to dom
    console.log(`updating container: ${ops.targetElement.id}`);
    ops.targetElement.innerHTML = '';
    ops.targetElement.appendChild(mosaic);

  }

  // setups the color palette buttons in the dom
  function displayPalette(){
    // get bg palette container
    let bgPalette = document.getElementById('bgPalette');
    let bgColors = [];
    // loop through every palette available
    for(let[key, palette] of Object.entries(Globals.colorData)){
      // the display container for each palette
      let parent = document.getElementById(key);
      parent.innerHTML = '';
      // put all colors in container
      let paletteContainer = document.createElement('div');
      paletteContainer.classList.add('row');
      paletteContainer.classList.add('palette-container');


      // get visuals of currently active palette set up
      if(Globals.color == key) {
        let pBtn = document.getElementById(key+'-tab');
        parent.classList.add('show');
        parent.classList.add('active');
        pBtn.classList.add('active');
      }

      // populate each dropdown with appropriate colors
      for(let i=0; i<palette.length; i++){
        let el = document.createElement('button');
        let rgb = Object.values(palette[i]).join(',');
        // store color on element
        el.setAttribute('data-rgb', rgb);
        el.setAttribute('data-main', 'palette');
        el.type = 'button';
        el.classList.add('m-2');
        el.classList.add('btn');
        el.classList.add('btn-palette-color');
        el.style.backgroundColor = 'rgba('+rgb+',1)';

        // bg buttons use every color available, don't make duplicates
        if(!bgColors.includes(rgb)) {
          let bgEL = el.cloneNode();
          bgEL.setAttribute('data-method', 'bgColors');
          if(rgb === '255,255,255'){
            bgEL.classList.add('active');
            // keep track of selected color order
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
  function appendCropperImageToDOM(typeSTR){
    console.log('appending to dom');
    const suffix = '_uploadedImageURL';   // the suffix for the key for the objecturl
    const urlkey = typeSTR + suffix;      // the full url key
    let src = UploadedImage[ urlkey ];    // the objecturl
    console.log('image source is');
    console.log(src);

    // set transformations of current cropper instance to apply to the impending image if swapping
    if(CROPPER && CROPPER.cropped){
      console.log('%c--------------------------','color:red;');
      console.log('switching image');

      // false becuase removebg returns a different sized image
      CROPPER.replace(src, false);

      // update the ready function to be different from a new upload
      CROPPER.options.ready = function(e) {
        console.log('%c'+e.type,'color:green;');
        console.log('ready has been reset after replace');

        // set values of transforms for this image session after ready

        // rotate
        UploadedImage.callOnCrop = false;
        CROPPER.rotateTo(UploadedImage.storedCropperData.naturalData.rotate);

        // zoom + move values
        UploadedImage.callOnCrop = false;
        CROPPER.setCanvasData({
          left: UploadedImage.storedCropperData.wrapperData.left,
          top: UploadedImage.storedCropperData.wrapperData.top,
          width: UploadedImage.storedCropperData.wrapperData.width,
          height: UploadedImage.storedCropperData.wrapperData.height,
        });

        // the cropbox position
        UploadedImage.callOnCrop = false;
        CROPPER.clear();
        UploadedImage.callOnCrop = false;
        CROPPER.crop();
        // will call display mosaics from the crop event this triggers
        CROPPER.setCropBoxData(UploadedImage.storedCropperData.boxData);
      };
    }

    // a new image upload, no need to copy over any transformations
    else if(typeSTR == 'original') {
      console.log('new upload');

      // new upload gets autoface
      CROPPER_OPTIONS.ready = function(e){
        console.log('%c'+e.type,'color:green;');
        console.log(this.cropper);
        console.log('upload ready');
        getImageForAutoFace();
      };

      // create new cropper instance for new upload
      CROPPER = new Cropper(IMG_EL, CROPPER_OPTIONS);
    }


    // for dev clear the untiled filtered image
    SLIDER_CROPPED.innerHTML = '';
    // for dev clear the full grab after transform to send to autoface
    document.getElementById('devImageResult').innerHTML = '';

  }

  // listener for user uploaded image
  if (URL) {
    IMAGE_INPUT.onchange = function () {
      let files = this.files;
      let file;

      // make sure a file was uploaded
      if (files && files.length) {
        file = files[0];

        // make sure it's an image file
        if (/^image\/\w+/.test(file.type)) {
          // save file to image object
          UploadedImage.file = file;

          // clear previous cropper instance if exists
          if( CROPPER && CROPPER.cropped ){ CROPPER.destroy(); }

          // revoke previous image and removebg image if exists on each new image upload
          if (UploadedImage.original_uploadedImageURL) {
            URL.revokeObjectURL(UploadedImage.original_uploadedImageURL);
            // revoke if exists the remove background image
            if (UploadedImage.removebg_uploadedImageURL) {
              URL.revokeObjectURL(UploadedImage.removebg_uploadedImageURL);
              UploadedImage.removebg_uploadedImageURL = null;
            }
          }

          // create new object url for this upload
          UploadedImage.original_uploadedImageURL = URL.createObjectURL(file);
          IMG_EL.src = UploadedImage.original_uploadedImageURL;

          // clear values pertaining to previous image upload
          UploadedImage.startFresh();

          // a new upload so type is original
          appendCropperImageToDOM('original');

          // reset remove background ui option
          resetRemoveBG( false );

          // clear file upload input for next upload
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
  function getdisplayCrop(){
    // wrapper - the transformed image container
    let wrapper = CROPPER.getCanvasData();
    // console.log('%c wrapper', 'color:orange;');
    // console.table(wrapper);

    // let imgData = CROPPER.getImageData();
    // console.log('%c img data', 'color:orange;');
    // console.table(imgData);

    // grab current data
    let stored = CROPPER.getData();
    // console.log('%c Data', 'color:orange;');
    // console.table(stored);

    // container - the div that the image is uploaded to, overflow is set to hidden
    let cd = CROPPER.getContainerData();
    // console.log('%c container data', 'color:orange;');
    // console.table(cd);

    // object to hold the visible bounds of the image
    let fullCrop = {};


    // get the full visible area of the image as a cropped region
    // find out if the right side of the image is out of bounds
    let wrapperWidth = wrapper.width + wrapper.left;
    if (wrapper.left < 0){

      // left side of image out of bounds, set to 0
      fullCrop.left = 0;

      // if the right side of the image is out of bounds, use the display end point : else img is within bounds keep same value
      fullCrop.width = ( wrapperWidth > cd.width ) ? cd.width : wrapperWidth;
    }
    else {
      // left side of image is within bounds keep the left value the same
      fullCrop.left = wrapper.left;

      // if the right side of the image is out of bounds, calculate the distance to the display end point : else img is within bounds keep same value
      fullCrop.width = ( wrapperWidth > cd.width ) ? (cd.width - fullCrop.left) : wrapper.width;
    }

    // find out if the bottom of the image is out of bounds using same logic as above
    let wrapperHeight = wrapper.height + wrapper.top;
    if ( wrapper.top < 0 ){
      fullCrop.top = 0;
      fullCrop.height = ( wrapperHeight > cd.height ) ? cd.height : wrapperHeight;
    }
    else {
      fullCrop.top = wrapper.top;
      fullCrop.height = ( wrapperHeight > cd.height ) ? (cd.height - wrapper.top) : wrapper.height;
    }


    // set triggers crop event which converts crop area to mosaic, which is unwanted right now
    UploadedImage.callOnCrop = false;
    // change the aspect ratio to get the full display image from cropper getcroppedcanvas
    CROPPER.setAspectRatio(fullCrop.width/fullCrop.height);

    UploadedImage.callOnCrop = false;
    // get the canvas of the entire displayed area
    let getFull = CROPPER.setCropBoxData(fullCrop);

    let defaults = {
      width: fullCrop.width,
      height: fullCrop.height,
      // maxWidth: fullCrop.width,
      // maxHeight: fullCrop.height,
      // minWidth: fullCrop.width,
      // minHeight: fullCrop.height,
    };


    // if the image is rotated the wrapper will not be fillcrop value, so if setting max dimensions this needs to be considered
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
    let ops = defaults;
    // console.log((stored.rotate != 0) + ' - ' + typeof stored.rotate);
    console.table(ops);

    // get the canvas
    let canvas = CROPPER.getCroppedCanvas(ops);

    // restore to user crop

    // restore aspect ratio
    UploadedImage.callOnCrop = false;
    CROPPER.setAspectRatio(Globals.aspectRatio);

    // restore data
    UploadedImage.callOnCrop = false;
    CROPPER.setData(stored);

    return {
      canvas: canvas,
      top: fullCrop.top,
      left: fullCrop.left,
    };
  }

  /**
   * for dev, displays the displayed image section grabbed to send to autoface to clarify wat got grabbed
   * @param  {[HTMLImageELement]} image [the image sent to autoface]
   * @param  {[string]} str   [for logging, description of what is calling this function]
   * @param  {[bool]} clear [whether or not to clear the dom container element for display]
   */
  function devDisplaySentToAutoFace(image, str, clear){
    console.log(str);
    let container = document.getElementById('devImageResult');
    if(clear){ container.innerHTML = ''; }
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

    if(CROPPER && !CROPPER.cropped){ CROPPER.crop(); }
      // get snap of entire visible image in the display
      let results = getdisplayCrop();
      let canvas = results.canvas;
      canvas.toBlob(function(blob) {
        let url = URL.createObjectURL(blob);
        let newImg = document.createElement('img');
        newImg.src = url;
        // for dev, display the image that was sent to confirm the section was grabbed correctly
        devDisplaySentToAutoFace(newImg, 'called from getImageForAutoFace', true);

        newImg.onload = function() {
          // send transformed display to autoface to find face
          useAutoFace({
            image: newImg,
            useOriginal:false,
            displaySize: {
              width: canvas.width,
              height: canvas.height,
              top: results.top,
              left: results.left,
            },
          });

          // no longer need to read the blob so it's revoked
          URL.revokeObjectURL(url);
        };
      });
  }

  /**
   * calls the autoface function
   * @param  {[object]} options [settings to pass / append to defaults for autoface]
   */
  function useAutoFace(options){
    console.log('calling autoface');
    // TODO: set up a loading overlay to give auto detect faces time to return

    // get the auto crop bound if there are faces
    let defaults = {
      image: UploadedImage.file,
      aspectRatio: Globals.aspectRatio,
      useOriginal: true,
    };
    let ops = defaults;
    if( options && typeof options == "object"){ ops = Object.assign({}, defaults, options); }

    console.log(ops.image);

    // for dev display image that was sent to autoface to confirm it is correct
    devDisplaySentToAutoFace(ops.image, 'called from AutoFace promise return', false);

    // get the bounds of the faceapi calculated to the passed aspect ratio
    new AutoFace(ops).results
      .then(resp => {
        console.log('-- autoface promise returned ---');
        if(resp) {

          if(ops.useOriginal){
            console.log('using set data');
            CROPPER.setData(resp); // triggers cropper options crop event
          }
          else{
            console.log('setting just the crop box in relation to display');
            CROPPER.setCropBoxData(resp); // triggers cropper options crop event
          }

          // if the crop event does not call display mosaics, call it here
          // let str = 'from autoface promise return';
          // DISPLAY_MOSAICS(str);
        }
        else {  // face api found no faces handle this
          console.warn('face api returned some falsey value');
        }

      })
      .catch(err=>{console.warn(err)});
  }

  /**
   * resets the ui display for remove bg button
   * @param {[bool]} checked [sets the ui to match bool]
   */
  function resetRemoveBG(checked) {
    let box = document.getElementById('useRemoveBG');
    if (box.checked != checked){box.checked = checked;}
    let btn = document.getElementById('removeBG');
    let btnSelector = btn.getAttribute('data-target');

    let classname = 'show';
    let btnTarget = document.querySelector(btnSelector);


    // have check enable / disable button
    btn.disabled = !checked;

    // close dropdown if open and use removed bg is no longer selected
    if(!checked && btnTarget.classList.contains(classname) ){ $(btnSelector).collapse('hide'); }
  }

  /**
   * listener for handling the remove bg call / switch if already called
   */
  document.getElementById('useRemoveBG').onchange = function(){
    // call for remove background / handle background tools display
    let typeSTR = this.checked ? 'removebg' : 'original';
    console.log('remove bg clicked, state is ' + typeSTR);

    let calledRemovebg = false;

    // indicate if pattern will be sent to convert photo
    Globals.useBG = this.checked;

    if(CROPPER && CROPPER.cropped){
      // store current data for restoring crop box to the same spot
      // has to keep all transforms from original background to remove background

      UploadedImage.storedCropperData = {
        naturalData: CROPPER.getData(),           // the cropbox position / other data in relation to original image size
        wrapperData: CROPPER.getCanvasData(),     // the image wrapper - holds all transform data in relation to the container / display image
        boxData: CROPPER.getCropBoxData(),       // the cropbox position in relation to the container parent display div
        // imgData: CROPPER.getImageData(),         // uploaded image data - still unsure of how to use
        // containerData: CROPPER.getContainerData(),   // the block element parent container to the image
      };
    }

    if(this.checked){
      // checked if called remove bg yet
      if( UploadedImage.removebgApiStatus === UploadedImage.statusList.ready ){
        // make request to removebg API
        UploadedImage.removebgApiStatus = UploadedImage.statusList.pending;
        uploadForRemoveBG()
        .catch(e=>{
          UploadedImage.removebgApiStatus = UploadedImage.statusList.error;
          console.warn(e);
        });
        calledRemovebg = true;
      }
    }

    resetRemoveBG(this.checked); // set visual based on check chagne

    // if a switch not a call remove bg, change dom
    if( !calledRemovebg ){ appendCropperImageToDOM(typeSTR); }
  }

  /**
   * the post request for calling removebg api
   */
  async function uploadForRemoveBG(){

    let url = 'removebg/';                      // the view to call
    const csrftoken = getCookie('csrftoken');   // get csrf toekent from cookies
    let headers = {                             // set the header of what to get from the server
      'X-CSRFToken': csrftoken,
      'Accept': '*/*',
    }

    // create th body of the request
    const imageField = UploadedImage.file;
    if(!imageField){  throw new Error('no uploaded image found'); }
    let formData = new FormData();
    formData.append("image_file", imageField);

    // make the call
    await fetch(url, {
        method: 'POST',
        body: formData,
        headers: headers,
    })
    // for now only handles streaming response body
    .then(resp => {
      // resp is a readable stream
      const reader = resp.body.getReader();
      return new ReadableStream({
        start(controller) {
          return pump();
          function pump() {
            return reader.read().then(({ done, value }) => {
              // When no more data needs to be consumed, close the stream
              if (done) {
                  controller.close();
                  return;
              }
              // Enqueue the next data chunk into our target stream
              controller.enqueue(value);
              return pump();
            });
          } // end pump
        } // end start
      });
    })
    // Create a new response out of the stream
    .then(rs => new Response(rs))
    // Create an object URL for the response
    .then(response => response.blob())
    // save the created url to be revoked upon new upload of image
    .then(blob => {
      UploadedImage.removebg_uploadedImageURL = URL.createObjectURL(blob);
      // call apply to dom
      appendCropperImageToDOM('removebg');
      // update api call status
      UploadedImage.removebgApiStatus = UploadedImage.statusList.success;
    });
    // .catch(console.error);
  }

  // container for the cropper tools
  document.getElementById('cropToolbar').onclick = handleClicks;
  // container for mosaic tool controls
  document.getElementById('toolsDropdown').onclick = handleClicks;
  function handleClicks(e){
    // add some checks here to make sure the event target is got on all browsers
    let target = e.target;
    let etype = e.type;
    console.log('the target is');
    console.log(target);
    // let updateCropper = this.id === 'cropToolbar';
    // console.log(`updating the cropping box? ${updateCropper}`);

    // some targets are the buttons children
    if (!target.getAttribute('data-method')) {
      console.log('target doesnt have a method!,using closest!');
      target = target.closest('[data-method]');

      console.log('target is now');
      console.log(target);
   }

    // if not a button click, or button is disabled, igore
    if ( !target || target.disabled ) { return; }


    let data = {
      main: target.getAttribute('data-main') || undefined,       // instance object that has the method
      method: target.getAttribute('data-method'),                // object method to call
      value: target.value,                                       // value of an input tag
      effects: target.getAttribute('data-effects') || undefined, // does this value act on another value,
      option: target.getAttribute('data-option') || undefined,   // value to pass to method
      secondOption: target.getAttribute('data-second-option') || undefined // second value to pass to method
    };
    let updateMosaic = false;

    // check which main category of command was called
    switch(data.main){
      // user changing a basic globals setting
      case 'globals':
        // plate count, color choice
        console.log(` - setting Globals.${data.method} = ${data.option}`);
        Globals[data.method] = data.option;
        updateMosaic = true;

        break;
      // user changing a custom palette / bg color
      case 'palette': {
        let type = data.method;
        let classname = 'active';
        let rgb = target.getAttribute('data-rgb') || undefined;
        if(rgb !== undefined){ target.classList.toggle(classname); }
        updateMosaic = true;

        // updates the custom palette, add removes colors
        if(type == 'palette'){
          let method = target.classList.contains(classname) ? 'addColor' : 'removeColor';
          Globals[method](rgb);
          updateMosaic = true;
          break;
        }

        // selected and deselecting the colors to use in the bg
        let max = data.option;
        if(type == 'bgColors'){
          // get colors allowed for bg pattern
          let selected = document.getElementById('bgContent').querySelector('input[type=radio]:checked');
          max = parseInt(selected.getAttribute('data-option'));
          // whether or not to select / dese;ect color for bg
          let add = target.classList.contains(classname);
          if(add){
            Globals.bgColors.push(rgb);
            if(Globals.bgColors.length > max) { Globals.bgColors.shift(); }
          }
          else{
            let temp = Globals.bgColors.filter(stored => stored !== rgb);
            Globals.bgColors = temp;
          }
        }

        // changing the pattern of the removed background
        // make sure the selected color deisplay, is not selected more than allowed
        if(type == 'bgPattern'){
          Globals.bgPattern = data.value;
          if(Globals.bgColors.length <= max) { break;}
          Globals.bgColors.splice(max);
        }


        // update the selected color visuals for the new stored value changes
        let list = document.getElementById('bgPalette').querySelectorAll('.'+classname);
        for(let i=0; i<list.length; i++){
          if( !Globals.bgColors.includes(list[i].getAttribute('data-rgb')) ){
            list[i].classList.remove(classname);
          }
        }

        break;
      }
      // user is changing the crop of the image!!!
      case 'cropper':
        if(!CROPPER || !CROPPER.cropped){ break; }

        // zoom, rotate
        let cropperResult = CROPPER[data.method](data.option, data.secondOption);
        // updateMosaic = true;

        break;
      case 'caman':
        // console.table(Object.keys(Caman.prototype));
        // if no image uplaoded yet, cancel slider move and reset values
        if(UploadedImage.file === null){
          UploadedImage.resetAllFilters();
          break;
        }
        // if reset, reset the slider
        if(data.option == 'reset'){
          document.getElementById(data.method+"Range").value = data.value;
        }

        // get preset bool
        let preset = target.getAttribute('data-preset');

        // if reset all
        if(data.method == 'reset'){
          UploadedImage.resetPresets();
          UploadedImage.resetAllFilters();
        }
        else if(preset){ // a preset button hit
          // reset all sliders
          UploadedImage.resetAllFilters();
          // apply selected preset
          UploadedImage.usePreset = true;
          UploadedImage.preset = data.method;
        }
        else { // a slider change
          // store slider value
          UploadedImage.setFilterList(data.method, data.value);
          console.log(`method: ${data.method}, value: ${data.value}`);
        }

        // apply filter to cropped canvas
        applyFilters();
        break;
    }; // end switch


    // this button affects another button!!!!!
    if(data.effects !== undefined){
      // all effects should be formatted 'ID-type,...'
      // let allEffects = data.effects.split(',')
      let [btn, category] = data.effects.split('-');
      console.log(`btn is ${btn}`);
      console.log(`category is ${category}`);

      switch(category) {
        case 'dropdown':
          document.getElementById(btn).textContent = data.option;
          let prev = target.parentNode.querySelector('.active');
          if(prev){prev.classList.remove('active');}
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
          if(!CROPPER || !CROPPER.cropped || UploadedImage.file === null){
            CROPPER_OPTIONS.aspectRatio = Globals.aspectRatio;
            CROPPER.setAspectRatio(Globals.aspectRatio);
            break;
          }
          let changingWidth = data.method.split('plate')[0].toLowerCase() == 'width';
          let currentCBD = CROPPER.getCropBoxData();
          CROPPER_OPTIONS.aspectRatio = Globals.aspectRatio;
          // set ratio triggers the crop event, don't call need to call display mosaics then
          UploadedImage.callOnCrop = false;
          CROPPER.setAspectRatio(Globals.aspectRatio);

          let newWidth = changingWidth ? currentCBD.height * Globals.aspectRatio : currentCBD.width;
          let newHeight = !changingWidth ? currentCBD.width / Globals.aspectRatio : currentCBD.height;
          let newCBDdata = {
            width: newWidth,
            height: newHeight,
            left: currentCBD.left,
            top: currentCBD.top,
          };

          UploadedImage.callOnCrop = false;
          CROPPER.setCropBoxData(newCBDdata);
          break;
      case 'autoface':
          updateMosaic = false;
          getImageForAutoFace();
          break;
    }

    if(updateMosaic){
      let str = 'from click listener updateMosaic bool';
      DISPLAY_MOSAICS(str); }
  }


  // return a copty of the canvas
  function getFilterPrep(done){
    let canvas = UploadedImage.moasicOptions.canvas;
    let imgData = canvas.getContext('2d').getImageData(0,0,canvas.width, canvas.height);
    let copyCanvas = canvas.cloneNode();
    copyCanvas.getContext('2d').putImageData(imgData, 0, 0);
    if(!done){
      console.log('no callback function passed! creating one!');
      done = function(resp){
          console.log(resp);
          // pass same options but use the copy canvas so the filters aren't layered on previous filters;
          let ops = Object.assign({}, UploadedImage.moasicOptions, {filterCanvas: resp} );
          setConversionSettings(ops);
          // for dev see what the non-tiled cropped section looks like
          SLIDER_CROPPED.innerHTML = '';
          SLIDER_CROPPED.appendChild(resp);
      };
    }
    return {
      canvas: copyCanvas,
      done: done,
    };
  }

  // apply filters to a copy of the canvas, these filters do stack, so a copy is necessary
  function applyFilters(done){
    let prep = getFilterPrep(done);
    let canvas = prep.canvas;
    done = prep.done;

    Caman(canvas, function() {
      // use caman preset if preset bool
      if(UploadedImage.usePreset){
        this[ UploadedImage.preset ]();
      }
      if(UploadedImage.applyFilters) {
        for ( let [key, value] of Object.entries( UploadedImage.filterList ) ){
          this[ key ]( value );
        }
      }
      this.render(function(){
        done(this.canvas);
      });
    });
  }

  const SAVE_MOSAIC = document.getElementById('save');
  SAVE_MOSAIC.onclick = function(){
    // call to get the data
    if(!MOSAIC_INSTANCE){ throw new Error('no mosaic data was saved'); }
    const {materials, rgbaSTR} = MOSAIC_INSTANCE.getStorableData();

    const csrftoken = getCookie('csrftoken');
    let headers = {
      'X-CSRFToken': csrftoken,
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }

    SAVE_MOSAIC.disabled = true;
    fetch("setColorData/", {
        method: 'POST',
        body: JSON.stringify({
          color: Globals.color,
          plates: Globals.plateCount,
          mosaic: rgbaSTR,
          'materials': materials,
        }),
        headers: headers,
        // credentials: 'same-origin',
    })
    .then(
      function(response) {
        if (response.status < 200 || response.status > 200) {
          console.log('save mosaic to server not ok. Status code: ' + response.status);
          SAVE_MOSAIC.disabled = false;
          return;
        }
        response.json().then(function(resp) {
          console.log('save mosaic came back ok: ' + resp);
          SAVE_MOSAIC.disabled = false;
        })
      }
    )
    .catch(function(err) {
      console.log('save mosaic data Error: ', err);
      SAVE_MOSAIC.disabled = false;
    });
  } // end click save

  // a js snippit to get the cookie from a browser
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
// setup use with dither js
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

})( window );

// imports
const Globals = require('./globals.js');
import ConvertPhoto from './ConvertPhoto.js';
import AutoFace from './AutoFace.js';
import RawImage from './RawImage.js';
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
      Globals.colorData = cd;
      Globals.color = 'CL';
      Globals.resetPalette();
      // for dev
      displayPalette();
    }
    catch(e) {console.warn(e)}
  })();

  // cropper variables
  var URL = window.URL || window.webkitURL,
      CONTAINER_UPLOADED = document.getElementById('containerUploaded'), //uploaded image container
      CONTAINER_RESULT = document.getElementById('containerResult'),      // parent of mosaic display
      PREVIEW_RESULT = document.getElementById('previewResult'),          // preview container
      SLIDER_CROPPED = document.getElementById('previewSliderResult'),    // preview the cropped non-tiled section w/ slider tweaks
      UPLOADED_IMAGE,
      ALL_UPLOADS = [],
      // options for the cropper object
      DISPLAY_MOSAICS = function (options) {
        console.log(options);
        // called when the crop box has moved to a new area
        console.log('*****************************');
        console.log('displaying mosaics');

        console.log('converting for sample default preview');
        // display raw preview
        // uses default cropper canvas options to optain a canvas
        canvasPreview({
          targetElement: PREVIEW_RESULT,
          tileSize: Math.max( 1, Math.floor(PREVIEW_RESULT.clientWidth/Globals.x) ),
          saveCanvas: false,
        });


        console.log('converting for main mosaic container');
        // display main alterable mosaic
        // CONTAINER_RESULT.innerHTML = '';
        let defaults = {
          // tileSize: Math.max( 1, Math.floor(CONTAINER_RESULT.clientWidth/Globals.x) ),
          tileSize: 8,
          saveCanvas: true,
        };

        canvasPreview(defaults);
        // getCropboxCenter();

        SAVE_MOSAIC.disabled = false;
      },
      DEFAULT_READY = function(e){
        console.log('%c'+e.type,'color:green;');
        let str = 'from default ready';
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
        cropstart: function (e) {
          console.log('%c'+e.type,'color:green;');
          // console.log(e.type, e.detail.action);
        },
        cropmove: function (e) {
          console.log('%c'+e.type,'color:orange;');

          // so display mosaic isn;t calle da million times, if a move cropend will catch it
          UPLOADED_IMAGE.callOnCrop = false;
          // console.log(e.type, e.detail.action);
          // let wrapper = CROPPER.getCanvasData();
          // UPLOADED_IMAGE.cropperData.wrapper = Object.assign({},wrapper);

          // console.log(' left '+wrapper.left);
          // console.log(' width '+wrapper.width);

        },
        cropend: function (e) {
          console.log('%c'+e.type,'color:red;');
          let str = 'from cropend';
          DISPLAY_MOSAICS(str);
        },
        crop: function (e) {
          console.log('%c'+e.type,'color:blue;');
          // console.log(e.type, e.detail);
          // only if autocrop is true, this will initialize cropper
          // if(!CROPPER.cropped){CROPPER.setData( {x:0,y:0,width:0, height:0} );}


          // when window is resized
          let {naturalWidth, width} = CROPPER.getImageData();
          UPLOADED_IMAGE.scaleFactor = naturalWidth / width;



          // don't call this when ready will fire directly after(when CROPPER.autocrop == true
          // && CROPPER.setData() is called sometimes? )
          if(UPLOADED_IMAGE.callOnCrop){
            let str = 'from crop';
            DISPLAY_MOSAICS(str); }
          UPLOADED_IMAGE.callOnCrop = true;

        },
        zoom: function (e) {
          console.log('%c'+e.type,'color:purple;');
          // console.log(e.type, e.detail.ratio);
          // DISPLAY_MOSAICS();

        }
      },
      // keep track of image upload object values
      CROPPER;
      // IMAGE_CROPPER_DATA = [CROPPER.getImageData()],
      // CANVAS_CROPPER_DATA = [CROPPER.getCanvasData()];

  function getCropboxCenter() {
    // get the center of the crop box to store as zoom to value
    if(!CROPPER.cropped || !UPLOADED_IMAGE){ return; }

    let cbd = CROPPER.getCropBoxData();
    let {left, top, width, height} = cbd;
    UPLOADED_IMAGE.cropboxCenter = {
      x: left + (width * .5),
      y: top + (height * .5),
    }

    console.log('-------------');
    console.log('cropbox center');
    console.table(UPLOADED_IMAGE.cropboxCenter);
    console.log('-------------');

    let wrapper = CROPPER.getCanvasData();
    let image = CROPPER.getImageData();
    let d = CROPPER.getData();
    let c = CROPPER.getContainerData();

    let table = [
        ['name', 'x or left', 'y or top', 'width', 'height'],
        ['data', d.x+'', d.y+'', d.width+'', d.height+''],
        ['container', '','', c.width+'', c.height+''],
    ];

    let prevZoom = d.y - cbd.top;

    console.log('data top '+d.y);
    console.log('crop top '+cbd.top);
    console.log('canv top '+wrapper.top);
    console.log('crop * factor '+cbd.top*UPLOADED_IMAGE.scaleFactor);
    console.log('d-c ', prevZoom);

    // let table = [
    //   ['name', 'x or left', 'y or top', 'width', 'height'],
    //   ['cropbox', left+'', top+'', width+'', height+''],
    //   ['wrapper', wrapper.left+'', wrapper.top+'', wrapper.width+'', wrapper.height+''],
    //   ['image', image.left+'', image.top+'', image.width+'', image.height+''],
    //   ['data', d.x+'', d.y+'', d.width+'', d.height+''],
    // ];

    // console.log('----    all together    ---');
    // console.table(table);
  }

  // get a canvas of the region outlined by the cropbox
  function getCropperCanvas(options){
    // set maxWidth to not exceed the naturalWidth
    let boxD = CROPPER.getCropBoxData();
    let maxWidth = boxD.width * UPLOADED_IMAGE.scaleFactor;
    let maxHeight = boxD.height * UPLOADED_IMAGE.scaleFactor;

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
      maxWidth: 4096,
      maxHeight: 4096,
      // fillColor: '#ccc', // set this value for default remove bg solid
      // fillColorList: [],
      // fillType: 'solid',
    };
    let ops = defaults;

    if(useOptions) { ops = Object.assign({}, defaults, options); }
    return CROPPER.getCroppedCanvas(ops);
  }


  // get options to sent to convert photo
  // kinda a options dictionary builder for the conversion to tiled mosaic
  function canvasPreview(options){
    console.log(' --- canvas preview --- ');
    // const previewWidth = Globals.x * Globals.tileSize;
    // const previewHeight = Globals.y * Globals.tileSize;
    let useOptions = (options && typeof options == 'object') ? true : false;
    console.log('use canvas preview passed options ? ' + useOptions);

    // set up the options to be passed to conversion
    let defaults = {
      // where the mosoic is loaded should stay constant
      targetElement: CONTAINER_RESULT,
      // the ontly readon this should change is on responsive window resize
      tileSize: Globals.tileSize,

    };
    let updateEveryCall = {
      colorChoice: Globals.color,
      palette: Globals.palette,
      tilesX: Globals.x, // number of tiles in the x axis
      tilesY: Globals.y, // number of tiles in the y axis
    };
    let ops;
    if(useOptions){ ops = Object.assign({}, defaults, options, updateEveryCall); }
    else { ops = Object.assign({}, defaults, updateEveryCall); }
    if(!ops.hasOwnProperty('canvas')){
      console.log('getting default canvas');
      ops.canvas = getCropperCanvas();
    }

    // store options for this image
    if(useOptions && options.saveCanvas){
      UPLOADED_IMAGE.moasicOptions = Object.assign({}, ops);
    }

    // if filters have tweaked been applied, gotta apply them for this canvas
    if(UPLOADED_IMAGE.applyFilters){
      // called from updating the cropper box and not from filter adjust
      // gotta apply existing stored filters
      if(!options.hasOwnProperty('filterCanvas')){
        // regenerate canvas form new cropbox view, so canvas is null
        applyFilters(null, function(resp){
          let ops = Object.assign({}, UPLOADED_IMAGE.moasicOptions, {canvas: resp} );
          callConversion(ops);
          // for dev see what the non-tiled canvas image looks like with the filters
          SLIDER_CROPPED.innerHTML = '';
          SLIDER_CROPPED.appendChild(resp);
        });
        return;
      }
      // called with a filter canvas object passed, so was called from the filter listener
      ops.canvas = ops.filterCanvas;
    }

    callConversion(ops);
  } // end preview canvas

  function callConversion(ops){
    // holdover from testing different tiling methods, might still use it so keep the format
    let method = 'createTiles';
    if( ops.hasOwnProperty('methodname') ){ method = ops.methodname; }

    // create the mosaic instance
    let convertPhoto = new ConvertPhoto(ops);
    // call for the tiler
    let mosaic = convertPhoto[method]();

    // clear the copied filtered canvas from storage
    if(UPLOADED_IMAGE.moasicOptions && UPLOADED_IMAGE.moasicOptions.hasOwnProperty('filterCanvas')){
      delete UPLOADED_IMAGE.moasicOptions.filterCanvas;
    }
    // add to dom
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

  // listener for user uploaded image
  const IMAGE_INPUT = document.getElementById('importImage');
  if (URL) {
    IMAGE_INPUT.onchange = function () {
      var files = this.files;
      var file;

      // make sure a file was uploaded
      if (files && files.length) {
        file = files[0];

        // make sure it's an image file
        if (/^image\/\w+/.test(file.type)) {
          console.log('file type');
          // keep track of uploaded images for remove bg
          let count = ALL_UPLOADS.length;
          if(UPLOADED_IMAGE){
            console.log(' user has previously uploaded an image ');
            UPLOADED_IMAGE.cleanUP();

          }
          UPLOADED_IMAGE = new RawImage();
          UPLOADED_IMAGE.handleImage({
            windowURL: URL,
            image: document.getElementById('imgUploaded'),
            file: file,
          });

          if(CROPPER) { CROPPER.destroy(); }

          // create new crop object tro load the image for detect face
          CROPPER_OPTIONS.ready = function(e){
            console.log('%c'+e.type,'color:green;');
            useAutoFace();
            UPLOADED_IMAGE.callOnCrop = true;

            // UPLOADED_IMAGE.cropperData = getStoreCropperData();
          }
          CROPPER = new Cropper(UPLOADED_IMAGE.image, CROPPER_OPTIONS);

          // clear file upload input for next upload
          IMAGE_INPUT.value = null;

          // clear local stored mosaic adjustment values
          // the sliders

        } else {
          window.alert('Please choose an image file.');
        }
      }
    };
  } else {
    IMAGE_INPUT.disabled = true;
    IMAGE_INPUT.parentNode.className += ' disabled';
  }

  // function getStoreCropperData(){
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

  function getdisplayCrop(){
    // wrapper -
    let wrapper = CROPPER.getCanvasData();
    // console.log('%c wrapper', 'color:orange;');
    // console.table(wrapper);
    // let imgData = CROPPER.getImageData();
    // console.log('%c img data', 'color:orange;');
    // console.table(imgData);
    // store current data
    let stored = CROPPER.getData();
    // console.log('%c Data', 'color:orange;');
    // console.table(stored);
    // container - the div that the image is uploaded to, overflow is set to hidden
    let cd = CROPPER.getContainerData();
    // console.log('%c container data', 'color:orange;');
    // console.table(cd);
    let fullCrop = {};


    // get the full visible area of the image as a cropped region
    let wrapperWidth = wrapper.width + wrapper.left;
    if (wrapper.left < 0){
      fullCrop.left = 0;
      fullCrop.width = ( wrapperWidth > cd.width ) ? cd.width : wrapperWidth;
    }
    else {
      fullCrop.left = wrapper.left;
      fullCrop.width = ( wrapperWidth > cd.width ) ? (cd.width - fullCrop.left) : wrapper.width;
    }

    let wrapperHeight = wrapper.height + wrapper.top;
    if ( wrapper.top < 0 ){
      fullCrop.top = 0;
      fullCrop.height = ( wrapperHeight > cd.height ) ? cd.height : wrapperHeight;
    }
    else {
      fullCrop.top = wrapper.top;
      fullCrop.height = ( wrapperHeight > cd.height ) ? (cd.height - wrapper.top) : wrapper.height;
    }



    // console.log(`width: ${width}, height: ${height}`);
    // set triggers crop event which converts crop area to mosaic, which is unwanted right now
    UPLOADED_IMAGE.callOnCrop = false;
    // change the aspect ratio to get the full display image
    CROPPER.setAspectRatio(fullCrop.width/fullCrop.height);

    // set triggers crop event which converts crop area to mosaic, which is unwanted right now
    UPLOADED_IMAGE.callOnCrop = false;
    // get the canvas of the entire displayed area
    let getFull = CROPPER.setCropBoxData(fullCrop);

    let defaults = {
      width: fullCrop.width,
      height: fullCrop.height,
      maxWidth: fullCrop.width,
      maxHeight: fullCrop.height,
      minWidth: fullCrop.width,
      minHeight: fullCrop.height,
      fillColor: '#fff',
    };


    // for some reason the above options clip the alpha space out of the returned canvas, seding over the incorrect image to autoface
    // use this if rotated, will have to manually adjust for zoom tho
    let ar = (fullCrop.width / fullCrop.height);
    let rotate = {
      width: fullCrop.width,
      height: fullCrop.height,
      maxWidth: 4096,
      maxHeight: 4096 / ar,
      minWidth: ar,
      minHeight: 1,
      fillColor: '#fff',
    };

    let ops = stored.rotate != 0 ? rotate : defaults;
    // let ops = defaults;
    // console.log((stored.rotate != 0) + ' - ' + typeof stored.rotate);
    // console.table(ops);

    // get the canvas
    let canvas = CROPPER.getCroppedCanvas(ops);


    // test if left top 0 aligns with the container or the wrapper
    // return canvas;

    // set triggers crop event which converts crop area to mosaic, which is unwanted right now
    UPLOADED_IMAGE.callOnCrop = false;
    // restore aspect ratio
    CROPPER.setAspectRatio(Globals.aspectRatio);

    // set triggers crop event which converts crop area to mosaic, which is unwanted right now
    UPLOADED_IMAGE.callOnCrop = false;
    // restore data
    CROPPER.setData(stored);

    return canvas;
  }

  function devDisplaySentToAutoFace(image, str, clear){
    console.log(str);
    let container = document.getElementById('devImageResult');
    if(clear){ container.innerHTML = ''; }
    container.appendChild(image);
  }


  // gets a snap of the whole display area in case of image transformations,
  // this sends the transformed image to autoface, instead of the default uploaded image
  function getImageForAutoFace(options) {

    if(!CROPPER.cropped){return;}
      // get snap of entire visible image in the display
      let canvas = getdisplayCrop();
      canvas.toBlob(function(blob) {
        let newImg = document.createElement('img');
        let url = URL.createObjectURL(blob);
        newImg.src = url;
        // for dev, display the image that was sent to confirm the section was grabbed correctly
        devDisplaySentToAutoFace(newImg, 'called from getImageForAutoFace', true);

        newImg.onload = function() {
          // return;
          // send transformed display to autoface to find face
          useAutoFace({
            image: newImg,
            useOriginal:false,
            displaySize: {
              width: canvas.width,
              height: canvas.height,
            }
          });

          // no longer need to read the blob so it's revoked
          URL.revokeObjectURL(url);
        };

      });

  }

  function useAutoFace(options){
    console.log('calling autoface');
    // TODO: set up a loading overlay to give auto detect faces time to return

    // get the auto crop bound if there are faces
    let defaults = {
      image: UPLOADED_IMAGE.image,
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


  // checkbox for remobe bg
  document.getElementById('useRemoveBG').onchange = function(){
    console.log('check changed');
    console.log('checked is ' + this.checked);
    let btn = document.getElementById('removeBG');
    let classname = 'show';
    let btnSelector = btn.getAttribute('data-target');
    let btnTarget = document.querySelector(btnSelector);

    // have check enable / disable button
    btn.disabled = !this.checked;

    if(this.checked){ // if checked
      // checked if called remove bg yet
      // call remove bg on original image
    }
    //  if dropdown is open, close it
    else if( btnTarget.classList.contains(classname) ){ $(btnSelector).collapse('hide'); }
  }
  // container for sliders input
  // document.getElementById('slidersContent').onchange = handleClicks;
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
      main: target.getAttribute('data-main') || undefined, // instance object that has the method
      method: target.getAttribute('data-method'), // object method to call
      value: target.value, // value of an input tag
      effects: target.getAttribute('data-effects') || undefined, // does this value act on another value,
      option: target.getAttribute('data-option') || undefined, // value to pass to method
      secondOption: target.getAttribute('data-second-option') || undefined // second value to pass to method
    };
    let updateMosaic = false;


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
          // update bg to use the new selected colors in the Globals.bgColors list
          updateMosaic = true;
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

        // needs some code for changing the bg and updating the mosaic display

        break;
      }
      // user is changing the crop of the image!!!
      case 'cropper':
        if(!CROPPER.cropped){ break; }

        // zoom, rotate
        let cropperResult = CROPPER[data.method](data.option, data.secondOption);
        // updateMosaic = true;

        break;
      case 'caman':
        // if reset, reset the slider
        if(!UPLOADED_IMAGE || data.option == 'reset'){ document.getElementById(data.method+"Range").value = data.value; }
        // if no image uplaoded yet, cancel slider move
        if(!UPLOADED_IMAGE){ break; }

        // store slider value
        UPLOADED_IMAGE.setFilterList(data.method, data.value);

        // apply filter to cropped canvas BUT apply it to a copy
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
          CROPPER_OPTIONS.aspectRatio = Globals.aspectRatio;

          // set ratio triggers the crop event, don't call need to call display mosaics then
          UPLOADED_IMAGE.callOnCrop = false;
          CROPPER.setAspectRatio(Globals.aspectRatio);
      case 'autoface':
          updateMosaic = false;
          getImageForAutoFace();
          break;
    }

    if(updateMosaic){
      let str = 'from click listener updateMosaic bool';
      DISPLAY_MOSAICS(str); }


    // remove bg checkmark
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

  }


  // return a copty of a canvas
  function filterCopyCanvas(canvas){
    if(!canvas){ canvas = UPLOADED_IMAGE.moasicOptions.canvas; }
    let imgData = canvas.getContext('2d').getImageData(0,0,canvas.width, canvas.height);
    let copyCanvas = canvas.cloneNode();
    copyCanvas.getContext('2d').putImageData(imgData, 0, 0);
    return copyCanvas;
  }

  // apply filters to a copy of the canvas, these filters do stack, so a copy is necessary
  function applyFilters(canvas, done){
    if(!canvas){canvas = filterCopyCanvas();}
    if(!done){
      console.log('no callback function passed! creating one!');
      done = function(resp){
          console.log(resp);
          // pass same options but use the copy canvas so the filters aren't layered on previous filters;
          let ops = Object.assign({}, UPLOADED_IMAGE.moasicOptions, {filterCanvas: resp} );
          canvasPreview(ops);
          // for dev see what the non-tiled cropped section looks like
          SLIDER_CROPPED.innerHTML = '';
          SLIDER_CROPPED.appendChild(resp);
      };
    }

    // get all the slider values and reapply them
    let sliderList = Object.keys(UPLOADED_IMAGE.filterList);
    Caman(canvas, function() {
      for (let i=0; i<sliderList.length; i++){
        this[ sliderList[i] ]( UPLOADED_IMAGE.filterList[ sliderList[i] ] );
      }
      this.render(function(){
        done(this.canvas);
      });
    });
  }

  const SAVE_MOSAIC = document.getElementById('save');
  SAVE_MOSAIC.onclick = function(){
    // needs a better check for accurate mosaic data
    if(!Globals.hasOwnProperty('mosaic') || !Globals.hasOwnProperty('materials')){
      throw new Error('no mosaic data was saved');
    }
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
          mosaic: Globals.mosaic,
          materials: Globals.materials,
          plates: Globals.plateCount,
        }),
        headers: headers,
        // credentials: 'same-origin',
    })
    .then(
      function(response) {
        if (response.status < 200 || response.status > 200) {
          console.log('save mosaic to server not ok. Status code: ' + response.status);
          SAVE_MOSAIC.disabled = false;
          return
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
function ditherResult(canvas, options){

  if(!options || !canvas){canvas = getCropperCanvas();}
  // CONTAINER_RESULT.appendChild(canvas);

  // options with defaults (not required)
  var opts = {
      // Transparent pixels will result in a sparse indexed array
      reIndex: false,                       // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
      palette: Globals.paletteAsArray,    // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
      colorDist: Globals.colorDist[0],      // one of ['euclidean', 'manhattan']
      dithKern: Globals.ditherKernals[0],   // dithering kernel name, see available kernels in docs below
      dithDelta: 0,            // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
      dithSerp: false,         // enable serpentine pattern dithering
      method: 2,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
      boxSize: [64,64],        // subregion dims (if method = 2)
      boxPxls: 2,              // min-population threshold (if method = 2)
      initColors: 4096,        // # of top-occurring colors  to start with (if method = 1)
      minHueCols: 0,           // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
      useCache: false,         // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
      cacheFreq: 10,           // min color occurance count needed to qualify for caching
      // colors: 256,          // desired palette size
  };

  let q = new RgbQuant(Object.assign({}, opts, options));

  // q.sample(canvas);
  // const palette = q.palette(true);
  let output = q.reduce(canvas);
  // console.log(output);
  let ctx = canvas.getContext('2d');
  ctx.putImageData(handleUnit8Array(canvas, output), 0, 0);

  return canvas;

}

function handleUnit8Array(canvas, arry) {
  let imageData = new ImageData(canvas.width, canvas.height);
  for (var i=0;i < arry.length; i+=4) {
      imageData.data[i]   = arry[i];
      imageData.data[i+1] = arry[i+1];
      imageData.data[i+2] = arry[i+2];
      imageData.data[i+3] = arry[i+3];
  }
  return imageData;
}

// clear sliders,
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

})( window );

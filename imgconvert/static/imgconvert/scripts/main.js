// imports
import Cropper from 'cropperjs';
import ConvertPhoto from './ConvertPhoto.js';
import AutoFace from './AutoFace.js';
// import Globals from './globals.js';
const Globals = require('./globals.js');
const RgbQuant = require('rgbquant');
// window.onload = function () {
(function( window, undefined ) {'use strict';
  // gets the color data passed to the template
  (()=>{
    console.log('getting color palette');
    // handle color choices from the template
    const jsonValueID = 'colordata';
    try {
      const cd = JSON.parse(document.getElementById(jsonValueID).textContent);
      Globals.color = 'CL';
      console.log(`using color choice ${Globals.color}`);
      Globals.colordata = cd;
      Globals.palette = Globals.colordata[Globals.color];
      // for dev
      displayPalette();
    }
    catch(e) {console.warn(e)}
  })();

  // cropper variables
  var URL = window.URL || window.webkitURL,
      COUNT_TESTS = 0,
      IMAGE = document.getElementById('imgUploaded'), // user uploaded image
      CONTAINER_RESULT = document.getElementById('containerResult'), // parent of mosaic display
      // options for the cropper object
      DEFAULT_READY = function (e) {
        console.log(e.type);
        CONTAINER_RESULT.innerHTML = '';
        let shrink = getCropperCanvas(Globals.x, Globals.y);
        canvasPreview({
          testname: 'shrunk w/ cropper',
          canvas: shrink,
          methodname: 'createTiles'
        });

        canvasPreview({
          testname: 'using canvas resize',
          methodname: 'createTiles'
        });
        //dither options
        // let dithOps = {
        //   minHueCols: 256,
        //   colorDist: Globals.colorDist[0],
        //   dithKern: Globals.ditherKernals[0], // 0-8
        //   dithDelta: 0, // 0 - 1
        //   dithSerp: true, // boolean
        //   reIndex: false, //boolean
        // };
        // // dither first
        // let dithered = ditherResult(0,dithOps);
        // CONTAINER_RESULT.appendChild(dithered);
        // // then use existing average color from dithered
        // canvasPreview({
        //   canvas: dithered,
        //   testname: 'dithered first with defaults'
        // });
        // // shrink area to 1 to 1 ratio
        // let shrink = getCropperCanvas(Globals.x, Globals.y);
        // let sd = ditherResult(shrink)
        // CONTAINER_RESULT.appendChild(sd);
        // canvasPreview({
        //   canvas: sd,
        //   testname: 'passed to tiler shrunk',
        // });
        // canvasPreview({
        //   testname: 'using dithered shrunk'
        // });
        SAVE_MOSAIC.disabled = false;
      },
      CROPPER_OPTIONS = {
        aspectRatio: Globals.aspectRatio,
        viewMode: 2,
        ready: DEFAULT_READY,
        cropstart: function (e) {
          console.log(e.type, e.detail.action);
        },
        cropmove: function (e) {
          console.log(e.type, e.detail.action);
        },
        cropend: function (e) {
          console.log(e.type, e.detail.action);
          DEFAULT_READY(e);
        },
        crop: function (e) {
          var data = e.detail;
          console.log(e.type);

        },
        zoom: function (e) {
          console.log(e.type, e.detail.ratio);
        }
      },
      // keep track of image upload object values
      CROPPER = new Cropper(IMAGE, CROPPER_OPTIONS),
      UPLOADED_IMAGE_TYPE,
      UPLOADED_IMAGE_NAME,
      UPLOADED_IMAGE_URL;


  // get the canvas of the cropped image
  function getCropperCanvas(w, h){
    // notes on sizes
    // get display size of the cropbox region
    // canvas.toblob will return the original image size
    // shrink it to the mosaic dimension where 1 px is 1 tile
    var {width, height} = CROPPER.getCropBoxData();

    let ops = {
      width: w || width,
      height: h || height,
      // suggestions from docs
      minWidth: Globals.x,
      minHeight: Globals.y,
      maxWidth: 4096,
      maxHeight: 4096,
      // fillColor: '#ccc',
      // imageSmoothingEnabled: false,
      // imageSmoothingQuality: 'high',
    };
    let canvas = CROPPER.getCroppedCanvas(ops);
    return canvas
  }

  // setup use with dither js
  function ditherResult(canvas, options){

    if(!options || !canvas){canvas = getCropperCanvas();}
    // CONTAINER_RESULT.appendChild(canvas);

    // options with defaults (not required)
    var opts = {
        // Transparent pixels will result in a sparse indexed array
        reIndex: false,                       // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
        palette: Globals.paletteAsArray(),    // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
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

    return canvas

  }

  function handleUnit8Array(canvas, arry) {
    let imageData = new ImageData(canvas.width, canvas.height);
    for (var i=0;i < arry.length; i+=4) {
        imageData.data[i]   = arry[i];
        imageData.data[i+1] = arry[i+1];
        imageData.data[i+2] = arry[i+2];
        imageData.data[i+3] = arry[i+3];
    }
    return imageData
  }

  /**
  *  get a canvas object from the cropper plugin and send it thru PhotoMosaic
  */
  function canvasPreview(options){
    console.log(' ---  getting options for convert photo --- ');
    // const previewWidth = Globals.x * Globals.tileSize;
    // const previewHeight = Globals.y * Globals.tileSize;
    var passed = options !== undefined && typeof options === 'object';

    var ops = {
      colorChoice: Globals.color,
      palette: Globals.palette,
      targetElement: CONTAINER_RESULT,
      canvas: getCropperCanvas(),
      tileSize: Globals.tileSize,
      tilesX: Globals.x, // number of tiles in the x axis
      tilesY: Globals.y, // number of tiles in the y axis
    };
    var method = 'tileCanvas';
    if(passed){
      method = options.methodname || method;
      ops = Object.assign({}, ops, options);
    }

    // tile the image
    let convertPhoto = new ConvertPhoto(ops);

    let div = document.createElement('p');
    div.textContent = ops.testname + ' ' + method;
    CONTAINER_RESULT.appendChild(div);
    CONTAINER_RESULT.appendChild(convertPhoto[method]());
    // Globals.materials = convertPhoto.getBillOfMaterials();
    // Globals.mosaic = convertPhoto.mosaicRGBAStrings;

  } // end preview canvas

  function displayPalette(){
    // easy visual for development
    // display colors for mosaic
    let cls = 'sample-colors';
    let spanContainer = document.getElementById('paletteContainer');
    Globals.palette.forEach((val) => {
      let span = document.createElement('span');
      span.classList.add(cls);
      span.style.backgroundColor = 'rgba('+ val.r +', '+ val.g +', '+val.b+')';
      spanContainer.appendChild(span);
    });
  }

  // listener for user uploaded image
  const IMPORT_IMAGE = document.getElementById('importImage');
  if (URL) {
    IMPORT_IMAGE.onchange = function () {
      var files = this.files;
      var file;

      // make sure a file was uploaded
      if (CROPPER && files && files.length) {
        file = files[0];

        // make sure it's an image file
        if (/^image\/\w+/.test(file.type)) {
          UPLOADED_IMAGE_TYPE = file.type;
          UPLOADED_IMAGE_NAME = file.name;

          // release previous upload url
          if (UPLOADED_IMAGE_URL) {
            URL.revokeObjectURL(UPLOADED_IMAGE_URL);
          }

          // create new cropping image
          IMAGE.src = UPLOADED_IMAGE_URL = URL.createObjectURL(file);
          // settting this for test
          // image.height = 400;
          CROPPER.destroy();

          // create new crop object tro load the image for detect face
          CROPPER_OPTIONS.ready = autoFaceOnReady;
          CROPPER = new Cropper(IMAGE, CROPPER_OPTIONS);
          // clear file upload input for next upload
          IMPORT_IMAGE.value = null;
        } else {
          window.alert('Please choose an image file.');
        }
      }
    };
  } else {
    IMPORT_IMAGE.disabled = true;
    IMPORT_IMAGE.parentNode.className += ' disabled';
  }

  /**
   * calls the get crop bounds to include detected faces in the upload
   * is meant to replace the default cropper ready listener function
   * @param  {[event]} e [the cropper listener event]
   */
  function autoFaceOnReady(e) {
    console.log('calling autoface');
    // TODO: set up a loading overlay to give auto detect faces time to return
    // get the auto crop bound if there are faces
    const autoFaceOptions = {
      image: IMAGE,
      aspectRatio: Globals.aspectRatio,
    };
    new AutoFace(autoFaceOptions).results
      .then(resp => {
        console.log('-- cropper ready for face bounds ---');
        if(resp) {
          console.table(resp);
          CROPPER.setCropBoxData(resp);
        }
        DEFAULT_READY(e);
      })
      .catch(e=>{console.warn(e)})

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

})( window );
// };

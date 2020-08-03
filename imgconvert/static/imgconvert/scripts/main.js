// imports
import Cropper from 'cropperjs';
import ConvertPhoto from './ConvertPhoto.js';
import AutoFace from './AutoFace.js';
// window.onload = function () {
(function() {'use strict';

  // MAIN GLOBALS
  var USERCHOICE = {
        color: 'CL', // one of ['CL', 'GR', 'BW']
        palette: [],
        basePlate: 32,
        x: 64,
        y: 64,
        tileWidth: 8,
        get tileHeight(){return this.tileWidth},
        get aspectRatio(){return this.x / this.y},
        // get isSquare(){return this.x == this.y},
      },
      // values are { userColor : [ {r,g,b}, ] }
      COLORDATA = null;

  //get json data passed to template
  getColorList();

  // cropper variables
  var URL = window.URL || window.webkitURL,
      // active crop container / image
      // CONTAINER_MAIN = document.getElementById('containerUploaded'),
      IMAGE = document.getElementById('imgUploaded'),
      // preview result container
      CONTAINER_RESULT = document.getElementById('containerResult'),
      // the cropper docs
      // https://github.com/fengyuanchen/cropperjs#options
      // options for the cropper object
      DEFAULT_READY = function (e) {
        console.log('calling default');
        console.log(e.type);
        canvasPreview();
        SAVE_MOSAIC.disabled = false;
      },
      CROPPER_OPTIONS = {
        aspectRatio: USERCHOICE.aspectRatio,
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
          canvasPreview();
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

  const SAVE_MOSAIC = document.getElementById('save');
  SAVE_MOSAIC.onclick = function(){
    if(!USERCHOICE.hasOwnProperty('mosaic') || !USERCHOICE.hasOwnProperty('materials')){
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
          color: USERCHOICE.color,
          mosaic: USERCHOICE.mosaic,
          materials: USERCHOICE.materials,
          plates: (USERCHOICE.x / USERCHOICE.basePlate) + (USERCHOICE.y / USERCHOICE.basePlate)
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
  }

  // gets the color data passed to the template
  function getColorList(){
    // handle color choices from the template
    const jsonValueID = 'colordata';
    try {
      const cd = JSON.parse(document.getElementById(jsonValueID).textContent);
      console.log(`using color choice ${USERCHOICE.color}`);
      COLORDATA = cd;
      USERCHOICE.palette = COLORDATA[USERCHOICE.color];
      // for dev
      displayPalette();
    }
    catch(e) {console.warn(e)}
  } // end get color list

  /**
  *  get a canvas object from the cropper plugin and send it thru PhotoMosaic
  */
  function canvasPreview(){
    console.log(' ---  canvas preview --- ');
    const previewWidth = USERCHOICE.x * USERCHOICE.tileWidth;
    const previewHeight = USERCHOICE.y * USERCHOICE.tileHeight;

    // first get Cropped canvas
    let ops = {
      width: previewWidth,
      height: previewHeight,
      // suggestions from docs
      minWidth: 256,
      minHeight: 256,
      maxWidth: 4096,
      maxHeight: 4096,
      // fillColor: '#fff',
      // imageSmoothingEnabled: false,
      // imageSmoothingQuality: 'high',
    };

    // call PhotoMosaic to tile the image
    let convertPhoto = new ConvertPhoto({
      colorChoice: USERCHOICE.color,
      palette: USERCHOICE.palette,
      // colorNames: COLORDATA.names,
      targetElement: CONTAINER_RESULT,
      canvas: CROPPER.getCroppedCanvas(ops),
      tileWidth: USERCHOICE.tileWidth,
      tileHeight: USERCHOICE.tileHeight,
      tilesX: USERCHOICE.x,
      tilesY: USERCHOICE.y,
    });

    convertPhoto.tileCanvas();
    USERCHOICE.materials = convertPhoto.getBillOfMaterials();
    USERCHOICE.mosaic = convertPhoto.mosaicRGBAStrings;

  } // end preview canvas

  function displayPalette(){
    // easy visual for development
    // display colors for mosaic
    let cls = 'sample-colors';
    let spanContainer = document.getElementById('paletteContainer');
    USERCHOICE.palette.forEach((val) => {
      let span = document.createElement('span');
      span.classList.add(cls);
      span.style.backgroundColor = 'rgba('+ val.r +', '+ val.g +', '+val.b+')';
      spanContainer.appendChild(span);
    });
  }

  // Import image
  const importImage = document.getElementById('importImage');

  if (URL) {
    importImage.onchange = function () {
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
          importImage.value = null;
        } else {
          window.alert('Please choose an image file.');
        }
      }
    };
  } else {
    importImage.disabled = true;
    importImage.parentNode.className += ' disabled';
  }

  // change the cropper default ready function
  function autoFaceOnReady(e) {
    console.log('calling autoface');
    // TODO: set up a loading overlay to give auto detect faces time to return
    console.log(e.type);
    // get the auto crop bound if there are faces
    const autoFaceOptions = {
      image: IMAGE,
      aspectRatio: USERCHOICE.aspectRatio,
    };
    new AutoFace(autoFaceOptions).results
      .then(resp => {
        console.log('-- cropper ready for face bounds ---');
        if(resp) {
          CROPPER.setCropBoxData(resp);
        }

        canvasPreview();
        SAVE_MOSAIC.disabled = false;
      })

  }

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

})();
// };

window.onload = function () {'use strict';

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


  // cropper variables
  var Cropper = window.Cropper,
      URL = window.URL || window.webkitURL,
      // active crop container / image
      containerMain = document.getElementById('containerUploaded'),
      image = document.getElementById('imgUploaded'),
      // preview result container
      containerResult = document.getElementById('containerResult'),
      // the cropper docs
      // https://github.com/fengyuanchen/cropperjs#options
      // options for the cropper object
      options = {
        aspectRatio: USERCHOICE.aspectRatio,
        ready: function (e) {
          console.log(e.type);
          // there should be a better way to do this, but for now
          if(COLORDATA === null){
            getColorList();
          }else{
            canvasPreview();
          }
          saveMosaic.disabled = false;
        },
        // preview: containerResult,
        viewMode: 2,
        cropstart: function (e) {
          console.log(e.type, e.detail.action);
        },
        cropmove: function (e) {
          // console.log(e.type, e.detail.action);
        },
        cropend: function (e) {
          console.log(e.type, e.detail.action);
          // there should be a better way to do this, but for now
          if(COLORDATA === null){
            getColorList();
          }else{
            canvasPreview();
          }
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
      cropper = new Cropper(image, options),
      uploadedImageType,
      uploadedImageName,
      uploadedImageURL,
      previewSize;

  var saveMosaic = document.getElementById('save');
  saveMosaic.onclick = function(){
    if(!USERCHOICE.hasOwnProperty('mosaic') || !USERCHOICE.hasOwnProperty('materials')){
      throw new Error('no mosaic data was saved');
    }
    const csrftoken = getCookie('csrftoken');

    let headers = {
      'X-CSRFToken': csrftoken,
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }

    saveMosaic.disabled = true;
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
          saveMosaic.disabled = false;
          return
        }
        response.json().then(function(resp) {
          console.log('save mosaic came back ok: ' + resp);
          saveMosaic.disabled = false;
        })
      }
    )
    .catch(function(err) {
      console.log('save mosaic data Error: ', err);
      saveMosaic.disabled = false;
    });
  }
  // makes a call to the server to get the allowed colors for conversion
  async function getColorList(){
    console.log(' --!! getting color list !!--');
    // get color choices from the server
    // should return { colorChoice : [ {rgb}, ] }, names : {name : {rgb}}  }
    fetch('getColorData/')
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('get color data response not 200. Status Code: ' + response.status);
          COLORDATA = null;
          return
        }
        // status OK
        response.json().then(function(data) {
          console.log(`using color choice ${USERCHOICE.color}`);
          COLORDATA = data;
          USERCHOICE.palette = COLORDATA[USERCHOICE.color];
          canvasPreview();
          // for dev
          displayPalette();
        });
      }
    )
    .catch(function(err) {
      console.log('get color data Error: ', err);
      COLORDATA = null;
    });
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
      targetElement: containerResult,
      canvas: cropper.getCroppedCanvas(ops),
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
  var importImage = document.getElementById('importImage');

  if (URL) {
    importImage.onchange = function () {
      var files = this.files;
      var file;

      // make sure a file was uploaded
      if (cropper && files && files.length) {
        file = files[0];

        // make sure it's an image file
        if (/^image\/\w+/.test(file.type)) {
          uploadedImageType = file.type;
          uploadedImageName = file.name;

          // release previous upload url
          if (uploadedImageURL) {
            URL.revokeObjectURL(uploadedImageURL);
          }

          // create new cropping image
          image.src = uploadedImageURL = URL.createObjectURL(file);
          // settting this for test
          image.height = 400;
          cropper.destroy();
          cropper = new Cropper(image, options);

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


};

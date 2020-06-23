window.onload = function () {
  console.log('main js loaded');
  'use strict';

  // MAIN GLOBALS
  var USERCHOICE = {
        color: 'CL', // one of ['CL', 'GR', 'BW']
        basePlate: 32,
        x: 64,
        y: 64,
        tileWidth: 8,
        get tileHeight(){return this.tileWidth},
        get aspectRatio(){return this.x / this.y},
        // get isSquare(){return this.x == this.y},
      },
      // values are { userColor : [ {r,g,b}, ] }
      PALETTE = null;


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
          if(PALETTE === null){
            getColorList();
          }else{
            canvasPreview(PALETTE[USERCHOICE.color]);
          }
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
          if(PALETTE === null){
            getColorList();
          }else{
            canvasPreview(PALETTE[USERCHOICE.color]);
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

  // makes a call to the server to get the allowed colors for conversion
  async function getColorList(){
    console.log(' --!! getting color list !!--');
    // get color choices from the server
    // should return { userChoice : [ {rgb}, ]  }
    fetch('getColorList/')
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('response not OK. Status Code: ' + response.status);
          PALETTE = null;
          return;
        }
        // status OK
        response.json().then(function(data) {
          console.log(`using color choice ${USERCHOICE.color}`);
          canvasPreview(data[USERCHOICE.color]);
          PALETTE = data;
          // for dev
          displayPalette(data[USERCHOICE.color]);
        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error: ', err);
      PALETTE = null;
    });
  } // end get color list

  /**
  *  get a canvas object from the cropper plugin and send it thru PhotoMosaic
  * @param {Object} palette contains the colors allowed
  */
  function canvasPreview(palette){
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
    let photomosaic = new PhotoMosaic({
      // imageData: imageData,
      targetElement: containerResult,
      palette: palette,
      canvas: cropper.getCroppedCanvas(ops),
      width: previewWidth,
      height: previewHeight,
      tileWidth: USERCHOICE.tileWidth,
      tileHeight: USERCHOICE.tileHeight,
      divX: previewWidth / USERCHOICE.tileWidth,
      divY: previewHeight / USERCHOICE.tileHeight,
      tileShape: 'rectangle',
      // opacity: 1,
    });
    photomosaic.tileCanvas();

  } // end preview canvas

  function displayPalette(palette){
    // palette - the array of rgb dict vals
    // easy visual for development
    // display colors for mosaic
    let cls = 'sample-colors';
    let spanContainer = document.getElementById('paletteContainer');
    palette.forEach((val) => {
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
};

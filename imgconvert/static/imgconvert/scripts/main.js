window.onload = function () {
  console.log('main js loaded');
  'use strict';

  // MAIN GLOBALS
  // values are { userColor : [ {r,g,b}, ] }
  var USERCHOICE = {
        color: 'CL', // one of ['CL', 'GR', 'BW']
        basePlate: 32,
        x: 64,
        y: 64,
        tileWidth: 8,
        get tileHeight(){return this.tileWidth},
        get aspectRatio(){return this.x / this.y},
        get isSquare(){return this.x == this.y},
      },
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

  // format color corrected image to baseplate dimensions
  function boooMathboooooo(width, height){
    console.log(' --- calculating something probably --- ');

    // get how moany plates are in the image
    let divosorX = USERCHOICE.x / USERCHOICE.basePlate;
    let divisrY = USERCHOICE.y / USERCHOICE.basePlate;

    // get the pixel value of what should become one plate
    let oneWidth = width / divisorX;
    let oneHeight = height / divisorY;

    // get the pixel values of what is a one x one unit
    let oneUnitWidth = oneWidth / USERCHOICE.basePlate;
    let oneUnitHeight = oneHeight / USERCHOICE.basePlate;



  }
  /**
  *  get a canvas object from the cropper plugin and send it thru PhotoMosaic
  * @param {Object} palette contains the colors allowed
  */
  function canvasPreview(palette){
      console.log(' ---  canvas preview --- ');
      const previewWidth = USERCHOICE.x * USERCHOICE.tileWidth;
      const previewHeight = USERCHOICE.y * USERCHOICE.tileHeight;



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
      let canvas = cropper.getCroppedCanvas(ops);
      let ctx = canvas.getContext('2d');

      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var data = imageData.data;

      var mappedColor;
      for (var i = 0; i < data.length; i += 4) {
          mappedColor = mapColorToPalette(data[i], data[i + 1], data[i + 2], palette);
          if (data[i + 3] > 10) {
              data[i] = mappedColor.r;
              data[i + 1] = mappedColor.g;
              data[i + 2] = mappedColor.b;
          }
      }

      console.log('------ finished color conversion -----');
      console.log(`canvas width: ${canvas.width} matches preview Width ${previewWidth}?`);
      console.log(canvas.width == previewWidth);
      console.log(`canvas height: ${canvas.height} matches preview Height ${previewHeight}?`);
      console.log(canvas.height == previewHeight);

      // call PhotoMosaic
      let photomosaic = new PhotoMosaic({
        targetElement: containerResult,
        imageData: imageData,
        width: previewWidth,
        height: previewHeight,
        tileWidth: USERCHOICE.tileWidth,
        tileHeight: USERCHOICE.tileHeight,
        divX: previewWidth / USERCHOICE.tileWidth,
        divY: previewHeight / USERCHOICE.tileHeight,
        tileShape: 'rectangle',
        // opacity: 1,
      })

    photomosaic.tileCanvas();
  } // end preview canvas

  /**
  * use Euclidian distance to find closest color
  * @param {integer} red the numerical value of the red data in the pixel
  * @param {integer} green the numerical value of the green data in the pixel
  * @param {integer} blue the numerical value of the blue data in the pixel
  * @param {object} palette the colors to be mapped to
  * @returns {object} a dictionary of keys r,g,b values are integers
  */
  function mapColorToPalette(red, green, blue, palette) {
      var diffR, diffG, diffB, diffDistance, mappedColor;
      var distance = 25000;
      palette.forEach((rgb) => {
        diffR = (rgb.r - red);
        diffG = (rgb.g - green);
        diffB = (rgb.b - blue);
        diffDistance = diffR * diffR + diffG * diffG + diffB * diffB;
        if (diffDistance < distance) {
            distance = diffDistance;
            mappedColor = rgb;
        };
      });
      return (mappedColor);
  } // end map color

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

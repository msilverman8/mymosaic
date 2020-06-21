window.onload = function () {
  console.log('main js loaded');
  'use strict';

  //keys = CL, GR, BW
  //values are array of rgb [0,0,0]
  var colors;
  getColorList();

  // order kit requirements
  const basePlate = 32; // might be good to have this here
  const dimensionsChoices = [
    [2, 2],
    [2, 3],
    [3, 2]
  ];
  // the aspect ratio to be multiplied by 32
  var dimensions = dimensionsChoices[0]; // default is a 64 x 64 square


  // cropper variables
  var Cropper = window.Cropper,
      URL = window.URL || window.webkitURL,
      // active crop container / image
      containerMain = document.getElementById('containerUploaded'),
      image = document.getElementById('imgUploaded'),
      // preview result container
      containerResult = document.getElementById('containerResult');

  // the cropper docs
  // https://github.com/fengyuanchen/cropperjs#options
  // options for the cropper object
  var options = {
    aspectRatio: dimensions[0] / dimensions[1],
    ready: function (e) {
      console.log(e.type);
      canvasPreview();
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
      canvasPreview();
    },
    crop: function (e) {
      var data = e.detail;
      console.log(e.type);

    },
    zoom: function (e) {
      console.log(e.type, e.detail.ratio);
    }
  };

  // keep track of image upload object values
  var cropper = new Cropper(image, options),
      originalImageURL,
      uploadedImageType,
      uploadedImageName,
      uploadedImageURL,
      previewSize;

  // get a canvas object from the cropper plugin and mosaic-ify it
  function canvasPreview(){
      if (!colors) {
        console.log('colors never loaded!');
        return
      }
      const sqCanvas = 384;
      // var cbd = cropper.getCropBoxData();
      // var cbdData = {
      //   h: Math.round(cbd.height),
      //   w: Math.round(cbd.width),
      // };
      var ops = {
        height: sqCanvas,
        width: sqCanvas,
        // suggestions from docs
        minWidth: 256,
        minHeight: 256,
        maxWidth: 4096,
        maxHeight: 4096,
        // fillColor: '#fff',
        // imageSmoothingEnabled: false,
        // imageSmoothingQuality: 'high',
      };
      var canvas = cropper.getCroppedCanvas(ops);
      var ctx = canvas.getContext('2d');

      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var data = imageData.data;

      var mappedColor;
      for (var i = 0; i < data.length; i += 4) {
          mappedColor = mapColorToPalette(data[i], data[i + 1], data[i + 2]);
          if (data[i + 3] > 10) {
              data[i] = mappedColor[0];
              data[i + 1] = mappedColor[1];
              data[i + 2] = mappedColor[2];
          }
      }
      ctx.putImageData(imageData, 0, 0);


      // var grayscale = function() {
      //   for (var i = 0; i < data.length; i += 4) {
      //     var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      //     data[i]     = avg; // red
      //     data[i + 1] = avg; // green
      //     data[i + 2] = avg; // blue
      //   }
      //   ctx.putImageData(imageData, 0, 0);
      // };



      // add canvas to DOM
      containerResult.innerHTML = '';
      containerResult.appendChild(canvas);

  }

  // use Euclidian distance to find closest color
  function mapColorToPalette(red, green, blue) {
      var color, diffR, diffG, diffB, diffDistance, mappedColor;
      var distance = 25000;
      var palette = colors['CL'];
      for (var i = 0; i < palette.length; i++) {
          color = palette[i];
          diffR = (color[0] - red);
          diffG = (color[1] - green);
          diffB = (color[2] - blue);
          diffDistance = diffR * diffR + diffG * diffG + diffB * diffB;
          if (diffDistance < distance) {
              distance = diffDistance;
              mappedColor = palette[i];
          };
      }
      return (mappedColor);
  }


  function getColorList(){
    let colorChoices = {};
    // make a call to the server to get the colors
    fetch('getColorList/')
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        var key = 'CL'
        colorChoices[key] = [];
        data[key].forEach((val) => {
          // val looks like '(0, 0, 0)'
          let str = val.substring(1, val.length-1);
          str = str.replace(/\s/g, '');
          colorChoices[key].push(str.split(','));
        });
        console.log(colorChoices[key]);
        colors = colorChoices;

        let cls = 'sample-colors';
        let spanContainer = document.getElementById('paletteContainer');
        colorChoices[key].forEach((val) => {
          let span = document.createElement('span');
          span.classList.add(cls);
          span.style.backgroundColor = 'rgba('+ val[0] +', '+ val[1] +', '+val[2]+')';
          spanContainer.appendChild(span);
        });

    }).catch(function(error){
      console.log('error!!!!');
      console.log(error);
      colorChoices = null;
      colors = colorChoices;
    })

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

window.onload = function () {
  console.log('main js loaded');
  'use strict';

  var Cropper = window.Cropper;
  var URL = window.URL || window.webkitURL;
  // user uploaded image, active crop screen
  var containerMain = document.getElementById('containerUploaded');
  // preview result container
  var containerResult = document.getElementById('containerResult');
  // user uploaded image
  var image = document.getElementById('imgUploaded');
  // preview result canvas
  // var imgResult = document.getElementById('imgResult');
  // the docs
  // https://github.com/fengyuanchen/cropperjs#options
  var options = {
    aspectRatio: 1 / 1, // let this be user defined in the future
    ready: function (e) {
      console.log(e.type);

      //canvasPreview();
    },
    preview: containerResult,
    viewMode: 2,
    cropstart: function (e) {
      console.log(e.type, e.detail.action);
    },
    cropmove: function (e) {
      console.log(e.type, e.detail.action);
    },
    cropend: function (e) {
      console.log(e.type, e.detail.action);
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

  function canvasPreview(){
      let canvas = cropper.getCroppedCanvas();
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

          // create new url from this file upload and set it to img
          image.src = uploadedImageURL = URL.createObjectURL(file);
          cropper.destroy();
          cropper = new Cropper(image, options);

          // clear file upload input
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

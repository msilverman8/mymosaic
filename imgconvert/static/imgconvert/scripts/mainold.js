console.log('main js loaded');
window.addEventListener('DOMContentLoaded', e => {
  console.log('main dom loaded');

  // marvin objects
  var canvasRaw = document.getElementById('canvasRaw'),
      canvasModified = document.getElementById('canvasModified'),
      image = new MarvinImage();

  image.load("https://i.imgur.com/ZcCe0eC.jpg", function(){
		image.draw(canvasRaw);
		Marvin.colorChannel(image, image, 14, 0, -8);
		image.draw(canvasModified);
	});


  // on user file upload get image object
  imageUpload.onchange = handleFileSelect;


});

	//cropper.start(document.getElementById("testCanvas"), 1); // initialize cropper by providing it with a target canvas and a XY ratio (height = width * ratio)

  function handleFileSelect() {
    // this function will be called when the file input below is changed
    var imageUpload = document.getElementById("imageUpload").files[0];  // get a reference to the selected file

    var reader = new FileReader(); // create a file reader
    // set an onload function to show the image in cropper once it has been loaded
    reader.onload = function(event) {
    	var data = event.target.result; // the "data url" of the image
    	cropper.showImage(data); // hand this to cropper, it will be displayed
    };

    reader.readAsDataURL(imageUpload); // this loads the file as a data url calling the function above once done
  }



$('#fileUpload').change(function (event) {
	name = event.target.files[0].name;
	reader = new FileReader();
	reader.readAsDataURL(event.target.files[0]);

	reader.onload = function(){
		imageOriginal.load(reader.result, imageLoaded);
	};

});

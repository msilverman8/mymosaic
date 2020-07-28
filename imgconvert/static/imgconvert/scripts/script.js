'use strict';
var DitherJS = require('ditherjs');

var dOptions = {
    "step": 1, // The step for the pixel quantization n = 1,2,3...
    "palette": defaultPalette, // an array of colors as rgb arrays
    "algorithm": "ordered" // one of ["ordered", "diffusion", "atkinson"]
};
var ditherjs = new DitherJS([,dOptions]);
dither.js.dither(document.querySelector('img'),[dOptions]);

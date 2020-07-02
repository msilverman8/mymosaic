window.onload = function(){'use strict';
  const jsonValues = ['rgbaStringList', 'plates'];
  const thisMosaic = {};
  jsonValues.forEach(val => {
    thisMosaic[val] = JSON.parse(document.getElementById(val).textContent);
  });

  let options = {
    targetCanvas: document.getElementById('mosaicCanvas'),
    overlayCanvas: document.getElementById('overlayCanvas'),
    countContainer: document.getElementById('tilesListContainer'),
    plates: thisMosaic.plates,
    rgbaStringList: thisMosaic.rgbaStringList
  };


  let makeMosaic = new MakeMosaic(options);
  makeMosaic.displayMosaic();

  document.getElementById('instructionControls').onclick = function(event) {
    // this works for now but design may change how this works keep this in mind
    const target = event.target;
    if(!target.matches('button')){return}
    const dir = target.getAttribute('data-direction');
    console.log(`selected ~  ${dir}  ~`);
    makeMosaic.moveHighlight(dir);
  };


  document.getElementById("inputControls").onclick = function(event){
    const target = event.target;

    if(!target.matches('button')){return}
    const method = target.getAttribute('data-method');
    console.log(`selected --- ${method} ---`);
    const invalidClass = 'is-invalid';
    var isInvalid = false;

    var newValue = {};
    const inputs = target.parentElement.querySelectorAll('input');
    inputs.forEach((input) => {
      let val = input.value.trim();
      console.log(`val is ${val}`);
      console.log(typeof val);
      if(!val || isNaN(val)){
        input.classList.add(invalidClass);
        isInvalid = true;
      }
      else {
        input.classList.remove(invalidClass);
        newValue[input.dataset.key] = parseInt(Number(val));
      }
    });
    if(isInvalid){return}

    if(method == 'updateHighlight'){
      makeMosaic.updateHighlight(newValue.width, newValue.height);
    }


  }



}

var obj_modal_open = false;
var spr_modal_open = false;

var opened_obj;
var opened_spr;

//
// OBJECT MODAL
//
function showObjectModal(name){
  if(!obj_modal_open){
    obj_modal_open = true;
    // get the object from library
    opened_obj = getLobjByName(name);

    // load in obj properties

    // load in sprites

    // show modal
    $("#modal_object").toggleClass("active");
  }
}

function closeObjectModal(){
  if(obj_modal_open){
    obj_modal_open = false;
    $("#modal_object").toggleClass("active");
  }
}

//
// SPRITE MODAL
//
function showSpriteModal(obj,spr_name){
  if(!spr_modal_open){
    spr_modal_open = true;
    $("#modal_sprite").toggleClass("active");

    // is the picture saved in project path?
    var spr_path = obj.sprites[spr_name].path;
    //if(not in the project){
    // move to project path
    //}

    // update form values
    $("#in_spr_name").val(spr_name);
    $("#in_spr_path").val(spr_path);
    $("#in_spr_width").val(obj.sprites[spr_name].width);
    $("#in_spr_height").val(obj.sprites[spr_name].height);
  }
}

function closeSpriteModal(){
  if(spr_modal_open){
    spr_modal_open = false;
    $("#modal_sprite").toggleClass("active");
  }
}

function saveSpriteModal(){
  // get the path based on project path
  var new_path = $("#in_spr_name").val(); // (wrong)

  // get name of sprite
  var name = $("#in_spr_name").val();

  // get modal values
  var info = {
    path: new_path,
    width: $("#in_spr_width").val(),
    height: $("#in_spr_height").val(),
    frames: 3
  }

  // assign to lobject
  opened_obj.sprites[$("#in_spr_name").val()] = info;

  // add to modal_object
  addSpriteDiv(info)

  // close the modal_sprite (yes, this is a save&close button)
  closeSpriteModal();
}

// show file dialog for choosing a image file
function chooseSprite(){
  chooseFile('#spriteFileDialog',function(file){
    var name = addSprite(file,opened_obj);

    // show modal_sprite
    showSpriteModal(opened_obj,name);
  });
}

// add sprite to object's sprite array
function addSprite(file,obj){
  var img = new Image();
  var spr_width,spr_height;
  img.onload = function(){
      spr_width = this.width;
      spr_height = this.height;
  };
  img.src = file;

  // add sprite to the object's array
  var name = file.split(/(\\|\/)/g).pop();
  var info = {
    path: file,
    width: spr_width,
    height: spr_height,
    frames: 1
  }
  obj.sprites[name] = info;

  return name;
}

function addSpriteDiv(info){

  $('#btn_add_sprite').before('\
    <div class="sprite">\
      <button id="btn_close"><i class="fa fa-times"></i></button>\
      <a href="#">\
        <img id="preview"/>\
      </a>\
      <div id="values">\
        '+info.path+'<br>\
        '+info.width+' x '+info.height+'<br>\
        '+info.frames+' frames\
      </div>\
    </div>\
  ');
}

function editCode(){
}

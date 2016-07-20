var obj_modal_open = false;
var spr_modal_open = false;

var opened_obj;
var opened_spr;

//
// OBJECT MODAL
//
$(function(){
  $("#in_obj_name").blur(objectModalValueChange);
  $("#in_obj_depth").blur(objectModalValueChange);
})

function objectModalValueChange(e){
  var key = e.currentTarget.id.substring(7)
  var value = e.currentTarget.value;

  // get old values
  var oldname = getLobjNameByID('objects', opened_obj['id']);
  var oldvals = $.extend(true,{},opened_obj);

  // if the key is name, then change key
  if(key == "name"){
    opened_obj = changeLobjName('objects', opened_obj, value)
  }

  // set values to object
  if(key != "name"){
    opened_obj[key] = value;
  }


}

function showObjectModal(name){
  if(!obj_modal_open){
        closeAllModals()
        obj_modal_open = true;
        // get the object from library
        opened_obj = getLobjByName('objects',name);

        // load in obj properties
        $("#in_obj_name").val(name);
        $("#in_obj_depth").val(opened_obj['depth']);
        $("#in_obj_id").val(opened_obj['id']);

        // clear sprites box
        updateSpriteDivs(opened_obj);

        // update delete button event
        $("#modal_object > #buttons > #btn_delete").unbind('click');
        $("#modal_object > #buttons > #btn_delete").click(function(){
            deleteLobj('objects',name);
        });

        // show modal
        $("#modal_object").toggleClass("active");
    } else if(!spr_modal_open) {
        // another obj was clicked while the modal was still open. show the new obj.
        obj_modal_open = false;
        $("#modal_object").toggleClass("active");
        showObjectModal(name);
    }
}

function closeObjectModal(){
  if(obj_modal_open){
      if(spr_modal_open){
          closeSpriteModal();
      }
      obj_modal_open = false;
      $("#modal_object").toggleClass("active");

      Placer.reset();
      tree.tree('getSelectedNodes').forEach(function(obj){
          tree.tree('removeFromSelection', obj);
      })

      autosaveProject();
  }
}

function updateSpriteDivs(obj){
  var btn_add = $("#btn_add_sprite").clone();
  var file_dialog = $("#spriteFileDialog").clone();
  $("#sprites").empty();
  $("#sprites").append(btn_add);
  $("#sprites").append(file_dialog);

  // load in sprites
  for(spr in obj.sprites){
    addSpriteDiv(spr);
  }
}


//
// SPRITE MODAL
//

var spr_modal_oldname;
// obj[dectionary]
// spr_name[string]
function showSpriteModal(obj,spr_name){
  if(!spr_modal_open){
    spr_modal_open = true;

    // save sprites name. when changes are saved, the old values are still there and must be deleted.
    spr_modal_oldname = spr_name;

    var spr_path = nwPATH.resolve(decodeURI(obj.sprites[spr_name].path));

    // update form values
    $("#in_spr_name").val(spr_name);

    // first time seeing this sprite. get its dimensions
    if (obj.sprites[spr_name].width == 0 || obj.sprites[spr_name].height == 0) {
      nwIMG(spr_path, function (err, dimensions) {
          // set object's image properties
          obj.sprites[spr_name].width = dimensions.width;
          obj.sprites[spr_name].height = dimensions.height;
          $("#in_spr_width").val(obj.sprites[spr_name].width);
          $("#in_spr_height").val(obj.sprites[spr_name].height);

          // set new path
          obj.sprites[spr_name].path = nwPATH.resolve(getProjectPath(),'images',spr_name);

          // show the modal
          $("#modal_sprite").toggleClass("active");
      });

    }else{
        $("#in_spr_width").val(obj.sprites[spr_name].width);
        $("#in_spr_height").val(obj.sprites[spr_name].height);

        // show the modal
        $("#modal_sprite").toggleClass("active");
    }

    // set the sprite form values
    var values = ['width','height','rows','columns','frames','speed'];
    for(val in values){
      val = values[val];
      $("#in_spr_"+val).val(obj.sprites[spr_name][val]);
    }

    // add sprite preview stuff
    $("#modal_sprite .preview").css({
      "background":"url('"+encodeURI(spr_path)+"')"
    });
  }
}

function closeSpriteModal(){
  if(spr_modal_open){
    spr_modal_open = false;
    updateSpriteDivs(opened_obj);
    $("#modal_sprite").toggleClass("active");
  }
}

function saveSpriteModal(){
  // get the path based on project path
  var new_path = $("#in_spr_name").val(); // (wrong) --> pj_path+$().val()

  // get name of saved sprite
  var name = $("#in_spr_name").val();

  // get modal values
  var info = opened_obj.sprites[spr_modal_oldname];
  // get the values for the sprite
  var values = ['width','height','rows','columns','frames','speed'];
  for(val in values){
    val = values[val];
    info[val] = $("#in_spr_"+val).val();
  }

  // assign to lobject
  opened_obj.sprites[name] = info;

  // remove old values
  //var old_name_index = opened_obj.sprites.indexOf(spr_modal_oldname);
  if((spr_modal_oldname in opened_obj.sprites) && spr_modal_oldname != name){
    delete opened_obj.sprites[spr_modal_oldname]
  }

  // update sprite div
  updateSpriteDivs(opened_obj);

  // close the modal_sprite (yes, this is a save&close button)
  closeSpriteModal();
  autosaveProject();
}

// show file dialog for choosing a image file
function chooseSprite(){
  chooseFile('#spriteFileDialog',function(file){

    // add sprite to project folder
    importResource('images',file,function(new_path){
        var name = addSprite(new_path,opened_obj);

        // show modal_sprite
        showSpriteModal(opened_obj,name);
    });

  });
}

// add sprite to object's sprite array
function addSprite(file,obj){
  // add sprite to the object's array
  var name = file.split(/(\\|\/)/g).pop();

  // default values
  var info = {
    path: file,
    width: 0,
    height: 0,
    rows: 1,
    columns: 1,
    frames: 1,
    speed: 1
  }
  obj.sprites[name] = info;
  opened_obj = obj;

  //canv_addSprite(name,file);

  return name;
}

function addSpriteDiv(spr_name){
  var info = opened_obj.sprites[spr_name]
  var name_noperiod = spr_name.replace('.','_');

  // add the div
  $('#btn_add_sprite').before('\
    <div class="sprite">\
      <button id="btn_close"><i class="fa fa-times"></i></button>\
      <a onclick="editSprite(\''+getLobjNameByID('objects', opened_obj.id)+'\',\''+spr_name+'\')">\
        <div class="'+name_noperiod+' preview"\
          style="background-image:url(\''+encodeURI(info.path)+'\')"\
        ></div>\
      </a>\
      <div id="values">\
        '+spr_name+'<br>\
        '+info.width+' x '+info.height+'<br>\
        '+info.frames+' frames\ (r:'+info.rows+' c:'+info.columns+')\
      </div>\
    </div>\
  ');


}

function editSprite(obj_name,spr_name){
    showSpriteModal(lobjects.objects[obj_name],spr_name)
}

function editCode(){
}

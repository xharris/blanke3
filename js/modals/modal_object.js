var obj_modal_open = false;

function showObjectModal(name){
  if(!obj_modal_open){
    obj_modal_open = true;
    // new object
    if(name == ""){
      console.log(Math.random());
    }
    $("#modal_object").toggleClass("active");
  }
}

function closeObjectModal(){
  if(obj_modal_open){
    obj_modal_open = false;
    $("#modal_object").toggleClass("active");
  }
}

function addSprite(){
  chooseFile('#fileDialog');
}

function editCode(){

}

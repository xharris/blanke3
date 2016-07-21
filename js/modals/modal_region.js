var region_modal_open = false;

var opened_region;

//
// REGION MODAL
//
$(function(){
    $("#in_region_name").change(regionModalValueChange);
    $("#in_region_color").change(regionModalValueChange);
})

function regionModalValueChange(e){
    var key = e.currentTarget.id.replace('in_region_', '');
    var value = e.currentTarget.value;

    // get old values
    var oldname = getLobjNameByID('regions', opened_region['id']);
    var oldcolor = opened_region['color'];

    // set values to object
    if(key == "name"){
        opened_region = changeLobjName('regions', opened_region, value);
    }

    // if the key is name, then change key
    if(key == "color"){
        opened_region[key] = value.toString();
    }
}

function showRegionModal(name){
    if(!region_modal_open){
        closeAllModals();
        region_modal_open = true;
        // get the object from library
        opened_region = getLobjByName('regions',name);

        // load in obj properties
        $("#in_region_name").val(name);
        $("#in_region_color").val(opened_region['color']);

        // show modal
        $("#modal_region").toggleClass("active");

    } else {
        // another obj was clicked while the modal was still open. show the new obj.
        region_modal_open = false;
        $("#modal_region").toggleClass("active");
        showRegionModal(name);
    }
}

function closeRegionModal(){
    if(region_modal_open){
        region_modal_open = false;
        $("#modal_region").toggleClass("active");
    }
}

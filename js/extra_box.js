function ebox_setCoords (x, y) {
    $("#extra_box > .m_coordinates").html("("+parseInt(x)+","+parseInt(y)+")")
}

function ebox_setZoom (value) {
    $("#extra_box > .m_zoom").val(parseInt(value))
}

function ebox_setState (state_name) {
    $("#extra_box > .m_state").html(state_name);
}

$(function(){
    $("#extra_box > .m_zoom").change(function(){
        setZoom( $(this).val()/100 );
    });

})

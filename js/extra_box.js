function ebox_setCoords (x, y) {
    $("#extra_box > .m_coordinates").html("("+parseInt(x)+","+parseInt(y)+")")
}

function ebox_setZoom (value) {
    $("#extra_box > .m_zoom").val(parseInt(value))
}

$(function(){
    $("#extra_box > .m_zoom").change(function(){
        setZoom( $(this).val()/100 );
    });

})

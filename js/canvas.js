// where the room square is drawn (helps determine how much margin there is at top and left)
var g_origin = {
  x:185,
  y:40
}

var GAME_MARGIN = 150;
var GRID_WIDTH = 32;
var GRID_HEIGHT = 32;

var canvas, canvas_size, bounds_rect;
var grid_lines = [];

var game_width = 800;
var game_height = 600;

var grid_width = GRID_WIDTH;
var grid_height = GRID_HEIGHT;

var game_margin_tb = GAME_MARGIN;
var game_margin_lr = GAME_MARGIN;

var game_border_weight = 1;

var zoomFactor = 1;

var mouse = {
    x : 0,
    y : 0,
    isDown : false
}

function initializeCanvas(screen_size) {
    canvas_size = screen_size;

    $("#canvas")[0].width = screen_size.width;
    $("#canvas")[0].height = screen_size.height;

    canvas = oCanvas.create({
        canvas: "#canvas",
        background: "#EEEDED",
        fps: 60
    });
}

function initGrid() {
    for (var x = 0; x < game_width / grid_width; x++) {
        for (var y = 0; y < game_height / grid_height; y++) {
            var gx = x * grid_width;
            var gy = y * grid_height;

            // horizontal line
            var new_lineh = canvas.display.line({
                start: {
                    x: 0,
                    y: gy
                },
                end: {
                    x: screen_size.width,
                    y: gy
                }
            })

            // vertical line
            var new_linev = canvas.display.line({
                start: {
                    x: gx,
                    y: 0
                },
                end: {
                    x: gx,
                    y: screen_size.height
                }
            })

            var new_lines = [new_lineh, new_linev];

            for (var l = 0; l < new_lines.length; l++) {
                var line_clone = new_lines[l].clone();
                grid_lines.push(line_clone);
                canvas.addChild(line_clone);
            }
        }
    }
}

function canv_newState() {
    $("#canvas").removeClass("hidden");

    bounds_rect = canvas.display.rectangle({
       x: 200,
       y: 20,
       origin: { x: "left", y: "top" },
       width: game_width,
       height: game_height,
       stroke: "1px #00e676",
    });

    canvas.addChild(bounds_rect);

    initGrid();
}

function canv_loadState(state_name) {

}


$(document).keydown( function(e){
    if (e.keyCode == 8 || e.keyCode == 46){
        if(canvas.getActiveGroup()){
            canvas.getActiveGroup().forEachObject(function(o){ canvas.remove(o) });
            canvas.discardActiveGroup().renderAll();
        } else {
            canvas.remove(canvas.getActiveObject());
        }
        canv_saveState();
    }
})


var Placer = {
    obj_name: '',
    obj_category: '',
    img_path: '',

    can_place: true,

    init: function () {

    },

    isObjSelected: function () {
        return (this.obj_name != '');
    },

    getObjCategory: function () {
        return this.obj_category;
    },

    getObjName: function () {
        return this.obj_name;
    },

    // set placer to nothing
    reset: function () {
        this.obj_name = '';
        this.obj_category = '';
    },

    setObj: function (category,name) {
        this.obj_name = name;
        this.obj_category = category.toLowerCase();
    },

    mouseUp: function (event) {
        if(this.isObjSelected() && this.can_place && curr_state){
            var x = (Math.round((mouse.x) / grid_width) * grid_width) + ((GAME_MARGIN % grid_width)) - grid_width;
            var y = (Math.round((mouse.y) / grid_height) * grid_height) + ((GAME_MARGIN % grid_width)) - grid_height;

            // OBJECT SELECTED
            if (this.getObjCategory() == 'objects') {
                var img_path = nwPATH.resolve(nwPROC.cwd(),'includes','images','NA.png');
                // does image have sprites
                var obj = lobjects[this.obj_category][this.obj_name];
                if (Object.keys(obj.sprites).length > 0) {
                    // get first image
                    img_path = getResourcePath('images',obj.sprites[Object.keys(obj.sprites)[0]].path);
                }

                Placer.placeObj(oImg, x, y);
            }

            // REGION SELECTED
            else if (this.getObjCategory() == 'regions') {

                var color = hexToRgb(lobjects[this.obj_category][this.obj_name].color);

                var region = new fabric.Rect({
                    width: grid_width,
                    height: grid_height,
                    stroke: 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')',
                    strokeWidth: 3,
                    fill: 'rgba(' + color.r + ',' + color.g + ',' + color.b + ', 0.5)',
                    hasRotatingPoint: false
                });

                Placer.placeObj(region, x, y)

            }
        }
    },

    placeObj: function(obj, x, y) {

    }
}

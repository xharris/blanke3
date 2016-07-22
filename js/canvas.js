// where the room square is drawn (helps determine how much margin there is at top and left)
var g_origin = {
  x:185,
  y:40
}

var GAME_MARGIN = 150;
var GRID_WIDTH = 32;
var GRID_HEIGHT = 32;

// zIndexes
var z_grid = -20;
var z_origin = -10;
var z_bounds = 0;

var canvas, canvas_size, bounds_rect;
var origin_lines = {};
var grid_lines = [];
var camera = {
    x: 0,
    y: 0
}
var camera_start = camera;

var game_width = 800;
var game_height = 600;

var grid_width = GRID_WIDTH;
var grid_height = GRID_HEIGHT;
var grid_opacity = 0.2;

var game_margin_tb = GAME_MARGIN;
var game_margin_lr = GAME_MARGIN;

var c_settings;

var game_border_weight = 1;

var zoomFactor = 1;

var mouse = {
    x: 0,
    y: 0,
}
var mouse_down_start = mouse;
var mouse_button = -1;

function snapToGrid(x,y) {
    var new_pos = {x:0,y:0};
    new_pos.x = Math.floor(x / grid_width) * grid_width;
    new_pos.y = Math.floor(y / grid_height) * grid_height;
    return new_pos;
}

function initializeCanvas(screen_size) {
    canvas_size = screen_size;
    c_settings = lobjects['settings']['ide']['color'];

    $("#canvas")[0].width = screen_size.width;
    $("#canvas")[0].height = screen_size.height;

    canvas = oCanvas.create({
        canvas: "#canvas",
        background: c_settings.background,
        fps: 60
    });

    document.onmousedown = function(ev) {
        mouse_button = ev.which;
        mouse_down_start = {
            x: mouse.x,
            y: mouse.y
        }
        camera_start = camera;
    }
    document.onmouseup = function(ev) {
        mouse_button = -1;
    }
    $("#canvas").mousemove(function(evt){
        mouse = {
            x: evt.pageX,
            y: evt.pageY
        }
    })
    canvas.setLoop(function () {
        console.log(mouse.x + " " + mouse.y);
        // MIDDLE mouse button
        if (mouse_button == 2) {
            camera = {
                x: camera_start.x - (mouse.x - mouse_down_start.x),
                y: camera_start.y - (mouse.y - mouse_down_start.y)
            }
            canv_cameraMove();
        }
    }).start();
}

function canv_initGrid() {
    var line_clone;
    // origin lines
    origin_lines["h"] =
        canvas.display.line({
            stroke: "1px " + c_settings.grid,
            start: {
                x: 0,
                y: 0,
            },
            end: {
                x: screen_size.width,
                y: 0
            },
            zIndex: z_origin
        });

    origin_lines["v"] =
        canvas.display.line({
            stroke: "1px " + c_settings.grid,
            start: {
                x: 0,
                y: 0,
            },
            end: {
                x: 0,
                y: screen_size.height,
            },
            zIndex: z_origin
        });

    origin_lines["h"].start_y = origin_lines["h"].y;
    origin_lines["v"].start_x = origin_lines["v"].x;

    canvas.addChild(origin_lines["h"]);
    canvas.addChild(origin_lines["v"]);

    origin_lines["h"].zIndex = z_origin;
    origin_lines["v"].zIndex = z_origin;

    // horizontal lines
    for (var x = 1; x < screen_size.width / grid_width; x++) {
        var gx = Math.floor(x * grid_width);

        var new_linev = canvas.display.line({
            stroke: "1px " + c_settings.grid,
            start: {
                x: gx,
                y: 0
            },
            end: {
                x: gx,
                y: screen_size.height
            },
            opacity: grid_opacity,
            zIndex: z_grid
        });

        line_clone = new_linev.clone();
        line_clone.orientation = "v";
        line_clone.start_x = line_clone.x;
        line_clone.start_y = line_clone.y;
        grid_lines.push(line_clone);
        canvas.addChild(line_clone);

        line_clone.zIndex = z_grid;
    }

    // vertical lines
    for (var y = 1; y < screen_size.height / grid_height; y++) {
        var gy = Math.floor(y * grid_height);

        var new_lineh = canvas.display.line({
            stroke: "1px " + c_settings.grid,
            start: {
                x: 0,
                y: gy
            },
            end: {
                x: screen_size.width,
                y: gy
            },
            opacity: grid_opacity,
            zIndex: z_grid
        })

        line_clone = new_lineh.clone();
        line_clone.orientation = "h";
        line_clone.start_x = line_clone.x;
        line_clone.start_y = line_clone.y;
        grid_lines.push(line_clone);
        canvas.addChild(line_clone);

        line_clone.zIndex = z_grid;
    }
}

function canv_initBoundsRect() {
    bounds_rect = canvas.display.rectangle({
       x: 200,
       y: 20,
       origin: { x: "left", y: "top" },
       width: game_width,
       height: game_height,
       stroke: "1px " + c_settings.bounds,
       zIndex: z_bounds
    });

    canvas.addChild(bounds_rect);
    bounds_rect.zIndex = z_bounds;
}

function canv_cameraMove() {
    // move origin lines
    origin_lines["h"].y = origin_lines["h"].start_y - camera.y;
    origin_lines["v"].x = origin_lines["v"].start_x - camera.x;

    // move grid lines
    for (var g = 0; g < grid_lines.length; g++) {
        var g_line = grid_lines[g];

        if (g_line.orientation == "v") {
            g_line.x = g_line.start_x - camera.x;

            // out of bounds (wrapping)
            if (g_line.x < 0) {

                g_line.start_x = screen_size.width + camera.x;
            }
            else if (g_line.x > screen_size.width - camera.x) {
                g_line.start_x = 0 + camera.x;
            }
        }
        else if (g_line.orientation == "h") {
            g_line.y = g_line.start_y - camera.y;

            // out of bounds (wrapping)
            if (g_line.y < 0) {
                g_line.start_y = screen_size.height + camera.y;
            }
            else if (g_line.y > screen_size.height - camera.y) {
                g_line.start_y = 0 + camera.y;
            }
        }

    }
}

function canv_newState() {
    $("#canvas").removeClass("hidden");

    canv_initBoundsRect();
    canv_initGrid();
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

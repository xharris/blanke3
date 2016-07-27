// where the room square is drawn (helps determine how much margin there is at top and left)
var g_origin = {
  x:185,
  y:40
}

var GAME_MARGIN = 150;
var GRID_WIDTH = 32;
var GRID_HEIGHT = 32;
var FPS = 120;

// zIndexes
var z_grid = -20;
var z_origin = -10;
var z_bounds = 0;

var canvas, canvas_size, container, bounds_rect;
var is_canvas_ready = false;
var origin_lines = {};
var grid_lines = [];
var state_objects = [];
var camera = {
    x: 0,
    y: 0
}
var camera_start = camera;
var grid_offset = camera;

// when dragging an object, at what point will the camera move
var drag_obj_margin = 100;
var drag_obj_cam_fric = 0.5;
var drag_obj_cam_limit = 2;
var dragging_obj = false;

// outline when hovering over an object
var obj_outline;

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
    new_pos.x = snapToGridX(x);
    new_pos.y = snapToGridY(y);
    return new_pos;
}

function snapToGridX(x) {
    return Math.floor(x / grid_width) * grid_width;
}

function snapToGridY(y) {
    return Math.floor(y / grid_height) * grid_height;
}

function initializeCanvas(screen_size) {
    canvas_size = screen_size;
    c_settings = lobjects['settings']['ide']['color'];

    $("#canvas")[0].width = screen_size.width;
    $("#canvas")[0].height = screen_size.height;

    canvas = oCanvas.create({
        canvas: "#canvas",
        background: c_settings.background,
        fps: FPS
    });

    document.onmousedown = function(ev) {
        mouse_button = ev.which;
        mouse_down_start = {
            x: mouse.x,
            y: mouse.y
        }
        camera_start = camera;

        Placer.mouseDown(ev);
    }
    document.onmouseup = function(ev) {
        mouse_button = -1;

        Placer.mouseUp(ev);
    }
    $("#canvas").mousemove(function(evt){
        if (is_canvas_ready) {
            mouse = {
                x: evt.pageX,
                y: evt.pageY
            }
            ebox_setCoords (mouse.x + camera.x, mouse.y + camera.y);
        }

    })

    $("#canvas").mouseenter(function(evt){
        Placer.enable();
    })

    $("#canvas").mouseleave(function(evt){
        Placer.disable();
    })

    canvas.setLoop(function () {
        if (is_canvas_ready) {
            // MIDDLE mouse button
            if (mouse_button == 2) {
                canv_handlingCamera();
                canv_cameraMove();
            }
        }
    }).start();

    container = canvas.display.rectangle({
        x: 0,
        y: 0,
        origin: {x: "left", y: "top"},
        width: 1,
        height: 1,
        stroke: "transparent",
    });

    canvas.addChild(container);
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

    container.addChild(origin_lines["h"]);
    container.addChild(origin_lines["v"]);

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
        container.addChild(line_clone);

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
        container.addChild(line_clone);

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
       opacity: 0.75,
       zIndex: z_bounds
    });

    container.addChild(bounds_rect);
    bounds_rect.zIndex = z_bounds;
}

// called when mouse is pressed or spacebar
// camera will follow the mouse until function is stopped being called
function canv_handlingCamera() {
    camera = {
        x: camera_start.x - (mouse.x - mouse_down_start.x),
        y: camera_start.y - (mouse.y - mouse_down_start.y)
    }
}

function canv_pushCamera(x=0, y=0) {
    camera.x += x;
    camera.y += y;
}

// moves and redraws all objects that are affected by the camera
function canv_cameraMove() {
    var cam_snap = snapToGrid(camera.x, camera.y);
    grid_offset = {
        x: camera.x - cam_snap.x,
        y: camera.y - cam_snap.y
    }

    // move origin lines
    origin_lines["h"].y = origin_lines["h"].start_y - camera.y;
    origin_lines["v"].x = origin_lines["v"].start_x - camera.x;

    // move grid lines
    for (var g = 0; g < grid_lines.length; g++) {
        var g_line = grid_lines[g];

        if (g_line.orientation == "v") {
            g_line.x = g_line.start_x - grid_offset.x;
        }

        else if (g_line.orientation == "h") {
            g_line.y = g_line.start_y - grid_offset.y;
        }

    }

    // move state objects
    // TODO - should not worry about objects that are not in view
    for (var o = 0; o < state_objects.length; o++) {
        var s_obj = state_objects[o];

        s_obj.x = s_obj.start_x - camera.x;
        s_obj.y = s_obj.start_y - camera.y;

        s_obj.obj_outline.x = s_obj.x;
        s_obj.obj_outline.y = s_obj.y;
    }
}

function canv_reset() {
    if (is_canvas_ready) {
        canvas.reset();
        state_objects = [];
        origin_lines = {};
        grid_lines = [];
        camera = {
            x: 0,
            y: 0
        }
        is_canvas_ready = false;
    }
}

function canv_clear() {
    // remove grid lines
    for (var g = 0; g < grid_lines.length; g++) {
        grid_lines[g].remove(false);
    }
    grid_lines = [];

    // remove origin lines
    console.log(origin_lines.length)
    if (origin_lines != null && Object.keys(origin_lines).length > 0) {
        origin_lines["h"].remove(false);
        origin_lines["v"].remove(false);
    }

    // remove bounds rect
    if (bounds_rect != null) {
        bounds_rect.remove(false);
    }

    canv_initBoundsRect();
    canv_initGrid();

    canvas.redraw();
}

function canv_newState() {
    $("#canvas").removeClass("hidden");

    canv_clear();

    is_canvas_ready = true;
}

function canv_loadState(state_name) {
    canv_clear();
    canv_newState();
    // TODO add option for resetting the camera on state load
    canv_cameraMove();
}

function canv_saveState() {
    var save_json = {};
    for (var o = 0; o < state_objects.length; o++) {
        var obj = state_objects[o];

        if (save_json[obj.obj_type] === "undefined") {
            save_json[obj.obj_type] = [];
        }
        console.log(save_json);

        save_json[obj.obj_type].push({
            x: obj.x,
            y: obj.y,
            obj_id: obj.obj_id
        });
    }

    console.log(save_json);
    return save_json;
}

$(document).keydown( function(e){
    // backspace and delete
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
        this.can_place = false;
    },

    enable: function() {
        this.can_place = true;
    },

    disable: function() {
        this.can_place = false;
    },

    setObj: function (category,name) {
        this.obj_name = name;
        this.obj_category = category.toLowerCase();
    },

    mouseDown: function (ev) {

    },

    mouseUp: function (ev) {
        if(this.isObjSelected() && this.can_place && curr_state && ev.which === 1 && !dragging_obj){
            var place_x = snapToGrid(mouse.x + camera.x, mouse.y + camera.y).x;
            var place_y = snapToGrid(mouse.x + camera.x, mouse.y + camera.y).y;

            // OBJECT SELECTED
            if (this.getObjCategory() === 'objects') {
                var img_path = nwPATH.resolve(nwPROC.cwd(),'includes','images','NA.png');
                // does image have sprites
                var obj = lobjects[this.obj_category][this.obj_name];
                if (Object.keys(obj.sprites).length > 0) {
                    // get first image
                    img_path = getResourcePath('images',obj.sprites[Object.keys(obj.sprites)[0]].path);
                }

                var object = canv_Object(place_x - camera.x, place_y - camera.y, img_path);
                object.start_x = place_x;
                object.start_y = place_y;

                Placer.placeObj(object);
            }

            // REGION SELECTED
            else if (this.getObjCategory() === 'regions') {

                var color = hexToRgb(lobjects[this.obj_category][this.obj_name].color);

                var region = new fabric.Rect({
                    width: grid_width,
                    height: grid_height,
                    stroke: 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')',
                    strokeWidth: 3,
                    fill: 'rgba(' + color.r + ',' + color.g + ',' + color.b + ', 0.5)',
                    hasRotatingPoint: false
                });

                Placer.placeObj(region)

            }
        }
    },

    placeObj: function(obj) {
        obj.obj_type = this.getObjCategory();
        obj.obj_id = getLobjByName(this.getObjCategory(), this.getObjName()).id;

        state_objects.push(obj);
        container.addChild(obj);
    }
}

function canv_Object(x, y, image_path) {
    var obj = canvas.display.image({
        x: x,
        y: y,
        origin: {x:"left", y:"top"},
        image: image_path,
        obj_outline:  canvas.display.rectangle({
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            strokePosition: 'outside',
            stroke: "outside 1px " + c_settings.object_hover,
            opacity: 0,
            start_x: 0,
            start_y: 0
        })
    }).bind("mouseleave", function() {
        // remove hover outline
        this.obj_outline.opacity = 0;

    }).bind("mouseenter", function() {
        // show outline around object when mouse is hovering over it
        this.obj_outline.x = this.x;
        this.obj_outline.y = this.y;
        this.obj_outline.width = this.width;
        this.obj_outline.height = this.height;
        this.obj_outline.opacity = 1;

    }).dragAndDrop({
        start: function() {
            if (mouse_button != 1) return false;
        },
        end: function() {
            if (mouse_button != 1) return false;
            this.start_x = this.x + camera.x;
            this.start_y = this.y + camera.y;
        },
        move: function() {
            if (mouse_button != 1) return false;
            var cam_offx = camera.x - snapToGridX(camera.x);
            var cam_offy = camera.y - snapToGridY(camera.y);

            var snap_pos = snapToGrid(this.x, this.y);
            this.moveTo(snap_pos.x - Math.abs(cam_offx), snap_pos.y - Math.abs(cam_offy));
            this.obj_outline.moveTo(this.x, this.y);

            /* moving camera while dragging
            var win_width = window.innerWidth;
            var win_height = window.innerHeight;
            var xdiff = 0, ydiff = 0;
            var xmove = 0, ymove = 0;
            var can_move = false;

            // calculate camera velocity
            if ((mouse.x > win_width - drag_obj_margin) ||
                (mouse.x < drag_obj_margin + 175) || // 175 because of the library element
                (mouse.y < drag_obj_margin) ||
                (mouse.y > (win_height - drag_obj_margin)))
            {
                xdiff = mouse.x - win_width / 2;
                ydiff = mouse.y - win_height / 2;
                var angle = toDeg(Math.atan2(ydiff, xdiff));
                var dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff);

                xmove = dist * Math.cos(angle);
                ymove = dist * Math.sin(angle);
            }

            // reduce push amount
            xmove *= drag_obj_cam_fric;
            ymove *= drag_obj_cam_fric;

            // limit camera pushing
            if (xmove > drag_obj_cam_limit) xmove = drag_obj_cam_limit;
            if (ymove > drag_obj_cam_limit) ymove = drag_obj_cam_limit;

            canv_pushCamera(xmove, ymove);
            canv_cameraMove();
            */
        }
    });

    container.addChild(obj.obj_outline);
    return obj;
}

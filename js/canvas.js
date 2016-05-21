// where the room square is drawn (helps determine how much margin there is at top and left)
var g_origin = {
  x:185,
  y:40
}

var GAME_MARGIN = 150;
var GRID_WIDTH = 32;
var GRID_HEIGHT = 32;

var canvas, room_rect;
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

function initializeCanvas() {
    canvas = new fabric.Canvas('canvas');
    canvas.setWidth(0);
    canvas.setHeight(0);

    canvas.on('mouse:down', function(options) {
        mouse.isDown = true;

        Placer.mouseUp();
    });
    canvas.on('mouse:up', function(options) {
        mouse.isDown = false;
    });
    canvas.on('mouse:move', function(options) {
        mouse.x = options.e.clientX - g_origin.x;
        mouse.y = options.e.clientY - g_origin.y;

        ebox_setCoords (mouse.x - game_margin_lr, mouse.y - game_margin_tb)
    });
    canvas.on('object:modified', function(options) {
        canv_saveState();
    });

}

function canv_setupRoomRect(){
    // room bounds
    room_rect = new fabric.Rect({
        left: game_margin_lr,
        top: game_margin_tb,
        width: game_width,
        height: game_height,
        evented: false,
        selectable: false,

        fill: 'white',
        stroke: 'black',
        strokeWidth: game_border_weight
    });
    room_rect.toObject = function() {
        return;
    };

    canvas.add(room_rect);
    room_rect.moveTo(0);

    setRoomSize();
}

function setGridSize(width, height) {
    _setGridSize(width, height);
    _setRoomSize();
}

function setRoomSize(width, height) {
    game_width = width || game_width;
    game_height = height || game_height;

    _setGridSize();
    _setRoomSize(width, height);
}

function _setGridSize(width, height) {
    grid_width = width || grid_width;
    grid_height = height || grid_height;

    // clear any previous grid lines
    for (var l in grid_lines) {
        canvas.remove(grid_lines[l]);
    }
    grid_lines = []

    // edit game_margin to be a multiple of grid size
    game_margin_tb = GAME_MARGIN;//GAME_MARGIN - (GAME_MARGIN % grid_height);
    game_margin_lr = GAME_MARGIN;//GAME_MARGIN - (GAME_MARGIN % grid_width);

    // draw grid
    // vertical lines
    if (grid_width > 3) {
        for (var i = 1; i < game_width / grid_width; i++) {
            grid_lines.push(new fabric.Line([ i * grid_width + game_margin_lr, game_margin_tb + 1, i * grid_width + game_margin_lr, game_height + game_margin_tb - 1],
                {
                    stroke: '#ccc',
                    selectable: false,
                    evented: false
                }));
        }
    }
    // horizontal lines
    if (grid_height > 3) {
        for (var i = 1; i < (game_height / grid_height); i++) {
            grid_lines.push(new fabric.Line([ game_margin_lr + 1, i * grid_height + game_margin_tb, game_width + game_margin_lr - 1, i * grid_height + game_margin_tb],
                {
                    stroke: '#ccc',
                    selectable: false,
                    evented: false
                }));
        }
    }

    // add lines to canvas
    for (var l in grid_lines) {
        canvas.add(grid_lines[l]);
        grid_lines[l].moveTo(1);

        grid_lines[l].toObject = function() {
            return;
        };
    }


    // snap to grid
    canvas.on('object:moving', function(options) {

        if (!keys.shift) {
            options.target.set({
                left: (Math.round(options.target.left / grid_width) * grid_width) + (GAME_MARGIN % grid_width) - grid_width,
                top: (Math.round(options.target.top / grid_height) * grid_height) + (GAME_MARGIN % grid_width) - grid_height
            });
        }

    });

}

function _setRoomSize(width, height) {
    // room + margins
    var new_width = game_width+(game_margin_lr*2);
    var new_height = game_height+(game_margin_tb*2);

    // prevent object placed in right and bottom margins from being cut off (commented out as future feature)
    /*
    if (new_width > canvas.getWidth()) {
        canvas.setWidth(new_width);
    }
    if (new_height > canvas.getHeight()) {
        canvas.setHeight(new_height);
    }
    */
    canvas.setWidth(new_width);
    canvas.setHeight(new_height);

    room_rect.left = game_margin_lr;
    room_rect.top = game_margin_tb;
    room_rect.width = game_width;
    room_rect.height = game_height;

    canvas.renderAll();
}

$(function(){
    initializeCanvas();

});

// canv_newState()
// clears all objects and remakes the grid
function canv_newState() {
    // clear objects
    canvas.clear();
    canv_setupRoomRect();
}

// canv_loadState()
// clears all objects and loads new ones from a state JSON
function canv_loadState(state_name) {
    //canv_newState();
    canvas.loadFromJSON(lobjects.states[state_name].entity_json, canvas.renderAll.bind(canvas), function(o, obj) {
        if (o.lobj_type) {
            obj.setControlsVisibility({
                bl: false,
                br: false,
                mb: false,
                ml: false,
                mr: false,
                mt: false,
                tl: false,
                tr: false
            });
        }
    });
    canv_setupRoomRect();
}

// canv_saveState()
// saves everything but the grid in a JSON
function canv_saveState() {
    lobjects.states[curr_state].entity_json = canvas.toJSON(['lobj_type','instance_id','obj_id','evented','selectable']);
}

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
        console.log('set ' + category + name)
    },

    mouseUp: function (event) {
        if(this.isObjSelected() && this.getObjCategory() == 'objects' && this.can_place && curr_state){

            var img_path = nwPATH.resolve(nwPROC.cwd(),'includes','images','NA.png');
            // does image have sprites
            var obj = lobjects[this.obj_category][this.obj_name];
            if (Object.keys(obj.sprites).length > 0) {
                // get first image
                img_path = getResourcePath('images',obj.sprites[Object.keys(obj.sprites)[0]].path);
            }

            // place object, add to state entity list
            fabric.Image.fromURL(img_path, function(oImg) {
                var x = (Math.round((mouse.x) / grid_width) * grid_width) + ((GAME_MARGIN % grid_width)) - grid_width;
                var y = (Math.round((mouse.y) / grid_height) * grid_height) + ((GAME_MARGIN % grid_width)) - grid_height;
                Placer.placeObj(oImg, x, y);
            });
        }
    },

    placeObj: function(obj, x, y) {
        obj.set('left', x);
        obj.set('top', y);
        obj.set('lobj_type', this.obj_category);
        obj.set('instance_id', Math.round(Math.random()*1000000));
        obj.set('obj_id', lobjects[this.obj_category][this.obj_name].id);
        obj.setControlsVisibility({
            bl: false,
            br: false,
            mb: false,
            ml: false,
            mr: false,
            mt: false,
            tl: false,
            tr: false
        });

        canvas.add(obj);

        // serialize
        canv_saveState();
    }
}

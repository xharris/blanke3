// where the room square is drawn (helps determine how much margin there is at top and left)
var g_origin = {
  x:185,
  y:40
}

var GAME_MARGIN = 150;
var GRID_WIDTH = 32;
var GRID_HEIGHT = 32;

var canvas, clean_canvas, tile_container;
var grid_lines = [];

var game_width = 800;
var game_height = 100;

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


$(function(){
    initializeCanvas();
});

function initializeCanvas() {
    canvas = document.querySelector('.canvas_container');
    clean_canvas = canvas.cloneNode(true);

    canvas.addEventListener("keydown", function(e) {
        // space, page up, page down and arrow keys:
        if([32, 33, 34, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);
}

function canv_loadState(json) {
    canv_setRoomSize({
        width: game_width,
        height: game_height,
        grid_width: grid_width,
        grid_height: grid_height
    });
}

// new_settings = {width, height, grid_width, grid_height}
function canv_setRoomSize(new_settings) {
    game_width = new_settings.width || game_width;
    game_height = new_settings.height || game_height;
    grid_width = new_settings.grid_width || grid_width;
    grid_height = new_settings.grid_height || grid_height;

    tile_container = document.querySelector(".canvas_container > .tile-container");
    var tile_width = (grid_width > 5) ? grid_width : game_width;
    var tile_height = (grid_height > 5) ? grid_height : game_height;

    /*
    tile_container.style.width = game_width + "px";
    tile_container.style.height = game_height + "px";
    */

    var columns = [];
    var rows = [];
    var row = {};
    for (var x = 0; x <= game_width / tile_width; x++) {
        columns.push({id: "col" + x, name: "", field: "col" + x});
        row = {};

        for (var y = 0; y <= game_height / tile_height; y++) {
            row["col" + x] = "";
        }
        rows[x] = row;
    }

    var slickgrid = new Slick.Grid(tile_container, rows, columns, {
        autoHeight: true,
        rowHeight: grid_height,
        defaultColumnWidth: grid_width,
        enableCellNavigation: true,
        enableColumnReorder: false,
        showHeaderRow: false
    });
    slickgrid.setTopPanelVisibility(false);

    var css_style = {0:{"col":"empty-tile"}};
    for (var x = 0; x <= game_width / tile_width + 1; x++) {
        css_style[x] = {};
        for (var y = 0; y <= game_height / tile_height + 1; y++) {
            css_style[x]["col" + y] = "empty-tile"
        }
    }
    console.log(css_style);

    slickgrid.setCellCssStyles("cellstyle", css_style);
    /*
    showProgress();

    game_width = new_settings.width || game_width;
    game_height = new_settings.height || game_height;
    grid_width = new_settings.grid_width || grid_width;
    grid_height = new_settings.grid_height || grid_height;

    // clear canvas
    canvas.innerHTML = clean_canvas.innerHTML;

    tile_container = document.querySelector(".canvas_container > .tile-container");
    tile_container.classList.remove('hidden');

    tile_container.style.width = (game_width - 1) + "px";
    tile_container.style.height = (game_height - 1) + "px";

    var tile_width = (grid_width > 5) ? grid_width : game_width;
    var tile_height = (grid_height > 5) ? grid_height : game_height;

    // create tile square template
    var tile_div = document.createElement("div");
    tile_div.className = "empty-tile";
    tile_div.style.width = tile_width + "px";
    tile_div.style.height = tile_height + "px";

    // add tile squares
    for (var x = 0; x <= game_width / tile_width + 1; x++) {
        for (var y = 0; y <= game_height / tile_height + 1; y++) {
            var new_tile = tile_div.cloneNode(true);
            tile_div.style.left = x * tile_width + "px";
            tile_div.style.top = y * tile_height + "px";
            tile_container.appendChild(new_tile);
        }
    }

    hideProgress();
    */
}
    /*

    canvas.on('mouse:down', function(options) {
        mouse.isDown = true;
    });
    canvas.on('mouse:up', function(options) {
        mouse.isDown = false;

        Placer.mouseUp();
    });

    canvas.on('mouse:move', function(options) {
        mouse.x = options.e.clientX - g_origin.x;
        mouse.y = options.e.clientY - g_origin.y;

        ebox_setCoords (mouse.x - game_margin_lr, mouse.y - game_margin_tb)
    });

    canvas.on('object:modified', function(options) {
        canv_saveState();
    });

    canvas.observe('object:modified', function (e) {
        //e.target.resizeToScale();
    });
    */

/*
$(document).keydown( function(e){
    if (e.keyCode == 8 || e.keyCode == 46){
        if(canvas.getActiveGroup()){
            canvas.getActiveGroup().forEachObject(function(o){
                canvas.remove(o)
            });
            canvas.discardActiveGroup().renderAll();
        } else {
            canvas.remove(canvas.getActiveObject());
            canvas.renderAll();
        }
        canv_saveState();
    }
})

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

    canvas.setWidth(new_width);
    canvas.setHeight(new_height);

    room_rect.left = game_margin_lr;
    room_rect.top = game_margin_tb;
    room_rect.width = game_width;
    room_rect.height = game_height;

    canvas.renderAll();
}


// canv_newState()
// clears all objects and remakes the grid
function canv_newState() {
    // clear objects
    canvas.clear();
    canv_setupRoomRect();
    canv_saveState();
}

// canv_loadState()
// clears all objects and loads new ones from a state JSON
function canv_loadState(state_name) {
    curr_state = state_name;
    canvas.loadFromJSON(lobjects.states[state_name].entity_json, canvas.renderAll.bind(canvas), function(o, obj) {
        if (o.lobj_type == "objects") {
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
    //canvas.renderAll();
    if (canvas.getWidth() > 0 || canvas.getHeight() > 0) {
        lobjects.states[curr_state].entity_json = canvas.toJSON(['hasRotatingPoint','lobj_type','instance_id','obj_id']);
    }
}
*/

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

                // place object, add to state entity list
                fabric.Image.fromURL(img_path, function(oImg) {
                    oImg.setControlsVisibility({
                        bl: false,
                        br: false,
                        mb: false,
                        ml: false,
                        mr: false,
                        mt: false,
                        tl: false,
                        tr: false
                    });

                    Placer.placeObj(oImg, x, y);
                });
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

        obj.set('left', x);
        obj.set('top', y);
        obj.set('lobj_type', this.obj_category);
        obj.set('instance_id', Math.round(Math.random()*1000000));
        obj.set('obj_id', lobjects[this.obj_category][this.obj_name].id);

        canvas.add(obj);

        // serialize
        canv_saveState();
    }
}

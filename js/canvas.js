// where the room square is drawn (helps determine how much margin there is at top and left)
var g_origin = {
  x:187,
  y:41
}

var GAME_MARGIN = 200;
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

function initializeCanvas() {
    canvas = new fabric.Canvas('canvas');

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

    canvas.add(room_rect);
    room_rect.moveTo(0);

    setRoomSize();
}

function setGridSize(width, height) {
    grid_width = width || grid_width;
    grid_height = height || grid_height;

    // clear any previous grid lines
    for (var l in grid_lines) {
        canvas.remove(grid_lines[l]);
    }
    grid_lines = []

    // edit game_margin to be a multiple of grid size
    game_margin_tb = GAME_MARGIN - (GAME_MARGIN % grid_height);
    game_margin_lr = GAME_MARGIN - (GAME_MARGIN % grid_width);

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
    }


    // snap to grid
    canvas.on('object:moving', function(options) {
        options.target.set({
            left: Math.round(options.target.left / grid_width) * grid_width,
            top: Math.round(options.target.top / grid_height) * grid_height
        });
    });

}

function setRoomSize(width, height) {
    game_width = width || game_width;
    game_height = height || game_height;

    // remake the grid
    setGridSize();

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


    canvas.renderAll();

});

var Placer = {
    obj_name: '',
    obj_category: '',

    grid_mx: 0,
    grid_my: 0,

    sprite: 0,

    can_place: true,

    init: function () {
        this.sprite = game.add.sprite(0, 0, '');
        this.sprite.visible = false;
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
        this.obj_category = category;
        this.obj_name = name;

        var obj = lobjects[this.obj_category][this.obj_name];

        var img_name = 'blanke_NA'; // change to N/A path

        // does image have sprites
        if (Object.keys(obj.sprites).length > 0) {
            // get first image
            img_name = Object.keys(obj.sprites)[0];
        }

        this.sprite.loadTexture(img_name);
    },

    update: function () {
        if (game.input.activePointer.withinGame) {
            var m_pos = getCanvasMousePos();

            // calculate snap to grid
            this.grid_mx = Math.floor(m_pos.x / grid_width) * grid_width;
            this.grid_my = Math.floor(m_pos.y / grid_height) * grid_height;

            // set sprite position
            if (this.isObjSelected()) {
                this.sprite.visible = true;
                this.sprite.x = this.grid_mx;
                this.sprite.y = this.grid_my;
            }
        } else {
            if (this.isObjSelected()) {
                this.sprite.visible = false;
            }
        }
    },

    mouseUp: function (event) {
        if(this.isObjSelected() && this.getObjCategory() == 'objects' && this.can_place){
            var new_spr = game.add.sprite(this.sprite.x,this.sprite.y,this.sprite.key);
            // place object
            // ...
            // add image to phaser
            // ...
            // add to library
            library['states'][curr_state].entities.objects.push(
                {
                    x:new_spr.x,
                    y:new_spr.y,
                    obj_name:this.obj_name
                }
            )
            console.log(lobjects)
        }
    },

    mouseDown: function (event) {
        this.can_place = game.input.activePointer.withinGame;
    }
}

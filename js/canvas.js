var game = new Phaser.Game(screen.width+100, screen.height+100, Phaser.CANVAS, 'canvas', { preload: preload, create: create, update: update, render: render }, antialias=false);

var graphics,
    loader;

// where the game square is drawn (helps determine how much margin there is at top and left)
var g_origin = {
  x:187,
  y:41
}
var game_width = 800;
var game_height = 600;
var grid_width = 32;
var grid_height = 32;

var game_margin = 0;
var game_border_weight = 2;

var zoomFactor = 1;

function preload() {
    game.load.image('blanke_NA','includes/images/NA.png');
}

function create() {
    // set canvas things
    game.stage.backgroundColor = '#eeeded';

    graphics = game.add.graphics(0,0);
    loader = new Phaser.Loader(game);

    // set zoom control
    game.input.mouse.mouseWheelCallback = mouseWheel;
    game.input.mouse.mouseDownCallback = mouseDown;
    game.input.mouse.mouseUpCallback = mouseUp;
    game.input.mouse.mouseMoveCallback = mouseMove;

    game.input.keyboard.onDownCallback = keyDown;
    game.input.keyboard.onUpCallback = keyUp;

    var shadow_offset = 5;

    // draw stage shadow
    graphics.beginFill(0x757575);
    graphics.drawRect(game_margin+shadow_offset, game_margin+shadow_offset, game_width+shadow_offset, game_height+shadow_offset);
    // draw stage bounds
    graphics.beginFill(0xFFFFFF);
    graphics.lineStyle(game_border_weight, 0x000000, 1);
    graphics.drawRect(game_margin, game_margin, game_width, game_height);
    // draw vertical grid lines
    graphics.lineStyle(1, 0xe0e0e0, 1);
    for(var gx=grid_width+game_margin; gx < game_width+game_margin; gx+=grid_width){
      graphics.moveTo(gx,game_margin+(game_border_weight)/2);
      graphics.lineTo(gx,game_margin+game_height-(game_border_weight)/2);
    }
    // draw horizontal grid lines
    for(var gy=grid_height+game_margin; gy < game_height+game_margin; gy+=grid_height){
      graphics.moveTo(game_margin+(game_border_weight)/2,gy);
      graphics.lineTo(game_margin+game_width-(game_border_weight)/2,gy);
    }

    window.graphics = graphics;

    game.camera.x = (game.width * -0.5);
    game.camera.y = (game.height * -0.5);

    setBounds();

    // so zoom focuses towards center
    var win = $(window);
    game.camera.x = (win.width() * -0.5);
    game.camera.y = (win.height() * -0.5);

    game.input.mouse.capture = true;

    // align top left of game square
    setCamPosition(-450,-280);

    Placer.init();
}

$(window).resize(function(){
  var win = $(window);
  game.camera.x = (win.width() * -0.5);
  game.camera.y = (win.height() * -0.5);
});

function setBounds(){
  //var maxZoom = 2;
  //game.world.setBounds(0,0,(screen.width+game_width)*maxZoom,(screen.height+game_height)*maxZoom);
  /*
  var bound_width = game_width+screen.width;
  var bound_height = game_height+screen.height;

  if(game_width > screen.width)
    bound_width = game_width+game_margin;
  if(game_height > screen.height)
    bound_height = game_height+game_margin;
  */

  game.world.setBounds(-1000, -1000, 2000, 2000);
}

var camera = {
  x:0,
  y:0
}
function setCamPosition(x,y){
  camera.x = x;
  camera.y = y;
  game.world.pivot.setTo(-camera.x/zoomFactor,-camera.y/zoomFactor)
}
function startCamMove () {
    cam_drag = true;
    cam_drag_start.x = (game.input.mousePointer.x)-(camera.x);
    cam_drag_start.y = (game.input.mousePointer.y)-(camera.y);
}
function endCamMove () {
    cam_drag = false;
}

var mousemove_x, mousemove_y;
function getCanvasMousePos() {
    return {
        x: parseInt((mousemove_x+game.camera.x-camera.x)/zoomFactor),
        y: parseInt((mousemove_y+game.camera.y-camera.y)/zoomFactor)
    }
}

var prev_zoomFactor;
function setZoom (factor) {
    if(factor > 2 || factor < 0.5){
        ebox_setZoom(zoomFactor*100);
        return;
    }

    prev_zoomFactor = zoomFactor;
    zoomFactor = factor;

    // set zoom tween
    game.world.scale.setTo(zoomFactor)
    //setCamPosition(camera.x,camera.y)
    //var zoom_tween = game.add.tween(game.world.scale).to({x:zoomFactor,y:zoomFactor}, 200, Phaser.Easing.Sinusoidal.InOut);
    //zoom_tween.start();

    //zoom_tween.onComplete.add(zoomFinish,this);
    ebox_setZoom(zoomFactor*100);
}

function zoomFinish () {
    //game.world.pivot.setTo(-camera.x/zoomFactor,-camera.y/zoomFactor);

}

function mouseWheel(event){
    // zoom camera
    if(game.input.mouse.wheelDelta === Phaser.Mouse.WHEEL_UP) {
      setZoom(zoomFactor + 0.1);
    } else {
      setZoom(zoomFactor - 0.1);
    }
}

var cam_drag = false;
var cam_drag_start = {
  x:0,
  y:0
}

function mouseDown(event){
  // left button
  if(event.which == 1){
      Placer.mouseDown(event);
  }

  // middle button
  if(event.which == 2){
    startCamMove();
  }
}

function mouseUp(event){
  // left button
  if(event.which == 1){
      Placer.mouseUp(event);
  }

  // middle button
  if(event.which == 2){
    endCamMove();
  }
}

function mouseMove(event){
    if(cam_drag){
        setCamPosition(event.x-cam_drag_start.x,event.y-cam_drag_start.y)
    }

    mousemove_x = event.x;
    mousemove_y = event.y;

    var mouse_pos = getCanvasMousePos();
    ebox_setCoords(mouse_pos.x/zoomFactor, mouse_pos.y/zoomFactor)
}

function keyDown (event) {
    if (event.which == Phaser.KeyCode.SPACEBAR) {
        startCamMove();
    }
}

function keyUp (event) {
    if (event.which == Phaser.KeyCode.SPACEBAR) {
        endCamMove();
    }
}

function update() {
    Placer.update();
}

function render() {
    game.debug.text("cam_origin", camera.x, camera.y, 0x000000 );

    game.debug.pixel(game.world.pivot.x, game.world.pivot.y, 'rgba(0,0,0,1)' ) ;
    game.debug.text("world_pivot", game.world.pivot.x, game.world.pivot.y,'rgba(0,0,0,1)' );
}

function canv_addSprite (name, path) {
    game.load.image(name,path);
    game.load.start();
}

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

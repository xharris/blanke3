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

// ZOOM I/O
var oldcamera;
var worldScale = 1;
var currentBounds;
var mapSizeMax;
var worldwidth=600;
var worldheight=600;
var mapSizeX = 8000;
var mapSizeY = 8000;
var prevScale ={};
var nextScale={};
var zoompoint={};
var mapSizeCurrent;
var distance =0;
var olddistance =0;
var distancedelta=0;
var easing=0.1;


function preload() {
    game.load.image('blanke_NA','includes/images/NA.png');

    // ZOOM I/O
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
}

function create() {
    // set canvas things
    game.stage.backgroundColor = '#eeeded';

    graphics = game.add.graphics(0,0);
    loader = new Phaser.Loader(game);

    // set zoom control
    //game.input.mouse.mouseWheelCallback = mouseWheel;
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

    // ZOOM I/O
    worldScale=1;
    stageGroup = game.add.group(); // this group will contain everything except the UI for scaling

    mapSizeMax = mapSizeX;
    mapSizeCurrent = mapSizeMax;
    /*
    coin = game.add.sprite(4000,4000,'coin');
    coin.scale.setTo(4,4);
    coin.anchor.setTo(0.5,0.5);
    */
    //background1=game.add.tileSprite(0, 0, mapSizeX,mapSizeY ,'clouds');
    //currentBounds = new Phaser.Rectangle(-mapSizeX, -mapSizeY, mapSizeX*2, mapSizeY*2);
    game.camera.bounds=currentBounds;
    game.camera.focusOnXY(4000,4000);
    game.input.mouse.mouseWheelCallback = function (event) {
        var wheelDelt = game.input.mouse.wheelDelta;
        if (wheelDelt < 0)  {   mapSizeCurrent -= 400;  mapSizeCurrent = Phaser.Math.clamp(mapSizeCurrent, worldwidth , mapSizeMax);}
        else                {   mapSizeCurrent += 400;  mapSizeCurrent = Phaser.Math.clamp(mapSizeCurrent, worldwidth , mapSizeMax);}
        worldScale = (mapSizeCurrent/mapSizeMax);
    };

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

function mouseWheel(event){
  if(zoomFactor > 2 || zoomFactor < 0.5){
    if(zoomFactor < 0.5)zoomFactor = 0.5;
    else if(zoomFactor > 2)zoomFactor = 2;
    return;
  }
  // zoom camera
  if(game.input.mouse.wheelDelta === Phaser.Mouse.WHEEL_UP) {
    zoomFactor += 0.1;
  } else {
    zoomFactor -= 0.1;
  }
  // set zoom tween
  var zoom_tween = game.add.tween(game.world.scale).to({x:zoomFactor,y:zoomFactor}, 200, Phaser.Easing.Sinusoidal.InOut);
  zoom_tween.start();

  //zoom_tween.onComplete.add(zoomFinish,this);
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
    ebox_setCoords(mouse_pos.x, mouse_pos.y)
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

    // ZOOM I/O

        //touch zoom
        if(game.input.pointer1.isDown && game.input.pointer2.isDown){
            olddistance = distance;
            distance = Phaser.Math.distance(game.input.pointer1.x, game.input.pointer1.y, game.input.pointer2.x, game.input.pointer2.y);
            distancedelta = Math.abs(olddistance - distance);

            if (olddistance > distance && distancedelta > 4 ){ mapSizeCurrent -= 200;  }
            else if (olddistance < distance && distancedelta > 4 ){  mapSizeCurrent += 200;}
            mapSizeCurrent = Phaser.Math.clamp(mapSizeCurrent, worldwidth , mapSizeMax); //prevent odd scalefactors - set a minimum and maximum scale value
            worldScale = (mapSizeCurrent/mapSizeMax);

            //calculate point between fingers (zoompoint.x and zoompoint.y)
            if (game.input.pointer1.x < game.input.pointer2.x) { zoompoint.x =  game.input.pointer1.worldX + (Math.abs(game.input.pointer1.worldX - game.input.pointer2.worldX)/2); }
            else {zoompoint.x =  game.input.pointer2.worldX + (Math.abs(game.input.pointer1.worldX - game.input.pointer2.worldX)/2);  }
            if (game.input.pointer1.y < game.input.pointer2.y) { zoompoint.y =  game.input.pointer1.worldY + (Math.abs(game.input.pointer1.worldY - game.input.pointer2.worldY)/2); }
            else {zoompoint.y =  game.input.pointer2.worldY + (Math.abs(game.input.pointer1.worldY - game.input.pointer2.worldY)/2);  }
        }
        else {  // wheelzoom
            zoompoint.x = game.input.mousePointer.worldX;
            zoompoint.y = game.input.mousePointer.worldY;
        }

        // move camera / pan
        if(game.input.activePointer.isDown && !game.input.pointer2.isDown){
            if (oldcamera) { // if moving the world always continue from the last position
                game.camera.x += oldcamera.x - game.input.activePointer.position.x;
                game.camera.y += oldcamera.y - game.input.activePointer.position.y;
            }
            oldcamera = game.input.activePointer.position.clone();
        }
        // adjust camera center and zoom here
        else {
            oldcamera = null;
            rescalefactorx = mapSizeX / (mapSizeX * stageGroup.scale.x); // multiply by rescalefactor to get original world value
            rescalefactory = mapSizeY / (mapSizeY * stageGroup.scale.y);

            prevScale.x = stageGroup.scale.x;
            prevScale.y = stageGroup.scale.y;

            nextScale.x = prevScale.x + (worldScale-stageGroup.scale.x)*easing;
            nextScale.y = prevScale.y + (worldScale-stageGroup.scale.y)*easing;

            var xAdjust = (zoompoint.x - game.camera.position.x) * (nextScale.x - prevScale.x);
            var yAdjust = (zoompoint.y - game.camera.position.y) * (nextScale.y - prevScale.y);


            //Only move screen if we're not the same scale
            if (prevScale.x != nextScale.x || prevScale.y != nextScale.y) {
                var scaleAdjustX = nextScale.x / prevScale.x;
                var scaleAdjustY = nextScale.y / prevScale.y;
                var focusX = (game.camera.position.x * scaleAdjustX) + xAdjust*(rescalefactorx);
                var focusY = (game.camera.position.y * scaleAdjustY) + yAdjust*(rescalefactory);
                game.camera.focusOnXY(focusX, focusY);
            }

            //now actually scale the stage
            stageGroup.scale.x += (worldScale-stageGroup.scale.x)*easing;   //easing
            stageGroup.scale.y += (worldScale-stageGroup.scale.y)*easing;
        }
}

function render() {

}

function canv_addSprite (name, path) {
    game.load.image(name,path);
    game.load.start();
}

var Placer = {
    obj_name: '',
    obj_category: '',
    obj_name: '',

    grid_mx: 0,
    grid_my: 0,

    sprite: 0,

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

    setObj: function (category,name) {
        this.obj_name = name;
        this.obj_category = category;
        this.obj_name = name;


        console.log(this.obj_category)
        console.log(this.obj_name)
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

    },

    mouseDown: function (event) {
        if(this.isObjSelected() && this.getObjCategory() == 'objects'){
          // place object
          // ...
          // add image to phaser
          // ...
        }
    }
}

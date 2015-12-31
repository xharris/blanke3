var game = new Phaser.Game(screen.width+100, screen.height+100, Phaser.CANVAS, 'canvas', { preload: preload, create: create, update: update, render: render }, antialias=false);

var graphics;

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

}

function create() {
    // set canvas things
    game.stage.backgroundColor = '#eeeded';
    graphics = game.add.graphics(0,0);

    // set zoom control
    game.input.mouse.mouseWheelCallback = mouseWheel;
    game.input.mouse.mouseDownCallback = mouseDown;
    game.input.mouse.mouseUpCallback = mouseUp;
    game.input.mouse.mouseMoveCallback = mouseMove;

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

  zoom_tween.onComplete.add(zoomFinish,this);
}

var cam_drag = false;
var cam_drag_start = {
  x:0,
  y:0
}
function mouseDown(event){
  // middle button
  if(event.which == 2){
    cam_drag = true;
    cam_drag_start.x = (game.input.mousePointer.x)-(camera.x);
    cam_drag_start.y = (game.input.mousePointer.y)-(camera.y);
  }
}

function mouseUp(event){
 // middle button
 if(event.which == 2){
   cam_drag = false;
 }
}

function mouseMove(event){
  if(cam_drag){
    setCamPosition(event.x-cam_drag_start.x,event.y-cam_drag_start.y)
  }
}

function update() {
  // move camera with mouse

  //console.log(game.input.activePointer.middleButton.isDown);

  /*
  if (game.input.activePointer.isDown == Phaser.Mouse.MIDDLE_BUTTON) {
  	if (game.origDragPoint) {
  		// move the camera by the amount the mouse has moved since last update
  		game.world.pivot.x += (game.origDragPoint.x/zoomFactor) - (game.input.activePointer.position.x/zoomFactor);
  		game.world.pivot.y += (game.origDragPoint.y/zoomFactor) - (game.input.activePointer.position.y/zoomFactor);
  	}
  	// set new drag origin to current position
  	game.origDragPoint = game.input.activePointer.position.clone();
  }
  else {
  	game.origDragPoint = null;
  }
  */
}

function render() {

}

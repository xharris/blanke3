var game = new Phaser.Game(screen.width+100, screen.height+100, Phaser.CANVAS, 'canvas', { preload: preload, create: create, update: update, render: render }, antialias=false);

var graphics;

// where the game square is drawn (helps determine how much margin there is at top and left)
var g_origin = {
  x:187,
  y:41
}
var game_width = 900;
var game_height = 480;
var grid_width = 32;
var grid_height = 32;

var zoomFactor = 1;


function preload() {

}

function create() {
    // set canvas things
    game.stage.backgroundColor = '#eeeded';
    graphics = game.add.graphics(0,0);

    // set zoom control
    game.input.mouse.mouseWheelCallback = mouseWheel;

    var shadow_offset = 5;
    var game_border_weight = 5;
    var game_margin = 300;

    // draw stage shadow
    graphics.beginFill(0x616161);
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
    bound_width = screen.width;
    bound_height = screen.height;
    //if(game_width >)
    game.world.setBounds(0,0,screen.width+game_width,screen.height+game_height);

    // move camera so game square is in view
    game.camera.x = game_margin-g_origin.x;
    game.camera.y = game_margin-g_origin.y;
}

function setBounds(){
  game.world.setBounds(0,0,(screen.width+game_width)*zoomFactor,(screen.height+game_height)*zoomFactor);
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
  var zoom_tween = game.add.tween(game.camera.scale).to({x:zoomFactor,y:zoomFactor}, 200, Phaser.Easing.Sinusoidal.InOut);
  //var pos_tween = game.add.tween(game.world.position).to({x:-(zoomFactor*game_width),y:-(zoomFactor*game_height)}, 200, Phaser.Easing.Sinusoidal.InOut);
  zoom_tween.start();
  //pos_tween.start();
  zoom_tween.onComplete.add(setBounds,this);
}

function update() {
  // move camera with mouse
  //console.log(game.input.activePointer.middleButton.isDown);
  if (game.input.activePointer.isDown == Phaser.Mouse.MIDDLE_BUTTON) {
  	if (game.origDragPoint) {
  		// move the camera by the amount the mouse has moved since last update
  		game.camera.x += game.origDragPoint.x - game.input.activePointer.position.x;
  		game.camera.y += game.origDragPoint.y - game.input.activePointer.position.y;
  	}
  	// set new drag origin to current position
  	game.origDragPoint = game.input.activePointer.position.clone();
  }
  else {
  	game.origDragPoint = null;
  }
}

function render() {

}

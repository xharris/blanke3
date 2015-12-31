var nwGUI = require('nw.gui');
var win = nwGUI.Window.get();

win.showDevTools();

var isMaximized = false;

function winResize(){
	if(isMaximized){
    isMaximized = false;
  	win.unmaximize();
	}else{
    isMaximized = true;
  	win.maximize();
	}
}

function winClose(){
  win.close();
}

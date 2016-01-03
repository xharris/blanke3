var nwGUI = require('nw.gui');
var win = nwGUI.Window.get();

win.showDevTools();

var isMaximized = false;

var lobjects = {
	"objects":{},
	"tiles":{},
	"regions":{},
	"sounds":{},
	"states":{}
}

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

function chooseFile(name,callback) {
    var chooser = document.querySelector(name);
    chooser.addEventListener("change", function(evt) {
      callback(this.value);
    }, false);

    chooser.click();
  }

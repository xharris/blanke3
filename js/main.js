var IDE_NAME = "BlankE";
var PJ_EXTENSION = 'bla';
var AUTOSAVE = true;

const electron = require('electron')
// Module to control application life.
const app = electron.app

var nwPROC = require('process');
var nwPATH = require('path');
var nwFILE = require('fs-extra');
var nwIMG = require('image-size');
var nwUTIL = require('util');

var eRemote = require('electron').remote;
var eMenu = eRemote.Menu;
var eIPC = require('electron').ipcRenderer;
var eScreen = require('electron').screen;

var isMaximized = false;
var menu_icon = "bars";
var screen_size = {width:0,height:0};

var lobjects = {
	"objects":{},
	"tiles":{},
	"regions":{},
	"sounds":{},
	"states":{},
	"settings":{}
}
var project_path;
var project_name;

var curr_state; // (state name)

var config_data = {"recent_projects":[]};
var colors = {"green":"#4caf50"}

var app_menu = eMenu.buildFromTemplate([
{
	label: 'BlankE',
	submenu: [
	  {
		label: 'Go to website',
		click: function(){
		  alert('hello menu');
		}
	  }
	]
},
{
	label: 'File',
	submenu: [
		{
			label: 'New',
			click: function() {
				btn_newProject();
			}
		},
		{
			label: "Save",
			click: function() {
				saveProject();
			}
		},
		{
			label: 'Open',
			click: function() {
				btn_openProject();
			}
		}
	]
},
{
	label: 'Tools',
	submenu: [
		{
			label: 'Show Developer Tools',
			click: function() {
				eIPC.send('show-dev-tools');
			}
		}
	]
}
]);

$(function(){
	getColors();
	btn_newProject();

	// set events for window close
	eIPC.on('window-close', function(event) {
		closeProject(function(){
			eIPC.send('confirm-window-close');
		});
	});

	// get largest screen size for canvas element
	var displays = eScreen.getAllDisplays();
	for (var d = 0; d < displays.length; d++) {
		var display = displays[d];

		if (display.bounds.width > screen_size.width)
			screen_size.width = display.bounds.width;
		if (display.bounds.height > screen_size.height)
			screen_size.height = display.bounds.height;
	}


	eMenu.setApplicationMenu(app_menu);
});

function winSetTitle(new_title){
	$(".menu_bar > .window_title").html("<div class='icon_container' onclick='winToggleMenu()'><i class='fa fa-"+menu_icon+"'></i></div>"+new_title);
	document.title = new_title;
}

function winToggleMenu(){
	$(".window_menu").toggleClass("active");
}

function winSetMenuIcon(new_icon){
	menu_icon = new_icon;
	winSetTitle(document.title);
}

// min (included), max (excluded)
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

// http://www.geedew.com/remove-a-directory-that-is-not-empty-in-nodejs/
function rmdirAsync (path, callback) {
	nwFILE.readdir(path, function(err, files) {
		if(err) {
			// Pass the error on to callback
			callback(err, []);
			return;
		}
		var wait = files.length,
			count = 0,
			folderDone = function(err) {
			count++;
			// If we cleaned out all the files, continue
			if( count >= wait || err) {
				nwFILE.rmdir(path,callback);
			}
		};
		// Empty directory to bail early
		if(!wait) {
			folderDone();
			return;
		}

		// Remove one or more trailing slash to keep from doubling up
		path = path.replace(/\/+$/,"");
		files.forEach(function(file) {
			var curPath = path + "/" + file;
			nwFILE.lstat(curPath, function(err, stats) {
				if( err ) {
					callback(err, []);
					return;
				}
				if( stats.isDirectory() ) {
					rmdirAsync(curPath, folderDone);
				} else {
					nwFILE.unlink(curPath, folderDone);
				}
			});
		});
	});
};

function writeFile(location,text){
	nwFILE.writeFile(location, text, function(err) {
		if(err) {return console.log('error saving game: '+err);}
	});
}

function chooseFile(callback) {
  eIPC.send('open-file-dialog');
  eIPC.on('selected-directory', function (event, path) {
	  callback(path);
  })
}

function updateRecentProjects() {
	// get the config.json
	var config_path = nwPATH.resolve(nwPROC.cwd(),'includes','config.json');
	if(nwFILE.existsSync(config_path)){
		nwFILE.readFile(config_path, 'utf8', function (err,data) {
		  if (!err) {
			config_data = JSON.parse(data);
			//reset recent projects list
			//$(".recent_projects > table").empty();
			$(".recent_projects > table").colResizable({ disable : true });
			// update recent projects list
			for(p in config_data["recent_projects"]){
				var project = config_data["recent_projects"][p];
				// show project if it actually exists
				if(nwFILE.existsSync(nwPATH.resolve(project.path,project.name))){
					$(".recent_projects > table").append('\
						<tr>\
							<td class="name" onclick="openProject(\''+encodeURI(nwPATH.resolve(project.path,project.name,project.name+'.bla'))+'\')">'+project.name+'</td>\
							<td title="'+project.path+'">'+project.path+'</td>\
							<td>'+project.date+'</td>\
						</tr>\
					');
				}
			}

			$(".recent_projects > table").colResizable({
				disable: false,
				liveDrag : true
			});

			}
		});
	}else{
		writeFile(config_path,config_data);
	}
}

function getColors() {
	var colors_path = nwPATH.resolve(nwPROC.cwd(),'includes','colors.json');
	if(nwFILE.existsSync(colors_path)){
		nwFILE.readFile(colors_path, 'utf8', function (err,data) {
			if (!err) {
				colors = JSON.parse(data);
			}
		});
	}
}

// http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function toDeg(rad) {
	return rad * (Math.PI / 180);
}

function showIntroWindow() {
	/*
	$("#intro_window").removeClass("hidden");
	$(".menu_bar").addClass("intro_active");
	winToggleMenu();
	*/
}

function hideIntroWindow() {
	/*
	$("#intro_window").addClass("hidden");
	$(".menu_bar").removeClass("intro_active");
	// hide project setup window
	$("#intro_window > .project_setup").addClass("hidden");
	*/
}

// startProjecSetup()
// makes new project form visible
function startProjectSetup() {
	// set save path value
	var proj_name = $("#setup_name").val();
	var proj_path = nwPATH.resolve(nwPROC.cwd(),'PROJECTS');
	// change default path
	$(".pj_path > span").html(proj_path);
	$("#setup_path").nwworkingdir = proj_path;
	// show project setup window
	$("#intro_window > .project_setup").removeClass("hidden");
}

// submitProjectSetup()
// submits new project form
function submitProjectSetup(){
	var pj_name = $("#setup_name").val();
	var pj_path = $("#setup_path").val() || nwPATH.resolve(nwPROC.cwd(),'PROJECTS');

	newProject(pj_name,pj_path);
}

// needs work. doesn't clear our previous project.
function btn_newProject(){
	project_path = nwPATH.resolve(nwPROC.cwd(),'PROJECTS');
	project_name = 'project0';
	winSetTitle(IDE_NAME);

	// generate default project name
	nwFILE.readdir(project_path, function(err, files){
		if (!err) {
			project_name = 'project' + files.length;
			newProject(project_name, project_path);
		} else {
			newProject(project_name, project_path);
		}
	})
}


function newProject(name,path){
	// empty lobjects
	lobjects = {
		"objects":{},
		"tiles":{},
		"regions":{},
		"sounds":{},
		"states":{},
		"settings":{
			"ide":{
				"color": {
					"background": "#EEEDED",
					"grid": "#000",
					"bounds": "#00e676",
					"object_hover": "#00bcd4"
				}
			},
			"game":{
				"project_name": name
			}
		}
	}
	// set global project variables
	project_path = nwPATH.resolve(path,name);
	project_name = name+'.bla';

	initializeCanvas(screen_size);

	winSetTitle(nwPATH.basename(project_name)+' - '+IDE_NAME);

    //addLobj('states');

	// save everything
	//addRecentProject(name,path);
}

function closeProject(callback) {
	// if there's no .bla file, delete everything
	try {
		if (nwFILE.lstatSync(nwPATH.resolve(getProjectPath(),project_name)).isFile()) {
			autosaveProject();
			callback();
		}
	} catch(err) {
		rmdirAsync(getProjectPath(), function(){
			callback();
		});
	}
}



function addRecentProject(name,path){
	var file_path = nwPATH.resolve(nwPROC.cwd(),'includes','config.json');

	// add the project to recent projects array
	if(!("recent_projects" in config_data)){
		config_data["recent_projects"] = [];
	}
	// get the current time
	var time = new Date().toJSON()//.slice(0,10);
	// add to recent projects array
	config_data["recent_projects"].push({
		"name":name,
		"path":path,
		"date":time
	});
	// write config file
	config_data = JSON.stringify(config_data);
	writeFile(file_path,config_data);
}

function getProjectPath(){
	return nwPATH.resolve(project_path);
}

function btn_openProject(){
	chooseFile(function(file){
		openProject(file);
	});
}


function openProject(path){
	path = decodeURI(path);
	nwFILE.readFile(nwPATH.resolve(path), 'utf8', function (err,data) {
		if (!err) {
			// set lobjects
			lobjects = JSON.parse(data);

			tree_reset();
			Placer.reset();

			// show first state
			curr_state = Object.keys(lobjects.states)[0];
			canv_loadState(Object.keys(lobjects.states)[0]);

			project_path = nwPATH.dirname(path);
			project_name = nwPATH.basename(path);

			// update jqTree
			tree.tree('loadData',JSON.parse(lobjects['tree']));

			// close intro window
			$("#intro_window").toggleClass("hidden");

			// change window title
			winSetTitle(nwPATH.basename(project_name)+' - '+IDE_NAME);

			closeAllModals();
		}
		else{
			console.log(err)
		}
	});
}

function autosaveProject(){
	if (AUTOSAVE) saveProject();
}

function saveProject(){
	// add tree structure to lobjects
	lobjects['tree'] = tree.tree('toJson');

	//canv_saveState();

	// serialize lobjects
	var save_data = JSON.stringify(lobjects);

	// change window title
	winSetTitle(nwPATH.basename(project_name)+' - '+IDE_NAME);

	// create project folder if not made
	var file_path = getProjectPath();

	try {
		if (nwFILE.lstatSync(file_path).isDirectory()) {
			// create project save file
			writeFile(nwPATH.resolve(file_path,project_name),save_data);
		}
	} catch(err) {
		nwFILE.mkdir(file_path, function(err){
			// create project save file
			writeFile(nwPATH.resolve(file_path,project_name),save_data);
		});
	}
}

function importResource(category,location,callback){
	location = decodeURI(location);
	var folder_path = nwPATH.resolve(getProjectPath(),category);

	// make the project folder if it doesn't exist
	try {
		nwFILE.lstatSync(project_path).isDirectory();
	} catch(err) {
		nwFILE.mkdir(project_path);
	}

	// make the resource folder if it doesn't exist
	try {
		nwFILE.lstatSync(folder_path).isDirectory();
	} catch(err) {
		nwFILE.mkdir(folder_path);
	}

	var f_dest = nwPATH.resolve(folder_path,nwPATH.basename(location));
	// move the file if it's not there
	if(!nwFILE.exists(f_dest)){
		nwFILE.copy(location,f_dest,function (err) {
			if (err) return console.error(err)
			if (callback) {
				callback(f_dest);
			}
		});
	}
}

function getResourcePath(category,name) {
	return nwPATH.resolve(getProjectPath(),category,name);
}

function saveBackup(){

}

function closeAllModals() {
	closeSpriteModal()
	closeObjectModal()
}

var nwGUI = require('nw.gui');
var nwPROC = require('process');
var nwPATH = require('path');
var nwFILE = require('fs');

var win = nwGUI.Window.get();

win.showDevTools();

var isMaximized = false;

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

var config_data = {"recent_projects":[]};

$(function(){
  $(".recent_projects > table").colResizable();
});

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
	if(project_name)saveProject();
	// clean the config.json
	// ...
  win.close();
}

function writeFile(location,text){
	nwFILE.writeFile(location, text, function(err) {
		if(err) {return console.log('error saving game: '+err);}
	});
}

function chooseFile(name,callback) {
  var chooser = document.querySelector(name);
  chooser.addEventListener("change", function(evt) {
    callback(this.value);
  }, false);

  chooser.click();
}

$(function(){

	//startProjectSetup();

	// update text on folder select
	$("#setup_path").change(function(evt) {
		$(".pj_path > span").html($(this).val());
  });

	// get the config.json
	var config_path = nwPATH.resolve(nwPROC.cwd(),'includes','config.json');
	if(nwFILE.existsSync(config_path)){
		nwFILE.readFile(config_path, 'utf8', function (err,data) {
		  if (!err) {
		  	config_data = JSON.parse(data);
				// update recent projects list
				for(p in config_data["recent_projects"]){
					var project = config_data["recent_projects"][p];
					// show project if it actually exists
					if(nwFILE.existsSync(nwPATH.resolve(project.path,project.name))){
						$(".recent_projects > table").append('\
							<tr>\
								<td class="name" onclick="openProject(\''+encodeURI(nwPATH.resolve(project.path,project.name,project.name+'.bla'))+'\')">'+project.name+'</td>\
								<td>'+project.path+'</td>\
								<td>'+project.date+'</td>\
							</tr>\
						');
					}
				}

			}
		});
	}else{
		writeFile(config_path,config_data);
	}

});

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

function submitProjectSetup(){
	var pj_name = $("#setup_name").val();
	var pj_path = $("#setup_path").val() || nwPATH.resolve(nwPROC.cwd(),'PROJECTS');

	newProject(pj_name,pj_path)
}

function newProject(name,path){
	// hide intro window
	$("#intro_window").toggleClass("hidden");
	// empty lobjects
	lobjects = {
		"objects":{},
		"tiles":{},
		"regions":{},
		"sounds":{},
		"states":{},
		"settings":{
			"ide":{},
			"game":{
				"project_name":name
			}
		}
	}
	// reset tree
	tree.tree({
    data:data,
    dragAndDrop: true,
    autoOpen: 0
  });
	// set global project variables
	project_path = nwPATH.resolve(path,name);
	project_name = name+'.bla';
	// save everything
	saveProject();
	addRecentProject(name,path);
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
	return nwPATH.resolve(project_path,project_name);
}

function btn_openProject(){
	chooseFile('#pj_open_dialog',function(file){
		openProject(file);
	});
}


function openProject(path){
	path = decodeURI(path);
	nwFILE.readFile(nwPATH.resolve(path), 'utf8', function (err,data) {
		if (!err) {
			// set lobjects
			lobjects = JSON.parse(data);

			project_path = nwPATH.dirname(path);
			project_name = nwPATH.basename(path);


			// update jqTree
			tree.tree('loadData',JSON.parse(lobjects['tree']));

			// close intro window
			$("#intro_window").toggleClass("hidden");
		}
		else{
			console.log(err)
		}
	});
}

function saveProject(){
	// create project folder if not made
	var file_path = getProjectPath();
	if(!nwFILE.exists(nwPATH.dirname(file_path))){
		nwFILE.mkdir(nwPATH.dirname(file_path));
	}

	// add tree structure to lobjects
	lobjects['tree'] = tree.tree('toJson');

	// serialize lobjects
	var save_data = JSON.stringify(lobjects)

	// create project save file
	writeFile(file_path,save_data);
}

function importResource(category,location,callback){
	var folder_path = nwPATH.resolve(project_path,category);

	// make the resource folder if it doesn't exist
	nwFILE.stat(folder_path,function(err,stats){
		if(err){
			nwFILE.mkdir(folder_path);
		}
	})

	var f_dest = nwPATH.resolve(folder_path,nwPATH.basename(location));
	if(!nwFILE.exists(f_dest)){
		nwFILE.createReadStream(location).pipe(nwFILE.createWriteStream(f_dest));
	}
	if(callback){
		callback(f_dest);
	}
}

function saveBackup(){

}

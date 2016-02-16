function addLobj(category,name,info){
  lobjects[category][name] = info;

  saveProject();
}

function getLobjByName(name){
  return lobjects["objects"][name];
}

function getLobjNameByID(id){
  for(key in lobjects.objects){
    if(lobjects.objects[key].id == id){
      return key;
    }
  }
}

function deleteLobj (category, name) {
    var obj_node = tree.tree('getNodeById',lobjects[category][name].id);
    tree.tree('removeNode',obj_node);
    delete lobjects[category][name];

    closeObjectModal();
}

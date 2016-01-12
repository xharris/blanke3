function addLobj(category,name,info){
  lobjects[category][name] = info;
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

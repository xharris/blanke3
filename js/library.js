function addLobj(category,name,info){
  lobjects[category][name] = info;
}

function getLobjByName(name){
  return lobjects["objects"][name];
}

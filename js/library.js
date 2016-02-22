function addLobj(category,name,info){
    // generate a name
    if (typeof name === "undefined") {
        // get name of new object
        var cat_name = category.toLowerCase();
        var obj_name_num = 0;
        // make sure it's not a duplicate object
        do {
            name = cat_name.substring(0,cat_name.length-1)+(Object.keys(lobjects[cat_name]).length+obj_name_num);
            obj_name_num += 1;
        } while (name in lobjects[cat_name])
    }

    // default info dict
    if (typeof info === "undefined") {
        if (category == "objects") {
            info = {
                depth: 0,
                sprites: {}
            }
        }
        if (category == "states") {
            info = {
                entities:{
                    objects:{},
                    tiles:{}
                }
            }
        }
    }

    lobjects[category][name] = info;

    console.log(lobjects[category][name]);

  var node_id = Math.round(Math.random()*1000000);
  lobjects[category][name].id = node_id;

  var category_node = tree.tree('getNodeById', 'cat_'+category.toUpperCase());
  tree.tree(
      'appendNode',
      {
          label: name,
          id: node_id
      },
      category_node
  );

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

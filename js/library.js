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
                entity_json : ""
            }
        }
        if (category == "regions") {
            info = {
                color: colors[Object.keys(colors)[getRandomInt(0,Object.keys(colors).length)]]
            }
        }
    }

    lobjects[category][name] = info;

    if (category == 'states') {
        curr_state = name;
        canv_newState();
        canv_saveState();
    }

    var node_id = Math.round(Math.random()*1000000);
    lobjects[category][name].id = node_id;

    var category_node = tree.tree('getNodeById', 'cat_' + category.toUpperCase());
    var new_node = tree.tree(
        'appendNode',
        {
            label: name,
            id: node_id
        },
        category_node
    );

    tree.tree('openNode', category_node);
    tree.tree('selectNode', new_node);
}

function getLobjByName(category,name){
    return lobjects[category.toLowerCase()][name];
}

function getLobjNameByID(category, id){
    for(key in lobjects[category.toLowerCase()]){
        if(lobjects[category.toLowerCase()][key].id == id){
            return key;
        }
    }
}

function deleteLobj(category, name) {
    var obj_node = tree.tree('getNodeById',lobjects[category][name].id);
    tree.tree('removeNode',obj_node);
    delete lobjects[category][name];

    closeObjectModal();
}

function changeLobjName(category, obj, new_name) {
    var oldname = getLobjNameByID(category, obj.id);
    var oldvals = $.extend(true,{},obj);

    // check if name already exists
    // ...

    // add newly named object
    lobjects[category.toLowerCase()][new_name] = oldvals;
    obj = lobjects[category.toLowerCase()][new_name];
    // delete the old object
    delete lobjects[category.toLowerCase()][oldname];
    // change object name in tree
    var tree_node = tree.tree('getNodeById',obj['id'])
    tree.tree('updateNode',tree_node,new_name)

    return lobjects[category.toLowerCase()][new_name];
}

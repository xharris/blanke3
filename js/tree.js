var data = [
  {label: 'OBJECTS', id: 'cat_OBJECTS'},

  {label: 'TILES', id: 'cat_TILES'},

  {label: 'REGIONS', id: 'cat_REGIONS'},

  {label: 'SOUNDS', id: 'cat_SOUNDS'},

  {label: 'STATES', id: 'cat_STATES'}

];

var tree;
win.on('loaded', function() {

  tree = $('#library');
  tree.tree({
    data:data,
    dragAndDrop: true,
    autoOpen: 0,
    onCanMove: function (ev_node) {
        name = ev_node.name;
        // moving a child
        if(!(name == "OBJECTS" || name == "TILES" || name == "REGIONS" || name == "STATES" || name == "SOUNDS")){
            return true;
        } else {
            return false;
        }
    },
    onCanMoveTo: function (moved_node, target_node, position) {
        /* work on later
        console.log(moved_node);
        console.log(target_node);
        console.log(position);
        */
    }
  });

  tree.bind(
      'tree.dblclick',
      function(event) {
          ev_node = event.node;
          name = ev_node.name;
          // selected a child
          if(!(name == "OBJECTS" || name == "TILES" || name == "REGIONS" || name == "STATES" || name == "SOUNDS")){
              var parent = ev_node.parent;
              tree.tree('selectNode', ev_node);
              if (parent.name == 'OBJECTS') {
                  showObjectModal(name);
              }
          }
          // add a new child
          else{
            addLobj(name.toLowerCase());

            tree.tree('openNode', ev_node);
          }
      }
  );

  tree.bind(
    'tree.click',
    function(event) {
        ev_node = event.node;
        name = ev_node.name;

        if(!(name == "OBJECTS" || name == "TILES" || name == "REGIONS" || name == "STATES")){
            var obj_category = ev_node.parent.name;
            var obj_name = name;

            if (obj_category == "OBJECTS") {
                if (Placer.isObjSelected() && Placer.getObjName() == obj_name) {
                    // object is being deselected
                    Placer.reset();
                } else {
                    // set canvas placer
                    Placer.setObj(obj_category, obj_name);
                }
            }
            else if (obj_category == "STATES") {
                canv_loadState(obj_name);
            }
        }
    }
  );

  tree.bind(
      'tree.move',
      function (event) {

      }
  )

  tree_reset();
});


// is a category or child selected
function tree_getCategorySelected(){
  var selected = tree.tree('getSelectedNode');

  // is something selected
  if(selected){
    var name = selected.name;

    // it's a category
    if(name == "OBJECTS" || name == "TILES" || name == "REGIONS" || name == "STATES"){
      return name;
    }
    // it's a child, find what category it's in
    else{
      // will need getLevel later
      return selected.parent.name;
    }
  }else{
    return false;
  }
}

function tree_isCategorySelected() {
    return (tree_getSelected() == tree_getCategorySelected());
}

function tree_getSelected(){
  var selected = tree.tree('getSelectedNode');

  if(selected){
    name = selected.name;
    return name;
  }else{
    return false;
  }
}

function tree_reset(){
	tree.tree('loadData',data);
}

        //save to json
        //$('#tree1').tree('toJson');

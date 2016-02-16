var data = [
  {label: 'OBJECTS'},

  {label: 'TILES'},

  {label: 'REGIONS'},

  {label: 'SOUNDS'},

  {label: 'STATES'}

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
            var child = ev_node.children[ev_node.children.length-1];
            var node_id = Math.round(Math.random()*1000000)

            // get name of new object
            var obj_name = name.toLowerCase().substring(0,name.length-1)+Object.keys(lobjects[name.toLowerCase()]).length;

            tree.tree(
                'appendNode',
                {
                    label: obj_name,
                    id: node_id
                },
                ev_node
            );
            tree.tree('openNode', ev_node);
            // add it to the library
            var data;
            if(name == "OBJECTS"){
              data = {
                id: node_id,
                depth: 0,
                sprites:{}
              }
            }

            addLobj(name.toLowerCase(),obj_name,data);
          }
      }
  );

  tree.bind(
    'tree.click',
    function(event) {
        // set canvas placer

    }
  );

  tree.bind(
      'tree.move',
      function (event) {

      }
  )
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

function tree_getSelected(){
  var selected = tree.tree('getSelectedNode');

  if(selected){
    name = selected.name;
    return name;
  }else{
    return false;
  }
}

        //save to json
        //$('#tree1').tree('toJson');

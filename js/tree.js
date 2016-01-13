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
    autoOpen: 0
  });

  tree.bind(
      'tree.dblclick',
      function(event) {
          ev_node = event.node;
          name = ev_node.name;
          // selected a child
          if(!(name == "OBJECTS" || name == "TILES" || name == "REGIONS" || name == "STATES")){
            showObjectModal(name);
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

});


        //save to json
        //$('#tree1').tree('toJson');

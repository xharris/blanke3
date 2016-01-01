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

            tree.tree(
                'appendNode',
                {
                    label: 'object0',
                    id: node_id
                },
                ev_node
            );
            tree.tree('openNode', ev_node);
          }
      }
  );

});


        //save to json
        //$('#tree1').tree('toJson');

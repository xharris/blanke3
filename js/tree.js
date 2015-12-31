var data = [
  {
    label: 'OBJECTS'
  },

  {
    label: 'TILES'
  },

  {
    label: 'REGIONS'
  },

  {
    label: 'STATES'
  }

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
          if(name == "OBJECTS" || name == "TILES" || name == "REGIONS" || name == "STATES"){
            showObjectModal();
          }
      }
  );

});


        //save to json
        //$('#tree1').tree('toJson');

angular.module('tp.map',[])

.controller('MapCtrl', function($scope, $http, $stateParams, Map, Item){
  // Makes properties on scope/map/item accessible within html.
  angular.extend($scope, Map, Item);

  $scope.scale =  14.5;
  $scope.userLoc;
  $scope.items;
  $scope.selectedItem = '';
  $scope.floorPlan;

  //Initializes the map by fetching retailer information.
  if ($stateParams.retailer) {
    var retailer = $stateParams.retailer;
    Map.fetch($stateParams.retailer)
      .then(function(data){
        $scope.data = data;
        Item.fetchItems($stateParams.retailer)
          .then(function(items){
            $scope.items = items;
            $scope.render();
          })
      })
  }

  $scope.render = function(){
    Map.drawFloorPlan($scope.data.floorPlan, $scope.scale, $scope.svg);
    Map.drawShelves($scope.data.shelves, $scope.scale, $scope.svg);
  }
})

// Used to render and update the svg map.
.directive('tpMap', function($window){

  // Defines linker function to be referenced in the directives return object.
  var linker = function(scope, element, attrs) {
    // Appends the SVG.
    scope.svg  = 
      d3.select('.map-main').append('svg')
        .attr('id', 'user-map')
        .attr('width', 30 * scope.scale + 'px' ) // [Warning]: 30 is a hardcoded width for this particular map, this is has to be changed to accomodate different maps
        .attr('height', 20 * scope.scale + 'px') // [Warning]: 20 is a hardcoded height for this particular map, this is has to be changed to accomodate different maps
        .on('click', addUserToMap); // [Note]: Uses d3 to handle this event, not angular
 
    // Defines the drag behavior.
    var drag = d3.behavior.drag()
      .on("drag", dragmove);

    // Used in dragmove, below.
    function updateUserLoc(userLoc){
      scope.userLoc = userLoc;
    };

    // Callback to be invoked on the 'drag' event.
    function dragmove(d) {
      var x = d3.event.x;
      var y = d3.event.y;
      d3.select(this).attr('cx',x).attr('cy', y);
      updateUserLoc({x:x, y:y});
    };

    // Adds user circle to the map. This is blue in the demo.
    function addUserToMap(event, scope, element){
      // Ignores the click event if it was suppressed.
      if (d3.event.defaultPrevented) return;
      
      // Ejects if there is already a user.
      if (d3.selectAll('.user')[0].length > 0) return;

      // Extracts the click location.
      var point = d3.mouse(this), 
      p = {x: point[0], y: point[1] };

      // Grabs SVG element from the parent element.
      var svg = d3.select('svg');
      
      // Appends a new point.
      svg.append('circle')
        .data([{x: p.x, y: p.y}])
        .attr('r', 10)
        .attr('cx', function(d){return d.x})
        .attr('cy', function(d){return d.y})
        .attr('class', 'user')
        .attr('fill','rgb(0, 119, 255)')
        .call(drag);

      updateUserLoc(p);
    };
  };

  return {
    restrict: 'AE',
    link: linker,
    templateUrl: '../app/map/map.html',
    scope: false,
    replace: true
  };

});

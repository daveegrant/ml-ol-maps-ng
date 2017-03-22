(function () {

  'use strict';

  angular.module('ml.ol-maps')
  .directive('mlOlSearchFacetsMap', MLOlSearchFacetsMapDirective)
  .controller('MLOlSearchFacetsMapController', MLOlSearchFacetsMapController);

  function MLOlSearchFacetsMapDirective() {
    return {
      restrict: 'E',
      scope: {
        baseMap: '=',
        zoom: '=',
        facets: '=',
        center: '=',

        // parent callbacks
        parentSingleClick: '&singleClick',
        parentBoundsChanged: '&boundsChanged'
      },
      templateUrl: '/templates/search-map.html',
      controller: 'MLOlSearchFacetsMapController',
      controllerAs: 'ctrl'
    };
  }

  MLOlSearchFacetsMapController.$inject = ['$scope', 'mlOlHelper'];
  function MLOlSearchFacetsMapController($scope, mlOlHelper) {
    var ctrl = this;
    ctrl.pointMap = {};
    ctrl.mapSettings = {};

    $scope.$watch('facets', function(data) {
      ctrl.processFacets($scope.facets);
    });

    $scope.$watch('baseMap', function(data) {
      if ($scope.baseMap) {
        ctrl.mapSettings.baseMap = $scope.baseMap;
      }
    });

    $scope.$on('openlayers.map.singleclick', function(event, data) {
      data.event.map.forEachFeatureAtPixel(data.event.pixel, function (feature, layer) {
        var featureUri = feature.get('uri');
        $scope.$apply(function() {
          if ($scope.parentSingleClick) {
            $scope.parentSingleClick({ 'featureUri': featureUri });
          }
        });
      });
    });

    $scope.$on('openlayers.map.moveend', function(event, data) {
      var extentData = mlOlHelper.convertExtent(data);
      $scope.$apply(function() {
        if ($scope.parentBoundsChanged) {
          $scope.parentBoundsChanged({ 'bounds': extentData});
        }
      });
    });

    ctrl.createMapNode = function(box, index, i) {
      var lng = (box.w + box.e) / 2;
      var lat = (box.s + box.n) / 2;

      return {
        type: 'Feature',
        id: 'feature' + index + i,
        properties: {
          name: '' + box.count,
          id: 'feature' + index + i,
          uri: box.uri,
          count: box.count,
          layer: i
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      };
    };

    ctrl.processFacets = function(facets) {
      var facetName, facet, box;
      var tmpPoints = [];
      var i = 0;
      var index = 0;

      // Return if the controller hasn't completed initialization
      if (!ctrl.createMapNode) {
        return;
      }

      // Add the new markers.
      for (facetName in facets) {
        facet = facets[facetName];
        if (facet && facet.boxes) {
          for (index=0; index < facet.boxes.length; index++) {
            box = facet.boxes[index];
            tmpPoints.push( ctrl.createMapNode(box, index, i) );
          }

          ++i;
        }
      }

      ctrl.mapSettings.ptLayer.source.geojson.object.features = tmpPoints;
    };

    // Define the map settings.
    var tmpMapSettings = mlOlHelper.buildMapSettings();
    tmpMapSettings.ptLayer.style = mlOlHelper.createClusterPointStyle;

    if ($scope.zoom) {
      tmpMapSettings.center.zoom = $scope.zoom;
    }

    if ($scope.center) {
      tmpMapSettings.center.lat = $scope.center.lat;
      tmpMapSettings.center.lon = $scope.center.lon;
    }

    if ($scope.baseMap) {
      tmpMapSettings.baseMap = $scope.baseMap;
    }

    if ($scope.pointLayer) {
      tmpMapSettings.ptLayer = $scope.pointLayer;
    }

    ctrl.mapSettings = tmpMapSettings;
    ctrl.processFacets($scope.facets);
  }

}());

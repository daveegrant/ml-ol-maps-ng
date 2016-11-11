(function () {

  'use strict';

  angular.module('ml.ol-maps')
  .directive('mlOlSearchFeatureMap', MLOlSearchFeatureMapDirective)
  .controller('MLOlSearchFeatureMapController', MLOlSearchFeatureMapController);

  function MLOlSearchFeatureMapDirective() {
    return {
      restrict: 'E',
      scope: {
        features: '=',
        baseMap: '=',
        zoom: '=',

        // parent callbacks
        parentSingleClick: '&singleClick',
        parentBoundsChanged: '&boundsChanged'
      },
      templateUrl: '/templates/search-map.html',
      controller: 'MLOlSearchFeatureMapController',
      controllerAs: 'ctrl'
    };
  }

  MLOlSearchFeatureMapController.$inject = ['$scope', 'mlOlHelper'];
  function MLOlSearchFeatureMapController($scope, mlOlHelper) {
    var ctrl = this;
    ctrl.geometries = [];
    ctrl.mapSettings = {};
    ctrl.pointMap = {};

    $scope.$watch('features', function(data) {
      ctrl.addMapNodes($scope.features);
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

    ctrl.addMapNodes = function(data) {
      var tmpPoints = [];
      var i = 0;
      var feature = null;
      if (data && Array.isArray(data)) {
        for (i = 0; i < data.length; i++) {
          if (data[i].geometry) {
            feature = data[i];

            if (feature.properties.id !== null) {
              feature.properties.id = 'feature' + 1;
            }

            tmpPoints.push(feature);
          }
        }
      }

      ctrl.mapSettings.ptLayer.source.geojson.object.features = tmpPoints.concat(ctrl.geometries);
    };

    // Define the map settings.
    var tmpMapSettings = mlOlHelper.buildMapSettings();
    tmpMapSettings.ptLayer.style = mlOlHelper.createPointStyle;

    if ($scope.zoom) {
      tmpMapSettings.center.zoom = $scope.zoom;
    }

    if ($scope.baseMap) {
      tmpMapSettings.baseMap = $scope.baseMap;
    }

    if ($scope.pointLayer) {
      tmpMapSettings.ptLayer = $scope.pointLayer;
    }

    ctrl.mapSettings = tmpMapSettings;
    ctrl.addMapNodes($scope.features);
  }

}());

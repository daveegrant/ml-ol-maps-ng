/* global console */
(function () {

  'use strict';

  angular.module('ml.ol-maps')
  .directive('mlOlDetailMap', MLOlDetailMapDirective)
  .controller('MLOlDetailMapController', MLOlDetailMapController);

  function MLOlDetailMapDirective() {
    return {
      restrict: 'E',
      scope: {
        features: '=',
        baseMap: '=',
        zoom: '=',
        geometry: '=',

        // parent callbacks
        parentSingleClick: '&singleClick'
      },
      templateUrl: '/templates/detail-map.html',
      controller: 'MLOlDetailMapController',
      controllerAs: 'ctrl'
    };
  }

  MLOlDetailMapController.$inject = ['$scope', 'mlOlHelper'];
  function MLOlDetailMapController($scope, mlOlHelper) {
    var ctrl = this;
    ctrl.pointMap = {};
    ctrl.geometries = [];

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

    ctrl.addLinkedNodes = function(results) {
      var tmpPoints = [];
      var i = 0;
      for (i = 0; i < results.nodes.length; i++) {
        if (results.nodes[i].location && results.nodes[i].location.latitude) {
          tmpPoints.push({
            type: 'Feature',
            id: results.nodes[i].id,
            properties: {
              name: results.nodes[i].label,
              id: results.nodes[i].id,
              uri: results.nodes[i].id
            },
            geometry: {
              type: 'Point',
              coordinates: [
                results.nodes[i].location.longitude,
                results.nodes[i].location.latitude
              ]
            }
          });

          ctrl.pointMap[results.nodes[i].id] = results.nodes[i].location;
        }
      }

      ctrl.mapSettings.ptLayer.source.geojson.object.features =
        ctrl.mapSettings.ptLayer.source.geojson.object.features.concat(tmpPoints);
    };

    ctrl.addLinks = function(results) {
      var tmpLines = [];
      var i = 0;
      var to = null;
      var from = null;

      for (i = 0; i < results.edges.length; i++) {
        from = null;
        to = null;

        if (results.edges[i].from && results.edges[i].to) {
          from = ctrl.pointMap[results.edges[i].from];
          to = ctrl.pointMap[results.edges[i].to];

          if (from && to) {
            tmpLines.push({
              type: 'Feature',
              id: results.edges[i].id,
              properties: {
                name: results.edges[i].label
              },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [
                    from.longitude,
                    from.latitude
                  ],
                  [
                    to.longitude,
                    to.latitude
                  ]
                ]
              }
            });
          }
        }
      }

      ctrl.mapSettings.lineLayer.source.geojson.object.features =
        ctrl.mapSettings.lineLayer.source.geojson.object.features.concat(tmpLines);
    };

    ctrl.centerMap = function() {
      if (ctrl.mapSettings.ptLayer.source.geojson.object.features.length > 0) {
        var firstFeature = ctrl.mapSettings.ptLayer.source.geojson.object.features[0];
        ctrl.mapSettings.center.lon = firstFeature.geometry.coordinates[0];
        ctrl.mapSettings.center.lat = firstFeature.geometry.coordinates[1];
      }
    };

    ctrl.addMapNodes = function(data) {
      var tmpPoints = [];
      var i = 0;
      if (data && Array.isArray(data)) {
        for (i = 0; i < data.length; i++) {
          if (data[i].geometry) {
            tmpPoints.push({
              type: 'Feature',
              id: data[i].id ? data[i].id : 'feature' + i,
              properties: {
                name: data[i].name,
                id: data[i].id ? data[i].id : 'feature' + i,
                uri: data[i].uri
              },
              geometry: data[i].geometry
            });
          }
        }
      }

      ctrl.mapSettings.ptLayer.source.geojson.object.features = tmpPoints.concat(ctrl.geometries);
      ctrl.centerMap();
    };

    ctrl.addGeometries = function(data) {
      var tmpPoints = [];
      var i = 0;
      if (Array.isArray(data) && data.length > 0) {
        if (Array.isArray(data[0])) {
          for (i = 0; i < data.length; i++) {
            if (Array.isArray(data[i])) {
              tmpPoints.push({
                type: 'Feature',
                id: 'geo' + i,
                properties: {
                  id: 'geo' + i
                },
                geometry: {
                  type: 'Point',
                  coordinates: data[i]
                }
              });
            }
            else {
              console.log('Unrecognized geometry format: ', data,
                '  Expected format is [lng, lat] or [[lng, lat], [lng, lat]]');
            }
          }
        }
        else if (data.length === 2 && !isNaN(data[0]) && !isNaN(data[1])) {
          tmpPoints.push({
            type: 'Feature',
            id: 'geo1',
            properties: {
              id: 'geo1'
            },
            geometry: {
              type: 'Point',
              coordinates: data
            }
          });
        }
        else {
          console.log('Unrecognized geometry format: ', data,
          '  Expected format is [lng, lat] or [[lng, lat], [lng, lat]]');
        }
      }
      else {
        console.log('Unrecognized geometry format: ', data,
          '  Expected format is [lng, lat] or [[lng, lat], [lng, lat]]');
      }

      ctrl.geometries = tmpPoints;

      ctrl.mapSettings.ptLayer.source.geojson.object.features =
        ctrl.mapSettings.ptLayer.source.geojson.object.features.concat(ctrl.geometries);

      ctrl.centerMap();
    };

    // Default layer for lines.
    var defaultLineLayer = {
      name: 'lineLayer',
      style: {
        fill: {
          color: 'rgba(255, 0, 255, 0.6)'
        },
        stroke: {
          color: 'blue',
          width: 3
        },
        label: '${name}'
      },
      source: {
        type: 'GeoJSON',
        geojson: {
          projection: 'EPSG:4326',
          object: {
            type: 'FeatureCollection',
            features: []
          }
        }
      }
    };

    // Define the map settings.
    var tmpMapSettings = mlOlHelper.buildMapSettings();
    tmpMapSettings.ptLayer.style = mlOlHelper.createPointStyle;
    tmpMapSettings.lineLayer = $scope.lineLayer ? $scope.lineLayer : defaultLineLayer;
    tmpMapSettings.center.zoom = $scope.zoom ? $scope.zoom : 4;

    if ($scope.baseMap) {
      tmpMapSettings.baseMap = $scope.baseMap;
    }

    if ($scope.pointLayer) {
      tmpMapSettings.ptLayer = $scope.pointLayer;
    }

    ctrl.mapSettings = tmpMapSettings;
    ctrl.addMapNodes($scope.features);
    if ($scope.geometry) {
      ctrl.addGeometries($scope.geometry);
    }
  }

}());

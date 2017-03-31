(function () {

  'use strict';

  angular.module('ml.ol-maps')
  .factory('mlOlHelper', MLOlHelper);

  MLOlHelper.$inject = [];

  function MLOlHelper() {

    // Create the marker color array.
    var markerColors = [
      '#f70010', // red
      '#e8790b', // orange
      '#2433d8', // blue
      '#bb0be8', // purple
      '#17e804'   // lime-green
    ];

    var createTextStyle = function(text, fColor) {
      var fillColor = '#f70010';
      if (fColor) {
        fillColor = fColor;
      }
      return new ol.style.Text({
        textAlign: 'center',
        textBaseline: 'top',
        font: '12px Arial',
        text: text,
        fill: new ol.style.Fill({color: fillColor}),
        stroke: new ol.style.Stroke({color: 'white', width: 3}),
        offsetX: 0,
        offsetY: 4,
        rotation: 0
      });
    };

    var createClusterTextStyle = function(text) {
      return new ol.style.Text({
        textAlign: 'center',
        textBaseline: 'middle',
        font: '14px Arial',
        text: text,
        fill: new ol.style.Fill({color: 'black'}),
        offsetX: 0,
        offsetY: 0,
        rotation: 0
      });
    };

    var createLineStyle = function(feature, resolution) {
      // var geometry = feature.getGeometry();
      var styles = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({color: 'black', width: 3}),
          text: createTextStyle(feature.get('name'), 'black')
        })
      ];

      geometry.forEachSegment(function(start, end) {
        var dx = end[0] - start[0];
        var dy = end[1] - start[1];
        var rotation = Math.atan2(dy, dx);
        // arrows
        styles.push(new ol.style.Style({
          geometry: new ol.geom.Point(end),
          image: new ol.style.Icon({
            src: 'images/arrow-black.png',
            anchor: [1.5, 0.5],
            rotateWithView: false,
            rotation: -rotation
          })
        }));
      });

      return styles;
    };

    var createPointStyle = function(feature, resolution) {
      var radius = 6;
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          fill: new ol.style.Fill({color: 'red'}),
          stroke: new ol.style.Stroke({color: 'black', width: 1})
        }),
        text: createTextStyle(feature.get('name'))
      });
    };

    var createClusterPointStyle = function(feature, resolution) {
      var radius = 10;
      var count = 0;
      var countLength = 0;
      var strokeWidth = 2;
      var lineDash = [5];
      var colorIdx = 0;
      if (feature.get('count')) {
        count = feature.get('count');
        countLength = count.toString().length;
        radius = 10 + (countLength > 1 ? (countLength - 1) * 5 : 0);
      }

      if (feature.get('layer')) {
        colorIdx = feature.get('layer') % 5;
      }

      if (count === 1) {
        radius = 5;
        strokeWidth = 1;
        lineDash = [];
      }

      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          fill: new ol.style.Fill({color: markerColors[colorIdx]}),
          stroke: new ol.style.Stroke({color: 'black', width: strokeWidth, lineDash: lineDash})
        }),
        text: (count > 1) ? createClusterTextStyle(''+ count) : createTextStyle('')
      });
    };

    var convertExtent = function(data) {
      var extentData = {};
      var mapSize = data.event.map.getSize();
      var extent = data.event.map.getView().calculateExtent(mapSize);
      extent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');

      extentData.west  = extent[0];
      extentData.south = extent[1];
      extentData.east  = extent[2];
      extentData.north = extent[3];

      // Adjust the west value when wrapping the world.
      while (extentData.west < -180) {
        extentData.west = extentData.west + 360;
      }

      // Adjust the east value when wrapping the world.
      while (extentData.east > 180) {
        extentData.east = extentData.east - 360;
      }

      return extentData;
    };

    var buildMapSettings = function() {
      var settings = {
        center: {
          lat: 0,
          lon: 0,
          zoom: 5
        },
        defaults: {
          interactions: {
            mouseWheelZoom: true
          },
          controls: {
            zoom: true,
            rotate: false,
            attribution: false
          },
          events: {
            map: ['singleclick', 'moveend']
          }
        },
        baseMap: {
          name: 'OpenStreetMap',
          source: {
              type: 'OSM'
          }
        },
        mousePosition: {
          projection: 'EPSG:4326',
          coordinateFormat: ol.coordinate.createStringXY(4)
        },
        ptLayer: {
          name: 'ptLayer',
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
        }
      };

      return settings;
    };

    return {
      createTextStyle: createTextStyle,
      createPointStyle: createPointStyle,
      createClusterPointStyle: createClusterPointStyle,
      createClusterTextStyle: createClusterTextStyle,
      createLineStyle: createLineStyle,
      convertExtent: convertExtent,
      buildMapSettings: buildMapSettings
    };
  }

}());

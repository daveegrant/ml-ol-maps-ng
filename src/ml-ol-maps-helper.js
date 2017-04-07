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
      '#17e804'  // lime-green
    ];

    // Map for user defined colors based on 'group' property.
    var groupColorMap = {};

    var createTextStyle = function(text, fColor, sColor, yOffset) {
      var fillColor = fColor || '#f70010';
      var strokeColor = sColor || 'white';
      var yOff = yOffset || 6;

      return new ol.style.Text({
        textAlign: 'center',
        textBaseline: 'top',
        font: '12px Arial',
        text: text,
        fill: new ol.style.Fill({color: fillColor}),
        stroke: new ol.style.Stroke({color: strokeColor, width: 1}),
        offsetX: 0,
        offsetY: yOff,
        rotation: 0
      });
    };

    var createTextCountStyle = function(count, fColor, yOffset, xOffset) {
      var fillColor = fColor || '#f70010';
      var yOff = yOffset || 6;
      var xOff = xOffset || 6;

      return new ol.style.Text({
        textAlign: 'center',
        textBaseline: 'middle',
        font: '8pt Arial',
        text: count.toString(),
        fill: new ol.style.Fill({color: fillColor}),
        offsetX: xOff,
        offsetY: yOff
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
      var geometry = feature.getGeometry();
      var styles = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({color: 'black', width: 3}),
          text: createTextStyle(feature.get('name'), 'black')
        })
      ];

      geometry.forEachSegment(function(start, end) {
        var canvas = document.createElement('canvas');
        var render = canvas.getContext('2d');
        var dx = end[0] - start[0];
        var dy = end[1] - start[1];
        var rotation = Math.atan2(dy, dx);

        render.strokeStyle = 'black';
        render.fillStyle = 'black';
        render.lineWidth = 3;
        render.beginPath();
        render.moveTo(0,0);
        render.lineTo(10,10);
        render.lineTo(0,20);
        render.stroke();

        // arrows
        styles.push(new ol.style.Style({
          geometry: new ol.geom.Point(end),
          image: new ol.style.Icon({
            img: canvas,
            imgSize: [canvas.width, canvas.height],
            anchor: [26, 10],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            rotateWithView: false,
            rotation: -rotation
          })
        }));
      });

      return styles;
    };

    var createPointStyle = function(feature, resolution) {
      var radius = 8;
      var fillColor = 'red';
      if (feature.get('group')) {
        var group = feature.get('group');
        if (group && groupColorMap[group]) {
          fillColor = groupColorMap[group];
        }
      }

      var styles = [
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({color: fillColor}),
            stroke: new ol.style.Stroke({color: 'black', width: 1})
          }),
          text: createTextStyle(feature.get('name'), fillColor)
        })
      ];

      return styles;
    };

    var createPointCountStyle = function(feature, resolution) {
      var radius = 16;
      var fillColor = 'red';
      var childCount = feature.get('count') || 0;
      var styles = [];

      if (feature.get('group')) {
        var group = feature.get('group');
        if (group && groupColorMap[group]) {
          fillColor = groupColorMap[group];
        }
      }

      styles.push(
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({color: fillColor}),
            stroke: new ol.style.Stroke({color: 'black', width: 1})
          }),
          text: createTextStyle(feature.get('name'), fillColor, null, radius)
        })
      );

      if (childCount > 0) {
        var cRadius = 10;
        var textColor = 'white';
        var canvas = document.createElement('canvas');
        var render = canvas.getContext('2d');

        if (childCount >= 100 && childCount < 1000) {
          cRadius = 12;
        }
        else if (childCount >= 1000 && childCount < 10000) {
          cRadius = 15;
        }
        else if (childCount >= 10000) {
          cRadius = 17;
        }

        render.strokeStyle = 'white';
        render.fillStyle = '#848484';
        render.lineWidth = 1;
        render.beginPath();
        render.arc(cRadius, cRadius, cRadius, 0, 2 * Math.PI);
        render.fill();
        render.stroke();

        styles.push(
          new ol.style.Style({
            image: new ol.style.Icon({
              img: canvas,
              imgSize: [canvas.width, canvas.height],
              anchor: [cRadius + 15, 20],
              anchorXUnits: 'pixels',
              anchorYUnits: 'pixels'
            }),
            text: createTextCountStyle(childCount, textColor, cRadius - 20, -15)
          })
        );
      }

      return styles;
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
        text: (count > 1) ? createClusterTextStyle(count.toString()) : createTextStyle('')
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
            mouseWheelZoom: true,
            doubleClickZoom: false
          },
          controls: {
            zoom: true,
            rotate: false,
            attribution: false
          },
          events: {
            map: ['singleclick', 'dblclick', 'moveend']
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

    var setGroupColor = function(group, color) {
      groupColorMap[group] = color;
    };

    return {
      createTextStyle: createTextStyle,
      createTextCountStyle: createTextCountStyle,
      createPointStyle: createPointStyle,
      createPointCountStyle: createPointCountStyle,
      createClusterPointStyle: createClusterPointStyle,
      createClusterTextStyle: createClusterTextStyle,
      createLineStyle: createLineStyle,
      convertExtent: convertExtent,
      buildMapSettings: buildMapSettings,
      setGroupColor: setGroupColor
    };
  }

}());

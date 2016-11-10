(function(module) {
try {
  module = angular.module('ml.ol-maps.tpls');
} catch (e) {
  module = angular.module('ml.ol-maps.tpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/templates/detail-map.html',
    '<div id="detailMap"><openlayers id="olDetailMap" class="map-detail" ol-center="ctrl.mapSettings.center" ol-defaults="ctrl.mapSettings.defaults" custom-layers="true"><ol-control name="mouseposition" ol-control-properties="ctrl.mapSettings.mousePosition"></ol-control><ol-layer ol-layer-properties="ctrl.mapSettings.baseMap"></ol-layer><ol-layer ol-layer-properties="ctrl.mapSettings.lineLayer"></ol-layer><ol-layer ol-layer-properties="ctrl.mapSettings.ptLayer"></ol-layer></openlayers></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ml.ol-maps.tpls');
} catch (e) {
  module = angular.module('ml.ol-maps.tpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/templates/search-map.html',
    '<div id="searchMap"><openlayers id="olSearchMap" class="map-search" ol-center="ctrl.mapSettings.center" ol-defaults="ctrl.mapSettings.defaults" custom-layers="true"><ol-control name="mouseposition" ol-control-properties="ctrl.mapSettings.mousePosition"></ol-control><ol-layer ol-layer-properties="ctrl.mapSettings.baseMap"></ol-layer><ol-layer ol-layer-properties="ctrl.mapSettings.ptLayer"></ol-layer></openlayers></div>');
}]);
})();

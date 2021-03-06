(function(module) {
try {
  module = angular.module('ml.ol-maps.tpls');
} catch (e) {
  module = angular.module('ml.ol-maps.tpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/templates/detail-map.html',
    '<div id="detailMap"><div class="detailMapTools" ng-show="enableLinks"><label><input type="checkbox" ng-model="ctrl.hideLinks" ng-change="ctrl.toggleHideLinks()"> Hide Links</label> <button type="button" class="btn btn-danger btn-sm pull-right" ng-click="ctrl.resetData()">Reset</button></div><div><div class="map-detail-metadata-container"><div class="panel panel-default map-detail-metadata" ng-show="ctrl.enablePropertiesView && ctrl.mapItemSelected"><div class="panel-heading">{{ ctrl.mapItemSelected.label }} <button type="button" class="fa fa-times pull-right close" ng-click="ctrl.closeMetadata()"></button></div><div class="panel-body"><ul class="list-group"><li class="list-group-item text-right" ng-repeat="(key, value) in ctrl.mapItemSelected"><span class="pull-left"><strong>{{key}}</strong></span> {{ value }}</li></ul></div></div></div><openlayers id="olDetailMap" class="map-detail" ol-center="ctrl.mapSettings.center" ol-defaults="ctrl.mapSettings.defaults" custom-layers="true"><ol-control name="mouseposition" ol-control-properties="ctrl.mapSettings.mousePosition"></ol-control><ol-layer ol-layer-properties="ctrl.mapSettings.baseMap"></ol-layer><ol-layer ng-show="!ctrl.hideLinks" ol-layer-properties="ctrl.mapSettings.lineLayer"></ol-layer><ol-layer ol-layer-properties="ctrl.mapSettings.ptLayer"></ol-layer></openlayers></div></div>');
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

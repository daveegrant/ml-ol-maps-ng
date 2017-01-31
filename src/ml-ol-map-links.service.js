(function () {

  'use strict';

  angular.module('ml.ol-maps')
  .provider('mapLinksService', MapLinksService);

  MapLinksService.$inject = [];
  function MapLinksService() {
    var api = '/v1/resources/map-links';
    this.setApi = function(url) {
      api = url;
    };

    this.$get = function($http) {
      var service = {
        search: search,
        expand: expand,
      };

      function search(id) {
        return $http.get(api+'?rs:subject=' + encodeURIComponent(id)
        )
        .then(
          function(response) {
            return response.data;
          }
        );
      }

      function expand(id) {
        return $http.get(
          api+'?rs:expand=true&rs:subject=' + encodeURIComponent(id)
        )
        .then(
          function (response) {
            return response.data;
          });
      }

      return service;
    };
  }

}());
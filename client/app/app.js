'use strict';

angular.module('modataApp', ['modataApp.constants', 'ngCookies', 'ngResource', 'ngSanitize',
  'btford.socket-io', 'ui.router', 'ui.bootstrap', 'chart.js', 'ngHandsontable'
])
  .config(function ($urlRouterProvider, $locationProvider, ChartJsProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
    ChartJsProvider.setOptions({ colors : [ '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
  });

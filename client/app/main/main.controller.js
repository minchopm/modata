'use strict';

(function () {

  class MainController {

    constructor($http, $scope, socket, $timeout) {
      this.$http = $http;
      this.socket = socket;
      this.awesomeThings = [];
      this.$scope = $scope;

      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('pid');
      });

      $scope.data = [[]];
      $scope.labels = [];
      $scope.options = {
        animation: {
          duration: 0
        },
        elements: {
          line: {
            borderWidth: 0.5
          },
          point: {
            radius: 0
          }
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: false
          }],
          yAxes: [{
            display: false
          }],
          gridLines: {
            display: false
          }
        },
        tooltips: {
          enabled: false
        }
      };
    }

    $onInit() {

      let self = this;
      var maximum = document.getElementById('container').clientWidth / 2 || 300;
      let $scope = this.$scope;
      let sortOrder;

      let deleted = [];

      function dynamicSort(order, property) {
        var sortOrder = order ? 1 : -1;
        return function (a, b) {
          var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
          return result * sortOrder;
        }
      }

      let formatPids = function (results) {
        let records;
        if (sortOrder && sortOrder.column && sortOrder.order !== undefined) {
          records = results.sort(dynamicSort(sortOrder.order, sortOrder.column));
        } else {
          records = results;
        }
        $scope.pidList = records.filter(function (obj) {
          return deleted.indexOf(obj.PID) === -1;
        });
        $scope.oldPids.push(results);
        return results;
      };

      $scope.getPidList = function () {
        if ($scope.search) {
          return $scope.pidList.filter(item=> {
            return item.imageName.toLowerCase().indexOf($scope.search.toLowerCase()) !== -1;
          })
        }
        return $scope.pidList;
      };
      let selectedPid = null;
      $scope.settings = {
        stretchH: 'all',
        sortIndicator: true,
        columnSorting: true,
        afterColumnSort: function (column, order) {
          let that = this;
          sortOrder = {
            column: that.colToProp(column),
            order
          };
        },
        renderer: function (instance, TD, row, col, prop, value, cellProperties) {
          TD.innerHTML = '';
          if (col < 5) {
            TD.innerHTML = value;
          } else {
            var $btn = $('<button class="btn btn-danger">Terminate</button>');

            $btn.on('mousedown', function (event) {
              deleted.push(value);
              if (instance.getSelected()) {
                instance.alter('remove_row', instance.getSelected()[0], instance.getSelected()[2] + 1 - instance.getSelected()[0], false, false);
              }
              $scope.pidList = $scope.pidList.filter(function (obj) {
                return deleted.indexOf(obj.PID) === -1;
              });

              // self.$http.delete('/api/pids/' + value);
              selectedPid = undefined;
            });
            $(TD).append($btn);
          }
        },
        multiSelect: false,
        currentRowClassName: 'currentRow',
        rowHeaders: true,
        afterSelection: function () {
          if ('PID' in $scope.pidList[arguments[0]]) {
            selectedPid = $scope.pidList[arguments[0]].PID;
            $scope.imageName = $scope.pidList[arguments[0]].imageName;
            $scope.data[0] = $scope.oldPids.map(item=> {
              return parseFloat(item.filter(list => {
                return list.PID === selectedPid;
              })[0].memUsage.replace(' K', ''));
            }).slice(Math.max($scope.oldPids.length - maximum, 1));
            $scope.labels = new Array(maximum).fill("");
          } else {

            $scope.data[0] = new Array(maximum).fill("");
            $scope.labels = new Array(maximum).fill("");
          }
        }
      };

      $scope.pidList = [];
      $scope.oldPids = [];

      $scope.pids = [];

      setTimeout(()=> {
        this.socket.syncUpdates('pid', $scope.pids, (e, item)=> {
          let formated = formatPids(item.info);
          if (selectedPid && selectedPid !== null) {
            $scope.data[0].push(parseFloat(formated.filter(list => {
              return list.PID === selectedPid;
            })[0].memUsage.replace(' K', '')));
            $scope.labels.push('');
          }
          while ($scope.data[0].length >= maximum) {
            $scope.labels = $scope.labels.slice(0);
            $scope.data[0] = $scope.data[0].slice(0);
          }
        });
      }, 1500);
    }
  }

  angular.module('modataApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController
    });
})();

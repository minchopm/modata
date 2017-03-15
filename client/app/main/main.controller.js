'use strict';

(function () {

  class MainController {

    constructor($http, $scope, socket, $timeout) {
      this.$http = $http;
      this.socket = socket;
      this.awesomeThings = [];
      this.$scope = $scope;

      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('thing');
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

      function dynamicSort(order, property) {
        var sortOrder = order ? 1 : -1;
        return function (a, b) {
          var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
          return result * sortOrder;
        }
      }

      let formatPids = function (stdout, old) {

        var lines = stdout.toString().split(/\r\n/);
        var strLen = lines[2].split(' ').map(item=> {
          return item.length;
        });
        let ImageNameStartIndex = 0;
        let ImageNameEndIndex = strLen[0];
        let PIDStartIndex = ImageNameEndIndex + 1;
        let PIDEndIndex = PIDStartIndex + strLen[1];

        let SessionNameStartIndex = PIDEndIndex + 1;
        let SessionNameEndIndex = SessionNameStartIndex + strLen[2];

        let SeesionStartIndex = SessionNameEndIndex + 1;
        let SeesionEndIndex = SeesionStartIndex + strLen[3];
        let MemUsageStartIndex = SeesionEndIndex + 1;
        let MemUsageEndIndex = MemUsageStartIndex + strLen[4];

        var results = [];

        lines.forEach(function (line, index) {
          if (index > 2 && line.length > 50) {
            results.push({
              imageName: line.substring(ImageNameStartIndex, ImageNameEndIndex).trimLeft().trimRight(),
              PID: line.substring(PIDStartIndex, PIDEndIndex).trimLeft().trimRight(),
              sessionName: line.substring(SessionNameStartIndex, SessionNameEndIndex).trimLeft().trimRight(),
              session: line.substring(SeesionStartIndex, SeesionEndIndex).trimLeft().trimRight(),
              memUsage: line.substring(MemUsageStartIndex, MemUsageEndIndex).trimLeft().trimRight(),
              button: line.substring(PIDStartIndex, PIDEndIndex).trimLeft().trimRight()
            });
          }
        });
        let records;
        if (!old) {
          if (sortOrder && sortOrder.column && sortOrder.order !== undefined) {
            records = results.sort(dynamicSort(sortOrder.order, sortOrder.column));
          } else {
            records = results;
          }

          $scope.pidList = $scope.search ? records.filter(item=> {
            return item.imageName.toLowerCase().indexOf($scope.search.toLowerCase()) !== -1;
          }) : records;
        }
        $scope.oldPids.push(results);
        return results;
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
              self.$http.delete('/api/pids/' + value);
              selectedPid = undefined;
            });
            $(TD).append($btn);
          }
        },
        currentRowClassName: 'currentRow',
        rowHeaders: true,
        afterSelection: function () {
          selectedPid = $scope.pidList[arguments[0]].PID;
          $scope.imageName = $scope.pidList[arguments[0]].imageName;
          $scope.data[0] = $scope.oldPids.map(item=> {
            return parseFloat(item.filter(list => {
              return list.PID === selectedPid;
            })[0].memUsage.replace(' K', ''));
          }).slice(Math.max($scope.oldPids.length - maximum, 1));
          $scope.labels = new Array(maximum).fill("");
        }
      };

      $scope.pidList = [];
      $scope.oldPids = [];

      $scope.pids = [];
      this.$http.get('/api/pids')
        .then(response => {
          $scope.pids = response.data;
          $scope.pids.map(item=> {
            formatPids(item.info, true);
          });

          formatPids($scope.pids[$scope.pids.length - 1].info);
          this.socket.syncUpdates('pid', $scope.pids, (e, item, arr)=> {
            let formated = formatPids(item.info);
            if (selectedPid && selectedPid !== null) {
              $scope.data[0].push(parseFloat(formated.filter(list => {
                return list.PID === selectedPid;
              })[0].memUsage.replace(' K', '')));
              $scope.labels.push('');
            }
            while ($scope.data[0].length >= maximum) {
              $scope.labels = $scope.labels.slice(1);
              $scope.data[0] = $scope.data[0].slice(1);
            }
          });
        });

    }


  }

  angular.module('modataApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController
    });
})();

define(['controllers/controllers', 'i18n!nls/labels'],
  function(controllers, labels) {
    'use strict';
    controllers.controller('SettingController', ['$scope', '$$log', 'lockerAPIService', '$location', 'UserService',
      function($scope, $$log, lockerAPIService, $location, UserService) {//, exif) {
        $$log.setCategory('TempCtrl');

        var model = {}, style = {};

        function initialize() {
          lockerAPIService.getGatewaysWithSensors(function(response) {
            if(lockerAPIService.isSuccessRequest(response)) {
              model.gateways = response.data;
            }
          });
          setScope();
        }

        function setScope() {
          $scope.model = model;
          $scope.style = style;

          $scope.testCamera = testCamera;
          $scope.logout = logout;
        }

        function showLoginPage() {
          var url = $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#/home';;
          location.href = url
        }


        function showPage() {
          lockerAPIService.checkToken(function (response) {
            if(lockerAPIService.isSuccessRequest(response) && response.data.hasToken) {
              initialize();
            } else {
              showLoginPage();
            }
          });
        }

        function testCamera() {
          var camera = findTargetSensor(model.gateways, "camera");
          var gatewayId = camera.owner;
          var sensorId = camera.id;

          lockerAPIService.snapPicture(gatewayId, sensorId, function(response) {
            if(lockerAPIService.isSuccessRequest(response)) {
              console.info("take picture!");
              $scope.model.testpicture = response.data.result.url;

            }
          });
        }

        function logout() {
          UserService.setUserId('');
          showLoginPage();
        }

        function test(a, v) {


        }


        function findTargetSensor(gateways, sensorType) {
          for(var i = 0, imax = gateways.length; i < imax; i++) {
            var gateway = gateways[i];
            for(var j = 0, jmax = gateway.sensors.length; j < jmax; j++) {
              if(gateway.sensors[j].type === sensorType) {
                return gateway.sensors[j];
              }
            }
          }

          throw "can not find " + sensorType + " sensor";
        }



        showPage();

      }
    ]);


  }
);

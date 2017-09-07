define(['controllers/controllers', 'i18n!nls/labels'],
  function (controllers, labels) {
    'use strict';
    controllers.controller('MyLockerCtrl', ['$scope', '$$log', 'lockerAPIService', '$location', 'UserService',
      function ($scope, $$log, lockerAPIService, $location, UserService) {//, exif) {

        $$log.setCategory('MyLockerCtrl');

        var model = {}, style = {};

        function initialize() {
          lockerAPIService.getGatewaysWithSensors(setConnectedCondition);
          setScope();
        }

        function setScope() {
          $scope.model = model;
          $scope.style = style;
          $scope.labels = labels;

          $scope.toggleRuleStatus = toggleRuleStatus;
        }

        function setRuleStatus(response) {
          if (lockerAPIService.isSuccessRequest(response)) {
            var rule;
            if(angular.isArray(response.data)) {
              for(var i = 0, max = response.data.length; i < max; i++) {
                if(!response.data[i].template) {
                  rule = response.data[i];
                  break;
                }
              }

              if(!rule) {
                createRule();
                return;
              }
            } else {
              rule = response.data;
            }

            model.rule = rule;
            style.activatedRule = "btn-" + rule.status;
          }
        }

        function createRule() {
          lockerAPIService.createMandatoryRule(model.motionSensor.owner, model.motionSensor.id, model.cameraSensor.owner, model.cameraSensor.id, function(response) {
            setRuleStatus(response);
          });

        }

        function setSensors() {
          try {
            model.motionSensor = findTargetSensor(model.gateways, "onoff");
            model.cameraSensor = findTargetSensor(model.gateways, "camera");
          } catch (e) {
            console.error(e);
          }
        }


        function setConnectedCondition(response) {
          var isConnected = false;
          //console.log(response.data)
          if (lockerAPIService.isSuccessRequest(response)) {
            model.gateways = response.data;

            isConnected = isOnlineStatus(model.gateways);
            setSensors();

            lockerAPIService.requestRule(setRuleStatus);
          }

          model.isAllConnected = isConnected;


        }

        function isOnlineStatus(targets) {
          var isConnected = true;
          for (var i = 0, max = targets.length; i < max; i++) {
            var target = targets[i];
            if (target.status.value === "on") {
              //@comment target이 게이트웨이이면 sensors 필드가 있음
              if (target.sensors) {
                if (!isOnlineStatus(target.sensors)) {
                  isConnected = false;
                  break
                }
              }
            } else {
              isConnected = false;
              break;
            }
          }

          return isConnected;
        }


        function findTargetSensor(gateways, sensorType) {
          for (var i = 0, imax = gateways.length; i < imax; i++) {
            var gateway = gateways[i];
            for (var j = 0, jmax = gateway.sensors.length; j < jmax; j++) {
              if (gateway.sensors[j].type === sensorType) {
                return gateway.sensors[j];
              }
            }
          }

          throw "can not find " + sensorType + " sensor";
        }

        function toggleRuleStatus() {
          var nextStatus = model.rule.status === "activated" ? "deactivated" : "activated";
          var ruleId = model.rule.id;
          lockerAPIService.toggleRuleStatus(ruleId, nextStatus, function (response) {
            setRuleStatus(response);
          });
        }

        function showLoginPage() {
          var url = $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#/home';;
          location.href = url
        }


        function checkToken() {
          lockerAPIService.checkToken(function (response) {
            if (response.data.hasToken) {
              initialize();
            } else {
              showLoginPage();
            }
          })
        }


        function showPage() {
          if (UserService.hasUserId()) {
            checkToken();
          } else {
            showLoginPage();
          }
        }

        showPage();

      }
    ]);

  }
);

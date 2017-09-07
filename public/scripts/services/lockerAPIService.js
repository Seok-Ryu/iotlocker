define(['services/services'],
  function(services) {
    'use strict';
    services.factory('lockerAPIService', ['$http', 'UserService', function($http, UserService) {
      var baseUrl = '/api/user/123/card';
      var header = {
        'Content-Type':'application/json'
      };


      function requestToServer(_url, method, callback, param) {
        //console.log(param);
        $http({
          method: method,
          url : _url,
          data : param || {},
          headers: header
        }).success(function(response) {
          //console.log("success");
        }).error(function (responss) {
          console.log('error')
        }).then(function (response) {
          //console.log('complete');
          callback(response);
        });
      }

      function isSuccessRequest(response) {
        return response.status === 200;
      }

      function getRule(callback) {
        requestToServer('apis/v1/rules', 'get', function(response) {
          callback(response);
        });
      }


      /*function getTag(callback) {
        requestToServer('apis/v1/tags/1?embed=sensors&sensors[embed]=series&sensors[embed]=status', 'get', function(response) {
          callback(response);
        });
      }

      function getGateways(callback) {
        requestToServer('apis/v1/gateways?&embed=status', 'get', function(response) {
          callback(response);
        });
      }*/

      function getGatewaysWithSensors(callback) {
        requestToServer('apis/v1/gateways?embed=status&&embed=sensors&sensors[embed]=series&sensors[embed]=status', 'get', function(response) {
          callback(response);
        });
      }

      /**
       *
       * @param value[boolean]
       */
      function toggleRuleStatus(ruleId, nextStatus, callback) {
        //var nextStatus = status ? "deactivated" : "activated";
        var param = {"status" : nextStatus};
        requestToServer('apis/v1/rules/' + ruleId, 'put', function (response) {
          //setRuleStatus(response);
          callback(response);
        }, param);
      }

      function getAllowPageURL(callback) {
        requestToServer('apis/v1/allowPageURL', 'get', function (response) {
          callback(response);
        });
      }

      function getAccessToken(token, callback) {
        var param = {"code" : token};
        requestToServer('apis/v1/oauth2/token', 'post', function (response) {
          callback(response);
        }, param);
      }

      function checkToken(callback) {
        header.userId = UserService.getUserId();
        requestToServer('apis/v1/checkToken', 'get', function (response) {
          callback(response);
        });
      }

      function snapPicture(gatewayId, cameraSensorId, callback) {
        var param = {
          id : gatewayId,
          act : "controlActuator",
          params : {
            id : cameraSensorId,
            cmd : "snapPicture",
            options:{}
          }
        };

        requestToServer('apis/v1/controlActuator', 'post', function (response) {
          callback(response);
        }, param)
      }

      function createMandatoryRule(buttonGatewayId, buttonId, cameraGatewayId, cameraId, callback) {
        var param = {'buttonGatewayId' : buttonGatewayId, 'buttonId': buttonId, 'cameraGatewayId' : cameraGatewayId, 'cameraId' : cameraId};
        requestToServer('apis/v1/makeDefaultRule', 'post', function (response) {
          callback(response);
        }, param);

      }


      return {
        "requestRule" : getRule,
        'isSuccessRequest' : isSuccessRequest,
        'toggleRuleStatus' : toggleRuleStatus,
        'getAllowPageURL' : getAllowPageURL,
        'getAccessToken' : getAccessToken,
        'checkToken' : checkToken,
        'getGatewaysWithSensors' : getGatewaysWithSensors,
        'snapPicture' : snapPicture,
        'createMandatoryRule' : createMandatoryRule
      };
    }]);
  }
);

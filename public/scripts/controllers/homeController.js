define(['controllers/controllers'],
  function (controllers) {
    'use strict';
    controllers.controller('HomeCtrl', ['$scope', '$$log', 'lockerAPIService', '$location', 'UserService',
      function ($scope, $$log, lockerAPIService, $location, UserService) {

        $$log.setCategory('HomeCtrl');

        const fieldName = "?code=";
        var url = $location.absUrl();

        function showPage() {
          if (UserService.hasUserId()) {
            lockerAPIService.checkToken(function(response) {
              if (lockerAPIService.isSuccessRequest(response) && response.data.hasToken) {
                showServicePage();
              } else {
                UserService.setUserId("");
                showLoginPage();
              }
            });
          } else {
            if(hasCodeInURL()) {
              var code = getAccessCode();
              if(code && code.length > 0) {
                getAccessToken(code);
              }
            } else {
              showLoginPage();
            }
          }
        }

        function showLoginPage() {
          $scope.isShowLogin = true;
        }

        function showServicePage() {
          $scope.isShowLogin = false;

          var url = $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#/mylocker';;
          location.href = url
        }

        function hasCodeInURL() {
          return url.includes(fieldName);
        }

        function getAccessCode() {
          var startIndex = url.indexOf(fieldName) + fieldName.length;
          var lastIndex = url.indexOf('#' + $location.path());
          var code = url.substring(startIndex, lastIndex);
          return code;
        }

        function getAccessToken(code) {
          lockerAPIService.getAccessToken(code, function (response) {
            if (lockerAPIService.isSuccessRequest(response) && response.data.hasToken) {
              UserService.setUserId(response.data.userId);
              showServicePage();
            }
          })
        }

        showPage();
        $scope.clickLogin = function () {
          lockerAPIService.getAllowPageURL(function (response) {
            location.href = response.data;//'http://www.naver.com';
          });

        }
      }
    ]);
  }
);

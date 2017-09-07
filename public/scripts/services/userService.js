define(['services/services'],
  function(services) {
    'use strict';
    services.factory('UserService', [ function() {
      var userId;

      function setUserId(_userId) {
        console.log("setUserId", userId);;
        sessionStorage.safelockerUserId = _userId;
        userId = _userId;
      }

      function getUserId() {
        if(!userId) {
          userId = sessionStorage.safelockerUserId;
        }
        return userId;
      }

      function hasUserId() {
        var userId = getUserId();
        return userId && userId.length > 0;
      }



      return {
        'setUserId' : setUserId,
        'getUserId' : getUserId,
        'hasUserId' : hasUserId

      }
    }]);
  }
);

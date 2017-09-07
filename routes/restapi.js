var express = require('express');
var router = express.Router();
var https = require('https');
var request = require('request');

var apiURL = 'https://api.testrs.thingbine.com';
var config = {
  'Content-Type': 'application/json'
};

var clientId = "id";
var clientSecret = "pwd";
var redirectURI = "http://127.0.0.1:3000/";

var header = {
  'Content-Type': 'application/json'
  //,'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIyIiwiY2xpZW50SWQiOiJhcGl0ZXN0MiIsImlhdCI6MTQ1NzA3NjQ0NCwiZXhwIjoxNDU4MzcyNDQ0fQ.ZohBKvJGx-ozoxbuK9MbdpO_291IkNH6y18pNoOVIaI'
};

var testDB = {};

function writeToken(body) {
  /*if(testDB[body.userId]) {
   console.log(testDB[body.userId]);
   } else {
   testDB[body.userId] = body;
   }*/
  testDB[body.userId] = body;
  //console.log(testDB)
}

function setToken(userId) {
  if (userId && testDB[userId]) {
    var user = testDB[userId];
    header.Authorization = user.token_type + ' ' + user.access_token;
  } else {
    header.Authorization = '';
  }
}

function requestData(req, res, next) {
  setToken(req.headers.userid);
  //console.log(req.method)
  var opt = {
    uri: apiURL + req.url,
    //path: '/v1/rules/3'
    method: req.method,
    headers: header,
    strictSSL: false
  };

  if (req.method === 'PUT' || req.method === 'POST') {
    opt.json = req.body;
  }

  //console.log(opt)
  request(opt, function (error, response, body) {
    if (response) {
      console.log('response', response.statusCode);
      if (response.statusCode === 200 && body && body.access_token) {
        writeToken(body);
        res.send({hasToken: true, userId: body.userId});
      } else if (req.url === '/v1/checkToken') {
        if (response.statusCode === 200) {
          var hour = 1 * 60 * 60 * 1000;
          var json = JSON.parse(body);
          if (hour < json.remainTime) {
            res.send({hasToken: true});
          } else {
            res.send({hasToken: false, userId: ""});
          }
        } else {
          res.send({hasToken: false, userId: ""});
        }
      } else {
        res.send(body);
      }
    } else {
      res.send(error);
    }

  });
}

//function filter
router.post('/v1/makeDefaultRule', function (req, res, next) {
  if (req.body && req.body.buttonId) {
    var param = {
      trigger: {
        agent: "sensorValue",
        type: 'onoff',
        filter: {
          gateway: "*",
          op: ['C', "U"],
          sensor: [req.body.buttonId],
          type: ['series']
        },
        method: {
          id: 'changed',
          name: '변경',
          changed: {
            from: '0',
            to: '1',
            target: {
              id: req.body.buttonGatewayId,
              type: 'gateway',
              sensors: [req.body.buttonId]
            }
          }
        }
      },
      conditions: [],
      desc: "Something moved in the locker",
      name: "Motion detected!!",
      severity: "warning",
      status: "activated",
      timezone: "+9.00",
      action: {
        agent: "actuator",
        type: "camera",
        method: {
          id: "camera",
          cameara: {
            notificationOption: "Failure",
            command: {
              cmd: "snapPicture"
            },
            target: {
              id: req.body.cameraGatewayId,
              type: "gateway",
              sensors: [req.body.cameraId]
            }
          }

        }
      }
    };
    req.body = param;
    req.url = '/v1/rules';
    requestData(req, res, next);
  } else {
    //error code return
  }
});

router.all('/v1/rules*', function (req, res, next) {
  //TODO
  //1. 룰가져옴
  //2. 템플릿을 제외
  //3. 남은 갯수확인
  //4. 갯수가 0이면 룰을 만든다
  //5. 결과를 리턴
  requestData(req, res, next);
});


router.all('/v1/tags/*', function (req, res, next) {
  //console.log("====")
  //console.log(req.method);
  requestData(req, res, next);
});

router.all('/v1/gateways*', function (req, res, next) {
  //console.log("====")
  //console.log(req.method);
  requestData(req, res, next);
});

router.all('/v1/allowPageURL', function (req, res, next) {
  res.send(apiURL + "/v1/oauth2/authorize?response_type=code&client_id=" + clientId + "&redirect_uri=" + redirectURI);
});

router.all('/v1/checkToken', function (req, res, next) {
  //www.testrs.thingbine.com/api/checkToken
  var user = testDB[req.headers.userid];
  //console.log("has token", user);
  if (user) {
    //req.url = '/v1/users/me';
    //req.method = 'get';
    console.log("====here");;
    requestData(req, res, next);
  } else {
    res.send({hasToken: false, userId: ""});
  }
});

router.post('/v1/oauth2/token', function (req, res, next) {
  req.body.client_id = clientId;
  req.body.client_secret = clientSecret;
  req.body.redirect_uri = redirectURI;
  req.body.grant_type = 'authorization_code';
//console.log("----")
  requestData(req, res, next);
  //res.send(apiURL + "/v1/oauth2/authorize?response_type=code&client_id=" + clientId + "&redirect_uri=" + redirectURI);
});

router.all('/v1/controlActuator', function (req, res, next) {
  requestData(req, res, next);
});


module.exports = router;
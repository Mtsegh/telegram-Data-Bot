var axios = require('axios');

var config = {
    method: 'get',
  maxBodyLength: Infinity,
    url: 'https://thechosendata.com/api/user/',
    headers: { 
        'Authorization': 'Token 66f2e5c39ac8640f13cd888f161385b12f7e5e92', 
        'Content-Type': 'application/json'
    }
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
ggggggggggggggggggggggggggggggg


var axios = require('axios');
var data = '{"network":network_id,\r\n"mobile_number": "09095263835",\r\n"plan": plan_id,\r\n"Ported_number":true\r\n}';

var config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://thechosendata.com/api/data/',
  headers: { 
    'Authorization': 'Token 66f2e5c39ac8640f13cd888f161385b12f7e5e92', 
    'Content-Type': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
ggggggggggggggggggggggggggggggg


var axios = require('axios');

var config = {
    method: 'get',
  maxBodyLength: Infinity,
    url: 'https://thechosendata.com/api/data/',
    headers: { }
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
ggggggggggggggggggggggggggggggg


var axios = require('axios');

var config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://thechosendata.com/api/data/58',
  headers: { }
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
ggggggggggggggggggggggggggggggg



var data = '{"network":network_id,\r\n"amount":amount,\r\n"mobile_number":phone,\r\n"Ported_number":true\r\n"airtime_type":"VTU"\r\n\r\n}';

var config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://thechosendata.com/api/topup/',
  headers: { 
    'Authorization': 'Token 66f2e5c39ac8640f13cd888f161385b12f7e5e92', 
    'Content-Type': 'application/json'
  },
  data : data
};

            axios(config)
            .then(function (response) {
              console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
              console.log(error);
            });


var axios = require('axios');

var config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://thechosendata.com/api/data/id',
  headers: { 
    'Authorization': 'Token 66f2e5c39ac8640f13cd888f161385b12f7e5e92', 
    'Content-Type': 'application/json'
  }
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
ggggggggggggggggggggggggggggggg


var axios = require('axios');
var data = '{"exam_name": "exam_name", // WAEC or NECO\r\n"quantity" : "quantity" // 1,2 or 5\r\n}';

var config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://thechosendata.com/api/epin/',
  headers: { },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});
ggggggggggggggggggggggggggggggg

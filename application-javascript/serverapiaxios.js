const axios = require('axios');

axios.get('http://54.177.41.63:80/TestWalletUser')
  .then(function (response) {
    // handle success
    response = 'Inside axios function'
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });

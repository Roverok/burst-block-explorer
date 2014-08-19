var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/:blkid', function(clientReq, clientRes) {
    request.post(
        {
            url:BurstConfig.walletUrl,
            form: {
                requestType:'getBlock',
                block:clientReq.params['blkid']
            }
        },
        function(error, res, body){
            var respond = {
                status : true,
                message : null
            };
            if (!error && res.statusCode == 200) {
                respond.message = JSON.parse(body);
                respond.message.genesisTimestamp = BurstConfig.genesisBlockTimestamp;
            }
            else {
                respond.status  = false;
                respond.message = 'wallet error, '+res.statusCode;
            }
            clientRes.send(JSON.stringify(respond));
        }
    );
});

module.exports = router;

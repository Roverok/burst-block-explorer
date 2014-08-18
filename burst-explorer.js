#!/usr/bin/env node
var express         = require('express');
var path            = require('path');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var request         = require('request');
var jsonFormat      = require('prettyjson');

var account         = require('./server/account');
var transaction     = require('./server/transaction');
var block           = require('./server/block');
var index           = require('./server/index');
BurstConfig         = require('./burst-config');

var app = express();

app.use(logger('dev'));
app.use(cookieParser());

app.use('/api/acc', account);
app.use('/api/tx', transaction);
app.use('/api/blk', block);
app.use(express.static(path.join(__dirname, 'client')));
app.use('/',index);
app.use('/acc/*',index);
app.use('/tx/*',index);
app.use('/blk/*',index);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.message);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});

app.set('port', process.env.PORT || BurstConfig.httpPort);

//check wallet availability
request.post( {
        url:BurstConfig.walletUrl,
        form: { requestType:'getConstants' }
    },
    function(error, res, body){
        if (!error && res.statusCode == 200) {
            BurstConfig.walletConstant = JSON.parse(body);

            request.post( {
                    url:BurstConfig.walletUrl,
                    form: { requestType:'getTime' }
                },
                function(error2, res2, body2){
                    var currentTime = new Date().getTime();
                    var blockTimestamp = JSON.parse(body2);
                    BurstConfig.genesisBlockTimestamp = currentTime - parseInt(blockTimestamp.time);
                    console.log("genesis-block blocktime "+blockTimestamp.time);

                    app.listen(app.get('port'), function() {
                        console.log('HTTP server listening on port ' + app.get('port'));
                    });

                    console.log(jsonFormat.render(BurstConfig.walletConstant));
                    console.log('current timestamp '+currentTime);
                    console.log("genesis-block timestamp "+BurstConfig.genesisBlockTimestamp);
                }
            );
        }
    }
);

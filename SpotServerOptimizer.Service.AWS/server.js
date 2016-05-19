"use strict";
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
var optimizeSpotsRunner = require('./routes/optimizeSpots');
app.use('/optimizeSpots', optimizeSpotsRunner);
app.use(function (req, res, next) {
    res.status(404).send('The api you are looking for was not found, check documentation.');
});
var ac = require('./Scripts/typings/configurations/awsConfigurator');
var configurator = new ac.Configuration.AWSGlobalConfig();
configurator.setGlobalConfig();
var server = app.listen(process.env.PORT || 1337, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("app listening at http://%s:%s", host, port);
});
//# sourceMappingURL=server.js.map
"use strict";
var express = require('express');
var router = express.Router();
var oe = require('../Scripts/typings/errors/SpotOptimizationError');
var se = require('../Scripts/typings/runtime/hostedResponseSender');
var run = require('../Scripts/typings/core/optimizeCoordinator');
router.post('/', function (rq, rs, next) {
    var request = rq.body;
    try {
        var sender = new se.SpotRuntime.HostedResponseSender(rs);
        var coordinator = new run.SpotOptimization.OptimizeCoordinator();
        return coordinator.run(request, sender);
    }
    catch (ex) {
        if (ex instanceof oe.SpotOptimization.SpotOptimizationError) {
            var oError = ex;
            return rs.status(500).send(JSON.stringify(oError.appError));
        }
        throw ex;
    }
});
module.exports = router;
//# sourceMappingURL=optimizeSpots.js.map
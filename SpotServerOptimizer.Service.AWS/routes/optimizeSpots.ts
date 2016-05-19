var express = require('express');
var router = express.Router();

import * as r from '../Scripts/typings/contracts/optimizeRq';
import * as oe from '../Scripts/typings/errors/SpotOptimizationError';
import * as se from '../Scripts/typings/runtime/hostedResponseSender';
import * as run from '../Scripts/typings/core/optimizeCoordinator';

router.post('/', function (rq, rs, next) {
        var request = rq.body as r.Contracts.OptimizeRq;

        try {
            var sender = new se.SpotRuntime.HostedResponseSender(rs);

            var coordinator = new run.SpotOptimization.OptimizeCoordinator();

            return coordinator.run(request, sender);
        }
        catch (ex) {
            if (ex instanceof oe.SpotOptimization.SpotOptimizationError) {
                var oError = ex as oe.SpotOptimization.SpotOptimizationError;
                return rs.status(500).send(JSON.stringify(oError.appError));
            }
            throw ex;
        }
});

module.exports = router;
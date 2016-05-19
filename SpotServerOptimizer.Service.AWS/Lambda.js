"use strict";
var lrs = require('./Scripts/typings/runtime/lambdaResponseSender');
var run = require('./Scripts/typings/core/optimizeCoordinator');
exports.handler = function (event, context, callback) {
    try {
        //console.log(JSON.stringify(event));
        var request = event;
        var coordinator = new run.SpotOptimization.OptimizeCoordinator();
        coordinator.run(request, new lrs.SpotRuntime.LambdaResponseSender(callback));
    }
    catch (e) {
        callback(e.message);
    }
};
//# sourceMappingURL=Lambda.js.map
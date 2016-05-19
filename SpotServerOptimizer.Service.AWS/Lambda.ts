import * as lrs from './Scripts/typings/runtime/lambdaResponseSender';
import * as run from './Scripts/typings/core/optimizeCoordinator';
import * as r from './Scripts/typings/contracts/optimizeRq';

exports.handler = function (event, context, callback) {
    try {
        //console.log(JSON.stringify(event));
        var request = event as r.Contracts.OptimizeRq;

        var coordinator = new run.SpotOptimization.OptimizeCoordinator();

        coordinator.run(request, new lrs.SpotRuntime.LambdaResponseSender(callback));
    }
    catch (e) {
        callback(e.message);
    }
}
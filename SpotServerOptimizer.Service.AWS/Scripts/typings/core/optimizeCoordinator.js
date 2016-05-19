"use strict";
var v = require('./requestValidator');
var e = require('../contracts/error');
var oe = require('../errors/SpotOptimizationError');
var sf = require('./SpotOptimizerFactory');
var su = require('./ScheduleUpdater');
var SpotOptimization;
(function (SpotOptimization) {
    var OptimizeCoordinator = (function () {
        function OptimizeCoordinator() {
        }
        OptimizeCoordinator.prototype.run = function (rq, sender) {
            var validator = new v.Validation.OptimizeRqValidator();
            var vResult = validator.validate(rq);
            if (!vResult.isValid()) {
                var errorFactory = new e.Contracts.ErrorFactory();
                return sender.send(400, JSON.stringify(errorFactory.createValidationError(vResult.errors)));
            }
            try {
                var optFactory = new sf.SpotOptimization.SpotOptimizationFactory();
                var optimizer = optFactory.createOptimizer(rq.scalesOn);
                optimizer.optimize(rq, function (resp, error) {
                    if (error) {
                        return sender.send(500, JSON.stringify(error));
                    }
                    var scheduleUpdater = new su.SpotOptimization.ScheduleUpdater();
                    scheduleUpdater.updateScheduleForOptimizedSpot(rq, resp.newSpotSchedule, function (e) {
                        if (e) {
                            return sender.send(500, JSON.stringify(e));
                        }
                        return sender.send(200, JSON.stringify(resp));
                    });
                });
            }
            catch (ex) {
                if (ex instanceof oe.SpotOptimization.SpotOptimizationError) {
                    var oError = ex;
                    return sender.send(500, JSON.stringify(oError.appError));
                }
                throw ex;
            }
        };
        return OptimizeCoordinator;
    }());
    SpotOptimization.OptimizeCoordinator = OptimizeCoordinator;
})(SpotOptimization = exports.SpotOptimization || (exports.SpotOptimization = {}));
//# sourceMappingURL=optimizeCoordinator.js.map
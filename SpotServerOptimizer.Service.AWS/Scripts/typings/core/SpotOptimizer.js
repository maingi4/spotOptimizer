"use strict";
var rs = require('../contracts/optimizeRs');
var ex = require('../errors/SpotOptimizationError');
var ce = require('../contracts/error');
var as = require('../aws/autoScaleConnector');
var SpotOptimization;
(function (SpotOptimization) {
    var CPUSpotOptimizer = (function () {
        function CPUSpotOptimizer() {
        }
        CPUSpotOptimizer.prototype.optimize = function (rq, callback) {
            try {
                if (callback) {
                    var autoScaleConnector = new as.AWS.autoScaleConnector(rq.onDemandAutoScaleGroup, rq.region, rq.awsAccessKeyId, rq.awsSecretAccessKey);
                    autoScaleConnector.getCPUMetricSchedule(rq.numberOfDaysBackToConsider, rq.scalesOn.cpu.scalesWhenGreaterThanThresholdForSecs, function (history, e) {
                        if (e) {
                            callback(null, e);
                            return;
                        }
                        var resp = new rs.Contracts.OptimizeRs();
                        resp.schedule = history;
                        callback(resp, null);
                        return;
                    });
                }
            }
            catch (e) {
                var errorFactory = new ce.Contracts.ErrorFactory();
                throw new ex.SpotOptimization.SpotOptimizationError(errorFactory.createOptimizationUnknownError([e.message]));
            }
        };
        return CPUSpotOptimizer;
    }());
    SpotOptimization.CPUSpotOptimizer = CPUSpotOptimizer;
})(SpotOptimization = exports.SpotOptimization || (exports.SpotOptimization = {}));
//# sourceMappingURL=SpotOptimizer.js.map
"use strict";
var o = require('./CPUSpotOptimizer');
var oe = require('../errors/SpotOptimizationError');
var e = require('../contracts/error');
var SpotOptimization;
(function (SpotOptimization) {
    var SpotOptimizationFactory = (function () {
        function SpotOptimizationFactory() {
        }
        SpotOptimizationFactory.prototype.createOptimizer = function (scalesOn) {
            if (scalesOn.cpu)
                return new o.SpotOptimization.CPUSpotOptimizer();
            var errFactory = new e.Contracts.ErrorFactory();
            var err = errFactory.createNotImplementedError(["Currently only scaling on CPU is supported by the system, we are working hard to support the other strategies."]);
            throw new oe.SpotOptimization.SpotOptimizationError(err);
        };
        return SpotOptimizationFactory;
    }());
    SpotOptimization.SpotOptimizationFactory = SpotOptimizationFactory;
})(SpotOptimization = exports.SpotOptimization || (exports.SpotOptimization = {}));
//# sourceMappingURL=SpotOptimizerFactory.js.map
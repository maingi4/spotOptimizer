"use strict";
var SpotOptimization;
(function (SpotOptimization) {
    var SpotOptimizationError = (function () {
        function SpotOptimizationError(appError) {
            this.appError = appError;
            this.message = "optimization error, see the appError property for more details.";
            this.name = "Spot Optimization Error";
        }
        return SpotOptimizationError;
    }());
    SpotOptimization.SpotOptimizationError = SpotOptimizationError;
})(SpotOptimization = exports.SpotOptimization || (exports.SpotOptimization = {}));
//# sourceMappingURL=SpotOptimizationError.js.map
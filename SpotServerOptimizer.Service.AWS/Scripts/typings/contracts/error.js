"use strict";
var Contracts;
(function (Contracts) {
    var Error = (function () {
        function Error(reason, code, messages) {
            this.reason = reason;
            this.code = code;
            this.messages = messages;
        }
        return Error;
    }());
    Contracts.Error = Error;
    var ErrorFactory = (function () {
        function ErrorFactory() {
        }
        ErrorFactory.prototype.createValidationError = function (messages) {
            return new Error("validation failure", 1, messages);
        };
        ErrorFactory.prototype.createOptimizationUnknownError = function (messages) {
            return new Error("An unknown error occurred while optimizing spot instances, check messages for more details.", 2, messages);
        };
        ErrorFactory.prototype.createOptimizationAWSError = function (messages) {
            return new Error("An aws side error occurred while optimizing spot instances, check messages for more details.", 3, messages);
        };
        ErrorFactory.prototype.createMetricNotFoundError = function (messages) {
            return new Error("Desired metrics were not found which are needed to determine optimizations, check messages for more details.", 4, messages);
        };
        ErrorFactory.prototype.createMetricNotEnoughDataError = function (messages) {
            return new Error("Desired metrics did not have enough data needed to determine optimizations, check messages for more details.", 5, messages);
        };
        ErrorFactory.prototype.createNotImplementedError = function (messages) {
            return new Error("The functionality is not currently implemented, check messages for more details.", 5, messages);
        };
        return ErrorFactory;
    }());
    Contracts.ErrorFactory = ErrorFactory;
})(Contracts = exports.Contracts || (exports.Contracts = {}));
//# sourceMappingURL=error.js.map
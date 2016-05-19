"use strict";
var SpotRuntime;
(function (SpotRuntime) {
    var LambdaResponseSender = (function () {
        function LambdaResponseSender(callback) {
            this.callback = callback;
        }
        LambdaResponseSender.prototype.send = function (httpStatusCode, payload) {
            //console.log(payload);
            if (httpStatusCode == 200)
                this.callback(null, payload);
            this.callback(this.wrapErrorPayload(httpStatusCode, payload));
        };
        LambdaResponseSender.prototype.wrapErrorPayload = function (httpStatusCode, payload) {
            return JSON.stringify(new LambdaErrorWrap(httpStatusCode, payload));
        };
        return LambdaResponseSender;
    }());
    SpotRuntime.LambdaResponseSender = LambdaResponseSender;
    var LambdaErrorWrap = (function () {
        function LambdaErrorWrap(httpStatusCode, payload) {
            this.httpStatusCode = httpStatusCode;
            this.payload = payload;
        }
        return LambdaErrorWrap;
    }());
})(SpotRuntime = exports.SpotRuntime || (exports.SpotRuntime = {}));
//# sourceMappingURL=lambdaResponseSender.js.map
"use strict";
var SpotRuntime;
(function (SpotRuntime) {
    var HostedResponseSender = (function () {
        function HostedResponseSender(rs) {
            this.rs = rs;
        }
        HostedResponseSender.prototype.send = function (httpStatusCode, payload) {
            return this.rs.status(httpStatusCode).send(payload);
        };
        return HostedResponseSender;
    }());
    SpotRuntime.HostedResponseSender = HostedResponseSender;
})(SpotRuntime = exports.SpotRuntime || (exports.SpotRuntime = {}));
//# sourceMappingURL=hostedResponseSender.js.map
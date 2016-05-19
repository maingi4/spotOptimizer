"use strict";
var aws = require('aws-sdk');
var Configuration;
(function (Configuration) {
    var AWSGlobalConfig = (function () {
        function AWSGlobalConfig() {
        }
        AWSGlobalConfig.prototype.setGlobalConfig = function () {
            aws.config.apiVersion = '2016-05-11';
        };
        return AWSGlobalConfig;
    }());
    Configuration.AWSGlobalConfig = AWSGlobalConfig;
})(Configuration = exports.Configuration || (exports.Configuration = {}));
//# sourceMappingURL=awsConfigurator.js.map
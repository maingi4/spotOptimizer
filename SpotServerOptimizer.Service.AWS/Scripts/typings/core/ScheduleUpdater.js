"use strict";
var as = require('../aws/autoScaleConnector');
var SpotOptimization;
(function (SpotOptimization) {
    var ScheduleUpdater = (function () {
        function ScheduleUpdater() {
        }
        ScheduleUpdater.prototype.updateScheduleForOptimizedSpot = function (rq, targetScheduleForSpot, callBack) {
            var asConnector = new as.AWS.autoScaleConnector(rq.spotAutoScaleGroup, rq.region, rq.awsAccessKeyId, rq.awsSecretAccessKey);
            asConnector.clearAllScheduledActions(function (err) {
                if (err) {
                    callBack(err);
                    return;
                }
                asConnector.setGroupInstanceSchedule(rq.maxSpotPerHour, targetScheduleForSpot, function (e) {
                    if (e) {
                        callBack(e);
                        return;
                    }
                    callBack(null);
                });
            });
        };
        return ScheduleUpdater;
    }());
    SpotOptimization.ScheduleUpdater = ScheduleUpdater;
})(SpotOptimization = exports.SpotOptimization || (exports.SpotOptimization = {}));
//# sourceMappingURL=ScheduleUpdater.js.map
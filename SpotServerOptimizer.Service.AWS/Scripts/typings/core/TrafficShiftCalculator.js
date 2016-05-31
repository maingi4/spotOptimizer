"use strict";
var Q = require('q');
var _ = require('underscore');
var rs = require('../contracts/optimizeRs');
var cw = require('../aws/cloudWatchConnector');
var SpotOptimization;
(function (SpotOptimization) {
    var TrafficShiftCalculator = (function () {
        function TrafficShiftCalculator(regionName, awsAccessKeyId, awsSecretAccessKey) {
            this.regionName = regionName;
            this.awsAccessKeyId = awsAccessKeyId;
            this.awsSecretAccessKey = awsSecretAccessKey;
        }
        TrafficShiftCalculator.prototype.GetPastTrafficShift = function (loadBalancerName, callback) {
            var getMetricsPromise = this.getMetrics(loadBalancerName);
            getMetricsPromise.then(function (metrics) {
                if (metrics == null || metrics.length == 0) {
                    callback(null, null);
                    return;
                }
                var endDate = new Date();
                endDate.setDate(endDate.getDate() - 7);
                var presentDayInPastWeek = endDate.getDate();
                var presentDayInPastWeekMetrics = _.filter(metrics, function (metric) {
                    return metric.day == presentDayInPastWeek;
                });
                endDate.setDate(endDate.getDate() - 1);
                var presentDayInPastWeekMinus1 = endDate.getDate();
                var presentDayInPastWeekMinus1Metrics = _.filter(metrics, function (metric) {
                    return metric.day == presentDayInPastWeekMinus1;
                });
                var trafficPastIncrease = new rs.Contracts.Schedule();
                for (var i = 0; i < presentDayInPastWeekMetrics.length; i++) {
                    var presentDayMetric = presentDayInPastWeekMetrics[i];
                    var pastDayMetric = _.find(presentDayInPastWeekMinus1Metrics, function (metric) {
                        return metric.hour == presentDayMetric.hour;
                    });
                    var percentageInc = ((presentDayMetric.value - pastDayMetric.value) * 100) / pastDayMetric.value;
                    if (percentageInc < -30 || percentageInc > 30)
                        percentageInc = 0;
                    trafficPastIncrease.setPropertyByHour(presentDayMetric.hour, percentageInc);
                }
                callback(trafficPastIncrease, null);
            }).fail(function (e) {
                callback(null, e);
            });
        };
        TrafficShiftCalculator.prototype.getMetrics = function (loadBalancerName) {
            var startDate = new Date();
            startDate.setDate(startDate.getDate() - 8);
            startDate.setHours(0);
            startDate.setMinutes(0);
            startDate.setSeconds(0);
            var endDate = new Date();
            endDate.setDate(endDate.getDate() - 6);
            endDate.setHours(0);
            endDate.setMinutes(0);
            endDate.setSeconds(0);
            var deferred = Q.defer();
            this.getCloudWatchConnector().getMetricsByDate(9, "AWS/ELB", "RequestCount", 3600, cw.AWS.StatisticType.Sum, [new cw.AWS.CWFilter("LoadBalancerName", loadBalancerName)], startDate, endDate, function (metrics, e) {
                if (e) {
                    deferred.reject(e);
                    return;
                }
                deferred.resolve(metrics);
            });
            return deferred.promise;
        };
        TrafficShiftCalculator.prototype.getCloudWatchConnector = function () {
            return new cw.AWS.cloudWatchConnector(this.regionName, this.awsAccessKeyId, this.awsSecretAccessKey);
        };
        return TrafficShiftCalculator;
    }());
    SpotOptimization.TrafficShiftCalculator = TrafficShiftCalculator;
})(SpotOptimization = exports.SpotOptimization || (exports.SpotOptimization = {}));
//# sourceMappingURL=TrafficShiftCalculator.js.map
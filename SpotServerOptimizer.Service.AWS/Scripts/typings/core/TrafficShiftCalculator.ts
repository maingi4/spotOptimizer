var Q = require('q');
var _ = require('underscore');

import * as rs from '../contracts/optimizeRs';
import * as cw from '../aws/cloudWatchConnector';
import * as e from '../contracts/error';

export namespace SpotOptimization {
    export class TrafficShiftCalculator {
        constructor(private regionName: string, private awsAccessKeyId: string,
            private awsSecretAccessKey: string) { }

        GetPastTrafficShift(loadBalancerName: string, callback: (trafficDiff: rs.Contracts.Schedule, e: e.Contracts.Error) => void): void {
            var getMetricsPromise = this.getMetrics(loadBalancerName);

            getMetricsPromise.then(function (metrics: cw.AWS.Metric[]) {
                if (metrics == null || metrics.length == 0) {
                    callback(null, null);
                    return;
                }
                var endDate = new Date();
                endDate.setDate(endDate.getDate() - 7);

                var presentDayInPastWeek = endDate.getDate();

                var presentDayInPastWeekMetrics = _.filter(metrics,
                    function (metric: cw.AWS.Metric) {
                        return metric.day == presentDayInPastWeek;
                    }) as cw.AWS.Metric[];

                endDate.setDate(endDate.getDate() - 1);

                var presentDayInPastWeekMinus1 = endDate.getDate();

                var presentDayInPastWeekMinus1Metrics = _.filter(metrics,
                    function (metric: cw.AWS.Metric) {
                        return metric.day == presentDayInPastWeekMinus1;
                    }) as cw.AWS.Metric[];

                var trafficPastIncrease = new rs.Contracts.Schedule();

                for (var i = 0; i < presentDayInPastWeekMetrics.length; i++) {
                    var presentDayMetric = presentDayInPastWeekMetrics[i];

                    var pastDayMetric = _.find(presentDayInPastWeekMinus1Metrics,
                        function (metric: cw.AWS.Metric) {
                            return metric.hour == presentDayMetric.hour;
                        }) as cw.AWS.Metric;

                    var percentageInc = ((presentDayMetric.value - pastDayMetric.value) * 100) / pastDayMetric.value;

                    if (percentageInc < -30 || percentageInc > 30) //outage detection
                        percentageInc = 0;

                    trafficPastIncrease.setPropertyByHour(presentDayMetric.hour, percentageInc);
                }

                callback(trafficPastIncrease, null);
            }).fail(function (e: e.Contracts.Error) {
                callback(null, e);
            });
        }

        private getMetrics(loadBalancerName: string): any {
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

            this.getCloudWatchConnector().getMetricsByDate(9, "AWS/ELB", "RequestCount", 3600, cw.AWS.StatisticType.Sum,
                [new cw.AWS.CWFilter("LoadBalancerName", loadBalancerName)], startDate, endDate,
                function (metrics: cw.AWS.Metric[], e: e.Contracts.Error) {
                    if (e) {
                        deferred.reject(e);
                        return;
                    }
                    deferred.resolve(metrics);
                });
            return deferred.promise;
        }

        private getCloudWatchConnector(): cw.AWS.cloudWatchConnector {
            return new cw.AWS.cloudWatchConnector(this.regionName,
                this.awsAccessKeyId, this.awsSecretAccessKey);
        }
    }
}
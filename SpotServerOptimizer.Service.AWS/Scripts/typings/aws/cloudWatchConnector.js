"use strict";
var aws = require('aws-sdk');
var e = require('../contracts/error');
var AWS;
(function (AWS) {
    var cloudWatchConnector = (function () {
        function cloudWatchConnector(regionName, awsAccessKeyId, awsSecretAccessKey) {
            this.regionName = regionName;
            this.awsAccessKeyId = awsAccessKeyId;
            this.awsSecretAccessKey = awsSecretAccessKey;
        }
        //scalesWhenGreaterThanThresholdForSecs property to define scaling, calculate peak of values which run together for these many seconds in an hour.
        cloudWatchConnector.prototype.getMetrics = function (daysToLookBack, namespace, name, periodSec, statType, filters, callback) {
            this.getMetricsByDate(daysToLookBack, namespace, name, periodSec, statType, filters, null, null, callback);
        };
        cloudWatchConnector.prototype.getMetricsByDate = function (daysToLookBack, namespace, name, periodSec, statType, filters, startDate, endDate, callback) {
            var present = new Date();
            var pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - daysToLookBack);
            if (startDate)
                pastDate = startDate;
            if (endDate)
                present = endDate;
            var params = {
                StartTime: pastDate.toISOString(),
                EndTime: present.toISOString(),
                MetricName: name,
                Namespace: namespace,
                Period: periodSec,
                Statistics: [this.getStatNameByType(statType)],
                Dimensions: filters
            };
            var jspo = JSON.stringify(params);
            this.getCloudWatchObj().getMetricStatistics(params, function (err, data) {
                var errFactory = new e.Contracts.ErrorFactory();
                if (err) {
                    var error = errFactory.createOptimizationAWSError([
                        "Failure while getting metrics, namespace: " + namespace + ', name: ' + name,
                        err.message
                    ]);
                    callback(null, error);
                    return;
                }
                if (!data || !data.Datapoints || data.Datapoints.length == 0) {
                    callback(null, null);
                    return;
                }
                var metrics = new Array();
                for (var i = 0; i < data.Datapoints.length; i++) {
                    var point = data.Datapoints[i];
                    var val;
                    switch (statType) {
                        case StatisticType.Average:
                            val = point.Average;
                            break;
                        case StatisticType.Maximum:
                            val = point.Maximum;
                            break;
                        case StatisticType.Minimum:
                            val = point.Minimum;
                            break;
                        case StatisticType.SampleCount:
                            val = point.SampleCount;
                            break;
                        case StatisticType.Sum:
                            val = point.Sum;
                            break;
                    }
                    metrics.push(new Metric(point.Timestamp, val, point.Unit));
                }
                callback(metrics, null);
                return;
            });
        };
        cloudWatchConnector.prototype.getStatNameByType = function (statType) {
            switch (statType) {
                case StatisticType.Average:
                    return "Average";
                case StatisticType.Maximum:
                    return "Maximum";
                case StatisticType.Minimum:
                    return "Minimum";
                case StatisticType.SampleCount:
                    return "SampleCount";
                case StatisticType.Sum:
                    return "Sum";
            }
            return null;
        };
        cloudWatchConnector.prototype.getCloudWatchObj = function () {
            return new aws.CloudWatch({
                region: this.regionName,
                credentials: new aws.Credentials(this.awsAccessKeyId, this.awsSecretAccessKey)
            });
        };
        return cloudWatchConnector;
    }());
    AWS.cloudWatchConnector = cloudWatchConnector;
    var CWFilter = (function () {
        function CWFilter(Name, Value) {
            this.Name = Name;
            this.Value = Value;
        }
        return CWFilter;
    }());
    AWS.CWFilter = CWFilter;
    (function (StatisticType) {
        StatisticType[StatisticType["SampleCount"] = 0] = "SampleCount";
        StatisticType[StatisticType["Average"] = 1] = "Average";
        StatisticType[StatisticType["Sum"] = 2] = "Sum";
        StatisticType[StatisticType["Minimum"] = 3] = "Minimum";
        StatisticType[StatisticType["Maximum"] = 4] = "Maximum";
    })(AWS.StatisticType || (AWS.StatisticType = {}));
    var StatisticType = AWS.StatisticType;
    (function (Unit) {
        Unit[Unit["Count"] = 0] = "Count";
        Unit[Unit["None"] = 1] = "None";
    })(AWS.Unit || (AWS.Unit = {}));
    var Unit = AWS.Unit;
    var Metric = (function () {
        function Metric(timestamp, value, unit) {
            this.timestamp = timestamp;
            this.value = value;
            this.unit = unit;
            this.hour = timestamp.getHours();
            this.day = timestamp.getDate();
        }
        return Metric;
    }());
    AWS.Metric = Metric;
})(AWS = exports.AWS || (exports.AWS = {}));
//# sourceMappingURL=cloudWatchConnector.js.map
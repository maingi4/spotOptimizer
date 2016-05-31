var aws = require('aws-sdk');

import * as rs from '../contracts/optimizeRs';
import * as rq from '../contracts/optimizeRq';
import * as e from '../contracts/error';

export namespace AWS {
    export class cloudWatchConnector {
        constructor(private regionName: string, private awsAccessKeyId: string,
            private awsSecretAccessKey: string) { }

        //scalesWhenGreaterThanThresholdForSecs property to define scaling, calculate peak of values which run together for these many seconds in an hour.
        getMetrics(daysToLookBack: number, namespace: string, name: string, periodSec: number, statType: StatisticType,
            filters: Array<CWFilter>, callback: (metrics: Array<Metric>, error: e.Contracts.Error) => void): void {
            this.getMetricsByDate(daysToLookBack, namespace, name, periodSec, statType, filters, null, null, callback);
        }

        getMetricsByDate(daysToLookBack: number, namespace: string, name: string, periodSec: number, statType: StatisticType,
            filters: Array<CWFilter>, startDate: Date, endDate: Date, callback: (metrics: Array<Metric>, error: e.Contracts.Error) => void): void {
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
                Statistics: [this.getStatNameByType(statType) ],
                Dimensions: filters
            };

            var jspo = JSON.stringify(params);

            this.getCloudWatchObj().getMetricStatistics(params, function (err, data) {
                var errFactory = new e.Contracts.ErrorFactory();
                if (err) {
                    var error = errFactory.createOptimizationAWSError(
                        [
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

                var metrics = new Array<Metric>();
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
        }

        private getStatNameByType(statType: StatisticType) {
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
        }

        private getCloudWatchObj(): any {
            return new aws.CloudWatch({
                region: this.regionName,
                credentials: new aws.Credentials(this.awsAccessKeyId, this.awsSecretAccessKey)
            });
        }

    }

    export class CWFilter {
        constructor(public Name: string, public Value: string) { }
    }

    export enum StatisticType {
        SampleCount,
        Average,
        Sum,
        Minimum,
        Maximum
    }

    export enum Unit {
        Count,
        None
    }

    export class Metric {
        hour: number;
        day: number;
        constructor(public timestamp: Date, public value: number, public unit: string) {
            this.hour = timestamp.getHours();
            this.day = timestamp.getDate();
        }
    }
}
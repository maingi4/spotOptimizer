"use strict";
var aws = require('aws-sdk');
var _ = require('underscore');
var Q = require('q');
var c = require('../contracts/optimizeRs');
var e = require('../contracts/error');
var cw = require('./cloudWatchConnector');
var AWS;
(function (AWS) {
    var autoScaleConnector = (function () {
        function autoScaleConnector(autoScaleGroupName, regionName, awsAccessKeyId, awsSecretAccessKey) {
            this.autoScaleGroupName = autoScaleGroupName;
            this.regionName = regionName;
            this.awsAccessKeyId = awsAccessKeyId;
            this.awsSecretAccessKey = awsSecretAccessKey;
        }
        autoScaleConnector.prototype.getAutoScaleInstanceHistory = function (daysToConsider, callback) {
            var cwConnector = new cw.AWS.cloudWatchConnector(this.regionName, this.awsAccessKeyId, this.awsSecretAccessKey);
            var groupName = this.autoScaleGroupName;
            var metricName = "GroupDesiredCapacity";
            var me = this;
            cwConnector.getMetrics(daysToConsider, "AWS/AutoScaling", metricName, 60 * 60, cw.AWS.StatisticType.Maximum, [new cw.AWS.CWFilter("AutoScalingGroupName", groupName)], function (metrics, ex) {
                if (ex) {
                    callback(null, ex);
                    return;
                }
                if (metrics == null || metrics.length == 0) {
                    var errFactory = new e.Contracts.ErrorFactory();
                    var err = errFactory.createMetricNotFoundError(["auto scaling group metric for group: " + groupName + ', metric name: ' + metricName, "I took the liberty of enabling them if the aws key had permission to do so."]);
                    me.enableDesiredMetrics();
                    callback(null, err);
                    return;
                }
                var avgByHour = _.chain(metrics)
                    .groupBy('hour')
                    .map(function (value, key) {
                    var sum = 0;
                    for (var i = 0; i < value.length; i++) {
                        sum += value[i].value;
                    }
                    var avg = sum / value.length;
                    return {
                        hour: parseInt(key),
                        val: avg
                    };
                }).value();
                if (avgByHour.length != 24) {
                    var errFactory = new e.Contracts.ErrorFactory();
                    var err = errFactory.createMetricNotEnoughDataError(["auto scaling group metric for group: " + groupName + ', metric name: ' + metricName]);
                    callback(null, err);
                    return;
                }
                var schedule = new c.Contracts.Schedule();
                for (var i = 0; i < avgByHour.length; i++) {
                    schedule.setPropertyByHour(avgByHour[i].hour, avgByHour[i].val);
                }
                callback(schedule, null);
                return;
            });
        };
        autoScaleConnector.prototype.getCPUMetricSchedule = function (daysToLookBack, secondsAtWhichScalingHappens, callback) {
            var cwConnector = new cw.AWS.cloudWatchConnector(this.regionName, this.awsAccessKeyId, this.awsSecretAccessKey);
            var groupName = this.autoScaleGroupName;
            var metricName = "CPUUtilization";
            cwConnector.getMetrics(daysToLookBack, "AWS/EC2", metricName, secondsAtWhichScalingHappens, cw.AWS.StatisticType.Average, [new cw.AWS.CWFilter("AutoScalingGroupName", groupName)], function (metrics, ex) {
                if (ex) {
                    callback(null, ex);
                    return;
                }
                if (metrics == null || metrics.length == 0) {
                    var errFactory = new e.Contracts.ErrorFactory();
                    var err = errFactory.createMetricNotFoundError(["auto scaling group metric for group: " + groupName + ', metric name: ' + metricName]);
                    callback(null, err);
                    return;
                }
                var avgOfMaxPerDayPerHour = _.chain(metrics)
                    .groupBy('hour')
                    .map(function (value, key) {
                    var maxPerDay = _.chain(value).groupBy('day')
                        .map(function (value, key) {
                        return {
                            maxCPU: _.max(value, function (metr) { return metr.value; }).value
                        };
                    }).value();
                    var sum = 0;
                    for (var i = 0; i < maxPerDay.length; i++) {
                        sum += maxPerDay[i].maxCPU;
                    }
                    var avg = sum / maxPerDay.length;
                    return {
                        hour: parseInt(key),
                        val: avg
                    };
                }).value();
                var schedule = new c.Contracts.Schedule();
                for (var i = 0; i < avgOfMaxPerDayPerHour.length; i++) {
                    schedule.setPropertyByHour(avgOfMaxPerDayPerHour[i].hour, avgOfMaxPerDayPerHour[i].val);
                }
                callback(schedule, null);
                return;
            });
        };
        autoScaleConnector.prototype.enableDesiredMetrics = function () {
            var params = {
                AutoScalingGroupName: this.autoScaleGroupName,
                Granularity: '1Minute',
                Metrics: ['GroupDesiredCapacity']
            };
            this.getAutoScalingObj().enableMetricsCollection(params, function (err, data) {
                //do nothing
            });
        };
        autoScaleConnector.prototype.getLoadBalancer = function (callback) {
            var params = {
                AutoScalingGroupName: this.autoScaleGroupName,
                MaxRecords: 2,
            };
            var errFactory = new e.Contracts.ErrorFactory();
            this.getAutoScalingObj().describeLoadBalancers(params, function (err, data) {
                if (err) {
                    var error = errFactory.createOptimizationAWSError([
                        "Failure while getting load balancer for auto scale group: " + params.AutoScalingGroupName,
                        err.message
                    ]);
                    callback(null, error);
                    return;
                }
                if (data.LoadBalancers && data.LoadBalancers.length != 0) {
                    if (data.LoadBalancers.length > 1) {
                        var error = errFactory.createOptimizationAWSError([
                            "There were more than 1 load balancer for auto scale group: " + params.AutoScalingGroupName + ", this is not supported.",
                            err.message
                        ]);
                        callback(null, error);
                        return;
                    }
                    var lb = data.LoadBalancers[0];
                    callback(lb.LoadBalancerName, null);
                    return;
                }
                callback(null, null);
            });
        };
        autoScaleConnector.prototype.getGroupMinSize = function (callback) {
            var params = {
                AutoScalingGroupNames: [this.autoScaleGroupName],
                MaxRecords: 1
            };
            var errFactory = new e.Contracts.ErrorFactory();
            this.getAutoScalingObj().describeAutoScalingGroups(params, function (err, data) {
                if (err) {
                    var error = errFactory.createOptimizationAWSError([
                        "Failure while getting min size for auto scale group: " + params.AutoScalingGroupNames[0],
                        err.message
                    ]);
                    callback(null, error);
                    return;
                }
                if (data.AutoScalingGroups && data.AutoScalingGroups.length != 0) {
                    var grp = data.AutoScalingGroups[0];
                    callback(grp.MinSize, null);
                    return;
                }
                callback(null, null);
            });
        };
        autoScaleConnector.prototype.clearAllScheduledActions = function (callback) {
            var errFactory = new e.Contracts.ErrorFactory();
            var me = this;
            this.getAllScheduledActions()
                .fail(function (err) {
                if (err) {
                    var error = errFactory.createOptimizationAWSError([
                        "Failure while getting scheduled actions for auto scale group: " + me.autoScaleGroupName,
                        err.message
                    ]);
                    callback(error);
                }
            })
                .then(function (data) {
                if (data.ScheduledUpdateGroupActions && data.ScheduledUpdateGroupActions.length > 0) {
                    var deletePromises = new Array();
                    for (var i = 0; i < data.ScheduledUpdateGroupActions.length; i++) {
                        var actionName = data.ScheduledUpdateGroupActions[i].ScheduledActionName;
                        deletePromises.push(me.deleteScheduledAction(actionName));
                    }
                    Q.all(deletePromises)
                        .fail(function (err) {
                        if (err) {
                            var error = errFactory.createOptimizationAWSError([
                                "Failure while deleting previous scheduled actions for auto scale group: " + me.autoScaleGroupName,
                                err.message
                            ]);
                            callback(error);
                        }
                    }).then(function (data) {
                        callback(null);
                    });
                }
                else {
                    callback(null);
                }
            });
        };
        autoScaleConnector.prototype.deleteScheduledAction = function (actionName) {
            var params = {
                ScheduledActionName: actionName,
                AutoScalingGroupName: this.autoScaleGroupName
            };
            var deferred = Q.defer();
            this.getAutoScalingObj().deleteScheduledAction(params, function (err, data) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                deferred.resolve(data);
            });
            return deferred.promise;
        };
        autoScaleConnector.prototype.getAllScheduledActions = function () {
            var present = new Date();
            var params = {
                AutoScalingGroupName: this.autoScaleGroupName,
                EndTime: new Date(present.getFullYear() + 2, 1, 1, 0, 0, 0, 0),
                MaxRecords: 50,
                NextToken: null,
                StartTime: new Date(2000, 1, 1, 1, 1, 1)
            };
            var deferred = Q.defer();
            this.getAutoScalingObj().describeScheduledActions(params, function (err, data) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                deferred.resolve(data);
            });
            return deferred.promise;
        };
        autoScaleConnector.prototype.setGroupInstanceSchedule = function (maxSpotPerHour, schedule, callback) {
            var createPromises = new Array();
            createPromises.push(this.createSchedule(0, schedule.zero, maxSpotPerHour));
            createPromises.push(this.createSchedule(1, schedule.one, maxSpotPerHour));
            createPromises.push(this.createSchedule(2, schedule.two, maxSpotPerHour));
            createPromises.push(this.createSchedule(3, schedule.three, maxSpotPerHour));
            createPromises.push(this.createSchedule(4, schedule.four, maxSpotPerHour));
            createPromises.push(this.createSchedule(5, schedule.five, maxSpotPerHour));
            createPromises.push(this.createSchedule(6, schedule.six, maxSpotPerHour));
            createPromises.push(this.createSchedule(7, schedule.seven, maxSpotPerHour));
            createPromises.push(this.createSchedule(8, schedule.eight, maxSpotPerHour));
            createPromises.push(this.createSchedule(9, schedule.nine, maxSpotPerHour));
            createPromises.push(this.createSchedule(10, schedule.ten, maxSpotPerHour));
            createPromises.push(this.createSchedule(11, schedule.eleven, maxSpotPerHour));
            createPromises.push(this.createSchedule(12, schedule.twelve, maxSpotPerHour));
            createPromises.push(this.createSchedule(13, schedule.thirteen, maxSpotPerHour));
            createPromises.push(this.createSchedule(14, schedule.fourteen, maxSpotPerHour));
            createPromises.push(this.createSchedule(15, schedule.fifteen, maxSpotPerHour));
            createPromises.push(this.createSchedule(16, schedule.sixteen, maxSpotPerHour));
            createPromises.push(this.createSchedule(17, schedule.seventeen, maxSpotPerHour));
            createPromises.push(this.createSchedule(18, schedule.eighteen, maxSpotPerHour));
            createPromises.push(this.createSchedule(19, schedule.nineteen, maxSpotPerHour));
            createPromises.push(this.createSchedule(20, schedule.twenty, maxSpotPerHour));
            createPromises.push(this.createSchedule(21, schedule.twentyOne, maxSpotPerHour));
            createPromises.push(this.createSchedule(22, schedule.twentyTwo, maxSpotPerHour));
            createPromises.push(this.createSchedule(23, schedule.twentyThree, maxSpotPerHour));
            var errFactory = new e.Contracts.ErrorFactory();
            var me = this;
            Q.all(createPromises)
                .fail(function (err) {
                if (err) {
                    var error = errFactory.createOptimizationAWSError([
                        "Failure while creating scheduled actions for auto scale group: " + me.autoScaleGroupName,
                        err.message
                    ]);
                    callback(error);
                }
            }).then(function (data) {
                callback(null);
            });
        };
        autoScaleConnector.prototype.createSchedule = function (hour, instances, maxSpotPerHour) {
            var present = this.getTimeAroundHourInFuture(hour); // aws needs start time to be different by at least a minute and in the future even for recurring schedules for some reason.
            if (instances > maxSpotPerHour)
                instances = maxSpotPerHour;
            if (instances < 0)
                return Q.fcall(function () {
                    return null;
                });
            var offset = new Date().getTimezoneOffset();
            var scheduleHour = ((hour * 60) + offset) / 60;
            var split = scheduleHour.toString().split('.');
            var newH = parseInt(split[0]);
            if (newH < 0)
                newH = 23 + newH;
            if (newH == 0 && split[0].indexOf('-') == 0)
                newH = 23;
            if (newH > 23)
                newH = newH - 24;
            var newM = parseFloat(split[1]) * 6;
            var params = {
                AutoScalingGroupName: this.autoScaleGroupName,
                ScheduledActionName: hour.toString() + '_' + present.getFullYear() + '_' + present.getMonth() + '_' + present.getDate(),
                DesiredCapacity: instances,
                EndTime: new Date(present.getFullYear() + 1, present.getMonth(), present.getDate(), 0, 0, 0, 0),
                MaxSize: instances,
                MinSize: instances,
                Recurrence: newM + ' ' + newH.toString() + ' * * *',
                StartTime: present
            };
            var deferred = Q.defer();
            this.getAutoScalingObj().putScheduledUpdateGroupAction(params, function (err, data) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                deferred.resolve(data);
            });
            return deferred.promise;
        };
        autoScaleConnector.prototype.getTimeAroundHourInFuture = function (hour) {
            var present = new Date();
            present.setHours(hour);
            present.setMinutes(0);
            present.setSeconds(0);
            present.setMilliseconds(0);
            if ((present.getTime() - new Date().getTime()) < 100) {
                present.setDate(present.getDate() + 1);
            }
            return present;
        };
        //getAutoScaleActivities(daysToConsider: number,
        //    callback: (history: Array<ScaleActivity>, error: e.Contracts.Error) => void): void {
        //    if (daysToConsider < 1) {
        //        daysToConsider = 3;
        //    }
        //    var errFactory = new e.Contracts.ErrorFactory();
        //    var filter = this.filterActivities;
        //    this.getAutoScaleActivitiesRecursive(null, this.getAutoScalingObj(), errFactory, new Array<ScaleActivity>(),
        //        this, function (activities: Array<ScaleActivity>, e: e.Contracts.Error) {
        //            if (e) {
        //                callback(null, e);
        //                return;
        //            }
        //            callback(filter(activities, daysToConsider), null);
        //        });
        //}
        //private filterActivities(activities: Array<ScaleActivity>, daysToConsider: number): Array<ScaleActivity> {
        //    var filtered = new Array<ScaleActivity>();
        //    var now = new Date();
        //    var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        //    var considerationTimeMs = daysToConsider * 24 * 60 * 60 * 1000;
        //    for (var i = 0; i < activities.length; i++) {
        //        var activity = activities[0];
        //        if (activity.statusCode == "Successful" && activity.progress == 100
        //            && (activity.isLaunchActivity || activity.isTerminationActivity)) { //chuck in progress or failed stuff.
        //            var timeDiffMs = now_utc.getTime() - activity.startTime.getTime();
        //            if (timeDiffMs <= considerationTimeMs) {
        //                filtered.push(activity);
        //            }
        //        }
        //    }
        //    return filtered;
        //}
        //private getAutoScaleActivitiesRecursive(nextToken: string, scalingObj: any, errFactory: e.Contracts.ErrorFactory,
        //    activities: Array<ScaleActivity>, thisDef: autoScaleConnector,
        //    callback: (activities: Array<ScaleActivity>, e: e.Contracts.Error) => void) {
        //    var params = {
        //        AutoScalingGroupName: thisDef.autoScaleGroupName,
        //        MaxRecords: 50, //limit by AWS
        //        NextToken: nextToken
        //    };
        //    scalingObj.describeScalingActivities(params, function (err, data) {
        //        if (err) {
        //            var error = errFactory.createOptimizationAWSError(
        //                [
        //                    "Failure while getting activities for auto scale group: " + params.AutoScalingGroupName + ', total activities fetched till this error were: ' + activities.length,
        //                    err.message
        //                ]);
        //            callback(null, error);
        //            return;
        //        }
        //        var rawActivities = data.Activities;
        //        if (!rawActivities || rawActivities.length == 0) {
        //            callback(activities, null);
        //        }
        //        for (var i = 0; i < rawActivities.length; i++) {
        //            var rawActivity = rawActivities[i];
        //            if (!rawActivity) continue;
        //            var activity = new ScaleActivity(rawActivity.StartTime, rawActivity.EndTime,
        //                rawActivity.StatusCode, rawActivity.Progress, rawActivity.Description);
        //            activities.push(activity);
        //        }
        //        var token = data.NextToken;
        //        if (token) {
        //            thisDef.getAutoScaleActivitiesRecursive(token, scalingObj, errFactory, activities, thisDef, callback);
        //            return;
        //        } else {
        //            callback(activities, null);
        //            return;
        //        }
        //    });
        //}
        autoScaleConnector.prototype.getAutoScalingObj = function () {
            return new aws.AutoScaling({
                region: this.regionName,
                credentials: new aws.Credentials(this.awsAccessKeyId, this.awsSecretAccessKey)
            });
        };
        return autoScaleConnector;
    }());
    AWS.autoScaleConnector = autoScaleConnector;
    var ScaleActivity = (function () {
        function ScaleActivity(startTime, endTime, statusCode, progress, description) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.statusCode = statusCode;
            this.progress = progress;
            this.description = description;
            this.isLaunchActivity = false;
            this.isTerminationActivity = false;
            if (description.indexOf("Terminating EC2 instance") >= 0) {
                this.isTerminationActivity = true;
            }
            else if (description.indexOf("Launching a new EC2 instance") >= 0) {
                this.isLaunchActivity = true;
            }
        }
        return ScaleActivity;
    }());
    AWS.ScaleActivity = ScaleActivity;
})(AWS = exports.AWS || (exports.AWS = {}));
//# sourceMappingURL=autoScaleConnector.js.map
"use strict";
var Q = require('q');
var rs = require('../contracts/optimizeRs');
var ex = require('../errors/SpotOptimizationError');
var ce = require('../contracts/error');
var as = require('../aws/autoScaleConnector');
var sh = require('./ScheduleHelper');
var ts = require('./TrafficShiftCalculator');
var SpotOptimization;
(function (SpotOptimization) {
    var CPUSpotOptimizer = (function () {
        function CPUSpotOptimizer() {
        }
        CPUSpotOptimizer.prototype.optimize = function (rq, callback) {
            try {
                if (callback) {
                    var autoScaleInstanceHistoryOnDemandPromise = this.getAutoScaleInstanceHistory(rq, AutoScaleGroupType.OnDemand);
                    var autoScaleInstanceHistorySpotPromise = this.getAutoScaleInstanceHistory(rq, AutoScaleGroupType.Spot);
                    var cpuPromise = this.getCPUMetrics(rq);
                    var trafficShiftPromise = this.getTrafficPatternShift(rq);
                    var minSizePromise = this.getAutoScaleMinGroupSize(rq, AutoScaleGroupType.OnDemand);
                    var combined = Q.all([autoScaleInstanceHistoryOnDemandPromise, autoScaleInstanceHistorySpotPromise, cpuPromise, minSizePromise, trafficShiftPromise]);
                    var me = this;
                    combined.then(function (resp) {
                        var combinedSchedule = me.CombineASGroupSchedule(resp[0], resp[1]);
                        var cpuSchedule = resp[2];
                        var minSize = resp[3];
                        var trafficShift = resp[4];
                        var minOnDemandSchedule = new sh.SpotOptimization.ScheduleHelper().createMonotoneSchedule(minSize);
                        var result = new rs.Contracts.OptimizeRs();
                        var newOverallSchedule = me.AdjustForCPU(combinedSchedule, cpuSchedule, rq.scalesOn.cpu, trafficShift);
                        result.avgPrevSchedule = combinedSchedule;
                        result.newOverallSchedule = newOverallSchedule.shallowCopy();
                        result.newSpotSchedule = newOverallSchedule.doOperation(minOnDemandSchedule, rs.Contracts.ScheduleOperation.Substract);
                        callback(result, null);
                    }).fail(function (e) {
                        var cErr = me.checkErrorTypeAndWrap(e);
                        callback(null, cErr);
                    });
                }
            }
            catch (e) {
                this.wrapAndThrowUnknownError(e);
            }
        };
        CPUSpotOptimizer.prototype.AdjustForCPU = function (instanceSchedule, cpuSchedule, cpu, trafficShift) {
            var cpuAdjustedInstanceSchedule = new rs.Contracts.Schedule();
            var targetThreshold = this.getTargetThresholdCPU(cpu.upperThresholdPercent);
            if (!trafficShift)
                trafficShift = new rs.Contracts.Schedule();
            cpuAdjustedInstanceSchedule.zero = this.AdjustVal(instanceSchedule.zero, cpuSchedule.zero, targetThreshold, trafficShift.zero);
            cpuAdjustedInstanceSchedule.one = this.AdjustVal(instanceSchedule.one, cpuSchedule.one, targetThreshold, trafficShift.one);
            cpuAdjustedInstanceSchedule.two = this.AdjustVal(instanceSchedule.two, cpuSchedule.two, targetThreshold, trafficShift.two);
            cpuAdjustedInstanceSchedule.three = this.AdjustVal(instanceSchedule.three, cpuSchedule.three, targetThreshold, trafficShift.three);
            cpuAdjustedInstanceSchedule.four = this.AdjustVal(instanceSchedule.four, cpuSchedule.four, targetThreshold, trafficShift.four);
            cpuAdjustedInstanceSchedule.five = this.AdjustVal(instanceSchedule.five, cpuSchedule.five, targetThreshold, trafficShift.five);
            cpuAdjustedInstanceSchedule.six = this.AdjustVal(instanceSchedule.six, cpuSchedule.six, targetThreshold, trafficShift.six);
            cpuAdjustedInstanceSchedule.seven = this.AdjustVal(instanceSchedule.seven, cpuSchedule.seven, targetThreshold, trafficShift.seven);
            cpuAdjustedInstanceSchedule.eight = this.AdjustVal(instanceSchedule.eight, cpuSchedule.eight, targetThreshold, trafficShift.eight);
            cpuAdjustedInstanceSchedule.nine = this.AdjustVal(instanceSchedule.nine, cpuSchedule.nine, targetThreshold, trafficShift.nine);
            cpuAdjustedInstanceSchedule.ten = this.AdjustVal(instanceSchedule.ten, cpuSchedule.ten, targetThreshold, trafficShift.ten);
            cpuAdjustedInstanceSchedule.eleven = this.AdjustVal(instanceSchedule.eleven, cpuSchedule.eleven, targetThreshold, trafficShift.eleven);
            cpuAdjustedInstanceSchedule.twelve = this.AdjustVal(instanceSchedule.twelve, cpuSchedule.twelve, targetThreshold, trafficShift.twelve);
            cpuAdjustedInstanceSchedule.thirteen = this.AdjustVal(instanceSchedule.thirteen, cpuSchedule.thirteen, targetThreshold, trafficShift.thirteen);
            cpuAdjustedInstanceSchedule.fourteen = this.AdjustVal(instanceSchedule.fourteen, cpuSchedule.fourteen, targetThreshold, trafficShift.fourteen);
            cpuAdjustedInstanceSchedule.fifteen = this.AdjustVal(instanceSchedule.fifteen, cpuSchedule.fifteen, targetThreshold, trafficShift.fifteen);
            cpuAdjustedInstanceSchedule.sixteen = this.AdjustVal(instanceSchedule.sixteen, cpuSchedule.sixteen, targetThreshold, trafficShift.sixteen);
            cpuAdjustedInstanceSchedule.seventeen = this.AdjustVal(instanceSchedule.seventeen, cpuSchedule.seventeen, targetThreshold, trafficShift.seventeen);
            cpuAdjustedInstanceSchedule.eighteen = this.AdjustVal(instanceSchedule.eighteen, cpuSchedule.eighteen, targetThreshold, trafficShift.eighteen);
            cpuAdjustedInstanceSchedule.nineteen = this.AdjustVal(instanceSchedule.nineteen, cpuSchedule.nineteen, targetThreshold, trafficShift.nineteen);
            cpuAdjustedInstanceSchedule.twenty = this.AdjustVal(instanceSchedule.twenty, cpuSchedule.twenty, targetThreshold, trafficShift.twenty);
            cpuAdjustedInstanceSchedule.twentyOne = this.AdjustVal(instanceSchedule.twentyOne, cpuSchedule.twentyOne, targetThreshold, trafficShift.twentyOne);
            cpuAdjustedInstanceSchedule.twentyTwo = this.AdjustVal(instanceSchedule.twentyTwo, cpuSchedule.twentyTwo, targetThreshold, trafficShift.twentyTwo);
            cpuAdjustedInstanceSchedule.twentyThree = this.AdjustVal(instanceSchedule.twentyThree, cpuSchedule.twentyThree, targetThreshold, trafficShift.twentyThree);
            return cpuAdjustedInstanceSchedule;
        };
        CPUSpotOptimizer.prototype.AdjustVal = function (instanceNumber, cpuNumber, targetThreshold, trafficShiftExpectedInTheHour) {
            var deltaFromThreshold = -((targetThreshold - cpuNumber) / targetThreshold);
            var target = instanceNumber + (deltaFromThreshold * instanceNumber);
            target = Math.ceil(target + (target * trafficShiftExpectedInTheHour / 100));
            return target;
        };
        CPUSpotOptimizer.prototype.getTargetThresholdCPU = function (scaleUpperThresholdCPU) {
            return scaleUpperThresholdCPU - (0.15 * scaleUpperThresholdCPU);
        };
        CPUSpotOptimizer.prototype.CombineASGroupSchedule = function (onDemandScehdule, spotScehdule) {
            if (!onDemandScehdule || !spotScehdule) {
                var errFactory = new ce.Contracts.ErrorFactory();
                var error = errFactory.createOptimizationUnknownError(["Did not get proper schedule objects to combine, this was not expected and is likely a code bug, dev to investigate."]);
                throw new ex.SpotOptimization.SpotOptimizationError(error);
            }
            return onDemandScehdule.doOperation(spotScehdule, rs.Contracts.ScheduleOperation.Add);
        };
        CPUSpotOptimizer.prototype.getCPUMetrics = function (rq) {
            var autoScaleConnector = new as.AWS.autoScaleConnector(rq.onDemandAutoScaleGroup, rq.region, rq.awsAccessKeyId, rq.awsSecretAccessKey);
            var deferred = Q.defer();
            autoScaleConnector.getCPUMetricSchedule(rq.numberOfDaysBackToConsider, rq.scalesOn.cpu.scalesWhenGreaterThanThresholdForSecs, function (history, e) {
                if (e) {
                    deferred.reject(e);
                    return;
                }
                deferred.resolve(history);
                return;
            });
            return deferred.promise;
        };
        CPUSpotOptimizer.prototype.getAutoScaleInstanceHistory = function (rq, asGroupType) {
            var asGroup = this.getASGroupByType(rq, asGroupType);
            var autoScaleConnector = new as.AWS.autoScaleConnector(asGroup, rq.region, rq.awsAccessKeyId, rq.awsSecretAccessKey);
            var deferred = Q.defer();
            autoScaleConnector.getAutoScaleInstanceHistory(rq.numberOfDaysBackToConsider, function (history, e) {
                if (e) {
                    deferred.reject(e);
                    return;
                }
                deferred.resolve(history);
            });
            return deferred.promise;
        };
        CPUSpotOptimizer.prototype.getTrafficPatternShift = function (rq) {
            if (!rq.enableTrafficPrediction)
                return Q.fcall(function () {
                    return null;
                });
            var trafficPatternShiftCalc = new ts.SpotOptimization.TrafficShiftCalculator(rq.region, rq.awsAccessKeyId, rq.awsSecretAccessKey);
            var deferred = Q.defer();
            trafficPatternShiftCalc.GetPastTrafficShift(rq.trafficPredictionLoadBalancerName, function (trafficDiff, e) {
                if (e) {
                    deferred.reject(e);
                    return;
                }
                deferred.resolve(trafficDiff);
            });
            return deferred.promise;
        };
        CPUSpotOptimizer.prototype.getAutoScaleMinGroupSize = function (rq, asGroupType) {
            var asGroup = this.getASGroupByType(rq, asGroupType);
            var autoScaleConnector = new as.AWS.autoScaleConnector(asGroup, rq.region, rq.awsAccessKeyId, rq.awsSecretAccessKey);
            var deferred = Q.defer();
            autoScaleConnector.getGroupMinSize(function (minSize, e) {
                if (e) {
                    deferred.reject(e);
                    return;
                }
                deferred.resolve(minSize);
                return;
            });
            return deferred.promise;
        };
        CPUSpotOptimizer.prototype.getASGroupByType = function (rq, asGroupType) {
            switch (asGroupType) {
                case AutoScaleGroupType.OnDemand:
                    return rq.onDemandAutoScaleGroup;
                case AutoScaleGroupType.Spot:
                    return rq.spotAutoScaleGroup;
            }
            var errFactory = new ce.Contracts.ErrorFactory();
            var error = errFactory.createNotImplementedError(["The auto scale group type requested is not yet implemented, contact dev"]);
            throw new ex.SpotOptimization.SpotOptimizationError(error);
        };
        CPUSpotOptimizer.prototype.wrapAndThrowUnknownError = function (e) {
            throw new ex.SpotOptimization.SpotOptimizationError(this.checkErrorTypeAndWrap(e));
        };
        CPUSpotOptimizer.prototype.checkErrorTypeAndWrap = function (e) {
            if (e instanceof ex.SpotOptimization.SpotOptimizationError) {
                return e.appError;
            }
            if (e instanceof ce.Contracts.Error) {
                return e;
            }
            var errorFactory = new ce.Contracts.ErrorFactory();
            return errorFactory.createOptimizationUnknownError([e.message]);
        };
        return CPUSpotOptimizer;
    }());
    SpotOptimization.CPUSpotOptimizer = CPUSpotOptimizer;
    var AutoScaleGroupType;
    (function (AutoScaleGroupType) {
        AutoScaleGroupType[AutoScaleGroupType["OnDemand"] = 0] = "OnDemand";
        AutoScaleGroupType[AutoScaleGroupType["Spot"] = 1] = "Spot";
    })(AutoScaleGroupType || (AutoScaleGroupType = {}));
})(SpotOptimization = exports.SpotOptimization || (exports.SpotOptimization = {}));
//# sourceMappingURL=CPUSpotOptimizer.js.map
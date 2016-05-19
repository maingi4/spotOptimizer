var Q = require('q');

import * as i from '../interfaces/IOptimizer';
import * as rq from '../contracts/optimizeRq';
import * as rs from '../contracts/optimizeRs';
import * as ex from '../errors/SpotOptimizationError';
import * as ce from '../contracts/error';
import * as as from '../aws/autoScaleConnector';
import * as sh from './ScheduleHelper';

export namespace SpotOptimization {
    export class CPUSpotOptimizer implements i.SpotOptimization.ISpotOptimizer {
        optimize(rq: rq.Contracts.OptimizeRq, callback: (resp: rs.Contracts.OptimizeRs, error: ce.Contracts.Error) => any): void {
            try {
                if (callback) {
                    var autoScaleInstanceHistoryOnDemandPromise = this.getAutoScaleInstanceHistory(rq, AutoScaleGroupType.OnDemand);
                    var autoScaleInstanceHistorySpotPromise = this.getAutoScaleInstanceHistory(rq, AutoScaleGroupType.Spot);
                    
                    var cpuPromise = this.getCPUMetrics(rq);
                    var minSizePromise = this.getAutoScaleMinGroupSize(rq, AutoScaleGroupType.OnDemand);

                    var combined = Q.all([autoScaleInstanceHistoryOnDemandPromise, autoScaleInstanceHistorySpotPromise, cpuPromise, minSizePromise]);
                    var me = this;

                    combined.then(function (resp) {
                        var combinedSchedule = me.CombineASGroupSchedule(resp[0], resp[1]);
                        var cpuSchedule = resp[2] as rs.Contracts.Schedule;
                        var minSize = resp[3] as number;

                        var minOnDemandSchedule = new sh.SpotOptimization.ScheduleHelper().createMonotoneSchedule(minSize);

                        var result = new rs.Contracts.OptimizeRs();

                        var newOverallSchedule = me.AdjustForCPU(combinedSchedule, cpuSchedule, rq.scalesOn.cpu);

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
        }

        private AdjustForCPU(instanceSchedule: rs.Contracts.Schedule, cpuSchedule: rs.Contracts.Schedule,
            cpu: rq.Contracts.CPU): rs.Contracts.Schedule {
            var cpuAdjustedInstanceSchedule = new rs.Contracts.Schedule();

            var targetThreshold = this.getTargetThresholdCPU(cpu.upperThresholdPercent);

            cpuAdjustedInstanceSchedule.zero = this.AdjustVal(instanceSchedule.zero, cpuSchedule.zero, targetThreshold);
            cpuAdjustedInstanceSchedule.one = this.AdjustVal(instanceSchedule.one, cpuSchedule.one, targetThreshold);
            cpuAdjustedInstanceSchedule.two = this.AdjustVal(instanceSchedule.two, cpuSchedule.two, targetThreshold);
            cpuAdjustedInstanceSchedule.three = this.AdjustVal(instanceSchedule.three, cpuSchedule.three, targetThreshold);
            cpuAdjustedInstanceSchedule.four = this.AdjustVal(instanceSchedule.four, cpuSchedule.four, targetThreshold);
            cpuAdjustedInstanceSchedule.five = this.AdjustVal(instanceSchedule.five, cpuSchedule.five, targetThreshold);
            cpuAdjustedInstanceSchedule.six = this.AdjustVal(instanceSchedule.six, cpuSchedule.six, targetThreshold);
            cpuAdjustedInstanceSchedule.seven = this.AdjustVal(instanceSchedule.seven, cpuSchedule.seven, targetThreshold);
            cpuAdjustedInstanceSchedule.eight = this.AdjustVal(instanceSchedule.eight, cpuSchedule.eight, targetThreshold);
            cpuAdjustedInstanceSchedule.nine = this.AdjustVal(instanceSchedule.nine, cpuSchedule.nine, targetThreshold);
            cpuAdjustedInstanceSchedule.ten = this.AdjustVal(instanceSchedule.ten, cpuSchedule.ten, targetThreshold);
            cpuAdjustedInstanceSchedule.eleven = this.AdjustVal(instanceSchedule.eleven, cpuSchedule.eleven, targetThreshold);
            cpuAdjustedInstanceSchedule.twelve = this.AdjustVal(instanceSchedule.twelve, cpuSchedule.twelve, targetThreshold);
            cpuAdjustedInstanceSchedule.thirteen = this.AdjustVal(instanceSchedule.thirteen, cpuSchedule.thirteen, targetThreshold);
            cpuAdjustedInstanceSchedule.fourteen = this.AdjustVal(instanceSchedule.fourteen, cpuSchedule.fourteen, targetThreshold);
            cpuAdjustedInstanceSchedule.fifteen = this.AdjustVal(instanceSchedule.fifteen, cpuSchedule.fifteen, targetThreshold);
            cpuAdjustedInstanceSchedule.sixteen = this.AdjustVal(instanceSchedule.sixteen, cpuSchedule.sixteen, targetThreshold);
            cpuAdjustedInstanceSchedule.seventeen = this.AdjustVal(instanceSchedule.seventeen, cpuSchedule.seventeen, targetThreshold);
            cpuAdjustedInstanceSchedule.eighteen = this.AdjustVal(instanceSchedule.eighteen, cpuSchedule.eighteen, targetThreshold);
            cpuAdjustedInstanceSchedule.nineteen = this.AdjustVal(instanceSchedule.nineteen, cpuSchedule.nineteen, targetThreshold);
            cpuAdjustedInstanceSchedule.twenty = this.AdjustVal(instanceSchedule.twenty, cpuSchedule.twenty, targetThreshold);
            cpuAdjustedInstanceSchedule.twentyOne = this.AdjustVal(instanceSchedule.twentyOne, cpuSchedule.twentyOne, targetThreshold);
            cpuAdjustedInstanceSchedule.twentyTwo = this.AdjustVal(instanceSchedule.twentyTwo, cpuSchedule.twentyTwo, targetThreshold);
            cpuAdjustedInstanceSchedule.twentyThree = this.AdjustVal(instanceSchedule.twentyThree, cpuSchedule.twentyThree, targetThreshold);

            return cpuAdjustedInstanceSchedule;
        }

        private AdjustVal(instanceNumber: number, cpuNumber: number, targetThreshold: number): number {

            var deltaFromThreshold = -((targetThreshold - cpuNumber) / targetThreshold);

            var target = Math.ceil(instanceNumber + (deltaFromThreshold * instanceNumber));

            return target;
        }

        private getTargetThresholdCPU(scaleUpperThresholdCPU: number): number {
            return scaleUpperThresholdCPU - (0.15 * scaleUpperThresholdCPU);
        }

        private CombineASGroupSchedule(onDemandScehdule: rs.Contracts.Schedule, spotScehdule: rs.Contracts.Schedule): rs.Contracts.Schedule {
            if (!onDemandScehdule || !spotScehdule) {
                var errFactory = new ce.Contracts.ErrorFactory();

                var error = errFactory.createOptimizationUnknownError(["Did not get proper schedule objects to combine, this was not expected and is likely a code bug, dev to investigate."]);

                throw new ex.SpotOptimization.SpotOptimizationError(error);
            }

            return onDemandScehdule.doOperation(spotScehdule, rs.Contracts.ScheduleOperation.Add);
        }

        private getCPUMetrics(rq: rq.Contracts.OptimizeRq): any {
            var autoScaleConnector = new as.AWS.autoScaleConnector(
                rq.onDemandAutoScaleGroup, rq.region, rq.awsAccessKeyId, rq.awsSecretAccessKey);

            var deferred = Q.defer();

            autoScaleConnector.getCPUMetricSchedule(rq.numberOfDaysBackToConsider, rq.scalesOn.cpu.scalesWhenGreaterThanThresholdForSecs,
                function (history: rs.Contracts.Schedule, e: ce.Contracts.Error) {
                    if (e) {
                        deferred.reject(e);
                        return;
                    }

                    deferred.resolve(history);
                    return;
                });

            return deferred.promise;
        }

        private getAutoScaleInstanceHistory(rq: rq.Contracts.OptimizeRq, asGroupType: AutoScaleGroupType): any {
            var asGroup = this.getASGroupByType(rq, asGroupType);

            var autoScaleConnector = new as.AWS.autoScaleConnector(
                asGroup, rq.region, rq.awsAccessKeyId, rq.awsSecretAccessKey);

            var deferred = Q.defer();

            autoScaleConnector.getAutoScaleInstanceHistory(rq.numberOfDaysBackToConsider,
                function (history: rs.Contracts.Schedule, e: ce.Contracts.Error) {
                    if (e) {
                        deferred.reject(e);
                        return;
                    }

                    deferred.resolve(history);
                });

            return deferred.promise;
        }

        private getAutoScaleMinGroupSize(rq: rq.Contracts.OptimizeRq, asGroupType: AutoScaleGroupType): any {
            var asGroup = this.getASGroupByType(rq, asGroupType);

            var autoScaleConnector = new as.AWS.autoScaleConnector(
                asGroup, rq.region, rq.awsAccessKeyId, rq.awsSecretAccessKey);

            var deferred = Q.defer();

            autoScaleConnector.getGroupMinSize(
                function (minSize: number, e: ce.Contracts.Error) {
                    if (e) {
                        deferred.reject(e);
                        return;
                    }

                    deferred.resolve(minSize);
                    return;
                });

            return deferred.promise;
        }

        private getASGroupByType(rq: rq.Contracts.OptimizeRq, asGroupType: AutoScaleGroupType): string {
            switch (asGroupType) {
                case AutoScaleGroupType.OnDemand:
                    return rq.onDemandAutoScaleGroup;
                case AutoScaleGroupType.Spot:
                    return rq.spotAutoScaleGroup;
            }
            var errFactory = new ce.Contracts.ErrorFactory();

            var error = errFactory.createNotImplementedError(["The auto scale group type requested is not yet implemented, contact dev"]);

            throw new ex.SpotOptimization.SpotOptimizationError(error);
        }

        private wrapAndThrowUnknownError(e: Error): void {
            throw new ex.SpotOptimization.SpotOptimizationError(this.checkErrorTypeAndWrap(e));
        }

        private checkErrorTypeAndWrap(e): ce.Contracts.Error {
            if (e instanceof ex.SpotOptimization.SpotOptimizationError) {
                return (e as ex.SpotOptimization.SpotOptimizationError).appError;
            }

            if (e instanceof ce.Contracts.Error) {
                return e as ce.Contracts.Error;
            }

            var errorFactory = new ce.Contracts.ErrorFactory();
            return errorFactory.createOptimizationUnknownError([e.message]);
        }
    }

    enum AutoScaleGroupType {
        OnDemand,
        Spot
    }
}
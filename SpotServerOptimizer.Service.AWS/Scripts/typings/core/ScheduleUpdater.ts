import * as rq from '../contracts/optimizeRq';
import * as rs from '../contracts/optimizeRs';
import * as ex from '../errors/SpotOptimizationError';
import * as ce from '../contracts/error';
import * as as from '../aws/autoScaleConnector';

export namespace SpotOptimization {
    export class ScheduleUpdater {
        updateScheduleForOptimizedSpot(rq: rq.Contracts.OptimizeRq, targetScheduleForSpot: rs.Contracts.Schedule,
            callBack: (e: ce.Contracts.Error) => void): void {
            var asConnector = new as.AWS.autoScaleConnector(rq.spotAutoScaleGroup, rq.region, rq.awsAccessKeyId,
                rq.awsSecretAccessKey);

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
        }
    }
}
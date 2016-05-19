import * as v from './requestValidator';
import * as r from '../contracts/optimizeRq';
import * as rs from '../contracts/optimizeRs';
import * as e from '../contracts/error';
import * as oe from '../errors/SpotOptimizationError';
import * as sf from './SpotOptimizerFactory';
import * as i from '../interfaces/IOptimizer';
import * as su from './ScheduleUpdater';
import * as is from '../interfaces/IResponseSender';

export namespace SpotOptimization {
    export class OptimizeCoordinator {
        run(rq: r.Contracts.OptimizeRq, sender: is.SpotOptimization.IResponseSender): void {
            var validator = new v.Validation.OptimizeRqValidator();

            var vResult = validator.validate(rq);

            if (!vResult.isValid()) {
                var errorFactory = new e.Contracts.ErrorFactory();

                return sender.send(400, JSON.stringify(errorFactory.createValidationError(vResult.errors)));
            }
            try {
                var optFactory = new sf.SpotOptimization.SpotOptimizationFactory();
                var optimizer = optFactory.createOptimizer(rq.scalesOn);

                optimizer.optimize(rq, function (resp: rs.Contracts.OptimizeRs, error: e.Contracts.Error) {
                    if (error) {
                        return sender.send(500, JSON.stringify(error));
                    }
                    var scheduleUpdater = new su.SpotOptimization.ScheduleUpdater();
                    scheduleUpdater.updateScheduleForOptimizedSpot(rq, resp.newSpotSchedule, function (e) {
                        if (e) {
                            return sender.send(500, JSON.stringify(e));
                        }
                        return sender.send(200, JSON.stringify(resp));
                    });
                });
            }
            catch (ex) {
                if (ex instanceof oe.SpotOptimization.SpotOptimizationError) {
                    var oError = ex as oe.SpotOptimization.SpotOptimizationError;
                    return sender.send(500, JSON.stringify(oError.appError));
                }
                throw ex;
            }
        }
    }
}
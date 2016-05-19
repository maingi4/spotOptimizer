import * as o from './CPUSpotOptimizer';
import * as i from '../interfaces/IOptimizer';
import * as rq from '../contracts/optimizeRq';
import * as oe from '../errors/SpotOptimizationError';
import * as e from '../contracts/error';

export namespace SpotOptimization {
    export class SpotOptimizationFactory {
        createOptimizer(scalesOn: rq.Contracts.ScalesOn): i.SpotOptimization.ISpotOptimizer {
            if (scalesOn.cpu)
                return new o.SpotOptimization.CPUSpotOptimizer() as i.SpotOptimization.ISpotOptimizer;

            var errFactory = new e.Contracts.ErrorFactory();
            var err = errFactory.createNotImplementedError(["Currently only scaling on CPU is supported by the system, we are working hard to support the other strategies."]);

            throw new oe.SpotOptimization.SpotOptimizationError(err);
        }
    }
}
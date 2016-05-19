import * as e from '../contracts/error';

export namespace SpotOptimization {
    export class SpotOptimizationError implements Error {
        public message = "optimization error, see the appError property for more details.";
        public name = "Spot Optimization Error";

        constructor(public appError: e.Contracts.Error) { }
    }
}
import * as rq from '../contracts/optimizeRq';
import * as rs from '../contracts/optimizeRs';
import * as e from '../contracts/error';

export namespace SpotOptimization {
    export interface ISpotOptimizer {
        optimize(rq: rq.Contracts.OptimizeRq, callback: (resp: rs.Contracts.OptimizeRs, error: e.Contracts.Error) => any) : void;
    }
}
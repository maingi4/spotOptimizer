﻿import * as r from '../contracts/optimizeRq';

export namespace Validation {
    export class OptimizeRqValidator {
        validate(rq: r.Contracts.OptimizeRq): validationResult {
            var errors = new Array<string>();

            if (rq == null) {
                errors.push("request was null, this is not allowed");

                return new validationResult(errors);
            }
            if (!rq.awsAccessKeyId) {
                errors.push("request had awsAccessKeyId as empty.");
            }
            if (!rq.awsSecretAccessKey) {
                errors.push("request had awsSecretAccessKey as empty.");
            }
            if (!rq.onDemandAutoScaleGroup) {
                errors.push("request had onDemandAutoScaleGroup as empty.");
            }
            if (!rq.spotAutoScaleGroup) {
                errors.push("request had spotAutoScaleGroup as empty.");
            }
            if (!rq.region) {
                errors.push("request had region as empty.");
            }
            if (rq.enableTrafficPrediction && !rq.trafficPredictionLoadBalancerName) {
                errors.push("request had traffic prediction enabled but the 'trafficPredictionLoadBalancerName' was empty or invalid.");
            }

            if (!rq.scalesOn) {
                errors.push("request needs to have one (and only one) metric defined on the basis of which scaling happens.");
            } else if (rq.scalesOn.cpu && rq.scalesOn.requestCount) {
                errors.push("request had more than one metric defined on the basis of which scaling happens.");
            } else if (rq.scalesOn.requestCount) {
                if (!rq.scalesOn.requestCount.perServerThresholdPerMin || rq.scalesOn.requestCount.perServerThresholdPerMin < 1)
                    errors.push("request had requestCount as scaling methodology but no/invalid perServerThresholdPerMin value defined.");
            } else if (rq.scalesOn.cpu) {
                if (!rq.scalesOn.cpu.upperThresholdPercent || rq.scalesOn.cpu.upperThresholdPercent < 30)
                    errors.push("request had CPU as scaling methodology but less than 30 or no upperThresholdPercent value defined.");
                if (!rq.scalesOn.cpu.scalesWhenGreaterThanThresholdForSecs || rq.scalesOn.cpu.scalesWhenGreaterThanThresholdForSecs < 10)
                    errors.push("request had CPU as scaling methodology but less than 10 or no scalesWhenGreaterThanThresholdForSecs value defined.");
            }
            
            return new validationResult(errors);
        }
    }

    export class validationResult {
        constructor(public errors: Array<string>) { }

        isValid(): boolean {
            return this.errors.length == 0;
        }
    }
}
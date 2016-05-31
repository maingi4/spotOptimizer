export namespace Contracts {
    export class OptimizeRq {
        region: string;
        onDemandAutoScaleGroup: string;
        spotAutoScaleGroup: string;
        numberOfDaysBackToConsider: number;
        awsAccessKeyId: string;
        awsSecretAccessKey: string;
        maxSpotPerHour: number;
        enableTrafficPrediction: boolean;
        trafficPredictionLoadBalancerName: string;
        scalesOn: ScalesOn;
    }

    export class ScalesOn {
        requestCount: RequestCount;
        cpu: CPU;
    }

    export class RequestCount {
        perServerThresholdPerMin: number;
    }

    export class CPU {
        upperThresholdPercent: number;
        scalesWhenGreaterThanThresholdForSecs: number;
    }
}
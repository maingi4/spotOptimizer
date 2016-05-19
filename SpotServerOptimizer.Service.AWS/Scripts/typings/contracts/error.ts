export namespace Contracts {
    export class Error {
        constructor(private reason: string, private code: number, private messages: Array<string>) { }
    }

    export class ErrorFactory {
        createValidationError(messages: Array<string>): Error {
            return new Error("validation failure", 1, messages);
        }

        createOptimizationUnknownError(messages: Array<string>): Error {
            return new Error("An unknown error occurred while optimizing spot instances, check messages for more details.", 2, messages);
        }

        createOptimizationAWSError(messages: Array<string>): Error {
            return new Error("An aws side error occurred while optimizing spot instances, check messages for more details.", 3, messages);
        }

        createMetricNotFoundError(messages: Array<string>): Error {
            return new Error("Desired metrics were not found which are needed to determine optimizations, check messages for more details.", 4, messages);
        }

        createMetricNotEnoughDataError(messages: Array<string>): Error {
            return new Error("Desired metrics did not have enough data needed to determine optimizations, check messages for more details.", 5, messages);
        }

        createNotImplementedError(messages: Array<string>): Error {
            return new Error("The functionality is not currently implemented, check messages for more details.", 5, messages);
        }
    }
}
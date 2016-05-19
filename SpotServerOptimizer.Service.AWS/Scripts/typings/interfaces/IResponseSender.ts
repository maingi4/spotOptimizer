export namespace SpotOptimization {
    export interface IResponseSender {
        send(httpStatusCode: number, payload: string): any;
    }
}
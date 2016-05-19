import * as is from '../interfaces/IResponseSender';

export namespace SpotRuntime {
    export class HostedResponseSender implements is.SpotOptimization.IResponseSender {

        constructor(private rs) { }

        send(httpStatusCode: number, payload: string): any {
            return this.rs.status(httpStatusCode).send(payload);
        }
    }
}
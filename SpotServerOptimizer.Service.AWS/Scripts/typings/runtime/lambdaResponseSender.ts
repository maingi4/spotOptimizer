import * as is from '../interfaces/IResponseSender';

export namespace SpotRuntime {
    export class LambdaResponseSender implements is.SpotOptimization.IResponseSender {

        constructor(private callback) { }

        send(httpStatusCode: number, payload: string): any {
            //console.log(payload);
            if (httpStatusCode == 200)
                this.callback(null, payload);

            this.callback(this.wrapErrorPayload(httpStatusCode, payload));
        }

        private wrapErrorPayload(httpStatusCode: number, payload: string): string {
            return JSON.stringify(new LambdaErrorWrap(httpStatusCode, payload));
        }
    }

    class LambdaErrorWrap {
        constructor(public httpStatusCode: number, public payload: string) { }
    }
}
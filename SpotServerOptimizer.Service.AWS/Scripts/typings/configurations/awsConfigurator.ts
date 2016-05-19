var aws = require('aws-sdk');

export namespace Configuration {
    export class AWSGlobalConfig {
        setGlobalConfig(): void {
            aws.config.apiVersion = '2016-05-11';
        }
    }
}
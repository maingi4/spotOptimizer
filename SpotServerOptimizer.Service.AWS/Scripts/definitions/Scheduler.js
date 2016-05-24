var https = require('https');

exports.handler = function (event, context, callback) {
    //var body = event; //uncomment this and comment the below line if passing body via cloud watch events (json input, useful for multiple applications with a single lambda function)
    var body = {
        "region": "<the aws region that you are targeting>", //e.g. us-east-1
        "onDemandAutoScaleGroup": "<on demand auto scale group name>",
        "spotAutoScaleGroup": "<spot auto scale group name>",
        "numberOfDaysBackToConsider": 3,
        "awsAccessKeyId": "<your key>", //see aws policy doc (in this folder) for the permissions required in the key.
        "awsSecretAccessKey": "<key's secret>",
        "maxSpotPerHour": 20, //some sane limit
        "scalesOn": {
            "cpu": {
                "upperThresholdPercent": 60, //see the on demand auto scale group's scaling policy for this. 
                "scalesWhenGreaterThanThresholdForSecs": 300 //see the on demand auto scale group's scaling policy for this. 
            }
        }
    };
    var baseUrl = '<base url of the api>';
    var url = "/prod"; //path of the gateway
    var apiKey = "<your api key for api gateway>";
    
    var post_data = JSON.stringify(body);
    
    var post_options = {
        host: baseUrl,
        port: '443',
        path: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    };
    
    var rateExceededMatcher = function (messages) {
        var i = messages.length;
        while (i--) {
            if (messages[i].indexOf('Rate exceeded') > -1) {
                return true;
            }
        }
        return false;
    };
    var attempt = 1;
    var caller = function () {
        var req = https.request(post_options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (rawBody) {
                if (res.statusCode == 200) {
                    callback(null, rawBody);
                    return;
                }
                var body = JSON.parse(rawBody);
                
                if (rateExceededMatcher(body.messages) && attempt <= 3) {
                    console.log("rate limit exceeded error detected, sleeping and retrying... this is attempt #" + attempt);
                    attempt++;
                    setTimeout(caller, 2000);
                    return;
                }
                console.log(rawBody);
                callback(rawBody);
            });
        });
        req.write(post_data);
        req.end();
    };
    
    caller();
};
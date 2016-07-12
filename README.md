Pre-Requistes
-------------

You should be using AWS as your cloud provider.

Read this first: <https://cloudncode.wordpress.com/2016/07/07/devops-hybrid-scale-strategy-aws/>

You should already be setup with auto scaling and know its basics.

What is it?
-----------

It’s an API which can be hosted in Lambda in conjunction with API gateway so that you pay next to nothing for using it or on any server which can run NodeJS. The API accepts certain parameters as input e.g.

```javascript
    {
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
```

And adds hourly schedules to the spot auto scaling group mentioned in the request to pro-actively add spot instances that you would need in order to minimize cost of running on demand instances. Spot servers cost a fraction of the cost of on demand and are significantly cheaper than reserved instances as well.

How Do I Call this API?
-----------------------

In the project is a script which can be used to create a Lambda function in AWS (with inline code, it’s simple) which can be set to run on a schedule to call the API everyday, once a day is recommended to keep the schedule up to date as the load changes or your applications ability to handle load changes.

The latter mentioned script can be found in the project code here: <https://github.com/maingi4/spotOptimizer/blob/master/SpotServerOptimizer.Service.AWS/Scripts/definitions/Scheduler.js>

Easier though is to go through the setup guide here: <https://github.com/maingi4/spotOptimizer/wiki/Setting-It-Up>

What Kinds of Scaling Policies does this API Support?
-----------------------------------------------------

Currently it only supports CPU based scaling, I will add other scaling types in time, and I will welcome contributions to this project to add more “Optimizers” {CPUOptimizer is the only one which exists right now} to support more strategies.

Why an API?
-----------

API, so that you need only one to handle multiple AWS accounts, in the set up guide in this wiki you can choose to skip making an API and instead just create a Lambda function and schedule it for a single or multiple auto scaling groups.

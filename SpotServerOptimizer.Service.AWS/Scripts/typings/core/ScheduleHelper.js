"use strict";
var rs = require('../contracts/optimizeRs');
var SpotOptimization;
(function (SpotOptimization) {
    var ScheduleHelper = (function () {
        function ScheduleHelper() {
        }
        ScheduleHelper.prototype.createMonotoneSchedule = function (valToSet) {
            var schedule = new rs.Contracts.Schedule();
            schedule.zero = valToSet;
            schedule.one = valToSet;
            schedule.two = valToSet;
            schedule.three = valToSet;
            schedule.four = valToSet;
            schedule.five = valToSet;
            schedule.six = valToSet;
            schedule.seven = valToSet;
            schedule.eight = valToSet;
            schedule.nine = valToSet;
            schedule.ten = valToSet;
            schedule.eleven = valToSet;
            schedule.twelve = valToSet;
            schedule.thirteen = valToSet;
            schedule.fourteen = valToSet;
            schedule.fifteen = valToSet;
            schedule.sixteen = valToSet;
            schedule.seventeen = valToSet;
            schedule.eighteen = valToSet;
            schedule.nineteen = valToSet;
            schedule.twenty = valToSet;
            schedule.twentyOne = valToSet;
            schedule.twentyTwo = valToSet;
            schedule.twentyThree = valToSet;
            return schedule;
        };
        return ScheduleHelper;
    }());
    SpotOptimization.ScheduleHelper = ScheduleHelper;
})(SpotOptimization = exports.SpotOptimization || (exports.SpotOptimization = {}));
//# sourceMappingURL=ScheduleHelper.js.map
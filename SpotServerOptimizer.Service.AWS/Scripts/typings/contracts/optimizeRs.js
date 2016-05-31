"use strict";
var extend = require('util')._extend;
var Contracts;
(function (Contracts) {
    var OptimizeRs = (function () {
        function OptimizeRs() {
        }
        return OptimizeRs;
    }());
    Contracts.OptimizeRs = OptimizeRs;
    var Schedule = (function () {
        function Schedule() {
            this.zero = 0;
            this.one = 0;
            this.two = 0;
            this.three = 0;
            this.four = 0;
            this.five = 0;
            this.six = 0;
            this.seven = 0;
            this.eight = 0;
            this.nine = 0;
            this.ten = 0;
            this.eleven = 0;
            this.twelve = 0;
            this.thirteen = 0;
            this.fourteen = 0;
            this.fifteen = 0;
            this.sixteen = 0;
            this.seventeen = 0;
            this.eighteen = 0;
            this.nineteen = 0;
            this.twenty = 0;
            this.twentyOne = 0;
            this.twentyTwo = 0;
            this.twentyThree = 0;
        }
        Schedule.prototype.setPropertyByHour = function (hour, value) {
            switch (hour) {
                case 0:
                    this.zero = value;
                    break;
                case 1:
                    this.one = value;
                    break;
                case 2:
                    this.two = value;
                    break;
                case 3:
                    this.three = value;
                    break;
                case 4:
                    this.four = value;
                    break;
                case 5:
                    this.five = value;
                    break;
                case 6:
                    this.six = value;
                    break;
                case 7:
                    this.seven = value;
                    break;
                case 8:
                    this.eight = value;
                    break;
                case 9:
                    this.nine = value;
                    break;
                case 10:
                    this.ten = value;
                    break;
                case 11:
                    this.eleven = value;
                    break;
                case 12:
                    this.twelve = value;
                    break;
                case 13:
                    this.thirteen = value;
                    break;
                case 14:
                    this.fourteen = value;
                    break;
                case 15:
                    this.fifteen = value;
                    break;
                case 16:
                    this.sixteen = value;
                    break;
                case 17:
                    this.seventeen = value;
                    break;
                case 18:
                    this.eighteen = value;
                    break;
                case 19:
                    this.nineteen = value;
                    break;
                case 20:
                    this.twenty = value;
                    break;
                case 21:
                    this.twentyOne = value;
                    break;
                case 22:
                    this.twentyTwo = value;
                    break;
                case 23:
                    this.twentyThree = value;
                    break;
            }
        };
        Schedule.prototype.shallowCopy = function () {
            return extend({}, this);
        };
        Schedule.prototype.doOperation = function (other, operator) {
            if (other == null)
                return this;
            this.zero = this.operate(this.zero, other.zero, operator);
            this.one = this.operate(this.one, other.one, operator);
            this.two = this.operate(this.two, other.two, operator);
            this.three = this.operate(this.three, other.three, operator);
            this.four = this.operate(this.four, other.four, operator);
            this.five = this.operate(this.five, other.five, operator);
            this.six = this.operate(this.six, other.six, operator);
            this.seven = this.operate(this.seven, other.seven, operator);
            this.eight = this.operate(this.eight, other.eight, operator);
            this.nine = this.operate(this.nine, other.nine, operator);
            this.ten = this.operate(this.ten, other.ten, operator);
            this.eleven = this.operate(this.eleven, other.eleven, operator);
            this.twelve = this.operate(this.twelve, other.twelve, operator);
            this.thirteen = this.operate(this.thirteen, other.thirteen, operator);
            this.fourteen = this.operate(this.fourteen, other.fourteen, operator);
            this.fifteen = this.operate(this.fifteen, other.fifteen, operator);
            this.sixteen = this.operate(this.sixteen, other.sixteen, operator);
            this.seventeen = this.operate(this.seventeen, other.seventeen, operator);
            this.eighteen = this.operate(this.eighteen, other.eighteen, operator);
            this.nineteen = this.operate(this.nineteen, other.nineteen, operator);
            this.twenty = this.operate(this.twenty, other.twenty, operator);
            this.twentyOne = this.operate(this.twentyOne, other.twentyOne, operator);
            this.twentyTwo = this.operate(this.twentyTwo, other.twentyTwo, operator);
            this.twentyThree = this.operate(this.twentyThree, other.twentyThree, operator);
            return this;
        };
        Schedule.prototype.operate = function (first, second, operator) {
            if (!first && !second)
                return 0;
            if (!first)
                return second;
            if (!second)
                return first;
            switch (operator) {
                case ScheduleOperation.Add:
                    return first + second;
                case ScheduleOperation.Substract:
                    return first - second;
            }
            throw new Error("This operand is not implemented for schedule operations, the operand was: " + operator.toString());
        };
        return Schedule;
    }());
    Contracts.Schedule = Schedule;
    (function (ScheduleOperation) {
        ScheduleOperation[ScheduleOperation["Add"] = 0] = "Add";
        ScheduleOperation[ScheduleOperation["Substract"] = 1] = "Substract";
    })(Contracts.ScheduleOperation || (Contracts.ScheduleOperation = {}));
    var ScheduleOperation = Contracts.ScheduleOperation;
})(Contracts = exports.Contracts || (exports.Contracts = {}));
//# sourceMappingURL=optimizeRs.js.map
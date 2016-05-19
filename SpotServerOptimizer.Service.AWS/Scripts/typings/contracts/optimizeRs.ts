var extend = require('util')._extend;

export namespace Contracts {
    export class OptimizeRs {
        newOverallSchedule: Schedule;
        newSpotSchedule: Schedule;
        avgPrevSchedule: Schedule;
    }

    export class Schedule {
        public zero: number;
        public one: number;
        public two: number;
        public three: number;
        public four: number;
        public five: number;
        public six: number;
        public seven: number;
        public eight: number;
        public nine: number;
        public ten: number;
        public eleven: number;
        public twelve: number;
        public thirteen: number;
        public fourteen: number;
        public fifteen: number;
        public sixteen: number;
        public seventeen: number;
        public eighteen: number;
        public nineteen: number;
        public twenty: number;
        public twentyOne: number;
        public twentyTwo: number;
        public twentyThree: number;

        setPropertyByHour(hour: number, value: number) {
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
        }

        shallowCopy(): Schedule {
            return extend({}, this);
        }

        doOperation(other: Schedule, operator: ScheduleOperation): Schedule {
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
        }

        private operate(first: number, second: number, operator: ScheduleOperation): number {
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
        }
    }
    export enum ScheduleOperation {
        Add,
        Substract
    }
}
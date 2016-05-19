import * as rs from '../contracts/optimizeRs';

export namespace SpotOptimization {
    export class ScheduleHelper {
        createMonotoneSchedule(valToSet: number): rs.Contracts.Schedule {
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
        }
    }
}
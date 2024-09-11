import moment from "moment";

export const dateDifference = (date1: any, date2: any) => {

    var start = moment(date1);

    var end = moment(date2);

    let difference = end.diff(start, "days")

    return difference;

}
function process(blockNumber, data) {
    data = JSON.parse(data);
    data = blockAware(blockNumber, data);
    if (data.length === 0) {
        return { status: 'NO_DATA' };
    }
    block = getBestBlockMatch(data);
    return ruleCheck(block);
}

/*Pass an array of days that the person CAN park here, returns true if they can park */
function isDayAllowed(allowedDays) {
    var d = new Date();
    var today = d.getDay(); //0-6 index 0 = sunday
    return (allowedDays.indexOf(today) > -1);
}

/*Pass a start and end time(24 hour format), if within that time, returns true if they can park */
//.25 = 15, .5 = ,0, .75 = 45, 00 = 0
function isTimeAllowed(startTime, endTime) {
    var d = new Date();
    var currentTime = d.getHours()
    currentTime = currentTime + (d.getMinutes() / 60); //minutes = 30, 30 / 60 = .5, so time is x:30
    return (endTime - currentTime >= 0 && currentTime - startTime >= 0)
}

/*Make sure we have data for the street number the user is at, remove unrelated block info */
function blockAware(blockNumber, data) {
    data.forEach(function (blockGroup) {
        var block = blockGroup.block;
        if (isNaN(block) || blockNumber > block + 100 || blockNumber < block - 100) { //blockNumber = 321, block = 300, 321 < 300 + 150 
            blockGroup.remove = true;
        } else {
            blockGroup.score = Math.abs(blockNumber - block); //Lower the score the better 200-100 = 100, so kinda far off, 100-100 = 0, right on the location
        }
    });

    for (var i = data.length - 1; i >= 0; i--) {
        if (data[i].remove) {
            data.splice(i, 1);
        }
    }
    return data;
}

/*Returns the block that is closest to the user(in the case there are a few aware matches) */
function getBestBlockMatch(data) {
    best = data[0];
    for (var i = 0; i < data.length; i++) {
        if (best.score > data[i].score) {
            best = data[i];
        }
    }
    return best;
}

/* lol */
function ruleCheck(data) {
    var ruleString = data.postedrestrictions;
    switch (ruleString) {
        case "\"Two Hour Parking, in Area #9/Monday thru Saturday 7:00 a.m. - 6:00 p.m./Sunday 7:00 a.m. - 2:00 p.m./except with Area #9/No Parking in Area #9 Monday thru Sunday morning 6pm-7am/Sunday thru Monday morning 2pm-7am/Except with Area 9 permit/Tow away Zone During Stadium Events/Tow away Zone, except with Area #9 permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5, 6]) && isTimeAllowed(7.00, 18.00)) {
                return { valid: true, restraints: ['2 hour parking', 'Tow away during stadium events.', 'No parking 6:00PM to 7:00AM'], unless: 'Area #9 Permit' }
            } else if (isDayAllowed([0]) && isTimeAllowed(7.00, 14.00)) {
                return { valid: true, restraints: ['2 hour parking', 'Tow away during stadium events.', 'No parking 2:00PM to 7:00AM'], unless: 'Area #9 Permit' }
            } else {
                return { valid: false, unless: 'Area #9 Permit' }
            }
            break;
        case "\"No Parking 5 p.m to 10 p.m Monday - Friday , 8a.m to 10 p.m Saturday and Sunday except with Area #44 Permit\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(8.00, 22.00)) {
                return { valid: false }
            } else if (isDayAllowed([6, 0]) && isTimeAllowed(8.00, 22.00)) {
                return { valid: false, unless: 'Area #44 Permit' };
            } else {
                return { valid: true };
            }
            break;
        case "\"Two Hour Parking, Monday through Friday, except with Area #1 Permit\"":
            if (isDayAllowed([1, 2, 3, 4, 5])) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #1 Permit' };
            } else {
                return { valid: true };
            }
            break;
        case "\"Two Hour Parking, 7:00 a.m. - 7:00 p.m., Monday through Friday, except with Area #2 Permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #2 Permit' }
            } else {
                return { valid: true }
            }
            break;
        case "\"Two Hour Parking, 7:00 a.m. - 12 Midnight, Monday through Friday, except with Area #3 Permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 24.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #3 Permit' };
            } else {
                return { valid: true };
            }
            break;
        case "\"No Parking 12:00 p.m. - 5:00 p.m. except with area permit #4 during Race Days.\"":
            if (!isTimeAllowed(12.00, 17.00)) {
                return { valid: false, unless: 'Area #4 Permit on a Race Day' };
            } else {
                return { valid: true, restraints: ['No parking 12:00 PM to 5:00 PM'], unless: 'Area #4 Permit and a Race Day' };
            }
            break;
        case "\"Two Hour Parking, 7:00 a.m. - 12 Midnight, Except with Area #5 Permit./Notice Stadium Event: Reserved Parking, 1 Hour Parking Limit, 3:00 p.m. - 10:00 p.m./Monday through Friday, 1:00 p.m. - 12 Midnight, Saturday and Sunday, Except Area #5 Permit Holders.  Tow away Zone.\"":

            break;

        case "\"Two Hour Parking, 7:00 a.m. - 7:00 p.m., Monday through Friday, Except with Area #6 Permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #6 Permit' }
            } else {
                return { valid: true }
            }
            break;

        case "2 Hour Limit 8:00 a.m to midnight 7 days a week except with Area 43 Permit":
            if (isDayAllowed([0, 1, 2, 3, 4, 5, 6]) && isTimeAllowed(8.00, 24.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #43 Permit' };
            } else {
                return { valid: true };
            }
            break;
        case "\"No Parking except Area 8 Permit Holders.  Tow away Zone.\"":
            return { valid: false, restraints: ['Area #8 Permit Parking Only'] }
            break;
        case "\"Two Hour Parking, 7:00 a.m. - 7:00  p.m., Monday through Friday, except with Area #10 permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: false, restraints: ['Two hour parking'], unless: 'Area #10 Permit' };
            } else {
                return { valid: true };
            }
            break;
        case "\"Two Hour Parking, 7:00 a.m. - 2:00 a.m., Sunday through Saturday except with Area #16 Permit.\"":
            if (isDayAllowed([0, 1, 2, 3, 4, 5, 6]) && (isTimeAllowed(7.00, 24.00) || isTimeAllowed(0.00, 2.00))) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #16 Permit' };
            } else {
                return { valid: true }
            }
            break;
        case "\"Two Hour Parking, 7:00 a.m. - 7:00 p.m., Monday through Friday, except with Area #11 Permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #11 Permit' }
            } else {
                return { valid: true };
            }
            break;
        case "\"Two Hour Parking, 7:00 a.m.-7:00 p.m., Monday through Friday, except with Area #12 Permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #12 Permit' };
            } else {
                return { valid: true }
            }
            break;
        case "\"No Parking 7am-12 midnight Monday thru Saturday except with Area 36 permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 24.00)) {
                return { valid: false, unless: 'Area #36 Permit' }
            } else {
                return { valid: true }
            }
            break;
        case "\"Two Hour Parking, 7:00 a.m. - 7:00 p.m., Monday through Friday except with Area #13 Permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: true, restraints: 'Two hour parking', unless: 'Area #13 Permit' };
            } else {
                return { valid: true };
            }
            break;
        case "\"Three Hour Parking, 8:00 a.m. - 12 Midnight, Sunday through Saturday, except with Area #14 Permit.\"":
            if (isDayAllowed([0, 1, 2, 3, 4, 5, 6]) && isTimeAllowed(8.00, 12.00)) {
                return { valid: true, restraints: ['Three hour parking'], unless: 'Area #14 Permit' }
            } else {
                return { valid: true }
            }
            break;
        case "\"Two Hour Parking 7:00 a.m. - 7:00 p.m., Monday through Friday, except with Area #17 Permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #17 Permit' };
            } else {
                return { valid: true }
            }
            break;
        case "\"Two Hour Parking, 7:00 a.m. - 7:00 p.m., Monday through Friday, except with Area #18 Permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #18 Permit' };
            } else {
                return { valid: true };
            }
            break;
        case "\"Two Hour Parking 7:00 a.m.- 7:00  p.m. Monday through Friday, except with Area #22 Permit":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #22 Permit' };
            } else {
                return { valid: true };
            }
            break;
        case "\"Two Hour Parking 7AM - 8PM Monday through Friday except with Area #23 Permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 20.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #23 Permit' };
            } else {
                return { valid: true }
            }
            break;
        case "\"Two Hour Parking 7:00 a.m.- 7:00 p.m. Monday through Friday except with Area #20 Permit\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #20 Permit' };
            }
            return { valid: true };
        case "\"Two Hour Parking 2:30 p.m. - 8:30 p.m. Monday through Friday, except with Area #21 Permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(14.5, 20.5)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #21 Permit' };
            }
            return { valid: true };

        case "\"Two Hour Parking Limit 7:00 a.m. - 7:00 p.m., Monday through Friday, except with Area #24 Permit.\"":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: true, restraints: ['Two hour parking'], unless: 'Area #43 Permit' }
            }
            return { valid: true };
        case "\"Two Hour Parking Limit 7:00 a.m. - 7:00 p.m. Monday through Friday, except with Area #25 permit.\"":
            return base2Hour([1, 2, 3, 4, 5], 7.00, 19.00, 'Two hour parking', 'Area #43 permit');
        case "\"Two Hour Parking Limit, 7:00 a.m. - 7:00 p.m., Monday through Friday, except with Area #26 permit.\"":
            return base2Hour([1, 2, 3, 4, 5], 7.00, 19.00, 'Two hour parking', 'Area #26 permit');
        case "\"Two Hour Parking 7:00 a.m. to 8:00 p.m., Monday through Friday except with Area #28 permits.\"":
            return base2Hour([1, 2, 3, 4, 5], 7.00, 20.00, 'Two hour parking', 'Area #28 permits');
        case "\"Two Hour Parking, 7am-12 midnight except with Area #33 Permit.\"":
            return base2Hour([0, 1, 2, 3, 4, 5, 6], 7.00, 24.00, 'Two hour parking', 'Area #33 permit');
        case "\"Permit Parking Tow away Zone, 8:00 a.m. - 12 Midnight, with area #27 permit.\"":
            if (!isTimeAllowed(8.00, 24.00)) {
                return { valid: true, restraints: ['Tow away zone between 8:00am and Midnight'], unless: 'Area #27 permit' }
            }
            return { valid: false };
        case "\"Two Hour Parking, Monday through Friday, except with Area #34 Permit.\"":
            return base2Hour([1, 2, 3, 4, 5], 0.00, 24.00, 'Two hour parking', 'Area #34 permit')
        case "\"Two Hour Parking Limit 7:00 a.m. -10:00 p.m. Monday through Friday except with Area # 37 permit.\"":
            return base2Hour([1, 2, 3, 4, 5], 7.00, 22.00, 'Two hour parking', 'Area #37 permit');
        case "\"Two Hour Parking, Monday through Friday, 7am-7pm, except with Area #35 Permit.\"":
            return base2Hour([1, 2, 3, 4, 5], 7.00, 19.00, 'Two hour parking', 'Area #35 permit');
        case "\"Two Hour Parking Limit, 7:00 a.m. - 7:00 p.m. Monday through Friday, except with Area 29 Permit.\"":
            return base2Hour([1, 2, 3, 4, 5], 7.00, 19.00, 'Two hour parking', 'Area #29 permit');
        case "\"2 HOUR PARKING/SEVEN DAYS FROM 7:00 A.M. - 7:00 PM, WITHOUT VALID RPP STICKER FOR AREA 31\"":
            return base2Hour([0, 1, 2, 3, 4, 5, 6], 7.00, 19.00, 'Two hour parking', 'Area #31 permit');
        case "\"Parking  in Area #32 7:00 a.m.through 7:00 p.m. Monday thru Friday":
            return { valid: true };
        case "7:00 a.m. though 7:00 p.m., Monday thru Friday, except with Area 32 permits":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(7.00, 19.00)) {
                return { valid: true, restraints: 'Only 7am to 7pm', unless: 'Area #32 permit' }
            }
            return { valid: true }
        case "\"No Parking from 7AM-12 Midnight Sunday through Saturday Except with Area 39 Permit.\"":
            if (isDayAllowed([0, 1, 2, 3, 4, 5, 6]) && isTimeAllowed(7.00, 24.00)) {
                return { valid: false, restraints: ['No parking from 7am to midnight'], unless: 'Area #39 permit' }
            }
            return { valid: true }
        case "Zero (0) Hour Parking Without Permit #41":
            return { valid: false, restraints: ['No parking'], unless: 'Area #41 permit' };
        case "No Parking 5 p.m to 10 p.m Monday - Friday , 8a.m to 10 p.m Saturday and Sunday except with Area #44 Permit":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(17.00, 22.00)) {
                return { valid: false, unless: 'Area #44 permit' }
            } else if (isDayAllowed([0, 6]) && isTimeAllowed(8, 22)) {
                return { valid: false, unless: 'Area #44 permit' }
            } else {
                return { valid: true, restraints: ['No parking M-F 5pm to 10pm', 'No parking Saturday & Sunday from 8am to 10pm'], unless: 'Area #33 permit' }
            }
        case "\"Special Parking 7:00 a.m. - 7:00 p.m. Monday through Saturday except Permit Holders\"":
            return { valid: false, restraints: ['Special parking only'], unless: 'Permit holder' };
        case "No Parking in Area #40 1:00 p.m.- 9:00 p.m. Except Area 40 Permit Holders,Tow away Zone during Stadium Events":
            if (isTimeAllowed(13, 21)) {
                return { valid: false, restraints: ['Area #40 permit holders only'] }
            }
            return { valid: true, restraints: ['Tow away zone during events'] }
        case "Permit Parking Area No Parking 3 p.m - 12 midnight Monday through Friday 8 a.m - Midnight Saturday & Suday":
            if (isDayAllowed([1, 2, 3, 4, 5]) && isTimeAllowed(15, 24) || isDayAllowed([0, 6]) && isTimeAllowed(8, 24)) {
                return { valid: false, restraints: ['Permit parking only'] }
            }
            return { valid: true }
        case "\"Two Hour Parking 7:00 a.m. - 7:00 p.m. Monday through Friday/Notice Stadium Event No Parking, 3:00 p.m. - 12 Midnight, Monday through Friday/12 Noon - 12 Midnight, Saturday and Sunday in Area #15 except Permit Holders/Tow away Zone.\"":
            if(isDayAllowed([1,2,3,4,5]) && isTimeAllowed(7, 19)){
                return {valid: true, restraints: ['Two hour parking'], unless: 'Area #15 permit '}
            }else if(isDayAllowed([0,6]) && isTimeAllowed(12,24)){
                return {valid: false, restraints: ['Tow away zone'], unless: 'Area #15 permit'}
            }else if(isDayAllowed([1,2,3,4,5]) && isTimeAllowed([15, 24])){
                return {valid:true, restraints: ['2 hour parking', 'No event parking'], unless: 'Area #15 permit'}
            }else{
                return {valid: true}
            }
        case "\"Two Hour Parking, 7:00 a.m. - 12 Midnight/Notice Stadium Event Restricted Parking/One Hour Parking Limit, 3:00 p.m. - 10:00 p.m., Monday through Friday, 1:00 p.m. - 12 Midnight, Saturday through Sunday, Tow away Zone except with Area #19 Permit.\"":

        case "Stadium Event Restricted Parking/1 Hour Parking Limit, 3:00pm - 10:00pm, Monday through Friday, / Saturday and Sunday 1:00pm - 12 Midnight, Area B except permit holders / tow away zone":

        case "\"Two Hour Parking, Limit in Area #30 7am - 6pm Monday thru Saturday/7am - 2 pm Sunday except with Area #30/No Parking in Area #30 6pm-7am Monday thru Sunday Morning/2pm-7am Sunday thru Monday Morning Except with Area #30 permit Tow away Zone During Stadium Event.\"":

        case "\"Two Hour Parking, in Area #9/Monday thru Saturday 7:00 a.m. - 6:00 p.m./Sunday 7:00 a.m. - 2:00 p.m./except with Area #9/No Parking in Area #9 Monday thru Sunday morning 6pm-7am/Sunday thru Monday morning 2pm-7am/Except with Area 9 permit/Tow away Zone During Stadium Events/Tow away Zone, except with Area #9 permit.\"":

        return {}




    }
    return ruleString;
}

function base2Hour(days, startTime, endTime, restraints, unless) {
    if (isDayAllowed(days) && isTimeAllowed(startTime, endTime)) {
        return { valid: true, restraints: restraints, unless: unless }
    }
    return { valid: true }
}

module.exports.process = process;
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
//.25 = 15, .5 = 30, .75 = 45, 00 = 0
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
    }
    return ruleString;
}

module.exports.process = process;
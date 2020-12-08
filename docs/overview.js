// Function to animate numbers to count up from start to end
function animateValue(id, start, end, endValue, duration) {
    // assumes integer values for start and end

    var obj = document.getElementById(id);
    var range = end - start;
    // no timer shorter than 50ms (not really visible any way)
    var minTimer = 50;
    // calc step time to show all interediate values
    var stepTime = Math.abs(Math.floor(duration / range));

    // never go below minTimer
    stepTime = Math.max(stepTime, minTimer);

    // get current time and calculate desired end time
    var startTime = new Date().getTime();
    var endTime = startTime + duration;
    var timer;

    function run() {
        var now = new Date().getTime();
        var remaining = Math.max((endTime - now) / duration, 0);
        var value =  Math.round(end - (remaining * range));

        obj.innerHTML = value;
        if (value == end) {
            obj.innerHTML = endValue;
            clearInterval(timer);
        }
    }

    timer = setInterval(run, stepTime);
    run();
}

// Animate total ghg emissions number
animateValue("total-ghg", 0, 49, 49.4, 3000);
animateValue("temp-num", 0, 12,  "12&#8457;" ,3000);

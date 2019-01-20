//get label commands and goto commands
//create labels object from labels



//output label object setup
//output label condition initialization

var labels = {};
labels.order = ['start', 'middle1', 'middle2', 'end'];
labels.conditions = [];

//initialize all conditions to true;
var i, length = labels.order.length;
for (i = 0; i < length; i++) {
    labels.conditions[labels.order[i]] = true;
}

var i = 0;
end:
while (labels.conditions.start) {

    middle2:
    while (labels.conditions.middle2) {

        middle1:
        while (labels.conditions.middle1) {

            start:
            while (labels.conditions.start) {
                currentLabel = 'start';

                //start stuff
                console.log("start");

                break start;
            }

            currentLabel = 'middle1';

            //middle1 stuff
            console.log('middle1');

            while (false) {
                console.log("middle1 loop");
                if (true) {

                }
            }
            if (i >= 2) {
                console.log('i >= 2');
                console.log('going to end');
                eval(goto(currentLabel, 'end', labels));
            } else if(i === 1) {
                i++;
                console.log('i === 1');
                console.log('going to middle1');
                eval(goto(currentLabel, 'middle1', labels));
            } else {
                console.log('i < 1');
            } 

            break middle1;
        }

        currentLabel = 'middle2';

        //middle2 stuff
        console.log('middle2');
        i++;
        console.log('going to start');
        //continue middle2;
       // new Function(goto(currentLabel, 'start', labels));
       // eval(goto(currentLabel, 'start', labels));

        break middle2;
    }

    currentLabel = 'end';

    //end stuff
    console.log('end');

    break end;
}

//Returns a function. When the function is invoked in the appropriate context, it will go to the
//target label.
function goto(currentLabel, targetLabel, labels) {
    /*
    -to go to a loop outside the current loop, just lookup and break the loop immediately inside it
    -to go to current, set current loop condition to true and inner conditions to false, continue current loop
    -to go to a loop inside current, set conditions of labels preceding the target to false, 
    those between the target and current (including target and current) to true, continue current
    */

    //get indices of current and target labels
    var currentIndex, targetIndex;
    for (i = 0; i < length; i++) {
        if (labels.order[i] === currentLabel) {
            currentIndex = i;
        }
        if (labels.order[i] === targetLabel) {
            targetIndex = i;
        }
    }

    //make sure target exists
    if (targetIndex === undefined) {
        return function () { console.log("Error: Target label not found."); };
    }

    //the target label is the current label
    if (currentIndex === targetIndex) {

        labels.conditions[currentLabel] = true;

        for (i = 0; i < currentIndex; i++) {
            labels.conditions[labels.order[i]] = false;
        }

        action = "continue " + currentLabel + ";";
    }

    //the target label is outside (comes after) the current label
    else if (targetIndex > currentIndex) {
        var labelInsideTarget = labels.order[targetIndex - 1];

        action = "break " + labelInsideTarget + ";";
    }

    //the target label is inside (comes before) the current label
    else {
        for (i = 0; i <= currentIndex; i++) {
            if (i < targetIndex) {
                labels.conditions[labels.order[i]] = false;
            } else {
                labels.conditions[labels.order[i]] = true;
            }
        }

        action = "continue " + currentLabel + ";";
    }
    
    return action;
    //var result = new Function(action);
}
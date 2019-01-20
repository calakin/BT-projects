var fs = require('fs');
var fileToParse = "./JSONFiles/" + process.argv[2];
var fileToWrite = "./outputScripts/" + process.argv[3];

if (!fileToParse) {
    return console.log("Enter a JSON file to parse.\nUsage: 'node test1.js fileToParse fileToWrite'");
}

if (!fileToWrite) {
    return console.log("Enter a file name to write to.\nUsage: 'node test1.js fileToParse fileToWrite'");
}

generateJavascript();

/**
 * generateJavascript is the highest level function in ScreenToScript. All operations, other
 * than including modules and checking command line arguments, happen with it. It reads the 
 * JSON file, interprets them to Puppeteer, where necessary, or just Javascript, and
 * outputs the resulting string. 
 */
async function generateJavascript() {

    //read the Kantu commands into a JSON object from the given json file
    fs.readFile(fileToParse, 'utf8', function (err, data) {
        if (err) return console.log(err);

        //trim and parse to json
        data = data.trim();
        events = JSON.parse(data);

        //turn into a script
        var functionCalls = extractFunctionCalls(events);
        functionCalls = labelFunctionCalls(functionCalls, events);
        var output = accumulateOutput(functionCalls);

        //write the script under the given filename
        fs.writeFile(fileToWrite, output, function (err) {
            if (err) {
                console.log("Error while writing file: ");
                return console.log(err);
            }
        });
    });
}

/**
 * Takes the object containing Kantu commands and rewrites them into the
 * appropriate function call. Functions called are in ScreenToScriptUtil.js.
 * For flow control statements (label, goto, while, etc.), functions are not
 * called-- instead the output string is rewritten to implement them.
 * @param {object} events is an object containing the Kantu commands. 
 */
function extractFunctionCalls(events) {
    var labelCount = 0;
    var functionCalls = "";
    var i, length = events.Commands.length;

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    }

    for (i = 0; i < length; i++) {
        var command = events.Commands[i].Command;
        var target = events.Commands[i].Target;
        var value = events.Commands[i].Value;

        target = target.replaceAll("'", "\\\'");
        target = target.replaceAll('"', '\\\"');
        value = value.replaceAll("'", "\\\'");
        value = value.replaceAll('"', '\\\"');

        if (!isFlowControl(command)) {
            functionCalls += ("await " + command + "_('" + target + "', '" + value + "', storedValues);\n");
        } else {
            if (command === "if" || command === "while") {
                functionCalls += (command + "(eval(insertStoredValues(\"" + target + "\", storedValues))) {\n");
            } else if (command === "endif" || command === "endWhile") {
                functionCalls += "}\n";
            } else if (command === "else") {
                functionCalls += "} else {\n"
            } else if (command === "label") {
                if(labelCount !== 0) {
                    functionCalls += "//endlabel\n";
                }
                functionCalls += "//label " + target + ":\n"
                labelCount++;
            } else if (command === "gotoIf") {
                functionCalls += "if (eval(insertStoredValues(\"" + target + "\", storedValues))) {\n";
                functionCalls += "//goto " + value + "\n";
                functionCalls += "}\n";
            } else if (command === "gotoLabel") {
                functionCalls += "//goto " + target + "\n";
            }
        }
    }

    if(labelCount !== 0) {
        functionCalls += '//endlabel\n';
    }

    return functionCalls;
}

/**
 * Takes the generated code and adds the setup code and some formatting.
 * @param {string} functionCalls is the string containing the operations to be performed by the output file.
 */
function accumulateOutput(functionCalls) {
    var setupStart =
        "var fs = require('fs');\n" + 
        "var $ = require('jQuery');\n" +
        "const delay = require('delay');\n" +   
        "var xpath2css = require('xpath2css');\n" +
        "var puppeteer = require('puppeteer');\n" +  
        "eval(fs.readFileSync('ScreenToScriptUtil.js')+'');\n\n" +      
        "var curpage = null;\n" +
        "var browserTabs = []; \n" +
        "var lastIndex = 0\n" +
        "var nextPrompt = ''; \n" +
        "var tempContainer = null\n\n" + 
        "runTest();\n\n" +
        "async function runTest() {\n" +
        "\tawait puppeteer.launch({ headless: false, args: ['--start-maximized'] }).then(async browser => {\n\n" +
        "\t\t//setup puppeteer\n" +
        "\t\tcurpage = await browser.newPage();\n" +
        "\t\tawait curpage._client.send('Emulation.clearDeviceMetricsOverride');\n\n"+
        '\t\tawait delay(1000);\n'+
        `\t\tvar winWidth = await curpage.evaluate(() => { return window.innerWidth; });\n`+
        `\t\tvar winHeight = await curpage.evaluate(() => { return window.innerHeight; });\n`+
        '\t\tawait delay(1000);\n'+
        "\t\tawait curpage.setViewport({ width: winWidth, height: winHeight });\n" +
        "\t\tvar storedValues = {};\n" +
        "\t\tbrowserTabs.push(curpage);\n\n" + 
        "\t\t//Run Commands\n";

    var setupEnd = "\t});\n}"

    functionCalls = insertTabs(functionCalls);

    return setupStart + functionCalls + setupEnd;
}

/**
 * This function checks if there are any label commands. If there are, it restructures the functionCalls
 * to make them output usable with goto commands.
 * @param {*} functionCalls is the string containing the operations to be performed by the output file.
 * @param {*} events is an object containing Kantu commands
 */
function labelFunctionCalls(functionCalls, events) {

    var labels = {};
    labels.conditions = {};
    labels.order = [];

    //get the label names from the json commands, in order
    var i, length = events.Commands.length;
    for (i = 0; i < length; i++) {
        var command = events.Commands[i].Command;
        var target = events.Commands[i].Target;

        if (command === "label") {
            labels.order.push(target);
        }
    }

    //if there are no labels, just use the existing functionCalls
    if(labels.order.length === 0) return functionCalls;

    //initialize all conditions to true
    orderlength = labels.order.length;
    for (i = 0; i < orderlength; i++) {
        labels.conditions[labels.order[i]] = true;
    }

    var withLabels = "var labels = JSON.parse('" + JSON.stringify(labels) + "');\n\n";

    //add all the functions that come before any label
    var length = functionCalls.length;
    var lengthOffset = "//label".length;
    var start = 0;
    while(functionCalls.substring(start, start + 7) !== "//label") {
        start++;
    }

    withLabels += functionCalls.substring(0, start);

    //add label headers
    for (i = 0; i < orderlength; i++) {
        var labelName = labels.order[orderlength - 1 - i];
        var top = labelName + ":\n" + "while (labels.conditions." + labelName + ") {\n\n";
        withLabels += top;
    }

    //add the functions within the labels
    for(i = 0; i < length - lengthOffset; i++) {
        if(functionCalls.substring(i, i + 7) === "//label") {
            i += 8;
            var tmp = i;

            while(i < length && functionCalls.charAt(i) !== '\n') {
                i++;
            }

            if(i === length) { return console.log("error"); }

            i++;

            var labelName = functionCalls.substring(tmp, i - 2);
            tmp = i;

            while(i < length - "//endlabel".length && functionCalls.substring(i, i + 10) !== "//endlabel") {
                i++;
            }
            
            if(i === length - "//endlabel".length) { return console.log("Error: invalid functionCalls. No //endlabel found."); }

            var labelContent =
                "//" + labelName + " content:\n" +
                functionCalls.substring(tmp, i) + "\n" + 
                "break " + labelName + ";\n" + 
                "}\n\n";

            withLabels += labelContent;
            i += 10;
        }
    }

    //place the appropriate commands to mimic goto statements
    lengthOffset = "//goto ".length;
    length = withLabels.length;
    for(i = 0; i < length - lengthOffset; i++) {

        //find the goto placeholder
        if(withLabels.substring(i, i + lengthOffset) === "//goto ") {
            i += lengthOffset;
            var tmp = i;

            //find the end of the target label's name
            while(i < length && withLabels.charAt(i) !== '\n') {
                i++;
            }

            if(i === length) throw "Error: Invalid functionCalls. No \n found when parsing gotos.";

            //extract the target label name from the placeholder
            var target = withLabels.substring(tmp, i);

            //go backwards under the current label is found
            var j = tmp - lengthOffset;
            while(j > 0 && !(withLabels.substring(j, j + 10) === " content:\n")) {
                j--;
            }

            if(j === 0) throw "Error: Invalid functionCalls. No current label found when parsing gotos.";

            //go backwards until the end of the current label name is found
            var tmp2 = j;
            while(j > 0 && withLabels.substring(j, j + 2) !== '//') {
                j--;
            }

            if(j === 0) throw "Error: Invalid functionCalls. No \\n found when parsing gotos.";

            //extract the current label name
            var current = withLabels.substring(j + 2, tmp2);
     
            //use the extracted information to determine the appropriate action
            var action = goto(current, target, labels);

            //replace the placeholder
            withLabels = withLabels.substring(0, tmp - lengthOffset) + action + withLabels.substring(i, length);
        }
    }
    return withLabels;
}

/**
 * Checks if the command is a flow control command. Returns true if it is, false if not.
 * @param {string} command is the name of the Kantu command
 */
function isFlowControl(command) {
    if (command === "while" || command === "endWhile" || command === "if" || command === "else" || command === "endif" ||
        command === "gotoIf" || command === "gotoLabel" || command === "label") {
        return true;
    }
    return false;
}

/**
 * Inserts tabs into a string of javascript code to make it look better.
 * Currently, there is a bug or two. It is better than untabbed code, though.
 * Was not really a priority.
 * @param {string} code Some javascript code
 */
function insertTabs(code) {

    var i, length = code.length;
    for (i = 0; i < length; i++) {

        if (code.charAt(i) === '{') {
            var depth = 1;
            var depthStarted = depth;
            i++;

            while (i < length && depth > 0) {
                if (code.charAt(i) === '}') {
                    depth--;
                    if (depthStarted != depth) {
                        if(code.charAt(0, i-1) === '\n') {
                            code = code.substring(0, i - 1) + code.substring(i, length);
                            length--;
                            i--;
                        } 
                    }
                } else if (code.charAt(i) === '\n') {
                    //add a number of \t's corresponding to the depth right after any \n
                    var j;
                    for (j = 0; j < depth; j++ , i++ , length++) {
                        code = code.substring(0, i + 1) + '\t' + code.substring(i + 1, length);
                    }
                } else if (code.charAt(i) === '{') {
                    depth++;
                    depthStarted = depth;
                }

                i++;
            }
        }
    }

    code = "\t\t" + code;
    length = code.length;
    for (i = 0; i < length; i++) {
        if (code.charAt(i) === '\n' && i !== length - 1) {
            code = code.substring(0, i + 1) + "\t\t" + code.substring(i + 1, length);
            length += 2;
        }
    }
    return code;
}

/**
 * Returns a string. The string contains code. The code will, when executed in the environment
 * created by labelFunctionCalls(), give control to the appropriate point. This mimics a goto
 * feature that is not present in Javascript, but it performed in Kantu.
 * @param {string} currentLabel is the name of the label the program's control is under when goto is called.
 * @param {string} targetLabel is the name of the label the program's control should go to.
 * @param {object} labels is an object that stores the program's labels and their ordering. 
 */
function goto(currentLabel, targetLabel, labels) {
    /*
    -to go to a loop outside the current loop, just lookup and break the loop immediately inside it
    -to go to current, set current loop condition to true and inner conditions to false, continue current loop
    -to go to a loop inside current, set conditions of labels preceding the target to false, 
    those between the target and current (including target and current) to true, continue current
    */

    var action = "";

    //get indices of current and target labels
    var currentIndex, targetIndex, length = labels.order.length;
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
            action += "labels.conditions[labels.order[" + i + "]] = false;\n";
        }

        action += "continue " + currentLabel + ";";
    }

    //the target label is outside (comes after) the current label
    else if (targetIndex > currentIndex) {
        var labelInsideTarget = labels.order[targetIndex - 1];

        action += "break " + labelInsideTarget + ";";
    }

    //the target label is inside (comes before) the current label
    else {
        for (i = 0; i <= currentIndex; i++) {
            if (i < targetIndex) {
                action += "labels.conditions[labels.order[" + i + "]] = false;\n";
            } else {
                action += "labels.conditions[labels.order[" + i + "]] = true;\n";
            }
        }

        action += "continue " + currentLabel + ";";
    }

    return action;
    //var result = new Function(action);
}
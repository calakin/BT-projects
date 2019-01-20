/**
 * This function takes 'locators' from Kantu and converts them in an appropriate css selector.
 * @param {string} target is a 'locator' in the form used by Kantu. 
 */
function locatorToSelector(target) {
    var selector;

    if (target.substring(0, 1) === "/" || target.substring(0, 6) === "xpath=") {
        if (target.indexOf('@') != target.lastIndexOf('@')) {
            var attributeSelector = target.substring(target.lastIndexOf('@'), target.length);
            target = target.substring(0, target.lastIndexOf('@'));
            selector = xpath2css(target);
            selector += attributeSelector;
        } else {
            selector = xpath2css(target);
        }
    } else if (target.substring(0, 3) === "id=") {
        selector = "[id=" + target.substring(3, target.length) + "]";
    } else if (target.substring(0, 5) === "name=") {
        selector = "[name=" + target.substring(5, target.length) + "]";
    } else if (target.substring(0, 5) === "link=") {
        selector = "[link=" + target.substring(5, target.length) + "]";
        //Probably does not work, if meant to be used for ref attributes
    } else if (target.substring(0, 11) === "identifier=") {
        selector = "[name=" + target.substring(11, target.length) + "],[id=" + target.substring(11, target.length) + "]";
    } else if (target.substring(0, 4) === "dom=") {
        //TODO
    } else if (target.substring(0, 4) === "css=") {
        selector = target.substring(4, target.length);
    } else if (target.substring(0, 3) === "ui=") {
        //TODO
    } else {
        selector = target;
    }

    return selector;
}

/**
 * Kantu uses template literals in their inputs to access stored variables. 
 * This function searches through the input string and replaces all template literals
 * with stored values. This function does not currently doing operations inside the 
 * literals, it must be a stored variable's name.
 * Ex: Input: "Hello, ${name}" turns into "Hello, Nobody" if name holds "Nobody".
 * @param {string} input 
 * @param {object} storedValues 
 */
function insertStoredValues(input, storedValues) {
    var result = input;

    var i, length = result.length;

    for (i = 0; i < length - 1; i++) {
        if (result.charAt(i) === '$' && result.charAt(i + 1) == '{') {
            i += 2;
            var start = i;
            while (i < length && result.charAt(i) !== '}') {
                i++;
            }

            if (i == length) throw "Error: invalid template literal. Missing closing '}'.";

            var storedKey = result.substring(start, i);
            var storedValue = storedValues[storedKey];

            result = result.substring(0, start - 2) + storedValue + result.substring(i + 1, length);
            length = result.length;

            if (storedValue === undefined) {
                lengthDif = (i - (start - 2)) - 9;
            } else {
                lengthDif = (i - (start - 2)) - storedValue.length;
            }

            i -= lengthDif;
        }
    }
    return result;
}

/**
 * Helper for sourceExtract and sourceSearch.  Returns an array of strings from source that match tVal.
 * @param {*} tVal - The match to find in source
 * @param {*} source - Page source code
 */
function getRegexMatches(tVal, source) {
    var regex;
    if (tVal.substring(0, 6) === 'regex=') {
        regex = new RegExp(tVal.substring(6), 'gi');
    } else {
        var find = tVal.split('*');
        var toReg = `\\` + find[0] + `(.*?)` + `\\` + find[1];
        regex = new RegExp(toReg, 'gi');
    }
    return source.match(regex);
}
/**
 * Helper for assertAlert, assertConfirmation, and assertPrompt.  
 * @param {string} target - String to match
 * @param {string} regex - Regec expression to get text
 */
async function assertionHelper(target, regex) {
    await curpage.evaluate((t, r) => {
        var elem = document.scripts;
        var reg = new RegExp(r);
        for (var i = 0; i < elem.length; i++) {
            var txt = elem[i].textContent.match(reg);
            if (txt) {
                var checkText = txt[1].replace('\\n', '\n');
                if (checkText === t) {
                    break;
                }
            }
            if (i >= elem.length - 1) {
                throw "Confirmation message not found.";
            }
        }
    }, target, regex);

}

/**
 * This function searches the current page and all of its child frames for an css selector.
 * If found, the frame in which is found will be returned (the main frame if in the page).
 * If not found, the last frame is returned.
 * @param selector is a css selector 
 */
async function getContainer(selector) {
    //returns previous index if not found
    var elementhandle = await curpage.$(selector);

    if (elementhandle) {
        return curpage;
    } else {
        var frames = await curpage.frames();
        var i, length = frames.length;
        for (i = 0; i < length; i++) {
            elementhandle = await frames[i].$(selector);

            if (elementhandle) {
                return frames[i];
            } else if (i === length - 1) {
                return frames[length - 1];
            }
        }
    }
}

/**
 * Searches the current page and all of its frames for the given css selector.
 * Returns true if found, false if not found.
 * @param selector is a css selector for an html element.
 */
async function elementExists(selector) {
    try {
        var elementhandle = await curpage.$(selector);

        if (elementhandle) {
            return true;
        } else {
            var frames = await curpage.frames();
            var i, length = frames.length;
            for (i = 0; i < length; i++) {
                elementhandle = await frames[i].$(selector);

                if (elementhandle) {
                    return true;
                }
            }
        }
    } catch (err) {
        return false;
    }
    return false;
}

answerOnNextPrompt_ = async function answerOnNextPrompt_(target, value, storedValues) {
    nextPrompt = target;
}

/**
 * Looks through document to check if a target message was found in an alert.  If not found, error thrown.  
 * @param {string} target - Alert message to find.
 * @param {*} value - N/A
 * @param {*} storedValues - N/A 
 */
assertAlert_ = async function assertAlert_(target, value, storedValues) {
    target = insertStoredValues(target, storedValues);
    try {
        await assertionHelper(target, `/alert\\(['"]([^'"]+)['"]\\)/`);
        console.log("Target: '" + target + "' found.");
    } catch (error) {
        console.log("Alert message not found.");
    }

};

assertChecked_ = async function assertChecked_(target, value, storedValues) {
    var property;

    try {
        var selector = locatorToSelector(target);
        var container = await getContainer(selector);
        const elementHandle = await container.waitForSelector(selector);
        const jshandle = await elementHandle.getProperty('checked');
        property = await jshandle.jsonValue();
    } catch (err) {
        throw new Error("assertChecked FAILED. Unable to retreive element or property. Error message:\n" + err);
        process.exit();
    }

    if (property) {
        console.log("assertChecked PASSED. Element is checked.");
    } else {
        throw new Error("assertChecked FAILED. Element is unchecked.");
        process.exit();
    }
};

/**
 * Looks through document to check if a target message was found in a confirmation box.  If not found, error thrown.  
 * @param {string} target - Confirmation message to find.
 * @param {*} value - N/A
 * @param {*} storedValues - N/A 
 */
assertConfirmation_ = async function assertConfirmation_(target, value, storedValues) {
    try {
        await assertionHelper(target, `confirm\\(['"]([^'"]+)['"]\\)`);
        console.log("Target: '" + target + "' found.");
    } catch (error) {
        console.log("Confirmation message not found.");
    }
}

assertText_ = async function assertText_(target, value, storedValues) {
    value = insertStoredValues(value, storedValues);
    var property;

    try {
        var selector = locatorToSelector(target);
        var container = await getContainer(selector);
        const elementHandle = await container.waitForSelector(selector);
        const jshandle = await elementHandle.getProperty('text');
        property = await jshandle.jsonValue();
    } catch (err) {
        throw ("assertText FAILED. Unable to retreive element or property. Error message:\n" + err);
        process.exit();
    }

    if (property === value) {
        console.log("assertText PASSED. Actual value = '" + property + "'. Given value = '" + value + "'.");
    } else {
        throw ("assertText FAILED. Actual value = '" + property + "'. Given value = '" + value + "'.");
        process.exit();
    }
}

/**
 *  Finds Title of the Page and checks if target is equal. If not, throws error
 * @param {string} target - Confirmation message to find.
 * @param {*} value - N/A
 * @param {*} storedValues - N/A 
 */
assertTitle_ = async function assertTitle_(target, value, storedValues) {
    target = insertStoredValues(target, storedValues);
    var title;

    try {
        title = await curpage.title();
    } catch (err) {
        throw ("verifyTitle FAILED. Could not retreive title. Error message:\n" + err);
        process.exit();
    }

    if (title === value) {
        console.log("assertTitle PASSED. Actual value = '" + title + "'. Given value = '" + value + "'.");
    } else {
        throw "assertTitle FAILED. Actual value = '" + title + "'. Given value = '" + value + "'.";
        process.exit();
    }
};

assertElementPresent_ = async function assertElementPresent_(target, value, storedValues) {
    var selector = locatorToSelector(target);

    if (await elementExists(selector)) {
        console.log("assertElementPresent PASSED.");
    } else {
        throw ("assertElementPresent FAILED. Element not found.");
        process.exit();
    }
};

/**
 * Looks through document to check if a target message was found in a prompt box.  If not found, error thrown.  
 * @param {string} target - Prompt message to find.
 * @param {*} value - N/A
 * @param {*} storedValues - N/A 
 */
assertPrompt_ = async function assertPrompt_(target, value, storedValues) {
    target = insertStoredValues(target, storedValues);
    try {
        await assertionHelper(target, `prompt\\(['"]([^'"]+)['"]`);
        console.log("Target: '" + target + "' found.");
    } catch (error) {
        console.log("Prompt message not found.");
    }
};

/**
 * Uses locator to see if locator's value equals value. If not, throws error
 * @param {string} target - Locator
 * @param {string} value - value
 * @param {*} storedValues - N/A 
 */
assertValue_ = async function assertValue_(target, value, storedValues) {
    value = insertStoredValues(value, storedValues);
    var property;

    try {
        var selector = locatorToSelector(target);
        var container = await getContainer(selector);
        const elementHandle = await container.waitForSelector(selector);
        const jshandle = await elementHandle.getProperty('value');
        property = await jshandle.jsonValue();
    } catch (err) {
        throw ("assertValue FAILED. Unable to retreive element or property. Error message:\n" + err);
        process.exit();
    }

    if (property === value) {
        console.log("assertValue PASSED. Actual value = '" + property + "'. Given value = '" + value + "'.");
    } else {
        throw "assertValue FAILED. Actual value = '" + property + "'. Given value = '" + value + "'.";
        process.exit();
    }
};

/**
 * @param {*} target - N/A
 * @param {*} value - N/A
 * @param {*} storedValues - N/A 
 */
bringBrowserToForeground_ = async function bringBrowserToForeground_(target, value, storedValues) {
    try {
        await curpage.bringToFront();
    } catch (error) {
        console.log(error);
    }
};

/**
 * @param {string} target - Name of screenshot.  Saves to file system as jpg.
 * @param {*} value - N/A
 * @param {*} storedValues - N/A
 */
captureEntirePageScreenshot_ = async function captureEntirePageScreenshot_(target, value, storedValues) {
    var container = await getContainer('#aspnetForm');
    var name = target + ".jpg";
    await pause_('1000', '', storedValues);
    await curpage.goto(curpage.url());
    await curpage.screenshot({ path: name, fullPage: true });
};

/**
 * @param {string} target - Name of screenshot.  Saves to file system
 * @param {*} value - N/A
 * @param {*} storedValues - N/A
 */
captureScreenshot_ = async function captureScreenshot_(target, value, storedValues) {
    var name = target + ".jpg";
    await curpage.goto(curpage.url());
    await curpage.screenshot({ path: name });
};

/**
 * Clicks on element through selector 
 * @param {string} target xpath of element clicked 
 * @param {*} value N/A
 * @param {*} storedValues N/A
 * 
 */
click_ = async function click_(target, value, storedValues) {
    await delay(500);
    var selector = locatorToSelector(target);
    var container = await getContainer(selector, curpage);
    try {
        await container.click(selector);
    } catch (error) {
        //await tempContainer.waitForSelector(selector, {visible: true});
        await delay(500);

        try {
            await tempContainer.click(selector);
        } catch (error) {
            await container.evaluate((s) => { document.querySelector(s).click() }, selector);
        }
    }
};

/**
 * Converts xpath target to css selector and clicks on element through selector, waiting until new page loads
 * @param {string} target xpath of element clicked 
 * @param {*} value N/A
 * @param {*} storedValues N/A
 *  
 */
clickAndWait_ = async function clickAndWait_(target, value, storedValues) {
    const navigationP = curpage.waitForNavigation({ timeout: 4500 });

    target = locatorToSelector(target);
    try {
        await click_(target, value, curpage);
        await navigationP;
    }
    catch (error) {

    }
};

clickAt_ = async function clickAt_(target, value, storedValues) { };

/**
 * @param {string} target - Content commented to console.
 * @param {*} value - N/A
 * @param {*} storedValues - N/A
 */
comment_ = async function comment_(target, value, storedValues) {
    target = insertStoredValues(target, storedValues);
    console.log(target);
};

/**
 * This parses the csv into a 2D array so that individual values can be accessed.
 * @param {string} target - File to be parsed
 * @param {*} value - N/A
 * @param {*} storedValues - N/A
 */
csvRead_ = async function csvRead_(target, value, storedValues) {
    try {
        var file = fs.readFileSync(target, 'utf8');
        var allTextLines = file.split(/\r\n|\n/);
        var firstRow = allTextLines[0].split(',');
        var lines = [];
        lines.push(firstRow);

        for (var i = 1; i < allTextLines.length; i++) {
            data = allTextLines[i].split(',');
            if (data.length == firstRow.length) {
                lines.push(data);
            }
        }
        storedValues.csv = lines;
        console.log(lines);
    } catch (error) {
        console.log(error);
    }
};

csvSave_ = async function csvSave_(target, value, storedValues) { };

/**
 * Deletes all cookies in chrome
 * @param {*} target - N/A
 * @param {*} value - N/A
 * @param {*} storedValues - N/A 
 */
deleteAllCookies_ = async function deleteAllCookies_(target, value, storedValues) {
    try {
        for (var i = 0; i < browserTabs.length; i++) {
            console.log(await browserTabs[i].cookies());
            await browserTabs[i]._client.send(`Network.clearBrowserCookies`);
            console.log(await browserTabs[i].cookies());
        }

    } catch (error) {
        console.log(error);
    }
};

dragAndDropToObject_ = async function dragAndDropToObject_(target, value, storedValues) { };

/**
 * @param {string} target - String to be outputed if value is #shownotification, Path to container if value is color.
 * @param {string} value - #shownotification: must give chrome notification access first, (color): if invalid will not show color
 * @param {*} storedValues - N/A
 */
echo_ = async function echo_(target, value, storedValues) {
    target = insertStoredValues(target, storedValues);
    try {
        var path, container;
        if (value !== "#shownotification") {
            path = await locatorToSelector(target);
            container = await getContainer(path);
        } else {
            container = curpage;
        }

        if (container.evaluate(`Notification.permission !== "granted"`) && value === "#shownotification") {
            await container.evaluate(`Notification.requestPermission()`);
            await container.evaluate(t => {
                new Notification('Notification title', { body: t });
            }, target);
        } else if (value === "#shownotification") { //notification access already granted.
            await container.evaluate(t => {
                new Notification('Notification title', { body: t });
            }, target);
        } else if (value === '') {
            console.log(target);
        } else {
            var curColor = "";
            try {
                await container.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
                await container.evaluate((t, v) => {
                    const $ = window.$; //otherwise the transpiler will rename it and won't work
                    curColor = $(t).css("background-color");
                    $(t).css("background-color", v);
                }, path, value);

                await container.waitFor(800); //see changes and change back
                await container.evaluate((t, v) => {
                    $(t).css("background-color", v);
                }, path, curColor);
            } catch (error) {
                console.log(error)
            }
        }
    } catch (error) {
        console.log(error);
    }

};

/**
 * @param {string} target - Path to content to be edited in HTML
 * @param {string} value - Content to add in html format
 * @param {*} storedValues - N/A
 */
editContent_ = async function editContent_(target, value, storedValues) {
    value = insertStoredValues(value, storedValues);
    try {
        var path = await locatorToSelector(target);
        var container = await getContainer(path);
        console.log(path);
        await container.evaluate((t, v) => {
            $(t).html(v);
        }, path, value);
    } catch (error) {
        console.log(error);
    }
};

localStorageExport_ = async function localStorageExport_(target, value, storedValues) {
    console.log(storedValues);
};

/** Mouses over
 * @param {string} target - Path to content to mouse over
 * @param {*} value - N/A
 * @param {*} storedValues - N/A
 */
mouseOver_ = async function mouseOver_(target, value, storedValues) {
    try {
        await curpage.waitFor(1000);
        var path = await locatorToSelector(target);
        var container = await getContainer(path);
        await container.hover(path);
        await container.waitFor(500);
    } catch (error) {
        console.log("ERROR THROWN-----------");
        console.log(error);
    }
};

onDownload_ = async function onDownload_(target, value, storedValues) { }; //dont think we need this
onError_ = async function onError_(target, value, storedValues) { }; //dont think we need this

open_ = async function open_(target, value, storedValues) {
    await curpage.goto(target);
};

/**
 * @param {*} target - Time in ms to pause for
 * @param {*} value - N/A
 * @param {*} storedValues - N/A 
 */
pause_ = async function pause_(target, value, storedValues) {
    try {
        await curpage.waitFor(parseInt(target));
    } catch (error) {
        console.log(error);
    }
};

/**
 * Refreshes current page.
 * @param {*} target - N/A
 * @param {*} value - N/A
 * @param {*} storedValues - N/A 
 */
refresh_ = async function refresh_(target, value, storedValues) {
    await curpage.reload();
};

select_ = async function select_(target, value, storedValues) { };

selectAndWait_ = async function selectAndWait_(target, value, storedValues) { };

/**
 * 
 * @param {*} target iframe
 * @param {*} value N/A
 * @param {*} storedValues N/A
 * delays to wait for frame to open up. Checks if target is 'relative=top' which will go to top frame. if not, then will find frame containing target iframe and sets equal to tempContainer
 */
selectFrame_ = async function selectFrame_(target, value, storedValues) {
    await delay(4000);
    var frames = await curpage.frames();
    //relative=top will change frame to top frame
    if (target === 'relative=top') {
        tempContainer = frames[lastIndex].parentFrame();
        //console.log(tempContainer);
    }
    //index=x will change frame to frame x
    else if(target.substring(0,5) === 'index') {
        var num = target.substring(6);
        var index = parseInt(num);
        tempContainer = frames[index];
    }
    //finds frame through name and target
    else {
        tempContainer = await frames.find(f => f.name() === target.substring(3, target.length));
        //if it still hasn't found, set equal to last index used
        if (tempContainer === null) {
            tempContainer = frames[lastIndex];
        }
    }
};

/**
* Allows tab switching, closing, and opening.  Action determined by parameter target.
* @param {string} target - tab=open opens a new tab, tab=close closes all tabs except current, tab=#. # represents the tab. 0 is the main window with every window opened to the right incrementing
* @param {string} value - URL to go to if target is tab=open
* @param {*} storedValues - N/A
*/
selectWindow_ = async function selectWindow_(target, value, storedValues) {
    if (target.substring(4).toLowerCase() === 'open') {
        var newTab = await curpage.browser().newPage();
        await newTab.setViewport(curpage.viewport());
        await newTab.goto(value, { waitUntil: 'networkidle2' });
        await newTab.bringToFront();
        await browserTabs.push(newTab);
        curpage = newTab;

    } else if (target.substring(4).toLowerCase() === 'closealltogether') {
        for (var i = 0; i < browserTabs.length; i++) {
            if (browserTabs[i] !== curpage) {
                await browserTabs[i].close();
            }
        }
        var newTabs = [curpage];
        browserTabs = [];
        browserTabs = newTabs;
    } else if (parseInt(target.substring(4)) >= 0) {
        var goto = parseInt(target.substring(4));
        await browserTabs[goto].bringToFront();
        curpage = browserTabs[goto];
        await curpage.waitFor(1000);
    }
};

/**
* Allows special key characters that cant be used with type 
* @param {string} target - N/A
* @param {string} value - Key to press
* @param {*} storedValues - N/A
 */
sendKeys_ = async function sendKeys_(target, value, storedValues) {
    var keyDictionary = {
        '$(KEY_LEFT)': 'ArrowLeft',
        '$(KEY_UP)': 'ArrowUp',
        '$(KEY_RIGHT)': 'ArrowRight',
        '$(KEY_DOWN)': 'ArrowDown',
        '$(KEY_PGUP)': 'PageUp',
        '$(KEY_PAGE_UP)': 'PageUp',
        '$(KEY_PGDN)': 'PageDown',
        '$(KEY_PAGE_DOWN)': 'PageDown',
        '$(KEY_BKSP)': 'Backspace',
        '$(KEY_BACKSPACE)': 'Backspace',
        '$(KEY_DEL)': 'Delete',
        '$(KEY_DELETE)': 'Delete',
        '$(KEY_ENTER)': 'Enter',
        '$(KEY_TAB)': 'Tab',
        '$(KEY_HOME)': 'Home'
    };
    await curpage.keyboard.press(keyDictionary[value]);
    await curpage.waitFor(250);

};

/**
 * Searches for content in page source specified by target.  Logs all found content in console.  To find a specific piece of content, add '@#' to 
 * the end of the target string.  # is the nth element found that fits the specifications of the target.  
 * @param {string, RegExp} target - String to search for in format (Eg. $*</li>) where * is anything in between $ and </li>, or
 *                                  RegExp.  Please use triple backslash (\\\) for any character that requires one (\).  
 * @param {*} value - N/A
 * @param {*} storedValues - N/A
 */
sourceExtract_ = async function sourceExtract_(target, value, storedValues) {
    try {
        var source = await curpage.content();
        var matches = [];
        var tVal = target, locator = -1;
        var tArr = target.split('@');
        if (tArr.length > 1 && typeof (parseInt(tArr[tArr.length - 1])) === typeof (1)) {
            tVal = '';
            locator = parseInt(tArr[tArr.length - 1]);
            for (var i = 0; i < tArr.length - 1; i++) {
                tVal += tArr[i];
            }
        }
        matches = getRegexMatches(tVal, source);
        if (matches === null || matches.length === 0) {
            console.log('#nomatchfound');
        } else if (locator < 0) {
            console.log(matches);
        }
        else {
            console.log(matches[locator - 1]);
        }
        storedValues.ExtractedSource = matches;
        return matches;
    } catch (error) {
        console.log(error);
    }


};

/**
 * See sourceExtract.  sourceSearch logs number of items found based on target.
 */
sourceSearch_ = async function sourceSearch_(target, value, storedValues) {
    try {
        var source = await curpage.content();
        var matches = [];
        var tVal = target;
        matches = getRegexMatches(tVal, source);
        if (matches === null || matches.length === 0) {
            console.log("0 matches found.");
        } else {
            console.log(matches.length + " matches found.");
        }
        storedValues.SearchedSource = matches;
    } catch (error) {
        console.log(error);
    }
};

store_ = async function store_(target, value, storedValues) {
    target = insertStoredValues(target, storedValues);
    storedValues[value] = target;
};

/**
 * This function stores the specified attribute of an HTML element as a given variable name.
 * The attribute is specified by adding '@attribute_name' to the end of the css selector.
 * Ex: [id=someID@text] or name="someName"@text
 * @param target is the css selector of the HTML element whose attribute is to be stored.
 * @param value is the name of the variable in which to store the attribute.
 * @param storedValues is an object in which variables are stored.
 */
storeAttribute_ = async function storeAttribute_(target, value, storedValues) {
    var property;

    try {
        var selector = locatorToSelector(target);
        var attribute = selector.substring(selector.lastIndexOf('@') + 1, selector.length - 1);
        selector = selector.substring(0, selector.lastIndexOf('@')) + ']';

        var container = await getContainer(selector);
        const elementHandle = await container.waitForSelector(selector);
        const jshandle = await elementHandle.getProperty(attribute);
        property = await jshandle.jsonValue();
    } catch (err) {
        return console.log("storeAttribute FAILED. Unable to retreive element or property. Error message:\n" + err);
    }

    storedValues[value] = property;
};

/**
 * This function stores the boolean checked status of an HTML element as a given variable name.
 * @param target is the css selector of the HTML element whose checked status is to be stored.
 * @param value is the name of the variable in which to store the boolean.
 * @param storedValues is an object in which variables are stored.
 */
storeChecked_ = async function storeChecked_(target, value, storedValues) {
    var property;

    try {
        var selector = locatorToSelector(target);
        var container = await getContainer(selector);
        const elementHandle = await container.waitForSelector(selector);
        const jshandle = await elementHandle.getProperty('checked');
        property = await jshandle.jsonValue();
    } catch (err) {
        return console.log("storeChecked FAILED. Unable to retreive element or property. Error message:\n" + err);
    }

    storedValues[value] = property;
};

/**
 * This function executes the given javascript statements and stores the result as a given variable name.
 * @param target is the javascript, as a string.
 * @param value is the name of the variable in which to store the result.
 * @param storedValues is the object in which variables are stored.
 */
storeEval_ = async function storeEval_(target, value, storedValues) {
    //target may context may contain template literals, which I want to map to storedValues somehow
    target = insertStoredValues(target, storedValues);

    //parse the statements from the form kantu sends them in. You can't just
    //execute their statements verbatim because... they won't return anything.
    otherStuff = "";
    returnValue = "";
    firstSemiColon = target.indexOf(';');
    lastSemiColon = target.lastIndexOf(';');
    var length = target.length;

    if (lastSemiColon === -1) {
        returnValue = target;
    } else if (firstSemiColon === lastSemiColon && lastSemiColon + 1 === length) {
        returnValue = target.substring(0, length - 1);
    } else {
        var i;
        var start = lastSemiColon + 1 === length ? length - 2 : length - 1;

        for (i = start; i >= 0; i--) {
            if (target.charAt(i) === ';') {
                otherStuff = target.substring(0, i + 1);
                returnValue = target.substring(i + 1, start + 1);
                break;
            }
        }
    }

    action = new Function(otherStuff + 'return (' + returnValue + ');');
    result = action();
    storedValues[value] = result;
};

storeImage_ = async function storeImage_(target, value, storedValues) {
    //TODO
};

/**
 * This function stores a the text of an HTML element as a given variable name.
 * @param target is the css selector of the HTML element whose text is to be stored.
 * @param value is the name of the variable in which to store the text.
 * @param storedValues is an object in which variables are stored.
 */
storeText_ = async function storeText_(target, value, storedValues) {
    var property;

    try {
        var selector = locatorToSelector(target);
        var container = await getContainer(selector);
        const elementHandle = await container.waitForSelector(selector);
        const jshandle = await elementHandle.getProperty('text');
        property = await jshandle.jsonValue();
    } catch (err) {
        return console.log("storeText FAILED. Element not found. Error message:\n" + err);
    }

    storedValues[value] = property;
};

/**
 * This function stores a title of the current page as a given variable name.
 * @param value is the name of the variable in which to store the title.
 * @param storedValues is an object in which variables are stored.
 */
storeTitle_ = async function storeTitle_(target, value, storedValues) {
    var title;

    try {
        title = await curpage.title();
    } catch (err) {
        return console.log("storeTitle FAILED. Error message:\n" + err);
    }

    storedValues[value] = title;
};

/**
 * This function stores a the value of an HTML element as a given variable name.
 * @param target is the css selector of the HTML element whose value is to be stored.
 * @param value is the name of the variable in which to store the value.
 * @param storedValues is an object in which variables are stored.
 */
storeValue_ = async function storeValue_(target, value, storedValues) {
    var property;

    try {
        var selector = locatorToSelector(target);
        var container = await getContainer(selector);
        const elementHandle = await container.waitForSelector(selector);
        const jshandle = await elementHandle.getProperty('value');
        property = await jshandle.jsonValue();
    } catch (err) {
        return console.log("storeValue FAILED. Element not found. Error message:\n" + err);
    }

    storedValues[value] = property;
};

throwError_ = async function throwError_(target, value, storedValues) {
    target = insertStoredValues(target, storedValues);
    console.error("Error: " + target);
    await curpage.browser.close();
    process.exit();
};

/**
 * clicks on element first (incase they tabbed over in kantu: does not register in software), then types value into converted target selector
 * @param {string} target xpath of element user typed into
 * @param {string} value string of what user typed 
 * @param {*} storedValues N/A
 */
type_ = async function type_(target, value, storedValues) {
    value = insertStoredValues(value, storedValues);
    target = locatorToSelector(target);
    //await click_(target, value, curpage, storedValues);
    var container = await getContainer(target, curpage);
    try {
        await container.type(target, value, { delay: 50 });
    } catch (error) {
    }
};

/**
 * This function verifies that an html element is checked.
 * The result is logged to the console.
 * @param target is a css selector for an html element.
 * @param storedValues is an object in which variables are stored.
 */
verifyChecked_ = async function verifyChecked_(target, value, storedValues) {
    var property;

    try {
        var selector = locatorToSelector(target);
        var container = await getContainer(selector);
        const elementHandle = await container.waitForSelector(selector);
        const jshandle = await elementHandle.getProperty('checked');
        property = await jshandle.jsonValue();
    } catch (err) {
        return console.log("verifyChecked FAILED. Unable to retreive element or property. Error message:\n" + err);
    }

    if (property) {
        console.log("verifyChecked PASSED. Element is checked.");
    } else {
        console.log("verifyChecked FAILED. Element is unchecked.");
    }
};

/**
 * This function checks if the target element is found in the current page or any of its frames.
 * It will wait for the defined timeout duration. The result is logged to the console.
 * @param target is the css selector for an html element.
 * @param storedValues is an object in which variables are stored.
 */
verifyElementPresent_ = async function verifyElementPresent_(target, value, storedValues) {
    var selector = locatorToSelector(target);

    if (await elementExists(selector)) {
        console.log("verifyElementPresent PASSED.");
    } else {
        console.log("verifyElementPresent FAILED. Element not found.");
    }
};

// verifyElementPresent_ = async function verifyElementPresent_(target, value, storedValues) {
//     var selector = locatorToSelector(target);
//     await curpage.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
//     var elementItem = await curpage.evaluate((s) => {
//         const $ = window.$;
//         return $(s).html();
//     }, selector);
//     if (elementItem !== null && elementItem !== undefined) {
//         console.log("Found Element: " + elementItem);
//     }
//     else {
//         console.log("*****Element not Found*****");
//     }
// };

/**
 * This function compares the given text to the given html element's actual text.
 * The result is logged to the console.
 * @param target is the css selector of an html element.
 * @param value is the given text to compare.
 * @param storedValues is an object in which variables are stored.
 */
verifyText_ = async function verifyText_(target, value, storedValues) {
    value = insertStoredValues(value, storedValues);
    var property;

    try {
        var selector = locatorToSelector(target);
        var container = await getContainer(selector);
        const elementHandle = await container.waitForSelector(selector);
        const jshandle = await elementHandle.getProperty('text');
        property = await jshandle.jsonValue();
    } catch (err) {
        return console.log("verifyText FAILED. Unable to retreive element or property. Error message:\n" + err);
    }

    if (property === value) {
        console.log("verifyText PASSED. Actual value = '" + property + "'. Given value = '" + value + "'.");
    } else {
        console.log("verifyText FAILED. Actual value = '" + property + "'. Given value = '" + value + "'.");
    }
};

/**
 * This function retreives the current page's title and checks it against the given one.
 * The result is logged to the console.
 * @param target is the given title to compare.
 * @param storedValues is an object in which variables are stored.
 */
verifyTitle_ = async function verifyTitle_(target, value, storedValues) {
    target = insertStoredValues(target, storedValues);
    var title;

    try {
        title = await curpage.title();
    } catch (err) {
        return console.log("verifyTitle FAILED. Could not retreive title. Error message:\n" + err);
    }

    if (title === value) {
        console.log("verifyTitle PASSED. Actual value = '" + title + "'. Given value = '" + value + "'.");
    } else {
        console.log("verifyTitle FAILED. Actual value = '" + title + "'. Given value = '" + value + "'.");
    }
};

/**
 * This function compares the given value to the given html element's actual value.
 * The result is logged to the console.
 * @param target is the css selector of an html element.
 * @param value is the given value to compare.
 * @param storedValues is an object in which variables are stored.
 */
verifyValue_ = async function verifyValue_(target, value, storedValues) {
    value = insertStoredValues(value, storedValues);
    var property;

    try {
        var selector = locatorToSelector(target);
        var container = await getContainer(selector);
        const elementHandle = await container.waitForSelector(selector);
        const jshandle = await elementHandle.getProperty('value');
        property = await jshandle.jsonValue();
    } catch (err) {
        return console.log("verifyValue FAILED. Unable to retreive element or property. Error message:\n" + err);
    }

    if (property === value) {
        console.log("verifyValue PASSED. Actual value = '" + property + "'. Given value = '" + value + "'.");
    } else {
        console.log("verifyValue FAILED. Actual value = '" + property + "'. Given value = '" + value + "'.");
    }
};

visionFind_ = async function visionFind_(target, value, storedValues) {
    //TODO
};

visionLimitSearchArea_ = async function visionLimitSearchArea_(target, value, storedValues) {
    //TODO
};

/**
 * This function waits for the document.readyState to be 'complete'.
 */
waitForPageToLoad_ = async function waitForPageToLoad_(target, value, storedValues) {
    while (await curpage.evaluate('document.readyState !== \'complete\';'));
};

/**
 * This function waits for an HTML element to load and be visible, if the target parameter is valid.
 * 
 * @param target is a locator that refers to an HTML element selector.
 */
waitForVisible_ = async function waitForVisible_(target, value, storedValues) {
    var selector = locatorToSelector(target);
    var container = await getContainer(selector);
    return await container.waitForSelector(selector, { visible: true });
};
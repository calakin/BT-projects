const puppeteer = require('puppeteer');
// built in selenium vars
// https://github.com/Jongkeun/selenium-ide/blob/6d18a36991a9541ab3e9cad50c2023b0680e497b/packages/selenium-ide/src/content/selenium-api.js

(async () => {
    let browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    var page = await browser.newPage();
    var selectedFrame = page;
    await page._client.send('Emulation.clearDeviceMetricsOverride');
    var winWidth = await page.evaluate(async () => { return await window.innerWidth; });
    var winHeight = await page.evaluate(async () => { return await window.innerHeight; });
    await page.setViewport({ width: winWidth, height: winHeight });
    var browserTabs = [page];

    var keyDictionary = {
        '${KEY_LEFT}': 'ArrowLeft',
        '${KEY_UP}': 'ArrowUp',
        '${KEY_RIGHT}': 'ArrowRight',
        '${KEY_DOWN}': 'ArrowDown',
        '${KEY_PGUP}': 'PageUp',
        '${KEY_PAGE_UP}': 'PageUp',
        '${KEY_PGDN}': 'PageDown',
        '${KEY_PAGE_DOWN}': 'PageDown',
        '${KEY_BKSP}': 'Backspace',
        '${KEY_BACKSPACE}': 'Backspace',
        '${KEY_DEL}': 'Delete',
        '${KEY_DELETE}': 'Delete',
        '${KEY_ENTER}': 'Enter',
        '${KEY_TAB}': 'Tab',
        '${KEY_HOME}': 'Home'
    };


    //exported test
    await open(`https://www.google.com/`);
	await click(`//body[@id='gsr']/div`);
	await click(`//div[@id='gs_lc0']/input`);
	await type(`//div[@id='gs_lc0']/input`, `winchestershirevilleton`);
	await sendKeys(keyDictionary[`\${KEY_ENTER}`]);
	await click(`//div[@id='hdtb-msb-vis']/div[2]/a`);
	await type(`//div[@id='gs_lc50']/input`, `brockman's house`);
	await refresh();
	await type(`//div[@id='gs_lc50']/input`, `brockman's house`);
	await open(`https://www.youtube.com`);
	await click(`//ytd-page-manager[@id='page-manager']/ytd-browse/div`);
	await click(`//div[@id='search-input']/input`);
	await type(`//div[@id='search-input']/input`, `dust in the wind`);
		await click(`//div[@id='title-wrapper']/h3/a`);
	await click(`//div[@id='movie_player']/div[14]/div/div/div[5]/button/div`);

    await browser.close();


	//function definitions
async function assertAlert(target) {
        try {
            await assertionHelper(target, `/alert\\(['"]([^'"]+)['"]\\)/`);
            console.log("Target: '" + target + "' found.");
        } catch (error) {
            console.log("Confirmation message not found.");
        }
    }
async function assertElementPresent(target) {
        if (await getContainer(target)) {
            console.log("assertElementPresent PASSED.");
        } else {
            throw ("assertElementPresent FAILED. Element not found.");
            process.exit();
        }
    }
async function assertPrompt(target) {
        try {
            await assertionHelper(target, `prompt\\(['"]([^'"]+)['"]`);
            console.log("Target: '" + target + "' found.");
        } catch (error) {
            console.log("Prompt message not found.");
        }
    }
async function assertText(target, value) {
        var property;
        try {
            var container = await getContainer(target);
            target = container.target;
            container = container.container;
            var query = await container.$x(target);
            var elementHandle = query[0];
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
async function assertTitle(value) {
        var title;
        try {
            title = await page.title();
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
    }
async function assertValue(target, value) {
        var property;
        try {
            var container = await getContainer(target);
            target = container.target;
            container = container.container;
            var query = await container.$x(target);
            var elementHandle = query[0];
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
    }
async function bringBrowserToForground() {
        await page.bringToFront();
    }
async function captureScreenshot(target) {
        let name = target + ".jpg";
        await page.goto(page.url());
        await page.screenshot({ path: name });
    }
async function captureEntirePageScreenshot(target) {
        let name = target + ".jpg";
        await page.screenshot({ path: name, fullPage: true });
    }
async function click(target) {
        var container = await getContainer(target);
        target = container.target;
        container = container.container;
        var query = await container.$x(target);
        var elementHandle = query[0];

        var navigation = page.waitForRequest(
            (r) => { return (r.method() === 'GET' && r.isNavigationRequest() && r.frame() === page.mainFrame()) },
            { timeout: 800 }
        );

        await elementHandle.click();

        //if an error is thrown, no navigation reqest was received and it should move on
        try {
            await navigation;
            await page.waitForNavigation({ waitUntil: 'load' });
        } catch (error) {
            return;
        }
    }
async function deleteAllVisibleCookies() {
        for (var i = 0; i < browserTabs.length; i++) {
            await browserTabs[i]._client.send('Network.clearBrowserCookies');
        }
    }
async function echo(target, value) {
        var container;
        if (value !== "#shownotification") {
            container = await getContainer(target);
            target = container.target;
            container = container.container;
        } else {
            container = page;
        }

        if (container.evaluate('Notification.permission !== "granted"') && value === "#shownotification") {
            await container.evaluate('Notification.requestPermission()');
            await container.evaluate(t => {
                new Notification('Notification title', { body: t });
            }, target);
        } else if (value === "#shownotification") { //notification access already granted.
            await container.evaluate(t => {
                new Notification('Notification title', { body: t });
            }, target);
        }
    }
async function get(target) {
        await page.goto(target);
    }
async function mouseOver(target) {
        var container = await getContainer(target);
        target = container.target;
        container = container.container;
        await container.hover(target);
    }
async function open(target) {
        await page.goto(target);
    }
async function pause(target) {
        await page.waitFor(parseInt(target));
    }
async function refresh() {
        await page.reload();
    }
async function selectFrame(target) {
        var frames = await page.frames();
        var newFrame;

        //relative=top will change frame to top frame
        if (target === 'relative=parent') {
            selectedFrame = selectedFrame.parentFrame();
        }

        else if (target === 'relative=top') {
            selectedFrame = frames[frames.length - 1];
        }

        //index=x will change frame to frame x
        else if (target.substring(0, 5) === 'index') {
            var num = target.substring(6);
            var index = parseInt(num);
            selectedFrame = frames[index];
        }

        //finds frame through name and target
        else {
            newFrame = await frames.find(f => f.name() === target.substring(3, target.length));

            if (newFrame !== null && newFrame !== undefined) {
                selectedFrame = newFrame;
            }
        }
    }
async function selectWindow(target, value) {
        if (target.substring(9) === 'local') {
            await browserTabs[0].bringToFront();
            page = browserTabs[0];
            await page.waitFor(1000);
        } else if (target.substring(9) > browserTabs.length) {
            var newTab = await page.browser().newPage();
            await newTab.setViewport(page.viewport());
            await newTab.goto(value, { waitUntil: 'networkidle2' });
            await newTab.bringToFront();
            await browserTabs.push(newTab);
            page = newTab;
        } else if (parseInt(target.substring(9)) >= 0) {
            var goto = parseInt(target.substring(9));
            await browserTabs[goto].bringToFront();
            page = browserTabs[goto];
            await page.waitFor(1000);
        }
    }
async function sendKeys(value) {
        var navigation = page.waitForRequest(
            (r) => { return (r.method() === 'GET' && r.isNavigationRequest() && r.frame() === page.mainFrame()) },
            { timeout: 800 }
        );

        await page.keyboard.press(value);

        try {
            await navigation;
            await page.waitForNavigation({ waitUntil: 'load' });
        } catch (error) {
            return;
        }
    }
async function type(target, value) {
        var container = await getContainer(target);
        target = container.target;
        container = container.container;
        var query = await container.$x(target);
        var elementHandle = query[0];
        await elementHandle.type(value);
    }
async function verifyChecked(target) {
        var property;
        try {
            var container = await getContainer(target);
            target = container.target;
            container = container.container;
            var query = await container.$x(target);
            var elementHandle = query[0];
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
    }
async function verifyElementPresent(target) {
        if (await getContainer(target)) {
            console.log("verifyElementPresent PASSED.");
        } else {
            console.log("verifyElementPresent FAILED. Element not found.");
        }
    }
async function verifyText(target, value) {
        var property;
        try {
            var container = await getContainer(target);
            target = container.target;
            container = container.container;
            var query = await container.$x(target);
            var elementHandle = query[0];
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
    }
async function verifyTitle(value) {
        var title;
        try {
            title = await page.title();
        } catch (err) {
            return console.log("verifyTitle FAILED. Could not retreive title. Error message:\n" + err);
        }

        if (title === value) {
            console.log("verifyTitle PASSED. Actual value = '" + title + "'. Given value = '" + value + "'.");
        } else {
            console.log("verifyTitle FAILED. Actual value = '" + title + "'. Given value = '" + value + "'.");
        }
    }
async function verifyValue(target, value) {
        var property;
        try {
            var container = await getContainer(target);
            target = container.target;
            container = container.container;
            var query = await container.$x(target);
            var elementHandle = query[0];
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
    }
async function waitForPageToLoad() {
        await page.waitForFunction(() => {
            while (document.readyState !== 'complete');
            return true;
        });
    }
async function waitForVisible(target) {
        var container = await getContainer(target);
        target = container.target;
        container = container.container;
        return await container.waitForXPath(target, { visible: true });
    }
async function getContainer(selector) {
        await waitForPageToLoad();

        try {
            await selectedFrame.waitForXPath(selector, { timeout: 3000 , visible: true});
            return { container: selectedFrame, target: selector };
        } catch (timeout) {
            //element was not in selectedFrame
        }

        var result = await searchFrames(selector);
        if (result) return { container: result, target: selector };

        //If this is reached, target was not found in any frame, so the locator was bad.
        console.log('Element not found at the given locator: ' + selector);

        //The code below will search nearby indices for nth-of-type elements
        var nthIndexBounds = [];
        var j = selector.length - 1;
        while (j > 0) {
            //skip if the ancestor is an not nth-of-type()
            if (selector.charAt(j) === ']') {
                var k = j;

                //grab the index. skip if there is no index
                j = j - 2;
                while (selector.charAt(j) !== '[') j--;
                try {
                    index = parseInt(selector.substring(j + 1, k));
                    if (isNaN(index)) throw Error('Tried to parse a predicate as an index. Oops. Moving on.');
                    nthIndexBounds.unshift(k); //end
                    nthIndexBounds.unshift(j + 1); //start
                } catch (notAnInt) {
                    //console.log(notAnInt);
                }
            }

            //find the next ancestor's end
            while (j > 0 && selector.charAt(j) !== '/' && selector.charAt(j - 1) !== '/') {
                j--;
            }

            j--;
        }

        //while holding all else the same, check the closest indices of all elements in the path where
        //an index is used (nth-of-type elements)
        //ex: //span[5]/div[5], //span[4]/div[5], //span[3]/div[5]... //span[6]/div[5]... //span[5]/div[4]... //span[5]/div[6]... and so on
        var numIndices = nthIndexBounds.length / 2;
        for (i = 0; i < numIndices; i += 2) {
            var start = nthIndexBounds[i];
            var end = nthIndexBounds[i + 1];
            var index = parseInt(selector.substring(start, end));
            var newSelector;

            var range = 10;
            for (j = -1 * range; j <= range; j++) {
                if (index + j < 1 || j === 0) continue;
                newSelector = selector.substring(0, start) + (index + j) + selector.substring(end, selector.length);
                console.log('Looking for element at: ' + newSelector);
                var result = await searchFrames(newSelector);
                if (result) {
                    return { container: result, target: newSelector };
                }
            }
        }

        console.log('Element not found. Returning null.');
        return null;
    }
async function searchFrames(selector) {
        await page.waitFor(500);
        var frames = await page.frames();
        var i, length = frames.length;
        for (i = 0; i < length; i++) {
            query = await frames[i].$x(selector);
            element = query[0];
            if (element && element != undefined && element.toString() !== undefined) {
                try {
                    frames[i].waitFor(selector, {timeout: 5000, visible: true});
                } catch (error) {
                    throw "Element found, but it never became visible. " + error;
                    process.exit();
                }
                return frames[i];
            }
        }
        return null;
    }
async function assertionHelper(target, regex) {
        await page.evaluate((t, r) => {
            var elem = document.scripts;
            var reg = new RegExp(r);
            for (var i = 0; i < elem.length; i++) {
                var txt = elem[i].textContent.match(reg);
                if (txt) {
                    var checkText = txt[1].replace('\\\\n', '\\n');
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
})()
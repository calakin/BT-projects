var xpath2css = require('xpath2css');
var puppeteer = require('puppeteer');
var $ = require('jQuery');
var url = '';
var count = 1;

runTest();

async function runTest() {
	await puppeteer.launch({ headless: false, args: ['--start-maximized'] }).then(async browser => {

		//setup puppeteer
		const page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080 });

		//Run Commands
		while(i==2) {
		await waitForVisible_('id=sometext1', '', page);
		await waitForVisible_('id=sometext2', '', page);
		}
		await waitForVisible_('id=sometext3', '', page);
	});
}

async function while_(target, value, page) { /* does nothing */ }

async function waitForVisible_(target, value, page) {
        var selector = locatorToSelector(target);
        await page.waitForSelector(selector, { visible: true });
    }

async function endWhile_(target, value, page) { /* does nothing */ }

function locatorToSelector(target) {
    var selector;

	if (target.substring(0, 2) === "//") {
		selector = xpath2css(target);
	} else if (target.substring(0, 3) === "id=") {
		selector = "[id=" + target.substring(3, target.length) + "]";
	} else if (target.substring(0,5) === "name=") {
		selector = "[name=" + target.substring(5, target.length) + "]";
	} else if (target.substring(0,5) === "link=") {
		//selector = "[link=" + target.substring(5, target.length) + "]";
	} else if (target.substring(0,11) === "identifier=") {
		selector = "[name=" + target.substring(11, target.length) + "],[id=" + target.substring(11, target.length) + "]";
	} else if (target.substring(0,4) === "dom=") {

	} else if (target.substring(0, 4) === "css=") {
		selector = target.substring(4, target.length);
	} else if (target.substring(0,3) === "ui=") {

	} else {
		selector = target;
	}

	return selector;
}
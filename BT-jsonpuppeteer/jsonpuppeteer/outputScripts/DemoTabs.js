var fs = require('fs');
var xpath2css = require('xpath2css');
var puppeteer = require('puppeteer');
var $ = require('jQuery');
const delay = require('delay');
var curpage = null;

var browserTabs = []; 
var lastIndex = 0
var nextPrompt = ''; 
var tempContainer = null
eval(fs.readFileSync('ScreenToScriptUtil.js')+'');

runTest();

async function runTest() {
	await puppeteer.launch({ headless: false, args: ['--start-maximized'] }).then(async browser => {

		//setup puppeteer
		curpage = await browser.newPage();
		await curpage._client.send('Emulation.clearDeviceMetricsOverride');

		await delay(1000);
		var winWidth = await curpage.evaluate(
			() => {
				return window.innerWidth;
			}
        );
		var winHeight = await curpage.evaluate(
			() => {
				return window.innerHeight;
			}
        );
		await delay(1000);
		await curpage.setViewport({ width: winWidth, height: winHeight });
		var storedValues = {};
		browserTabs.push(curpage);

		//Run Commands
		await open_('https://a9t9.com/kantu/demo/tabs', '', storedValues);
		await click_('link=Open new web page in new browser tab', '', storedValues);
		await selectWindow_('tab=1', '', storedValues);
		await assertTitle_('*1* TAB1', '', storedValues);
		await type_('id=sometext1', 'this is tab 1', storedValues);
		await click_('link=Open yet another web page in a new browser tab', '', storedValues);
		await selectWindow_('tab=2', '', storedValues);
		await assertTitle_('*2* TAB2', '', storedValues);
		await type_('id=sometext2', 'And this is tab 2!', storedValues);
		await selectWindow_('tab=1', '', storedValues);
		await assertTitle_('*1* TAB1', '', storedValues);
		await type_('id=sometext1', 'Now back in tab 1 - test done!', storedValues);
		await comment_('We can also open new tabs', '', storedValues);
		await selectWindow_('tab=open', 'https://a9t9.com', storedValues);
		await selectWindow_('tab=open', 'https://ocr.space', storedValues);
		await type_('id=imageUrl', 'Kantu Tab Test done', storedValues);
	});
}


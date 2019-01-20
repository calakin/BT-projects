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
		await open_('https://test.buildertrend.net/default.aspx', '', storedValues);
		await click_('id=ctl00_ctl00_ctl00_MasterMain_MasterMain_MasterMain_txtUserID_Textbox1', '', storedValues);
		await type_('id=ctl00_ctl00_ctl00_MasterMain_MasterMain_MasterMain_txtUserID_Textbox1', 'nichbuilder', storedValues);
		await storeValue_('id=ctl00_ctl00_ctl00_MasterMain_MasterMain_MasterMain_txtUserID_Textbox1', 'userid', storedValues);
		if(eval(insertStoredValues("\'${userid}\' === \'nichbuilder\'", storedValues))) {
			await comment_('This should have been reached.', '', storedValues);
			} else {
			await comment_('This should not have been reached.', '', storedValues);
			await endIf_('', '', storedValues);
				});
}


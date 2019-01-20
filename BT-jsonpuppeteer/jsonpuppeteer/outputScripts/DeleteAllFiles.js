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
		await verifyValue_('id=ctl00_ctl00_ctl00_MasterMain_MasterMain_MasterMain_txtUserID_Textbox1', 'something that is not correct', storedValues);
		await assertValue_('id=ctl00_ctl00_ctl00_MasterMain_MasterMain_MasterMain_txtUserID_Textbox1', '${userid}', storedValues);
		if(eval(insertStoredValues("${userpassword} === undefined", storedValues))) {
			await comment_('Entered password is ${userpassword}. That is wrong. Here, I\'ll do it for you. Passwords are no problem, you be whoever you want to be.', '', storedValues);
			await store_('bt!23', 'correctpassword', storedValues);
			await type_('id=ctl00_ctl00_ctl00_MasterMain_MasterMain_MasterMain_txtPassword_Textbox1', '${correctpassword}', storedValues);
			} else {
			await comment_('NOT REACHED!!!', '', storedValues);
			}
		await click_('id=ctl00_ctl00_ctl00_MasterMain_MasterMain_MasterMain_btnLogin', '', storedValues);
		await click_('id=ctl00_ctl00_BaseMain_MainContentHolder_btnAddNewTodo_btn1', '', storedValues);
	});
}


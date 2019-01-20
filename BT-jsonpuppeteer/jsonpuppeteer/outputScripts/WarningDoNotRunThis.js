var fs = require('fs');
var $ = require('jQuery');
const delay = require('delay');
var xpath2css = require('xpath2css');
var puppeteer = require('puppeteer');
eval(fs.readFileSync('ScreenToScriptUtil.js')+'');

var curpage = null;
var browserTabs = []; 
var lastIndex = 0
var nextPrompt = ''; 
var tempContainer = null
runTest();

async function runTest() {
	await puppeteer.launch({ headless: false, args: ['--start-maximized'] }).then(async browser => {

		//setup puppeteer
		curpage = await browser.newPage();
		await curpage._client.send('Emulation.clearDeviceMetricsOverride');

		await delay(1000);
		var winWidth = await curpage.evaluate(() => { return window.innerWidth; });
		var winHeight = await curpage.evaluate(() => { return window.innerHeight; });
		await delay(1000);
		await curpage.setViewport({ width: winWidth, height: winHeight });
		var storedValues = {};
		browserTabs.push(curpage);

		//Run Commands
		await open_('https://test.buildertrend.net/default.aspx', '', storedValues);
		await click_('id=ctl00_ctl00_ctl00_MasterMain_MasterMain_MasterMain_txtUserID_Textbox1', '', storedValues);
		await type_('id=ctl00_ctl00_ctl00_MasterMain_MasterMain_MasterMain_txtUserID_Textbox1', 'nichbuilder', storedValues);
		await type_('id=ctl00_ctl00_ctl00_MasterMain_MasterMain_MasterMain_txtPassword_Textbox1', 'bt!23', storedValues);
		await clickAndWait_('id=ctl00_ctl00_ctl00_MasterMain_MasterMain_MasterMain_btnLogin', '', storedValues);
		await click_('id=ctl00_ctl00_BaseMain_MainContentHolder_btnAddNewTodo_btn1', '', storedValues);
		await selectFrame_('id=ifrdivBasePopupWithIFrame', '', storedValues);
		await click_('//*[@id=\"ctl00_ctl00_BaseMain_MainContentHolder_ecToDos_lstJobsites_DropDownList1_chosen\"]/a/span', '', storedValues);
		await clickAndWait_('//*[@id=\"ctl00_ctl00_BaseMain_MainContentHolder_ecToDos_lstJobsites_DropDownList1_chosen\"]/div/ul/li[2]', '', storedValues);
		await type_('id=ctl00_ctl00_BaseMain_MainContentHolder_ecToDos_chkStatusRedesign_Checkbox1', 'on', storedValues);
		await click_('//*[@id=\"ctl00_ctl00_BaseMain_MainContentHolder_ecToDos_divMarkedComplete\"]/div[1]/label', '', storedValues);
		await click_('id=ctl00_ctl00_BaseMain_MainContentHolder_ecToDos_chkStatusRedesign_Checkbox1', '', storedValues);
		await type_('id=ctl00_ctl00_BaseMain_MainContentHolder_ecToDos_chkStatusRedesign_Checkbox1', 'on', storedValues);
		await click_('//*[@id=\"ctl00_ctl00_BaseMain_MainContentHolder_ecToDos_divMarkedComplete\"]/div[1]/label', '', storedValues);
		await click_('id=ctl00_ctl00_BaseMain_MainContentHolder_ecToDos_chkStatusRedesign_Checkbox1', '', storedValues);
		await click_('id=ctl00_ctl00_BaseMain_MainContentHolder_ecToDos_txtNotesRedesign_txtEditor_Textbox1', '', storedValues);
		await type_('id=ctl00_ctl00_BaseMain_MainContentHolder_ecToDos_txtNotesRedesign_txtEditor_Textbox1', 'placeholder', storedValues);
	});
}
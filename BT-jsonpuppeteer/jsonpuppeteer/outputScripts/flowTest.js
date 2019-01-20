var fs = require('fs');
var xpath2css = require('xpath2css');
var puppeteer = require('puppeteer');
var $ = require('jQuery');
var reload = require('reload');
const delay = require('delay');
var curpage = null;
var browserTabs = []; 
var lastIndex = 0
eval(fs.readFileSync('ScreenToScriptUtil.js')+'');

runTest();

async function runTest() {
	await puppeteer.launch({ headless: false, args: ['--start-maximized'] }).then(async browser => {

		//setup puppeteer
		curpage = await browser.newPage();
		await curpage.setViewport({ width: 1320, height: 800 });
		var storedValues = {};
		browserTabs.push(curpage);

		//Run Commands
		var labels = JSON.parse('{"conditions":{"start":true,"middle1":true,"middle2":true},"order":["start","middle1","middle2"]}');
		middle2:
		while (labels.conditions.middle2) {
			
			middle1:
			while (labels.conditions.middle1) {
				
				start:
				while (labels.conditions.start) {
					
					//start content:
					await comment_('start', '', storedValues);
					
					break start;
					}
				
				//middle1 content:
				await comment_('middle1', '', storedValues);
				
				break middle1;
				}
			
			//middle2 content:
			await comment_('middle2', '', storedValues);
			labels.conditions[labels.order[0]] = true;
			labels.conditions[labels.order[1]] = true;
			labels.conditions[labels.order[2]] = true;
			continue middle2;
			
			break middle2;
			}
		
	});
}


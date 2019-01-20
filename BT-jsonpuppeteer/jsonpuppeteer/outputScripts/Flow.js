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
		var labels = JSON.parse('{"conditions":{"start":true,"someLabel":true,"end":true},"order":["start","someLabel","end"]}');
		
		await store_('10', 'i', storedValues);
		await store_('true', 'condition', storedValues);
		end:
		while (labels.conditions.end) {
			
			someLabel:
			while (labels.conditions.someLabel) {
				
				start:
				while (labels.conditions.start) {
					
					//start content:
					await comment_('Starting while loop. i = ${i}.', '', storedValues);
					while(eval(insertStoredValues("${i} > 0", storedValues))) {
						if(eval(insertStoredValues("(${i} % 2) !== 0", storedValues))) {
							await comment_('${i} is odd', '', storedValues);
							}
						await storeEval_('${i} - 1', 'i', storedValues);
						if (eval(insertStoredValues("${condition}", storedValues))) {
							break start;
							}
						}
					break someLabel;
					
					break start;
					}
				
				//someLabel content:
				await comment_('Reached someLabel', '', storedValues);
				await store_('false', 'condition', storedValues);
				labels.conditions[labels.order[0]] = true;
				labels.conditions[labels.order[1]] = true;
				continue someLabel;
				
				break someLabel;
				}
			
			//end content:
			await comment_('end reached', '', storedValues);
			
			break end;
			}	});
}


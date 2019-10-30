require("dotenv").config();

const findPageEvents = require("./find.page.events");

describe("find page events", () => {
	it.each([["BikeDemoPH", true], ["BeerfestAus", true]])(
		"should find events from page",
		async (pageId, shouldExpect) => {
			browser = await require("../puppeteer.launcher")();

			const page = await browser.newPage();

			const scrapedEvents = await findPageEvents(page, pageId);

			browser.close();
			if (shouldExpect) expect(scrapedEvents.length).toBeGreaterThan(0);
			else expect(scrapedEvents.length).not.toBeGreaterThan(0);
		},
		60000
	);
});

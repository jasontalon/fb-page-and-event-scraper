const puppeteer = require("puppeteer"),
	util = require("util"),
	findEvent = require("./find.event");

describe("find event", () => {
	const events = [
		["X1234", false],
		["399966184209551", false],
		["399966184209550", true],
		["2372231356328409", true],
		["519978018545462", true],
		["440608969898681", true]
	];
	it.each(events)(
		"should find event",
		async (id, shouldExect) => {
			const browser = await puppeteer.launch({
				defaultViewport: null,
				args: ["--lang=en", "--no-sandbox", "--disable-setuid-sandbox"]
			});

			const page = await browser.newPage();

			const event = await findEvent(page, id);
			console.log(util.inspect(event));

			if (shouldExect) expect(event).toEqual(expect.anything());
			else expect(event).not.toEqual(expect.anything());
			await browser.close();
		},
		60000
	);

	it.each([["500890194059089,440608969898681,X1234,1361286364025406", true]])(
		"should do batch event find",
		async (eventIds, shouldExpect) => {
			const browser = await puppeteer.launch({
				defaultViewport: null,
				args: ["--lang=en", "--no-sandbox", "--disable-setuid-sandbox"]
			});

			const eventIdArray = eventIds.split(",");
			const tasks = [];
			eventIdArray.forEach(eventId => {
				tasks.push(
					new Promise(async (resolve, reject) => {
						try {
							const event = await findEvent(
								await browser.newPage(),
								eventId
							);
							resolve(event);
						} catch (error) {
							reject(error);
						}
					})
				);
			});

			const results = (await Promise.all(tasks)).filter(p => p);

			if (shouldExpect) expect(results).toEqual(expect.anything());
			else expect(results).not.toEqual(expect.anything());

			await browser.close();
		},
		60000
	);
});

const puppeteer = require("puppeteer"),
	findEvents = require("./find.events");

describe("find events", () => {
	let browser;

	beforeEach(async () => {
		browser = await puppeteer.launch({
			args: ["--lang=en", "--no-sandbox", "--disable-setuid-sandbox"]
		});
	});

	afterEach(async () => {
		await browser.close();
	});

	it.each([
		[
			"111536102195858",
			"2019-11-01",
			"2019-11-03",
			["1821948261404481", "183019258855149"],
			true
		],
		[
			"113177738697183",
			"2019-12-01",
			"2020-12-20",
			["1821948261404481", "183019258855149"],
			true
		],
		[
			"XXABCS",
			"2019-11-01",
			"2019-11-15",
			[
				"660032617536373",
				"392955781081975",
				"370585540007142",
				"607999416057365"
			],
			false
		],
		[
			"112662635414357",
			"2019-11-01",
			"2019-11-15",
			[
				"660032617536373",
				"392955781081975",
				"370585540007142",
				"607999416057365"
			],
			true
		]
	])(
		"should find events",
		async (city, startDate, endDate, categories, shouldExpect) => {
			const scrapedEvents = await findEvents(
				await browser.newPage(),
				city,
				categories,
				startDate,
				endDate
			);

			console.log(`${scrapedEvents.events.length} events found`);
			if (shouldExpect)
				expect(scrapedEvents.events.length).toBeGreaterThan(0);
			else expect(scrapedEvents.events.length).not.toBeGreaterThan(0);
		},
		180000
	);
});

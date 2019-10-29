const findCity = require("./find.city"),
	puppeteer = require("puppeteer");

describe("find city", () => {
	let browser;

	beforeEach(async () => {
		browser = await puppeteer.launch({
			args: ["--lang=en"]
		});
	});

	afterEach(async () => {
		await browser.close();
	});

	test.each([
		["New York, New York", true],
		["sydney, australia", true],
		["XDASJNMNX", false]
	])(
		"should find city",
		async (keyword, shouldExpect) => {
			const city = await findCity(await browser.newPage(), keyword);

			if (shouldExpect) expect(city).toEqual(expect.anything());
			else expect(city).not.toEqual(expect.anything());
		},
		30000
	);
});

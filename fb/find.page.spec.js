require("dotenv").config();

const findPage = require("./find.page");

describe("find page", () => {
	it.each([["ValenzuelaCityGov", true], ["laoisdN1010", false]])(
		"should find page",
		async (pageId, shouldExpect) => {
			browser = await require("../puppeteer.launcher")();

			const page = await browser.newPage();
			const pageDetails = await findPage(page, pageId);

			browser.close();
			if (shouldExpect) expect(pageDetails).toEqual(expect.anything());
			else expect(pageDetails).not.toEqual(expect.anything());
		},
		60000
	);
});

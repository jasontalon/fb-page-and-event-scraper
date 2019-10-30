const puppeteer = require("puppeteer");

module.exports = async (proxy = null) => {
	const ignoreHTTPSErrors = true;
	let args = ["--lang=en", "--no-sandbox", "--disable-setuid-sandbox"];

	if (proxy) args.push(`--proxy-server=${proxy}`);

	if (process.env.USE_LOCAL_PUPPETEER) {
		const headless =
			typeof process.env.HEADLESS === "undefined" ||
			process.env.HEADLESS === "true" ||
			process.env.HEADLESS === "";
		return await puppeteer.launch({
			headless,
			args,
			ignoreHTTPSErrors
		});
	} else {
		args.push("timeout=300000");
		const browserWSEndpoint = `${
			process.env.BROWSER_WS_ENDPOINT
		}?${args.join("&")}`;
		return await puppeteer.connect({
			browserWSEndpoint,
			ignoreHTTPSErrors
		});
	}
};

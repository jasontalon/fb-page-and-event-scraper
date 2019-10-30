const findTicket = require("./find.ticket");

function scrapeHost(element) {
	const titleElement = element.nextElementSibling.querySelector("a");
	if (titleElement)
		return { link: titleElement.href, name: titleElement.innerText };
	return null;
}
function splitByNewLine(value) {
	return value
		.split(/\n/gm)
		.map(i => i.trim())
		.filter(i => i);
}

function scrapeLocation() {
	return Array.from(document.querySelectorAll("dd")).pop().parentNode
		.innerText;
}

async function scrapeEvent(page, id) {
	await page.goto("https://m.facebook.com/" + id, {
		waitUntil: "networkidle2"
	});

	if ((await page.$("div#event_header")) == null) return null; //return null if invalid or not exists

	const host = await page.$eval("header", scrapeHost),
		title = await page.$eval("header", el => el.innerText),
		date = await page.$eval("dt", el => el.innerText),
		location = await page.evaluate(scrapeLocation),
		summary = await page.$eval("section#event_summary", el => el.innerText),
		ticket = await findTicket(id);

	const event = {
		id,
		host,
		title,
		date,
		location: splitByNewLine(location),
		summary: splitByNewLine(summary),
		ticket
	};
	return event;
}

module.exports = scrapeEvent;

const scrapeEvents = () => {
	return Array.from(document.querySelectorAll("a[href^='/events/']"))
		.filter(i => /\/events\/\d{15,17}\?/gm.test(i.href))
		.map(i => ({
			id: i.href.match(/\d{15,17}/gm).pop(),
			name: i.parentNode.firstChild.innerText,
			summary: [...new Set(i.parentNode.innerText.split(/\n/gm))]
		}));
};

async function findPageEvents(page, pageId) {
	await page.goto(`https://m.facebook.com/pg/${pageId}/events/`, {
		waitUntil: "networkidle2"
	});

	return await page.evaluate(scrapeEvents);
}

module.exports = findPageEvents;

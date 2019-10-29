const findTicket = require("./find.ticket"),
	checkEventForTicket = async event => ({
		...event,
		ticket: await checkForTicket(event.id)
	}),
	checkForTicket = async eventId => await findTicket(eventId);

async function findEvents(page, city, categories, startDate, endDate) {
	const eventLimit = 500,
		facebookDiscoverEventsUrl = "https://m.facebook.com/events/discovery/",
		searchQueryString = makeSearchQueryString(
			city,
			categories,
			startDate,
			endDate
		),
		url = facebookDiscoverEventsUrl + searchQueryString;
	page.on("console", console.log);

	await page.goto(url, {
		waitUntil: "networkidle2"
	});

	await page.evaluate(autoScroll, eventLimit);

	const events = await Promise.all(
		refineScrapedEvents(await page.evaluate(scrapeEvents)).map(
			checkEventForTicket
		)
	);

	return { url, events };
}

function refineScrapedEvents(scrapedEvents) {
	let refinedEvents = [];
	scrapedEvents.forEach(event => {
		const { path, date, description } = event,
			splittedDescription = description
				.split(/\n|·/gm)
				.map(desc => desc.trim()),
			refinedEvent = {
				id: path.match(/\d{15,17}/gm).pop(),
				date,
				title: splittedDescription[0],
				description: splittedDescription
			};
		refinedEvents.push(refinedEvent);
	});

	return refinedEvents;
}
function makeSearchQueryString(city, categories, startDate, endDate) {
	const suggestion_token = {
		city,
		event_categories: categories,
		time: JSON.stringify({
			start: startDate,
			end: endDate
		})
	};

	return `?suggestion_token=${JSON.stringify(suggestion_token)}`;
}
async function scrapeEvents() {
	const items = Array.from(document.querySelectorAll("a[href^='/events/']"))
		.filter(
			e =>
				e.dataset.store &&
				e.innerText == "View Event" &&
				/^\/events\/\d{15,17}/gm.test(e.pathname)
		)
		.map(p => ({
			path: p.pathname,
			description: p.previousSibling.lastChild.innerText,
			date: p.previousSibling.firstChild.title
		}));

	console.log(JSON.stringify(items));
	return items;
}
async function autoScroll(limit) {
	if (!limit) limit = 200;
	await new Promise((resolve, reject) => {
		let prevHeight = 0;
		let timer = setInterval(async () => {
			let eventCount = Array.from(
				document.querySelectorAll("a[href^='/events/']")
			)
				.filter(
					e =>
						e.dataset.store &&
						e.innerText == "View Event" &&
						/^\/events\/\d{15,17}/gm.test(e.pathname)
				)
				.map(p => ({
					path: p.pathname,
					description: p.previousSibling.lastChild.innerText,
					date: p.previousSibling.firstChild.title
				})).length;

			console.log(
				`document.body.scrollHeight=${document.body.scrollHeight};prevHeight=${prevHeight};limit=${limit};eventCount=${eventCount}`
			);
			if (document.body.scrollHeight > prevHeight && limit > eventCount)
				window.scrollTo(0, document.body.scrollHeight);
			else {
				console.log("stop scrolling...");
				clearInterval(timer);
				resolve();
			}
			prevHeight = document.body.scrollHeight;
		}, 2200);
	});
}
module.exports = findEvents;

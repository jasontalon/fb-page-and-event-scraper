const puppeteer = require("puppeteer"),
	fb = require("../fb"),
	util = require("util"),
	eventCategoryList = require("../fb/event.categories.json");

const launchBrowser = async (proxy = null) => {
	let args = ["--lang=en", "--no-sandbox", "--disable-setuid-sandbox"];
	if (proxy) args.push(`--proxy-server=${proxy}`);
	return await puppeteer.launch({
		defaultViewport: null,
		args
	});
};

const eventCategories = (req, res) => res.jsonp(eventCategoryList);

const findEvents = async (req, res) => {
	let { categories, city, startdate, enddate, proxy, noticket } = req.query;

	const browser = await launchBrowser(proxy);

	try {
		if (startdate || !enddate) enddate = startdate;
		else if (!startdate || !enddate)
			throw new Error("Please specify date range.");

		const cityInfo = /^\d{15,17}$/gm.test(city)
			? { id: city }
			: await fb.findCity(await browser.newPage(), city);

		if (!cityInfo) throw new Error(`${city} not found.`);

		const categoryInfos = (categories || "")
			.split(",")
			.map(category => fb.findCategory(category))
			.filter(category => category);

		if (!categoryInfos)
			throw new Error("please specify valid event categories");

		const categoryIds = categoryInfos.map(category => category.id);

		let events = await fb.findEvents(
			await browser.newPage(),
			cityInfo.id,
			categoryIds,
			startdate,
			enddate
		);

		if (noticket || noticket == "")
			events.events = events.events.filter(p => p.ticket.url == null);

		events.total = events.events.length;

		res.jsonp({
			city: cityInfo,
			categories: categoryInfos,
			dates: { startdate, enddate },
			events
		});
	} catch (error) {
		res.status(500).send({ error: util.inspect(error) });
	} finally {
		browser.close();
	}
};

const findEvent = async (req, res) => {
	const { id } = req.params,
		{ proxy } = req.query;
	const browser = await launchBrowser(proxy);

	try {
		const page = await browser.newPage();

		const event = await fb.findEvent(page, id);

		res.jsonp(event);
	} catch (error) {
		res.status(500).send({ error: util.inspect(error) });
	} finally {
		await browser.close();
	}
};

const findEventsByBatch = async (req, res) => {
	const { ids, proxy } = req.query,
		browser = await launchBrowser(proxy);

	try {
		const eventIdArray = ids.split(","),
			tasks = [];
		eventIdArray.forEach(eventId => {
			tasks.push(
				new Promise(async (resolve, reject) => {
					try {
						const event = await fb.findEvent(
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

		const events = (await Promise.all(tasks)).filter(p => p);

		res.jsonp({ count: events.length, events });
	} catch (error) {
		res.status(500).send({ error: util.inspect(error) });
	} finally {
		await browser.close();
	}
};

const findTicket = async (req, res) => {
	try {
		const { id } = req.params;
		const ticket = await fb.findTicket(id);
		res.jsonp(ticket);
	} catch (error) {
		res.status(500).send({ error: util.inspect(error) });
	}
};

const findPage = async (req, res) => {
	const { proxy } = req.query,
		{ id } = req.params,
		browser = await launchBrowser(proxy);

	try {
		const page = await fb.findPage(await browser.newPage(), id);
		res.jsonp(page);
	} catch (error) {
		res.status(500).send({ error: util.inspect(error) });
	} finally {
		await browser.close();
	}
};

const findPageEvents = async (req, res) => {
	const { proxy } = req.query,
		{ id } = req.params,
		browser = await launchBrowser(proxy);

	try {
		const events = await fb.findPageEvents(await browser.newPage(), id);
		res.jsonp({ total: events.length, events });
	} catch (error) {
		res.status(500).send({ error: util.inspect(error) });
	} finally {
		await browser.close();
	}
};
module.exports = {
	get: [
		["/tickets/:id", findTicket],
		["/events/categories", eventCategories],
		["/events/find/batch", findEventsByBatch],
		["/events/find", findEvents],
		["/events/:id", findEvent],
		["/pages/:id/events", findPageEvents],
		["/pages/:id", findPage]
	]
};

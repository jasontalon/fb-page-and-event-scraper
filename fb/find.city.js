module.exports = async (page, city) => {
	await page.goto("https://m.facebook.com/places/", {
		waitUntil: "networkidle2"
	});

	const txtBoxElement = await page.waitForSelector(
		"input[name='city_query']",
		{ timeout: 3000 }
	);

	await txtBoxElement.tap();
	await txtBoxElement.type(city);

	let cityResult;
	try {
		const resultElement = await page.waitForSelector(
			"div[class='jx-result']",
			{ timeout: 3000 }
		);
		cityResult = await resultElement.evaluate(node => {
			var id = node.getAttribute("rel");
			if (id)
				return {
					name: node.innerText,
					id
				};
			else return null;
		});
	} catch (err) {
		/*timeout. no results returned after 3000ms*/
	} finally {
		return cityResult;
	}
};

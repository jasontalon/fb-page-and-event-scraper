const util = require("util");
module.exports = async (page, city) => {
	await page.goto("https://m.facebook.com/places/", {
		waitUntil: "networkidle2"
	});

	const txtBoxElement = await page.waitForSelector(
		"input[name='city_query']",
		{ timeout: 3000 }
	);
	await page.evaluate(
		city => (document.querySelector("input[name=city_query]").value = city),
		city
	);
	await txtBoxElement.tap();
	await page.keyboard.press("Space");

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
		console.log(util.inspect(err));
	} finally {
		return cityResult;
	}
};

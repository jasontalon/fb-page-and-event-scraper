const compareImages = require("resemblejs/compareImages"),
	detailIcons = [
		"images/fb/email.png",
		"images/fb/address.png",
		"images/fb/instagram.png",
		"images/fb/phone.png",
		"images/fb/twitter.png",
		"images/fb/website.png",
		"images/fb/info.png",
		"images/fb/category.png"
	];

const scrapePage = () =>
		Array.from(
			document.querySelectorAll(
				"div[id='pages_msite_body_contents'] img[src*='.png']"
			)
		).map((element, index) => {
			return {
				index,
				text: element.closest("div").innerText,
				img: element.getAttribute("src")
			};
		}),
	analyzeIconResemblance = (detail, icon) =>
		new Promise(async resolve =>
			resolve({
				detail,
				icon,
				...(await compareImages(detail.img, icon))
			})
		),
	isMatch = analysis => analysis.misMatchPercentage == 0,
	mapDetail = item => ({
		type: (item.icon.match(/^.*[\\\/](.*)\.[^.]+$/) || []).pop() || "",
		detail: item.detail.text
	}),
	convertResultArrayToObject = resemblanceAnalysisResults =>
		resemblanceAnalysisResults.reduce((accumulator, item) => {
			accumulator[item.type] = item.detail;
			return accumulator;
		}, {}),
	prepareTasksForAnalysis = scrapedDetails => {
		const tasks = [];
		scrapedDetails.forEach(detail => {
			detailIcons.forEach(icon =>
				tasks.push(analyzeIconResemblance(detail, icon))
			);
		});
		return tasks;
	};

async function findPage(page, id) {
	await page.goto(`https://m.facebook.com/${id}/about`, {
		waitUntil: "networkidle2"
	});
	const scrapedDetails = await page.evaluate(scrapePage);

	const resemblanceAnalysisTasks = prepareTasksForAnalysis(scrapedDetails);

	const resemblanceAnalysisResults = Array.from(
		await Promise.all(resemblanceAnalysisTasks)
	)
		.filter(isMatch)
		.map(mapDetail);

	const pageDetails =
		resemblanceAnalysisResults.length > 0
			? convertResultArrayToObject(resemblanceAnalysisResults)
			: null;

	return pageDetails
		? {
				id,
				title: (await page.title()).replace(
					/ - About \| Facebook$/gm,
					""
				),
				...pageDetails
		  }
		: null;
}

module.exports = findPage;

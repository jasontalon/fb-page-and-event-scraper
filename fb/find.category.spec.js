describe("find category", () => {
	const categories = [["music", true], ["comedy", true], ["testing?", false]];
	it.each(categories)(
		"should find category by name",
		(categoryName, shouldExpect) => {
			const category = require("./find.category")(categoryName);
			console.log(JSON.stringify(category));
			if (shouldExpect) expect(category).toEqual(expect.anything());
			else expect(category).not.toEqual(expect.anything());
		}
	);
});

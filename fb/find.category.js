module.exports = name =>
	require("./event.categories.json").find(p => p.name == name);

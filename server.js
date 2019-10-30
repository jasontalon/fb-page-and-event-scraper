require("dotenv").config();

const express = require("express"),
	app = express(),
	port = process.env.PORT || 3000,
	fbRoutes = require("./routes/fb");

app.use(express.json());
app.set("json spaces", 2);

const mapGetRoute = route => app.get(...route);

fbRoutes.get.forEach(mapGetRoute);

app.listen(port, async () => {
	console.log(`app is listening on port ${port}!`);
});

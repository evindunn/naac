const bodyParser = require("body-parser");
const express = require("express");
const logger = require("morgan");
const nunjucks = require("nunjucks");
const nunjucksDateFilter = require("nunjucks-date-filter");
const path = require("path");
const geoJsonRouter = require("../data/geojson");
const listViewRouter = require("../data/list");
const collectionEditRouter = require("../data/editCollection");

const PORT = 8080;
const isDev = process.env.NODE_ENV === "development";

// Configure app
const app = express();
app.use(logger(isDev ? "dev" : "tiny"));
app.use(bodyParser.json());

// Configure views
const nunjucksEnv = nunjucks.configure("views", {
  autoescape: true,
  express: app,
  watch: isDev
});
nunjucksEnv.addFilter("date", nunjucksDateFilter);

app.use("/geojson", geoJsonRouter);
app.use("/edit/collections", collectionEditRouter);
app.use("/edit", listViewRouter);

// Static files
app.use(express.static(path.resolve(__dirname, "..", "public")));

// Start app
app.listen(PORT, () => console.info(`Server listening on port ${PORT}...`));

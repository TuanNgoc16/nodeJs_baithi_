const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const multiparty = require("multiparty");

const handlers = require("./lib/handlers");

const app = express();

// configure Handlebars view engine
app.engine(
  "handlebars",
  expressHandlebars({
    defaultLayout: "main",
    helpers: {
      section: function (name, options) {
        if (!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
      },
    },
  })
);
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.get("/", handlers.home);
app.post("/newsletter-signup/process", handlers.newsletterSignupProcess);
app.get("/contest/photo", handlers.vacationPhotoContestAjax);
app.post("/contest/vacation-photo/:year/:month", (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    if (err)
      return handlers.vacationPhotoContestProcessError(req, res, err.message);
    console.log("got fields: ", fields);
    console.log("and files: ", files);
    handlers.vacationPhotoContestProcess(req, res, fields, files);
  });
});

app.post("/api/vacation-photo-contest/:year/:month", (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    if (err)
      return handlers.api.vacationPhotoContestError(req, res, err.message);
    handlers.api.vacationPhotoContest(req, res, fields, files);
  });
});

app.use(handlers.notFound);
app.use(handlers.serverError);

if (require.main === module) {
  app.listen(port, () => {
    console.log(
      `Express started on http://localhost:${port}` +
      "; press Ctrl-C to terminate."
    );
  });
} else {
  module.exports = app;
}

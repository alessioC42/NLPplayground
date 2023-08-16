const settings = require("./config.json");

const express = require('express');
const fs = require("fs");
const path = require("path");

const NaivebayesModelReader = require("./naivebayesModelReader");
const NgramsModelReader = require("./ngramsModelReader")

const app = express();


//load all naivebayes models
console.log("loading all naivebayes models...");

var naivebayesModels = {}
fs.readdirSync(settings.naivebayes.datasetsPath).forEach((elem, _i) => {
    naivebayesModels[elem] = new NaivebayesModelReader(path.join(settings.naivebayes.datasetsPath, elem));
})
var naivebayesModelsList = Object.keys(naivebayesModels);


//load all ngram models
console.log("loading all ngram models...");

var ngramModels = {}
fs.readdirSync(settings.ngrams.datasetsPath).forEach((elem, _i) => {
    ngramModels[elem] = new NgramsModelReader(path.join(settings.ngrams.datasetsPath, elem));
})
var ngramModelsList = Object.keys(ngramModels)


app.use("/", express.static(__dirname + "/page"))
app.use("/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist"))

app.get("/api/naivebayes", (req, res) => {
    try {
        let query = req.query.q;
        let model = naivebayesModelsList[Number(req.query.model)];

        res.send(
            naivebayesModels[model].query(query)
        ).end();
    } catch (err) {
        res.status(500).end();
    }
});

app.get("/api/naivebayes/models", (_req, res) => {
    try {
        res.send(naivebayesModelsList);
    } catch (err) {
        res.status(500).end();
    }
});

app.get("/api/ngram", (req, res) => {
    try {
        let query = req.query.q;
        let model = ngramModelsList[Number(req.query.model)];;

        res.send(
            ngramModels[model].query(query)
        ).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

app.get("/api/ngram/models", (_req, res) => {
    try {
        res.send(ngramModelsList);
    } catch (err) {
        res.status(500).end();
    }
});

if (settings.webserver.https) {
    const https = require("https");
    const http = require("http");

    http.createServer(app).listen(settings.webserver.port.http, () => {
        `running on http://localhost:${settings.webserver.port.http}/`
    })

    https
        .createServer(
            {
                key: fs.readFileSync(settings.webserver.certificate.key),
                cert: fs.readFileSync(settings.webserver.certificate.cert),
                ca: fs.readFileSync(settings.webserver.certificate.ca),
            },
            app
        )
        .listen(settings.webserver.port.https, () => console.log(`running on https://localhost:${settings.webserver.port.https}/`))
} else {
    app.listen(settings.webserver.port.http, () => console.log(`running on http://localhost:${settings.webserver.port.http}/`))
}

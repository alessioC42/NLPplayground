const express = require('express');
const fs = require("fs");
const path = require("path");

const NaivebayesModelReader = require("./naivebayesModelReader");

const app = express();
const settings = require("./config.json");




//load all naivebayes models
console.log("loading all naivebayes models...")

var naivebayesModels = {}
fs.readdirSync(settings.naivebayes.datasetsPath).forEach((elem, _i)=>{
    naivebayesModels[elem] = new NaivebayesModelReader(path.join(settings.naivebayes.datasetsPath, elem));
})


app.use("/", express.static(__dirname + "/page"))
app.use("/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist"))

app.get("/api/naivebayes", (req, res) => {
    try {
        let query = req.query.q;
        let model = req.query.model;

        res.send(
            naivebayesModels[model].query(query)
        ).end();
    } catch (err){
        res.status(500).end();
    }
});

app.get("/api/naivebayes/models", (_req, res) => {
    try {
        res.send(Object.keys(naivebayesModels));
    } catch (err) {
        res.status(500).end();
    }
})


app.listen(settings.webserver.port, () => console.log(`Example app listening on port ${settings.webserver.port}!`))
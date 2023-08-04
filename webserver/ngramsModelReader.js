const fs = require("fs");

class NgramsModelReader {
    constructor(modelsFileLocation) {
        this.model = {};
        this.loadModel(modelsFileLocation);
    }

    loadModel(modelsFile) {
        try {
            var data = fs.readFileSync(modelsFile, "utf8");
            this.model = JSON.parse(data);
        } catch (err) {
            console.log(err);
            throw new Error("Error reading or parsing the trained data file.");
        }
    }

    query(query) {
        let word = query.split(" ").pop();

        let currentModel = this.model;

        for (let i = 0; i < word.length; i++) {
            currentModel = currentModel.find(node => node.l === word[i]);
            if (!currentModel) return word;
            currentModel = currentModel.f;
        }
        while (currentModel && currentModel[0].l !== ' ') {
            currentModel = currentModel.reduce((a, b) => a.p < b.p ? a : b);
            word += currentModel.l;
            currentModel = currentModel.f;
        }
        return word;
    }
}

module.exports = NgramsModelReader
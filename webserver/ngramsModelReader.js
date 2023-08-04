class NgramsModelReader {
    constructor(modelsFileLocation) {
        this.model = {};
        console.log(modelsFileLocation);
        this.loadModel(modelsFileLocation);
    }

    loadModel(modelsFile) {
        try {
            var data = fs.readFileSync(modelsFile, "utf8");
            this.model = JSON.parse(data);
        } catch (err) {
            throw new Error("Error reading or parsing the trained data file.");
        }
    }

    query(query) {
        let word = query.split(" ").pop();

        for (let i = 0; i < word.length; i++) {
            this.model = this.model.find(node => node.l === word[i]);
            if (!this.model) return word;
            this.model = this.model.f;
        }
        while (this.model && this.model[0].l !== ' ') {
            this.model = this.model.reduce((a, b) => a.p < b.p ? a : b);
            word += this.model.l;
            this.model = this.model.f;
        }
        return word;
    }
}
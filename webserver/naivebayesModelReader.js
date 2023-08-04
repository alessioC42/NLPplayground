const fs = require("fs");
const math = require("mathjs");

class NaivebayesModelReader {
  constructor(modelsFileLocation) {
    this.trainedData = {};
    console.log(modelsFileLocation);
    this.loadModel(modelsFileLocation);
  }

  loadModel(modelsFile) {
    try {
      var data = fs.readFileSync(modelsFile, "utf8");
      this.trainedData = JSON.parse(data);
    } catch (err) {
      throw new Error("Error reading or parsing the trained data file.");
    }
  }

  sampleWord(word) {
    var wordSample = word.toLowerCase();
    var punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    for (var char of punctuation) {
      wordSample = wordSample.replace(char, "");
    }
    return wordSample;
  }

  sampleText(text) {
    var textSample = text.toLowerCase();
    var punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    for (var char of punctuation) {
      textSample = textSample.replace(char, "");
    }
    return textSample.split(" ");
  }

  getWordLabelProbability(word, label) {
    var wordSample = this.sampleWord(word);
    var LABEL_WORD_BAGS = this.trainedData.LABEL_WORD_BAGS;
    var LABEL_TOTAL_WORDS = this.trainedData.LABEL_TOTAL_WORDS;
    var TOTAL_WORDS = this.trainedData.TOTAL_WORDS;

    if (LABEL_WORD_BAGS[label][wordSample]) {
      var wordOccurrences = LABEL_WORD_BAGS[label][wordSample] + 1;
      var totalWordsInLabelBag = LABEL_TOTAL_WORDS[label];
      return wordOccurrences / totalWordsInLabelBag;
    } else {
      return 1 / (TOTAL_WORDS + 1);
    }
  }

  getLabelTextProbability(label, text) {
    var labelProbability = this.trainedData.LABEL_PROBABILITIES[label];
    var textProbability = this.ENABLE_LOG_SPACE ? 0 : 1;
    var textSample = this.sampleText(text);
    for (var word of textSample) {
      if (this.ENABLE_LOG_SPACE) {
        textProbability += -math.log(this.getWordLabelProbability(word, label));
      } else {
        textProbability *= this.getWordLabelProbability(word, label);
      }
    }
    return textProbability * (this.MULTIPLY_LABEL_PROBABILITY ? labelProbability : 1);
  }

  query(text) {
    if (!this.trainedData || !this.trainedData.LABELS) {
      throw new Error("Model data not loaded or invalid.");
    }

    var LABELS = this.trainedData.LABELS;
    var probabilities = {};

    for (var label of LABELS) {
      probabilities[label] = this.getLabelTextProbability(label, text);
    }

    var totalProbability = Object.values(probabilities).reduce((sum, val) => sum + val, 0);
    var result = {};

    for (var [label, probability] of Object.entries(probabilities)) {
      result[label] = probability / totalProbability;
    }

    return result;
  }
}

module.exports = NaivebayesModelReader
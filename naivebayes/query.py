"""
USAGE:

python3 test.py <model.json> <query>
"""


import logging
import json
import math
from string import punctuation
from sys import argv

def sample_word(word: str):
    word_sample = word.lower()
    for char in punctuation:
        word_sample = word_sample.replace(char, "")
        return word_sample


def sample_text(text: str):
    text_sample = text.lower()
    for char in punctuation:
        text_sample = text_sample.replace(char, "")
    text_sample = text_sample.split(" ")
    return text_sample


def get_word_label_probability(word: str, label: str):
    word_sample = sample_word(word)
    if word_sample in LABEL_WORD_BAGS[label].keys():
        word_occurrences = LABEL_WORD_BAGS[label][word_sample] + 1
        total_words_in_label_bag = LABEL_TOTAL_WORDS[label]
        return word_occurrences / total_words_in_label_bag
    else:
        return 1 / (TOTAL_WORDS + 1)


query = " ".join(argv[2: len(argv)])

maxed_probability = 0
maxed_arg = None


def get_label_text_probability(label: str, text: str):
    label_probability = LABEL_PROBABILITIES[label]
    text_probability = 0 if ENABLE_LOG_SPACE else 1
    text_sample = sample_text(text)
    for word in text_sample:
        if ENABLE_LOG_SPACE:
            text_probability += -math.log(get_word_label_probability(word, label))
        else:
            text_probability *= get_word_label_probability(word, label)
    return text_probability * (label_probability if MULTIPLY_LABEL_PROBABILITY else 1)


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG, format="(%(asctime)s) [%(name)s] [%(levelname)s] %(message)s")

    ENABLE_LOG_SPACE = False
    MULTIPLY_LABEL_PROBABILITY = False
    CHANCE_OUTPUT_DIGITS = 3

    with open(argv[1], "r") as f:
        TRAINED_DATA = json.load(f)
        LABEL_WORD_BAGS = TRAINED_DATA["LABEL_WORD_BAGS"]
        LABELS = TRAINED_DATA["LABELS"]
        LABEL_TOTAL_WORDS = TRAINED_DATA["LABEL_TOTAL_WORDS"]
        LABEL_PROBABILITIES = TRAINED_DATA["LABEL_PROBABILITIES"]
        TOTAL_WORDS = TRAINED_DATA["TOTAL_WORDS"]



    probabilities = {}
    for label in LABELS:
        probabilities[label] = get_label_text_probability(label, query)
    total_probability = sum(probabilities.values())
    percentages = {}
    for label, probability in probabilities.items():
        coefficent = 10 ** CHANCE_OUTPUT_DIGITS
        percentages[label + " Sterne"] = str(int(probability / total_probability * 100 * coefficent) / coefficent) + "%"

    print("query: ", query)
    print("Bewertung: %s Sterne" % max(probabilities, key=probabilities.get))
    print("Chancen: %s" % percentages)

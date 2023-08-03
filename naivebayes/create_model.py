import json
import time
import logging

FILENAME = "f_Amazon_Digital_Music.json"
TRAINING_FILE = f"training_datasets/{FILENAME}"
OUTPUT_FILE = f"trained_datasets/trained_{FILENAME}"
REMOVE_CHARS = [",", ";", ".", ":", "-", "'", "+", "*", "~", "`", "?", "\\", "!", '"', "&"]
LINE_LIMIT = -1  # -1 for unlimited
labels = []
logging.basicConfig(level=logging.DEBUG, format="(%(asctime)s) [%(name)s] [%(levelname)s] %(message)s")
logging.debug("Declaring & defining basic functions")


def sample_text(text: str):
    text_sample = text.lower()
    for char in REMOVE_CHARS:
        text_sample = text_sample.replace(char, "")
    text_sample = text_sample.split(" ")
    return text_sample


def get_word_bag(text: str):
    bag = {}
    text_sample = sample_text(text)
    for word in text_sample:
        if word in bag.keys():
            bag[word] += 1
        else:
            bag[word] = 1
    return bag


logging.debug("Creating output file")
open(OUTPUT_FILE, "w").close()

logging.info("Beginning with Training")
start_time = time.time()

logging.debug("Initializing variables")
LABEL_WORD_BAGS = {}
label_occurences = {}
total_length = 0
total_words = 0
logging.debug("Building label word bags, label occurences")
with open(TRAINING_FILE, "r") as f:
    line = f.readline()
    while len(line) != 0 and total_length != LINE_LIMIT:
        total_length += 1
        print(f"\rProcessing line: {total_length}", end="")
        line_loaded = json.loads(line)
        text = line_loaded["text"]
        label = line_loaded["label"]
        if label not in labels:
            label_occurences[label] = 1
            labels.append(label)
            LABEL_WORD_BAGS[label] = {}
        else:
            label_occurences[label] += 1
        word_bag = get_word_bag(text)
        total_words += len(word_bag)
        for word, times in word_bag.items():
            try:
                LABEL_WORD_BAGS[label][word] += times
            except KeyError:
                LABEL_WORD_BAGS[label][word] = times
        line = f.readline()
print("\r", end="")
logging.info(f"Total lines processed: {total_length}")
logging.info(f"Total words processed: {total_words}")

logging.debug(f"Built label word bags, label occurences")

logging.debug("Calculating label specific properties")
LABEL_PROBABILITIES = {}
LABEL_TOTAL_WORDS = {}
for label in labels:
    LABEL_PROBABILITIES[label] = label_occurences[label] / total_length
    LABEL_TOTAL_WORDS[label] = sum(LABEL_WORD_BAGS[label].values())

end_time = time.time()
training_seconds = end_time - start_time
logging.info(f"Training finished successfully, took {training_seconds} seconds")


logging.debug("Writing to output file")
with open(OUTPUT_FILE, "w") as f:
    f.write(json.dumps({
        "TOTAL_WORDS": total_words,
        "LABELS": labels,
        "LABEL_PROBABILITIES": LABEL_PROBABILITIES,
        "LABEL_TOTAL_WORDS": LABEL_TOTAL_WORDS,
        "LABEL_WORD_BAGS": LABEL_WORD_BAGS
    }))

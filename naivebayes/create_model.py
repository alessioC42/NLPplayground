import json
import logging
from string import punctuation

FILENAME = "All_Amazon_Review_format.json"
TRAINING_FILE = "training_datasets/" + FILENAME
OUTPUT_FILE = "trained_datasets/trained_" + FILENAME
REMOVE_CHARS = punctuation + "\n"
LINE_LIMIT = -1  # -1 for unlimited
labels = []
logging.basicConfig(level=logging.DEBUG, format="(%(asctime)s) [%(name)s] [%(levelname)s] %(message)s")
logging.debug("Declaring & defining basic functions")


def sample_text(text):
    text_sample = text.lower()
    for char in REMOVE_CHARS:
        text_sample = text_sample.replace(char, " ")
    text_sample = text_sample.split(" ")
    return text_sample


def get_word_bag(text):
    bag = {}
    text_sample = sample_text(text)
    for word in text_sample:
        if word in bag:
            bag[word] += 1
        else:
            bag[word] = 1
    return bag


logging.debug("Creating output file")
open(OUTPUT_FILE, "w").close()


logging.debug("Initializing variables")
LABEL_WORD_BAGS = {}
label_occurrences = {}
total_length = 0
total_words = 0
logging.debug("Building label word bags, label occurrences")

# Use a context manager to open the file and iterate through lines
with open(TRAINING_FILE, "r") as f:
    for line in f:
        if total_length == LINE_LIMIT:
            break
        
        total_length += 1
        print("\r"+str((total_length/233000000)*100), end="")
        
        line_loaded = json.loads(line)
        text = line_loaded["text"]
        label = line_loaded["label"]
        
        if label not in labels:
            label_occurrences[label] = 1
            labels.append(label)
            LABEL_WORD_BAGS[label] = {}
        else:
            label_occurrences[label] += 1
        
        word_bag = get_word_bag(text)
        total_words += len(word_bag)
        
        for word, times in word_bag.items():
            LABEL_WORD_BAGS[label][word] = LABEL_WORD_BAGS[label].get(word, 0) + times

# Calculate the words to remove
words_to_remove = {label: {word for word, count in word_bag.items() if count <= 1} 
                   for label, word_bag in LABEL_WORD_BAGS.items()}

# Remove the words from the bags
for label in labels:
    LABEL_WORD_BAGS[label] = {word: count for word, count in LABEL_WORD_BAGS[label].items() 
                              if word not in words_to_remove[label]}


print("\n\n")
logging.info("Total lines processed: " + str(total_length))
logging.info("Total words processed: " + str(total_words))

logging.debug("Built label word bags, label occurrences")

logging.debug("Calculating label specific properties")
LABEL_PROBABILITIES = {label: occurrences / total_length for label, occurrences in label_occurrences.items()}
LABEL_TOTAL_WORDS = {label: sum(word_bag.values()) for label, word_bag in LABEL_WORD_BAGS.items()}

logging.debug("Writing to output file")
output_data = {
    "TOTAL_WORDS": total_words,
    "LABELS": labels,
    "LABEL_PROBABILITIES": LABEL_PROBABILITIES,
    "LABEL_TOTAL_WORDS": LABEL_TOTAL_WORDS,
    "LABEL_WORD_BAGS": LABEL_WORD_BAGS
}

with open(OUTPUT_FILE, "w") as f:
    json.dump(output_data, f)

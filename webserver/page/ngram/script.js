const input = document.getElementById("input")
const output = document.getElementById("output")
const select = document.getElementById("model")

select.addEventListener("change", () => {
    completeWord();
})
input.addEventListener("input", () => {
    completeWord();
})

function loadSelect() {
    fetch("/api/ngram/models")
        .then((response) => response.json())
        .then((models) => {
            models.forEach((element, i) => {
                let option = document.createElement("option");
                option.value = String(i);
                option.innerText = element;
                select.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Error fetching models:", error);
        });
}

async function completeWord() {
    let query = input.value;
    let model = select.value;

    try {
        const response = await fetch(`/api/ngram?model=${model}&q=${decodeURIComponent(query.toLowerCase())}`);
        output.value = await response.text();
    } catch (error) {
        console.error("Error completing word:", error);
    }
}

loadSelect()
completeWord()
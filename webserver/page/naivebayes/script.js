const input = document.getElementById("input");
const select = document.getElementById("model");

select.addEventListener("change", () => {
	progressBarContainer.innerHTML = "";
  progressBars = {};
  queryString();
});
input.addEventListener("input", () => {
  queryString();
});

function loadSelect() {
  fetch("/api/naivebayes/models")
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

async function queryString() {
  let query = input.value;
  let model = select.value;

  try {
    const response = await fetch(
      `/api/naivebayes?model=${model}&q=${decodeURIComponent(query)}`
    );
    let responseText = JSON.parse(await response.text());
		
		if (responseText["0"]) {
			delete responseText["0"]
		}

    renderProgressBars(responseText);
  } catch (error) {
    console.error("Error completing word:", error);
  }
}

loadSelect();
queryString();

const progressBarContainer = document.getElementById("progressContainer");
let progressBars = {};

function renderProgressBars(data) {
  // Remove old progress bars not present in the new data
  for (const key in progressBars) {
    if (!data.hasOwnProperty(key)) {
      progressBars[key].parentNode.removeChild(progressBars[key]);
      delete progressBars[key];
    }
  }

  // Create or update progress bars
  for (const key in data) {
    if (!progressBars[key]) {
      const progressBar = document.createElement("div");
      progressBar.className = "progress mb-3";

      const progressBarInner = document.createElement("div");
      progressBarInner.className = "progress-bar";
      progressBarInner.style.width = `${data[key] * 100}%`;
      progressBarInner.setAttribute("role", "progressbar");
      progressBarInner.setAttribute("aria-valuenow", data[key] * 100);
      progressBarInner.setAttribute("aria-valuemin", 0);
      progressBarInner.setAttribute("aria-valuemax", 100);
      progressBarInner.textContent = `${(data[key] * 100).toFixed(2)}%`;

			const progressBarLabel = document.createElement("h7")
			progressBarLabel.innerText = key;
			progressBarLabel.className = "mt-2"

      progressBar.appendChild(progressBarInner);
			progressBarContainer.appendChild(progressBarLabel)
      progressBarContainer.appendChild(progressBar);

      progressBars[key] = progressBarInner;
    } else {
      const progressBar = progressBars[key];
      progressBar.style.width = `${data[key] * 100}%`;
      progressBar.setAttribute("aria-valuenow", data[key] * 100);
      progressBar.textContent = `${(data[key] * 100).toFixed(2)}%`;
    }
  }
}

const STORAGE_KEY = "bacbo_history";

let history = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "[]"
);

const $ = (id) => document.getElementById(id);

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history)
  );

  render();
}

function render() {
  const counts = {
    P: 0,
    B: 0,
    E: 0
  };

  history.forEach(result => {
    counts[result]++;
  });

  $("cp").textContent = counts.P;
  $("cb").textContent = counts.B;
  $("ce").textContent = counts.E;
  $("total").textContent = history.length;

  $("history").innerHTML =
    history.length
      ? history.map(result =>
          `<span class="ball ${result}">${result}</span>`
        ).join("")
      : "Sem resultados";

  if (!history.length) {
    $("signal").textContent =
      "Aguardando resultados";

    $("confidence").textContent = "";
    $("streak").textContent = "—";
    return;
  }

  const last = history[history.length - 1];

  let streak = 1;

  for (
    let i = history.length - 2;
    i >= 0 && history[i] === last;
    i--
  ) {
    streak++;
  }

  $("streak").textContent =
    `${last} × ${streak}`;

  const recent = history
    .filter(x => x !== "E")
    .slice(-12);

  if (!recent.length) {
    $("signal").textContent =
      "Sem tendência";

    $("confidence").textContent =
      "Aguardando mais dados";

    return;
  }

  const player =
    recent.filter(x => x === "P").length;

  const banker =
    recent.filter(x => x === "B").length;

  let signal;

  if (player > banker) {
    signal = "Tendência: PLAYER";
  } else if (banker > player) {
    signal = "Tendência: BANKER";
  } else {
    signal = "Tendência: EQUILÍBRIO";
  }

  $("signal").textContent = signal;

  $("confidence").textContent =
    `Base estatística: últimos ${recent.length} resultados`;
}

document
  .querySelectorAll("[data-r]")
  .forEach(button => {

    button.addEventListener("click", () => {

      history.push(
        button.dataset.r
      );

      save();
    });

  });

$("undo").addEventListener(
  "click",
  () => {

    if (history.length) {
      history.pop();
      save();
    }

  }
);

$("clear").addEventListener(
  "click",
  () => {

    if (
      confirm(
        "Apagar todo o histórico?"
      )
    ) {

      history = [];
      save();
    }

  }
);

let deferredPrompt;

window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredPrompt = event;

    $("install").hidden = false;
  }
);

$("install").addEventListener(
  "click",
  async () => {

    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt = null;

    $("install").hidden = true;
  }
);

if ("serviceWorker" in navigator) {

  navigator.serviceWorker.register(
    "sw.js"
  );
}

render();

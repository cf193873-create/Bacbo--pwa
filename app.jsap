const STORAGE_KEY = "bacbo_history";

let history = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "[]"
);

const $ = (id) => document.getElementById(id);


/* =========================
   GUARDAR
========================= */

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history)
  );

  render();
}


/* =========================
   CONTAGEM
========================= */

function countResults(list) {

  return {
    P: list.filter(x => x === "P").length,
    B: list.filter(x => x === "B").length,
    E: list.filter(x => x === "E").length
  };

}


/* =========================
   SEQUÊNCIA
========================= */

function getStreak() {

  if (!history.length) {
    return {
      result: null,
      count: 0
    };
  }

  const last =
    history[history.length - 1];

  let count = 1;

  for (
    let i = history.length - 2;
    i >= 0 && history[i] === last;
    i--
  ) {
    count++;
  }

  return {
    result: last,
    count
  };

}


/* =========================
   ANÁLISE
========================= */

function calculateSignal() {

  const recent =
    history
      .filter(x => x === "P" || x === "B")
      .slice(-12);

  if (recent.length < 5) {

    return {
      signal: "Aguardando dados",
      confidence: 0,
      reason:
        "Registe pelo menos 5 resultados P/B para iniciar a análise."
    };

  }

  const counts =
    countResults(recent);

  const total =
    counts.P + counts.B;

  const playerPercent =
    Math.round((counts.P / total) * 100);

  const bankerPercent =
    Math.round((counts.B / total) * 100);


  /*
    O indicador mede apenas a frequência
    observada no histórico recente.
  */

  if (playerPercent > bankerPercent) {

    return {

      signal: "TENDÊNCIA PLAYER",

      confidence:
        playerPercent,

      reason:
        `${counts.P} Player contra ${counts.B} Banker nos últimos ${total} resultados analisados.`

    };

  }


  if (bankerPercent > playerPercent) {

    return {

      signal: "TENDÊNCIA BANKER",

      confidence:
        bankerPercent,

      reason:
        `${counts.B} Banker contra ${counts.P} Player nos últimos ${total} resultados analisados.`

    };

  }


  return {

    signal: "EQUILÍBRIO",

    confidence: 50,

    reason:
      "Player e Banker aparecem com frequência semelhante no período analisado."

  };

}


/* =========================
   RENDERIZAR
========================= */

function render() {

  const counts =
    countResults(history);


  /*
    Estatísticas
  */

  $("cp").textContent =
    counts.P;

  $("cb").textContent =
    counts.B;

  $("ce").textContent =
    counts.E;

  $("total").textContent =
    history.length;


  /*
    Histórico visual
  */

  if (!history.length) {

    $("history").innerHTML =
      "Sem resultados";

  } else {

    $("history").innerHTML =
      history
        .map(result =>
          `<span class="ball ${result}">
             ${result}
           </span>`
        )
        .join("");

  }


  /*
    Sequência
  */

  const streak =
    getStreak();

  if (streak.result) {

    const names = {

      P: "PLAYER",

      B: "BANKER",

      E: "EMPATE"

    };

    $("streak").textContent =
      `${names[streak.result]} × ${streak.count}`;

  } else {

    $("streak").textContent =
      "—";

  }


  /*
    Indicador
  */

  const result =
    calculateSignal();


  $("signal").textContent =
    result.signal;


  if (result.confidence) {

    $("confidence").textContent =
      `Frequência observada: ${result.confidence}%`;

  } else {

    $("confidence").textContent =
      "";

  }


  /*
    Alerta
  */

  $("alert").textContent =
    result.signal;


  $("reason").textContent =
    result.reason;


  /*
    Análise
  */

  if (history.length >= 5) {

    const recent =
      history
        .filter(x => x !== "E")
        .slice(-12);

    const c =
      countResults(recent);

    $("analysis").textContent =
      `Últimos ${recent.length}: ${c.P} Player, ${c.B} Banker e ${history.filter(x => x === "E").length} Empates no histórico total.`;

  } else {

    $("analysis").textContent =
      "Ainda não existem dados suficientes.";

  }

}


/* =========================
   BOTÕES P / B / E
========================= */

document
  .querySelectorAll("[data-r]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        history.push(
          button.dataset.r
        );

        save();

      }
    );

  });


/* =========================
   DESFAZER
========================= */

$("undo").addEventListener(
  "click",
  () => {

    if (history.length > 0) {

      history.pop();

      save();

    }

  }
);


/* =========================
   LIMPAR
========================= */

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


/* =========================
   INSTALAÇÃO PWA
========================= */

let deferredPrompt = null;

window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredPrompt = event;

    const install =
      $("install");

    if (install) {

      install.hidden = false;

    }

  }
);


const installButton =
  $("install");


if (installButton) {

  installButton.addEventListener(
    "click",
    async () => {

      if (!deferredPrompt) {

        return;

      }

      deferredPrompt.prompt();

      await deferredPrompt.userChoice;

      deferredPrompt = null;

      installButton.hidden = true;

    }
  );

}


/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("sw.js")
        .catch(error => {

          console.log(
            "Service Worker:",
            error
          );

        });

    }
  );

}


/* =========================
   INICIALIZAR
========================= */

render();

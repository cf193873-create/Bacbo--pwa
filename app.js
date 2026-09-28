const KEY = "bacbo_history_v2";

let history = JSON.parse(
  localStorage.getItem(KEY) || "[]"
);


// ==============================
// GUARDAR
// ==============================

function save() {
  localStorage.setItem(
    KEY,
    JSON.stringify(history)
  );
}


// ==============================
// ADICIONAR RESULTADO
// ==============================

function addResult(result) {

  history.push(result);

  // Mantém no máximo 500 resultados
  if (history.length > 500) {
    history = history.slice(-500);
  }

  save();
  render();
}


// ==============================
// DESFAZER
// ==============================

function undo() {

  if (history.length === 0) {
    return;
  }

  history.pop();

  save();
  render();
}


// ==============================
// LIMPAR
// ==============================

function clearAll() {

  if (history.length === 0) {
    return;
  }

  const ok = confirm(
    "Apagar todo o histórico?"
  );

  if (!ok) {
    return;
  }

  history = [];

  save();
  render();
}


// ==============================
// PERCENTAGEM
// ==============================

function percentage(value, total) {

  if (!total) {
    return 0;
  }

  return Math.round(
    (value / total) * 100
  );
}


// ==============================
// ANÁLISE DO HISTÓRICO
// ==============================

function analyze() {

  const totalResults = history.length;


  // Ainda não há dados suficientes
  if (totalResults < 10) {

    return {
      signal: "—",
      confidence: 0,
      reason:
        "Introduza pelo menos 10 resultados."
    };
  }


  // Últimas 20 rodadas
  const recent = history.slice(-20);

  const total = recent.length;


  // Contagens
  const player =
    recent.filter(
      result => result === "P"
    ).length;

  const banker =
    recent.filter(
      result => result === "B"
    ).length;

  const empate =
    recent.filter(
      result => result === "E"
    ).length;


  // Percentagens
  const playerRate =
    player / total;

  const bankerRate =
    banker / total;


  // Últimas 5 rodadas
  const last5 = recent.slice(-5);

  const player5 =
    last5.filter(
      result => result === "P"
    ).length;

  const banker5 =
    last5.filter(
      result => result === "B"
    ).length;


  /*
    Modelo simples e transparente:

    85% frequência das últimas 20
    15% frequência das últimas 5

    Isto NÃO significa que a próxima rodada
    possa ser prevista com certeza.
  */

  const playerScore =
    (playerRate * 85) +
    ((player5 / 5) * 15);

  const bankerScore =
    (bankerRate * 85) +
    ((banker5 / 5) * 15);


  const difference =
    Math.abs(
      playerScore - bankerScore
    );


  let signal = "—";
  let confidence = 0;


  /*
    Só gera sinal quando existe
    uma diferença mínima entre os lados.
  */

  if (
    difference >= 12 &&
    Math.max(
      playerScore,
      bankerScore
    ) >= 48
  ) {

    if (
      playerScore >
      bankerScore
    ) {

      signal = "P";

    } else {

      signal = "B";

    }

    confidence =
      Math.round(
        50 + (difference * 0.8)
      );

    // Limites de segurança
    confidence =
      Math.max(
        55,
        Math.min(
          88,
          confidence
        )
      );

  } else {

    signal = "—";

    confidence =
      Math.min(
        54,
        Math.round(
          50 + difference
        )
      );
  }


  let reason;


  if (signal === "P") {

    reason =
      "PLAYER apresenta maior peso estatístico recente.";

  } else if (signal === "B") {

    reason =
      "BANKER apresenta maior peso estatístico recente.";

  } else {

    reason =
      "Dados demasiado equilibrados — aguardar.";
  }


  return {
    signal,
    confidence,
    reason
  };
}


// ==============================
// DESENHAR HISTÓRICO
// ==============================

function renderHistory() {

  const historyElement =
    document.getElementById(
      "history"
    );


  const visible =
    history.slice(-60);


  historyElement.innerHTML = "";


  visible.forEach(
    (result, index) => {

      const dot =
        document.createElement(
          "span"
        );


      dot.classList.add(
        "dot"
      );


      if (result === "P") {
        dot.classList.add("p");
      }

      if (result === "B") {
        dot.classList.add("b");
      }

      if (result === "E") {
        dot.classList.add("e");
      }


      dot.textContent = result;


      dot.title =
        "Resultado " +
        (
          history.length -
          visible.length +
          index +
          1
        );


      historyElement.appendChild(
        dot
      );
    }
  );
}


// ==============================
// ESTATÍSTICAS
// ==============================

function renderStats() {

  const total =
    history.length;


  const player =
    history.filter(
      result => result === "P"
    ).length;


  const banker =
    history.filter(
      result => result === "B"
    ).length;


  const empate =
    history.filter(
      result => result === "E"
    ).length;


  document.getElementById(
    "pPct"
  ).textContent =
    percentage(
      player,
      total
    ) + "%";


  document.getElementById(
    "bPct"
  ).textContent =
    percentage(
      banker,
      total
    ) + "%";


  document.getElementById(
    "ePct"
  ).textContent =
    percentage(
      empate,
      total
    ) + "%";


  document.getElementById(
    "roundCount"
  ).textContent =
    total;
}


// ==============================
// SINAL
// ==============================

function renderSignal() {

  const result =
    analyze();


  const ball =
    document.getElementById(
      "signalBall"
    );


  const text =
    document.getElementById(
      "signalText"
    );


  const reason =
    document.getElementById(
      "signalReason"
    );


  const confidence =
    document.getElementById(
      "confidence"
    );


  const bar =
    document.getElementById(
      "confidenceBar"
    );


  // Limpar classes
  ball.className =
    "signal-ball";


  if (result.signal === "P") {

    ball.classList.add("p");

    ball.textContent = "P";

    text.textContent =
      "PLAYER";

  }

  else if (
    result.signal === "B"
  ) {

    ball.classList.add("b");

    ball.textContent = "B";

    text.textContent =
      "BANKER";

  }

  else {

    ball.textContent = "—";

    text.textContent =
      "SEM SINAL";
  }


  confidence.textContent =
    result.confidence + "%";


  bar.style.width =
    result.confidence + "%";


  reason.textContent =
    result.reason;
}


// ==============================
// RENDER GERAL
// ==============================

function render() {

  renderHistory();

  renderStats();

  renderSignal();
}


// ==============================
// INICIAR
// ==============================

render();

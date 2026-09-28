// =====================================================
// BAC BO LIVE - APP.JS
// =====================================================

"use strict";

// -----------------------------
// CONFIGURAÇÃO
// -----------------------------

const STORAGE_KEY = "bacbo_results";
const MAX_HISTORY = 200;

// -----------------------------
// ESTADO
// -----------------------------

let results = loadResults();

// -----------------------------
// ELEMENTOS
// -----------------------------

const historyElement =
    document.getElementById("history");

const playerCountElement =
    document.getElementById("playerCount") ||
    document.getElementById("cp");

const bankerCountElement =
    document.getElementById("bankerCount") ||
    document.getElementById("cb");

const tieCountElement =
    document.getElementById("tieCount") ||
    document.getElementById("ce");

const totalElement =
    document.getElementById("total");

const signalElement =
    document.getElementById("signal");

const confidenceElement =
    document.getElementById("confidence");

const reasonElement =
    document.getElementById("reason");

const streakElement =
    document.getElementById("streak");


// =====================================================
// ARMAZENAMENTO
// =====================================================

function loadResults() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const data = JSON.parse(saved);

        if (!Array.isArray(data)) {
            return [];
        }

        return data.filter(function (item) {

            return (
                item === "P" ||
                item === "B" ||
                item === "E"
            );

        });

    } catch (error) {

        console.error(
            "Erro ao carregar resultados:",
            error
        );

        return [];
    }
}


function saveResults() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(results)
    );
}


// =====================================================
// ADICIONAR RESULTADO
// =====================================================

function addResult(result) {

    if (
        result !== "P" &&
        result !== "B" &&
        result !== "E"
    ) {
        return;
    }

    results.push(result);

    if (results.length > MAX_HISTORY) {
        results.shift();
    }

    saveResults();

    updateApp();
}


// =====================================================
// DESFAZER
// =====================================================

function undoResult() {

    if (results.length === 0) {
        return;
    }

    results.pop();

    saveResults();

    updateApp();
}


// =====================================================
// LIMPAR
// =====================================================

function clearResults() {

    if (results.length === 0) {
        return;
    }

    const confirmed =
        confirm(
            "Deseja apagar todo o histórico?"
        );

    if (!confirmed) {
        return;
    }

    results = [];

    saveResults();

    updateApp();
}


// =====================================================
// CONTADORES
// =====================================================

function getCounts() {

    let player = 0;
    let banker = 0;
    let tie = 0;

    results.forEach(function (result) {

        if (result === "P") {
            player++;
        }

        if (result === "B") {
            banker++;
        }

        if (result === "E") {
            tie++;
        }

    });

    return {
        player,
        banker,
        tie
    };
}


// =====================================================
// ESTATÍSTICAS
// =====================================================

function updateStats() {

    const counts = getCounts();

    if (playerCountElement) {
        playerCountElement.textContent =
            counts.player;
    }

    if (bankerCountElement) {
        bankerCountElement.textContent =
            counts.banker;
    }

    if (tieCountElement) {
        tieCountElement.textContent =
            counts.tie;
    }

    if (totalElement) {
        totalElement.textContent =
            results.length;
    }

    updateStreak();
}


// =====================================================
// SEQUÊNCIA
// =====================================================

function getCurrentStreak() {

    if (results.length === 0) {

        return {
            result: "-",
            count: 0
        };
    }

    const last =
        results[results.length - 1];

    let count = 0;

    for (
        let i = results.length - 1;
        i >= 0;
        i--
    ) {

        if (results[i] === last) {
            count++;
        } else {
            break;
        }
    }

    return {
        result: last,
        count
    };
}


function updateStreak() {

    if (!streakElement) {
        return;
    }

    const streak =
        getCurrentStreak();

    if (streak.count === 0) {

        streakElement.textContent =
            "-";

        return;
    }

    streakElement.textContent =
        streak.result +
        " × " +
        streak.count;
}


// =====================================================
// HISTÓRICO VISUAL
// =====================================================

function renderHistory() {

    if (!historyElement) {
        return;
    }

    historyElement.innerHTML = "";

    results.forEach(function (result) {

        const circle =
            document.createElement("div");

        circle.classList.add(
            "result-circle"
        );

        circle.textContent = result;

        if (result === "P") {

            circle.classList.add(
                "player"
            );

        } else if (result === "B") {

            circle.classList.add(
                "banker"
            );

        } else {

            circle.classList.add(
                "tie"
            );
        }

        historyElement.appendChild(
            circle
        );

    });

    historyElement.scrollLeft =
        historyElement.scrollWidth;
}


// =====================================================
// ANÁLISE
// =====================================================

function analyse() {

    const filtered =
        results.filter(function (result) {

            return (
                result === "P" ||
                result === "B"
            );

        });

    const lastResults =
        filtered.slice(-12);

    if (lastResults.length < 5) {

        return {
            signal: "AGUARDAR",
            confidence: 0,
            reason:
                "Introduza pelo menos 5 resultados P/B."
        };
    }

    const player =
        lastResults.filter(
            x => x === "P"
        ).length;

    const banker =
        lastResults.filter(
            x => x === "B"
        ).length;

    const total =
        lastResults.length;

    const playerPercentage =
        Math.round(
            player / total * 100
        );

    const bankerPercentage =
        Math.round(
            banker / total * 100
        );

    const lastFive =
        lastResults.slice(-5);

    const playerLastFive =
        lastFive.filter(
            x => x === "P"
        ).length;

    const bankerLastFive =
        lastFive.filter(
            x => x === "B"
        ).length;

    let signal = "AGUARDAR";
    let confidence = 0;
    let reason =
        "Não existe uma tendência estatística clara.";

    if (
        player > banker &&
        playerLastFive >= 3
    ) {

        signal = "P";

        confidence =
            50 +
            (player - banker) * 7 +
            playerLastFive * 3;

        reason =
            "Tendência recente para Player.";

    } else if (
        banker > player &&
        bankerLastFive >= 3
    ) {

        signal = "B";

        confidence =
            50 +
            (banker - player) * 7 +
            bankerLastFive * 3;

        reason =
            "Tendência recente para Banker.";
    }

    confidence =
        Math.min(
            95,
            Math.max(
                0,
                Math.round(confidence)
            )
        );

    return {
        signal,
        confidence,
        reason,
        playerPercentage,
        bankerPercentage
    };
}


// =====================================================
// MOSTRAR SINAL
// =====================================================

function updateSignal() {

    if (!signalElement) {
        return;
    }

    const analysis =
        analyse();

    signalElement.textContent =
        analysis.signal;

    signalElement.className =
        "signal";

    if (analysis.signal === "P") {

        signalElement.classList.add(
            "signal-player"
        );

    } else if (
        analysis.signal === "B"
    ) {

        signalElement.classList.add(
            "signal-banker"
        );

    } else {

        signalElement.classList.add(
            "signal-wait"
        );
    }

    if (confidenceElement) {

        confidenceElement.textContent =
            analysis.confidence +
            "%";
    }

    if (reasonElement) {

        reasonElement.textContent =
            analysis.reason;
    }
}


// =====================================================
// EVENTOS DOS BOTÕES
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-result]"
            );

        if (button) {

            const result =
                button.dataset.result;

            addResult(result);

            return;
        }

        if (
            event.target.closest("#player")
        ) {

            addResult("P");

            return;
        }

        if (
            event.target.closest("#banker")
        ) {

            addResult("B");

            return;
        }

        if (
            event.target.closest("#tie")
        ) {

            addResult("E");

            return;
        }

        if (
            event.target.closest("#undo")
        ) {

            undoResult();

            return;
        }

        if (
            event.target.closest("#clear")
        ) {

            clearResults();

            return;
        }
    }
);


// =====================================================
// PWA - INSTALAÇÃO
// =====================================================

let deferredPrompt = null;

window.addEventListener(
    "beforeinstallprompt",
    function (event) {

        event.preventDefault();

        deferredPrompt = event;

        const installButton =
            document.getElementById(
                "install"
            );

        if (installButton) {
            installButton.style.display =
                "block";
        }
    }
);


const installButton =
    document.getElementById("install");


if (installButton) {

    installButton.addEventListener(
        "click",
        async function () {

            if (!deferredPrompt) {

                alert(
                    "A instalação ainda não está disponível."
                );

                return;
            }

            deferredPrompt.prompt();

            const choice =
                await deferredPrompt.userChoice;

            if (
                choice.outcome ===
                "accepted"
            ) {

                installButton.style.display =
                    "none";
            }

            deferredPrompt = null;
        }
    );
}


window.addEventListener(
    "appinstalled",
    function () {

        deferredPrompt = null;

        if (installButton) {

            installButton.style.display =
                "none";
        }
    }
);


// =====================================================
// SERVICE WORKER
// =====================================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker
                .register("./sw.js")
                .then(function () {

                    console.log(
                        "Bac Bo: Service Worker ativo."
                    );

                })
                .catch(function (error) {

                    console.warn(
                        "Service Worker:",
                        error
                    );
                });
        }
    );
}


// =====================================================
// ATUALIZAÇÃO GERAL
// =====================================================

function updateApp() {

    renderHistory();

    updateStats();

    updateSignal();
}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateApp();

        console.log(
            "Bac Bo Live iniciado."
        );
    }
);


// =====================================================
// API GLOBAL
// =====================================================

window.BacBoApp = {

    addResult,
    undoResult,
    clearResults,
    updateApp,

    getHistory: function () {
        return [...results];
    },

    getStats: function () {
        return getCounts();
    },

    getAnalysis: function () {
        return analyse();
    }
};

/**
 * Viser status/fejl-besked i toppen af siden.
 * type = "success" eller "error"
 */
function setStatus(message, type) {
    const box = document.getElementById("statusBox");
    if (!message) {
        box.classList.add("hidden");
        box.textContent = "";
        box.classList.remove("error", "success");
        return;
    }
    box.classList.remove("hidden");
    box.textContent = message;
    box.classList.remove("error", "success");
    box.classList.add(type === "error" ? "error" : "success");
}

/**
 * Fetch der forventer JSON tilbage.
 * Kaster en fejl med en pæn besked hvis status ikke er OK.
 */
async function fetchJson(url, options) {
    setStatus("", "success");
    const res = await fetch(url, options);

    let body = null;
    try {
        body = await res.json();
    } catch (e) {
        body = null;
    }

    if (!res.ok) {
        const msg = body && body.message ? body.message : `Request failed (${res.status})`;
        throw new Error(msg);
    }
    return body;
}

/**
 * Fetch til endpoints der kan returnere 204 No Content (fx DELETE).
 */
async function fetchNoBody(url, options) {
    setStatus("", "success");
    const res = await fetch(url, options);

    if (res.status === 204) return;

    let body = null;
    try {
        body = await res.json();
    } catch (e) {
        body = null;
    }

    if (!res.ok) {
        const msg = body && body.message ? body.message : `Request failed (${res.status})`;
        throw new Error(msg);
    }
}

/**
 * Fylder en <select> med options.
 */
function fillSelect(selectId, items, getValue, getLabel) {
    const sel = document.getElementById(selectId);
    if (!sel) return;

    const current = sel.value;
    sel.innerHTML = "";

    items.forEach(it => {
        const opt = document.createElement("option");
        opt.value = String(getValue(it));
        opt.textContent = getLabel(it);
        sel.appendChild(opt);
    });

    // Bevar valgt item hvis muligt
    if (current && Array.from(sel.options).some(o => o.value === current)) {
        sel.value = current;
    }
}

/**
 * Tømmer select og sætter en placeholder option.
 */
function clearSelect(selectId, placeholderText) {
    const sel = document.getElementById(selectId);
    if (!sel) return;

    sel.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholderText;
    sel.appendChild(opt);
}

/**
 * Henter runs for en konkurrence og fylder run-dropdowns (result + view).
 */
async function loadRunsIntoDropdowns(competitionId) {
    if (!competitionId) {
        clearSelect("runSelectForResult", "Select run");
        clearSelect("runSelectForView", "Select run");
        return;
    }

    const runs = await fetchJson(`/competitions/${competitionId}/runs`);
    if (!runs || runs.length === 0) {
        clearSelect("runSelectForResult", "No runs for competition");
        clearSelect("runSelectForView", "No runs for competition");
        return;
    }

    fillSelect("runSelectForResult", runs, r => r.id, r => `Run ${r.runNumber} (id=${r.id})`);
    fillSelect("runSelectForView", runs, r => r.id, r => `Run ${r.runNumber} (id=${r.id})`);
}

/**
 * Synkroniserer "Opdater løber" felter baseret på valgt løber.
 */
async function syncUpdateSkierInputs() {
    const skierSel = document.getElementById("skierSelectForUpdate");
    const nameInput = document.getElementById("skierUpdateNameInput");
    const nationSel = document.getElementById("nationSelectForUpdate");
    if (!skierSel || !nameInput || !nationSel) return;

    const skierId = skierSel.value;
    if (!skierId) return;

    const skiers = await fetchJson("/skiers");
    const s = skiers.find(x => String(x.id) === String(skierId));
    if (!s) return;

    nameInput.value = s.name;
    nationSel.value = String(s.nationId);
}

/**
 * Opdaterer alle dropdowns i UI (nations, skiers, competitions, runs).
 */
async function refreshDropdowns() {
    try {
        const nations = await fetchJson("/nations");
        fillSelect("nationSelectForSkier", nations, n => n.id, n => `${n.name} (id=${n.id})`);
        fillSelect("nationSelectForView", nations, n => n.id, n => `${n.name} (id=${n.id})`);
        fillSelect("nationSelectForUpdate", nations, n => n.id, n => `${n.name} (id=${n.id})`);

        const competitions = await fetchJson("/competitions");
        fillSelect("competitionSelectForRun", competitions, c => c.id, c => `${c.name} (id=${c.id})`);
        fillSelect("competitionSelectForRuns", competitions, c => c.id, c => `${c.name} (id=${c.id})`);

        const skiers = await fetchJson("/skiers");
        fillSelect("skierSelectForResult", skiers, s => s.id, s => `${s.name} (id=${s.id}, ${s.nationName})`);
        fillSelect("skierSelectForUpdate", skiers, s => s.id, s => `${s.name} (id=${s.id}, ${s.nationName})`);

        // runs følger valgt konkurrence i competitionSelectForRuns
        const selectedCompId = document.getElementById("competitionSelectForRuns")?.value;
        await loadRunsIntoDropdowns(selectedCompId);

        await syncUpdateSkierInputs();
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/* ==================== CREATE/UPDATE/DELETE ==================== */

/** Opret nation (POST /nations) */
async function createNation() {
    const name = document.getElementById("nationNameInput").value;

    try {
        await fetchJson("/nations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        setStatus("Nation created.", "success");
        document.getElementById("nationNameInput").value = "";
        await refreshDropdowns();
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/** Opret løber (POST /skiers) */
async function createSkier() {
    const name = document.getElementById("skierNameInput").value;
    const nationId = Number(document.getElementById("nationSelectForSkier").value);

    try {
        await fetchJson("/skiers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, nationId })
        });
        setStatus("Skier created.", "success");
        document.getElementById("skierNameInput").value = "";
        await refreshDropdowns();
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/** Opdater løber (PUT /skiers/{id}) */
async function updateSkier() {
    const skierId = Number(document.getElementById("skierSelectForUpdate").value);
    const name = document.getElementById("skierUpdateNameInput").value;
    const nationId = Number(document.getElementById("nationSelectForUpdate").value);

    try {
        await fetchJson(`/skiers/${skierId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, nationId })
        });
        setStatus("Skier updated.", "success");
        await refreshDropdowns();
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/** Slet løber (DELETE /skiers/{id}) */
async function deleteSkier() {
    const skierId = Number(document.getElementById("skierSelectForUpdate").value);
    if (!skierId) {
        setStatus("Select a skier first.", "error");
        return;
    }

    const ok = confirm("Are you sure you want to delete this skier?");
    if (!ok) return;

    try {
        await fetchNoBody(`/skiers/${skierId}`, { method: "DELETE" });
        setStatus("Skier deleted.", "success");
        await refreshDropdowns();
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/** Opret konkurrence (POST /competitions) */
async function createCompetition() {
    const name = document.getElementById("competitionNameInput").value;
    const date = document.getElementById("competitionDateInput").value || null;

    try {
        await fetchJson("/competitions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, date })
        });
        setStatus("Competition created.", "success");
        document.getElementById("competitionNameInput").value = "";
        await refreshDropdowns();
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/** Opret run (POST /competitions/{id}/runs) */
async function createRun() {
    const competitionId = Number(document.getElementById("competitionSelectForRun").value);
    const runNumber = Number(document.getElementById("runNumberInput").value);

    try {
        await fetchJson(`/competitions/${competitionId}/runs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ runNumber })
        });
        setStatus("Run created.", "success");
        document.getElementById("runNumberInput").value = "";
        await refreshDropdowns();
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/** Opret resultat (POST /results) */
async function createResult() {
    const runIdStr = document.getElementById("runSelectForResult").value;
    const skierIdStr = document.getElementById("skierSelectForResult").value;
    const timeSeconds = Number(document.getElementById("timeSecondsInput").value);

    if (!runIdStr) { setStatus("Select a run first.", "error"); return; }
    if (!skierIdStr) { setStatus("Select a skier first.", "error"); return; }

    const runId = Number(runIdStr);
    const skierId = Number(skierIdStr);

    try {
        await fetchJson("/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ runId, skierId, timeSeconds })
        });
        setStatus("Result created.", "success");
        document.getElementById("timeSecondsInput").value = "";
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/* ==================== VISNINGER ==================== */

/** Hent og vis konkurrencer */
async function loadCompetitions() {
    try {
        const competitions = await fetchJson("/competitions");
        const list = document.getElementById("competitionList");
        list.innerHTML = "";

        competitions.forEach(c => {
            const li = document.createElement("li");
            li.innerHTML = `${c.name} (${c.date})
                <button onclick="loadLeaderboard(${c.id})">Show Leaderboard</button>`;
            list.appendChild(li);
        });

        setStatus("Competitions loaded.", "success");
        await refreshDropdowns();
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/** Hent og vis leaderboard for en konkurrence */
async function loadLeaderboard(id) {
    try {
        const data = await fetchJson(`/competitions/${id}/leaderboard`);
        const body = document.getElementById("leaderboardBody");
        body.innerHTML = "";

        data.forEach(entry => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${entry.position}</td>
                <td>${entry.skierName}</td>
                <td>${entry.nationName}</td>
                <td>${entry.totalTimeSeconds}</td>
            `;
            body.appendChild(row);
        });

        setStatus("Leaderboard loaded.", "success");
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/** Hent og vis løbere for valgt nation */
async function loadSkiersForSelectedNation() {
    const nationId = Number(document.getElementById("nationSelectForView").value);

    try {
        const data = await fetchJson(`/nations/${nationId}/skiers`);
        const list = document.getElementById("skierList");
        list.innerHTML = "";

        data.forEach(s => {
            const li = document.createElement("li");
            li.textContent = `${s.name} (${s.nationName})`;
            list.appendChild(li);
        });

        setStatus("Skiers loaded.", "success");
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/** Hent og vis resultater for valgt run */
async function loadResultsForSelectedRun() {
    const runIdStr = document.getElementById("runSelectForView").value;
    if (!runIdStr) { setStatus("Select a run first.", "error"); return; }

    const runId = Number(runIdStr);

    try {
        const data = await fetchJson(`/runs/${runId}/results`);
        const body = document.getElementById("runResultsBody");
        body.innerHTML = "";

        data.forEach(r => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${r.skierName}</td>
                <td>${r.nationName}</td>
                <td>${r.timeSeconds}</td>
            `;
            body.appendChild(row);
        });

        setStatus("Run results loaded.", "success");
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/**
 * NY FUNKTION:
 * Hent og vis hurtigste løber for valgt run (GET /runs/{runId}/fastest)
 */
async function loadFastestForSelectedRun() {
    const runIdStr = document.getElementById("runSelectForView").value;
    if (!runIdStr) { setStatus("Select a run first.", "error"); return; }

    const runId = Number(runIdStr);

    try {
        const fastest = await fetchJson(`/runs/${runId}/fastest`);
        const box = document.getElementById("fastestBox");
        box.classList.remove("hidden");
        box.classList.remove("error", "success");
        box.classList.add("success");
        box.textContent = `Hurtigste: ${fastest.skierName} (${fastest.nationName}) – ${fastest.timeSeconds} sek.`;
        setStatus("Fastest loaded.", "success");
    } catch (e) {
        setStatus(e.message, "error");
    }
}

/* ==================== INIT ==================== */

window.addEventListener("load", async () => {
    // Opdater dropdowns ved start
    await refreshDropdowns();

    // Når man skifter konkurrence, skal runs opdateres
    const compRunsSel = document.getElementById("competitionSelectForRuns");
    if (compRunsSel) {
        compRunsSel.addEventListener("change", async () => {
            try {
                await loadRunsIntoDropdowns(compRunsSel.value);
            } catch (e) {
                setStatus(e.message, "error");
            }
        });
    }

    // Når man vælger en løber til update, forfyld felter
    const skierUpdateSel = document.getElementById("skierSelectForUpdate");
    if (skierUpdateSel) {
        skierUpdateSel.addEventListener("change", async () => {
            try {
                await syncUpdateSkierInputs();
            } catch (e) {
                setStatus(e.message, "error");
            }
        });
    }
});
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

function fillSelect(selectId, items, getValue, getLabel) {
    const sel = document.getElementById(selectId);
    const current = sel.value;

    sel.innerHTML = "";
    items.forEach(it => {
        const opt = document.createElement("option");
        opt.value = String(getValue(it));
        opt.textContent = getLabel(it);
        sel.appendChild(opt);
    });

    // prøv at bevare tidligere valg hvis muligt
    if (current && Array.from(sel.options).some(o => o.value === current)) {
        sel.value = current;
    }
}

function clearSelect(selectId, placeholderText) {
    const sel = document.getElementById(selectId);
    sel.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholderText;
    sel.appendChild(opt);
}

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

async function refreshDropdowns() {
    try {
        const nations = await fetchJson("/nations");
        fillSelect("nationSelectForSkier", nations, n => n.id, n => `${n.name} (id=${n.id})`);
        fillSelect("nationSelectForView", nations, n => n.id, n => `${n.name} (id=${n.id})`);

        const competitions = await fetchJson("/competitions");
        fillSelect("competitionSelectForRun", competitions, c => c.id, c => `${c.name} (id=${c.id})`);

        // ✅ NYT: bruger samme competition-valg til at styre run dropdowns
        fillSelect("competitionSelectForRuns", competitions, c => c.id, c => `${c.name} (id=${c.id})`);

        const skiers = await fetchJson("/skiers");
        fillSelect("skierSelectForResult", skiers, s => s.id, s => `${s.name} (id=${s.id}, ${s.nationName})`);

        // load runs for currently selected competition in competitionSelectForRuns
        const selectedCompId = document.getElementById("competitionSelectForRuns").value;
        await loadRunsIntoDropdowns(selectedCompId);

    } catch (e) {
        setStatus(e.message, "error");
    }
}

/* ==================== CREATE ACTIONS ==================== */

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

/* ==================== VIEW ACTIONS ==================== */

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

/* ==================== INIT ==================== */

window.addEventListener("load", async () => {
    //  tilføjer et competition dropdown der styrer runs for result/view
    // Vi opretter den i DOM ved start hvis den ikke findes (så index.html ikke behøver ændres meget)
    // MEN: for at holde det 100% simpelt og stabilt kræver vi at index.html har den.
    await refreshDropdowns();

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
});
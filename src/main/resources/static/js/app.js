// Viser status eller fejl besked i toppen af siden
// type er success eller error
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

// Fetch der forventer JSON tilbage
// Kaster en fejl med en pæn besked hvis status ikke er OK
async function fetchJson(url, options) {
    // Ryd status ved ny request
    setStatus("", "success");
    const res = await fetch(url, options);

    // Forsøg at parse JSON body hvis den findes
    let body = null;
    try {
        body = await res.json();
    } catch (e) {
        body = null;
    }

    // Hvis status ikke er OK så kast fejl med server besked eller fallback
    if (!res.ok) {
        const msg = body && body.message ? body.message : `Request failed (${res.status})`;
        throw new Error(msg);
    }
    return body;
}

// Fetch til endpoints der kan returnere 204 No Content fx DELETE
async function fetchNoBody(url, options) {
    // Ryd status ved ny request
    setStatus("", "success");
    const res = await fetch(url, options);

    // 204 betyder ingen body at parse
    if (res.status === 204) return;

    // Forsøg at parse JSON body hvis den findes
    let body = null;
    try {
        body = await res.json();
    } catch (e) {
        body = null;
    }

    // Hvis status ikke er OK så kast fejl med server besked eller fallback
    if (!res.ok) {
        const msg = body && body.message ? body.message : `Request failed (${res.status})`;
        throw new Error(msg);
    }
}

// Fylder en select med options
function fillSelect(selectId, items, getValue, getLabel) {
    const sel = document.getElementById(selectId);
    // Hvis select ikke findes så gør ingenting
    if (!sel) return;

    // Gem nuværende valg så vi kan forsøge at bevare det
    const current = sel.value;
    sel.innerHTML = "";

    // Opret en option for hvert item
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

// Tømmer select og sætter en placeholder option
function clearSelect(selectId, placeholderText) {
    const sel = document.getElementById(selectId);
    // Hvis select ikke findes så gør ingenting
    if (!sel) return;

    sel.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholderText;
    sel.appendChild(opt);
}

// Henter runs for en konkurrence og fylder run dropdowns result og view
async function loadRunsIntoDropdowns(competitionId) {
    // Hvis ingen konkurrence er valgt så nulstil dropdowns
    if (!competitionId) {
        clearSelect("runSelectForResult", "Select run");
        clearSelect("runSelectForView", "Select run");
        return;
    }

    // Hent runs for valgt konkurrence
    const runs = await fetchJson(`/competitions/${competitionId}/runs`);
    // Hvis ingen runs så vis tydelig placeholder
    if (!runs || runs.length === 0) {
        clearSelect("runSelectForResult", "No runs for competition");
        clearSelect("runSelectForView", "No runs for competition");
        return;
    }

    // Fyld begge run dropdowns med samme data
    fillSelect("runSelectForResult", runs, r => r.id, r => `Run ${r.runNumber} (id=${r.id})`);
    fillSelect("runSelectForView", runs, r => r.id, r => `Run ${r.runNumber} (id=${r.id})`);
}

// Synkroniserer opdater løber felter baseret på valgt løber
async function syncUpdateSkierInputs() {
    const skierSel = document.getElementById("skierSelectForUpdate");
    const nameInput = document.getElementById("skierUpdateNameInput");
    const nationSel = document.getElementById("nationSelectForUpdate");
    // Hvis UI elementer mangler så stop
    if (!skierSel || !nameInput || !nationSel) return;

    // Find valgt løber id
    const skierId = skierSel.value;
    if (!skierId) return;

    // Hent alle løbere og find den valgte
    const skiers = await fetchJson("/skiers");
    const s = skiers.find(x => String(x.id) === String(skierId));
    if (!s) return;

    // Forfyld felter med eksisterende data
    nameInput.value = s.name;
    nationSel.value = String(s.nationId);
}

// Opdaterer alle dropdowns i UI nations skiers competitions runs
async function refreshDropdowns() {
    try {
        // Hent nations og opdater nation dropdowns
        const nations = await fetchJson("/nations");
        fillSelect("nationSelectForSkier", nations, n => n.id, n => `${n.name} (id=${n.id})`);
        fillSelect("nationSelectForView", nations, n => n.id, n => `${n.name} (id=${n.id})`);
        fillSelect("nationSelectForUpdate", nations, n => n.id, n => `${n.name} (id=${n.id})`);

        // Hent competitions og opdater competition dropdowns
        const competitions = await fetchJson("/competitions");
        fillSelect("competitionSelectForRun", competitions, c => c.id, c => `${c.name} (id=${c.id})`);
        fillSelect("competitionSelectForRuns", competitions, c => c.id, c => `${c.name} (id=${c.id})`);

        // Hent skiers og opdater skier dropdowns
        const skiers = await fetchJson("/skiers");
        fillSelect("skierSelectForResult", skiers, s => s.id, s => `${s.name} (id=${s.id}, ${s.nationName})`);
        fillSelect("skierSelectForUpdate", skiers, s => s.id, s => `${s.name} (id=${s.id}, ${s.nationName})`);

        // Runs følger valgt konkurrence i competitionSelectForRuns
        const selectedCompId = document.getElementById("competitionSelectForRuns")?.value;
        await loadRunsIntoDropdowns(selectedCompId);

        // Synk opdater felter for løber
        await syncUpdateSkierInputs();
    } catch (e) {
        // Vis fejl i statusfeltet
        setStatus(e.message, "error");
    }
}

// ==================== CREATE UPDATE DELETE ====================

// Opret nation POST nations
async function createNation() {
    // Læs input værdi
    const name = document.getElementById("nationNameInput").value;

    try {
        // Send request til API
        await fetchJson("/nations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        // Vis success og reset input
        setStatus("Nation created.", "success");
        document.getElementById("nationNameInput").value = "";
        // Opdater dropdowns
        await refreshDropdowns();
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// Opret løber POST skiers
async function createSkier() {
    // Læs input værdier
    const name = document.getElementById("skierNameInput").value;
    const nationId = Number(document.getElementById("nationSelectForSkier").value);

    try {
        // Send request til API
        await fetchJson("/skiers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, nationId })
        });
        // Vis success og reset input
        setStatus("Skier created.", "success");
        document.getElementById("skierNameInput").value = "";
        // Opdater dropdowns
        await refreshDropdowns();
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// Opdater løber PUT skiers id
async function updateSkier() {
    // Læs valgte og indtastede værdier
    const skierId = Number(document.getElementById("skierSelectForUpdate").value);
    const name = document.getElementById("skierUpdateNameInput").value;
    const nationId = Number(document.getElementById("nationSelectForUpdate").value);

    try {
        // Send request til API
        await fetchJson(`/skiers/${skierId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, nationId })
        });
        // Vis success og opdater UI
        setStatus("Skier updated.", "success");
        await refreshDropdowns();
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// Slet løber DELETE skiers id
async function deleteSkier() {
    // Læs valgt løber id
    const skierId = Number(document.getElementById("skierSelectForUpdate").value);
    // Stop hvis intet er valgt
    if (!skierId) {
        setStatus("Select a skier first.", "error");
        return;
    }

    // Bekræft sletning i UI
    const ok = confirm("Are you sure you want to delete this skier?");
    if (!ok) return;

    try {
        // Send DELETE request
        await fetchNoBody(`/skiers/${skierId}`, { method: "DELETE" });
        // Vis success og opdater UI
        setStatus("Skier deleted.", "success");
        await refreshDropdowns();
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// Opret konkurrence POST competitions
async function createCompetition() {
    // Læs input værdier
    const name = document.getElementById("competitionNameInput").value;
    const date = document.getElementById("competitionDateInput").value || null;

    try {
        // Send request til API
        await fetchJson("/competitions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, date })
        });
        // Vis success og reset input
        setStatus("Competition created.", "success");
        document.getElementById("competitionNameInput").value = "";
        // Opdater dropdowns
        await refreshDropdowns();
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// Opret run POST competitions id runs
async function createRun() {
    // Læs input værdier
    const competitionId = Number(document.getElementById("competitionSelectForRun").value);
    const runNumber = Number(document.getElementById("runNumberInput").value);

    try {
        // Send request til API
        await fetchJson(`/competitions/${competitionId}/runs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ runNumber })
        });
        // Vis success og reset input
        setStatus("Run created.", "success");
        document.getElementById("runNumberInput").value = "";
        // Opdater dropdowns
        await refreshDropdowns();
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// Opret resultat POST results
async function createResult() {
    // Læs input værdier
    const runIdStr = document.getElementById("runSelectForResult").value;
    const skierIdStr = document.getElementById("skierSelectForResult").value;
    const timeSeconds = Number(document.getElementById("timeSecondsInput").value);

    // Valider at run og skier er valgt
    if (!runIdStr) { setStatus("Select a run first.", "error"); return; }
    if (!skierIdStr) { setStatus("Select a skier first.", "error"); return; }

    // Konverter til tal til API payload
    const runId = Number(runIdStr);
    const skierId = Number(skierIdStr);

    try {
        // Send request til API
        await fetchJson("/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ runId, skierId, timeSeconds })
        });
        // Vis success og reset input
        setStatus("Result created.", "success");
        document.getElementById("timeSecondsInput").value = "";
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// ==================== VISNINGER ====================

// Hent og vis konkurrencer
async function loadCompetitions() {
    try {
        // Hent data fra API
        const competitions = await fetchJson("/competitions");
        const list = document.getElementById("competitionList");
        // Nulstil listen
        list.innerHTML = "";

        // Byg liste elementer med knap til leaderboard
        competitions.forEach(c => {
            const li = document.createElement("li");
            li.innerHTML = `${c.name} (${c.date})
                <button onclick="loadLeaderboard(${c.id})">Show Leaderboard</button>`;
            list.appendChild(li);
        });

        // Vis success og opdater dropdowns
        setStatus("Competitions loaded.", "success");
        await refreshDropdowns();
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// Hent og vis leaderboard for en konkurrence
async function loadLeaderboard(id) {
    try {
        // Hent leaderboard data fra API
        const data = await fetchJson(`/competitions/${id}/leaderboard`);
        const body = document.getElementById("leaderboardBody");
        // Nulstil tabel body
        body.innerHTML = "";

        // Opret en række pr entry
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

        // Vis success
        setStatus("Leaderboard loaded.", "success");
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// Hent og vis løbere for valgt nation
async function loadSkiersForSelectedNation() {
    // Læs valgt nation id
    const nationId = Number(document.getElementById("nationSelectForView").value);

    try {
        // Hent skiers for nation fra API
        const data = await fetchJson(`/nations/${nationId}/skiers`);
        const list = document.getElementById("skierList");
        // Nulstil listen
        list.innerHTML = "";

        // Byg liste elementer
        data.forEach(s => {
            const li = document.createElement("li");
            li.textContent = `${s.name} (${s.nationName})`;
            list.appendChild(li);
        });

        // Vis success
        setStatus("Skiers loaded.", "success");
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// Hent og vis resultater for valgt run
async function loadResultsForSelectedRun() {
    // Læs valgt run id
    const runIdStr = document.getElementById("runSelectForView").value;
    // Stop hvis intet run er valgt
    if (!runIdStr) { setStatus("Select a run first.", "error"); return; }

    const runId = Number(runIdStr);

    try {
        // Hent results for run fra API
        const data = await fetchJson(`/runs/${runId}/results`);
        const body = document.getElementById("runResultsBody");
        // Nulstil tabel body
        body.innerHTML = "";

        // Opret en række pr resultat
        data.forEach(r => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${r.skierName}</td>
                <td>${r.nationName}</td>
                <td>${r.timeSeconds}</td>
            `;
            body.appendChild(row);
        });

        // Vis success
        setStatus("Run results loaded.", "success");
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// NY FUNKTION
// Hent og vis hurtigste løber for valgt run GET runs runId fastest
async function loadFastestForSelectedRun() {
    // Læs valgt run id
    const runIdStr = document.getElementById("runSelectForView").value;
    // Stop hvis intet run er valgt
    if (!runIdStr) { setStatus("Select a run first.", "error"); return; }

    const runId = Number(runIdStr);

    try {
        // Hent hurtigste fra API
        const fastest = await fetchJson(`/runs/${runId}/fastest`);
        const box = document.getElementById("fastestBox");
        // Gør boksen synlig og sæt styling
        box.classList.remove("hidden");
        box.classList.remove("error", "success");
        box.classList.add("success");
        // Sæt tekst med hurtigste info
        box.textContent = `Hurtigste: ${fastest.skierName} (${fastest.nationName}) – ${fastest.timeSeconds} sek.`;
        // Vis success
        setStatus("Fastest loaded.", "success");
    } catch (e) {
        // Vis fejl
        setStatus(e.message, "error");
    }
}

// ==================== INIT ====================

window.addEventListener("load", async () => {
    // Opdater dropdowns ved start
    await refreshDropdowns();

    // Når man skifter konkurrence skal runs opdateres
    const compRunsSel = document.getElementById("competitionSelectForRuns");
    if (compRunsSel) {
        compRunsSel.addEventListener("change", async () => {
            try {
                // Genindlæs runs baseret på valgt konkurrence
                await loadRunsIntoDropdowns(compRunsSel.value);
            } catch (e) {
                // Vis fejl
                setStatus(e.message, "error");
            }
        });
    }

    // Når man vælger en løber til update forfyld felter
    const skierUpdateSel = document.getElementById("skierSelectForUpdate");
    if (skierUpdateSel) {
        skierUpdateSel.addEventListener("change", async () => {
            try {
                // Synk input felter med valgt løber
                await syncUpdateSkierInputs();
            } catch (e) {
                // Vis fejl
                setStatus(e.message, "error");
            }
        });
    }
});
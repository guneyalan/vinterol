// Dom helper der gør det kort at hente elementer med et id
const $ = id => document.getElementById(id);

// Status og fejlbeskeder som vises øverst i UI og skifter class efter success eller error
function setStatus(message = "", type = "success") {
    const box = $("statusBox");
    if (!box) return;
    box.classList.toggle("hidden", !message);
    box.textContent = message || "";
    box.classList.remove("error", "success");
    if (message) box.classList.add(type === "error" ? "error" : "success");
}

// Wrapper til async funktioner som fanger fejl og viser dem i statusfeltet så du slipper for gentagne try catch
const withStatus = fn => async (...args) => {
    try { return await fn(...args); }
    catch (e) { setStatus(e.message, "error"); }
};

// Api helper der laver fetch og forsøger at parse json og kaster en pæn fejlbesked hvis request fejler
async function api(url, options) {
    setStatus("");
    const res = await fetch(url, options);
    const hasBody = res.status !== 204;

    let body = null;
    if (hasBody) {
        try { body = await res.json(); }
        catch { body = null; }
    }

    if (!res.ok) throw new Error(body?.message || `Request failed (${res.status})`);
    return body;
}

// Crud request helpers der standardiserer post put og delete med json payload
const postJson = (url, data) => api(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
});

const putJson = (url, data) => api(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
});

const del = url => api(url, { method: "DELETE" });

// Select helpers der kan fylde eller nulstille dropdowns og forsøge at bevare nuværende valg
const fillSelect = (id, items, v, label) => {
    const sel = $(id);
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = items.map(it => `<option value="${String(v(it))}">${label(it)}</option>`).join("");
    if (current && [...sel.options].some(o => o.value === current)) sel.value = current;
};

const clearSelect = (id, text) => {
    const sel = $(id);
    if (sel) sel.innerHTML = `<option value="">${text}</option>`;
};

// Data loader der henter runs for valgt konkurrence og fylder to dropdowns til result og view
async function loadRunsIntoDropdowns(competitionId) {
    if (!competitionId) {
        clearSelect("runSelectForResult", "Select run");
        clearSelect("runSelectForView", "Select run");
        return;
    }

    const runs = await api(`/competitions/${competitionId}/runs`);

    if (!runs?.length) {
        clearSelect("runSelectForResult", "No runs for competition");
        clearSelect("runSelectForView", "No runs for competition");
        return;
    }

    const label = r => `Run ${r.runNumber} (id=${r.id})`;

    fillSelect("runSelectForResult", runs, r => r.id, label);
    fillSelect("runSelectForView", runs, r => r.id, label);
}

// Sync funktion der forfylder update felter med den valgte løbers eksisterende data
async function syncUpdateSkierInputs() {
    const skierSel = $("skierSelectForUpdate");
    const nameInput = $("skierUpdateNameInput");
    const nationSel = $("nationSelectForUpdate");
    if (!skierSel || !nameInput || !nationSel) return;

    const skierId = skierSel.value;
    if (!skierId) return;

    const skiers = await api("/skiers");
    const s = skiers.find(x => String(x.id) === String(skierId));
    if (!s) return;

    nameInput.value = s.name;
    nationSel.value = String(s.nationId);
}

// Central refresh der henter nations competitions og skiers og opdaterer alle dropdowns og afhængige felter
async function refreshDropdowns() {
    const [nations, competitions, skiers] = await Promise.all([
        api("/nations"),
        api("/competitions"),
        api("/skiers"),
    ]);

    fillSelect("nationSelectForSkier", nations, n => n.id, n => `${n.name} (id=${n.id})`);
    fillSelect("nationSelectForView", nations, n => n.id, n => `${n.name} (id=${n.id})`);
    fillSelect("nationSelectForUpdate", nations, n => n.id, n => `${n.name} (id=${n.id})`);

    fillSelect("competitionSelectForRun", competitions, c => c.id, c => `${c.name} (id=${c.id})`);
    fillSelect("competitionSelectForRuns", competitions, c => c.id, c => `${c.name} (id=${c.id})`);

    fillSelect("skierSelectForResult", skiers, s => s.id, s => `${s.name} (id=${s.id}, ${s.nationName})`);
    fillSelect("skierSelectForUpdate", skiers, s => s.id, s => `${s.name} (id=${s.id}, ${s.nationName})`);

    await loadRunsIntoDropdowns($("competitionSelectForRuns")?.value);
    await syncUpdateSkierInputs();
}

// Crud nation der opretter en nation og opdaterer ui efter success
const createNation = withStatus(async () => {
    const input = $("nationNameInput");
    await postJson("/nations", { name: input.value });
    input.value = "";
    setStatus("Nation created.", "success");
    await refreshDropdowns();
});

// Crud skier der opretter en løber med valgt nation og opdaterer ui efter success
const createSkier = withStatus(async () => {
    const input = $("skierNameInput");
    const nationId = Number($("nationSelectForSkier").value);
    await postJson("/skiers", { name: input.value, nationId });
    input.value = "";
    setStatus("Skier created.", "success");
    await refreshDropdowns();
});

// Crud skier der opdaterer den valgte løber og opdaterer ui efter success
const updateSkier = withStatus(async () => {
    const skierId = Number($("skierSelectForUpdate").value);
    const name = $("skierUpdateNameInput").value;
    const nationId = Number($("nationSelectForUpdate").value);
    await putJson(`/skiers/${skierId}`, { name, nationId });
    setStatus("Skier updated.", "success");
    await refreshDropdowns();
});

// Crud skier der sletter den valgte løber efter confirm og opdaterer ui efter success
const deleteSkier = withStatus(async () => {
    const skierId = Number($("skierSelectForUpdate").value);
    if (!skierId) return setStatus("Select a skier first.", "error");
    if (!confirm("Are you sure you want to delete this skier?")) return;

    await del(`/skiers/${skierId}`);
    setStatus("Skier deleted.", "success");
    await refreshDropdowns();
});

// Crud competition der opretter en konkurrence og opdaterer ui efter success
const createCompetition = withStatus(async () => {
    const input = $("competitionNameInput");
    const date = $("competitionDateInput").value || null;
    await postJson("/competitions", { name: input.value, date });
    input.value = "";
    setStatus("Competition created.", "success");
    await refreshDropdowns();
});

// Crud run der opretter et run på den valgte konkurrence og opdaterer ui efter success
const createRun = withStatus(async () => {
    const competitionId = Number($("competitionSelectForRun").value);
    const runNumberInput = $("runNumberInput");
    await postJson(`/competitions/${competitionId}/runs`, { runNumber: Number(runNumberInput.value) });
    runNumberInput.value = "";
    setStatus("Run created.", "success");
    await refreshDropdowns();
});

// Crud result der opretter et resultat for valgt run og løber og viser success når det er gemt
const createResult = withStatus(async () => {
    const runId = $("runSelectForResult").value;
    const skierId = $("skierSelectForResult").value;
    if (!runId) return setStatus("Select a run first.", "error");
    if (!skierId) return setStatus("Select a skier first.", "error");

    const timeInput = $("timeSecondsInput");

    await postJson("/results", {
        runId: Number(runId),
        skierId: Number(skierId),
        timeSeconds: Number(timeInput.value)
    });

    timeInput.value = "";
    setStatus("Result created.", "success");
});

// View competitions der henter konkurrencer og bygger en liste med knapper til leaderboard
const loadCompetitions = withStatus(async () => {
    const competitions = await api("/competitions");
    const list = $("competitionList");

    list.innerHTML = competitions.map(c =>
        `<li>${c.name} (${c.date})
      <button onclick="loadLeaderboard(${c.id})">Show Leaderboard</button>
     </li>`
    ).join("");

    setStatus("Competitions loaded.", "success");
    await refreshDropdowns();
});

// View leaderboard der henter leaderboard data og renderer rækker i tabellen
const loadLeaderboard = withStatus(async (id) => {
    const data = await api(`/competitions/${id}/leaderboard`);

    $("leaderboardBody").innerHTML = data.map(e => `
    <tr>
      <td>${e.position}</td>
      <td>${e.skierName}</td>
      <td>${e.nationName}</td>
      <td>${e.totalTimeSeconds}</td>
    </tr>
  `).join("");

    setStatus("Leaderboard loaded.", "success");
});

// View skiers der henter løbere for valgt nation og renderer dem som liste
const loadSkiersForSelectedNation = withStatus(async () => {
    const nationId = Number($("nationSelectForView").value);
    const data = await api(`/nations/${nationId}/skiers`);

    $("skierList").innerHTML = data.map(s => `<li>${s.name} (${s.nationName})</li>`).join("");

    setStatus("Skiers loaded.", "success");
});

// View results der henter resultater for valgt run og renderer dem i tabellen
const loadResultsForSelectedRun = withStatus(async () => {
    const runId = $("runSelectForView").value;
    if (!runId) return setStatus("Select a run first.", "error");

    const data = await api(`/runs/${Number(runId)}/results`);

    $("runResultsBody").innerHTML = data.map(r => `
    <tr>
      <td>${r.skierName}</td>
      <td>${r.nationName}</td>
      <td>${r.timeSeconds}</td>
    </tr>
  `).join("");

    setStatus("Run results loaded.", "success");
});

// View fastest der henter hurtigste løber for valgt run og viser det i en boks
const loadFastestForSelectedRun = withStatus(async () => {
    const runId = $("runSelectForView").value;
    if (!runId) return setStatus("Select a run first.", "error");

    const fastest = await api(`/runs/${Number(runId)}/fastest`);

    const box = $("fastestBox");
    if (box) {
        box.classList.remove("hidden", "error", "success");
        box.classList.add("success");
        box.textContent = `Hurtigste: ${fastest.skierName} (${fastest.nationName}) – ${fastest.timeSeconds} sek.`;
    }

    setStatus("Fastest loaded.", "success");
});

// Init og event listeners der kører ved load og reagerer på dropdown ændringer
window.addEventListener("load", withStatus(async () => {
    await refreshDropdowns();

    $("competitionSelectForRuns")?.addEventListener("change", withStatus(async (e) => {
        await loadRunsIntoDropdowns(e.target.value);
    }));

    $("skierSelectForUpdate")?.addEventListener("change", withStatus(syncUpdateSkierInputs));
}));

// Export til window så inline onclick i html stadig kan kalde funktionerne
Object.assign(window, {
    createNation, createSkier, updateSkier, deleteSkier,
    createCompetition, createRun, createResult,
    loadCompetitions, loadLeaderboard,
    loadSkiersForSelectedNation, loadResultsForSelectedRun, loadFastestForSelectedRun
});
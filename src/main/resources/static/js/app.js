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

    // prøv at læse JSON (både ved success og fejl)
    let body = null;
    try {
        body = await res.json();
    } catch (e) {
        body = null;
    }

    if (!res.ok) {
        // Vores backend sender typisk {error, message}
        const msg = body && body.message ? body.message : `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return body;
}

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

async function loadSkiers() {
    const nationId = document.getElementById("nationIdInput").value;
    if (!nationId) {
        setStatus("Indtast et Nation ID.", "error");
        return;
    }

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

async function loadRunResults() {
    const runId = document.getElementById("runIdInput").value;
    if (!runId) {
        setStatus("Indtast et Run ID.", "error");
        return;
    }

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
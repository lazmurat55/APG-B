[cite: 1] const scriptURL = "https://script.google.com/macros/s/AKfycbx55ShhJiujy6xj8lJZoDOoRh5wSpYpbPCbCNVoKnqR53gSUwsmKzSVv4ZXaihBQwwzVg/exec";

// --- DATEN ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];

// AUSSCHUSS CODES
[cite: 2] const purAusschussCodes = ["Schaumbild n.i.O.", "8-2-01 Temperatur zu niedrig", "8-2-02 Schaum haftet nicht am Bauteil", "8-2-03 Einlegefehler", "8-2-04 Schussabbruch", "8-2-05 CIM nicht voll ausgeschäumt", "8-2-06 Lippe gerissen", "8-2-07 CIM gerissen", "7-2-01 Nacharbeit am Bauteil", "Sonstige"];
[cite: 3] const imAusschussCodes = ["6-1-01 Anfahrschrott", "6-1-02 Materialumstellung", "6-1-03 CIM nicht voll", "6-1-04 CIM gerissen", "6-1-05 Überspritzungen", "Sonstige"];
[cite: 4] const comAusschussCodes = ["6-3-01 Anfahrschrott", "Sonstige"];

// STÖRUNG CODES
[cite: 5] const purStoerungCodes = ["4-2-01 Ungepl. Instandhaltung am Werkzeug", "4-2-02 Ungepl. Instandhaltung an der Maschine", "4-2-03 POLY / ISO Überdruck", "4-2-04 Mischkopf n.i.O.", "4-2-05 Fehler Lichtschranke", "4-2-06 Trennmittelpistole verstopft/defekt", "4-2-07 Formträger öffnet nicht/schließt nicht", "4-2-08 Reinigung des Werkzeugs", "4-2-09 Not Aus", "5-2-01 Keine Halbfertigteile bereitgestellt", "5-2-02 Keine Halbfertigteile von IM/CIM verfügbar", "5-2-03 Anlernen von Mitarbeiter", "5-2-04 Keine Produktion aufgrund von Wartezeit", "5-2-05 Mitarbeiter Umbesetzung", "5-2-06 Unterbesetzung", "5-2-07 Scanner / Drucker Probleme", "5-2-08 Kein Leergut", "5-2-09 Gasflasche wechseln", "5-2-10 Poly / Iso leer"];
const imStoerungCodes = ["3-01 Werkzeugwechsel", "3-02 Materialumstellung", "4-1-01 Ungepl. Instandhaltung am Werkzeug", "4-1-02 Ungepl. Instandhaltung an der Maschine", "4-1-03 Materialförderung gestört", "4-1-04 Probleme Dosiereinheit", "4-1-05 Probleme Schließeinheit", "4-1-06 Probleme Teileentnahme", "4-1-07 Probleme Werkzeugheizung", "4-1-08 Probleme Beflammprozess", "4-1-09 Entnahmeprobleme aufgrund vom Compound", "5-1-01 Materialmangel", "5-1-02 Anlernen von Mitarbeiter", "5-1-03 Keine Produktion aufgrund von Wartezeit", "5-1-04 Mitarbeiter Umbesetzung"];
const comStoerungCodes = ["3-01 Werkzeugwechsel", "3-02 Materialumstellung", "4-3-01 Lochplatte Messer schleifen", "4-3-02 Ungepl. Instandhaltung Maschine", "4-3-03 Gepl. Instandhaltung Maschine", "4-3-04 Silowechsel", "5-3-01 Materialmangel", "5-3-02 Anlernen von Mitarbeiter", "5-3-03 Keine Produktion aufgrund von Wartezeit", "5-3-04 Mitarbeiter Umbesetzung", "5-3-05 Feueralarm"];

[cite: 7] window.onload = () => {
    document.getElementById("datum").value = new Date().toISOString().split("T")[0];
[cite: 8] if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

[cite: 9] async function loginKontrol() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
[cite: 10] if(!user || !pass) return alert("Benutzername und Passwort eingeben!");
    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
[cite: 11] const result = await resp.text();
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
[cite: 12] location.reload();
        } else alert("Fehler: " + result);
    } catch (e) { alert("Verbindungsfehler!"); }
}

function validateAusschuss(box) {
    const totalInput = box.querySelector(".ausTotal");
    const warnung = box.querySelector(".ausWarnung");
[cite: 14] const mingeInputs = box.querySelectorAll(".aMenge");
    let soll = parseInt(totalInput.value) || 0;
    let ist = 0;
[cite: 15] mingeInputs.forEach(inp => ist += (parseInt(inp.value) || 0));
    if (ist !== soll && soll > 0) {
        warnung.innerText = `⚠️ Summe (${ist}) stimmt nicht mit Gesamt (${soll}) überein!`;
[cite: 16] warnung.style.display = "block";
        return false;
    } else {
        warnung.style.display = "none";
        return true;
    }
}

document.getElementById("anlage").addEventListener("change", (e) => {
    const val = e.target.value;
    document.getElementById("ftBox").style.display = val.startsWith("PUR") ? "block" : "none";
    document.getElementById("gesamtDauerBox").style.display = val === "COM" ? "block" : "none";
    document.getElementById("artikelContainer").innerHTML = "";
});

[cite: 18] document.getElementById("addWorkerBtn").addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "worker-box";
    div.innerHTML = `<button type="button" onclick="this.parentElement.remove()">X</button><select class="workerSelect">${workerList.map(w=>`<option value="${w}">${w}</option>`).join("")}</select>`;
    document.getElementById("workerContainer").appendChild(div);
});

[cite: 19] document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const anlageVal = document.getElementById("anlage").value;
    if(!anlageVal) return alert("Bitte zuerst Anlage wählen!");
    const isCOM = anlageVal === "COM";
    const div = document.createElement("div");
    div.className = "artikel-box";
    let html = `<button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>`;
    if(isCOM) {
        html += `
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap:10px;">
[cite: 20]                 <div><label>Artikel</label><input class="artBez" type="text" placeholder="z.B. BMW"></div>
                <div><label>Artikelnummer</label><input class="artNum" type="text" placeholder="12345"></div>
            </div>
            <label>Dauer inkl. Störung (Min)</label><input class="artDauer" type="number" value="0">`;
    } else {
        html += `<label>Artikel</label><input class="artBez" type="text">`;
    }
    html += `
        <div class="grid">
            <div><label>Gut (${isCOM ? 'kg' : 'stk'})</label><input class="gut" type="number"></div>
            <div><label>Ausschuss Gesamt (${isCOM ? 'kg' : 'stk'})</label><input class="ausTotal" type="number" value="0"></div>
        </div>
        <p class="ausWarnung" style="color:red; font-weight:bold; font-size:12px; margin-top:5px; display:none;"></p>
        <div class="aus-area"></div>
        <button type="button" class="add-btn" onclick="addAusRow(this, '${anlageVal}')">+ Ausschuss-Grund</button>
[cite: 22]         <div class="stoer-area" style="margin-top:10px;"></div>
        <button type="button" class="add-btn" style="background:#64748b" onclick="addStoerRow(this, '${anlageVal}')">+ Störung</button>`;
[cite: 23] div.innerHTML = html;
    document.getElementById("artikelContainer").appendChild(div);
    div.querySelector(".ausTotal").addEventListener("input", () => validateAusschuss(div));
});

function addAusRow(btn, anlage) {
    const box = btn.closest(".artikel-box");
[cite: 24] const area = btn.previousElementSibling;
    const row = document.createElement("div");
    row.className = "grid aus-row";
    let list = anlage.startsWith("PUR") ? [cite: 25] purAusschussCodes : (anlage.startsWith("IM") || anlage === "CIM1" ? imAusschussCodes : comAusschussCodes);
[cite: 26] row.innerHTML = `<select class="aCode" style="flex:2">${list.map(c=>`<option value="${c}">${c}</option>`).join("")}</select><input type="number" class="aMenge" placeholder="Menge" style="flex:1"><button type="button" onclick="this.parentElement.remove(); validateAusschuss(document.querySelector('.artikel-box'))">X</button>`;
    area.appendChild(row);
    row.querySelector(".aMenge").addEventListener("input", () => validateAusschuss(box));
}

function addStoerRow(btn, anlage) {
    const area = btn.previousElementSibling;
    const row = document.createElement("div");
    row.className = "grid stoer-row";
[cite: 28] if(anlage.startsWith("PUR")) {
        row.innerHTML = `<select class="sCode" style="flex:2">${purStoerungCodes.map(c=>`<option value="${c}">${c}</option>`).join("")}</select><input type="number" class="sMin" placeholder="Min" style="flex:1"><button type="button" onclick="this.parentElement.remove()">X</button>`;
    } else if(anlage === "COM") {
        row.innerHTML = `<select class="sCode" style="flex:2">${comStoerungCodes.map(c=>`<option value="${c}">${c}</option>`).join("")}</select><input type="number" class="sMin" placeholder="Min" style="flex:1"><button type="button" onclick="this.parentElement.remove()">X</button>`;
    } else {
        row.innerHTML = `<select class="sCode" style="flex:2">${imStoerungCodes.map(c=>`<option value="${c}">${c}</option>`).join("")}</select><input type="number" class="sMin" placeholder="Min" style="flex:1"><button type="button" onclick="this.parentElement.remove()">X</button>`;
    }
    area.appendChild(row);
}

[cite: 30] async function speichern() {
    const anlageVal = document.getElementById("anlage").value;
[cite: 31] let staff = [];
    document.querySelectorAll(".workerSelect").forEach(s => staff.push(s.value));
    const mitarbeiterStr = staff.join(", ");
    let report = "";
    let totalTime = 0;
[cite: 32] let allValid = true;
    document.querySelectorAll(".artikel-box").forEach(box => {
        if(!validateAusschuss(box)) allValid = false;
        const bez = box.querySelector(".artBez").value;
        const num = box.querySelector(".artNum") ? box.querySelector(".artNum").value : "";
        const g = box.querySelector(".gut").value || 0;
        const a = box.querySelector(".ausTotal").value || 0;
        const d = [cite: 33] box.querySelector(".artDauer") ? parseInt(box.querySelector(".artDauer").value) : 0;
        totalTime += d;
        report += `• ${bez} ${num ? '['+num+']' : ''} ${d ? '('+d+' Min)' : ''} | G:${g} A:${a}\n`;
        box.querySelectorAll(".aus-row").forEach(r => {
            const m = r.querySelector(".aMenge").value;
            if(m) report += `  └─ Aus: ${r.querySelector(".aCode").value} [cite: 34] (${m})\n`;
        });
        box.querySelectorAll(".stoer-row").forEach(r => {
            const min = r.querySelector(".sMin").value;
            const grund = [cite: 35] r.querySelector(".sCode") ? r.querySelector(".sCode").value : r.querySelector(".sGrund").value;
            if(min) report += `  └─ ⚠️ Störung: ${grund} (${min} Min)\n`;
        });
    });
[cite: 36] if(!allValid) {
        alert("❌ Fehler: Die Ausschuss-Summen stimmen nicht überein!");
        return;
    }
    if(anlageVal === "COM" && totalTime !== 480) {
        alert(`Achtung: Die Gesamtzeit beträgt ${totalTime} Min (Soll: 480 Min).`);
    }
    const data = { datum: document.getElementById("datum").value, schicht: document.getElementById("schicht").value, mitarbeiter: mitarbeiterStr, anlage: anlageVal, artikel: report };
[cite: 39] try {
        fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
[cite: 40] const waText = `📊 *SCHICHTBERICHT*\n🏭 *Anlage:* ${data.anlage}\n👥 *Team:* ${mitarbeiterStr}\n👤 *Sender:* ${localStorage.getItem("schichtb_user")}\n\n📦 *PRODUKTION:*\n${report}`;
        window.location.href = `https://wa.me/${document.getElementById("waEmpfaenger").value}?text=${encodeURIComponent(waText)}`;
    } catch (e) { alert("Fehler beim Senden!"); }
}

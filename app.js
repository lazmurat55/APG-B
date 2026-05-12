const scriptURL = "https://script.google.com/macros/s/AKfycbx55ShhJiujy6xj8lJZoDOoRh5wSpYpbPCbCNVoKnqR53gSUwsmKzSVv4ZXaihBQwwzVg/exec";

// --- DATEN ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];

const purAusschussCodes = ["C102 CIM nicht voll", "C103 CIM beschädigt", "P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "Sonstige"];
const imAusschussCodes = ["6-1-01 Anfahrschrott", "6-1-02 Materialumstellung", "6-1-03 CIM nicht voll", "6-1-04 CIM gerissen", "6-1-05 Überspritzungen", "Sonstige"];
const comAusschussCodes = ["6-3-01 Anfahrschrott", "Sonstige"];

const purStoerungCodes = ["4-2-01 Werkzeug", "4-2-02 Ungepl. Instandhaltung Maschine", "4-2-03 POLY / ISO Überdruck", "4-2-04 Mischkopf n.i.O.", "4-2-05 Fehler Lichtschranke", "4-2-06 Trennmittelpistole defekt", "4-2-07 Formträger Problem", "4-2-08 Reinigung", "4-2-09 Not Aus", "Sonstige"];
const imStoerungCodes = ["3-01 Werkzeugwechsel", "3-02 Materialumstellung", "4-1-01 Instandh. Werkzeug", "4-1-02 Instandh. Maschine", "Sonstige"];
const comStoerungCodes = ["3-01 Werkzeugwechsel", "3-02 Materialumstellung", "4-3-01 Lochplatte Messer", "4-3-02 Instandh. Maschine", "Sonstige"];

window.onload = () => {
    document.getElementById("datum").value = new Date().toISOString().split("T")[0];
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

// --- LOGIN KONTROLÜ (Hata Buradaysa Düzeldi) ---
async function loginKontrol() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    if(!user || !pass) return alert("Benutzername und Passwort eingeben!");
    
    const btn = event.target;
    btn.disabled = true;
    btn.innerText = "PRÜFUNG...";

    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        if (result.trim() === "active") {
            localStorage.setItem("schichtb_user", user);
            location.reload();
        } else {
            alert("Login fehlgeschlagen: " + result);
            btn.disabled = false;
            btn.innerText = "EINLOGGEN";
        }
    } catch (e) { 
        alert("Verbindungsfehler zum Server!"); 
        btn.disabled = false;
        btn.innerText = "EINLOGGEN";
    }
}

// --- MITARBEITER EKLEME ---
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "worker-box";
    div.innerHTML = `
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <select class="workerSelect" onchange="toggleWorkerInput(this)">
            ${workerList.map(w => `<option value="${w}">${w}</option>`).join("")}
        </select>
        <input type="text" class="customWorkerInput" placeholder="Name (Leiharbeiter/Gast)" style="display:none; margin-top:10px;">
    `;
    document.getElementById("workerContainer").appendChild(div);
});

function toggleWorkerInput(select) {
    const customInp = select.nextElementSibling;
    customInp.style.display = select.value === "Sonstige" ? "block" : "none";
}

function toggleCustomInput(select) {
    const customInp = select.nextElementSibling;
    customInp.style.display = select.value === "Sonstige" ? "block" : "none";
}

// --- ARTIKEL EKLEME ---
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const anlageVal = document.getElementById("anlage").value;
    if(!anlageVal) return alert("Bitte zuerst Anlage wählen!");
    const div = document.createElement("div");
    div.className = "artikel-box";
    
    div.innerHTML = `
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <label>Artikel</label>
        <input class="artBez" type="text">
        <div class="grid">
            <div><label>Gut</label><input class="gut" type="number"></div>
            <div><label>Ausschuss</label><input class="ausTotal" type="number" value="0"></div>
        </div>
        <p class="ausWarnung" style="color:red; display:none; font-weight:bold;"></p>
        <div class="aus-area"></div>
        <button type="button" class="add-btn" onclick="addAusRow(this, '${anlageVal}')">+ Ausschuss-Grund</button>
        <div class="stoer-area" style="margin-top:10px;"></div>
        <button type="button" class="add-btn" style="background:#64748b" onclick="addStoerRow(this, '${anlageVal}')">+ Störung</button>
    `;
    document.getElementById("artikelContainer").appendChild(div);
    div.querySelector(".ausTotal").addEventListener("input", () => validateAusschuss(div));
});

function addAusRow(btn, anlage) {
    const box = btn.closest(".artikel-box");
    const area = btn.previousElementSibling;
    const row = document.createElement("div");
    row.className = "aus-row";
    let list = anlage.startsWith("PUR") ? purAusschussCodes : (anlage === "COM" ? comAusschussCodes : imAusschussCodes);
    row.innerHTML = `
        <div style="flex:3; display:flex; flex-direction:column;">
            <select class="aCode" onchange="toggleCustomInput(this)">${list.map(c=>`<option value="${c}">${c}</option>`).join("")}</select>
            <input type="text" class="customInput" placeholder="Grund beschreiben..." style="display:none; margin-top:5px;">
        </div>
        <input type="number" class="aMenge" placeholder="Stk" style="flex:1; margin-left:10px; border:2px solid #cbd5e1; text-align:center;">
        <button type="button" class="row-delete-btn" style="margin-left:5px;" onclick="this.parentElement.remove(); validateAusschuss(document.querySelector('.artikel-box'))">X</button>
    `;
    area.appendChild(row);
    row.querySelector(".aMenge").addEventListener("input", () => validateAusschuss(box));
}

function addStoerRow(btn, anlage) {
    const area = btn.previousElementSibling;
    const row = document.createElement("div");
    row.className = "stoer-row";
    let list = anlage.startsWith("PUR") ? purStoerungCodes : (anlage === "COM" ? comStoerungCodes : imStoerungCodes);
    row.innerHTML = `
        <div style="flex:3; display:flex; flex-direction:column;">
            <select class="sCode" onchange="toggleCustomInput(this)">${list.map(c=>`<option value="${c}">${c}</option>`).join("")}</select>
            <input type="text" class="customInput" placeholder="Grund..." style="display:none; margin-top:5px;">
        </div>
        <input type="number" class="sMin" placeholder="Min" style="flex:1; margin-left:10px; border:2px solid #cbd5e1; text-align:center;">
        <button type="button" class="row-delete-btn" style="margin-left:5px;" onclick="this.parentElement.remove()">X</button>
    `;
    area.appendChild(row);
}

function validateAusschuss(box) {
    const totalInput = box.querySelector(".ausTotal");
    const warnung = box.querySelector(".ausWarnung");
    const mingeInputs = box.querySelectorAll(".aMenge");
    let soll = parseInt(totalInput.value) || 0;
    let ist = 0;
    mingeInputs.forEach(inp => ist += (parseInt(inp.value) || 0));
    if (ist !== soll) {
        warnung.innerText = `⚠️ Summe (${ist}) stimmt nicht mit Gesamt (${soll}) überein!`;
        warnung.style.display = "block";
        return false;
    } else {
        warnung.style.display = "none";
        return true;
    }
}

// --- SPEICHERN & SENDEN ---
async function speichern() {
    const anlageVal = document.getElementById("anlage").value;
    const schichtVal = document.getElementById("schicht").value;
    const datumVal = document.getElementById("datum").value;
    const sender = localStorage.getItem("schichtb_user") || "Unbekannt";
    
    let staff = [];
    document.querySelectorAll(".worker-box").forEach(wBox => {
        const sel = wBox.querySelector(".workerSelect").value;
        if(sel === "Sonstige") {
            const extraName = wBox.querySelector(".customWorkerInput").value;
            staff.push(extraName ? `(L) ${extraName}` : "Unbekannt");
        } else {
            staff.push(sel);
        }
    });
    const mitarbeiterStr = staff.join(", ");
    
    let report = "";
    document.querySelectorAll(".artikel-box").forEach(box => {
        const bez = box.querySelector(".artBez").value;
        const g = box.querySelector(".gut").value || 0;
        const a = box.querySelector(".ausTotal").value || 0;
        report += `• ${bez} | G:${g} A:${a}\n`;
        box.querySelectorAll(".aus-row").forEach(r => {
            let code = r.querySelector(".aCode").value;
            if(code === "Sonstige") code = "Sons: " + r.querySelector(".customInput").value;
            report += `  └─ Aus: ${code} (${r.querySelector(".aMenge").value})\n`;
        });
        box.querySelectorAll(".stoer-row").forEach(r => {
            let code = r.querySelector(".sCode").value;
            if(code === "Sonstige") code = "Sons: " + r.querySelector(".customInput").value;
            report += `  └─ ⚠️ Störung: ${code} (${r.querySelector(".sMin").value} Min)\n`;
        });
    });

    const waText = `📊 *SCHICHTBERICHT*\n📅 *Datum:* ${datumVal}\n⏱️ *Schicht:* ${schichtVal}\n🏭 *Anlage:* ${anlageVal}\n👷 *Mitarbeiter:* ${mitarbeiterStr}\n👤 *Sender:* ${sender}\n\n📦 *PRODUKTION:*\n${report}`;
    
    try {
        await fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify({ datum: datumVal, schicht: schichtVal, mitarbeiter: mitarbeiterStr, anlage: anlageVal, artikel: report }) });
        window.location.href = `whatsapp://send?phone=${document.getElementById("waEmpfaenger").value}&text=${encodeURIComponent(waText)}`;
    } catch (e) { alert("Senden fehlgeschlagen!"); }
}

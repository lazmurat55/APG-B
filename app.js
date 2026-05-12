const scriptURL = "https://script.google.com/macros/s/AKfycbx55ShhJiujy6xj8lJZoDOoRh5wSpYpbPCbCNVoKnqR53gSUwsmKzSVv4ZXaihBQwwzVg/exec";

// --- DATEN ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];

const purAusschussCodes = ["P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "C102 CIM nicht voll", "C103 CIM beschädigt", "Sonstige"];

const imAusschussCodes = ["Anfahrschrott", "Teile nicht voll", "Teile gerissen veya beschädigt", "Sonstige"];

const comAusschussCodes = ["C101 Anfahrschrott COM", "C102 Materialwechsel", "C103 Verschmutzung", "Sonstige"];

const purStoerungCodes = [
    "4-2-01 Werkzeug / Form", 
    "4-2-02 Instandhaltung (Maschine)", 
    "4-2-03 POLY / ISO Überdruck", 
    "4-2-04 Mischkopf / Düsen", 
    "4-2-05 Lichtschranke / Sicherheit", 
    "4-2-06 Roboter / Programmfehler", 
    "4-2-07 Heizung / Temperatur", 
    "4-2-08 Reinigung / Wartung", 
    "4-2-10 Materialwechsel (Farbe/Poly)", 
    "4-2-11 Not-Aus / Stromausfall", 
    "5-2-01 Logistik (Materialmangel)", 
    "5-2-02 Werkzeugwechsel (Umbau)", 
    "5-2-03 Versuchsaufbau (Test)", 
    "5-2-04 Schichtwechsel / Besprechung", 
    "5-2-05 IT-Probleme / Scanner", 
    "5-2-06 Unterbesetzung (Personal)", 
    "5-2-07 Qualitätsprobleme (Stopp)", 
    "Sonstige (Siehe Kommentar)"
];

window.onload = () => {
    document.getElementById("datum").value = new Date().toISOString().split("T")[0];
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

// --- LOGIN ---
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
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
            location.reload();
        } else {
            alert("Fehler: " + result);
            btn.disabled = false;
            btn.innerText = "EINLOGGEN";
        }
    } catch (e) { 
        alert("Verbindungsfehler!"); 
        btn.disabled = false;
        btn.innerText = "EINLOGGEN";
    }
}

// --- LIVE VALIDATION ---
function validateAusschuss(box) {
    const totalInput = box.querySelector(".ausTotal");
    const warnung = box.querySelector(".ausWarnung");
    const mingeInputs = box.querySelectorAll(".aMenge");
    
    let soll = parseInt(totalInput.value) || 0;
    let ist = 0;
    mingeInputs.forEach(inp => ist += (parseInt(inp.value) || 0));

    if (ist !== soll && soll > 0) {
        warnung.innerText = `⚠️ Summe (${ist}) stimmt nicht mit Gesamt (${soll}) überein!`;
        warnung.style.display = "block";
        return false;
    } else {
        warnung.style.display = "none";
        return true;
    }
}

// --- ANLAGE CHANGE ---
document.getElementById("anlage").addEventListener("change", (e) => {
    const val = e.target.value;
    document.getElementById("ftBox").style.display = val.startsWith("PUR") ? "block" : "none";
    document.getElementById("gesamtDauerBox").style.display = val === "COM" ? "block" : "none";
    document.getElementById("artikelContainer").innerHTML = "";
});

// --- MITARBEITER ---
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "worker-box";
    div.innerHTML = `<button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button><select class="workerSelect">${workerList.map(w=>`<option value="${w}">${w}</option>`).join("")}</select>`;
    document.getElementById("workerContainer").appendChild(div);
});

// --- ARTIKEL ---
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const anlageVal = document.getElementById("anlage").value;
    if(!anlageVal) return alert("Bitte zuerst Anlage wählen!");
    const isCOM = anlageVal === "COM";
    const div = document.createElement("div");
    div.className = "artikel-box";
    
    let html = `<button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>`;
    
    if(isCOM) {
        html += `
            <div class="grid">
                <div><label>Artikel</label><input class="artBez" type="text" placeholder="z.B. BMW"></div>
                <div><label>Artikelnummer</label><input class="artNum" type="text" placeholder="12345"></div>
            </div>
            <label>Dauer inkl. Störung (Min)</label><input class="artDauer" type="number" value="0">`;
    } else {
        html += `<label>Artikel</label><input class="artBez" type="text">`;
    }

    html += `
        <div class="grid">
            <div><label>Gut (${isCOM ? 'kg' : 'stk'})</label><input class="gut" type="number"></div>
            <div><label>Aus Gesamt (${isCOM ? 'kg' : 'stk'})</label><input class="ausTotal" type="number" value="0"></div>
        </div>
        <p class="ausWarnung" style="color:#ef4444; font-weight:bold; font-size:12px; margin-top:5px; display:none;"></p>
        <div class="aus-area"></div>
        <button type="button" class="add-btn" onclick="addAusRow(this, '${anlageVal}')">+ Ausschuss-Grund</button>
        <div class="stoer-area" style="margin-top:10px;"></div>
        <button type="button" class="add-btn" style="background:#64748b" onclick="addStoerRow(this, '${anlageVal}')">+ Störung</button>
    `;
    div.innerHTML = html;
    document.getElementById("artikelContainer").appendChild(div);

    div.querySelector(".ausTotal").addEventListener("input", () => validateAusschuss(div));
});

function addAusRow(btn, anlage) {
    const box = btn.closest(".artikel-box");
    const area = btn.previousElementSibling;
    const row = document.createElement("div");
    row.className = "grid aus-row";
    let list = anlage.startsWith("PUR") ? purAusschussCodes : (anlage.startsWith("IM") || anlage === "CIM1" ? imAusschussCodes : comAusschussCodes);
    row.innerHTML = `<select class="aCode" style="flex:2">${list.map(c=>`<option value="${c}">${c}</option>`).join("")}</select><input type="number" class="aMenge" placeholder="Menge" style="flex:1"><button type="button" class="delete-btn" onclick="this.parentElement.remove(); validateAusschuss(document.querySelector('.artikel-box'))">X</button>`;
    area.appendChild(row);

    row.querySelector(".aMenge").addEventListener("input", () => validateAusschuss(box));
}

function addStoerRow(btn, anlage) {
    const area = btn.previousElementSibling;
    const row = document.createElement("div");
    row.className = "grid stoer-row";
    if(anlage.startsWith("PUR")) {
        row.innerHTML = `<select class="sCode" style="flex:2">${purStoerungCodes.map(c=>`<option value="${c}">${c}</option>`).join("")}</select><input type="number" class="sMin" placeholder="Min" style="flex:1"><button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>`;
    } else {
        row.innerHTML = `<input type="text" class="sGrund" placeholder="Grund" style="flex:2"><input type="number" class="sMin" placeholder="Min" style="flex:1"><button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>`;
    }
    area.appendChild(row);
}

// --- SPEICHERN ---
async function speichern() {
    const anlageVal = document.getElementById("anlage").value;
    const btn = event.target;
    let staff = [];
    document.querySelectorAll(".workerSelect").forEach(s => staff.push(s.value));
    const mitarbeiterStr = staff.join(", ");
    
    let report = "";
    let totalTime = 0;
    let allValid = true;

    document.querySelectorAll(".artikel-box").forEach(box => {
        if(!validateAusschuss(box)) {
            allValid = false;
        }

        const bez = box.querySelector(".artBez").value;
        const num = box.querySelector(".artNum") ? box.querySelector(".artNum").value : "";
        const g = box.querySelector(".gut").value || 0;
        const a = box.querySelector(".ausTotal").value || 0;
        const d = box.querySelector(".artDauer") ? parseInt(box.querySelector(".artDauer").value) : 0;
        
        totalTime += d;
        report += `• ${bez} ${num ? '['+num+']' : ''} ${d ? '('+d+' Min)' : ''} | G:${g} A:${a}\n`;
        
        box.querySelectorAll(".aus-row").forEach(r => {
            const m = r.querySelector(".aMenge").value;
            if(m) report += `  └─ Aus: ${r.querySelector(".aCode").value} (${m})\n`;
        });
        
        box.querySelectorAll(".stoer-row").forEach(r => {
            const min = r.querySelector(".sMin").value;
            const grund = r.querySelector(".sCode") ? r.querySelector(".sCode").value : r.querySelector(".sGrund").value;
            if(min) report += `  └─ ⚠️ Störung: ${grund} (${min} Min)\n`;
        });
    });

    if(!allValid) {
        alert("❌ Fehler: Die Ausschuss-Summen stimmen nicht überein! Bitte korrigieren.");
        return;
    }

    if(anlageVal === "COM" && totalTime !== 480) {
        alert(`Achtung: Die Gesamtzeit beträgt ${totalTime} Min (Soll: 480 Min).`);
    }

    btn.disabled = true;
    btn.innerText = "SENDET...";

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: mitarbeiterStr,
        anlage: anlageVal,
        artikel: report
    };

    try {
        await fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
        const waText = `📊 *SCHICHTBERICHT*\n🏭 *Anlage:* ${data.anlage}\n👥 *Team:* ${mitarbeiterStr}\n👤 *Sender:* ${localStorage.getItem("schichtb_user")}\n\n📦 *PRODUKTION:*\n${report}`;
        window.location.href = `https://wa.me/${document.getElementById("waEmpfaenger").value}?text=${encodeURIComponent(waText)}`;
    } catch (e) { 
        alert("Fehler beim Senden!"); 
        btn.disabled = false;
        btn.innerText = "SPEICHERN & SENDEN";
    }
}

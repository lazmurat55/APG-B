const scriptURL = "https://script.google.com/macros/s/AKfycbx55ShhJiujy6xj8lJZoDOoRh5wSpYpbPCbCNVoKnqR53gSUwsmKzSVv4ZXaihBQwwzVg/exec";

// --- DATEN ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];

const purAusschussCodes = ["C102 CIM nicht voll", "C103 CIM beschädigt", "P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "Sonstige"];
const imAusschussCodes = ["6-1-01 Anfahrschrott", "6-1-02 Materialumstellung", "6-1-03 CIM nicht voll", "6-1-04 CIM gerissen", "6-1-05 Überspritzungen", "Sonstige"];
const comAusschussCodes = ["6-3-01 Anfahrschrott", "Sonstige"];

const purStoerungCodes = ["4-2-01 Werkzeug", "4-2-02 Ungepl. Instandhaltung Maschine", "4-2-03 POLY / ISO Überdruck", "4-2-04 Mischkopf n.i.O.", "4-2-05 Fehler Lichtschranke", "4-2-06 Trennmittelpistole defekt", "4-2-07 Formträger Problem", "4-2-08 Reinigung", "4-2-09 Not Aus", "5-2-01 Logistik Mangel", "5-2-02 IM/CIM Material fehlt", "5-2-03 Anlernen", "5-2-04 Wartezeit", "5-2-05 Umbesetzung", "5-2-06 Unterbesetzung", "5-2-07 Scanner / Drucker", "5-2-08 Leergut", "5-2-09 Gasflasche", "Sonstige"];
const imStoerungCodes = ["3-01 Werkzeugwechsel", "3-02 Materialumstellung", "4-1-01 Instandh. Werkzeug", "4-1-02 Instandh. Maschine", "4-1-03 Materialförderung", "4-1-04 Dosiereinheit", "4-1-05 Schließeinheit", "4-1-06 Teileentnahme", "4-1-07 Werkzeugheizung", "4-1-08 Beflammprozess", "4-1-09 Compound Problem", "5-1-01 Materialmangel", "5-1-02 Anlernen", "5-1-03 Wartezeit", "5-1-04 Umbesetzung", "Sonstige"];
const comStoerungCodes = ["3-01 Werkzeugwechsel", "3-02 Materialumstellung", "4-3-01 Lochplatte Messer schleifen", "4-3-02 Instandh. Maschine", "4-3-04 Silowechsel", "5-3-01 Materialmangel", "5-3-02 Anlernen", "5-3-03 Wartezeit", "5-3-04 Umbesetzung", "5-3-05 Feueralarm", "Sonstige"];

window.onload = () => {
    document.getElementById("datum").value = new Date().toISOString().split("T")[0];
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

async function loginKontrol() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    if(!user || !pass) return alert("Benutzername und Passwort eingeben!");
    const btn = event.target;
    btn.disabled = true; btn.innerText = "PRÜFUNG...";
    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        if (result.trim() === "active") {
            localStorage.setItem("schichtb_user", user);
            location.reload();
        } else {
            alert("Login fehlgeschlagen!");
            btn.disabled = false; btn.innerText = "EINLOGGEN";
        }
    } catch (e) { alert("Fehler!"); btn.disabled = false; btn.innerText = "EINLOGGEN"; }
}

document.getElementById("anlage").addEventListener("change", (e) => {
    const val = e.target.value;
    document.getElementById("ftBox").style.display = val.startsWith("PUR") ? "block" : "none";
    // Compound seçilince süre kutusunu göster (Sadece COM için değil, hepsi için opsiyonel yapılabilir ama COM'da zorunlu)
    document.getElementById("gesamtDauerBox").style.display = val === "COM" ? "block" : "none";
    document.getElementById("artikelContainer").innerHTML = "";
});

document.getElementById("addWorkerBtn").addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "worker-box";
    div.innerHTML = `<button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button><select class="workerSelect" onchange="toggleWorkerInput(this)">${workerList.map(w => `<option value="${w}">${w}</option>`).join("")}</select><input type="text" class="customWorkerInput" placeholder="Name (Leiharbeiter/Gast)" style="display:none; margin-top:10px;">`;
    document.getElementById("workerContainer").appendChild(div);
});

function toggleWorkerInput(select) {
    const customInp = select.nextElementSibling;
    customInp.style.display = select.value === "Sonstige" ? "block" : "none";
}

document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const anlageVal = document.getElementById("anlage").value;
    if(!anlageVal) return alert("Bitte zuerst Anlage wählen!");
    const div = document.createElement("div");
    div.className = "artikel-box";
    const isCOM = anlageVal === "COM";
    const einheit = isCOM ? "kg" : "Stk";
    
    let html = `<button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>`;
    if(isCOM) {
        html += `<div class="grid"><div><label>Artikel</label><input class="artBez" type="text"></div><div><label>Dauer inkl. Störung (Min)</label><input class="artDauer" type="number"></div></div>`;
    } else {
        html += `<label>Artikel</label><input class="artBez" type="text">`;
    }
    html += `<div class="grid"><div><label>Gut (${einheit})</label><input class="gut" type="number"></div><div><label>Ausschuss (${einheit})</label><input class="ausTotal" type="number" value="0"></div></div><p class="ausWarnung" style="color:red; display:none; font-weight:bold;"></p><div class="aus-area"></div><button type="button" class="add-btn" onclick="addAusRow(this, '${anlageVal}')">+ Ausschuss-Grund</button><div class="stoer-area" style="margin-top:10px;"></div><button type="button" class="add-btn" style="background:#64748b" onclick="addStoerRow(this, '${anlageVal}')">+ Störung</button>`;
    
    div.innerHTML = html;
    document.getElementById("artikelContainer").appendChild(div);
    div.querySelector(".ausTotal").addEventListener("input", () => validateAusschuss(div));
});

function addAusRow(btn, anlage) {
    const box = btn.closest(".artikel-box");
    const area = btn.previousElementSibling;
    const row = document.createElement("div");
    row.className = "aus-row";
    let list = anlage.startsWith("PUR") ? purAusschussCodes : (anlage === "COM" ? comAusschussCodes : imAusschussCodes);
    row.innerHTML = `<div style="flex:3; display:flex; flex-direction:column;"><select class="aCode" onchange="toggleCustomInput(this)">${list.map(c=>`<option value="${c}">${c}</option>`).join("")}</select><input type="text" class="customInput" placeholder="Grund..." style="display:none; margin-top:5px;"></div><input type="number" class="aMenge" placeholder="${anlage==='COM'?'kg':'Stk'}" style="flex:1; margin-left:10px; border:2px solid #cbd5e1; text-align:center;"><button type="button" class="row-delete-btn" style="margin-left:5px;" onclick="this.parentElement.remove(); validateAusschuss(document.querySelector('.artikel-box'))">X</button>`;
    area.appendChild(row);
    row.querySelector(".aMenge").addEventListener("input", () => validateAusschuss(box));
}

function addStoerRow(btn, anlage) {
    const area = btn.previousElementSibling;
    const row = document.createElement("div");
    row.className = "stoer-row";
    let list = anlage.startsWith("PUR") ? purStoerungCodes : (anlage === "COM" ? comStoerungCodes : imStoerungCodes);
    row.innerHTML = `<div style="flex:3; display:flex; flex-direction:column;"><select class="sCode" onchange="toggleCustomInput(this)">${list.map(c=>`<option value="${c}">${c}</option>`).join("")}</select><input type="text" class="customInput" placeholder="Grund..." style="display:none; margin-top:5px;"></div><input type="number" class="sMin" placeholder="Min" style="flex:1; margin-left:10px; border:2px solid #cbd5e1; text-align:center;"><button type="button" class="row-delete-btn" style="margin-left:5px;" onclick="this.parentElement.remove()">X</button>`;
    area.appendChild(row);
}

function toggleCustomInput(select) {
    const customInp = select.nextElementSibling;
    customInp.style.display = select.value === "Sonstige" ? "block" : "none";
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

async function speichern() {
    const anlageVal = document.getElementById("anlage").value;
    const schichtVal = document.getElementById("schicht").value;
    const datumVal = document.getElementById("datum").value;
    const targetDauer = parseInt(document.getElementById("gesamtDauerInput").value) || 480;
    const sender = localStorage.getItem("schichtb_user") || "Unbekannt";
    const btn = event.target;
    
    let staff = [];
    document.querySelectorAll(".worker-box").forEach(wBox => {
        const sel = wBox.querySelector(".workerSelect").value;
        if(sel === "Sonstige") staff.push("(L) " + wBox.querySelector(".customWorkerInput").value);
        else staff.push(sel);
    });
    
    let report = ""; 
    let allValid = true;
    let totalComTime = 0;

    document.querySelectorAll(".artikel-box").forEach(box => {
        if(!validateAusschuss(box)) allValid = false;
        const bez = box.querySelector(".artBez").value;
        const g = box.querySelector(".gut").value || 0;
        const a = box.querySelector(".ausTotal").value || 0;
        const d = box.querySelector(".artDauer") ? parseInt(box.querySelector(".artDauer").value) || 0 : 0;
        
        totalComTime += d;
        report += `• ${bez} ${d>0 ? '('+d+' Min)' : ''} | G:${g} A:${a}\n`;
        
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

    if(!allValid) return alert("❌ Fehler: Ausschuss-Summen prüfen!");
    
    // COMPOUND ZAMAN KONTROLÜ
    if(anlageVal === "COM" && totalComTime !== targetDauer) {
        return alert(`❌ Zeitfehler: Gesamte Dauer (${totalComTime} Min) muss ${targetDauer} Min entsprechen!`);
    }

    const waText = `📊 *SCHICHTBERICHT*\n📅 *Datum:* ${datumVal}\n⏱️ *Schicht:* ${schichtVal}\n🏭 *Anlage:* ${anlageVal}\n👷 *Mitarbeiter:* ${staff.join(", ")}\n👤 *Sender:* ${sender}\n\n📦 *PRODUKTION:*\n${report}`;
    
    btn.disabled = true; btn.innerText = "SENDET...";
    try {
        await fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify({ datum: datumVal, schicht: schichtVal, mitarbeiter: staff.join(", "), anlage: anlageVal, artikel: report }) });
        window.location.href = `whatsapp://send?phone=${document.getElementById("waEmpfaenger").value}&text=${encodeURIComponent(waText)}`;
    } catch (e) { alert("Fehler!"); btn.disabled = false; btn.innerText = "SPEICHERN & SENDEN"; }
}

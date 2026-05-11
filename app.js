const scriptURL = "https://script.google.com/macros/s/AKfycbzTluCCUn3xUHuncTLf4aiosQm3M7oZ2SVvqWSuoXLmCyDnHZVgX7o_bE4TIW9R2BtGqA/exec";

// --- VERI LISTELERI ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];

const purAusschussCodes = ["P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "C102 CIM nicht voll", "C103 CIM beschädigt", "Sonstige"];
const imAusschussCodes = ["Anfahrschrott", "Teile nicht voll", "Teile gerissen oder beschädigt", "Sonstige"];

const purStoerungCodes = [
    "4-2-01 Werkzeug", "4-2-02 Ungepl. Instandhaltung", "4-2-03 POLY /SO Überdrück", "4-2-04 Mischkopf n.i.o.", "4-2-05 Fehler Lichtschranke", "4-2-06 Trennmittelpistole verstopft",
    "4-2-07 Formträger Initiator n.i.o.", "4-2-08 Reinigung Werkzeug", "4-2-09 Not Aus", "5-2-01 Logistik (Keine HF)", "5-2-02 Keine HF von IM/CIM", "5-2-03 Anlernen Mitarbeiter",
    "5-2-04 Wartezeit (Einrichter)", "5-2-05 Mitarbeiter Umbesetzung", "5-2-06 Unterbesetzung", "5-2-07 Scanner/Drucker Probleme", "5-2-08 Kein Leergut", "5-2-09 Gasflasche wechseln", "Sonstige"
];

// --- LOGIN & START ---
function setiOtomatikTarih() {
    const d = document.getElementById("datum");
    if (d) d.value = new Date().toISOString().split("T")[0];
}

window.onload = () => {
    setiOtomatikTarih();
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

async function loginKontrol() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if(!user || !pass) return alert("Benutzername/Passwort fehlt!");
    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("mainForm").style.display = "block";
            setiOtomatikTarih();
        } else { alert("Zugriff verweigert!"); }
    } catch (e) { alert("Fehler!"); }
}

const anlage = document.getElementById("anlage");
const artikelContainer = document.getElementById("artikelContainer");

anlage.addEventListener("change", () => {
    document.getElementById("gesamtDauerBox").style.display = (anlage.value === "COM") ? "block" : "none";
    document.getElementById("ftBox").style.display = anlage.value.startsWith("PUR") ? "block" : "none";
    artikelContainer.innerHTML = ""; 
});

// MITARBEITER
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    let opt = workerList.map(w => `<option>${w}</option>`).join("");
    const box = document.createElement("div");
    box.classList.add("worker-box");
    box.innerHTML = `<button class="delete-btn" onclick="this.parentElement.remove()">X</button><label>Mitarbeiter</label><select class="workerSelect">${opt}</select><input class="extraWorker" type="text" placeholder="Name" style="display:none; margin-top:10px;">`;
    document.getElementById("workerContainer").appendChild(box);
    const sel = box.querySelector(".workerSelect");
    const ext = box.querySelector(".extraWorker");
    sel.addEventListener("change", () => ext.style.display = sel.value === "Sonstige" ? "block" : "none");
});

// ARTIKEL ADD
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const selectedAnlage = anlage.value;
    if(!selectedAnlage) return alert("Bitte zuerst Anlage wählen!");

    const isCOM = (selectedAnlage === "COM");
    const isPUR = selectedAnlage.startsWith("PUR");
    const isIM = (selectedAnlage.startsWith("IM") || selectedAnlage === "CIM1");
    const unit = isCOM ? "Kg" : "Stk";
    
    const box = document.createElement("div");
    box.classList.add("artikel-box");

    // ARTIKEL ZEILE (Artikelnummer nur bei COM)
    let artikelRowHtml = `<div><label>Artikel</label><input class="artikelBezeichnung" type="text"></div>`;
    if (isCOM) {
        artikelRowHtml += `<div><label>Artikelnummer</label><input class="artikelnummerInput" type="text"></div>`;
    }

    let html = `
        <button class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <div class="grid">${artikelRowHtml}</div>
        <div class="grid" style="margin-top:10px;">
            <div><label>Gutmenge (${unit})</label><input class="gutteileInput" type="number"></div>
            <div><label>Ausschuss Gesamt (${unit})</label><input class="ausschussInput" type="number"></div>
        </div>`;

    if (isPUR || isIM) {
        html += `
        <div class="ausschuss-detail-section" style="margin-top:10px; border-top:1px dashed #ccc; padding-top:10px;">
            <div class="ausschuss-container"></div>
            <button type="button" class="add-aus-btn" style="background:#8b949e; color:white; border:none; padding:5px; border-radius:5px; font-size:12px; cursor:pointer;">+ Ausschuss-Grund hinzufügen</button>
        </div>`;
    }

    if (isCOM) {
        html += `<div style="margin-top:10px;"><label>Dauer inkl. Fehler (Min)</label><input class="artikelDauer" type="number"></div>`;
    }

    html += `
        <div class="störung-section" style="margin-top:15px; border-top:1px solid #cbd5e1; padding-top:10px;">
            <div class="störung-container"></div>
            <button type="button" class="add-störung-btn" style="background:#64748b; color:white; border:none; padding:10px; border-radius:10px; cursor:pointer; width:auto;">+ Störung hinzufügen</button>
        </div>`;

    box.innerHTML = html;
    artikelContainer.appendChild(box);

    // Ausschuss Event
    if (isPUR || isIM) {
        box.querySelector(".add-aus-btn").addEventListener("click", () => {
            const currentList = isPUR ? purAusschussCodes : imAusschussCodes;
            const ausOpt = currentList.map(c => `<option>${c}</option>`).join("");
            const ausRow = document.createElement("div");
            ausRow.classList.add("grid"); ausRow.style.marginTop = "5px";
            ausRow.innerHTML = `<select class="ausSelect" style="flex:2">${ausOpt}</select><div style="display:flex; gap:5px; flex:1"><input type="number" class="ausMenge" placeholder="${unit}"><button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:red;">X</button></div>`;
            box.querySelector(".ausschuss-container").appendChild(ausRow);
        });
    }

    // Störung Event
    box.querySelector(".add-störung-btn").addEventListener("click", () => {
        const sRow = document.createElement("div");
        sRow.classList.add("grid"); sRow.style.marginTop = "10px";
        if (isPUR) {
            let sOpt = purStoerungCodes.map(c => `<option>${c}</option>`).join("");
            sRow.innerHTML = `<div style="flex:2"><select class="sSelect">${sOpt}</select><input type="text" class="sGrund" placeholder="Info" style="display:none; margin-top:5px;"></div><div style="display:flex; gap:5px; flex:1"><input type="number" class="sMin" placeholder="Min"><button onclick="this.parentElement.parentElement.remove()" style="background:#ef4444; width:35px; border:none; color:white; border-radius:8px;">X</button></div>`;
            const sel = sRow.querySelector(".sSelect");
            const inp = sRow.querySelector(".sGrund");
            sel.addEventListener("change", () => inp.style.display = sel.value === "Sonstige" ? "block" : "none");
        } else {
            sRow.innerHTML = `<input type="text" class="sGrund" placeholder="Störungsgrund" style="flex:2"><div style="display:flex; gap:5px; flex:1"><input type="number" class="sMin" placeholder="Min"><button onclick="this.parentElement.parentElement.remove()" style="background:#ef4444; width:35px; border:none; color:white; border-radius:8px;">X</button></div>`;
        }
        box.querySelector(".störung-container").appendChild(sRow);
    });
});

async function speichern() {
    const anlageVal = anlage.value;
    const artikels = document.querySelectorAll(".artikel-box");
    const currentUser = localStorage.getItem("schichtb_user") || "Unbekannt";
    if (!anlageVal || artikels.length === 0) return alert("Daten unvollständig!");

    let artikelText = "";
    let totalMinCOM = 0;

    artikels.forEach(box => {
        const bez = box.querySelector(".artikelBezeichnung").value;
        const numInput = box.querySelector(".artikelnummerInput");
        const num = numInput ? numInput.value : "";
        const gut = box.querySelector(".gutteileInput").value;
        const aus = box.querySelector(".ausschussInput").value || 0;
        
        artikelText += `• ${bez}${num ? " ("+num+")" : ""} | G: ${gut} | A: ${aus}\n`;

        box.querySelectorAll(".ausschuss-container .grid").forEach(row => {
            const c = row.querySelector(".ausSelect").value;
            const m = row.querySelector(".ausMenge").value;
            if(m) artikelText += `  └─ Fire: ${c} (${m})\n`;
        });

        box.querySelectorAll(".störung-container .grid").forEach(row => {
            let g = row.querySelector(".sSelect") ? (row.querySelector(".sSelect").value === "Sonstige" ? row.querySelector(".sGrund").value : row.querySelector(".sSelect").value) : row.querySelector(".sGrund").value;
            const m = parseInt(row.querySelector(".sMin").value || 0);
            if(g) artikelText += `  └─ ⚠️ Störung: ${g} (${m} Min)\n`;
        });

        if (anlageVal === "COM") {
            const ges = parseInt(box.querySelector(".artikelDauer").value || 0);
            totalMinCOM += ges;
            artikelText += `  ⏱️ Dauer: ${ges} Min\n`;
        }
    });

    if (anlageVal === "COM") {
        const soll = parseInt(document.getElementById("gesamtDauerInput").value || 480);
        if (totalMinCOM !== soll) confirm(`Warnung: ${totalMinCOM} Min vs ${soll} Min. Senden?`);
    }

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: [...document.querySelectorAll(".workerSelect")].map(s => s.value).join(", "),
        anlage: anlageVal,
        artikel: artikelText,
        sender: currentUser
    };

    fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
    window.location.href = `https://api.whatsapp.com/send?phone=${document.getElementById("waEmpfaenger").value}&text=${encodeURIComponent("📊 *SCHICHTBERICHT*\n👤 *Sender:* "+currentUser+"\n📅 *Datum:* "+data.datum+"\n🕒 *Schicht:* "+data.schicht+"\n🏭 *Anlage:* "+data.anlage+"\n\n📦 *PRODUKTION:*\n"+artikelText)}`;
}

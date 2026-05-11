const scriptURL = "https://script.google.com/macros/s/AKfycbzbtiAY8VPhcc5LjxO1eVEmu-iG3m_d0PP89iFQiVjI6u6JRwXqba36E8fp7fINExorHA/exec";

// --- DATEN ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];
const purAusschussCodes = ["P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "C102 CIM değil voll", "C103 CIM beschädigt", "Sonstige"];
const imAusschussCodes = ["Anfahrschrott", "Teile değil voll", "Teile gerissen veya beschädigt", "Sonstige"];
const comAusschussCodes = ["C101 Anfahrschrott COM", "C102 Materialwechsel", "C103 Verschmutzung", "Sonstige"];
const purStoerungCodes = ["4-2-01 Werkzeug", "4-2-02 Instandhaltung", "4-2-03 POLY Überdrück", "4-2-04 Mischkopf", "4-2-08 Reinigung", "5-2-01 Logistik", "5-2-06 Unterbesetzung", "Sonstige"];

window.onload = () => {
    document.getElementById("datum").value = new Date().toISOString().split("T")[0];
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

// LOGIN
async function loginKontrol() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    if(!user || !pass) return alert("Bitte Name und Passwort eingeben!");
    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
            location.reload();
        } else alert("Fehler: " + result);
    } catch (e) { alert("Verbindungsfehler!"); }
}

// ANLAGE CHANGE
document.getElementById("anlage").addEventListener("change", (e) => {
    const val = e.target.value;
    document.getElementById("ftBox").style.display = val.startsWith("PUR") ? "block" : "none";
    document.getElementById("gesamtDauerBox").style.display = val === "COM" ? "block" : "none";
    document.getElementById("artikelContainer").innerHTML = "";
});

// MITARBEITER
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "worker-box";
    div.innerHTML = `<button type="button" onclick="this.parentElement.remove()">X</button><select class="workerSelect">${workerList.map(w=>`<option>${w}</option>`).join("")}</select>`;
    document.getElementById("workerContainer").appendChild(div);
});

// ARTIKEL
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const anlageVal = document.getElementById("anlage").value;
    if(!anlageVal) return alert("Anlage wählen!");
    const isCOM = anlageVal === "COM";
    const div = document.createElement("div");
    div.className = "artikel-box";
    
    let html = `<button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>`;
    
    if(isCOM) {
        html += `
            <div class="grid">
                <div><label>Artikel</label><input class="artBez" type="text"></div>
                <div><label>Artikelnummer</label><input class="artNum" type="text"></div>
            </div>
            <label>Dauer inkl. Störung (Min)</label><input class="artDauer" type="number" value="0">`;
    } else {
        html += `<label>Artikel</label><input class="artBez" type="text">`;
    }

    html += `
        <div class="grid">
            <div><label>Gut (${isCOM ? 'kg' : 'stk'})</label><input class="gut" type="number"></div>
            <div><label>Aus Gesamt (${isCOM ? 'kg' : 'stk'})</label><input class="ausTotal" type="number"></div>
        </div>
        <div class="aus-area"></div>
        <button type="button" class="add-btn" onclick="addAusRow(this, '${anlageVal}')">+ Ausschuss-Grund</button>
        <div class="stoer-area" style="margin-top:10px;"></div>
        <button type="button" class="add-btn" style="background:#64748b" onclick="addStoerRow(this, '${anlageVal}')">+ Störung</button>
    `;
    div.innerHTML = html;
    document.getElementById("artikelContainer").appendChild(div);
});

function addAusRow(btn, anlage) {
    const area = btn.previousElementSibling;
    const row = document.createElement("div");
    row.className = "grid aus-row";
    let list = anlage.startsWith("PUR") ? purAusschussCodes : (anlage.startsWith("IM") || anlage === "CIM1" ? imAusschussCodes : comAusschussCodes);
    row.innerHTML = `<select class="aCode">${list.map(c=>`<option>${c}</option>`).join("")}</select><input type="number" class="aMenge" placeholder="Menge"><button type="button" onclick="this.parentElement.remove()">X</button>`;
    area.appendChild(row);
}

function addStoerRow(btn, anlage) {
    const area = btn.previousElementSibling;
    const row = document.createElement("div");
    row.className = "grid stoer-row";
    if(anlage.startsWith("PUR")) {
        row.innerHTML = `<select class="sCode">${purStoerungCodes.map(c=>`<option>${c}</option>`).join("")}</select><input type="number" class="sMin" placeholder="Min"><button type="button" onclick="this.parentElement.remove()">X</button>`;
    } else {
        row.innerHTML = `<input type="text" class="sGrund" placeholder="Grund"><input type="number" class="sMin" placeholder="Min"><button type="button" onclick="this.parentElement.remove()">X</button>`;
    }
    area.appendChild(row);
}

// SPEICHERN
async function speichern() {
    const anlageVal = document.getElementById("anlage").value;
    let staff = [];
    document.querySelectorAll(".workerSelect").forEach(s => staff.push(s.value));
    
    let report = "";
    let totalMin = 0;

    document.querySelectorAll(".artikel-box").forEach(box => {
        const bez = box.querySelector(".artBez").value;
        const num = box.querySelector(".artNum") ? box.querySelector(".artNum").value : "";
        const g = box.querySelector(".gut").value || 0;
        const a = box.querySelector(".ausTotal").value || 0;
        const d = box.querySelector(".artDauer") ? parseInt(box.querySelector(".artDauer").value) : 0;
        
        totalMin += d;
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

    // Compound Zaman Kontrolü
    if(anlageVal === "COM" && totalMin !== 480) {
        alert(`Achtung: Die Gesamtzeit beträgt ${totalMin} Min. (Soll: 480 Min). Der Bericht wird trotzdem gesendet.`);
    }

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: staff.join(", "),
        anlage: anlageVal,
        artikel: report
    };

    fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
    
    const waText = `📊 *SCHICHTBERICHT*\n🏭 *Anlage:* ${data.anlage}\n👥 *Team:* ${data.mitarbeiter}\n👤 *Sender:* ${localStorage.getItem("schichtb_user")}\n\n📦 *PRODUKTION:*\n${report}`;
    window.location.href = `https://wa.me/${document.getElementById("waEmpfaenger").value}?text=${encodeURIComponent(waText)}`;
}

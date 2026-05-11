// --- 1. SCRIPT URL (DEIN LINK) ---
const scriptURL = "https://script.google.com/macros/s/AKfycbzbtiAY8VPhcc5LjxO1eVEmu-iG3m_d0PP89iFQiVjI6u6JRwXqba36E8fp7fINExorHA/exec";

// --- 2. DATENLISTEN ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];
const purAusschussCodes = ["P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "C102 CIM nicht voll", "C103 CIM beschädigt", "Sonstige"];
const imAusschussCodes = ["Anfahrschrott", "Teile nicht voll", "Teile gerissen oder beschädigt", "Sonstige"];
const comAusschussCodes = ["Anfahrschrott", "Sonstiger"];
const purStoerungCodes = ["4-2-01 Werkzeug", "4-2-02 Instandhaltung", "4-2-03 POLY /SO Überdrück", "4-2-04 Mischkopf", "4-2-05 Lichtschranke", "4-2-09 Not Aus", "5-2-01 Logistik", "Sonstige"];

// --- 3. LOGIN FUNKTION (Vollständig auf Deutsch) ---
async function loginKontrol() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    if(!user || !pass) {
        alert("Bitte Benutzername und Passwort eingeben!");
        return;
    }

    try {
        // Google Script anrufen
        const response = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await response.text();

        if (result === "active") {
            // Erfolg
            localStorage.setItem("schichtb_user", user);
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("mainForm").style.display = "block";
            location.reload(); // Seite neu laden um Initialisierung abzuschließen
        } else if (result === "Nutzer passiv") {
            alert("Achtung: Dieser Nutzer ist auf PASSIV gesetzt!");
        } else {
            alert("Zugriff verweigert! Benutzername oder Passwort ist falsch.");
        }
    } catch (error) {
        console.error("Login Fehler:", error);
        alert("Verbindungsfehler zum Server!");
    }
}

// --- 4. INITIALISIERUNG BEIM LADEN ---
window.onload = () => {
    if(document.getElementById("datum")) {
        document.getElementById("datum").value = new Date().toISOString().split("T")[0];
    }
    
    // Prüfen ob bereits eingeloggt
    if (localStorage.getItem("schichtb_user")) {
        if(document.getElementById("loginBox")) document.getElementById("loginBox").style.display = "none";
        if(document.getElementById("mainForm")) document.getElementById("mainForm").style.display = "block";
    }
};

// --- 5. ARTIKEL-STEUERUNG (Vollständig auf Deutsch) ---
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    const container = document.getElementById("workerContainer");
    const div = document.createElement("div");
    div.className = "worker-box";
    let opt = workerList.map(w => `<option value="${w}">${w}</option>`).join("");
    div.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()">X</button>
        <label>Mitarbeiter</label>
        <select class="workerSelect">${opt}</select>
    `;
    container.appendChild(div);
});

document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const anlageVal = document.getElementById("anlage").value;
    if(!anlageVal) return alert("Bitte zuerst Anlage wählen!");

    const container = document.getElementById("artikelContainer");
    const div = document.createElement("div");
    div.className = "artikel-box";
    
    div.innerHTML = `
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <label>Artikelbezeichnung</label><input class="artBez" type="text">
        <div class="grid">
            <div><label>Gutmenge</label><input class="gut" type="number"></div>
            <div><label>Ausschuss Gesamt</label><input class="aus" type="number"></div>
        </div>
        <div class="ausschuss-detail-area"></div>
        <button type="button" class="add-aus-btn" style="background:#8b949e; font-size:11px; margin-top:5px;">+ Ausschuss-Code</button>
        <div class="stoerung-detail-area" style="margin-top:10px; border-top:1px solid #ddd; padding-top:5px;"></div>
        <button type="button" class="add-stoer-btn" style="background:#64748b; font-size:11px;">+ Störung hinzufügen</button>
    `;
    container.appendChild(div);

    div.querySelector(".add-aus-btn").addEventListener("click", () => {
        const area = div.querySelector(".ausschuss-detail-area");
        const row = document.createElement("div");
        row.className = "grid aus-row";
        let liste = anlageVal.startsWith("PUR") ? purAusschussCodes : (anlageVal.startsWith("IM") || anlageVal === "CIM1" ? imAusschussCodes : comAusschussCodes);
        row.innerHTML = `
            <select class="ausCode">${liste.map(c => `<option value="${c}">${c}</option>`).join("")}</select>
            <input type="number" class="ausMenge" placeholder="Menge">
            <button type="button" onclick="this.parentElement.remove()">X</button>
        `;
        area.appendChild(row);
    });

    div.querySelector(".add-stoer-btn").addEventListener("click", () => {
        const area = div.querySelector(".stoerung-detail-area");
        const row = document.createElement("div");
        row.className = "grid stoer-row";
        if(anlageVal.startsWith("PUR")) {
            row.innerHTML = `
                <select class="stoerCode">${purStoerungCodes.map(c => `<option value="${c}">${c}</option>`).join("")}</select>
                <input type="number" class="stoerMin" placeholder="Min">
                <button type="button" onclick="this.parentElement.remove()">X</button>
            `;
        } else {
            row.innerHTML = `
                <input type="text" class="stoerGrund" placeholder="Grund">
                <input type="number" class="stoerMin" placeholder="Min">
                <button type="button" onclick="this.parentElement.remove()">X</button>
            `;
        }
        area.appendChild(row);
    });
});

// --- 6. SPEICHERN FUNKTION ---
async function speichern() {
    let workerArray = [];
    let selects = document.getElementsByClassName("workerSelect");
    for (let i = 0; i < selects.length; i++) { workerArray.push(selects[i].value); }
    let mitarbeiterListe = workerArray.join(", ");

    let produktionInfo = "";
    let boxes = document.getElementsByClassName("artikel-box");
    for (let i = 0; i < boxes.length; i++) {
        let name = boxes[i].querySelector(".artBez").value;
        let g = boxes[i].querySelector(".gut").value || 0;
        let a = boxes[i].querySelector(".aus").value || 0;
        produktionInfo += `• ${name} (G:${g} A:${a})\n`;

        let ausRows = boxes[i].querySelectorAll(".aus-row");
        ausRows.forEach(r => {
            let c = r.querySelector(".ausCode").value;
            let m = r.querySelector(".ausMenge").value;
            if(m) produktionInfo += `  └─ Ausschuss: ${c} (${m})\n`;
        });

        let stoerRows = boxes[i].querySelectorAll(".stoer-row");
        stoerRows.forEach(r => {
            let grund = r.querySelector(".stoerCode") ? r.querySelector(".stoerCode").value : r.querySelector(".stoerGrund").value;
            let min = r.querySelector(".stoerMin").value;
            if(min) produktionInfo += `  └─ ⚠️ Störung: ${grund} (${min} Min)\n`;
        });
    }

    const reportData = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: mitarbeiterListe,
        anlage: document.getElementById("anlage").value,
        artikel: produktionInfo
    };

    try {
        fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(reportData) });
        const waText = `📊 *SCHICHTBERICHT*\n👤 *Sender:* ${localStorage.getItem("schichtb_user")}\n👥 *Mitarbeiter:* ${mitarbeiterListe}\n🏭 *Anlage:* ${reportData.anlage}\n\n📦 *PRODUKTION:*\n${produktionInfo}`;
        window.location.href = `https://wa.me/${document.getElementById("waEmpfaenger").value}?text=${encodeURIComponent(waText)}`;
    } catch (e) { alert("Fehler beim Senden!"); }
}

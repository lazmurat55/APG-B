// Deine aktuelle Script URL
const scriptURL = "https://script.google.com/macros/s/AKfycbzbtiAY8VPhcc5LjxO1eVEmu-iG3m_d0PP89iFQiVjI6u6JRwXqba36E8fp7fINExorHA/exec";

// --- DATENLISTEN ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];
const purAusschussCodes = ["P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "C102 CIM nicht voll", "C103 CIM beschädigt", "Sonstige"];
const imAusschussCodes = ["Anfahrschrott", "Teile nicht voll", "Teile gerissen oder beschädigt", "Sonstige"];
const comAusschussCodes = ["Anfahrschrott", "Sonstiger"];

// --- INITIALISIERUNG ---
window.onload = () => {
    if(document.getElementById("datum")) document.getElementById("datum").value = new Date().toISOString().split("T")[0];
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

// --- LOGIN ---
async function loginKontrol() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    if(!user || !pass) return alert("Bitte Name und Passwort eingeben!");

    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("mainForm").style.display = "block";
        } else {
            alert("Login Fehler: " + result);
        }
    } catch (e) { alert("Netzwerkfehler!"); }
}

// --- MITARBEITER HINZUFÜGEN ---
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

// --- ARTIKEL HINZUFÜGEN ---
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const anlageVal = document.getElementById("anlage").value;
    if(!anlageVal) return alert("Bitte Anlage wählen!");

    const container = document.getElementById("artikelContainer");
    const div = document.createElement("div");
    div.className = "artikel-box";
    div.innerHTML = `
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <label>Artikel</label><input class="artBez" type="text">
        <div class="grid">
            <div><label>Gut</label><input class="gut" type="number"></div>
            <div><label>Aus</label><input class="ausTotal" type="number"></div>
        </div>
        <div class="aus-area"></div>
        <button type="button" class="add-aus-btn" style="background:#8b949e; font-size:11px; margin-top:5px;">+ Ausschuss-Code</button>
    `;
    container.appendChild(div);

    div.querySelector(".add-aus-btn").addEventListener("click", () => {
        let liste = anlageVal.startsWith("PUR") ? purAusschussCodes : (anlageVal.startsWith("IM") || anlageVal === "CIM1" ? imAusschussCodes : comAusschussCodes);
        const area = div.querySelector(".aus-area");
        const row = document.createElement("div");
        row.className = "grid aus-row";
        row.innerHTML = `
            <select class="ausCode" style="flex:2">${liste.map(c => `<option value="${c}">${c}</option>`).join("")}</select>
            <input type="number" class="ausMenge" placeholder="Menge" style="flex:1">
            <button type="button" onclick="this.parentElement.remove()">X</button>
        `;
        area.appendChild(row);
    });
});

// --- SPEICHERN ---
async function speichern() {
    let staff = [];
    document.querySelectorAll(".workerSelect").forEach(s => staff.push(s.value));
    
    let prodText = "";
    document.querySelectorAll(".artikel-box").forEach(box => {
        const bez = box.querySelector(".artBez").value;
        const g = box.querySelector(".gut").value || 0;
        const a = box.querySelector(".ausTotal").value || 0;
        prodText += `• ${bez} | G:${g} A:${a}\n`;
        
        box.querySelectorAll(".aus-row").forEach(row => {
            const code = row.querySelector(".ausCode").value;
            const menge = row.querySelector(".ausMenge").value;
            if(menge) prodText += `  └─ ${code}: ${menge}\n`;
        });
    });

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: staff.join(", "),
        anlage: document.getElementById("anlage").value,
        artikel: prodText
    };

    try {
        fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
        const waText = `📊 *SCHICHTBERICHT*\n🏭 *Anlage:* ${data.anlage}\n👤 *Ekip:* ${data.mitarbeiter}\n\n📦 *PRODUKTION:*\n${prodText}`;
        window.location.href = `https://wa.me/${document.getElementById("waEmpfaenger").value}?text=${encodeURIComponent(waText)}`;
    } catch (e) { alert("Hata!"); }
}

// --- ANLAGE SELECTION ---
document.getElementById("anlage").addEventListener("change", (e) => {
    document.getElementById("ftBox").style.display = e.target.value.startsWith("PUR") ? "block" : "none";
    document.getElementById("gesamtDauerBox").style.display = e.target.value === "COM" ? "block" : "none";
    document.getElementById("artikelContainer").innerHTML = "";
});

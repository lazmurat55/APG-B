const scriptURL = "https://script.google.com/macros/s/AKfycbz7MaRyed4Owfjlbf0OVZ2NRwUX8Bwn7dq712m3lTsJtTeJGw_YOECSc0kMU-VNJgWxbg/exec";

// --- LİSTELER ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];
const purAusschussCodes = ["P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "C102 CIM nicht voll", "C103 CIM beschädigt", "Sonstige"];
const imAusschussCodes = ["Anfahrschrott", "Teile nicht voll", "Teile gerissen oder beschädigt", "Sonstige"];
const comAusschussCodes = ["Anfahrschrott", "Sonstiger"];

// --- BAŞLATMA ---
window.onload = () => {
    if (document.getElementById("datum")) {
        document.getElementById("datum").value = new Date().toISOString().split("T")[0];
    }
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

// --- LOGIN ---
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
        } else { alert("Fehler: " + result); }
    } catch (e) { alert("Verbindungsfehler!"); }
}

// --- MAKİNE SEÇİMİ ---
const anlage = document.getElementById("anlage");
const artikelContainer = document.getElementById("artikelContainer");

if (anlage) {
    anlage.addEventListener("change", () => {
        const gdBox = document.getElementById("gesamtDauerBox");
        const fBox = document.getElementById("ftBox");
        if (gdBox) gdBox.style.display = (anlage.value === "COM") ? "block" : "none";
        if (fBox) fBox.style.display = anlage.value.startsWith("PUR") ? "block" : "none";
        artikelContainer.innerHTML = ""; 
    });
}

// --- PERSONEL EKLE ---
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    let opt = workerList.map(w => `<option>${w}</option>`).join("");
    const box = document.createElement("div");
    box.className = "worker-box";
    box.innerHTML = `<button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button><label>Mitarbeiter</label><select class="workerSelect">${opt}</select>`;
    document.getElementById("workerContainer").appendChild(box);
});

// --- ARTIKEL EKLE ---
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const selAnlage = anlage.value;
    if(!selAnlage) return alert("Anlage wählen!");
    const isCOM = (selAnlage === "COM");
    const isPUR = selAnlage.startsWith("PUR");
    const isIM = (selAnlage.startsWith("IM") || selAnlage === "CIM1");
    
    const box = document.createElement("div");
    box.className = "artikel-box";
    let artHtml = `<div><label>Artikel</label><input class="artikelBezeichnung" type="text"></div>`;
    if (isCOM) { artHtml += `<div><label>Artikelnummer</label><input class="artikelnummerInput" type="text"></div>`; }

    box.innerHTML = `
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <div class="grid">${artHtml}</div>
        <div class="grid" style="margin-top:10px;">
            <div><label>Gutmenge</label><input class="gutteileInput" type="number"></div>
            <div><label>Ausschuss Gesamt</label><input class="ausschussInput" type="number"></div>
        </div>
        <div class="ausschuss-container"></div>
        <button type="button" class="add-aus-btn" style="margin-top:10px;">+ Ausschuss-Grund</button>
    `;
    artikelContainer.appendChild(box);

    box.querySelector(".add-aus-btn").addEventListener("click", () => {
        let list = isPUR ? purAusschussCodes : (isIM ? imAusschussCodes : comAusschussCodes);
        const ausRow = document.createElement("div");
        ausRow.className = "grid";
        ausRow.style.marginTop = "5px";
        ausRow.innerHTML = `<select class="ausSelect">${list.map(c=>`<option>${c}</option>`).join("")}</select><input type="number" class="ausMenge" placeholder="Menge"><button type="button" onclick="this.parentElement.remove()">X</button>`;
        box.querySelector(".ausschuss-container").appendChild(ausRow);
    });
});

// --- KAYDET VE GÖNDER ---
async function speichern() {
    const artikels = document.querySelectorAll(".artikel-box");
    const waEmpfaengerElement = document.getElementById("waEmpfaenger");
    const schichtElement = document.getElementById("schicht");

    if (artikels.length === 0) return alert("Bitte Artikel hinzufügen!");
    if (!waEmpfaengerElement) return alert("WhatsApp Empfänger (ID: waEmpfaenger) fehlt im HTML!");

    let artikelText = "";
    artikels.forEach(box => {
        const bez = box.querySelector(".artikelBezeichnung").value;
        const gut = box.querySelector(".gutteileInput").value;
        const aus = box.querySelector(".ausschussInput").value || 0;
        artikelText += `• ${bez} | G:${gut} A:${aus}\n`;
        
        box.querySelectorAll(".ausSelect").forEach((sel, i) => {
            const m = box.querySelectorAll(".ausMenge")[i].value;
            if(m) artikelText += `  └─ ${sel.value}: ${m}\n`;
        });
    });

    const data = {
        datum: document.getElementById("datum").value,
        schicht: schichtElement ? schichtElement.value : "N/A",
        mitarbeiter: [...document.querySelectorAll(".workerSelect")].map(s => s.value).join(", "),
        anlage: anlage.value,
        artikel: artikelText
    };

    try {
        // Google Tabloya Gönder (Arka planda)
        fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
        
        // WhatsApp Hazırla
        const waText = `📊 *SCHICHTBERICHT*\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n🏭 *Anlage:* ${data.anlage}\n👤 *Team:* ${data.mitarbeiter}\n\n📦 *PRODUKTION:*\n${artikelText}`;
        const waNumber = waEmpfaengerElement.value;
        
        // WhatsApp Yönlendirme (En sağlam metod)
        const waURL = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
        
        alert("Daten werden an Excel gesendet. WhatsApp wird nun geöffnet...");
        window.location.assign(waURL); 

    } catch (e) {
        alert("Hata: " + e.message);
    }
}

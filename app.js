const scriptURL = "https://script.google.com/macros/s/AKfycbzTluCCUn3xUHuncTLf4aiosQm3M7oZ2SVvqWSuoXLmCyDnHZVgX7o_bE4TIW9R2BtGqA/exec";

// --- OTOMATİK TARİH VE LOGIN SİSTEMİ ---
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
    if(!user || !pass) return alert("Bitte Benutzernamen und Passwort eingeben!");
    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("mainForm").style.display = "block";
            setiOtomatikTarih();
        } else { alert("Zugriff verweigert! Falsche Daten."); }
    } catch (e) { alert("Anmeldefehler!"); }
}

const anlage = document.getElementById("anlage");
const ftBox = document.getElementById("ftBox");
const gesamtDauerBox = document.getElementById("gesamtDauerBox");
const artikelContainer = document.getElementById("artikelContainer");

// MAKİNE SEÇİMİNE GÖRE EKRAN AYARI
anlage.addEventListener("change", function(){
    const val = anlage.value;
    ftBox.style.display = val.startsWith("PUR") ? "block" : "none";
    if(gesamtDauerBox) gesamtDauerBox.style.display = (val === "COM") ? "block" : "none";
    artikelContainer.innerHTML = ""; // Makine değişince temizle
});

// MITARBEITER LİSTESİ VE EKLEME
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba N.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];

document.getElementById("addWorkerBtn").addEventListener("click", function(){
    let opt = workerList.map(w => `<option>${w}</option>`).join("");
    const box = document.createElement("div");
    box.classList.add("worker-box");
    box.innerHTML = `<button class="delete-btn" onclick="this.parentElement.remove()">X</button><label>Mitarbeiter</label><select class="workerSelect">${opt}</select><input class="extraWorker" type="text" placeholder="Name" style="display:none; margin-top:10px;">`;
    document.getElementById("workerContainer").appendChild(box);
    const sel = box.querySelector(".workerSelect");
    const ext = box.querySelector(".extraWorker");
    sel.addEventListener("change", () => ext.style.display = sel.value === "Sonstige" ? "block" : "none");
});

// ARTIKEL EKLEME (COM VE DİĞERLERİ AYRIMI)
document.getElementById("addArtikelBtn").addEventListener("click", function(){
    const selectedAnlage = anlage.value;
    if(!selectedAnlage) return alert("Bitte zuerst Anlage wählen!");

    const isCOM = (selectedAnlage === "COM");
    const unit = isCOM ? "Kg" : "Stk";
    const box = document.createElement("div");
    box.classList.add("artikel-box");

    let html = `
        <button class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <div class="grid">
            <div><label>Artikel</label><input class="artikelBezeichnung" type="text"></div>
            <div><label>Artikelnummer</label><input class="artikelnummerInput" type="text"></div>
        </div>
        <div class="grid" style="margin-top:10px;">
            <div><label>Gutmenge (${unit})</label><input class="gutteileInput" type="number"></div>
            <div><label>Ausschuss (${unit})</label><input class="ausschussInput" type="number"></div>
        </div>`;

    if (isCOM) {
        html += `<div style="margin-top:10px;"><label>Dauer inkl. Fehler (Minuten)</label><input class="artikelDauer" type="number"></div>`;
    }

    html += `
        <div class="störung-section" style="margin-top:15px; border-top:1px solid #cbd5e1; padding-top:10px;">
            <div class="störung-container"></div>
            <button type="button" class="add-störung-btn" style="background:#64748b; color:white; border:none; padding:10px; border-radius:10px; width:auto; cursor:pointer;">+ Störung hinzufügen</button>
        </div>`;

    box.innerHTML = html;
    artikelContainer.appendChild(box);

    // Artikel içine sınırsız hata satırı ekleme
    box.querySelector(".add-störung-btn").addEventListener("click", () => {
        const sRow = document.createElement("div");
        sRow.classList.add("grid");
        sRow.style.marginTop = "10px";
        sRow.innerHTML = `<input type="text" class="sGrund" placeholder="Grund / Kod"><div style="display:flex; gap:5px;"><input type="number" class="sMin" placeholder="Min"><button onclick="this.parentElement.parentElement.remove()" style="background:#ef4444; width:45px; margin:0; border:none; color:white; border-radius:8px;">X</button></div>`;
        box.querySelector(".störung-container").appendChild(sRow);
    });
});

// KAYDET VE GÖNDER
async function speichern() {
    const anlageVal = anlage.value;
    const artikels = document.querySelectorAll(".artikel-box");
    const workers = document.querySelectorAll(".workerSelect");
    const currentUser = localStorage.getItem("schichtb_user") || "Unbekannt";

    if (!anlageVal || workers.length === 0 || artikels.length === 0) return alert("Pflichtfelder fehlen!");

    let artikelText = "";
    let totalMinCOM = 0;

    artikels.forEach(box => {
        const bez = box.querySelector(".artikelBezeichnung").value;
        const num = box.querySelector(".artikelnummerInput").value;
        const gut = box.querySelector(".gutteileInput").value;
        const aus = box.querySelector(".ausschussInput").value || 0;
        const unit = (anlageVal === "COM") ? "Kg" : "Stk";

        artikelText += `• ${bez} (${num}) | G: ${gut}${unit} | A: ${aus}${unit}\n`;

        // Hataları tara
        const sRows = box.querySelectorAll(".störung-container .grid");
        sRows.forEach(row => {
            const g = row.querySelector(".sGrund").value;
            const m = parseInt(row.querySelector(".sMin").value || 0);
            if(g) artikelText += `  └─ ⚠️ Störung: ${g} (${m} Min)\n`;
        });

        if (anlageVal === "COM") {
            const ges = parseInt(box.querySelector(".artikelDauer").value || 0);
            totalMinCOM += ges;
            artikelText += `  ⏱️ Dauer: ${ges} Min (Hata dahil)\n`;
        }
    });

    if (anlageVal === "COM") {
        const soll = parseInt(document.getElementById("gesamtDauerInput").value || 480);
        if (totalMinCOM !== soll) {
            if(!confirm(`⚠️ ZEIT-WARNUNG!\nEingegeben: ${totalMinCOM} Min.\nSoll: ${soll} Min.\nTrotzdem senden?`)) return;
        }
    }

    let selectedFTs = "";
    if (anlageVal.startsWith("PUR")) {
        const checks = document.querySelectorAll(".ft-check:checked");
        if(checks.length > 0) selectedFTs = "\n🛠️ FT: " + Array.from(checks).map(c => c.parentElement.innerText.trim()).join(", ");
    }

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: [...workers].map(s => s.value).join(", "),
        anlage: anlageVal + selectedFTs,
        artikel: artikelText,
        sender: currentUser
    };

    fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });

    const waText = `📊 *SCHICHTBERICHT*\n👤 *Erstellt von:* ${currentUser}\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n🏭 *Anlage:* ${data.anlage}\n\n📦 *PRODUKTION:*\n${artikelText}`;
    window.location.href = `https://api.whatsapp.com/send?phone=${document.getElementById("waEmpfaenger").value}&text=${encodeURIComponent(waText)}`;
}

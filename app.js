const scriptURL = "https://script.google.com/macros/s/AKfycbyAM5y2pNFzIvmZDJuSotQkp5i1hvCKOp5jKcRIW9yho1daGyKoh9XkmiDBfj2Wqik8yQ/exec"; 

// --- TARİH FONKSİYONU (HER YERDE ÇALIŞMASI İÇİN) ---
function setiOtomatikTarih() {
    const datumInput = document.getElementById("datum");
    if (datumInput) {
        const bugün = new Date();
        const yıl = bugün.getFullYear();
        const ay = String(bugün.getMonth() + 1).padStart(2, '0');
        const gün = String(bugün.getDate()).padStart(2, '0');
        datumInput.value = `${yıl}-${ay}-${gün}`;
    }
}

// --- LOGIN VE BAŞLANGIÇ ---
window.onload = function() {
    setiOtomatikTarih(); // Sayfa açılır açılmaz tarihi koy

    const savedUser = localStorage.getItem("schichtb_user");
    const savedPass = localStorage.getItem("schichtb_pass");
    if (savedUser && savedPass) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

async function loginKontrol() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if(!user || !pass) return alert("Bitte Daten eingeben!");
    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
            localStorage.setItem("schichtb_pass", pass);
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("mainForm").style.display = "block";
            setiOtomatikTarih(); // Login olunca tekrar kontrol et
        } else {
            alert("Zugriff verweigert!");
        }
    } catch (e) { alert("Verbindungsfehler!"); }
}

// --- ELEMENTLER ---
const workerContainer = document.getElementById("workerContainer");
const addWorkerBtn = document.getElementById("addWorkerBtn");
const anlage = document.getElementById("anlage");
const ftBox = document.getElementById("ftBox");
const artikelContainer = document.getElementById("artikelContainer");
const addArtikelBtn = document.getElementById("addArtikelBtn");
const stoerungContainer = document.getElementById("stoerungContainer");
const addStoerungBtn = document.getElementById("addStoerungBtn");

const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba N.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];

if (anlage) {
    anlage.addEventListener("change", () => {
        artikelContainer.innerHTML = "";
        ftBox.style.display = anlage.value.startsWith("PUR") ? "block" : "none";
    });
}

addWorkerBtn.addEventListener("click", () => {
    let options = workerList.map(w => `<option>${w}</option>`).join("");
    const box = document.createElement("div");
    box.classList.add("worker-box");
    box.innerHTML = `<button class="delete-btn">X</button><label>Mitarbeiter</label><select class="workerSelect">${options}</select><input class="extraWorker" type="text" placeholder="Name" style="display:none; margin-top:10px;">`;
    workerContainer.appendChild(box);
    const select = box.querySelector(".workerSelect");
    const extra = box.querySelector(".extraWorker");
    select.addEventListener("change", () => extra.style.display = select.value === "Sonstige" ? "block" : "none");
    box.querySelector(".delete-btn").addEventListener("click", () => box.remove());
});

// --- ÜRETİM / ARTIKEL EKLEME (ÇİFT KUTULU) ---
addArtikelBtn.addEventListener("click", () => {
    if(!anlage.value) return alert("Bitte zuerst Anlage wählen!");
    const isCompound = (anlage.value === "COM");
    const unit = isCompound ? "Kg" : "Stk";
    
    const box = document.createElement("div");
    box.classList.add("artikel-box");
    box.innerHTML = `
        <button class="delete-btn">X</button>
        <div class="grid">
            <div><label>Artikel (z.B. 15A/01)</label><input class="artikelBezeichnung" type="text" placeholder="Bezeichnung"></div>
            <div><label>Artikelnummer</label><input class="artikelnummerInput" type="text" placeholder="z.B. 145000..."></div>
        </div>
        <div class="grid" style="margin-top:10px;">
            <div><label>Gutmenge (${unit})</label><input class="gutteileInput" type="number"></div>
            <div><label>Ausschuss (${unit})</label><input class="ausschussGesamt" type="number"></div>
        </div>
        <div class="fehlerBox" style="display:none; margin-top:10px;">
            <div class="fehlerContainer"></div>
            <button class="addFehlerBtn" type="button" style="background:#444; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">+ Fehlergrund (${unit})</button>
        </div>`;
        
    artikelContainer.appendChild(box);
    const ausschuss = box.querySelector(".ausschussGesamt");
    const fehlerBox = box.querySelector(".fehlerBox");
    ausschuss.addEventListener("input", () => fehlerBox.style.display = ausschuss.value > 0 ? "block" : "none");

    box.querySelector(".addFehlerBtn").addEventListener("click", () => {
        const row = document.createElement("div");
        row.classList.add("grid"); row.style.marginTop = "10px";
        row.innerHTML = `<div><input class="fehlerSelect" type="text" placeholder="Grund"></div><div><input class="fehlerMenge" type="number" placeholder="${unit}"></div>`;
        box.querySelector(".fehlerContainer").appendChild(row);
    });
    box.querySelector(".delete-btn").addEventListener("click", () => box.remove());
});

addStoerungBtn.addEventListener("click", () => {
    const box = document.createElement("div");
    box.classList.add("stoerung-box");
    box.innerHTML = `<button class="delete-btn">X</button><label>Störung (Grund)</label><input class="stoerungText" type="text" placeholder="Was ist passiert?"><label>Dauer (Minuten)</label><input class="stoerungZeit" type="number">`;
    stoerungContainer.appendChild(box);
    box.querySelector(".delete-btn").addEventListener("click", () => box.remove());
});

// --- KAYDET VE WHATSAPP ---
async function speichern() {
    const datumVal = document.getElementById("datum").value;
    const schichtVal = document.getElementById("schicht").value;
    const anlageVal = anlage.value;

    let artikelText = "";
    document.querySelectorAll(".artikel-box").forEach(box => {
        const bez = box.querySelector(".artikelBezeichnung").value;
        const num = box.querySelector(".artikelnummerInput").value;
        const gut = box.querySelector(".gutteileInput").value;
        const aus = box.querySelector(".ausschussGesamt").value;
        const unit = (anlageVal === "COM") ? "Kg" : "Stk";
        
        artikelText += `• ${bez} (${num}) | G: ${gut}${unit} | A: ${aus}${unit}\n`;
        box.querySelectorAll(".fehlerContainer .grid").forEach(row => {
            artikelText += `  └─ ${row.querySelector(".fehlerSelect").value}: ${row.querySelector(".fehlerMenge").value}${unit}\n`;
        });
    });

    let stoerungText = "";
    document.querySelectorAll(".stoerung-box").forEach(box => {
        stoerungText += `• ${box.querySelector(".stoerungText").value} (${box.querySelector(".stoerungZeit").value} Min)\n`;
    });

    const data = {
        datum: datumVal,
        schicht: schichtVal,
        mitarbeiter: [...document.querySelectorAll(".workerSelect")].map(s => s.value).join(", "),
        anlage: anlageVal,
        artikel: artikelText,
        stoerung: stoerungText
    };

    // Google Sheets'e gönder
    fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });

    // WhatsApp'a yönlendir
    const waText = `📊 *SCHICHTBERICHT*\n\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n🏭 *Anlage:* ${data.anlage}\n\n📦 *PRODUKTION:*\n${artikelText}\n⚠️ *STÖRUNGEN:*\n${stoerungText}`;
    window.location.href = `https://api.whatsapp.com/send?phone=${document.getElementById("waEmpfaenger").value}&text=${encodeURIComponent(waText)}`;
}

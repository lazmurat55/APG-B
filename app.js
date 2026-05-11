const scriptURL = "https://script.google.com/macros/s/AKfycbyAM5y2pNFzIvmZDJuSotQkp5i1hvCKOp5jKcRIW9yho1daGyKoh9XkmiDBfj2Wqik8yQ/exec"; 

function setiOtomatikTarih() {
    const datumInput = document.getElementById("datum");
    if (datumInput) datumInput.value = new Date().toISOString().split('T')[0];
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
            localStorage.setItem("schichtb_pass", pass);
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("mainForm").style.display = "block";
            setiOtomatikTarih();
        } else { alert("Zugriff verweigert!"); }
    } catch (e) { alert("Verbindungsfehler!"); }
}

const anlage = document.getElementById("anlage");
const gesamtDauerBox = document.getElementById("gesamtDauerBox");

if (anlage) {
    anlage.addEventListener("change", () => {
        // Gesamtdauer-Box nur bei Compound (COM) anzeigen
        gesamtDauerBox.style.display = (anlage.value === "COM") ? "block" : "none";
        const ftBox = document.getElementById("ftBox");
        if(ftBox) ftBox.style.display = anlage.value.startsWith("PUR") ? "block" : "none";
    });
}

const workerContainer = document.getElementById("workerContainer");
const addWorkerBtn = document.getElementById("addWorkerBtn");
const artikelContainer = document.getElementById("artikelContainer");
const addArtikelBtn = document.getElementById("addArtikelBtn");

addWorkerBtn.addEventListener("click", () => {
    const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba N.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];
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

addArtikelBtn.addEventListener("click", () => {
    if(!anlage.value) return alert("Bitte zuerst Anlage wählen!");
    const isCompound = (anlage.value === "COM");
    const unit = isCompound ? "Kg" : "Stk";
    
    const box = document.createElement("div");
    box.classList.add("artikel-box");
    box.innerHTML = `
        <button class="delete-btn">X</button>
        <div class="grid">
            <div><label>Artikel</label><input class="artikelBezeichnung" type="text" placeholder="z.B. 15A/01"></div>
            <div><label>Artikelnummer</label><input class="artikelnummerInput" type="text" placeholder="145..."></div>
        </div>
        <div class="grid" style="margin-top:10px;">
            <div><label>Gutmenge (${unit})</label><input class="gutteileInput" type="number"></div>
            <div><label>Ausschuss (${unit})</label><input class="ausschussGesamt" type="number"></div>
        </div>
        <div class="grid" style="margin-top:10px;">
            <div><label>Dauer inkl. Fehler (Min)</label><input class="artikelDauer" type="number" placeholder="Minuten"></div>
            <div style="display:flex; align-items:flex-end;"><button class="addFehlerBtn" type="button" style="width:100%; height:40px; background:#444; color:white; border:none; border-radius:4px;">+ Fehlergrund</button></div>
        </div>
        <div class="fehlerBox" style="display:none; margin-top:10px;"><div class="fehlerContainer"></div></div>`;
        
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

document.getElementById("addStoerungBtn").addEventListener("click", () => {
    const box = document.createElement("div");
    box.classList.add("stoerung-box");
    box.innerHTML = `<button class="delete-btn">X</button><label>Störungsgrund</label><input class="stoerungText" type="text"><label>Dauer (Min)</label><input class="stoerungZeit" type="number">`;
    document.getElementById("stoerungContainer").appendChild(box);
    box.querySelector(".delete-btn").addEventListener("click", () => box.remove());
});

async function speichern() {
    const anlageVal = anlage.value;
    const workerBoxes = document.querySelectorAll(".worker-box");
    const artikelBoxes = document.querySelectorAll(".artikel-box");

    // 1. PFLICHTFELDER (Zorunlu Alanlar)
    if (!anlageVal) return alert("❌ Fehler: Bitte Anlage wählen!");
    if (workerBoxes.length === 0) return alert("❌ Fehler: Mitarbeiter fehlt!");
    if (artikelBoxes.length === 0) return alert("❌ Fehler: Produktion fehlt!");

    // 2. ZEITKONTROLLE (NUR BEI COMPOUND - WARNUNG ABER SENDEN ERLAUBT)
    if (anlageVal === "COM") {
        const sollDauer = parseInt(document.getElementById("gesamtDauerInput").value || 480);
        let istDauer = 0;
        artikelBoxes.forEach(box => istDauer += parseInt(box.querySelector(".artikelDauer").value || 0));

        if (istDauer !== sollDauer) {
            // Sadece uyarı veriyor, durdurmuyor
            confirm(`⚠️ ZEIT-WARNUNG!\n\nDie Gesamtzeit der Artikel beträgt ${istDauer} Min.\nDie Schichtdauer beträgt ${sollDauer} Min.\n\nMöchten Sie den Bericht trotzdem senden?`);
        }
    }

    // 3. DATEN SENDEN
    let artikelText = "";
    artikelBoxes.forEach(box => {
        const bez = box.querySelector(".artikelBezeichnung").value;
        const num = box.querySelector(".artikelnummerInput").value;
        const gut = box.querySelector(".gutteileInput").value;
        const aus = box.querySelector(".ausschussGesamt").value || 0;
        const dur = box.querySelector(".artikelDauer").value;
        const unit = (anlageVal === "COM") ? "Kg" : "Stk";
        artikelText += `• ${bez} (${num}) | G: ${gut}${unit} | A: ${aus}${unit}${anlageVal === "COM" ? ` | Zeit: ${dur} Min` : ""}\n`;
        box.querySelectorAll(".fehlerContainer .grid").forEach(row => {
            artikelText += `  └─ ${row.querySelector(".fehlerSelect").value}: ${row.querySelector(".fehlerMenge").value}${unit}\n`;
        });
    });

    let stoerungText = "";
    document.querySelectorAll(".stoerung-box").forEach(box => {
        stoerungText += `• ${box.querySelector(".stoerungText").value} (${box.querySelector(".stoerungZeit").value} Min)\n`;
    });

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: [...document.querySelectorAll(".workerSelect")].map(s => s.value).join(", "),
        anlage: anlageVal,
        artikel: artikelText,
        stoerung: stoerungText
    };

    // Google Sheets
    fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });

    // WhatsApp
    const waText = `📊 *SCHICHTBERICHT*\n\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n🏭 *Anlage:* ${data.anlage}\n\n📦 *PRODUKTION:*\n${artikelText}\n⚠️ *STÖRUNGEN:*\n${stoerungText}`;
    window.location.href = `https://api.whatsapp.com/send?phone=${document.getElementById("waEmpfaenger").value}&text=${encodeURIComponent(waText)}`;
}

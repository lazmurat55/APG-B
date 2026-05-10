const scriptURL = "https://script.google.com/macros/s/AKfycbyAM5y2pNFzIvmZDJuSotQkp5i1hvCKOp5jKcRIW9yho1daGyKoh9XkmiDBfj2Wqik8yQ/exec"; 

// --- LOGIN KONTROLÜ ---
window.onload = function() {
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
    if(!user || !pass) return alert("Bitte Benutzername und Passwort ausfüllen!");
    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
            localStorage.setItem("schichtb_pass", pass);
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("mainForm").style.display = "block";
        } else if (result === "blocked") {
            alert("Zugriff verweigert! (Benutzer ist passiv)");
        } else {
            alert("Falscher Benutzername oder Passwort!");
        }
    } catch (e) { alert("Verbindungsfehler!"); }
}

// --- FORM ELEMENTLERİ ---
const datumInput = document.getElementById("datum");
if (datumInput) { datumInput.value = new Date().toISOString().split("T")[0]; }

const workerContainer = document.getElementById("workerContainer");
const addWorkerBtn = document.getElementById("addWorkerBtn");
const anlage = document.getElementById("anlage");
const ftBox = document.getElementById("ftBox");
const artikelContainer = document.getElementById("artikelContainer");
const addArtikelBtn = document.getElementById("addArtikelBtn");
const stoerungContainer = document.getElementById("stoerungContainer");
const addStoerungBtn = document.getElementById("addStoerungBtn");

const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba N.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];
const purCodes = ["P101-Anfahrschrott PUR", "P102-PUR nicht voll", "P103-Schaum beschädigt", "P104-Schaumbild n.i.O.", "P105-Schaumhärtung n.i.O.", "P106-Einlegefehler"];
const cimCodes = ["C102-CIM nicht voll", "C103-CIM beschädigt", "01-Anfahrschrott", "02-HF Teile nicht voll", "03-HF gerissen"];
const imCodes = ["01-Anfahrschrott", "02-HF Teile nicht voll", "03-HF gerissen"];
const stoerungCodes = ["4-2-01 Werkzeug", "4-2-02 Ungepl. Instandhaltung", "4-2-03 POLY / SO Überdruck", "4-2-04 Mischkopf n.i.O.", "4-2-05 Fehler Lichtschranke", "4-2-06 Trennmittelpistole verstopft/defekt", "4-2-07 Formträger Fehler", "4-2-08 Reinigung Werkzeug", "4-2-09 Not Aus", "5-2-01 Logistik Fehler", "5-2-02 Warten auf Teile", "5-2-06 Personalmangel", "5-2-08 Kein Leergut", "Sonstige"];

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

addArtikelBtn.addEventListener("click", () => {
    if(!anlage.value) return alert("Bitte zuerst Anlage wählen");
    
    const isCompound = (anlage.value === "COM");
    const unit = isCompound ? "Kg" : "Gutteile";
    
    let options = "";
    if (!isCompound) {
        let codes = anlage.value.startsWith("PUR") ? purCodes : (anlage.value === "CIM1" ? cimCodes : imCodes);
        options = codes.map(c => `<option>${c}</option>`).join("");
    }

    const box = document.createElement("div");
    box.classList.add("artikel-box");
    box.innerHTML = `
        <button class="delete-btn">X</button>
        <label>Artikelnummer</label>
        <input class="artikelnummerInput" type="text" placeholder="Örn: 15A/01">
        <div class="grid">
            <div><label>${unit}</label><input class="gutteileInput" type="number"></div>
            <div><label>Ausschuss (${isCompound ? 'Kg' : 'Stk'})</label><input class="ausschussGesamt" type="number"></div>
        </div>
        <div class="fehlerBox" style="display:none;">
            <div class="fehlerContainer"></div>
            <button class="addFehlerBtn" type="button">+ Fehler ${isCompound ? '(Manuell)' : '(Codes)'}</button>
        </div>`;
        
    artikelContainer.appendChild(box);
    const ausschuss = box.querySelector(".ausschussGesamt");
    const fehlerBox = box.querySelector(".fehlerBox");
    ausschuss.addEventListener("input", () => fehlerBox.style.display = ausschuss.value > 0 ? "block" : "none");

    box.querySelector(".addFehlerBtn").addEventListener("click", () => {
        const row = document.createElement("div");
        row.classList.add("grid"); row.style.marginTop = "10px";
        const fehlerInput = isCompound 
            ? `<input class="fehlerSelect" type="text" placeholder="Fehlergrund">` 
            : `<select class="fehlerSelect">${options}</select>`;
            
        row.innerHTML = `<div>${fehlerInput}</div><div><input class="fehlerMenge" type="number" placeholder="${isCompound ? 'Kg' : 'Anzahl'}"></div>`;
        box.querySelector(".fehlerContainer").appendChild(row);
    });
    box.querySelector(".delete-btn").addEventListener("click", () => box.remove());
});

addStoerungBtn.addEventListener("click", () => {
    const box = document.createElement("div");
    box.classList.add("stoerung-box");
    
    if(anlage.value.startsWith("PUR")){
        let opts = stoerungCodes.map(c => `<option>${c}</option>`).join("");
        box.innerHTML = `<button class="delete-btn">X</button><label>Störungscode</label><select class="stoerung-select">${opts}</select><input class="extra-stoerung" type="text" style="display:none; margin-top:10px;"><label>Dauer (Min)</label><input class="stoerungZeit" type="number">`;
        const sel = box.querySelector(".stoerung-select");
        const extra = box.querySelector(".extra-stoerung");
        sel.addEventListener("change", () => extra.style.display = sel.value === "Sonstige" ? "block" : "none");
    } else {
        box.innerHTML = `
            <button class="delete-btn">X</button>
            <label>Störung (Grund eingeben)</label>
            <input class="stoerungText" type="text" placeholder="Was ist passiert?">
            <label>Dauer (Minuten)</label>
            <input class="stoerungZeit" type="number">`;
    }
    stoerungContainer.appendChild(box);
    box.querySelector(".delete-btn").addEventListener("click", () => box.remove());
});

async function speichern() {
    const user = localStorage.getItem("schichtb_user");
    const pass = localStorage.getItem("schichtb_pass");
    const check = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
    const status = await check.text();
    if (status !== "active") {
        alert("Sitzung abgelaufen!");
        localStorage.clear();
        location.reload();
        return;
    }

    if(!anlage.value || document.querySelectorAll(".worker-box").length === 0) return alert("Fehlende Daten!");
    
    let mitarbeiter = [];
    document.querySelectorAll(".worker-box").forEach(box => {
        const s = box.querySelector(".workerSelect");
        mitarbeiter.push(s.value === "Sonstige" ? box.querySelector(".extraWorker").value : s.value);
    });

    let ftListe = [];
    document.querySelectorAll('#ftBox input[type="checkbox"]:checked').forEach(ft => ftListe.push(ft.parentElement.innerText.trim()));
    
    let artikelText = "";
    document.querySelectorAll(".artikel-box").forEach(box => {
        const artNum = box.querySelector(".artikelnummerInput").value;
        const gut = box.querySelector(".gutteileInput").value;
        const aus = box.querySelector(".ausschussGesamt").value;
        const unit = (anlage.value === "COM") ? "Kg" : "Stk";
        
        artikelText += `• Art: ${artNum} | G: ${gut}${unit} | A: ${aus}${unit}\n`;
        box.querySelectorAll(".fehlerContainer .grid").forEach(row => {
            const fSel = row.querySelector(".fehlerSelect").value;
            const fMen = row.querySelector(".fehlerMenge").value;
            artikelText += `  └─ ${fSel}: ${fMen}${unit}\n`;
        });
    });

    let stoerungText = "";
    document.querySelectorAll(".stoerung-box").forEach(box => {
        let name = box.querySelector(".stoerung-select") ? (box.querySelector(".stoerung-select").value === "Sonstige" ? box.querySelector(".extra-stoerung").value : box.querySelector(".stoerung-select").value) : box.querySelector(".stoerungText").value;
        stoerungText += `• ${name} (${box.querySelector(".stoerungZeit").value} Min)\n`;
    });

    const data = {
        datum: datumInput.value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: mitarbeiter.join(", "),
        anlage: anlage.value + (ftListe.length > 0 ? " (FT: " + ftListe.join(",") + ")" : ""),
        artikel: artikelText,
        stoerung: stoerungText
    };

    fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });

    const waEmpfaenger = document.getElementById("waEmpfaenger").value;
    const waText = `📊 *SCHICHTBERICHT*\n\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n👷 *Team:* ${data.mitarbeiter}\n🏭 *Anlage:* ${data.anlage}\n\n📦 *PRODUKTION:*\n${artikelText}\n⚠️ *STÖRUNGEN:*\n${stoerungText}`;
    window.location.href = `https://api.whatsapp.com/send?phone=${waEmpfaenger}&text=${encodeURIComponent(waText)}`;
}

const scriptURL = "https://script.google.com/macros/s/AKfycbyAM5y2pNFzIvmZDJuSotQkp5i1hvCKOp5jKcRIW9yho1daGyKoh9XkmiDBfj2Wqik8yQ/exec"; 

function setiOtomatikTarih() {
    const d = document.getElementById("datum");
    if (d) d.value = new Date().toISOString().split('T')[0];
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
        } else { alert("Zugriff verweigert!"); }
    } catch (e) { alert("Fehler!"); }
}

const anlage = document.getElementById("anlage");
const gesamtDauerBox = document.getElementById("gesamtDauerBox");
const ftBox = document.getElementById("ftBox");
const artikelContainer = document.getElementById("artikelContainer");

anlage.addEventListener("change", () => {
    const val = anlage.value;
    if(gesamtDauerBox) gesamtDauerBox.style.display = (val === "COM") ? "block" : "none";
    if(ftBox) ftBox.style.display = val.startsWith("PUR") ? "block" : "none";
    artikelContainer.innerHTML = ""; 
});

// MITARBEITER EKLEME
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    const list = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba N.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];
    let opt = list.map(w => `<option>${w}</option>`).join("");
    const box = document.createElement("div");
    box.classList.add("worker-box");
    box.innerHTML = `<button class="delete-btn" onclick="this.parentElement.remove()">X</button><label>Mitarbeiter</label><select class="workerSelect">${opt}</select>`;
    document.getElementById("workerContainer").appendChild(box);
});

// ARTIKEL VE STÖRUNG EKLEME MANTIĞI
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const selectedAnlage = anlage.value;
    if(!selectedAnlage) return alert("Bitte zuerst eine Anlage wählen!");

    const isCOM = (selectedAnlage === "COM");
    const isPUR = selectedAnlage.startsWith("PUR");
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
            <div><label>Ausschuss Gesamt (${unit})</label><input class="ausschussInput" type="number"></div>
        </div>`;

    // PUR İÇİN AUSSCHUSS KODLARI
    if (isPUR) {
        html += `
        <div style="margin-top:10px; background:#f9f9f9; padding:5px; border-radius:4px;">
            <label>Ausschuss Details (Stk)</label>
            <div class="grid">
                <input type="number" class="aus10" placeholder="Kod 10">
                <input type="number" class="aus20" placeholder="Kod 20">
                <input type="number" class="aus30" placeholder="Kod 30">
                <input type="number" class="aus40" placeholder="Kod 40">
            </div>
        </div>`;
    }

    // COMPOUND İÇİN TOPLAM SÜRE
    if (isCOM) {
        html += `
        <div style="margin-top:10px;">
            <label>Dauer inkl. Fehler (Min)</label>
            <input class="artikelDauer" type="number">
        </div>`;
    }

    // STÖRUNG BÖLÜMÜ (Tüm makineler için opsiyonel ve sınırsız)
    html += `
        <div class="störung-section" style="margin-top:15px; border-top:1px solid #eee; pt:10px;">
            <div class="störung-container"></div>
            <button type="button" class="add-störung-btn" style="background:#666; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-top:5px;">+ Störung hinzufügen</button>
        </div>`;

    box.innerHTML = html;
    artikelContainer.appendChild(box);

    // Störung Ekleme Butonu Fonksiyonu
    box.querySelector(".add-störung-btn").addEventListener("click", () => {
        const sContainer = box.querySelector(".störung-container");
        const sRow = document.createElement("div");
        sRow.classList.add("grid");
        sRow.style.marginTop = "5px";
        sRow.innerHTML = `
            <input type="text" class="sGrund" placeholder="Grund / Kod" style="flex:2">
            <input type="number" class="sMin" placeholder="Min" style="flex:1">
            <button onclick="this.parentElement.remove()" style="background:none; border:none; color:red; cursor:pointer;">X</button>`;
        sContainer.appendChild(sRow);
    });
});

async function speichern() {
    const anlageVal = anlage.value;
    const artikels = document.querySelectorAll(".artikel-box");
    const currentUser = localStorage.getItem("schichtb_user") || "Unbekannt";

    if (!anlageVal || artikels.length === 0) return alert("Pflichtfelder fehlen!");

    let artikelText = "";
    let totalCOMMin = 0;

    artikels.forEach(box => {
        const bez = box.querySelector(".artikelBezeichnung").value;
        const num = box.querySelector(".artikelnummerInput").value;
        const gut = box.querySelector(".gutteileInput").value;
        const aus = box.querySelector(".ausschussInput").value || 0;
        const unit = (anlageVal === "COM") ? "Kg" : "Stk";

        artikelText += `• ${bez} (${num}) | G: ${gut}${unit} | A: ${aus}${unit}\n`;

        // PUR Ausschuss Detayları
        if (anlageVal.startsWith("PUR")) {
            const a10 = box.querySelector(".aus10").value;
            const a20 = box.querySelector(".aus20").value;
            const a30 = box.querySelector(".aus30").value;
            const a40 = box.querySelector(".aus40").value;
            if(a10||a20||a30||a40) artikelText += `  └─ Ausschuss: [10:${a10||0}] [20:${a20||0}] [30:${a30||0}] [40:${a40||0}]\n`;
        }

        // Störungen Detayları
        const sRows = box.querySelectorAll(".störung-container .grid");
        let artikelHataMin = 0;
        sRows.forEach(row => {
            const g = row.querySelector(".sGrund").value;
            const m = parseInt(row.querySelector(".sMin").value || 0);
            if(g) {
                artikelText += `  └─ ⚠️ Störung: ${g} (${m} Min)\n`;
                artikelHataMin += m;
            }
        });

        if (anlageVal === "COM") {
            const ges = parseInt(box.querySelector(".artikelDauer").value || 0);
            totalCOMMin += ges;
            artikelText += `  ⏱️ Zeit: ${ges} Min (Netto: ${ges - artikelHataMin} | Störung: ${artikelHataHataMin})\n`;
        }
    });

    if (anlageVal === "COM") {
        const soll = parseInt(document.getElementById("gesamtDauerInput").value || 480);
        if (totalCOMMin !== soll) confirm(`Warnung: Gesamtzeit ${totalCOMMin} Min entspricht nicht Soll ${soll} Min. Trotzdem senden?`);
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
    const waText = `📊 *SCHICHTBERICHT*\n👤 *Erstellt von:* ${currentUser}\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n🏭 *Anlage:* ${data.anlage}\n\n📦 *PRODUKTION:*\n${artikelText}`;
    window.location.href = `https://api.whatsapp.com/send?phone=${document.getElementById("waEmpfaenger").value}&text=${encodeURIComponent(waText)}`;
}

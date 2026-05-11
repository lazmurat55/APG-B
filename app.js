// Senin verdiğin güncel Script URL'si
const scriptURL = "https://script.google.com/macros/s/AKfycbwbeXMNMX1ZkoHTKtEVswb3y-vGMTuyAxd6cvggxHpcH3LXSUKCQPLDOOEiGLaY4w1vJw/exec";

// --- VERİ LİSTELERİ (DEĞİŞTİRMEYİN) ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];

const purAusschussCodes = ["P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "C102 CIM nicht voll", "C103 CIM beschädigt", "Sonstige"];
const imAusschussCodes = ["Anfahrschrott", "Teile nicht voll", "Teile gerissen oder beschädigt", "Sonstige"];
const comAusschussCodes = ["Anfahrschrott", "Sonstiger"];

const purStoerungCodes = [
    "4-2-01 Werkzeug", "4-2-02 Ungepl. Instandhaltung", "4-2-03 POLY /SO Überdrück", "4-2-04 Mischkopf n.i.o.", "4-2-05 Fehler Lichtschranke", "4-2-06 Trennmittelpistole verstopft",
    "4-2-07 Formträger Initiator n.i.o.", "4-2-08 Reinigung Werkzeug", "4-2-09 Not Aus", "5-2-01 Logistik (Keine HF)", "5-2-02 Keine HF von IM/CIM", "5-2-03 Anlernen Mitarbeiter",
    "5-2-04 Wartezeit (Einrichter)", "5-2-05 Mitarbeiter Umbesetzung", "5-2-06 Unterbesetzung", "5-2-07 Scanner/Drucker Probleme", "5-2-08 Kein Leergut", "5-2-09 Gasflasche wechseln", "Sonstige"
];

// --- SAYFA YÜKLENDİĞİNDE ---
window.onload = () => {
    const d = document.getElementById("datum");
    if (d) d.value = new Date().toISOString().split("T")[0];
    
    // Eğer önceden giriş yapılmışsa login kutusunu gizle
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

// --- GİRİŞ KONTROLÜ (LOGIN) ---
async function loginKontrol() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    
    if(!user || !pass) return alert("Benutzername/Passwort fehlt!");
    
    try {
        // Google Script'e 'login' komutu gönderiyoruz
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("mainForm").style.display = "block";
        } else if (result === "Nutzer ist passiv") {
            alert("Achtung: Dieser Nutzer ist auf PASSIV gesetzt!");
        } else {
            alert("Zugriff verweigert! Name veya Password yanlış.");
        }
    } catch (e) {
        alert("Bağlantı Hatası: Lütfen Google Script URL'nizi ve internetinizi kontrol edin.");
    }
}

// --- MAKİNE SEÇİMİ VE ARAYÜZ DEĞİŞİMİ ---
const anlage = document.getElementById("anlage");
const artikelContainer = document.getElementById("artikelContainer");

anlage.addEventListener("change", () => {
    // Compound ise toplam süre kutusunu göster
    document.getElementById("gesamtDauerBox").style.display = (anlage.value === "COM") ? "block" : "none";
    // PUR ise FT kutusunu göster
    document.getElementById("ftBox").style.display = anlage.value.startsWith("PUR") ? "block" : "none";
    // Makine değişince makaleleri temizle
    artikelContainer.innerHTML = ""; 
});

// --- PERSONEL EKLEME ---
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    let opt = workerList.map(w => `<option>${w}</option>`).join("");
    const box = document.createElement("div");
    box.classList.add("worker-box");
    box.innerHTML = `
        <button class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <label>Mitarbeiter</label>
        <select class="workerSelect">${opt}</select>
        <input class="extraWorker" type="text" placeholder="Name" style="display:none; margin-top:10px;">
    `;
    document.getElementById("workerContainer").appendChild(box);
    const sel = box.querySelector(".workerSelect");
    const ext = box.querySelector(".extraWorker");
    sel.addEventListener("change", () => ext.style.display = sel.value === "Sonstige" ? "block" : "none");
});

// --- FIRE (AUSSCHUSS) TOPLAM KONTROLÜ ---
function checkAusschussSum(box) {
    const totalInput = box.querySelector(".ausschussInput");
    const warnung = box.querySelector(".ausWarnung");
    const details = box.querySelectorAll(".ausMenge");
    
    let totalSoll = parseInt(totalInput.value) || 0;
    let currentSum = 0;
    details.forEach(inp => currentSum += (parseInt(inp.value) || 0));

    if (totalSoll > 0 && currentSum !== totalSoll) {
        warnung.style.display = "block";
        warnung.innerText = `⚠️ Summe der Codes (${currentSum}) stimmt nicht mit Gesamt-Ausschuss (${totalSoll}) überein!`;
        return false;
    } else {
        warnung.style.display = "none";
        return true;
    }
}

// --- ARTIKEL EKLEME ---
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const selectedAnlage = anlage.value;
    if(!selectedAnlage) return alert("Bitte zuerst Anlage wählen!");

    const isCOM = (selectedAnlage === "COM");
    const isPUR = selectedAnlage.startsWith("PUR");
    const isIM = (selectedAnlage.startsWith("IM") || selectedAnlage === "CIM1");
    const unit = isCOM ? "Kg" : "Stk";
    
    const box = document.createElement("div");
    box.classList.add("artikel-box");

    // Sadece Compound ise Artikelnummer kutusunu ekle
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
        </div>
        <p class="ausWarnung" style="color:#d32f2f; font-size:12px; font-weight:bold; display:none; margin-top:5px;"></p>
        
        <div class="ausschuss-detail-section" style="margin-top:10px; border-top:1px dashed #ccc; padding-top:10px;">
            <div class="ausschuss-container"></div>
            <button type="button" class="add-aus-btn" style="background:#8b949e; color:white; border:none; padding:5px; border-radius:5px; font-size:12px; cursor:pointer;">+ Ausschuss-Grund hinzufügen</button>
        </div>`;

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

    // Ausschuss kontrolü bağla
    const totalAusInput = box.querySelector(".ausschussInput");
    totalAusInput.addEventListener("input", () => checkAusschussSum(box));

    // Fire ekleme butonu
    box.querySelector(".add-aus-btn").addEventListener("click", () => {
        let currentList = isPUR ? purAusschussCodes : (isIM ? imAusschussCodes : comAusschussCodes);
        const ausOpt = currentList.map(c => `<option>${c}</option>`).join("");
        const ausRow = document.createElement("div");
        ausRow.classList.add("grid"); ausRow.style.marginTop = "5px";
        ausRow.innerHTML = `
            <select class="ausSelect" style="flex:2">${ausOpt}</select>
            <div style="display:flex; gap:5px; flex:1">
                <input type="number" class="ausMenge" placeholder="${unit}">
                <button onclick="this.parentElement.parentElement.remove(); checkAusschussSum(box);" style="background:none; border:none; color:red;">X</button>
            </div>`;
        box.querySelector(".ausschuss-container").appendChild(ausRow);
        ausRow.querySelector(".ausMenge").addEventListener("input", () => checkAusschussSum(box));
    });

    // Hata (Störung) ekleme butonu
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

// --- VERİLERİ GÖNDERME ---
async function speichern() {
    const anlageVal = anlage.value;
    const artikels = document.querySelectorAll(".artikel-box");
    const currentUser = localStorage.getItem("schichtb_user") || "Unbekannt";

    if (!anlageVal || artikels.length === 0) return alert("Bitte füllen Sie alle Pflichtfelder aus!");

    // Fire toplamları doğru mu?
    let isValid = true;
    artikels.forEach(box => { if (!checkAusschussSum(box)) isValid = false; });
    if (!isValid) return alert("❌ Fehler: Die Ausschuss-Details stimmen nicht mit der Gesamtmenge überein!");

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

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: [...document.querySelectorAll(".workerSelect")].map(s => s.value).join(", "),
        anlage: anlageVal,
        artikel: artikelText,
        sender: currentUser
    };

    // Google Script'e kaydet (doPost)
    fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });

    // WhatsApp'a yönlendir
    const waText = `📊 *SCHICHTBERICHT*\n👤 *Sender:* ${currentUser}\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n🏭 *Anlage:* ${data.anlage}\n\n📦 *PRODUKTION:*\n${artikelText}`;
    window.location.href = `https://api.whatsapp.com/send?phone=${document.getElementById("waEmpfaenger").value}&text=${encodeURIComponent(waText)}`;
}

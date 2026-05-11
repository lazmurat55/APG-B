// Senin verdiğin en güncel Script URL'si
const scriptURL = "https://script.google.com/macros/s/AKfycbz7MaRyed4Owfjlbf0OVZ2NRwUX8Bwn7dq712m3lTsJtTeJGw_YOECSc0kMU-VNJgWxbg/exec";

// --- 1. VERİ LİSTELERİ (Eksiksiz) ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];

const purAusschussCodes = ["P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "C102 CIM nicht voll", "C103 CIM beschädigt", "Sonstige"];
const imAusschussCodes = ["Anfahrschrott", "Teile nicht voll", "Teile gerissen oder beschädigt", "Sonstige"];
const comAusschussCodes = ["Anfahrschrott", "Sonstiger"];

const purStoerungCodes = [
    "4-2-01 Werkzeug", "4-2-02 Ungepl. Instandhaltung", "4-2-03 POLY /SO Überdrück", "4-2-04 Mischkopf n.i.o.", "4-2-05 Fehler Lichtschranke", "4-2-06 Trennmittelpistole verstopft",
    "4-2-07 Formträger Initiator n.i.o.", "4-2-08 Reinigung Werkzeug", "4-2-09 Not Aus", "5-2-01 Logistik (Keine HF)", "5-2-02 Keine HF von IM/CIM", "5-2-03 Anlernen Mitarbeiter",
    "5-2-04 Wartezeit (Einrichter)", "5-2-05 Mitarbeiter Umbesetzung", "5-2-06 Unterbesetzung", "5-2-07 Scanner/Drucker Probleme", "5-2-08 Kein Leergut", "5-2-09 Gasflasche wechseln", "Sonstige"
];

// --- 2. SAYFA YÜKLENME AYARLARI ---
window.onload = () => {
    const datumInput = document.getElementById("datum");
    if (datumInput) datumInput.value = new Date().toISOString().split("T")[0];
    
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

// --- 3. LOGIN SİSTEMİ ---
async function loginKontrol() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if(!user || !pass) return alert("Bitte Name und Passwort eingeben!");
    
    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("mainForm").style.display = "block";
        } else {
            alert("Fehler: " + result);
        }
    } catch (e) { alert("Verbindungsfehler!"); }
}

// --- 4. ARAYÜZ KONTROLLERİ ---
const anlage = document.getElementById("anlage");
const artikelContainer = document.getElementById("artikelContainer");

if (anlage) {
    anlage.addEventListener("change", () => {
        document.getElementById("gesamtDauerBox").style.display = (anlage.value === "COM") ? "block" : "none";
        document.getElementById("ftBox").style.display = anlage.value.startsWith("PUR") ? "block" : "none";
        artikelContainer.innerHTML = ""; 
    });
}

// --- 5. PERSONEL EKLEME ---
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    let opt = workerList.map(w => `<option>${w}</option>`).join("");
    const box = document.createElement("div");
    box.className = "worker-box";
    box.innerHTML = `
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <label>Mitarbeiter</label>
        <select class="workerSelect">${opt}</select>
    `;
    document.getElementById("workerContainer").appendChild(box);
});

// --- 6. FIRE (AUSSCHUSS) HESAPLAMA VE KONTROL ---
function checkAusschussSum(box) {
    const totalInput = box.querySelector(".ausschussInput");
    const warnung = box.querySelector(".ausWarnung");
    const details = box.querySelectorAll(".ausMenge");
    
    let totalSoll = parseInt(totalInput.value) || 0;
    let currentSum = 0;
    details.forEach(inp => currentSum += (parseInt(inp.value) || 0));

    if (totalSoll > 0 && currentSum !== totalSoll) {
        warnung.style.display = "block";
        warnung.innerText = `⚠️ Summe (${currentSum}) stimmt nicht mit Gesamt (${totalSoll}) überein!`;
        return false;
    } else {
        warnung.style.display = "none";
        return true;
    }
}

// --- 7. ARTIKEL VE HATA (STÖRUNG) EKLEME ---
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const selAnlage = anlage.value;
    if(!selAnlage) return alert("Bitte Anlage wählen!");
    
    const isCOM = (selAnlage === "COM");
    const isPUR = selAnlage.startsWith("PUR");
    const isIM = (selAnlage.startsWith("IM") || selAnlage === "CIM1");
    const unit = isCOM ? "Kg" : "Stk";
    
    const box = document.createElement("div");
    box.className = "artikel-box";
    
    let artHtml = `<div><label>Artikel</label><input class="artikelBezeichnung" type="text"></div>`;
    if (isCOM) { artHtml += `<div><label>Artikelnummer</label><input class="artikelnummerInput" type="text"></div>`; }

    box.innerHTML = `
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <div class="grid">${artHtml}</div>
        <div class="grid" style="margin-top:10px;">
            <div><label>Gutmenge (${unit})</label><input class="gutteileInput" type="number"></div>
            <div><label>Ausschuss Gesamt (${unit})</label><input class="ausschussInput" type="number"></div>
        </div>
        <p class="ausWarnung" style="color:red; font-size:11px; display:none;"></p>
        <div class="ausschuss-container"></div>
        <button type="button" class="add-aus-btn">+ Ausschuss-Grund</button>
        <hr>
        <div class="störung-container"></div>
        <button type="button" class="add-störung-btn" style="background:#64748b;">+ Störung/Fehler</button>
    `;
    
    if (isCOM) {
        let timerDiv = document.createElement("div");
        timerDiv.innerHTML = `<label>Dauer inkl. Fehler (Min)</label><input class="artikelDauer" type="number">`;
        box.insertBefore(timerDiv, box.querySelector("hr"));
    }

    artikelContainer.appendChild(box);

    // Ausschuss Events
    box.querySelector(".ausschussInput").addEventListener("input", () => checkAusschussSum(box));
    box.querySelector(".add-aus-btn").addEventListener("click", () => {
        let list = isPUR ? purAusschussCodes : (isIM ? imAusschussCodes : comAusschussCodes);
        const ausRow = document.createElement("div");
        ausRow.className = "grid";
        ausRow.style.marginTop = "5px";
        ausRow.innerHTML = `
            <select class="ausSelect">${list.map(c=>`<option>${c}</option>`).join("")}</select>
            <input type="number" class="ausMenge" placeholder="Menge">
            <button type="button" onclick="this.parentElement.remove(); checkAusschussSum(box.closest('.artikel-box'));">X</button>
        `;
        box.querySelector(".ausschuss-container").appendChild(ausRow);
        ausRow.querySelector(".ausMenge").addEventListener("input", () => checkAusschussSum(box));
    });

    // Störung Events (PUR Listeli, Diğerleri Yazmalı)
    box.querySelector(".add-störung-btn").addEventListener("click", () => {
        const sRow = document.createElement("div");
        sRow.className = "grid";
        sRow.style.marginTop = "5px";
        if(isPUR) {
            sRow.innerHTML = `
                <select class="sSelect">${purStoerungCodes.map(c=>`<option>${c}</option>`).join("")}</select>
                <input type="number" class="sMin" placeholder="Min">
                <button type="button" onclick="this.parentElement.remove()">X</button>`;
        } else {
            sRow.innerHTML = `
                <input type="text" class="sGrund" placeholder="Grund">
                <input type="number" class="sMin" placeholder="Min">
                <button type="button" onclick="this.parentElement.remove()">X</button>`;
        }
        box.querySelector(".störung-container").appendChild(sRow);
    });
});

// --- 8. KAYDET VE WHATSAPP'A GÖNDER ---
async function speichern() {
    const artikels = document.querySelectorAll(".artikel-box");
    if (artikels.length === 0) return alert("Keine Artikel vorhanden!");

    let isValid = true;
    artikels.forEach(box => { if (!checkAusschussSum(box)) isValid = false; });
    if (!isValid) return alert("❌ Die Ausschuss-Summen stimmen nicht überein!");

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
        
        const sMinuten = box.querySelectorAll(".sMin");
        sMinuten.forEach((minInput, i) => {
            let grund = box.querySelectorAll(".sSelect")[i] ? box.querySelectorAll(".sSelect")[i].value : box.querySelectorAll(".sGrund")[i].value;
            if(minInput.value) artikelText += `  └─ ⚠️ Hata: ${grund} (${minInput.value} Min)\n`;
        });
    });

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: [...document.querySelectorAll(".workerSelect")].map(s => s.value).join(", "),
        anlage: anlage.value,
        artikel: artikelText,
        sender: localStorage.getItem("schichtb_user")
    };

    try {
        fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
        
        const waText = `📊 *SCHICHTBERICHT*\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n🏭 *Anlage:* ${data.anlage}\n👤 *Sender:* ${data.sender}\n\n📦 *PRODUKTION:*\n${artikelText}`;
        const waNumber = document.getElementById("waEmpfaenger").value;
        
        window.location.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
    } catch (e) { alert("Hata!"); }
}

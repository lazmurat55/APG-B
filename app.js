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
    if(!user || !pass) return alert("Benutzername/Passwort fehlt!");
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

// MAKİNE SEÇİLDİĞİNDE GÖRÜNÜMÜ AYARLA
anlage.addEventListener("change", () => {
    const val = anlage.value;
    
    // Sadece Compound ise genel süre kutusunu (480 min) göster
    if(gesamtDauerBox) gesamtDauerBox.style.display = (val === "COM") ? "block" : "none";
    
    // Sadece PUR makineleri ise FT kutusunu göster
    if(ftBox) ftBox.style.display = val.startsWith("PUR") ? "block" : "none";
    
    // Makine değiştiğinde üretim listesini sıfırla (Farklı makine yapısına geçiş için önemli)
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

// ARTIKEL EKLEME (BURASI KRİTİK: MAKİNE TİPİNE GÖRE DİZAYN EDER)
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const selectedAnlage = anlage.value;
    if(!selectedAnlage) return alert("Bitte zuerst eine Anlage wählen!");

    const isCOM = (selectedAnlage === "COM");
    const unit = isCOM ? "Kg" : "Stk";
    const box = document.createElement("div");
    box.classList.add("artikel-box");

    // STANDART ALANLAR (PUR ve Spritzguss için sadece bunlar gelir)
    let htmlContent = `
        <button class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <div class="grid">
            <div><label>Artikel</label><input class="artikelBezeichnung" type="text" placeholder="z.B. 15A/01"></div>
            <div><label>Artikelnummer</label><input class="artikelnummerInput" type="text"></div>
        </div>
        <div class="grid" style="margin-top:10px;">
            <div><label>Gutmenge (${unit})</label><input class="gutteileInput" type="number"></div>
            <div><label>Ausschuss (${unit})</label><input class="ausschussInput" type="number"></div>
        </div>`;

    // SADECE COMPOUND İSE SÜRE ALANLARINI EKLE
    if (isCOM) {
        htmlContent += `
        <div class="grid" style="margin-top:10px;">
            <div><label>Dauer inkl. Fehler (Min)</label><input class="artikelDauer" type="number" placeholder="Gesamt"></div>
            <div><label>Davon Störzeit (Min)</label><input class="artikelHata" type="number" placeholder="Störung"></div>
        </div>
        <div style="margin-top:10px;">
            <label>Störungsgrund</label><input class="hataNedeni" type="text" placeholder="Grund">
        </div>`;
    }

    box.innerHTML = htmlContent;
    artikelContainer.appendChild(box);
});

async function speichern() {
    const anlageVal = anlage.value;
    const workers = document.querySelectorAll(".workerSelect");
    const artikels = document.querySelectorAll(".artikel-box");
    const currentUser = localStorage.getItem("schichtb_user") || "Unbekannt";

    if (!anlageVal || workers.length === 0 || artikels.length === 0) {
        return alert("Bitte Anlage, Mitarbeiter und Produktion ausfüllen!");
    }

    let artikelText = "";
    let totalMin = 0;

    artikels.forEach(box => {
        const bez = box.querySelector(".artikelBezeichnung").value;
        const num = box.querySelector(".artikelnummerInput").value;
        const gut = box.querySelector(".gutteileInput").value;
        const aus = box.querySelector(".ausschussInput").value || 0;
        const unit = (anlageVal === "COM") ? "Kg" : "Stk";

        if (anlageVal === "COM") {
            const ges = parseInt(box.querySelector(".artikelDauer").value || 0);
            const hat = parseInt(box.querySelector(".artikelHata").value || 0);
            const ndn = box.querySelector(".hataNedeni").value || "Keine";
            totalMin += ges;
            const netto = ges - hat;
            artikelText += `• ${bez} | G: ${gut}${unit} | A: ${aus}${unit}\n  ⏱️ Toplam: ${ges} Min (Netto: ${netto} | Störung: ${hat} - ${ndn})\n`;
        } else {
            artikelText += `• ${bez} (${num}) | G: ${gut}${unit} | A: ${aus}${unit}\n`;
        }
    });

    // Sadece Compound süresini kontrol et
    if (anlageVal === "COM") {
        const soll = parseInt(document.getElementById("gesamtDauerInput").value || 480);
        if (totalMin !== soll) {
            if(!confirm(`⚠️ ZEIT-WARNUNG!\nEingegebene Gesamtzeit: ${totalMin} Min.\nErwartet (Soll): ${soll} Min.\nTrotzdem senden?`)) return;
        }
    }

    // Seçilen FT'leri al (Sadece PUR için)
    let selectedFTs = "";
    if (anlageVal.startsWith("PUR")) {
        const fts = document.querySelectorAll("#ftBox input[type='checkbox']:checked");
        if(fts.length > 0) {
            selectedFTs = " (FT: " + Array.from(fts).map(cb => cb.parentElement.innerText.trim()).join(", ") + ")";
        }
    }

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: Array.from(workers).map(s => s.value).join(", "),
        anlage: anlageVal + selectedFTs,
        artikel: artikelText,
        sender: currentUser
    };

    // Google Sheets'e gönder
    fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
    
    // WhatsApp Hazırla
    const waText = `📊 *SCHICHTBERICHT*\n👤 *Erstellt von:* ${currentUser}\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n🏭 *Anlage:* ${data.anlage}\n\n📦 *PRODUKTION:*\n${artikelText}`;
    window.location.href = `https://api.whatsapp.com/send?phone=${document.getElementById("waEmpfaenger").value}&text=${encodeURIComponent(waText)}`;
}

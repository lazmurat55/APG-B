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

anlage.addEventListener("change", () => {
    // Sadece Compound ise süre kutusunu göster
    gesamtDauerBox.style.display = (anlage.value === "COM") ? "block" : "none";
    document.getElementById("ftBox").style.display = anlage.value.startsWith("PUR") ? "block" : "none";
    document.getElementById("artikelContainer").innerHTML = ""; // Makine değişince üretim listesini temizle (hata önleme)
});

// Mitarbeiter Ekleme
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    const list = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba N.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];
    let opt = list.map(w => `<option>${w}</option>`).join("");
    const box = document.createElement("div");
    box.classList.add("worker-box");
    box.innerHTML = `<button class="delete-btn">X</button><label>Mitarbeiter</label><select class="workerSelect">${opt}</select>`;
    document.getElementById("workerContainer").appendChild(box);
    box.querySelector(".delete-btn").addEventListener("click", () => box.remove());
});

// Artikel Ekleme
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    if(!anlage.value) return alert("Anlage wählen!");
    const isCOM = (anlage.value === "COM");
    const unit = isCOM ? "Kg" : "Stk";
    const box = document.createElement("div");
    box.classList.add("artikel-box");
    
    // Normal makinelerde SADECE miktar, Compound'da SÜRE kutuları gelir
    box.innerHTML = `
        <button class="delete-btn">X</button>
        <div class="grid">
            <div><label>Artikel</label><input class="artikelBezeichnung" type="text" placeholder="15A/01"></div>
            <div><label>Artikelnummer</label><input class="artikelnummerInput" type="text"></div>
        </div>
        <div class="grid" style="margin-top:10px;">
            <div><label>Gutmenge (${unit})</label><input class="gutteileInput" type="number"></div>
            <div><label>Ausschuss (${unit})</label><input class="ausschussInput" type="number"></div>
        </div>
        ${isCOM ? `
        <div class="grid" style="margin-top:10px;">
            <div><label>Gesamtzeit (Min)</label><input class="artikelDauer" type="number"></div>
            <div><label>Davon Störzeit (Min)</label><input class="artikelHata" type="number"></div>
        </div>
        <div><label>Störungsgrund</label><input class="hataNedeni" type="text"></div>
        ` : ""}
    `;
    document.getElementById("artikelContainer").appendChild(box);
    box.querySelector(".delete-btn").addEventListener("click", () => box.remove());
});

async function speichern() {
    const anlageVal = anlage.value;
    const workers = document.querySelectorAll(".worker-box");
    const artikels = document.querySelectorAll(".artikel-box");
    const currentUser = localStorage.getItem("schichtb_user") || "Unbekannt";

    if (!anlageVal || workers.length === 0 || artikels.length === 0) return alert("Bitte alle Felder füllen!");

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
            artikelText += `• ${bez} | G: ${gut}${unit} | A: ${aus}${unit} | Zeit: ${ges} Min (Hata: ${hat} Min - ${ndn})\n`;
        } else {
            artikelText += `• ${bez} | G: ${gut}${unit} | A: ${aus}${unit}\n`;
        }
    });

    // Sadece Compound'da süre uyarısı ver
    if (anlageVal === "COM") {
        const soll = parseInt(document.getElementById("gesamtDauerInput").value || 480);
        if (totalMin !== soll) confirm(`Warnung: Gesamtzeit ist ${totalMin} Min. Soll: ${soll} Min. Trotzdem senden?`);
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
    const waText = `📊 *SCHICHTBERICHT*\n👤 *Sender:* ${currentUser}\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n🏭 *Anlage:* ${data.anlage}\n\n📦 *PRODUKTION:*\n${artikelText}`;
    window.location.href = `https://api.whatsapp.com/send?phone=${document.getElementById("waEmpfaenger").value}&text=${encodeURIComponent(waText)}`;
}

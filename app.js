// Kendi kopyaladığın URL'yi buraya yapıştır
const scriptURL = "https://script.google.com/macros/s/AKfycbzbtiAY8VPhcc5LjxO1eVEmu-iG3m_d0PP89iFQiVjI6u6JRwXqba36E8fp7fINExorHA/exec";

const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];
const purAusschussCodes = ["P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "C102 CIM nicht voll", "C103 CIM beschädigt", "Sonstige"];
const imAusschussCodes = ["Anfahrschrott", "Teile nicht voll", "Teile gerissen veya beschädigt", "Sonstige"];
const comAusschussCodes = ["Anfahrschrott", "Sonstiger"];

// 1. LOGIN KONTROLÜ
async function loginKontrol() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if(!user || !pass) return alert("Missing info!");
    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("mainForm").style.display = "block";
        } else { alert("Login Error: " + result); }
    } catch (e) { alert("Network Error!"); }
}

// 2. SAYFA YÜKLENİNCE
window.onload = () => {
    if(document.getElementById("datum")) document.getElementById("datum").value = new Date().toISOString().split("T")[0];
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

// 3. MAKİNE SEÇİMİ
document.getElementById("anlage").addEventListener("change", (e) => {
    const isCOM = (e.target.value === "COM");
    const isPUR = e.target.value.startsWith("PUR");
    document.getElementById("gesamtDauerBox").style.display = isCOM ? "block" : "none";
    document.getElementById("ftBox").style.display = isPUR ? "block" : "none";
    document.getElementById("artikelContainer").innerHTML = ""; 
});

// 4. PERSONEL EKLEME
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    const container = document.getElementById("workerContainer");
    const div = document.createElement("div");
    div.className = "worker-box";
    let options = workerList.map(w => `<option value="${w}">${w}</option>`).join("");
    div.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()">X</button>
        <select class="workerSelect">${options}</select>
    `;
    container.appendChild(div);
});

// 5. ARTIKEL EKLEME
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const anlageVal = document.getElementById("anlage").value;
    if(!anlageVal) return alert("Anlage?");
    const container = document.getElementById("artikelContainer");
    const div = document.createElement("div");
    div.className = "artikel-box";
    div.innerHTML = `
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <label>Artikel</label><input class="artBez" type="text">
        <div class="grid">
            <div><label>Gut</label><input class="gut" type="number"></div>
            <div><label>Aus</label><input class="ausTotal" type="number"></div>
        </div>
    `;
    container.appendChild(div);
});

// 6. KAYDET VE GÖNDER
async function speichern() {
    // ÇALIŞANLARI TOPLA (Kritik nokta burası)
    let staffArray = [];
    const selects = document.querySelectorAll(".workerSelect");
    selects.forEach(s => {
        if(s.value) staffArray.push(s.value);
    });
    const staffString = staffArray.join(", ");

    // ÜRETİMİ TOPLA
    let prodText = "";
    const boxes = document.querySelectorAll(".artikel-box");
    boxes.forEach(box => {
        const bez = box.querySelector(".artBez").value;
        const g = box.querySelector(".gut").value || 0;
        const a = box.querySelector(".ausTotal").value || 0;
        prodText += `• ${bez} | G:${g} A:${a}\n`;
    });

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: staffString, // Excel'e gidecek personel listesi
        anlage: document.getElementById("anlage").value,
        artikel: prodText
    };

    try {
        // Excel'e gönder
        fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
        
        // WhatsApp Hazırla
        const sender = localStorage.getItem("schichtb_user");
        const waText = `📊 *SCHICHTBERICHT*\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n🏭 *Anlage:* ${data.anlage}\n👤 *Ekip:* ${staffString}\n👤 *Sender:* ${sender}\n\n📦 *PRODUKTION:*\n${prodText}`;
        const waNumber = document.getElementById("waEmpfaenger").value;
        
        alert("Excel wird gespeichert... WhatsApp öffnet sich.");
        window.location.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
    } catch (e) { alert("Hata!"); }
}

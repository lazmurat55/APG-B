const scriptURL = "https://script.google.com/macros/s/AKfycbzbtiAY8VPhcc5LjxO1eVEmu-iG3m_d0PP89iFQiVjI6u6JRwXqba36E8fp7fINExorHA/exec";

const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];

// SAYFA YÜKLENDİĞİNDE
window.onload = () => {
    document.getElementById("datum").value = new Date().toISOString().split("T")[0];
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

// LOGIN FONKSİYONU
async function loginKontrol() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if(!user || !pass) return alert("Bitte Name und Passwort eingeben!");
    try {
        const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await resp.text();
        if (result === "active") {
            localStorage.setItem("schichtb_user", user);
            location.reload();
        } else { alert("Login Error: " + result); }
    } catch (e) { alert("Verbindungsfehler!"); }
}

// PERSONEL EKLEME BUTONU
document.getElementById("addWorkerBtn").addEventListener("click", () => {
    const container = document.getElementById("workerContainer");
    const div = document.createElement("div");
    div.className = "worker-box";
    let opt = workerList.map(w => `<option value="${w}">${w}</option>`).join("");
    div.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()">X</button>
        <label>Mitarbeiter</label>
        <select class="workerSelect">${opt}</select>
    `;
    container.appendChild(div);
});

// ARTIKEL EKLEME BUTONU
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const container = document.getElementById("artikelContainer");
    const div = document.createElement("div");
    div.className = "artikel-box";
    div.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()">X</button>
        <label>Artikel</label><input class="artBez" type="text">
        <div class="grid">
            <div><label>Gut</label><input class="gut" type="number"></div>
            <div><label>Aus</label><input class="aus" type="number"></div>
        </div>
    `;
    container.appendChild(div);
});

// KAYDET VE GÖNDER
async function speichern() {
    // 1. İSİMLERİ TOPLA (Daha sağlam yöntem)
    let isimler = [];
    let secimler = document.getElementsByClassName("workerSelect");
    for (let i = 0; i < secimler.length; i++) {
        isimler.push(secimler[i].value);
    }
    let personelListesi = isimler.join(", ");

    // 2. ÜRETİMİ TOPLA
    let uretim = "";
    let kutular = document.getElementsByClassName("artikel-box");
    for (let i = 0; i < kutular.length; i++) {
        let ad = kutular[i].querySelector(".artBez").value;
        let g = kutular[i].querySelector(".gut").value || 0;
        let a = kutular[i].querySelector(".aus").value || 0;
        uretim += ad + " (G:" + g + " A:" + a + ") ";
    }

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: personelListesi, // İşte burası Excel'deki C sütununa gider
        anlage: document.getElementById("anlage").value,
        artikel: uretim
    };

    try {
        // Excel'e Gönder
        fetch(scriptURL, { 
            method: "POST", 
            mode: "no-cors", 
            body: JSON.stringify(data) 
        });

        // WhatsApp Hazırla
        const waText = `📊 *BERICHT*\n👤 *Sender:* ${localStorage.getItem("schichtb_user")}\n👥 *Mitarbeiter:* ${personelListesi}\n🏭 *Anlage:* ${data.anlage}\n📦 *Üretim:* ${uretim}`;
        const waNumber = document.getElementById("waEmpfaenger").value;
        
        alert("Daten werden an Excel gesendet...");
        window.location.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
    } catch (e) {
        alert("Hata oluştu!");
    }
}

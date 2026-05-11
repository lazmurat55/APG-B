const scriptURL = "https://script.google.com/macros/s/AKfycbx-MU_xIIVVfDNN378psv9uW5UxT7PvM0_2i1t5T-Ac2QPSbRp9AimWeFBa5B1OYgWg2A/exec";

// --- VERİ LİSTELERİ ---
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba n.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];
const purAusschussCodes = ["P101 Anfahrschrott PUR", "P102 PUR nicht voll", "P103 Schaum beschädigt", "P104 Schaumbild n.i.O.", "P105 Schaumhärtung n.i.O.", "P106 Einlegefehler", "C102 CIM nicht voll", "C103 CIM beschädigt", "Sonstige"];
const imAusschussCodes = ["Anfahrschrott", "Teile nicht voll", "Teile gerissen veya beschädigt", "Sonstige"];
const comAusschussCodes = ["Anfahrschrott", "Sonstiger"];
const purStoerungCodes = ["4-2-01 Werkzeug", "4-2-02 Instandhaltung", "4-2-03 Überdrück", "4-2-04 Mischkopf", "4-2-08 Reinigung", "5-2-01 Logistik", "5-2-06 Unterbesetzung", "Sonstige"];

window.onload = () => {
    document.getElementById("datum").value = new Date().toISOString().split("T")[0];
    if (localStorage.getItem("schichtb_user")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("mainForm").style.display = "block";
    }
};

async function loginKontrol() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if(!user || !pass) return alert("Benutzername/Passwort fehlt!");
    const resp = await fetch(`${scriptURL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
    const res = await resp.text();
    if(res === "active") {
        localStorage.setItem("schichtb_user", user);
        location.reload();
    } else { alert("Login fehlgeschlagen: " + res); }
}

document.getElementById("anlage").addEventListener("change", (e) => {
    document.getElementById("gesamtDauerBox").style.display = e.target.value === "COM" ? "block" : "none";
    document.getElementById("ftBox").style.display = e.target.value.startsWith("PUR") ? "block" : "none";
    document.getElementById("artikelContainer").innerHTML = "";
});

document.getElementById("addWorkerBtn").addEventListener("click", () => {
    const box = document.createElement("div");
    box.className = "worker-box";
    box.innerHTML = `<button type="button" onclick="this.parentElement.remove()">X</button><select class="workerSelect">${workerList.map(w=>`<option>${w}</option>`).join("")}</select>`;
    document.getElementById("workerContainer").appendChild(box);
});

document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const anlageVal = document.getElementById("anlage").value;
    const isCOM = anlageVal === "COM";
    const box = document.createElement("div");
    box.className = "artikel-box";
    box.innerHTML = `
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <label>Artikel</label><input class="artikelBezeichnung" type="text">
        ${isCOM ? '<label>Art.Nummer</label><input class="artikelnummerInput" type="text">' : ''}
        <div class="grid">
            <div><label>Gut</label><input class="gutteileInput" type="number"></div>
            <div><label>Ausschuss Gesamt</label><input class="ausschussInput" type="number"></div>
        </div>
        <div class="ausschuss-container" style="margin-top:10px;"></div>
        <button type="button" class="add-aus-btn" style="background:#8b949e; font-size:11px; margin-bottom:10px;">+ Fire Sebebi (Code)</button>
        <div class="störung-container"></div>
        <button type="button" class="add-störung-btn" style="background:#64748b; font-size:11px;">+ Hata/Duruş</button>
    `;
    document.getElementById("artikelContainer").appendChild(box);

    box.querySelector(".add-aus-btn").addEventListener("click", () => {
        let list = anlageVal.startsWith("PUR") ? purAusschussCodes : (anlageVal.startsWith("IM") || anlageVal === "CIM1" ? imAusschussCodes : comAusschussCodes);
        const row = document.createElement("div");
        row.className = "grid aus-row"; // 'aus-row' class'ı ekledik ki veriyi çekerken bulabilelim
        row.style.marginTop = "5px";
        row.innerHTML = `<select class="ausSelect" style="flex:2">${list.map(c=>`<option>${c}</option>`).join("")}</select><input type="number" class="ausMenge" placeholder="Menge" style="flex:1"><button type="button" onclick="this.parentElement.remove()">X</button>`;
        box.querySelector(".ausschuss-container").appendChild(row);
    });

    box.querySelector(".add-störung-btn").addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "grid stoerung-row";
        row.style.marginTop = "5px";
        if(anlageVal.startsWith("PUR")) {
            row.innerHTML = `<select class="sSelect" style="flex:2">${purStoerungCodes.map(c=>`<option>${c}</option>`).join("")}</select><input type="number" class="sMin" placeholder="Min" style="flex:1"><button type="button" onclick="this.parentElement.remove()">X</button>`;
        } else {
            row.innerHTML = `<input type="text" class="sGrund" placeholder="Hata nedeni" style="flex:2"><input type="number" class="sMin" placeholder="Min" style="flex:1"><button type="button" onclick="this.parentElement.remove()">X</button>`;
        }
        box.querySelector(".störung-container").appendChild(row);
    });
});

async function speichern() {
    const artikels = document.querySelectorAll(".artikel-box");
    if(artikels.length === 0) return alert("Bitte Artikel hinzufügen!");

    let artikelText = "";
    artikels.forEach(box => {
        const bez = box.querySelector(".artikelBezeichnung").value;
        const gut = box.querySelector(".gutteileInput").value || 0;
        const aus = box.querySelector(".ausschussInput").value || 0;
        
        artikelText += `• ${bez} | G:${gut} A:${aus}\n`;

        // FIRE DETAYLARINI TOPLA
        const fireRows = box.querySelectorAll(".aus-row");
        fireRows.forEach(row => {
            const code = row.querySelector(".ausSelect").value;
            const mng = row.querySelector(".ausMenge").value;
            if(mng) {
                artikelText += `  └─ Fire: ${code} (${mng})\n`;
            }
        });

        // DURUŞ DETAYLARINI TOPLA
        const stoerRows = box.querySelectorAll(".stoerung-row");
        stoerRows.forEach(row => {
            let grund = row.querySelector(".sSelect") ? row.querySelector(".sSelect").value : row.querySelector(".sGrund").value;
            const min = row.querySelector(".sMin").value;
            if(min) {
                artikelText += `  └─ ⚠️ Hata: ${grund} (${min} Min)\n`;
            }
        });
    });

    const data = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: [...document.querySelectorAll(".workerSelect")].map(s => s.value).join(", "),
        anlage: document.getElementById("anlage").value,
        artikel: artikelText
    };

    // Google Tabloya Gönder
    fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });

    // Zaman ve WhatsApp
    const simdi = new Date();
    const saat = simdi.getHours().toString().padStart(2, '0') + ":" + simdi.getMinutes().toString().padStart(2, '0');
    const waText = `📊 *SCHICHTBERICHT*\n📅 *Tarih:* ${data.datum}\n🕒 *Vardiya:* ${data.schicht}\n⏰ *Saat:* ${saat}\n🏭 *Makine:* ${data.anlage}\n👤 *Ekip:* ${data.mitarbeiter}\n\n📦 *ÜRETİM:*\n${artikelText}`;
    
    window.location.href = `https://wa.me/${document.getElementById("waEmpfaenger").value}?text=${encodeURIComponent(waText)}`;
}

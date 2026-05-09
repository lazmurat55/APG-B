const scriptURL = "https://script.google.com/macros/s/AKfycbzTluCCUn3xUHuncTLf4aiosQm3M7oZ2SVvqWSuoXLmCyDnHZVgX7o_bE4TIW9R2BtGqA/exec";

// Elementleri Bağla
const datumInput = document.getElementById("datum");
if (datumInput) {
    const heute = new Date().toISOString().split("T")[0];
    datumInput.value = heute;
}

const workerContainer = document.getElementById("workerContainer");
const addWorkerBtn = document.getElementById("addWorkerBtn");
const anlage = document.getElementById("anlage");
const ftBox = document.getElementById("ftBox");
const artikelContainer = document.getElementById("artikelContainer");
const addArtikelBtn = document.getElementById("addArtikelBtn");
const stoerungContainer = document.getElementById("stoerungContainer");
const addStoerungBtn = document.getElementById("addStoerungBtn");

// Veri Listeleri (Senin Orijinal Listelerin)
const workerList = ["Aldirmaz P.-577", "Anderwald R.-509 E", "Bayrakli F.-1377 E", "Kilic D.-1384 E", "Maafi T.-1273 E", "Besche T.-1472", "Eickhoff P.-1406", "Toth Renata-1699", "Gibba N.-1367", "Helf A.-1483", "Isbir J.-1715", "Jeyakumar S.-1698", "Kalisch T.-1451", "Keskin Mur.-517", "Kowarsch R.-484", "Nowak M.-1390", "Pähler D.-1332", "Patarcsity V.-1700", "Pulendran K.-1498", "Sahin E.-1721", "Savas S.-1360", "Schiavitelli C.-1669", "Uluyüz B.-1450", "Uzun S.-1433", "Klomrit Thanin-1070", "Garcia-Hervas Francisco-339", "Sonstige"];
const purCodes = ["P101-Anfahrschrott PUR", "P102-PUR nicht voll", "P103-Schaum beschädigt", "P104-Schaumbild n.i.O.", "P105-Schaumhärtung n.i.O.", "P106-Einlegefehler"];
const cimCodes = ["C102-CIM nicht voll", "C103-CIM beschädigt", "01-Anfahrschrott", "02-HF Teile nicht voll", "03-HF gerissen"];
const imCodes = ["01-Anfahrschrott", "02-HF Teile nicht voll", "03-HF gerissen"];
const stoerungCodes = ["4-2-01 Werkzeug", "4-2-02 Ungepl. Instandhaltung", "4-2-03 POLY / SO Überdruck", "4-2-04 Mischkopf n.i.O.", "4-2-05 Fehler Lichtschranke", "4-2-06 Trennmittelpistole verstopft/defekt", "4-2-07 Formträger Fehler", "4-2-08 Reinigung Werkzeug", "4-2-09 Not Aus", "5-2-01 Logistik Fehler", "5-2-02 Warten auf Teile", "5-2-06 Personalmangel", "5-2-08 Kein Leergut", "Sonstige"];

// Fonksiyonlar ve Event Listeners
if (anlage) {
    anlage.addEventListener("change", function(){
        artikelContainer.innerHTML = "";
        ftBox.style.display = anlage.value.startsWith("PUR") ? "block" : "none";
    });
}

addWorkerBtn.addEventListener("click", function(){
    let options = workerList.map(w => `<option>${w}</option>`).join("");
    const box = document.createElement("div");
    box.classList.add("worker-box");
    box.innerHTML = `<button class="delete-btn">X</button><label>Mitarbeiter</label><select class="workerSelect">${options}</select><input class="extraWorker" type="text" placeholder="Name eingeben" style="display:none; margin-top:10px;">`;
    workerContainer.appendChild(box);
    const select = box.querySelector(".workerSelect");
    const extra = box.querySelector(".extraWorker");
    select.addEventListener("change", () => extra.style.display = select.value === "Sonstige" ? "block" : "none");
    box.querySelector(".delete-btn").addEventListener("click", () => box.remove());
});

addArtikelBtn.addEventListener("click", function(){
    if(!anlage.value) return alert("Bitte zuerst Anlage wählen");
    let codes = anlage.value.startsWith("PUR") ? purCodes : (anlage.value === "CIM1" ? cimCodes : imCodes);
    let options = codes.map(c => `<option>${c}</option>`).join("");
    const box = document.createElement("div");
    box.classList.add("artikel-box");
    box.innerHTML = `<button class="delete-btn">X</button><label>Artikelnummer</label><input class="artikelnummerInput" type="text"><div class="grid"><div><label>Gutteile</label><input class="gutteileInput" type="number"></div><div><label>Ausschuss</label><input class="ausschussGesamt" type="number"></div></div><div class="fehlerBox" style="display:none;"><div class="fehlerContainer"></div><button class="addFehlerBtn" type="button">+ Fehlercode</button><p class="fehlerWarnung" style="color:red; display:none;">Summe n.i.O.!</p></div>`;
    artikelContainer.appendChild(box);
    const ausschuss = box.querySelector(".ausschussGesamt");
    const fehlerBox = box.querySelector(".fehlerBox");
    const fehlerContainer = box.querySelector(".fehlerContainer");
    ausschuss.addEventListener("input", () => {
        fehlerBox.style.display = ausschuss.value > 0 ? "block" : "none";
        checkFehler(box);
    });
    box.querySelector(".addFehlerBtn").addEventListener("click", () => {
        const row = document.createElement("div");
        row.classList.add("grid");
        row.style.marginTop = "10px";
        row.innerHTML = `<div><select class="fehlerSelect">${options}</select></div><div><input class="fehlerMenge" type="number" placeholder="Anzahl"></div>`;
        fehlerContainer.appendChild(row);
        row.querySelector(".fehlerMenge").addEventListener("input", () => checkFehler(box));
    });
    box.querySelector(".delete-btn").addEventListener("click", () => box.remove());
});

function checkFehler(box) {
    let gesamt = Number(box.querySelector(".ausschussGesamt").value);
    let summe = 0;
    box.querySelectorAll(".fehlerMenge").forEach(i => summe += Number(i.value));
    box.querySelector(".fehlerWarnung").style.display = (summe === gesamt) ? "none" : "block";
}

addStoerungBtn.addEventListener("click", function(){
    const box = document.createElement("div");
    box.classList.add("stoerung-box");
    if(anlage.value.startsWith("PUR")){
        let opts = stoerungCodes.map(c => `<option>${c}</option>`).join("");
        box.innerHTML = `<button class="delete-btn">X</button><label>Störungscode</label><select class="stoerung-select">${opts}</select><input class="extra-stoerung" type="text" style="display:none; margin-top:10px;"><label>Dauer (Min)</label><input class="stoerungZeit" type="number">`;
        const sel = box.querySelector(".stoerung-select");
        const extra = box.querySelector(".extra-stoerung");
        sel.addEventListener("change", () => extra.style.display = sel.value === "Sonstige" ? "block" : "none");
    } else {
        box.innerHTML = `<button class="delete-btn">X</button><label>Störung</label><input class="stoerungText" type="text"><label>Dauer (Min)</label><input class="stoerungZeit" type="number">`;
    }
    stoerungContainer.appendChild(box);
    box.querySelector(".delete-btn").addEventListener("click", () => box.remove());
});

// ANA KAYIT VE WHATSAPP FONKSİYONU
function speichern(){
    if(!anlage.value || document.querySelectorAll(".worker-box").length === 0) return alert("Fehlende Daten!");
    
    // 1. Veri Toplama
    let mitarbeiter = [];
    document.querySelectorAll(".worker-box").forEach(box => {
        const s = box.querySelector(".workerSelect");
        mitarbeiter.push(s.value === "Sonstige" ? box.querySelector(".extraWorker").value : s.value);
    });

    let ftListe = [];
    document.querySelectorAll('#ftBox input[type="checkbox"]:checked').forEach(ft => ftListe.push(ft.parentElement.innerText.trim()));
    
    let artikelText = "";
    document.querySelectorAll(".artikel-box").forEach(box => {
        artikelText += `• Art: ${box.querySelector(".artikelnummerInput").value} | G: ${box.querySelector(".gutteileInput").value} | A: ${box.querySelector(".ausschussGesamt").value}\n`;
        box.querySelectorAll(".fehlerContainer .grid").forEach(row => {
            artikelText += `  └─ ${row.querySelector(".fehlerSelect").value}: ${row.querySelector(".fehlerMenge").value}\n`;
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

    // 2. Excel'e Kayıt (Fetch)
    fetch(scriptURL, { 
        method: "POST", 
        mode: "no-cors", // Bu önemli: CORS hatası almamak için
        body: JSON.stringify(data) 
    });

    // 3. WhatsApp Yönlendirme (Engelleri Aşan Yöntem)
    const waEmpfaenger = document.getElementById("waEmpfaenger").value;
    const waText = `📊 *SCHICHTBERICHT*\n\n📅 *Datum:* ${data.datum}\n🕒 *Schicht:* ${data.schicht}\n👷 *Team:* ${data.mitarbeiter}\n🏭 *Anlage:* ${data.anlage}\n\n📦 *PRODUKTION:*\n${artikelText}\n⚠️ *STÖRUNGEN:*\n${stoerungText}`;
    
    // api.whatsapp.com linki daha güvenilirdir
    const waURL = `https://api.whatsapp.com/send?phone=${waEmpfaenger}&text=${encodeURIComponent(waText)}`;

    alert("Gespeichert! WhatsApp wird geöffnet...");
    
    // window.open yerine mevcut sayfayı yönlendiriyoruz (Kesin çözüm)
    window.location.href = waURL;
}

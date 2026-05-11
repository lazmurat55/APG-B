// --- ARTIKEL EKLEME (GÜNCELLENDİ) ---
document.getElementById("addArtikelBtn").addEventListener("click", () => {
    const anlageVal = document.getElementById("anlage").value;
    if(!anlageVal) return alert("Bitte zuerst Anlage wählen!");

    const container = document.getElementById("artikelContainer");
    const div = document.createElement("div");
    div.className = "artikel-box";
    
    div.innerHTML = `
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">X</button>
        <label>Artikelbezeichnung</label><input class="artBez" type="text">
        <div class="grid">
            <div><label>Gutmenge</label><input class="gut" type="number"></div>
            <div><label>Ausschuss Gesamt</label><input class="aus" type="number"></div>
        </div>
        <div class="ausschuss-detail-area" style="margin-top:10px;"></div>
        <button type="button" class="add-aus-btn" style="background:#8b949e; font-size:11px;">+ Ausschuss-Code</button>
        
        <div class="stoerung-detail-area" style="margin-top:10px; border-top:1px solid #ddd; padding-top:5px;"></div>
        <button type="button" class="add-stoer-btn" style="background:#64748b; font-size:11px;">+ Störung hinzufügen</button>
    `;
    container.appendChild(div);

    // Ausschuss-Code satırı ekleme
    div.querySelector(".add-aus-btn").addEventListener("click", () => {
        const area = div.querySelector(".ausschuss-detail-area");
        const row = document.createElement("div");
        row.className = "grid aus-row"; // 'aus-row' ismiyle işaretledik
        let liste = anlageVal.startsWith("PUR") ? purAusschussCodes : (anlageVal.startsWith("IM") || anlageVal === "CIM1" ? imAusschussCodes : comAusschussCodes);
        row.innerHTML = `
            <select class="ausCode" style="flex:2">${liste.map(c => `<option value="${c}">${c}</option>`).join("")}</select>
            <input type="number" class="ausMenge" placeholder="Menge" style="flex:1">
            <button type="button" onclick="this.parentElement.remove()">X</button>
        `;
        area.appendChild(row);
    });

    // Störung satırı ekleme
    div.querySelector(".add-stoer-btn").addEventListener("click", () => {
        const area = div.querySelector(".stoerung-detail-area");
        const row = document.createElement("div");
        row.className = "grid stoer-row"; // 'stoer-row' ismiyle işaretledik
        if(anlageVal.startsWith("PUR")) {
            row.innerHTML = `
                <select class="stoerCode" style="flex:2">${purStoerungCodes.map(c => `<option value="${c}">${c}</option>`).join("")}</select>
                <input type="number" class="stoerMin" placeholder="Min" style="flex:1">
                <button type="button" onclick="this.parentElement.remove()">X</button>
            `;
        } else {
            row.innerHTML = `
                <input type="text" class="stoerGrund" placeholder="Grund" style="flex:2">
                <input type="number" class="stoerMin" placeholder="Min" style="flex:1">
                <button type="button" onclick="this.parentElement.remove()">X</button>
            `;
        }
        area.appendChild(row);
    });
});

// --- KAYDETME FONKSİYONU (Kritik Düzeltme) ---
async function speichern() {
    let workerArray = [];
    let workerSelects = document.querySelectorAll(".workerSelect");
    workerSelects.forEach(s => workerArray.push(s.value));
    let mitarbeiterListe = workerArray.join(", ");

    let produktionInfo = "";
    let artikelBoxes = document.querySelectorAll(".artikel-box");
    
    artikelBoxes.forEach(box => {
        let name = box.querySelector(".artBez").value;
        let g = box.querySelector(".gut").value || 0;
        let aTotal = box.querySelector(".aus").value || 0;
        
        produktionInfo += `• ${name} (G:${g} A:${aTotal})\n`;

        // Seçilen her bir fire kodunu tek tek oku
        let ausRows = box.querySelectorAll(".aus-row");
        ausRows.forEach(row => {
            let code = row.querySelector(".ausCode").value;
            let menge = row.querySelector(".ausMenge").value;
            if(menge) {
                produktionInfo += `  └─ Ausschuss: ${code} (${menge})\n`;
            }
        });

        // Seçilen her bir hatayı tek tek oku
        let stoerRows = box.querySelectorAll(".stoer-row");
        stoerRows.forEach(row => {
            let grund = row.querySelector(".stoerCode") ? row.querySelector(".stoerCode").value : row.querySelector(".stoerGrund").value;
            let min = row.querySelector(".stoerMin").value;
            if(min) {
                produktionInfo += `  └─ ⚠️ Störung: ${grund} (${min} Min)\n`;
            }
        });
    });

    const reportData = {
        datum: document.getElementById("datum").value,
        schicht: document.getElementById("schicht").value,
        mitarbeiter: mitarbeiterListe,
        anlage: document.getElementById("anlage").value,
        artikel: produktionInfo
    };

    try {
        // Excel Gönderimi
        fetch(scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(reportData) });
        
        // WhatsApp Hazırlığı
        const waText = `📊 *SCHICHTBERICHT*\n👤 *Sender:* ${localStorage.getItem("schichtb_user")}\n👥 *Mitarbeiter:* ${mitarbeiterListe}\n🏭 *Anlage:* ${reportData.anlage}\n\n📦 *PRODUKTION:*\n${produktionInfo}`;
        const waNum = document.getElementById("waEmpfaenger").value;
        
        window.location.href = `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}`;
    } catch (e) {
        alert("Fehler beim Speichern!");
    }
}

// Ağlama kayıtları
const cryingData = [
    { date: '2 Ocak', intensity: 'orta', reason: 'Bilinmiyor' },
    { date: '7 Ocak', intensity: 'hafif', reason: 'Bilinmiyor' },
    { date: '13 Ocak', intensity: 'şiddetli-orta', reason: 'Ders içindi' },
    { date: '15 Ocak', intensity: 'orta', reason: 'Bilinmiyor' }
];

// Şiddet dağılımını hesapla
const intensityCounts = {
    'hafif': cryingData.filter(d => d.intensity === 'hafif').length,
    'orta': cryingData.filter(d => d.intensity === 'orta').length,
    'şiddetli-orta': cryingData.filter(d => d.intensity === 'şiddetli-orta').length
};

// Emoji karşılıkları
const intensityEmojis = {
    'hafif': '😢',
    'orta': '😭',
    'şiddetli-orta': '😫'
};

// Pasta grafiğini oluştur
const intensityCtx = document.getElementById('intensityChart').getContext('2d');
const intensityChart = new Chart(intensityCtx, {
    type: 'pie',
    data: {
        labels: Object.keys(intensityCounts),
        datasets: [{
            data: Object.values(intensityCounts),
            backgroundColor: [
                '#32CD32', // Yeşil - hafif için
                '#FFD700', // Sarı - orta için
                '#FF0000'  // Kırmızı - şiddetli için
            ]
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Ağlama Şiddet Dağılımı',
                font: { size: 16 }
            }
        }
    }
});

// Zaman çizelgesi grafiğini oluştur
const timelineCtx = document.getElementById('timelineChart').getContext('2d');
const timelineChart = new Chart(timelineCtx, {
    type: 'bar',
    data: {
        labels: cryingData.map(d => d.date),
        datasets: [{
            label: 'Ağlama Kayıtları',
            data: cryingData.map(d => {
                switch(d.intensity) {
                    case 'hafif': return 1;
                    case 'orta': return 2;
                    case 'şiddetli-orta': return 3;
                    default: return 0;
                }
            }),
            backgroundColor: '#FFD700', // Sarı
            borderColor: '#FF8C00',     // Koyu turuncu
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Ağlama Zaman Çizelgesi',
                font: { size: 16 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 3,
                ticks: {
                    callback: function(value) {
                        return ['', 'Hafif', 'Orta', 'Şiddetli'][value];
                    }
                }
            }
        }
    }
});

// Tabloyu güncelle
function updateTable() {
    const tableBody = document.getElementById('cryingTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    
    // Tarihe göre sırala (en yeniden en eskiye)
    const sortedData = [...cryingData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedData.forEach((data, index) => {
        const row = tableBody.insertRow();
        
        // Tarih hücresi
        row.insertCell().textContent = data.date;
        
        // Şiddet hücresi (emoji ile)
        const intensityCell = row.insertCell();
        intensityCell.textContent = `${data.intensity} ${intensityEmojis[data.intensity]}`;
        
        // Sebep hücresi
        row.insertCell().textContent = data.reason;
        
        // İşlemler hücresi
        const actionsCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️ Sil';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => deleteEntry(index);
        actionsCell.appendChild(deleteButton);
    });
}

// PDF'e aktar
async function exportToPDF() {
    const pdfContent = document.getElementById('pdfContent');
    const date = new Date().toLocaleDateString('tr-TR');
    
    // PDF içeriğini hazırla
    const element = document.createElement('div');
    element.innerHTML = `
        <div style="padding: 20px;">
            <h1 style="text-align: center;">Ağlama Günlüğü Raporu</h1>
            <p style="text-align: right;">Tarih: ${date}</p>
            
            <h2>Özet Bilgiler</h2>
            <p>Toplam Ağlama Sayısı: ${cryingData.length}</p>
            <p>Hafif Ağlama: ${intensityCounts.hafif}</p>
            <p>Orta Ağlama: ${intensityCounts.orta}</p>
            <p>Şiddetli Ağlama: ${intensityCounts['şiddetli-orta']}</p>
            
            <h2>Detaylı Kayıtlar</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px;">Tarih</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Şiddet</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Sebep</th>
                    </tr>
                </thead>
                <tbody>
                    ${cryingData.map(data => `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${data.date}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${data.intensity}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${data.reason}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // PDF seçenekleri
    const opt = {
        margin: 1,
        filename: `aglama_gunlugu_${date.replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // PDF oluştur ve indir
    try {
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error('PDF oluşturulurken hata:', error);
        alert('PDF oluşturulurken bir hata oluştu!');
    }
}

// Kayıt silme fonksiyonu
function deleteEntry(index) {
    const deletedEntry = cryingData[index];
    cryingData.splice(index, 1);
    intensityCounts[deletedEntry.intensity]--;
    
    // Grafikleri güncelle
    updateCharts();
    // Tabloyu güncelle
    updateTable();
    // Kullanıcı verilerini kaydet
    saveData();
}

// Grafikleri güncelle
function updateCharts() {
    // Pasta grafiğini güncelle
    intensityChart.data.datasets[0].data = Object.values(intensityCounts);
    intensityChart.update();
    
    // Zaman çizelgesini güncelle
    timelineChart.data.labels = cryingData.map(d => d.date);
    timelineChart.data.datasets[0].data = cryingData.map(d => {
        switch(d.intensity) {
            case 'hafif': return 1;
            case 'orta': return 2;
            case 'şiddetli-orta': return 3;
            default: return 0;
        }
    });
    timelineChart.update();
}

// Her veri değişikliğinde kullanıcı verilerini kaydet
function saveData() {
    if (userManager && userManager.currentUser) {
        userManager.saveUserData(cryingData, customReasons);
    }
}

// Form gönderimini dinle
document.getElementById('cryingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Tarihi Türkçe formatla
    const dateInput = document.getElementById('date').value;
    const date = new Date(dateInput);
    const turkishDate = date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long'
    });
    
    const intensity = document.getElementById('intensity').value;
    const reason = document.getElementById('reason').value || 'Bilinmiyor';
    
    // Yeni veriyi ekle
    cryingData.push({ date: turkishDate, intensity, reason });
    
    // Grafikleri güncelle
    intensityCounts[intensity] = (intensityCounts[intensity] || 0) + 1;
    updateCharts();
    
    // Tabloyu güncelle
    updateTable();
    
    // Kullanıcı verilerini kaydet
    saveData();
    
    // Formu temizle
    event.target.reset();
});

// PDF export butonunu dinle
document.getElementById('exportPDF').addEventListener('click', exportToPDF);

// Sebep seçimi işlemleri
document.getElementById('reasonSelect').addEventListener('change', function(e) {
    const category = e.target.value;
    const reasonInput = document.getElementById('reason');
    
    if (category && commonReasons[category]) {
        const randomReason = commonReasons[category][Math.floor(Math.random() * commonReasons[category].length)];
        reasonInput.value = randomReason;
    }
});

document.getElementById('customReasonSelect').addEventListener('change', function(e) {
    const selectedReason = e.target.value;
    if (selectedReason) {
        document.getElementById('reason').value = selectedReason;
    }
});

document.getElementById('addReason').addEventListener('click', function() {
    const reasonInput = document.getElementById('reason');
    const newReason = reasonInput.value.trim();
    
    if (newReason) {
        addCustomReason(newReason);
        reasonInput.value = '';
        
        // Bildirim göster
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = 'Yeni sebep eklendi!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});

// İlk yükleme
updateTable();

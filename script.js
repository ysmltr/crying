// Verileri localStorage'dan al veya boş bir array oluştur
let cryingData = JSON.parse(localStorage.getItem('cryingData')) || [];

// Global değişkenler
let intensityChart = null;
let timelineChart = null;

// Tarihi DD.MM.YYYY formatına çevir
function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
}

// YYYY-MM-DD formatını DD.MM.YYYY formatına çevir
function convertDateFormat(dateStr) {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month}-${day}`;
}

// Grafikleri güncelle
function updateCharts() {
    // Şiddet sayılarını hesapla
    const intensityCounts = {
        'hafif': cryingData.filter(d => d.intensity === 'hafif').length,
        'orta': cryingData.filter(d => d.intensity === 'orta').length,
        'siddetli': cryingData.filter(d => d.intensity === 'siddetli').length
    };

    // Toplam kayıt sayısını hesapla
    const total = Object.values(intensityCounts).reduce((a, b) => a + b, 0);

    // Yüzdeleri hesapla
    const percentages = {
        'hafif': total > 0 ? Math.round((intensityCounts.hafif / total) * 100) : 0,
        'orta': total > 0 ? Math.round((intensityCounts.orta / total) * 100) : 0,
        'siddetli': total > 0 ? Math.round((intensityCounts.siddetli / total) * 100) : 0
    };

    // Pasta grafik
    const intensityCtx = document.getElementById('intensityChart').getContext('2d');
    if (intensityChart) {
        intensityChart.destroy();
    }
    intensityChart = new Chart(intensityCtx, {
        type: 'pie',
        data: {
            labels: [
                `Hafif (%${percentages.hafif})`,
                `Orta (%${percentages.orta})`,
                `Şiddetli (%${percentages.siddetli})`
            ],
            datasets: [{
                data: Object.values(intensityCounts),
                backgroundColor: [
                    '#32CD32', // Yeşil - hafif
                    '#FFD700', // Sarı - orta
                    '#FF0000'  // Kırmızı - şiddetli
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

    // Zaman çizelgesi grafik
    const timelineCtx = document.getElementById('timelineChart').getContext('2d');
    if (timelineChart) {
        timelineChart.destroy();
    }
    timelineChart = new Chart(timelineCtx, {
        type: 'bar',
        data: {
            labels: cryingData.map(d => formatDate(d.date)),
            datasets: [{
                label: 'Ağlama Kayıtları',
                data: cryingData.map(d => {
                    switch(d.intensity) {
                        case 'hafif': return 1;
                        case 'orta': return 2;
                        case 'siddetli': return 3;
                        default: return 0;
                    }
                }),
                backgroundColor: '#FFD700',
                borderColor: '#FF8C00',
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
}

// Tabloyu güncelle
function updateTable() {
    const tbody = document.querySelector('#cryingTable tbody');
    tbody.innerHTML = '';
    
    // Tarihe göre sırala (en yeniden en eskiye)
    const sortedData = [...cryingData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedData.forEach((data, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(data.date)}</td>
            <td>${data.intensity}</td>
            <td>${data.reason || 'Belirtilmedi'}</td>
            <td>
                <button onclick="deleteEntry(${index})" class="delete-btn">Sil</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Kayıt silme
function deleteEntry(index) {
    cryingData.splice(index, 1);
    localStorage.setItem('cryingData', JSON.stringify(cryingData));
    updateCharts();
    updateTable();
}

// Form gönderimini dinle
document.getElementById('cryingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const dateInput = document.getElementById('date');
    const dateValue = dateInput.value; // YYYY-MM-DD formatında

    // Yeni kayıt oluştur
    const newEntry = {
        date: dateValue,
        intensity: document.getElementById('intensity').value,
        reason: document.getElementById('reason').value
    };
    
    // Kayıt ekle ve localStorage'a kaydet
    cryingData.push(newEntry);
    localStorage.setItem('cryingData', JSON.stringify(cryingData));
    
    // Formu temizle
    this.reset();
    
    // Grafikleri ve tabloyu güncelle
    updateCharts();
    updateTable();
});

// Date input'un değeri değiştiğinde formatı düzelt
document.getElementById('date').addEventListener('change', function(e) {
    const date = new Date(this.value);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Input değerini güncelle
    this.value = `${year}-${month}-${day}`;
});

// Sayfa yüklendiğinde grafikleri ve tabloyu göster
document.addEventListener('DOMContentLoaded', function() {
    // Bugünün tarihini ayarla
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    document.getElementById('date').value = `${year}-${month}-${day}`;
    
    updateCharts();
    updateTable();
});

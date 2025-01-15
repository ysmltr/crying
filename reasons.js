// Yaygın ağlama sebepleri
const commonReasons = {
    'Duygusal': [
        'Özlem',
        'Üzüntü',
        'Mutluluk gözyaşları',
        'Yalnızlık',
        'Stres'
    ],
    'Akademik': [
        'Sınav stresi',
        'Düşük not',
        'Ders yoğunluğu',
        'Ödev stresi'
    ],
    'İlişkiler': [
        'Arkadaş problemi',
        'Aile problemi',
        'Romantik ilişki',
        'Tartışma'
    ],
    'Sağlık': [
        'Yorgunluk',
        'Ağrı',
        'Hastalık'
    ],
    'Medya': [
        'Film/Dizi',
        'Kitap',
        'Müzik',
        'Sosyal medya'
    ]
};

// Kullanıcı tarafından eklenen sebepler
let customReasons = [];

// Yeni sebep ekle
function addCustomReason(reason) {
    if (!customReasons.includes(reason)) {
        customReasons.push(reason);
        updateReasonSelectors();
        saveCustomReasons();
    }
}

// Özel sebepleri localStorage'a kaydet
function saveCustomReasons() {
    localStorage.setItem('customReasons', JSON.stringify(customReasons));
}

// Özel sebepleri localStorage'dan yükle
function loadCustomReasons() {
    const saved = localStorage.getItem('customReasons');
    if (saved) {
        customReasons = JSON.parse(saved);
    }
}

// Sebep seçicilerini güncelle
function updateReasonSelectors() {
    const reasonSelect = document.getElementById('reasonSelect');
    const customSelect = document.getElementById('customReasonSelect');
    
    if (reasonSelect && customSelect) {
        // Ana kategorileri ekle
        reasonSelect.innerHTML = '<option value="">Kategori Seç</option>';
        Object.keys(commonReasons).forEach(category => {
            reasonSelect.innerHTML += `<option value="${category}">${category}</option>`;
        });

        // Özel sebepleri ekle
        customSelect.innerHTML = '<option value="">Özel Sebepler</option>';
        customReasons.forEach(reason => {
            customSelect.innerHTML += `<option value="${reason}">${reason}</option>`;
        });
    }
}

// Sayfa yüklendiğinde özel sebepleri yükle
document.addEventListener('DOMContentLoaded', () => {
    loadCustomReasons();
    updateReasonSelectors();
});

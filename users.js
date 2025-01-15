// Kullanıcı yönetimi
class UserManager {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.loadCurrentUser();
    }

    // Kullanıcıları yükle
    loadUsers() {
        const savedUsers = localStorage.getItem('users');
        return savedUsers ? JSON.parse(savedUsers) : {};
    }

    // Mevcut kullanıcıyı yükle
    loadCurrentUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = savedUser;
            this.updateUIForUser();
        }
    }

    // Yeni kullanıcı oluştur
    createUser(username) {
        if (!username.trim()) return false;
        
        const users = this.loadUsers();
        if (users[username]) {
            alert('Bu kullanıcı adı zaten kullanılıyor!');
            return false;
        }

        users[username] = {
            cryingData: [],
            customReasons: [],
            created: new Date().toISOString()
        };

        localStorage.setItem('users', JSON.stringify(users));
        this.switchUser(username);
        return true;
    }

    // Kullanıcı değiştir
    switchUser(username) {
        const users = this.loadUsers();
        if (users[username]) {
            this.currentUser = username;
            localStorage.setItem('currentUser', username);
            this.updateUIForUser();
            return true;
        }
        return false;
    }

    // Kullanıcının verilerini kaydet
    saveUserData(cryingData, customReasons) {
        if (!this.currentUser) return;

        const users = this.loadUsers();
        users[this.currentUser] = {
            ...users[this.currentUser],
            cryingData,
            customReasons,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem('users', JSON.stringify(users));
    }

    // Kullanıcının verilerini getir
    getUserData() {
        if (!this.currentUser) return null;

        const users = this.loadUsers();
        return users[this.currentUser];
    }

    // UI'ı güncelle
    updateUIForUser() {
        const userDisplay = document.getElementById('currentUser');
        const userData = this.getUserData();
        
        if (userDisplay && userData) {
            userDisplay.textContent = this.currentUser;
            
            // Verileri yükle
            window.cryingData = userData.cryingData || [];
            window.customReasons = userData.customReasons || [];
            
            // Grafikleri ve tabloyu güncelle
            if (typeof updateCharts === 'function') updateCharts();
            if (typeof updateTable === 'function') updateTable();
        }
    }

    // Kullanıcı listesini getir
    getUserList() {
        return Object.keys(this.loadUsers());
    }
}

// Kullanıcı yöneticisini oluştur
const userManager = new UserManager();

// Kullanıcı değiştirme modalını göster
function showUserModal() {
    const users = userManager.getUserList();
    const modalContent = document.createElement('div');
    modalContent.innerHTML = `
        <div class="user-modal">
            <h2>Kullanıcı Seç veya Oluştur</h2>
            <div class="user-list">
                ${users.map(user => `
                    <button onclick="userManager.switchUser('${user}')" class="user-btn">
                        ${user}
                    </button>
                `).join('')}
            </div>
            <div class="new-user">
                <input type="text" id="newUsername" placeholder="Yeni kullanıcı adı">
                <button onclick="createNewUser()">Oluştur</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalContent);
}

// Yeni kullanıcı oluştur
function createNewUser() {
    const input = document.getElementById('newUsername');
    const username = input.value.trim();
    
    if (userManager.createUser(username)) {
        const modal = document.querySelector('.user-modal');
        if (modal) modal.remove();
    }
}

// Sayfa yüklendiğinde kullanıcı kontrolü
document.addEventListener('DOMContentLoaded', () => {
    if (!userManager.currentUser) {
        showUserModal();
    }
});

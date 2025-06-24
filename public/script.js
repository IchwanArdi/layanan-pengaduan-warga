// Initialize Lucide Icons
lucide.createIcons();

// Sidebar functionality
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('-translate-x-full');
}

// Tab functionality
function showTab(tabName) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach((content) => {
    content.classList.add('hidden');
  });

  // Show selected tab content
  const selectedTab = document.getElementById(tabName + '-content');
  if (selectedTab) {
    selectedTab.classList.remove('hidden');
    selectedTab.classList.add('fade-in');
  }

  // Update sidebar active state
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  sidebarItems.forEach((item) => {
    item.classList.remove('bg-blue-50', 'text-blue-600', 'border-r-4', 'border-blue-600');
    item.classList.add('text-gray-700', 'hover:bg-gray-50');
  });

  const activeItem = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeItem) {
    activeItem.classList.remove('text-gray-700', 'hover:bg-gray-50');
    activeItem.classList.add('bg-blue-50', 'text-blue-600', 'border-r-4', 'border-blue-600');
  }

  // Update page title
  const pageTitles = {
    dashboard: 'Dashboard',
    documents: 'Layanan Dokumen',
    complaints: 'Pengaduan',
    profile: 'Profil',
  };

  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle && pageTitles[tabName]) {
    pageTitle.textContent = pageTitles[tabName];
  }

  // Close sidebar on mobile after selection
  if (window.innerWidth < 1024) {
    toggleSidebar();
  }
}

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  const darkModeBtn = document.getElementById('darkModeBtn');
  const icon = darkModeBtn.querySelector('i');

  if (document.body.classList.contains('dark')) {
    icon.setAttribute('data-lucide', 'sun');
  } else {
    icon.setAttribute('data-lucide', 'moon');
  }

  lucide.createIcons();
}

// Form submissions
document.getElementById('documentForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData);

  // Validate required fields
  if (!data.type || !data.name || !data.nik || !data.phone || !data.address || !data.purpose) {
    alert('Semua field wajib diisi!');
    return;
  }

  // Submit form
  fetch('/dokumen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(data),
  })
    .then((response) => {
      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Terjadi kesalahan saat mengirim data');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengirim pengajuan dokumen');
    });
});

document.getElementById('complaintForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = {
    judul: formData.get('judul'),
    kategori: formData.get('kategori'),
    lokasi: formData.get('lokasi'),
    deskripsi: formData.get('deskripsi'),
  };

  // Validate required fields
  if (!data.judul || !data.kategori || !data.lokasi || !data.deskripsi) {
    alert('Semua field wajib diisi!');
    return;
  }

  // Submit form
  fetch('/pengaduan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(data),
  })
    .then((response) => {
      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Terjadi kesalahan saat mengirim data');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengirim pengaduan');
    });
});

// Close alert function
function closeAlert(alertId) {
  const alert = document.getElementById(alertId);
  if (alert) {
    alert.style.display = 'none';
  }
}

// Auto-hide alerts after 5 seconds
setTimeout(function () {
  const alerts = document.querySelectorAll('[id$="Alert"]');
  alerts.forEach((alert) => {
    if (alert) {
      alert.style.display = 'none';
    }
  });
}, 5000);

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function (e) {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.querySelector('[onclick="toggleSidebar()"]');

  if (window.innerWidth < 1024 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && !sidebar.classList.contains('-translate-x-full')) {
    toggleSidebar();
  }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
  lucide.createIcons();
  showTab('dashboard'); // Show dashboard by default
});

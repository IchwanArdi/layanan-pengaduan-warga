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
    const sidebar = document.getElementById('sidebar');
    if (!sidebar.classList.contains('-translate-x-full')) {
      toggleSidebar();
    }
  }
}

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  const darkModeBtn = document.getElementById('darkModeBtn');
  if (darkModeBtn) {
    const icon = darkModeBtn.querySelector('i');
    if (icon) {
      if (document.body.classList.contains('dark')) {
        icon.setAttribute('data-lucide', 'sun');
      } else {
        icon.setAttribute('data-lucide', 'moon');
      }
    }
  }
  lucide.createIcons();
}

// Form submissions
document.addEventListener('DOMContentLoaded', function () {
  const documentForm = document.getElementById('documentForm');
  if (documentForm) {
    documentForm.addEventListener('submit', function (e) {
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
  }

  const complaintForm = document.getElementById('complaintForm');
  if (complaintForm) {
    complaintForm.addEventListener('submit', function (e) {
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
  }
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

// Improved sidebar click outside handler
document.addEventListener('click', function (e) {
  // Check if we're on mobile
  if (window.innerWidth >= 1024) return;

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Get all toggle buttons
  const toggleButtons = document.querySelectorAll('[onclick="toggleSidebar()"]');

  // Check if click is on any toggle button
  let clickedToggle = false;
  toggleButtons.forEach((button) => {
    if (button.contains(e.target) || button === e.target) {
      clickedToggle = true;
    }
  });

  // If clicked outside sidebar and not on toggle button, and sidebar is open
  if (!sidebar.contains(e.target) && !clickedToggle && !sidebar.classList.contains('-translate-x-full')) {
    toggleSidebar();
  }
});

// Handle resize events
window.addEventListener('resize', function () {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth >= 1024) {
    // On desktop, ensure sidebar is visible
    sidebar.classList.remove('-translate-x-full');
  } else {
    // On mobile, ensure sidebar is hidden initially
    if (!sidebar.classList.contains('-translate-x-full')) {
      sidebar.classList.add('-translate-x-full');
    }
  }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
  lucide.createIcons();
  showTab('dashboard'); // Show dashboard by default

  // Ensure proper initial state for sidebar on mobile
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth < 1024) {
    sidebar.classList.add('-translate-x-full');
  }
});

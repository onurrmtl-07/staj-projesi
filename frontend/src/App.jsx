import { useState, useEffect } from 'react';
import './App.css';

// API Adresini .env dosyasından alıyoruz
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5163';

function App() {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Toast Bildirim Durumu
  const [toast, setToast] = useState(null);

  // Modal Durumları
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeterId, setEditingMeterId] = useState(null);

  // Form Verileri
  const [formData, setFormData] = useState({
    serialNumber: '',
    brand: '',
    installationAddress: ''
  });

  // Toast Gösterme Fonksiyonu
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Sayaçları Backend'den Çeken Fonksiyon (GET)
  const fetchMeters = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/meters`)
      .then((res) => {
        if (!res.ok) throw new Error('Sunucu yanıt vermedi');
        return res.json();
      })
      .then((data) => {
        setMeters(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Sayaç listesi yüklenirken bir hata oluştu.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOpenAddModal = () => {
    setEditingMeterId(null);
    setFormData({ serialNumber: '', brand: '', installationAddress: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (meter) => {
    setEditingMeterId(meter.id);
    setFormData({
      serialNumber: meter.serialNumber,
      brand: meter.brand,
      installationAddress: meter.installationAddress
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingMeterId) {
      // 🔄 PUT
      fetch(`${API_BASE_URL}/api/meters/${editingMeterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then((res) => {
          if (!res.ok) throw new Error('Güncellenemedi');
          return res.json();
        })
        .then((updatedMeter) => {
          setMeters(meters.map(m => m.id === editingMeterId ? updatedMeter : m));
          setIsModalOpen(false);
          showToast('Sayaç bilgileri başarıyla güncellendi! ✏️', 'success');
        })
        .catch(() => showToast('Sayaç güncellenirken hata oluştu!', 'error'));
    } else {
      // ➕ POST
      fetch(`${API_BASE_URL}/api/meters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then((res) => {
          if (!res.ok) throw new Error('Eklenemedi');
          return res.json();
        })
        .then((addedMeter) => {
          setMeters([...meters, addedMeter]);
          setIsModalOpen(false);
          showToast('Yeni sayaç başarıyla eklendi! 🎉', 'success');
        })
        .catch(() => showToast('Sayaç eklenirken hata oluştu!', 'error'));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu sayacı silmek istediğinize emin misiniz?')) {
      fetch(`${API_BASE_URL}/api/meters/${id}`, {
        method: 'DELETE'
      })
        .then((res) => {
          if (!res.ok) throw new Error('Silinemedi');
          setMeters(meters.filter(m => m.id !== id));
          showToast('Sayaç başarıyla silindi! 🗑️', 'error');
        })
        .catch(() => showToast('Sayaç silinirken hata oluştu!', 'error'));
    }
  };

  const filteredMeters = meters.filter((meter) =>
    meter.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.installationAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMeters = meters.length;
  const lastMeter = meters.length > 0 ? meters[meters.length - 1].serialNumber : '-';

  return (
    <div className="container">
      {/* 🔔 Toast Bildirim Balonu */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <header className="header">
        <div>
          <h1>⚡ Sayaç Yönetim Paneli</h1>
          <p className="subtitle">Sistemdeki tüm sayaçları anlık takip edin, düzenleyin ve yönetin.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          ➕ Yeni Sayaç Ekle
        </button>
      </header>

      {/* 📊 İstatistik Kartları */}
      {!loading && !error && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div>
              <div className="stat-value">{totalMeters}</div>
              <div className="stat-label">Toplam Sayaç</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🟢</span>
            <div>
              <div className="stat-value">{totalMeters}</div>
              <div className="stat-label">Aktif Sayaç</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🆕</span>
            <div>
              <div className="stat-value">{lastMeter}</div>
              <div className="stat-label">Son Eklenen Sayaç</div>
            </div>
          </div>
        </div>
      )}

      {/* Arama Barı */}
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Seri No, Marka veya Adres ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && (
        <div className="state-card">
          <div className="spinner"></div>
          <p>Sayaç verileri yükleniyor...</p>
        </div>
      )}

      {error && (
        <div className="state-card error-card">
          <p>⚠️ {error}</p>
          <button className="btn btn-retry" onClick={fetchMeters}>Tekrar Dene</button>
        </div>
      )}

      {!loading && !error && (
        <div className="table-card">
          <table className="meter-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Seri Numarası</th>
                <th>Marka</th>
                <th>Kurulum Adresi</th>
                <th>Durum</th>
                <th style={{ textAlign: 'center' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeters.length > 0 ? (
                filteredMeters.map((meter) => (
                  <tr key={meter.id}>
                    <td>#{meter.id}</td>
                    <td className="font-bold">{meter.serialNumber}</td>
                    <td>{meter.brand}</td>
                    <td>{meter.installationAddress}</td>
                    <td>
                      <span className="status-badge active">Aktif</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleOpenEditModal(meter)}
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(meter.id)}
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    Aramanızla eşleşen sayaç bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingMeterId ? '✏️ Sayacı Düzenle' : '➕ Yeni Sayaç Kaydı'}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>✖</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Seri Numarası</label>
                <input
                  type="text"
                  name="serialNumber"
                  placeholder="Örn: MTR-1003"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Marka</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="Örn: Elektromed"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Kurulum Adresi</label>
                <input
                  type="text"
                  name="installationAddress"
                  placeholder="Örn: Muratpaşa / Antalya"
                  value={formData.installationAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMeterId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
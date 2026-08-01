import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal (Açılır Pencere) Durumları
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeterId, setEditingMeterId] = useState(null); // null ise Yeni Ekle, ID varsa Düzenle modundadır.

  // Form Verileri
  const [formData, setFormData] = useState({
    serialNumber: '',
    brand: '',
    installationAddress: ''
  });

  // Sayaçları Backend'den Çeken Fonksiyon (GET)
  const fetchMeters = () => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:5163/api/meters')
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

  // Form Input Değişikliği
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // "➕ Yeni Sayaç Ekle" Butonuna Basılınca
  const handleOpenAddModal = () => {
    setEditingMeterId(null);
    setFormData({ serialNumber: '', brand: '', installationAddress: '' });
    setIsModalOpen(true);
  };

  // "✏️ Düzenle" Butonuna Basılınca
  const handleOpenEditModal = (meter) => {
    setEditingMeterId(meter.id);
    setFormData({
      serialNumber: meter.serialNumber,
      brand: meter.brand,
      installationAddress: meter.installationAddress
    });
    setIsModalOpen(true);
  };

  // Form Gönderildiğinde (Hem POST hem PUT işlemi)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingMeterId) {
      // 🔄 GÜNCELLEME İŞLEMİ (PUT)
      fetch(`http://localhost:5163/api/meters/${editingMeterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then((res) => {
          if (!res.ok) throw new Error('Güncellenemedi');
          return res.json();
        })
        .then((updatedMeter) => {
          // Listeyi yerel olarak güncelle
          setMeters(meters.map(m => m.id === editingMeterId ? updatedMeter : m));
          setIsModalOpen(false);
        })
        .catch(() => alert('Sayaç güncellenirken bir hata oluştu!'));
    } else {
      // ➕ YENİ EKLEME İŞLEMİ (POST)
      fetch('http://localhost:5163/api/meters', {
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
        })
        .catch(() => alert('Sayaç eklenirken bir hata oluştu!'));
    }
  };

  // 🗑️ SILME İŞLEMİ (DELETE)
  const handleDelete = (id) => {
    if (window.confirm('Bu sayacı silmek istediğinize emin misiniz?')) {
      fetch(`http://localhost:5163/api/meters/${id}`, {
        method: 'DELETE'
      })
        .then((res) => {
          if (!res.ok) throw new Error('Silinemedi');
          // Silinen sayacı listeden filtreleyip çıkar
          setMeters(meters.filter(m => m.id !== id));
        })
        .catch(() => alert('Sayaç silinirken bir hata oluştu!'));
    }
  };

  // Arama Filtresi
  const filteredMeters = meters.filter((meter) =>
    meter.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.installationAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>⚡ Sayaç Yönetim Paneli</h1>
          <p className="subtitle">Sistemdeki tüm sayaçları anlık takip edin, düzenleyin ve yönetin.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          ➕ Yeni Sayaç Ekle
        </button>
      </header>

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

      {/* Yükleniyor Paneli */}
      {loading && (
        <div className="state-card">
          <div className="spinner"></div>
          <p>Sayaç verileri yükleniyor...</p>
        </div>
      )}

      {/* Hata Paneli */}
      {error && (
        <div className="state-card error-card">
          <p>⚠️ {error}</p>
          <button className="btn btn-retry" onClick={fetchMeters}>Tekrar Dene</button>
        </div>
      )}

      {/* Sayaç Listesi Tablosu */}
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

      {/* Pop-up Modal (Ekle & Düzenle Ortak) */}
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
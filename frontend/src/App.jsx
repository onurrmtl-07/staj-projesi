import { useState, useEffect } from 'react';
import './App.css';

// API Adresini .env dosyasından alıyoruz
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://staj-projesi-backend.onrender.com';

function App() {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Toast Bildirim Durumu
  const [toast, setToast] = useState(null);

  // Sayaç Modal Durumları
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeterId, setEditingMeterId] = useState(null);

  // Okuma (Reading) Modal Durumları
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [selectedMeterForReadings, setSelectedMeterForReadings] = useState(null);
  const [readings, setReadings] = useState([]);
  const [readingsLoading, setReadingsLoading] = useState(false);
  const [newReading, setNewReading] = useState({
    consumption: '',
    readingDate: new Date().toISOString().slice(0, 10)
  });

  // Form Verileri (Sayaç Ekle/Düzenle)
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
    }, 4000);
  };

  // Sayaçları Backend'den Çeken Fonksiyon (GET)
  const fetchMeters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/meters`);
      if (!res.ok) throw new Error('Sunucuya ulaşılamadı veya bir hata oluştu.');
      const data = await res.json();
      setMeters(data);
    } catch (err) {
      setError('Sayaç listesi yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
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

  // Okuma (Reading) Modalını Açma ve Kayıtları Çekme
  const handleOpenReadingModal = async (meter) => {
    setSelectedMeterForReadings(meter);
    setIsReadingModalOpen(true);
    setReadingsLoading(true);
    setNewReading({ consumption: '', readingDate: new Date().toISOString().slice(0, 10) });

    try {
      const res = await fetch(`${API_BASE_URL}/api/readings`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = data.filter((r) => r.meterId === meter.id || r.meter?.id === meter.id);
          setReadings(filtered);
        } else {
          setReadings([]);
        }
      } else {
        setReadings([]);
      }
    } catch (err) {
      showToast('Okuma kayıtları çekilirken bir hata oluştu.', 'error');
    } finally {
      setReadingsLoading(false);
    }
  };

  // Backend Validation ve Hata Yanıtlarını İşleyen Yardımcı Fonksiyon
  const parseErrorMessage = async (res) => {
    try {
      const errorData = await res.json();
      if (errorData.errors) {
        return Object.values(errorData.errors).flat().join(' | ');
      }
      if (errorData.message) {
        return errorData.message;
      }
    } catch {
      // JSON parse edilemezse varsayılan mesaj
    }
    return 'İşlem gerçekleştirilemedi.';
  };

  // Sayaç Kaydetme / Güncelleme
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEdit = Boolean(editingMeterId);
    const url = isEdit ? `${API_BASE_URL}/api/meters/${editingMeterId}` : `${API_BASE_URL}/api/meters`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorMsg = await parseErrorMessage(res);
        throw new Error(errorMsg);
      }

      const resultData = await res.json();

      if (isEdit) {
        setMeters(meters.map((m) => (m.id === editingMeterId ? resultData : m)));
        showToast('Sayaç bilgileri başarıyla güncellendi! ✏️', 'success');
      } else {
        setMeters([...meters, resultData]);
        showToast('Yeni sayaç başarıyla eklendi! 🎉', 'success');
      }

      setIsModalOpen(false);
    } catch (err) {
      showToast(`⚠️ Hata: ${err.message}`, 'error');
    }
  };

  // Sayaç Silme
  const handleDelete = async (id) => {
    if (!window.confirm('Bu sayacı silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/meters/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorMsg = await parseErrorMessage(res);
        throw new Error(errorMsg);
      }

      setMeters(meters.filter((m) => m.id !== id));
      showToast('Sayaç başarıyla silindi! 🗑️', 'success');
    } catch (err) {
      showToast(`⚠️ ${err.message}`, 'error');
    }
  };

  // Yeni Okuma (Tüketim) Kaydı Ekleme
  const handleAddReading = async (e) => {
    e.preventDefault();

    if (!newReading.consumption || isNaN(newReading.consumption)) {
      showToast('Lütfen geçerli bir tüketim miktarı girin.', 'error');
      return;
    }

    const consumptionVal = parseFloat(newReading.consumption);

    // Backend'deki olası tüm alan isimlerine uyum sağlamak için:
    const payload = {
      meterId: selectedMeterForReadings.id,
      consumption: consumptionVal,
      value: consumptionVal,
      readingValue: consumptionVal,
      readingDate: newReading.readingDate ? new Date(newReading.readingDate).toISOString() : new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorMsg = await parseErrorMessage(res);
        throw new Error(errorMsg);
      }

      const createdReading = await res.json();
      setReadings([...readings, createdReading]);
      setNewReading({ consumption: '', readingDate: new Date().toISOString().slice(0, 10) });
      showToast('Yeni okuma kaydı başarıyla eklendi! ⚡', 'success');
    } catch (err) {
      showToast(`⚠️ Hata: ${err.message}`, 'error');
    }
  };

  // Okuma Kaydı Silme
  const handleDeleteReading = async (readingId) => {
    if (!window.confirm('Bu okuma kaydını silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/readings/${readingId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorMsg = await parseErrorMessage(res);
        throw new Error(errorMsg);
      }

      setReadings(readings.filter((r) => r.id !== readingId));
      showToast('Okuma kaydı silindi! 🗑️', 'success');
    } catch (err) {
      showToast(`⚠️ Hata: ${err.message}`, 'error');
    }
  };

  const filteredMeters = meters.filter(
    (meter) =>
      meter.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.installationAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMeters = meters.length;
  const lastMeter = meters.length > 0 ? meters[meters.length - 1].serialNumber : '-';

  return (
    <div className="container">
      {/* 🔔 Toast Bildirim Balonu */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

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
          <button className="btn btn-retry" onClick={fetchMeters}>
            Tekrar Dene
          </button>
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
                          style={{ backgroundColor: '#2563eb', color: '#fff' }}
                          onClick={() => handleOpenReadingModal(meter)}
                        >
                          📊 Okumalar
                        </button>
                        <button className="btn-action btn-edit" onClick={() => handleOpenEditModal(meter)}>
                          ✏️ Düzenle
                        </button>
                        <button className="btn-action btn-delete" onClick={() => handleDelete(meter.id)}>
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

      {/* ✏️ Sayaç Ekle / Düzenle Modalı */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingMeterId ? '✏️ Sayacı Düzenle' : '➕ Yeni Sayaç Kaydı'}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                ✖
              </button>
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

      {/* ⚡ Okumalar (Readings) Modalı */}
      {isReadingModalOpen && selectedMeterForReadings && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>⚡ {selectedMeterForReadings.serialNumber} - Okuma Kayıtları</h2>
              <button className="btn-close" onClick={() => setIsReadingModalOpen(false)}>
                ✖
              </button>
            </div>

            {/* Yeni Okuma Ekleme Formu */}
            <form onSubmit={handleAddReading} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #374151' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#9ca3af' }}>➕ Yeni Okuma Kaydı Ekle</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '140px' }}>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Tüketim (kWh)"
                    value={newReading.consumption}
                    onChange={(e) => setNewReading({ ...newReading, consumption: e.target.value })}
                    className="search-input"
                    style={{ width: '100%', padding: '8px' }}
                    required
                  />
                </div>
                <div style={{ flex: '1', minWidth: '140px' }}>
                  <input
                    type="date"
                    value={newReading.readingDate}
                    onChange={(e) => setNewReading({ ...newReading, readingDate: e.target.value })}
                    className="search-input"
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                  Ekle
                </button>
              </div>
            </form>

            {/* Geçmiş Okumalar Listesi */}
            <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#9ca3af' }}>📋 Geçmiş Tüketimler</h3>
            {readingsLoading ? (
              <p style={{ textAlign: 'center', color: '#9ca3af' }}>Okumalar yükleniyor...</p>
            ) : readings.length > 0 ? (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="meter-table" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Tüketim (kWh)</th>
                      <th style={{ textAlign: 'center' }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((r) => (
                      <tr key={r.id}>
                        <td>{r.readingDate ? new Date(r.readingDate).toLocaleDateString('tr-TR') : '-'}</td>
                        <td className="font-bold" style={{ color: '#10b981' }}>
                          {r.consumption ?? r.value ?? r.readingValue ?? r.kwh ?? r.Consumption ?? r.Value ?? 0} kWh
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn-action btn-delete"
                            style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                            onClick={() => handleDeleteReading(r.id)}
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '15px 0' }}>
                Bu sayaca ait henüz kaydedilmiş bir okuma bulunmuyor.
              </p>
            )}

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsReadingModalOpen(false)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
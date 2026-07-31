import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal (Form Açılır Pencere) Durumu
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Yeni Sayaç Form Verileri
  const [newMeter, setNewMeter] = useState({
    serialNumber: '',
    brand: '',
    installationAddress: ''
  });

  // Sayaçları Backend'den Çeken Fonksiyon
  const fetchMeters = () => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:5163/api/meters')
      .then((response) => {
        if (!response.ok) throw new Error('Sunucu yanıt vermedi');
        return response.json();
      })
      .then((data) => {
        setMeters(data);
        setLoading(false);
      })
      .catch((err) => {
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
    setNewMeter({ ...newMeter, [name]: value });
  };

  // Yeni Sayaç Ekleme (POST İsteği)
  const handleAddMeter = (e) => {
    e.preventDefault();

    fetch('http://localhost:5163/api/meters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMeter)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Sayaç eklenemedi.');
        return res.json();
      })
      .then((addedMeter) => {
        // Listeyi anında güncelle
        setMeters([...meters, addedMeter]);
        // Formu temizle ve pop-up'ı kapat
        setNewMeter({ serialNumber: '', brand: '', installationAddress: '' });
        setIsModalOpen(false);
      })
      .catch((err) => {
        alert('Sayaç eklenirken hata oluştu!');
      });
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
          <p className="subtitle">Sistemdeki tüm sayaçları anlık takip edin ve yeni kayıt ekleyin.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          ➕ Yeni Sayaç Ekle
        </button>
      </header>

      {/* Arama Çubuğu */}
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Seri No, Marka veya Adres ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Yükleniyor Durumu */}
      {loading && (
        <div className="state-card">
          <div className="spinner"></div>
          <p>Sayaç verileri yükleniyor...</p>
        </div>
      )}

      {/* Hata Durumu */}
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    Aramanızla eşleşen sayaç bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Yeni Sayaç Ekleme Modalı (Pop-up) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>➕ Yeni Sayaç Kaydı</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>✖</button>
            </div>
            <form onSubmit={handleAddMeter}>
              <div className="form-group">
                <label>Seri Numarası</label>
                <input
                  type="text"
                  name="serialNumber"
                  placeholder="Örn: MTR-1003"
                  value={newMeter.serialNumber}
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
                  value={newMeter.brand}
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
                  value={newMeter.installationAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  Kaydet
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
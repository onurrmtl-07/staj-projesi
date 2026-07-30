import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API'den Sayaç Verilerini Çeken Fonksiyon
  const fetchMeters = async () => {
    setLoading(true);
    setError(null);

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5163/api';

    try {
      const response = await fetch(`${baseUrl}/meters`);
      if (!response.ok) {
        throw new Error(`Sunucu hatası: ${response.status}`);
      }
      const data = await response.json();
      setMeters(data);
    } catch (err) {
      setError('Sayaç verileri yüklenirken bir sorun oluştu. Lütfen bağlantınızı veya sunucuyu kontrol edin.');
      console.error('API Hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  // Arama Filtreleme Mantığı
  const filteredMeters = meters.filter((meter) => {
    const search = searchTerm.toLowerCase();
    const meterNumber = meter.meterNumber?.toString().toLowerCase() || '';
    const meterType = meter.type?.toString().toLowerCase() || '';
    
    return meterNumber.includes(search) || meterType.includes(search);
  });

  return (
    <div className="container">
      <header className="header">
        <h1>📊 Sayaç Yönetim Sistemi</h1>
        <p>Staj Projesi - Canlı Takip Paneli</p>
      </header>

      {/* Arama Barı ve İstatistik */}
      <div className="top-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Sayaç no veya tipine göre ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="stats-badge">
          Toplam: <strong>{filteredMeters.length}</strong> / {meters.length} Sayaç
        </div>
      </div>

      {/* ⏳ Yükleniyor Paneli */}
      {loading && (
        <div className="state-panel loading-panel">
          <div className="spinner"></div>
          <p>Sayaç verileri getiriliyor, lütfen bekleyin...</p>
        </div>
      )}

      {/* ⚠️ Hata Paneli */}
      {error && !loading && (
        <div className="state-panel error-panel">
          <h3>🚨 Bir Hata Oluştu!</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchMeters}>
            🔄 Tekrar Dene
          </button>
        </div>
      )}

      {/* 📋 Sayaç Listesi Tablosu */}
      {!loading && !error && (
        <div className="table-wrapper">
          {filteredMeters.length === 0 ? (
            <div className="empty-state">
              <p>Aradığınız kriterlere uygun sayaç bulunamadı.</p>
            </div>
          ) : (
            <table className="meter-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sayaç Numarası</th>
                  <th>Sayaç Tipi</th>
                  <th>Son Okuma Tüketimi</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeters.map((meter) => (
                  <tr key={meter.id}>
                    <td>#{meter.id}</td>
                    <td className="font-bold">{meter.meterNumber}</td>
                    <td>
                      <span className="type-badge">{meter.type || 'Belirtilmedi'}</span>
                    </td>
                    <td>{meter.lastReading ?? 0} kWh</td>
                    <td>
                      <span className="status-badge active">Aktif</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
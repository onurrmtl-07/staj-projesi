import { useEffect, useState } from 'react'

function App() {
  const [meters, setMeters] = useState([])

  useEffect(() => {
    // C# Backend API'mizden sayaç verilerini çekiyoruz
    fetch('http://localhost:5163/api/meters')
      .then((res) => res.json())
      .then((data) => setMeters(data))
      .catch((err) => console.error('Veri çekme hatası:', err))
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>⚡ Akıllı Sayaç Takip Paneli</h1>
      <h2>1. Hafta: Sayaç Listesi (Backend Connection)</h2>

      <table border="1" cellPadding="10" style={{ marginTop: '20px', width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>ID</th>
            <th>Seri No</th>
            <th>Marka</th>
            <th>Kurulum Adresi</th>
            <th>Tarih</th>
          </tr>
        </thead>
        <tbody>
          {meters.map((meter) => (
            <tr key={meter.id}>
              <td>{meter.id}</td>
              <td><strong>{meter.serialNumber}</strong></td>
              <td>{meter.brand}</td>
              <td>{meter.installationAddress}</td>
              <td>{new Date(meter.installationDate).toLocaleDateString('tr-TR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
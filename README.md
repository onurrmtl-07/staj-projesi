# 📊 Staj Projesi - Sayaç Yönetim Sistemi

Bu proje, staj sürecim kapsamında geliştirmekte olduğum bir Sayaç Yönetim Sistemi uygulamasıdır. Proje; sayaç verilerini, tüketim okuma kayıtlarını, anlık istatistik özetlerini ve durum bildirimlerini dinamik olarak yönetmeyi ve listelemeyi amaçlamaktadır.

---

## 🌐 Canlı Demo & Bağlantılar

* **Canlı Frontend (Arayüz):** [https://onurrmtl-07.github.io/staj-projesi](https://onurrmtl-07.github.io/staj-projesi)
* **Canlı Backend (API):** [https://staj-projesi-backend.onrender.com](https://staj-projesi-backend.onrender.com)

> **⚠️ Önemli Teknik Notlar:**
> * **Cold Start (Uyku Modu):** Render ücretsiz planı kullanıldığı için servis ~15 dakika işlem yapılmadığında uyku moduna geçer. İlk istek atıldığında sunucunun uyanması **yaklaşık 1 dakika** sürebilir.
> * **Veri Yönetimi (In-Memory):** Uygulama verileri geçici hafızada (In-Memory) tutulmaktadır. Servis yeniden başlatıldığında veriler sıfırlanır.

---

## 🛠️ Kullanılan Teknolojiler

* **Backend:** .NET 8 Web API (C#)
* **Test Framework:** xUnit (Birim Testler)
* **Frontend:** React (Vite altyapısı ile), JavaScript, CSS
* **CI/CD & Otomasyon:** GitHub Actions (Otomatik Test & GitHub Pages Yayını)
* **Çevre Değişkenleri & Yapılandırma:** Environment Variables (`.env`), CORS
* **Dokümantasyon:** Swagger UI
* **Versiyon Kontrol:** Git & GitHub

---

## 🚀 Projeyi Yerel Ortamda Çalıştırma (Kurulum)

Projeyi bilgisayarınızda çalıştırmak için terminalde sırasıyla şu komutları çalıştırabilirsiniz:

```bash
# Projeyi Klonlayın ve Klasöre Geçin
git clone [https://github.com/onurrmtl-07/staj-projesi.git](https://github.com/onurrmtl-07/staj-projesi.git)
cd staj-projesi

# Backend'i (Sunucu) Başlatın
cd backend
dotnet run

# Frontend'i (Arayüz) Başlatın (Ayrı bir terminalde /frontend klasöründe)
cd frontend
npm install
npm run dev

# Birim Testleri Çalıştırın (İsteğe Bağlı)
dotnet test backend.Tests/backend.Tests.csproj
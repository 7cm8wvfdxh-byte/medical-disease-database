# 🏥 Tıbbi Hastalık Veritabanı Sistemi

Multidisipliner hastalık bilgi sistemi - Backend API + Frontend Web Arayüzü

## 📦 Proje Yapısı

```
medical_db_project/
├── backend/                 # FastAPI Backend
│   ├── main.py             # API servisi
│   └── requirements.txt    # Python bağımlılıkları
├── frontend/               # React Frontend  
│   ├── src/
│   │   ├── App.jsx        # Ana uygulama
│   │   ├── components/    # React bileşenleri
│   │   └── index.html     # HTML template
│   └── package.json       # Node bağımlılıkları
└── database/              # JSON veri dosyaları
    ├── H001_tip2_diyabet_COMPLETE.json
    └── H002_hipertansiyon_COMPLETE.json
```

## 🚀 Kurulum

### Backend (FastAPI)

```bash
cd backend

# Sanal ortam oluştur (önerilen)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları kur
pip install -r requirements.txt

# Servisi başlat
python main.py
# veya
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend şu adreste çalışacak: `http://localhost:8000`

API Dokümantasyonu: `http://localhost:8000/docs`

### Frontend (React)

```bash
cd frontend

# Bağımlılıkları kur
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Frontend şu adreste çalışacak: `http://localhost:5173`

## 📡 API Endpoints

### Hastalıklar
- `GET /diseases` - Tüm hastalıkları listele
- `GET /diseases/{disease_id}` - Hastalık detayı
- `GET /diseases/{disease_id}/branches` - Hastalığın branşları
- `GET /diseases/{disease_id}/branch/{branch_name}` - Branş detayı

### Arama
- `GET /search?q=diyabet` - Hastalık ara

### İstatistikler
- `GET /stats` - Veritabanı istatistikleri

### Yönetim
- `POST /reload-database` - Veritabanını yeniden yükle

## 🎯 Özellikler

### Backend
✅ RESTful API (FastAPI)
✅ CORS desteği (Frontend bağlantısı için)
✅ JSON-based hafif veritabanı
✅ Arama fonksiyonu
✅ Otomatik API dokümantasyonu (Swagger UI)
✅ Hata yönetimi

### Frontend
✅ React 18 + Vite
✅ Responsive tasarım
✅ Hastalık listesi ve detay görüntüleme
✅ Branş bazlı filtreleme
✅ Arama fonksiyonu
✅ Modern UI/UX

## 📊 Mevcut Veri

- **H001**: Tip 2 Diabetes Mellitus (14 branş, 50KB)
- **H002**: Esansiyel Hipertansiyon (12 branş, 31KB)

## 🔄 Yeni Hastalık Ekleme

1. JSON dosyasını hazırlayın (mevcut format)
2. `backend/main.py`'de `load_diseases()` fonksiyonuna ekleyin:
```python
json_files = [
    "tip2_diyabet_H001_COMPLETE.json",
    "H002_hipertansiyon_COMPLETE.json",
    "H003_yeni_hastalik.json",  # YENİ
]
```
3. Backend'i yeniden başlatın veya `/reload-database` endpoint'ini çağırın

## 🛠️ Teknoloji Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI sunucu
- **Pydantic** - Veri validasyonu

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling (opsiyonel)

## 📝 Örnek Kullanım

### Python ile API Çağrısı
```python
import requests

# Tüm hastalıkları getir
response = requests.get("http://localhost:8000/diseases")
diseases = response.json()

# Hastalık detayı
response = requests.get("http://localhost:8000/diseases/H001")
diabetes = response.json()

# Branş bilgisi
response = requests.get("http://localhost:8000/diseases/H001/branch/kardiyoloji")
cardio_info = response.json()

# Arama
response = requests.get("http://localhost:8000/search?q=diyabet")
results = response.json()
```

### JavaScript ile API Çağrısı
```javascript
// Tüm hastalıkları getir
const response = await fetch('http://localhost:8000/diseases');
const data = await response.json();

// Hastalık detayı
const disease = await fetch('http://localhost:8000/diseases/H001')
    .then(res => res.json());

// Arama
const results = await fetch('http://localhost:8000/search?q=hipertansiyon')
    .then(res => res.json());
```

## 🔐 Güvenlik Notları

**Geliştirme ortamı için:**
- CORS tüm kaynaklara açık (`allow_origins=["*"]`)
- Veritabanı bellekte (persistence yok)

**Prodüksiyon için yapılması gerekenler:**
- CORS'u sadece frontend domain'ine kısıtla
- MongoDB veya PostgreSQL kullan
- Autentikasyon/Authorization ekle
- HTTPS kullan
- Rate limiting ekle
- Input validation güçlendir

## 📈 Gelecek Geliştirmeler

- [ ] Gerçek veritabanı entegrasyonu (MongoDB/PostgreSQL)
- [ ] Kullanıcı sistemi ve yetkilendirme
- [ ] Favorilere ekleme
- [ ] Not ekleme özelliği
- [ ] PDF export
- [ ] Mobil uygulama (React Native)
- [ ] Kalan 8 hastalığı ekle
- [ ] Görsel/diagram desteği
- [ ] Çoklu dil desteği

## 🐛 Bilinen Sorunlar

- Şu an sadece 2 hastalık mevcut (H001, H002)
- Veritabanı bellekte (restart olunca sıfırlanır - ama JSON'dan yeniden yüklenir)
- Gelişmiş arama özellikleri henüz yok (fuzzy search, filtering vb.)

## 👥 Katkıda Bulunma

1. Yeni hastalık eklemek için JSON formatını takip edin
2. Her hastalık için ilgili branşları ekleyin
3. Kodun okunabilirliğini koruyun
4. Yorum satırları ekleyin

## 📄 Lisans

Bu proje Dr. Han tarafından geliştirilmiştir.

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

---

**Not**: Bu sistem şu an geliştirme aşamasındadır. Prodüksiyon kullanımı için güvenlik ve performans iyileştirmeleri gereklidir.

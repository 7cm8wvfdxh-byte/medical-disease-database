# 🚀 HIZLI BAŞLANGIÇ KILAVUZU

## Sistemi Çalıştırma (3 Adım)

### 1️⃣ Backend'i Başlat

```bash
cd medical_db_project/backend

# Bağımlılıkları kur (ilk kez)
pip install fastapi uvicorn --break-system-packages

# Sunucuyu başlat
python3 main.py
```

✅ Backend şu adreste çalışacak: **http://localhost:8000**  
📖 API Dokümantasyonu: **http://localhost:8000/docs**

### 2️⃣ Frontend'i Başlat (Başka bir terminalde)

```bash
cd medical_db_project/frontend

# Bağımlılıkları kur (ilk kez)
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

✅ Frontend şu adreste çalışacak: **http://localhost:5173**

### 3️⃣ Tarayıcıda Aç

http://localhost:5173 adresine gidin ve sistemi kullanmaya başlayın!

---

## 🧪 API'yi Test Etme

### Tarayıcıdan Test:

```
http://localhost:8000/diseases
http://localhost:8000/diseases/H001
http://localhost:8000/search?q=diyabet
http://localhost:8000/stats
```

### cURL ile Test:

```bash
# Tüm hastalıklar
curl http://localhost:8000/diseases

# Hastalık detayı
curl http://localhost:8000/diseases/H001

# Arama
curl "http://localhost:8000/search?q=hipertansiyon"

# İstatistikler
curl http://localhost:8000/stats
```

### Python ile Test:

```python
import requests

# API test
response = requests.get("http://localhost:8000/diseases")
print(response.json())
```

---

## 📂 Proje Yapısı

```
medical_db_project/
├── backend/
│   ├── main.py              ← API servisi
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx         ← Ana React bileşeni
│   │   ├── App.css         ← Stil dosyası
│   │   └── main.jsx        ← Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── H001_tip2_diyabet_COMPLETE.json
│   └── H002_hipertansiyon_COMPLETE.json
└── README.md
```

---

## 🎯 Sistem Özellikleri

### Backend (FastAPI)
✅ RESTful API
✅ Otomatik API dokümantasyonu (Swagger UI)
✅ CORS desteği
✅ Arama fonksiyonu
✅ JSON-based hafif veritabanı

### Frontend (React)
✅ Modern, responsive tasarım
✅ Hastalık listesi ve detay görüntüleme
✅ Branş bazlı filtreleme
✅ Gerçek zamanlı arama
✅ Kullanıcı dostu arayüz

---

## 🐛 Sorun Giderme

### Backend başlamıyor

**Sorun**: `ModuleNotFoundError: No module named 'fastapi'`
```bash
pip install fastapi uvicorn --break-system-packages
```

**Sorun**: Port 8000 kullanımda
```bash
# Başka port kullan
uvicorn main:app --port 8001
```

### Frontend başlamıyor

**Sorun**: `npm: command not found`
```bash
# Node.js kur: https://nodejs.org/
```

**Sorun**: Bağımlılıklar kurulmadı
```bash
cd frontend
npm install
```

### Backend'e bağlanamıyor

1. Backend'in çalıştığından emin olun: http://localhost:8000
2. CORS ayarlarını kontrol edin
3. Firewall ayarlarını kontrol edin

---

## 📊 Mevcut Veri

- ✅ **H001**: Tip 2 Diabetes Mellitus (14 branş)
- ✅ **H002**: Esansiyel Hipertansiyon (12 branş)
- ⏳ **H003-H010**: Yakında eklenecek

---

## 🔄 Yeni Hastalık Ekleme

1. JSON dosyasını `database/` klasörüne ekleyin
2. `backend/main.py` içinde `load_diseases()` fonksiyonunu güncelleyin:
```python
json_files = [
    "tip2_diyabet_H001_COMPLETE.json",
    "H002_hipertansiyon_COMPLETE.json",
    "H003_yeni_hastalik.json",  # YENİ
]
```
3. Backend'i yeniden başlatın veya:
```bash
curl -X POST http://localhost:8000/reload-database
```

---

## 💡 Gelişmiş Kullanım

### Prodüksiyon için Backend

```bash
# Gunicorn ile
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

# veya Docker ile
docker build -t medical-api backend/
docker run -p 8000:8000 medical-api
```

### Frontend Production Build

```bash
cd frontend
npm run build
# dist/ klasörü oluşur - bu klasörü serve edin
```

---

## 📞 Yardım

- API dokümantasyonu: http://localhost:8000/docs
- README.md dosyasına bakın
- GitHub issues açın

---

**🎉 Artık sistem kullanıma hazır!**

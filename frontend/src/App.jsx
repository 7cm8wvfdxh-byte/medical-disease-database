import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'https://medical-disease-api.onrender.com';

function App() {
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchData, setBranchData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'detail', 'search', 'stats'
  const [liveResults, setLiveResults] = useState([]);
  const [sortBy, setSortBy] = useState('name-asc'); // name-asc, name-desc, icd-asc, icd-desc, branches-asc, branches-desc
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  // Karanlık Mod State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // 3D Anatomi State
  const [show3DAnatomy, setShow3DAnatomy] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  
  // Kategori Sistemi State
  const [selectedCategory, setSelectedCategory] = useState('temel');
  
  // Çoklu Dil State
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'tr';
  });
  
  // Karşılaştırma Modu State
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState([]);
  
  // Gelişmiş Filtre State
  const [filters, setFilters] = useState({
    icdCategory: '',
    ageGroup: '',
    severity: '',
    treatmentType: ''
  });
  
  // Tıbbi Kategoriler (Branştan bağımsız)
  const MEDICAL_CATEGORIES = [
    { id: 'temel', icon: '📖', label: 'Temel Bilgiler', color: '#3498db' },
    { id: 'patofizyoloji', icon: '🔬', label: 'Patofizyoloji', color: '#9b59b6' },
    { id: 'klinik', icon: '🩺', label: 'Klinik & Tanı', color: '#e74c3c' },
    { id: 'tedavi', icon: '💊', label: 'Tedavi', color: '#27ae60' },
    { id: 'radyoloji', icon: '📡', label: 'Radyoloji', color: '#f39c12' },
    { id: 'prognoz', icon: '📈', label: 'Prognoz & Komplikasyon', color: '#e91e63' },
    { id: 'brans', icon: '🏥', label: 'Branş Perspektifleri', color: '#16a085' }
  ];

  // Hastalık-Organ Eşleştirmesi
  const ORGAN_MAPPINGS = {
    "H001": { // Tip 2 Diabetes
      organs: [
        { name: "Pankreas", color: "#9b59b6", description: "İnsülin üretimi bozulur, beta hücreleri hasar görür", severity: "high" },
        { name: "Kalp", color: "#e74c3c", description: "Kardiyovasküler komplikasyon riski artar", severity: "high" },
        { name: "Böbrekler", color: "#e67e22", description: "Diyabetik nefropati gelişebilir", severity: "medium" },
        { name: "Göz (Retina)", color: "#3498db", description: "Diyabetik retinopati, görme kaybı", severity: "medium" },
        { name: "Sinirler", color: "#f39c12", description: "Nöropati, duyu kaybı", severity: "medium" }
      ]
    },
    "H002": { // Hipertansiyon
      organs: [
        { name: "Kalp", color: "#e74c3c", description: "Sol ventrikül hipertrofisi, kalp yetmezliği", severity: "high" },
        { name: "Beyin", color: "#e91e63", description: "İnme riski, vasküler demans", severity: "high" },
        { name: "Böbrekler", color: "#e67e22", description: "Hipertansif nefropati, böbrek yetmezliği", severity: "high" },
        { name: "Gözler", color: "#3498db", description: "Hipertansif retinopati", severity: "medium" }
      ]
    },
    "H003": { // KOAH
      organs: [
        { name: "Akciğerler", color: "#95a5a6", description: "Alveoler hasar, amfizem, kronik inflamasyon", severity: "high" },
        { name: "Bronşlar", color: "#7f8c8d", description: "Bronş duvarı kalınlaşması, mukus hipersekresyonu", severity: "high" },
        { name: "Kalp (Sağ)", color: "#e74c3c", description: "Kor pulmonale, sağ kalp yetmezliği", severity: "medium" }
      ]
    },
    "H004": { // Astım
      organs: [
        { name: "Akciğerler", color: "#3498db", description: "Bronşiyal inflamasyon, hiperreaktivite", severity: "high" },
        { name: "Hava Yolları", color: "#e74c3c", description: "Bronkospazm, mukus tıkacı, ödem", severity: "high" },
        { name: "İmmün Sistem", color: "#9b59b6", description: "Tip 2 inflamasyon, eozinofil aktivasyonu", severity: "medium" }
      ]
    },
    "H005": { // Koroner Arter Hastalığı
      organs: [
        { name: "Kalp (Koroner Arterler)", color: "#c0392b", description: "Aterosklerotik plak birikimi, damar daralması, miyokard iskemisi", severity: "high" },
        { name: "Kalp Kası (Miyokard)", color: "#e74c3c", description: "İskemi, enfarkt riski, kalp yetmezliği gelişimi", severity: "high" },
        { name: "Beyin", color: "#e91e63", description: "Ateroskleroz yaygın, serebral iskemi ve inme riski", severity: "medium" },
        { name: "Böbrekler", color: "#e67e22", description: "Renal arter stenozu, kronik böbrek hastalığı", severity: "medium" }
      ]
    },
    "H006": { // GERD
      organs: [
        { name: "Özofagus (Yemek Borusu)", color: "#e74c3c", description: "Mukoza hasarı, eroziv özofajit, Barrett özofagus", severity: "high" },
        { name: "Mide", color: "#f39c12", description: "Gastrik asit fazlalığı, LES (alt özofageal sfinkter) disfonksiyonu", severity: "high" },
        { name: "Larinks (Gırtlak)", color: "#9b59b6", description: "Laryngofaringeal reflü, ses kısıklığı, kronik larenjit", severity: "medium" },
        { name: "Akciğerler", color: "#95a5a6", description: "Aspirasyon riski, kronik öksürük, astım alevlenmesi", severity: "medium" }
      ]
    },
    "H007": { // Hipotiroidi
      organs: [
        { name: "Tiroid Bezi", color: "#16a085", description: "Yetersiz tiroid hormonu üretimi, Hashimoto tiroiditi", severity: "high" },
        { name: "Kalp", color: "#e74c3c", description: "Bradikardi, azalmış kardiyak output, perikard effüzyonu", severity: "high" },
        { name: "Beyin", color: "#9b59b6", description: "Mental yavaşlama, depresyon, kognitif bozukluk", severity: "medium" },
        { name: "Cilt ve Saç", color: "#f39c12", description: "Kuru cilt, saç dökülmesi, miksödem", severity: "medium" }
      ]
    },
    "H008": { // Migren
      organs: [
        { name: "Beyin (Korteks)", color: "#e91e63", description: "Kortikale yayılan depresyon (CSD), aura fenomeni, nöronal depolarizasyon", severity: "high" },
        { name: "Kan Damarları (Meningeal)", color: "#e74c3c", description: "Trigeminal sinir aktivasyonu, CGRP salınımı, vazodilatasyon ve ağrı", severity: "high" },
        { name: "Beyin Sapı", color: "#9b59b6", description: "Periakuaduktal gri madde disfonksiyonu, ağrı modülasyon bozukluğu", severity: "medium" },
        { name: "Göz (Retina)", color: "#3498db", description: "Görsel aura, fotopsi, skotoma, retinal migren (nadir)", severity: "medium" }
      ]
    },
    "H009": { // Osteoartrit
      organs: [
        { name: "Kıkırdak (Eklem)", color: "#95a5a6", description: "Progresif dejenerasyon, fibrilasyon, tip II kollajen yıkımı, tam kat kayıp", severity: "high" },
        { name: "Kemik (Subkondral)", color: "#7f8c8d", description: "Mikrofraktürler, skleroz, osteofit formasyonu, subkondral kistler (genoditler)", severity: "high" },
        { name: "Sinovyal Membran", color: "#e67e22", description: "Sinovit, IL-1β ve TNF-α salınımı, effüzyon, inflamasyon", severity: "medium" },
        { name: "Eklem Kapsülü & Ligamanlar", color: "#f39c12", description: "Ligaman laksitesi, eklem instabilitesi, menisküs dejenerasyonu", severity: "medium" }
      ]
    },
    "H010": { // Kronik Böbrek Hastalığı
      organs: [
        { name: "Böbrekler (Glomerül)", color: "#e67e22", description: "Glomerüler skleroz, nefron kaybı, proteinüri, eGFR progresif azalması", severity: "high" },
        { name: "Böbrekler (Tübülointerstisyum)", color: "#d35400", description: "Tübülointerstisyel fibrozis, inflamasyon, kollajen birikimi", severity: "high" },
        { name: "Kalp & Damarlar", color: "#e74c3c", description: "Vasküler kalsifikasyon, hipertansiyon, kalp yetmezliği, ateroskleroz hızlanması", severity: "high" },
        { name: "Kemikler", color: "#95a5a6", description: "Renal osteodistrofi, sekonder hiperparatiroidizm, kemik turnover bozukluğu, kırık riski", severity: "medium" }
      ]
    }
  };

  // Karanlık Mod Toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  // Karanlık mod class'ı body'e ekle
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // İlk yüklemede hastalıkları getir
  useEffect(() => {
    fetchDiseases();
    fetchStats();
  }, []);

  // Canlı arama - yazdıkça otomatik arama
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        performLiveSearch(searchQuery);
      }, 300); // 300ms bekle (çok hızlı yazarsa bekle)
      
      return () => clearTimeout(timeoutId);
    } else {
      setLiveResults([]);
    }
  }, [searchQuery]);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/diseases`);
      const data = await response.json();
      setDiseases(data.diseases);
    } catch (error) {
      console.error('Hastalıklar yüklenemedi:', error);
      alert('Backend bağlantısı kurulamadı. Backend sunucusunun çalıştığından emin olun.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  const fetchDiseaseDetail = async (diseaseId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/diseases/${diseaseId}`);
      const data = await response.json();
      setSelectedDisease(data);
      
      // Branşları getir
      const branchesResponse = await fetch(`${API_BASE_URL}/diseases/${diseaseId}/branches`);
      const branchesData = await branchesResponse.json();
      setBranches(branchesData.branches);
      
      setView('detail');
    } catch (error) {
      console.error('Hastalık detayı yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchData = async (diseaseId, branchName) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/diseases/${diseaseId}/branch/${branchName}`);
      const data = await response.json();
      setBranchData(data);
      setSelectedBranch(branchName);
    } catch (error) {
      console.error('Branş bilgisi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      alert('En az 2 karakter girin');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.results);
      setView('search');
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Canlı arama fonksiyonu
  const performLiveSearch = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setLiveResults(data.results);
    } catch (error) {
      console.error('Canlı arama hatası:', error);
    }
  };

  // Hastalıkları sırala
  const getSortedDiseases = () => {
    const sorted = [...diseases];
    
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.isim_tr.localeCompare(b.isim_tr, 'tr'));
      case 'name-desc':
        return sorted.sort((a, b) => b.isim_tr.localeCompare(a.isim_tr, 'tr'));
      case 'icd-asc':
        return sorted.sort((a, b) => a.ICD_10.localeCompare(b.ICD_10));
      case 'icd-desc':
        return sorted.sort((a, b) => b.ICD_10.localeCompare(a.ICD_10));
      case 'branches-asc':
        return sorted.sort((a, b) => a.branş_sayısı - b.branş_sayısı);
      case 'branches-desc':
        return sorted.sort((a, b) => b.branş_sayısı - a.branş_sayısı);
      default:
        return sorted;
    }
  };

  // AI Asistan - Hastalık hakkında soru sor (Hibrit: Veritabanı + AI)
  const handleAIQuestion = async () => {
    if (!aiQuestion.trim() || !selectedDisease) {
      alert('Lütfen bir soru yazın');
      return;
    }

    setLoading(true);
    try {
      // 1. ADIM: Veritabanında akıllı arama
      const dbAnswer = searchInDiseaseData(aiQuestion.toLowerCase(), selectedDisease);
      
      if (dbAnswer) {
        // Veritabanında bulundu!
        setAiResponse(dbAnswer + "\n\n💡 Bu bilgi hastalık veritabanından alınmıştır.");
        setLoading(false);
        return;
      }

      // 2. ADIM: Veritabanında bulunamadı, Backend üzerinden AI'ye sor
      try {
        const response = await fetch(`${API_BASE_URL}/ai-ask`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            disease_id: selectedDisease.hastalık_id,
            question: aiQuestion,
            disease_name: selectedDisease.temel_bilgi.isim_tr,
            disease_description: selectedDisease.temel_bilgi.tanım
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setAiResponse(data.answer + "\n\n🤖 Bu bilgi Claude AI tarafından üretilmiştir.");
        } else {
          setAiResponse('⚠️ AI servisi şu anda kullanılamıyor.\n\n💡 İpucu: "belirtiler", "tedavi", "risk faktörleri" gibi anahtar kelimeler kullanarak veritabanında arama yapabilirsiniz.');
        }
      } catch (error) {
        console.error('AI Backend hatası:', error);
        setAiResponse('⚠️ AI servisi bağlantı hatası.\n\n💡 Backend sunucusunun çalıştığından emin olun.');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Genel hata:', error);
      setAiResponse('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  // Veritabanında akıllı arama fonksiyonu
  const searchInDiseaseData = (question, disease) => {
    const data = disease.temel_bilgi;
    
    // Genişletilmiş anahtar kelime eşleştirmeleri
    const keywords = {
      'belirtiler': ['belirtiler', 'semptom', 'bulgu', 'belirti', 'işaret', 'nasıl anlaşılır', 'belirtisi'],
      'tedavi': ['tedavi', 'ilaç', 'treatment', 'medication', 'basamak', 'ilaçlar', 'tedavisi', 'nasıl tedavi'],
      'tanı': ['tanı', 'teşhis', 'diagnosis', 'test', 'muayene', 'tanısı', 'nasıl teşhis'],
      'risk': ['risk faktör', 'risk grubu', 'etken', 'neden olur', 'kimler risk', 'risk altında'],
      'komplikasyon': ['komplikasyon', 'yan etki', 'sorun', 'komplikasyonları', 'ne olabilir'],
      'epidemiyoloji': ['prevalans', 'sıklık', 'yaygın', 'kaç kişi', 'ne kadar', 'sık görülür', 'istatistik'],
      'patofizyoloji': ['patofizyoloji', 'mekanizma', 'nasıl oluşur', 'neden olur', 'nasıl gelişir', 'oluşumu'],
      'pediatri': ['çocuk', 'çocuklarda', 'bebek', 'pediatri', 'yaş', 'çocukluk', 'küçük'],
      'farmakoloji': ['ilaç grup', 'hangi ilaç', 'ilaç isim', 'farmakoloji', 'medikasyon', 'reçete'],
      'atak': ['atak', 'kriz', 'alevlenme', 'acil', 'şiddetli', 'nöbet']
    };

    // Hangi kategoriye ait soru? - TAM EŞLEŞİR
    let category = null;
    
    for (const [cat, words] of Object.entries(keywords)) {
      // Kesin eşleşme ara - sadece tam kelime varsa
      const exactMatch = words.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(question);
      });
      
      if (exactMatch) {
        category = cat;
        break;
      }
    }

    // Kategoriye göre cevap bul - SADECE VERİ VARSA DÖNDÜR
    if (category === 'belirtiler') {
      if (data.tanım && data.tanım.length > 50) {
        return `📋 **${disease.temel_bilgi.isim_tr}** hakkında:

${data.tanım}`;
      }
      // Klinik özellikler varsa ekle
      if (data.klinik_özellikler && data.klinik_özellikler.belirtiler) {
        const belirtiler = data.klinik_özellikler.belirtiler;
        return `📋 **${disease.temel_bilgi.isim_tr} Belirtileri:**

${belirtiler.map((b, i) => `${i + 1}. ${b}`).join('\n')}`;
      }
    }
    
    if (category === 'epidemiyoloji') {
      if (data.epidemiyoloji && (data.epidemiyoloji.global_prevalans || data.epidemiyoloji.türkiye_prevalans)) {
        const epi = data.epidemiyoloji;
        let answer = `📊 **Epidemiyolojik Bilgiler:**\n\n`;
        if (epi.global_prevalans) answer += `🌍 Global Prevalans: ${epi.global_prevalans}\n\n`;
        if (epi.türkiye_prevalans) answer += `🇹🇷 Türkiye Prevalans: ${epi.türkiye_prevalans}\n\n`;
        if (epi.yaş_dağılımı) answer += `👥 Yaş Dağılımı: ${epi.yaş_dağılımı}\n\n`;
        if (epi.cinsiyet) answer += `⚥ Cinsiyet: ${epi.cinsiyet}`;
        return answer;
      }
    }
    
    if (category === 'risk') {
      if (data.epidemiyoloji && data.epidemiyoloji.risk_grupları && data.epidemiyoloji.risk_grupları.length > 0) {
        return `⚠️ **Risk Faktörleri:**\n\n${data.epidemiyoloji.risk_grupları.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
      }
    }
    
    if (category === 'patofizyoloji') {
      if (data.patofizyoloji && data.patofizyoloji.ana_mekanizmalar && data.patofizyoloji.ana_mekanizmalar.length > 0) {
        return `🧬 **Patofizyoloji (Hastalık Mekanizması):**\n\n${data.patofizyoloji.ana_mekanizmalar.map((m, i) => `${i + 1}. ${m}`).join('\n\n')}`;
      }
    }

    if (category === 'pediatri') {
      // Pediatri branşını veya yaş gruplarını ara
      if (disease.branş_perspektifleri && disease.branş_perspektifleri.pediatri) {
        const pediatri = disease.branş_perspektifleri.pediatri;
        let answer = `👶 **Çocuklarda ${disease.temel_bilgi.isim_tr}:**\n\n`;
        
        // Yaş gruplarına göre tedavi varsa
        if (pediatri.yaklaşım && pediatri.yaklaşım.yaş_gruplarına_göre_tedavi) {
          const yas_grubu = pediatri.yaklaşım.yaş_gruplarına_göre_tedavi;
          answer += `**Yaş Gruplarına Göre Yaklaşım:**\n\n`;
          
          for (const [grup, bilgiler] of Object.entries(yas_grubu)) {
            const grup_adi = grup.replace(/_/g, '-');
            answer += `**${grup_adi} yaş:**\n`;
            if (Array.isArray(bilgiler)) {
              answer += bilgiler.map(b => `• ${b}`).join('\n') + '\n\n';
            }
          }
          return answer;
        }
        
        // Genel pediatrik yaklaşım
        if (pediatri.yaklaşım) {
          answer += `Pediatri branşı yaklaşımı mevcut. Detaylar için branş perspektiflerine bakınız.`;
          return answer;
        }
      }
    }

    if (category === 'tedavi' || category === 'farmakoloji') {
      // Farmakoloji bölümünü ara
      if (data.farmakoloji_ve_tedavi) {
        const tedavi = data.farmakoloji_ve_tedavi;
        let answer = `💊 **Tedavi Yaklaşımı:**\n\n`;
        
        // Genel prensipler varsa
        if (tedavi.genel_prensipler && tedavi.genel_prensipler.length > 0) {
          answer += `**Genel Prensipler:**\n`;
          answer += tedavi.genel_prensipler.slice(0, 3).map(p => `• ${p}`).join('\n') + '\n\n';
        }
        
        // Basamaklı tedavi varsa (özet)
        if (tedavi.basamaklı_tedavi_GINA) {
          answer += `**Basamaklı Tedavi (5 Basamak):**\n`;
          answer += `Hastalık şiddetine göre kademeli tedavi uygulanır.\n`;
          answer += `Detaylar için farmakoloji bölümüne bakınız.\n\n`;
        }
        
        answer += `📖 Daha detaylı tedavi bilgisi için branş perspektiflerine veya farmakoloji bölümüne bakabilirsiniz.`;
        return answer;
      }
    }

    if (category === 'komplikasyon') {
      if (data.komplikasyonlar && data.komplikasyonlar.length > 0) {
        return `⚠️ **Komplikasyonlar:**\n\n${data.komplikasyonlar.map((k, i) => `${i + 1}. ${k}`).join('\n')}`;
      }
    }

    // Hiçbir kategori eşleşmedi veya veri yok → AI'ye sor
    return null;
  };

  const renderJSON = (data, level = 0) => {
    if (data === null || data === undefined) {
      return <span className="json-null">-</span>;
    }
    
    if (typeof data === 'string') {
      // Uzun metinler için paragraf
      if (data.length > 150) {
        return <p className="json-text-long">{data}</p>;
      }
      return <span className="json-string">{data}</span>;
    }
    
    if (typeof data === 'number' || typeof data === 'boolean') {
      return <span className="json-value">{String(data)}</span>;
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) return <span className="json-empty">Bilgi yok</span>;
      
      // String dizisi - okunabilir liste
      if (data.every(item => typeof item === 'string')) {
        return (
          <ul className="readable-list">
            {data.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
      }
      
      // Obje dizisi
      return (
        <div className="json-array">
          {data.map((item, idx) => (
            <div key={idx} className="array-item">
              {renderJSON(item, level + 1)}
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof data === 'object' && data !== null) {
      return (
        <div className={`json-object level-${level}`}>
          {Object.entries(data).map(([key, value]) => {
            const isSection = typeof value === 'object' && value !== null;
            const keyTitle = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return (
              <div key={key} className={`property ${isSection ? 'section' : 'simple'}`}>
                <div className="prop-key">
                  <span className="bullet">{isSection ? '📌' : '▪'}</span>
                  <strong>{keyTitle}</strong>
                </div>
                <div className="prop-value">
                  {renderJSON(value, level + 1)}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🏥 Tıbbi Hastalık Veritabanı</h1>
        
        {/* Global Toolbar */}
        <div className="global-toolbar">
          {/* Dil Seçici */}
          <select 
            className="language-selector"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              localStorage.setItem('language', e.target.value);
            }}
          >
            <option value="tr">🇹🇷 Türkçe</option>
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
          
          {/* Karşılaştırma Modu */}
          <button 
            className={`compare-mode-btn ${compareMode ? 'active' : ''}`}
            onClick={() => {
              setCompareMode(!compareMode);
              if (compareMode) setCompareList([]);
            }}
          >
            {compareMode ? '✓ Karşılaştır' : '⚖️ Karşılaştırma Modu'}
            {compareList.length > 0 && ` (${compareList.length})`}
          </button>
          
          {/* Dark Mode */}
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Hastalık ara... (en az 2 karakter)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>Ara</button>
          </div>
          
          {/* Canlı arama sonuçları dropdown */}
          {liveResults.length > 0 && searchQuery.length >= 2 && (
            <div className="live-search-dropdown">
              <div className="live-search-header">
                {liveResults.length} sonuç bulundu
              </div>
              {liveResults.map((result) => (
                <div
                  key={result.hastalık_id}
                  className="live-search-item"
                  onClick={() => {
                    fetchDiseaseDetail(result.hastalık_id);
                    setSearchQuery('');
                    setLiveResults([]);
                  }}
                >
                  <div className="live-search-name">{result.isim_tr}</div>
                  <div className="live-search-meta">
                    <span className="live-search-code">ICD: {result.ICD_10}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {stats && (
          <div className="stats">
            <span>📊 {stats.total_diseases} Hastalık</span>
            <span>🏥 {stats.total_unique_branches} Branş</span>
          </div>
        )}
      </header>

      <div className="container">
        <nav className="sidebar">
          <button
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            📋 Hastalık Listesi
          </button>
          
          {/* Global Dashboard */}
          <button
            className={view === 'dashboard' ? 'active' : ''}
            onClick={() => setView('dashboard')}
          >
            🌍 Global Dashboard
          </button>
          
          {/* Karşılaştırma */}
          {compareList.length >= 2 && (
            <button
              className={view === 'compare' ? 'active' : ''}
              onClick={() => setView('compare')}
            >
              ⚖️ Karşılaştır ({compareList.length})
            </button>
          )}
          {selectedDisease && (
            <button
              className={view === 'detail' ? 'active' : ''}
              onClick={() => setView('detail')}
            >
              📄 Detay
            </button>
          )}
          {searchResults.length > 0 && (
            <button
              className={view === 'search' ? 'active' : ''}
              onClick={() => setView('search')}
            >
              🔍 Arama Sonuçları
            </button>
          )}
          
          {/* İstatistikler butonu */}
          {diseases.length > 0 && (
            <button
              className={view === 'stats' ? 'active' : ''}
              onClick={() => setView('stats')}
            >
              📊 İstatistikler
            </button>
          )}
          
          {/* Filtreleme bölümü */}
          {view === 'list' && diseases.length > 0 && (
            <div className="filter-section">
              <h3>🔽 Sıralama</h3>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name-asc">İsim (A → Z)</option>
                <option value="name-desc">İsim (Z → A)</option>
                <option value="icd-asc">ICD-10 (A → Z)</option>
                <option value="icd-desc">ICD-10 (Z → A)</option>
                <option value="branches-asc">Branş (Az → Çok)</option>
                <option value="branches-desc">Branş (Çok → Az)</option>
              </select>
            </div>
          )}
        </nav>

        <main className="content">
          {loading && <div className="loading">Yükleniyor...</div>}

          {/* İSTATİSTİKLER VIEW */}
          {view === 'stats' && (
            <div className="stats-dashboard">
              <h2>📊 İstatistikler ve Analizler</h2>
              
              {/* Büyük İstatistik Kartları */}
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-value">{diseases.length}</div>
                  <div className="stat-label">Toplam Hastalık</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🏥</div>
                  <div className="stat-value">
                    {stats ? stats.total_unique_branches : 0}
                  </div>
                  <div className="stat-label">Toplam Branş</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-value">
                    {new Set(diseases.map(d => d.ICD_10?.substring(0, 3))).size}
                  </div>
                  <div className="stat-label">ICD-10 Kategorisi</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-value">
                    {diseases.length > 0 ? Math.max(...diseases.map(d => d.branş_sayısı || 0)) : 0}
                  </div>
                  <div className="stat-label">Max Branş Sayısı</div>
                </div>
              </div>
              {/* Branş Dağılımı Tablosu */}
              <div className="stats-section">
                <h3>🏥 Branş Dağılımı</h3>
                <div className="branch-stats-grid">
                  {stats && stats.branch_distribution && Object.entries(stats.branch_distribution)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([branch, count]) => (
                      <div key={branch} className="branch-stat-item">
                        <div className="branch-stat-name">{branch}</div>
                        <div className="branch-stat-bar-container">
                          <div 
                            className="branch-stat-bar" 
                            style={{width: `${(count / Math.max(...Object.values(stats.branch_distribution))) * 100}%`}}
                          />
                        </div>
                        <div className="branch-stat-count">{count}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Hastalık Karşılaştırması */}
              <div className="stats-section">
                <h3>📊 Hastalık - Branş İlişkisi</h3>
                <div className="disease-comparison-grid">
                  {diseases.map((disease) => (
                    <div key={disease.hastalık_id} className="disease-comparison-item">
                      <div className="disease-comparison-name">{disease.isim_tr}</div>
                      <div className="disease-comparison-bar-container">
                        <div 
                          className="disease-comparison-bar" 
                          style={{width: `${(disease.branş_sayısı / Math.max(...diseases.map(d => d.branş_sayısı))) * 100}%`}}
                        />
                      </div>
                      <div className="disease-comparison-count">{disease.branş_sayısı} branş</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ICD-10 Kategori Analizi */}
              <div className="stats-section">
                <h3>🔖 ICD-10 Kod Kategorileri</h3>
                <div className="icd-category-grid">
                  {Array.from(new Set(diseases.map(d => d.ICD_10?.substring(0, 1))))
                    .filter(Boolean)
                    .map(letter => {
                      const count = diseases.filter(d => d.ICD_10?.startsWith(letter)).length;
                      const categoryNames = {
                        'E': 'Endokrin, Beslenme ve Metabolizma',
                        'I': 'Dolaşım Sistemi',
                        'J': 'Solunum Sistemi',
                        'K': 'Sindirim Sistemi',
                        'M': 'Kas-İskelet Sistemi'
                      };
                      return (
                        <div key={letter} className="icd-category-card">
                          <div className="icd-category-letter">{letter}</div>
                          <div className="icd-category-name">{categoryNames[letter] || 'Diğer'}</div>
                          <div className="icd-category-count">{count} hastalık</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
          {view === 'dashboard' && (
  <div className="global-dashboard">
    <h2>🌍 Global Sağlık Dashboard</h2>
    
    {/* Hero Stats */}
    <div className="dashboard-hero">
      <div className="hero-card">
        <div className="hero-icon">🌍</div>
        <div className="hero-content">
          <div className="hero-value">2.1B+</div>
          <div className="hero-label">Global Hasta (Tahmini)</div>
          <div className="hero-sublabel">9 hastalık toplamı</div>
        </div>
      </div>
      
      <div className="hero-card">
        <div className="hero-icon">🇹🇷</div>
        <div className="hero-content">
          <div className="hero-value">~25M</div>
          <div className="hero-label">Türkiye Hasta</div>
          <div className="hero-sublabel">Nüfusun %30'u</div>
        </div>
      </div>
      
      <div className="hero-card">
        <div className="hero-icon">💊</div>
        <div className="hero-content">
          <div className="hero-value">40+</div>
          <div className="hero-label">Branş Perspektifi</div>
          <div className="hero-sublabel">Multidisipliner yaklaşım</div>
        </div>
      </div>
    </div>
    
    {/* Top Hastalıklar */}
    <div className="dashboard-section">
      <h3>📊 En Yaygın Hastalıklar (Global Prevalans)</h3>
      <div className="top-diseases-chart">
        {[
          {name: 'Hipertansiyon', prevalence: '1.28B', color: '#3498db', width: 100},
          {name: 'Kronik Böbrek Hastalığı', prevalence: '850M', color: '#e67e22', width: 85},
          {name: 'Tip 2 Diabetes', prevalence: '537M', color: '#e74c3c', width: 70},
          {name: 'Osteoartrit', prevalence: '528M', color: '#9b59b6', width: 65},
          {name: 'KOAH', prevalence: '384M', color: '#95a5a6', width: 50}
        ].map((disease, idx) => (
          <div key={idx} className="chart-bar-item">
            <div className="chart-rank">#{idx + 1}</div>
            <div className="chart-disease-name">{disease.name}</div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar" 
                style={{width: `${disease.width}%`, background: disease.color}}
              >
                <span className="chart-value">{disease.prevalence}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Yaş Grupları */}
    <div className="dashboard-section">
      <h3>👥 Yaş Gruplarına Göre Risk</h3>
      <div className="age-risk-grid">
        <div className="age-card">
          <div className="age-icon">👶</div>
          <div className="age-label">0-18 yaş</div>
          <div className="age-diseases">Astım</div>
        </div>
        <div className="age-card">
          <div className="age-icon">🧑</div>
          <div className="age-label">18-40 yaş</div>
          <div className="age-diseases">Migren, GERD</div>
        </div>
        <div className="age-card">
          <div className="age-icon">👨‍🦳</div>
          <div className="age-label">40-65 yaş</div>
          <div className="age-diseases">Hipertansiyon, Diabetes</div>
        </div>
        <div className="age-card">
          <div className="age-icon">👴</div>
          <div className="age-label">65+ yaş</div>
          <div className="age-diseases">KOAH, Osteoartrit, KBH</div>
        </div>
      </div>
    </div>
    
    {/* Viral İstatistik */}
    <div className="viral-stat">
      <h3>💡 Tahmin Ediyor Muydunuz?</h3>
      <div className="viral-content">
        <div className="viral-number">1/3</div>
        <div className="viral-text">
          Her <strong>3 yetişkinden 1'i</strong> en az bir kronik hastalıkla yaşıyor
        </div>
      </div>
    </div>
  </div>
)}
          {view === 'compare' && compareList.length >= 2 && (
  <div className="compare-view">
    <h2>⚖️ Hastalık Karşılaştırması</h2>
    <p className="compare-subtitle">
      {compareList.length} hastalık karşılaştırılıyor
    </p>
    
    <div className="compare-table">
      <div className="compare-header">
        <div>Özellik</div>
        <div>{compareList[0]?.isim_tr}</div>
        {compareList[1] && <div>{compareList[1].isim_tr}</div>}
        {compareList[2] && <div>{compareList[2].isim_tr}</div>}
      </div>
      
      <div className="compare-row">
        <div className="compare-label">📋 ICD-10 Kodu</div>
        <div className="compare-cell">{compareList[0]?.ICD_10}</div>
        {compareList[1] && <div className="compare-cell">{compareList[1].ICD_10}</div>}
        {compareList[2] && <div className="compare-cell">{compareList[2].ICD_10}</div>}
      </div>
      
      <div className="compare-row">
        <div className="compare-label">🏥 Branş Sayısı</div>
        <div className="compare-cell">{compareList[0]?.branş_sayısı}</div>
        {compareList[1] && <div className="compare-cell">{compareList[1].branş_sayısı}</div>}
        {compareList[2] && <div className="compare-cell">{compareList[2].branş_sayısı}</div>}
      </div>
      
      <div className="compare-row">
        <div className="compare-label">📂 Kategori</div>
        <div className="compare-cell">
          {compareList[0]?.ICD_10?.substring(0,1)} - 
          {compareList[0]?.ICD_10?.startsWith('E') ? 'Endokrin' : 
           compareList[0]?.ICD_10?.startsWith('I') ? 'Dolaşım' :
           compareList[0]?.ICD_10?.startsWith('J') ? 'Solunum' :
           compareList[0]?.ICD_10?.startsWith('K') ? 'Sindirim' : 'Diğer'}
        </div>
        {compareList[1] && (
          <div className="compare-cell">
            {compareList[1]?.ICD_10?.substring(0,1)} - 
            {compareList[1]?.ICD_10?.startsWith('E') ? 'Endokrin' : 
             compareList[1]?.ICD_10?.startsWith('I') ? 'Dolaşım' :
             compareList[1]?.ICD_10?.startsWith('J') ? 'Solunum' :
             compareList[1]?.ICD_10?.startsWith('K') ? 'Sindirim' : 'Diğer'}
          </div>
        )}
        {compareList[2] && (
          <div className="compare-cell">
            {compareList[2]?.ICD_10?.substring(0,1)} - 
            {compareList[2]?.ICD_10?.startsWith('E') ? 'Endokrin' : 
             compareList[2]?.ICD_10?.startsWith('I') ? 'Dolaşım' :
             compareList[2]?.ICD_10?.startsWith('J') ? 'Solunum' :
             compareList[2]?.ICD_10?.startsWith('K') ? 'Sindirim' : 'Diğer'}
          </div>
        )}
      </div>
      
      <div className="compare-row">
        <div className="compare-label">🌐 İngilizce İsim</div>
        <div className="compare-cell">{compareList[0]?.isim_en}</div>
        {compareList[1] && <div className="compare-cell">{compareList[1].isim_en}</div>}
        {compareList[2] && <div className="compare-cell">{compareList[2].isim_en}</div>}
      </div>
    </div>
    
    <div className="compare-actions">
      <button 
        className="compare-btn compare-btn-clear"
        onClick={() => {
          setCompareList([]);
          setCompareMode(false);
        }}
      >
        🗑️ Temizle
      </button>
      <button className="compare-btn compare-btn-export">
        📥 PDF İndir
      </button>
      <button className="compare-btn compare-btn-share">
        🔗 Paylaş
      </button>
    </div>
  </div>
)}

{view === 'list' && (
  <>
    {/* Filtre Paneli */}
    <div className="filter-panel">
      <h3>🔍 Akıllı Filtreler</h3>
      <div className="filter-grid">
        <div className="filter-item">
          <label>ICD-10 Kategori</label>
          <select 
            value={filters.icdCategory} 
            onChange={(e) => setFilters({...filters, icdCategory: e.target.value})}
          >
            <option value="">Tümü</option>
            <option value="E">E - Endokrin, Beslenme, Metabolizma</option>
            <option value="I">I - Dolaşım Sistemi</option>
            <option value="J">J - Solunum Sistemi</option>
            <option value="K">K - Sindirim Sistemi</option>
            <option value="M">M - Kas-İskelet Sistemi</option>
            <option value="N">N - Genitoüriner Sistem</option>
          </select>
        </div>
        
        <div className="filter-item">
          <label>Yaş Grubu</label>
          <select 
            value={filters.ageGroup} 
            onChange={(e) => setFilters({...filters, ageGroup: e.target.value})}
          >
            <option value="">Tümü</option>
            <option value="pediatric">👶 Çocuk (0-18 yaş)</option>
            <option value="adult">🧑 Yetişkin (18-65 yaş)</option>
            <option value="geriatric">👴 Yaşlı (65+ yaş)</option>
          </select>
        </div>
        
        <div className="filter-item">
          <label>Tedavi Tipi</label>
          <select 
            value={filters.treatmentType} 
            onChange={(e) => setFilters({...filters, treatmentType: e.target.value})}
          >
            <option value="">Tümü</option>
            <option value="medical">💊 Tıbbi Tedavi</option>
            <option value="surgical">🔪 Cerrahi</option>
            <option value="lifestyle">🏃 Yaşam Tarzı</option>
            <option value="combined">🔄 Kombine</option>
          </select>
        </div>
        
        <div className="filter-item">
          <label>Şiddet</label>
          <select 
            value={filters.severity} 
            onChange={(e) => setFilters({...filters, severity: e.target.value})}
          >
            <option value="">Tümü</option>
            <option value="mild">🟢 Hafif</option>
            <option value="moderate">🟡 Orta</option>
            <option value="severe">🔴 Şiddetli</option>
          </select>
        </div>
      </div>
      
      <div className="filter-actions">
        <button 
          className="filter-btn filter-btn-apply"
          onClick={() => {
            // Filtreleme mantığı buraya
            console.log('Filtreler uygulandı:', filters);
          }}
        >
          ✅ Uygula
        </button>
        <button 
          className="filter-btn filter-btn-reset"
          onClick={() => setFilters({icdCategory:'',ageGroup:'',severity:'',treatmentType:''})}
        >
          🔄 Sıfırla
        </button>
      </div>
    </div>
    
    {/* Hastalık Listesi */}
    <div className="disease-list">
      <h2>Hastalık Listesi</h2>
      {getSortedDiseases()
        .filter(d => {
          // ICD Kategori filtresi
          if (filters.icdCategory && !d.ICD_10?.startsWith(filters.icdCategory)) return false;
          // Diğer filtreler buraya eklenebilir
          return true;
        })
        .map((disease) => (
        <div
          key={disease.hastalık_id}
          className="disease-card"
          onClick={() => {
            if (compareMode) {
              // Karşılaştırma modunda checkbox toggle
              if (compareList.find(d => d.hastalık_id === disease.hastalık_id)) {
                setCompareList(compareList.filter(d => d.hastalık_id !== disease.hastalık_id));
              } else if (compareList.length < 3) {
                setCompareList([...compareList, disease]);
              }
            } else {
              fetchDiseaseDetail(disease.hastalık_id);
            }
          }}
          style={{
            cursor: compareMode ? 'pointer' : 'pointer',
            border: compareMode && compareList.find(d => d.hastalık_id === disease.hastalık_id) ? '3px solid #27ae60' : ''
          }}
        >
          {compareMode && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: compareList.find(d => d.hastalık_id === disease.hastalık_id) ? '#27ae60' : '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {compareList.find(d => d.hastalık_id === disease.hastalık_id) ? '✓' : ''}
            </div>
          )}
          <h3>{disease.isim_tr}</h3>
          <p className="disease-en">{disease.isim_en}</p>
          <div className="disease-meta">
            <span className="icd-code">ICD-10: {disease.ICD_10}</span>
            <span className="branch-count">
              {disease.branş_sayısı} Branş
            </span>
          </div>
        </div>
      ))}
    </div>
  </>
)}
          {view === 'list' && (
            <div className="disease-list">
              <h2>Hastalık Listesi</h2>
              {getSortedDiseases().map((disease) => (
                <div
                  key={disease.hastalık_id}
                  className="disease-card"
                  onClick={() => fetchDiseaseDetail(disease.hastalık_id)}
                >
                  <h3>{disease.isim_tr}</h3>
                  <p className="disease-en">{disease.isim_en}</p>
                  <div className="disease-meta">
                    <span className="icd-code">ICD-10: {disease.ICD_10}</span>
                    <span className="branch-count">
                      {disease.branş_sayısı} Branş
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'detail' && selectedDisease && (
            <div className="disease-detail">
              <div className="detail-header">
                <button className="back-button" onClick={() => setView('list')}>
                  ← Geri
                </button>
                <div className="detail-header-buttons">
                  <button 
                    className="ai-assistant-button"
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                  >
                    🤖 AI Asistan
                  </button>
                  {ORGAN_MAPPINGS[selectedDisease.hastalık_id] && (
                    <button 
                      className="anatomy-3d-button"
                      onClick={() => setShow3DAnatomy(!show3DAnatomy)}
                    >
                      🫁 3D Anatomi
                    </button>
                  )}
                </div>
              </div>
              
              {/* 3D Anatomi Modal */}
              {show3DAnatomy && ORGAN_MAPPINGS[selectedDisease.hastalık_id] && (
                <div className="anatomy-3d-modal">
                  <div className="anatomy-3d-content">
                    <div className="anatomy-3d-header">
                      <h3>🫁 3D Anatomik Görünüm</h3>
                      <button onClick={() => {
                        setShow3DAnatomy(false);
                        setSelectedOrgan(null);
                      }}>✕</button>
                    </div>
                    
                    <p className="anatomy-helper-text">
                      <strong>{selectedDisease.temel_bilgi.isim_tr}</strong> hastalığının etkilediği organlar
                    </p>
                    
                    {/* Organ Grid */}
                    <div className="organ-grid">
                      {ORGAN_MAPPINGS[selectedDisease.hastalık_id].organs.map((organ, index) => (
                        <div 
                          key={index}
                          className={`organ-card ${selectedOrgan === index ? 'selected' : ''} severity-${organ.severity}`}
                          onClick={() => setSelectedOrgan(selectedOrgan === index ? null : index)}
                        >
                          <div 
                            className="organ-visual"
                            style={{
                              background: `linear-gradient(135deg, ${organ.color}dd, ${organ.color})`
                            }}
                          >
                            <div className="organ-pulse"></div>
                            <span className="organ-icon">
                              {organ.name.includes('Kalp') ? '🫀' :
                               organ.name.includes('Akciğer') ? '🫁' :
                               organ.name.includes('Böbrek') ? '🫘' :
                               organ.name.includes('Pankreas') ? '🥞' :
                               organ.name.includes('Beyin') ? '🧠' :
                               organ.name.includes('Göz') ? '👁️' :
                               organ.name.includes('Sinir') ? '⚡' :
                               organ.name.includes('Hava') ? '💨' :
                               organ.name.includes('İmmün') ? '🛡️' : '🔬'}
                            </span>
                          </div>
                          <div className="organ-info">
                            <h4>{organ.name}</h4>
                            <div className={`severity-badge severity-${organ.severity}`}>
                              {organ.severity === 'high' ? '⚠️ Yüksek Etki' : 
                               organ.severity === 'medium' ? '⚡ Orta Etki' : '💡 Düşük Etki'}
                            </div>
                          </div>
                          {selectedOrgan === index && (
                            <div className="organ-description">
                              <p>{organ.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="anatomy-legend">
                      <h4>📖 Etkilenme Düzeyi:</h4>
                      <div className="legend-items">
                        <div className="legend-item">
                          <span className="legend-dot high"></span>
                          <span>Yüksek Etki - Majör organ hasarı</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-dot medium"></span>
                          <span>Orta Etki - Komplikasyon riski</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-dot low"></span>
                          <span>Düşük Etki - Minör etkilenme</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="anatomy-note">
                      💡 <strong>İpucu:</strong> Organ kartlarına tıklayarak detaylı etkilenme bilgilerini görebilirsiniz.
                    </p>
                  </div>
                </div>
              )}
              
              {/* AI Asistan Modal */}
              {showAIAssistant && (
                <div className="ai-assistant-modal">
                  <div className="ai-assistant-content">
                    <div className="ai-assistant-header">
                      <h3>🤖 AI Tıbbi Asistan</h3>
                      <button onClick={() => {
                        setShowAIAssistant(false);
                        setAiResponse('');
                        setAiQuestion('');
                      }}>✕</button>
                    </div>
                    <p className="ai-helper-text">
                      <strong>{selectedDisease.temel_bilgi.isim_tr}</strong> hakkında soru sorabilirsiniz
                    </p>
                    
                    {/* Örnek Sorular */}
                    {!aiResponse && (
                      <div className="example-questions">
                        <p className="example-title">💡 Örnek Sorular:</p>
                        <div className="example-buttons">
                          <button onClick={() => setAiQuestion('Belirtileri nelerdir?')}>
                            Belirtileri nelerdir?
                          </button>
                          <button onClick={() => setAiQuestion('Tedavi seçenekleri neler?')}>
                            Tedavi seçenekleri neler?
                          </button>
                          <button onClick={() => setAiQuestion('Risk faktörleri nelerdir?')}>
                            Risk faktörleri nelerdir?
                          </button>
                          <button onClick={() => setAiQuestion('Ne kadar yaygın?')}>
                            Ne kadar yaygın?
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="ai-question-input">
                      <textarea
                        placeholder="Sorunuzu yazın... (Örn: Bu hastalığın en yaygın belirtileri nelerdir?)"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        rows={3}
                      />
                      <button onClick={handleAIQuestion} disabled={loading}>
                        {loading ? '🔄 Düşünüyor...' : '🚀 Sor'}
                      </button>
                    </div>
                    {aiResponse && (
                      <div className="ai-response">
                        <strong>📝 Cevap:</strong>
                        <p style={{whiteSpace: 'pre-wrap'}}>{aiResponse}</p>
                        <button 
                          className="new-question-btn"
                          onClick={() => {
                            setAiResponse('');
                            setAiQuestion('');
                          }}
                        >
                          ➕ Yeni Soru Sor
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <h2>{selectedDisease.temel_bilgi.isim_tr}</h2>
              <p className="disease-en">{selectedDisease.temel_bilgi.isim_en}</p>
              
              {/* KATEGORİ TABLARI */}
              <div className="category-tabs-container">
                <div className="category-tabs">
                  {MEDICAL_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        if (cat.id !== 'brans') {
                          setSelectedBranch(null);
                          setBranchData(null);
                        }
                      }}
                      style={{
                        borderBottom: selectedCategory === cat.id ? `3px solid ${cat.color}` : 'none',
                        color: selectedCategory === cat.id ? cat.color : '#95a5a6'
                      }}
                    >
                      <span className="cat-icon">{cat.icon}</span>
                      <span className="cat-label">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* KATEGORİ İÇERİĞİ */}
              <div className="category-content">
                {selectedCategory === 'temel' && (
                  <div className="content-section">
                    <div className="info-card">
                      <h3>📖 Tanım</h3>
                      <p>{selectedDisease.temel_bilgi.tanım}</p>
                    </div>
                    
                    <div className="info-card">
                      <h3>📊 Epidemiyoloji</h3>
                      {renderJSON(selectedDisease.temel_bilgi.epidemiyoloji)}
                    </div>
                    
                    <div className="info-card">
                      <h3>🏷️ Kodlama Sistemleri</h3>
                      <p><strong>ICD-10:</strong> {selectedDisease.temel_bilgi.kodlama.ICD_10}</p>
                      <p><strong>SNOMED CT:</strong> {selectedDisease.temel_bilgi.kodlama.SNOMED_CT}</p>
                      {selectedDisease.temel_bilgi.kodlama.LOINC && (
                        <p><strong>LOINC:</strong> {selectedDisease.temel_bilgi.kodlama.LOINC}</p>
                      )}
                      {selectedDisease.temel_bilgi.kodlama.ICD_10_detay && (
                        <div style={{marginTop: '1rem'}}>
                          <strong>ICD-10 Alt Kodları:</strong>
                          <div className="icd-codes-grid">
                            {Object.entries(selectedDisease.temel_bilgi.kodlama.ICD_10_detay).slice(0,6).map(([code, desc]) => (
                              <div key={code} className="icd-code-pill">
                                <span className="code">{code}</span>
                                <span className="desc">{desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedCategory === 'patofizyoloji' && (
                  <div className="content-section">
                    <div className="info-card">
                      <h3>🔬 Patofizyolojik Mekanizmalar</h3>
                      {selectedDisease.patofizyoloji && renderJSON(selectedDisease.patofizyoloji)}
                      {!selectedDisease.patofizyoloji && (
                        <p className="no-data">⚠️ Patofizyoloji bilgisi bulunmamaktadır</p>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedCategory === 'klinik' && (
                  <div className="content-section">
                    {selectedDisease.klinik_özellikler && (
                      <div className="info-card">
                        <h3>🩺 Klinik Özellikler & Semptomlar</h3>
                        {renderJSON(selectedDisease.klinik_özellikler)}
                      </div>
                    )}
                    
                    {selectedDisease.tanı && (
                      <div className="info-card">
                        <h3>🔍 Tanı Kriterleri & Testler</h3>
                        {renderJSON(selectedDisease.tanı)}
                      </div>
                    )}
                  </div>
                )}
                
                {selectedCategory === 'tedavi' && (
                  <div className="content-section">
                    {selectedDisease.farmakoloji_ve_tedavi && (
                      <div className="info-card">
                        <h3>💊 Farmakolojik ve Non-Farmakolojik Tedavi</h3>
                        {renderJSON(selectedDisease.farmakoloji_ve_tedavi)}
                      </div>
                    )}
                    {!selectedDisease.farmakoloji_ve_tedavi && (
                      <p className="no-data">⚠️ Tedavi bilgisi bulunmamaktadır</p>
                    )}
                  </div>
                )}
                
                {selectedCategory === 'radyoloji' && (
                  <div className="content-section">
                    {selectedDisease.tanı?.radyoloji && (
                      <div className="info-card">
                        <h3>📡 Radyolojik Değerlendirme</h3>
                        {renderJSON(selectedDisease.tanı.radyoloji)}
                      </div>
                    )}
                    {selectedDisease.tanı?.görüntüleme && (
                      <div className="info-card">
                        <h3>🖼️ Görüntüleme Modaliteleri</h3>
                        {renderJSON(selectedDisease.tanı.görüntüleme)}
                      </div>
                    )}
                    {!selectedDisease.tanı?.radyoloji && !selectedDisease.tanı?.görüntüleme && (
                      <p className="no-data">⚠️ Radyoloji bilgisi bulunmamaktadır</p>
                    )}
                  </div>
                )}
                
                {selectedCategory === 'prognoz' && (
                  <div className="content-section">
                    {selectedDisease.komplikasyonlar && (
                      <div className="info-card">
                        <h3>⚠️ Komplikasyonlar</h3>
                        {renderJSON(selectedDisease.komplikasyonlar)}
                      </div>
                    )}
                    
                    {selectedDisease.prognoz && (
                      <div className="info-card">
                        <h3>📈 Prognoz & Seyir</h3>
                        {renderJSON(selectedDisease.prognoz)}
                      </div>
                    )}
                    
                    {!selectedDisease.komplikasyonlar && !selectedDisease.prognoz && (
                      <p className="no-data">⚠️ Prognoz bilgisi bulunmamaktadır</p>
                    )}
                  </div>
                )}
                
                {selectedCategory === 'brans' && (
                  <div className="content-section">
                    <div className="branch-selector-card">
                      <h3>🏥 Branş Perspektifi Seçin</h3>
                      <p className="helper-text">
                        Her branşın hastalığa yaklaşımı, tanı ve tedavi stratejileri farklılık gösterir
                      </p>
                      
                      <div className="branch-grid">
                        {branches.map((branch) => (
                          <button
                            key={branch.branch_name}
                            className={`branch-card-button ${
                              selectedBranch === branch.branch_name ? 'active' : ''
                            }`}
                            onClick={() =>
                              fetchBranchData(selectedDisease.hastalık_id, branch.branch_name)
                            }
                          >
                            <span className="branch-icon">🏥</span>
                            <span className="branch-name">{branch.branch_name_tr}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {branchData && (
                      <div className="info-card branch-content-card">
                        <h3>🏥 {branchData.branch_name_tr || selectedBranch} Perspektifi</h3>
                        {renderJSON(branchData.data)}
                      </div>
                    )}
                    
                    {!branchData && (
                      <div className="no-selection-message">
                        <span className="icon">👆</span>
                        <p>Yukarıdan bir branş seçerek o branşın perspektifini görüntüleyin</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'search' && (
            <div className="search-results">
              <h2>Arama Sonuçları: "{searchQuery}"</h2>
              <p>{searchResults.length} sonuç bulundu</p>
              {searchResults.map((result) => (
                <div
                  key={result.hastalık_id}
                  className="search-result-card"
                  onClick={() => fetchDiseaseDetail(result.hastalık_id)}
                >
                  <h3>{result.isim_tr}</h3>
                  <p className="disease-en">{result.isim_en}</p>
                  <p className="disease-description">{result.tanım}</p>
                  <span className="icd-code">ICD-10: {result.ICD_10}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

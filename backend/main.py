"""
Tıbbi Hastalık Veritabanı - Backend API
FastAPI ile RESTful API servisi
"""

import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict
from pydantic import BaseModel
import json
from pathlib import Path
import httpx

# FastAPI uygulaması
app = FastAPI(
    title="Tıbbi Hastalık Veritabanı API",
    description="Multidisipliner hastalık bilgi sistemi",
    version="1.0.0"
)

# CORS ayarları (Frontend'den erişim için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Prodüksiyonda sadece frontend URL'i
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory veritabanı (JSON dosyalarından yüklenecek)
diseases_db: Dict[str, dict] = {}

def load_diseases():
    """JSON dosyalarından hastalıkları yükle"""
    global diseases_db
    data_dir = Path(__file__).parent
    json_files = [
        "tip2_diyabet_H001_COMPLETE.json",
        "H002_hipertansiyon_COMPLETE.json",
        "H003_koah_COMPLETE.json",
        "H004_astim_COMPLETE.json",
        "H005_koroner_arter_hastaligi_COMPLETE.json",
        "H006_gerd_COMPLETE.json",
        "H007_hipotiroidi_COMPLETE.json",
        "H008_migren_COMPLETE.json",
        "H009_osteoartrit_COMPLETE.json",
        "H010_kronik_bobrek_hastaligi_COMPLETE.json"
    ]
    
    for filename in json_files:
        filepath = data_dir / filename
        if filepath.exists():
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    disease_id = data.get("hastalık_id")
                    if disease_id:
                        diseases_db[disease_id] = data
                        print(f"✓ Yüklendi: {data.get('temel_bilgi', {}).get('isim_tr', disease_id)}")
            except Exception as e:
                print(f"✗ Hata ({filename}): {e}")
    
    print(f"✓ Toplam {len(diseases_db)} hastalık yüklendi")

# Başlangıçta hastalıkları yükle
@app.on_event("startup")
async def startup_event():
    load_diseases()
    print("✓ API hazır!")

@app.get("/")
async def root():
    """API ana sayfa"""
    return {
        "message": "Tıbbi Hastalık Veritabanı API",
        "version": "1.0.0",
        "endpoints": {
            "hastalıklar": "/diseases",
            "hastalık_detay": "/diseases/{disease_id}",
            "branş_bilgisi": "/diseases/{disease_id}/branch/{branch_name}",
            "arama": "/search?q=...",
            "istatistikler": "/stats"
        }
    }

@app.get("/diseases")
async def get_all_diseases(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """Tüm hastalıkları listele"""
    try:
        all_diseases = list(diseases_db.values())
        total = len(all_diseases)
        
        # Sayfalama
        paginated = all_diseases[skip:skip+limit]
        
        # Özet bilgi döndür
        results = []
        for disease in paginated:
            temel_bilgi = disease.get("temel_bilgi", {})
            results.append({
                "hastalık_id": disease.get("hastalık_id"),
                "isim_tr": temel_bilgi.get("isim_tr"),
                "isim_en": temel_bilgi.get("isim_en"),
                "ICD_10": temel_bilgi.get("kodlama", {}).get("ICD_10"),
                "branş_sayısı": len(disease.get("branş_perspektifleri", {}))
            })
        
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "diseases": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/diseases/{disease_id}")
async def get_disease(disease_id: str):
    """Belirli bir hastalığın tam bilgisi"""
    disease = diseases_db.get(disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Hastalık bulunamadı")
    return disease

@app.get("/diseases/{disease_id}/branches")
async def get_disease_branches(disease_id: str):
    """Hastalığın branşlarını listele"""
    disease = diseases_db.get(disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Hastalık bulunamadı")
    
    branches = []
    if "branş_perspektifleri" in disease:
        for branch_name in disease["branş_perspektifleri"].keys():
            branches.append({
                "branch_name": branch_name,
                "branch_name_tr": branch_name.replace("_", " ").title()
            })
    
    return {
        "disease_id": disease_id,
        "disease_name": disease.get("temel_bilgi", {}).get("isim_tr", ""),
        "branches": branches
    }

@app.get("/diseases/{disease_id}/branch/{branch_name}")
async def get_branch_info(disease_id: str, branch_name: str):
    """Hastalığın belirli bir branş perspektifi"""
    disease = diseases_db.get(disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Hastalık bulunamadı")
    
    branch_data = disease.get("branş_perspektifleri", {}).get(branch_name)
    if not branch_data:
        raise HTTPException(status_code=404, detail="Branş bulunamadı")
    
    return {
        "disease_id": disease_id,
        "disease_name": disease.get("temel_bilgi", {}).get("isim_tr", ""),
        "branch_name": branch_name,
        "data": branch_data
    }

@app.get("/search")
async def search_diseases(
    q: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50)
):
    """Hastalık arama (isim veya tanımda)"""
    query_lower = q.lower()
    results = []
    
    for disease_id, disease in diseases_db.items():
        temel_bilgi = disease.get("temel_bilgi", {})
        isim_tr = temel_bilgi.get("isim_tr", "").lower()
        isim_en = temel_bilgi.get("isim_en", "").lower()
        tanim = temel_bilgi.get("tanım", "").lower()
        
        if query_lower in isim_tr or query_lower in isim_en or query_lower in tanim:
            results.append({
                "hastalık_id": disease_id,
                "isim_tr": temel_bilgi.get("isim_tr"),
                "isim_en": temel_bilgi.get("isim_en"),
                "tanım": temel_bilgi.get("tanım", "")[:200] + "...",
                "ICD_10": temel_bilgi.get("kodlama", {}).get("ICD_10")
            })
    
    return {
        "query": q,
        "count": len(results[:limit]),
        "results": results[:limit]
    }

@app.get("/stats")
async def get_statistics():
    """Veritabanı istatistikleri"""
    all_branches = set()
    branch_distribution = {}
    
    for disease in diseases_db.values():
        if "branş_perspektifleri" in disease:
            for branch in disease["branş_perspektifleri"].keys():
                all_branches.add(branch)
                branch_distribution[branch] = branch_distribution.get(branch, 0) + 1
    
    return {
        "total_diseases": len(diseases_db),
        "total_unique_branches": len(all_branches),
        "total_branch_perspectives": sum(branch_distribution.values()),
        "branches": sorted(list(all_branches)),
        "branch_distribution": branch_distribution,
        "diseases_list": [
            {
                "id": d.get("hastalık_id"),
                "name": d.get("temel_bilgi", {}).get("isim_tr")
            }
            for d in diseases_db.values()
        ]
    }

@app.post("/reload-database")
async def reload_database():
    """Veritabanını yeniden yükle"""
    diseases_db.clear()
    load_diseases()
    return {
        "message": "Veritabanı yeniden yüklendi",
        "total_diseases": len(diseases_db)
    }

# AI Asistan için model
class AIQuestionRequest(BaseModel):
    disease_id: str
    question: str
    disease_name: str
    disease_description: str

@app.post("/ai-ask")
async def ai_ask(request: AIQuestionRequest):
    """AI'ye soru sor (Claude API üzerinden)"""
    
    # Anthropic API Key - Environment variable'dan al
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    
    if not api_key:
        return {
            "success": False,
            "answer": "AI servisi yapılandırılmamış. Lütfen sistem yöneticisine başvurun.",
            "error": "API key not configured"
        }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 1024,
                    "messages": [{
                        "role": "user",
                        "content": f"""Sen bir tıbbi hastalık uzmanısın. Aşağıdaki hastalık hakkında soruyu cevapla:

Hastalık: {request.disease_name}
Tanım: {request.disease_description}

Soru: {request.question}

Lütfen kısa, net ve anlaşılır bir şekilde cevapla."""
                    }]
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                ai_text = ""
                for content in data.get("content", []):
                    if content.get("type") == "text":
                        ai_text = content.get("text", "")
                        break
                
                return {
                    "success": True,
                    "answer": ai_text,
                    "source": "claude_ai"
                }
            else:
                return {
                    "success": False,
                    "answer": "AI servisi şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin.",
                    "error": f"API Error: {response.status_code}"
                }
                
    except Exception as e:
        return {
            "success": False,
            "answer": f"AI servisi bağlantı hatası: {str(e)}",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

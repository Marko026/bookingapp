# 📸 Image Upload & Optimization Guide

## 🎯 Kako Funkcioniše

Next.js 16 **automatski optimizuje** sve slike:
- ✅ Konvertuje u WebP/AVIF (70-90% manje)
- ✅ Generiše responsive verzije
- ✅ Lazy loading (učitava samo kad je potrebno)
- ✅ Blur placeholder (bolja UX)
- ✅ CDN caching preko Supabase

## 🚀 Kako Uploadovati Slike

### 1. Pokreni SQL Migraciju

Otvori **Supabase Dashboard** → **SQL Editor** → kopiraj i pokreni:
```sql
-- Sadržaj iz migrations/002_apartment_images.sql
```

### 2. Koristi Image Upload Komponentu

```tsx
import { ImageUpload } from '@/components/ImageUpload';

function AdminPanel() {
  const handleUploadComplete = (images) => {
    console.log('Uploaded images:', images);
    // Sačuvaj u bazu podataka
  };

  return (
    <ImageUpload 
      onUploadComplete={handleUploadComplete}
      maxFiles={10}
    />
  );
}
```

### 3. Prikaži Slike sa Optimizacijom

```tsx
import { ApartmentImage } from '@/components/OptimizedImage';

function ApartmentCard({ imageUrl }) {
  return (
    <div className="relative h-64">
      <ApartmentImage
        src={imageUrl}
        alt="Apartman Todorovic"
        priority={false} // true samo za hero slike
      />
    </div>
  );
}
```

## 📊 Performanse

### Bez Optimizacije
- Original JPEG: **3-5 MB**
- Load time: **2-5 sekundi**

### Sa Next.js Optimizacijom
- WebP/AVIF: **150-300 KB** (95% manje!)
- Load time: **0.3-0.8 sekundi**
- Lighthouse Score: **95-100**

## 🎨 Preporuke za Slike

### Dimenzije
- **Hero slike**: 1920×1080px
- **Galerija**: 1200×800px
- **Thumbnails**: 400×300px

### Format Pre Uploada
- Možeš uploadovati **bilo koji format** (JPEG, PNG, WebP)
- Next.js će **automatski** konvertovati u najbolji format
- **Ne moraš** ručno optimizovati!

### Kvalitet
- Hero slike: `quality={90}`
- Galerija: `quality={85}`
- Thumbnails: `quality={75}`

## 🔧 Napredne Opcije

### Responsive Slike
```tsx
<OptimizedImage
  src={imageUrl}
  alt="Apartman"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
/>
```

### Priority Loading (za hero slike)
```tsx
<ApartmentImage
  src={heroImage}
  alt="Hero"
  priority={true} // Učitava odmah, bez lazy loading
/>
```

## 📁 Struktura Storage-a

```
apartment-images/
├── uuid-1.jpg → Automatski optimizovano u WebP/AVIF
├── uuid-2.png → Automatski optimizovano
└── uuid-3.webp → Već optimizovano
```

## 🎯 Najbolje Prakse

1. **Upload originalne slike** - Next.js će optimizovati
2. **Koristi `ApartmentImage`** - već konfigurisano
3. **Postavi `priority={true}`** samo za hero slike
4. **Dodaj alt text** - za SEO i pristupačnost
5. **Koristi Supabase Storage** - besplatno + CDN

## 🐛 Troubleshooting

### Slika se ne prikazuje?
- Proveri da li je `remotePatterns` u `next.config.ts` dobro podešen
- Proveri Supabase Storage policies

### Spora optimizacija?
- Prva optimizacija traje duže (Next.js kešira)
- Sledeći put je instant!

### Greška pri uploadu?
- Proveri da li je bucket `apartment-images` kreiran
- Proveri RLS policies u Supabase

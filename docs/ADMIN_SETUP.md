# ⚙️ Setup Instructions - Admin Authentication

## 1. Dodaj Admin Email Adrese u `.env.local`

Otvori `.env.local` fajl i dodaj ove linije na kraj:

```bash
# Admin Email Addresses
NEXT_PUBLIC_ADMIN_EMAIL_1=tvoj-email@example.com
NEXT_PUBLIC_ADMIN_EMAIL_2=majka-email@example.com

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Zameni sa pravim email adresama!**

---

## 2. Kreiraj Admin User-e u Supabase

### Metoda: Supabase Dashboard (NAJLAKŠE)

1. Otvori **Supabase Dashboard**: https://supabase.com/dashboard

2. Izaberi svoj projekat: `apartmani-todorovic`

3. Klikni **Authentication** (levo u sidebar-u)

4. Klikni **Users**

5. Klikni **"Add User"** button (zeleni, gore desno)

6. Popuni formu:
   ```
   Email: tvoj-email@example.com
   Password: IzaberiJakuLozinku123!
   Auto Confirm User: ✅ (obavezno uključi!)
   ```

7. Klikni **"Create User"**

8. **PONOVI** za drugi admin (majka):
   ```
   Email: majka-email@example.com
   Password: Jednostavna123! (kasnije može promeniti)
   Auto Confirm User: ✅
   ```

9. ✅ Gotovo! Sada imaš 2 admin user-a

---

## 3. Testiranje

### Test Login:

1. **Restart dev server:**
   ```bash
   # Zaustavi trenutni server (Ctrl+C)
   # Pokreni ponovo:
   npm run dev
   ```

2. **Otvori:** `http://localhost:3000/admin`

3. **Unesi:**
   - Email: `tvoj-email@example.com`
   - Lozinka: `IzaberiJakuLozinku123!`
   - ☑ Zapamti me

4. **Klikni:** "Uloguj se"

5. **Rezultat:** ✅ Trebalo bi da uđeš u dashboard!

### Test Logout:

1. Klikni **"Logout"** (gore desno)
2. Trebalo bi da se vratiš na login screen

### Test Session:

1. Uloguj se ponovo
2. **Zatvori tab**
3. **Otvori ponovo:** `http://localhost:3000/admin`
4. **Rezultat:** ✅ Trebalo bi da si automatski ulogovan!

---

## 4. Produkcija

Pre deploy-a na produkciju:

1. **Ažuriraj `.env.local`:**
   ```bash
   NEXT_PUBLIC_SITE_URL=https://apartmani-todorovic.com
   ```

2. **Deploy na Vercel/Netlify**

3. **Dodaj environment variables** u Vercel/Netlify dashboard:
   - `ADMIN_EMAIL_1`
   - `ADMIN_EMAIL_2`
   - `NEXT_PUBLIC_SITE_URL`

4. **Test na live sajtu!**

---

## 5. Dodatno (Opciono)

### Promeni Password:

1. Otvori Supabase Dashboard
2. Authentication → Users
3. Klikni na user-a
4. Klikni **"Reset Password"**
5. Korisniku stiže email sa linkom

### Dodaj Novog Admina:

1. Dodaj email u `.env.local` kao `ADMIN_EMAIL_3`
2. Kreiraj user-a u Supabase
3. Gotovo!

### Ukloni Admina:

1. Obriši email iz `.env.local`
2. Opciono: obriši user-a iz Supabase

---

## Troubleshooting

**Problem:** Login ne radi
- Proveri da li si kreirao user-a u Supabase
- Proveri da li je email tačan u `.env.local`
- Proveri browser console za errors

**Problem:** "Nemate administratorska prava"
- Email nije u `ADMIN_EMAIL_1` ili `ADMIN_EMAIL_2`
- Dodaj u `.env.local` i restartuj server

**Problem:** Session ne radi
- Očisti browser cookies
- Proveri da li je Supabase URL tačan

---

**Gotovo!** 🎉 Admin authentication je setup-ovan!

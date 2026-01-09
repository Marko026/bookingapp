# Resend Email Setup - Uputstvo

## Problem koji smo rešili

Aplikacija je koristila test email adresu `onboarding@resend.dev` koja **ne dostavlja emailove**. Zato su emailovi prikazivani kao "poslati" ali nisu stizali.

## Šta je urađeno

1. ✅ Kod je ažuriran da koristi `RESEND_FROM_EMAIL` environment varijablu
2. ✅ Dodato bolje logovanje grešaka
3. ✅ Provera Resend API odgovora

## Šta MORAŠ da uradiš da bi emailovi stigli

### Korak 1: Verifikuj Email Adresu u Resend-u

1. Idi na [Resend Dashboard](https://resend.com/domains)
2. Klikni na **"Domains"** u meniju
3. Klikni **"Add Domain"** ili **"Verify Email"**

**VAŽNO:** Imaš 2 opcije:

#### Opcija A: Verifikuj Domen (Preporučeno za produkciju)
- Dodaj svoj domen (npr. `apartmanitodorovic.com`)
- Dodaj DNS rekorde koje ti Resend prikaže
- Čekaj verifikaciju (može trajati do 24h)
- Koristiš: `rezervacije@apartmanitodorovic.com`

#### Opcija B: Verifikuj Email Adresu (Brzo za testiranje)
- Klikni **"Verify Single Sender"**
- Unesi svoju Gmail adresu: `markecpartizan@gmail.com`
- Proveri inbox i klikni na verifikacioni link
- Koristiš: `markecpartizan@gmail.com`

### Korak 2: Dodaj u `.env.local`

Otvori `.env.local` fajl i dodaj:

```env
RESEND_FROM_EMAIL=markecpartizan@gmail.com
```

**Ili** ako si verifikovao domen:

```env
RESEND_FROM_EMAIL=rezervacije@apartmanitodorovic.com
```

### Korak 3: Restartuj Server

```bash
npm run dev
```

### Korak 4: Testiraj

1. Kreiraj test rezervaciju
2. Proveri konzolu - trebalo bi da vidiš:
   ```
   ✅ Emails sent successfully: {
     guestEmailId: 'xxx',
     adminEmailId: 'yyy',
     from: 'markecpartizan@gmail.com',
     ...
   }
   ```
3. Proveri inbox - email bi trebalo da stigne!

## Troubleshooting

### Email ne stiže?

1. **Proveri Resend Dashboard:**
   - Idi na [Resend Emails](https://resend.com/emails)
   - Vidi status emaila (Delivered, Bounced, Failed)

2. **Proveri Spam folder**

3. **Proveri konzolu za greške:**
   ```
   ❌ Guest email error: ...
   ```

4. **Proveri da li je email verifikovan:**
   - Mora biti zelena kvačica u Resend Dashboard

### Greška: "Email address not verified"

- Nisi verifikovao email/domen u Resend-u
- Rešenje: Završi Korak 1 gore

### Greška: "Invalid API key"

- Proveri da li je `RESEND_API_KEY` ispravan u `.env.local`
- Kreiraj novi API key na [Resend API Keys](https://resend.com/api-keys)

## Za Produkciju (Vercel)

Kada deployas na Vercel:

1. Idi na **Project Settings → Environment Variables**
2. Dodaj:
   - `RESEND_API_KEY` = tvoj API key
   - `RESEND_FROM_EMAIL` = verifikovana email adresa
   - `NEXT_PUBLIC_ADMIN_EMAIL_1` = markecpartizan@gmail.com
   - `NEXT_PUBLIC_ADMIN_EMAIL_2` = jtodorovic059@gmail.com
3. Redeploy aplikaciju

## Napomene

- **Resend Free Plan:** 100 emailova/dan, 3,000/mesec
- **Preporuka:** Verifikuj domen za profesionalan izgled
- **Spam:** Verifikovani domen smanjuje šansu da email ode u spam

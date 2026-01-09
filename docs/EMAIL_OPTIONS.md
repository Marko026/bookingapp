# Opcije za Slanje Email-ova

Za vašu booking aplikaciju, potrebna je pouzdana opcija za slanje email-ova (potvrde rezervacija, kontakt forma, reset lozinke).

Evo analize najboljih opcija za 2025. godinu:

## 1. Resend (Preporuka 🏆)
Najmodernije i najlakše rešenje za Next.js aplikacije.

*   **Cena:** Besplatno do 3,000 email-ova mesečno (više nego dovoljno za početak).
*   **Prednosti:**
    *   Izuzetno laka integracija sa Next.js.
    *   Odličan "Free Tier".
    *   Podržava React Email (možete dizajnirati email-ove koristeći React).
    *   Visoka pouzdanost (email-ovi ne idu u spam).
*   **Mane:** Nema ih puno za ovaj tip projekta.

## 2. SendGrid
Industrijski standard, ali malo komplikovaniji.

*   **Cena:** Besplatno do 100 email-ova dnevno.
*   **Prednosti:** Veoma pouzdan, koristi ga puno velikih firmi.
*   **Mane:**
    *   Komplikovanija verifikacija domena.
    *   Interfejs može biti zbunjujući.
    *   Besplatni plan je limitiran na 100 dnevno.

## 3. Gmail SMTP (Nije preporučeno ❌)
Korišćenje vašeg privatnog Gmail naloga.

*   **Cena:** Besplatno.
*   **Prednosti:** Nema dodatnih servisa.
*   **Mane:**
    *   **Nije sigurno:** Morate koristiti "App Passwords".
    *   **Limitirano:** Google blokira ako šaljete previše.
    *   **Neprofesionalno:** Email-ovi stižu sa `@gmail.com` adrese, a ne sa vašeg domena (npr. `info@apartmanitodorovic.com`).

---

## Moja Preporuka: Resend 🚀

Za "Apartmani Todorović", **Resend** je apsolutno najbolja opcija.

### Zašto?
1.  **Besplatan je** (do 3000 email-ova/mesečno).
2.  **Lako se podešava** (mogu vam ja to uraditi za 10 minuta).
3.  **Profesionalno izgleda** (email-ovi stižu sa vašeg domena).

### Šta je potrebno za setup?
1.  Kupiti domen (npr. `apartmanitodorovic.rs` ili `.com`).
2.  Kreirati nalog na [Resend.com](https://resend.com).
3.  Dodati DNS rekorde (povezati domen sa Resend-om).
4.  Ubaci API ključ u aplikaciju.

Da li želite da pripremim kod za integraciju sa Resend-om?

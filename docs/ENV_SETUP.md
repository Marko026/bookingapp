# Environment Variables Configuration

## Admin Email Configuration

Dodaj ove linije u tvoj `.env.local` fajl:

```bash
# Admin Email Addresses (samo ovi email-ovi mogu pristupiti admin panel-u)
NEXT_PUBLIC_ADMIN_EMAIL_1=tvoj-email@example.com
NEXT_PUBLIC_ADMIN_EMAIL_2=majka-email@example.com

# Site URL (za password reset links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**VAŽNO:** Zameni sa pravim email adresama koje ćeš kreirati u Supabase!

## Produkcija

Za produkciju, promeni `NEXT_PUBLIC_SITE_URL` u:
```bash
NEXT_PUBLIC_SITE_URL=https://apartmani-todorovic.com
```

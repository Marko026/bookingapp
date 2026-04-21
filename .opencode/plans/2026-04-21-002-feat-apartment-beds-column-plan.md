---
title: "feat: Dodaj kolonu `beds` u apartmane"
type: feat
status: active
date: 2026-04-21
---

# feat: Dodaj `beds` kolonu za nezavisan broj kreveta po apartmanu

## Overview

Trenutno se broj kreveta (`beds`) računa automatski kao `Math.ceil(capacity / 2)`, sto znači da svi apartmani sa 4 gostaa prikazuju 2 kreveta. Korisnik treba da može ručno podesi broj kreveta za svaki apartman nezavisno — prvi apartman treba da ima 3 kreveta, a drugi ("Experience nature") 4 kreveta.

## Problem Frame

Na stranici detalja apartmana, oba apartmana prikazuju "2 Kreveti" jer se `beds` izvodí iz formule `Math.ceil(capacity / 2)`. Korisnik želi da definiše broj kreveta po apartmanu nezavisno od kapaciteta gostiju.

## Requirements Trace

- R1. Svaki apartman mora imati zaseban broj kreveta koji admin može podesiti
- R2. Detail stranica mora prikazati stvarni broj kreveta iz baze (ne izračunat)
- R3. Admin forma za dodavanje apartmana mora imati polje za unos broja kreveta
- R4. Admin editor (ApartmentsManager) mora dozvoliti izmenu broja kreveta
- R5. Listing stranica (ApartmentList) mora prikazati stvarni broj kreveta
- R6. Novi apartmani trebaju imati podrazumevanu vrednost `beds = 2`
- R7. Postojeći apartmani u bazi moraju dobiti odgovarajuci backfill za `beds`

## Scope Boundaries

- Ne menjamo `capacity` (max gostiju) — to ostaje kao što je
- Ne menjamo booking logiku
- Ne dodajemo novi tip kreveta (npr. "francuski ležaj", "bračni krevet") — samo broj

## Context & Research

### Relevant Code and Patterns

- **Schema**: `src/db/schema.ts` — `apartments` tabela nema `beds` kolonu
- **DAL**: `src/dal/apartments.ts` — 3 mjesta gdje se `beds: Math.ceil(apt.capacity / 2)` računa (linije 52, 114, 214)
- **Types**: `src/types.ts` — `Apartment` interfejs već ima `beds: number`
- **Detail page**: `src/app/[locale]/apartment/[id]/ApartmentDetailClient.tsx` (linija 335) — prikazuje `apartment.beds`
- **Listing page**: `src/features/listings/components/ApartmentList.tsx` (linija 123) — prikazuje statički label `"bed"` umesto broja
- **Admin form**: `src/features/listings/components/ApartmentForm.tsx` — nema polje za beds
- **Admin manager**: `src/features/admin/components/dashboard/ApartmentsManager.tsx` — nema polje za beds
- **Schemas**: `src/features/listings/schemas.ts` — nema `beds` u Zod šemi
- **Actions**: `src/features/listings/actions.ts` — create i update ne obrađuju `beds`
- **i18n**: `messages/sr.json` i `messages/en.json` — imaju `"beds"`, `"sleeping"`, `"bed"` ključeve

## Key Technical Decisions

- **Dodaj `beds` kolonu u bazu**: Novi integer kolona sa NOT NULL i DEFAULT 2. Ovo omogućava nezavisan unos po apartmanu.
- **Koristi Drizzle migraciju**: `npx drizzle-kit generate` za SQL migraciju, pa `npx drizzle-kit migrate` za primenu.
- **Zameni `Math.ceil(capacity / 2)` sa `apt.beds`**: Ukloni računanje i koristi direktnu vrednost iz baze.
- **ApartmentList dodatno**: Trenutno prikazuje statički label "Francuski ležaj"/"King Bed" umesto broja — ažurirati da prikazuje `apt.beds` sa prevodom "beds".

## Open Questions

### Resolved During Planning

- **Da li dodati novu kolonu ili promeniti formulu?** -> Odluka: Nova kolona `beds` u bazi, jer formula ne može da pokrije različit broj kreveta za isti kapacitet.

### Deferred to Implementation

- **Tačne vrednosti za backfill postojećih apartmana**: Korisnik treba da postavi vrednosti nakon migracije. Migracija može postaviti DEFAULT 2, a admin ručno ažurira.

## Implementation Units

- [ ] **Unit 1: Dodaj `beds` kolonu u Drizzle šemu i generiši migraciju**

**Goal:** Dodati `beds` integer kolonu u `apartments` tabelu sa NOT NULL i DEFAULT 2

**Requirements:** R1, R6

**Dependencies:** None

**Files:**

- Modify: `src/db/schema.ts`

**Approach:**

- Dodaj `beds: integer("beds").notNull().default(2)` u `apartments` tabelu u `src/db/schema.ts`
- Pokreni `npx drizzle-kit generate --config drizzle.config.ts` da generiše SQL migraciju
- Default vrednost je 2 (što je trenutni prikaz za capacity=4 apartmane)

**Test scenarios:**

- Happy path: Novi apartman koji se kreira bez beds polja dobija default vrednost 2
- Edge case: Postojeći apartmani dobijaju default 2 nakon migracije

**Verification:** Migracija se uspešno generiše i `beds` kolona postoji u šemi

---

- [ ] **Unit 2: Ažuriraj DAL da koristi `apt.beds` umesto `Math.ceil(apt.capacity / 2)`**

**Goal:** Ukloni izračunavanje beds i koristi direktnu vrednost iz baze

**Requirements:** R2

**Dependencies:** Unit 1

**Files:**

- Modify: `src/dal/apartments.ts`

**Approach:**

- U `getAllApartmentsPublic()` (linija 52): zameni `beds: Math.ceil(apt.capacity / 2)` sa `beds: apt.beds`
- U `getApartmentsPublicPaginated()` (linija 114): zameni `beds: Math.ceil(apt.capacity / 2)` sa `beds: apt.beds`
- U `getApartment()` (linija 214): zameni `beds: Math.ceil(apartment.capacity / 2)` sa `beds: apartment.beds`
- U `getAllApartmentsAdmin()`: dodaj `beds: apt.beds` u mapping (trenutno nedostaje)

**Test scenarios:**

- Happy path: Beds se čita direktno iz baze i prikazuje stvarnu vrednost
- Edge case: Apartman sa beds=3 prikazuje 3 kreveta na detail stranici

**Verification:** Detail stranica prikazuje stvaran broj kreveta iz baze

---

- [ ] **Unit 3: Dodaj `beds` polje u Zod šeme i server akcije**

**Goal:** Omogući unos i ažururanje broja kreveta kroz admin formu

**Requirements:** R3, R4

**Dependencies:** Unit 1

**Files:**

- Modify: `src/features/listings/schemas.ts`
- Modify: `src/features/listings/actions.ts`

**Approach:**

- U `apartmentFormSchema`: dodaj `beds: z.coerce.number().min(1, "Bar jedan krevet je obavezan")`
- U `createApartmentActionSchema`: dodaj `beds: z.string().transform(val => parseInt(val, 10)).or(z.number())`
- U `updateApartmentActionSchema`: se nasleđuje iz create šeme
- U `createApartment` akciji: dodaj `beds: data.beds` u `.values()`
- U `updateApartment` akciji: dodaj `beds: data.beds` u `.set()`

**Test scenarios:**

- Happy path: Admin kreira apartman sa beds=3 i vrednost se čuva u bazi
- Error path: beds=0 ili negativan broj biva odbijen od strane Zod validacije

**Verification:** Admin može uneti broj kreveta prilikom kreiranja apartmana

---

- [ ] **Unit 4: Dodaj `beds` input polje u admin forme**

**Goal:** Omogući admin korisniku da unese/izmene broj kreveta

**Requirements:** R3, R4, R5

**Dependencies:** Unit 3

**Files:**

- Modify: `src/features/listings/components/ApartmentForm.tsx`
- Modify: `src/features/admin/components/dashboard/ApartmentsManager.tsx`
- Modify: `src/features/admin/hooks/useAdminApartments.ts`
- Modify: `messages/sr.json`
- Modify: `messages/en.json`

**Approach:**

- U `ApartmentForm.tsx`: dodaj `beds` polje pored `capacity` polja sa default vrednošću 2, label "Kreveti za spavanje *" / "Sleeping Beds *"
- U `ApartmentForm onSubmit`: dodaj `formDataToSend.append("beds", values.beds.toString())`
- U `ApartmentsManager.tsx`: dodaj `beds` input polje u edit modu pored cene
- U `handleSave`: dodaj `formData.append("beds", String(editingApartment.beds))`
- U `hasChanges`: dodaj proveru `current.beds !== original.beds`
- U i18n datotekama: dodaj prevode za label "beds" u admin sekciji
- U `ApartmentList.tsx`: zameni statički `{t("bed")}` sa `{`${apt.beds} ${t("beds")}`}` da prikazuje stvaran broj

**Test scenarios:**

- Happy path: Admin unese beds=3 i sačuva — na detail stranici se prikazuje "3 Kreveti"
- Happy path: Na listing stranici se prikazuje "3 Kreveti" umesto "Francuski ležaj"
- Edge case: Admin ostavi prazno ili unese 0 — validacija sprečava čuvanje

**Verification:** Admin može dodati/izmene broj kreveta i vrednost se prikazuje na svim stranicama

---

- [ ] **Unit 5: Ažuriraj postojeće apartmane u bazi**

**Goal:** Postavi ispravne vrednosti beds za postojeće apartmane

**Requirements:** R7

**Dependencies:** Unit 1 (migracija mora biti primenjena prvo)

**Files:**

- None (ručno ažuriranje preko admin panela)

**Approach:**

- Nakon što migracija doda `beds` kolonu sa DEFAULT 2, postojeći apartmani će imati beds=2
- Korisnik zatim ručno ažurira preko admin panela: prvi apartman na beds=3, drugi ("Experience nature") na beds=4

**Verification:** Obja apartmana prikazuju tačan broj kreveta (3 i 4) na detail i listing stranicama

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Migracija ne uspe na produkciji | Testiraj migraciju lokalno prvo; DEFAULT vrednost osigurava da nema NULL |
| Zaboravljeni fajl koji još koristi `Math.ceil(capacity/2)` | Pretraži kompletno codebase za "Math.ceil" i "capacity / 2" |
| Stari apartmani sa beds=2 nakon migracije | Admin ručno ažurira; DEFAULT 2 je bezbedan fallback |

## Sources & References

- Related code: `src/dal/apartments.ts`, `src/db/schema.ts`, `src/types.ts`
- Related components: `ApartmentDetailClient.tsx`, `ApartmentList.tsx`, `ApartmentForm.tsx`, `ApartmentsManager.tsx`
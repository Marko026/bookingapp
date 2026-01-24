# Add Directions Button Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a "Route from Apartment" button on the Attraction Details page that opens Google Maps with a pre-filled route from the apartments' location to the attraction.

**Architecture:**
- Fetch the fixed coordinates of the apartments (using the first apartment in the DB) in the server component.
- Pass the coordinates to the client component.
- Use the `https://www.google.com/maps/dir/?api=1&origin={lat,lng}&destination={lat,lng}` URL format.

**Tech Stack:** Next.js 16, React 19, Google Maps Directions API (URL-based).

---

### Task 1: Fetch Apartment Coordinates

**Files:**
- Modify: `src/app/[locale]/attraction/[id]/page.tsx`

**Step 1: Convert to Server Component (or Wrapper)**
The current file is a Client Component. I will wrap it or modify it to fetch the origin coordinates on the server.
Actually, since it's already a Client Component using `useState` for attraction data, I'll update it to also fetch the apartments' location once.

Wait, better: all apartments are at the same spot. I'll create a small utility or fetch the first apartment in the `useEffect`.

### Task 2: Update Directions URL Logic

**Files:**
- Modify: `src/app/[locale]/attraction/[id]/page.tsx`

**Step 1: Fetch Apartment Origin**
In the `useEffect`, fetch the first apartment using `getAllApartmentsPublic`.
Store its `latitude` and `longitude` as the `origin`.

**Step 2: Construct the URL**
Update the `directionsUrl` to use the fetched origin and the attraction's `latitude/longitude` (if available) or `coords` (as fallback).

### Task 3: Refine Button UI

**Files:**
- Modify: `src/app/[locale]/attraction/[id]/page.tsx`

**Step 1: Add the Button**
The button is already there as `getDirections`. I will ensure it uses the new `directionsUrl`.
Ensure it opens in a new tab.

### Task 4: Verify

**Step 1: Manual Verification**
- Click the button.
- Verify Google Maps opens with the correct origin and destination.

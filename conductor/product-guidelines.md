# Product Guidelines: Sanctuary Booking App

## Design Ethos
- **Strict UI Preservation:** All existing UI components, layouts, and styles are to be preserved. No changes should be made to the user interface unless explicitly requested.
- **Brand Consistency:** Maintain the established "luxury" feel through consistent use of existing spacing, typography, and interactive elements.

## Content & Voice (English)
- **Tone:** Warm & Welcoming. Translations should feel personal, inviting, and professional.
- **Landmark Naming:** When referring to local landmarks or place names, always provide both the original Serbian name and the English translation (e.g., "Kalemegdan (Belgrade Fortress)") to assist with guest navigation and context.

## Internationalization Strategy (Dynamic Content)
- **Locale Switcher:** The application utilizes a navbar-based language switcher to toggle between `en` and `sr`.
- **Database Content:** Apartment and attraction descriptions must support multi-language storage and retrieval. 
- **Workflow Goal:** Find the most efficient and native Next.js pattern to ensure that Serbian content entered by the admin is effectively made available to English-speaking users, adhering to the principles in the official Next.js documentation.

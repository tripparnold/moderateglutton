---
# ─────────────────────────────────────────────────────────────────
#  RESTAURANT TEMPLATE
#  This maps directly to the Houston Guide page (app/houston/page.tsx).
#  When you hand this to Cowork, it will add the restaurant to the
#  LOCATIONS array and display it on the map and list views.
# ─────────────────────────────────────────────────────────────────

name: "[Restaurant name — e.g. Máximo]"

address: "[Full street address — e.g. 4319 Montrose Blvd, Houston, TX 77006]"

cuisine: "[Cuisine type shown in the app — e.g. Modern Mexican, Gulf Coast Seafood,
  Italian, Bakery, Wine Bar. Keep it short, 1–3 words.]"

myRating: [Your rating 1–5, supports half-stars — e.g. 4.5]

visitDate: "[Date you visited — e.g. May 2025. Month + year is fine.]"

lat: [GPS latitude — find it by right-clicking the location in Google Maps.
  Example: 29.7345]
lng: [GPS longitude — will be negative for Houston. Example: -95.3904]

note: "[One or two sentences that capture your honest take. This shows in the
  map popup and the list card. Write in your voice, not a review format.
  Example: The room is stunning. The food matches it.]"

photo: "[Optional. Path to a photo after uploading: /media/houston/restaurant-name.jpg
  Leave blank if not using one.]"


# ─── DISTINCTIONS ────────────────────────────────────────────────
# Fill in only the ones that apply. Delete the rest.
# These display in lapis blue on the map popup and list card.
# Michelin icons appear in traditional red automatically.

michelin: "[Leave blank, or enter: star    (for Michelin Star)
                                       bibgourmand  (for Bib Gourmand)]"

# James Beard — list each one separately if there are multiple years or categories
jamesBeard:
  - type: "[nomination | finalist | win]"
    category: "[Award category — e.g. Best Chef: Texas, Best New Restaurant]"
    year: [Year as a number, or a list: [2022, 2023]]

# ─── ARTICLE / NOTES ──────────────────────────────────────────────
# Optional longer writeup. If you want a full article about this
# restaurant (linked from the Houston page in the future), write it below.
# Otherwise, the note field above is enough.
---

[Optional extended notes or article content about this restaurant.
You can leave this section blank if the note field above says enough.]

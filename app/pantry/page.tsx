import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Pantry',
  description: 'The pantry and fridge staples I keep stocked.',
};

const PANTRY: { category: string; items: string[] }[] = [
  {
    category: 'Oils & Fats',
    items: [
      'Extra virgin olive oil (good one for finishing, cheaper for cooking)',
      'Avocado oil (high-smoke cooking)',
      'Unsalted butter',
      'Ghee',
    ],
  },
  {
    category: 'Acids',
    items: [
      'Red wine vinegar',
      'Sherry vinegar',
      'Rice wine vinegar',
      'Apple cider vinegar',
      'Lemons',
      'Limes',
    ],
  },
  {
    category: 'Canned & Jarred',
    items: [
      'San Marzano whole tomatoes',
      'Chickpeas',
      'Calabrian chilis in oil',
      'Anchovies in oil',
      'Capers',
      'Dijon mustard',
      'Fish sauce',
      'Soy sauce / tamari',
      'Hoisin',
      'Sriracha',
      'Honey',
      'Hot sauce (Crystal)',
    ],
  },
  {
    category: 'Spices',
    items: [
      'Kosher salt (Diamond Crystal)',
      'Flaky sea salt (Maldon)',
      'Black pepper, whole (freshly ground)',
      'Red pepper flakes',
      'Smoked paprika',
      'Cumin, ground',
      'Coriander, ground',
      'Garlic powder',
      'Onion powder',
      'Dried oregano',
      'Bay leaves',
    ],
  },
  {
    category: 'Grains & Pasta',
    items: [
      'Medium-grain white rice',
      'Farro',
      'Dried pasta — rigatoni, spaghetti, orecchiette',
      'Panko breadcrumbs',
      'All-purpose flour',
    ],
  },
  {
    category: 'Refrigerator Staples',
    items: [
      'Eggs',
      'Parmigiano-Reggiano, block',
      'Pecorino Romano, block',
      'Whole-milk Greek yogurt',
      'Whole milk',
      'Heavy cream',
      'Crème fraîche',
      'Miso paste (white)',
      'Fresh garlic',
      'Shallots',
    ],
  },
  {
    category: 'Freezer Staples',
    items: [
      'Frozen green beans',
      'Frozen edamame',
      'Frozen corn',
      'Shrimp (wild-caught, shell-on)',
      'Good stock (chicken, beef) — ice-cubed',
    ],
  },
];

export default function PantryPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">

      <header className="mb-10">
        <h1
          className="font-serif font-light text-espresso"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}
        >
          My Pantry
        </h1>
        <div className="w-10 h-px bg-terracotta mt-3 mb-5" aria-hidden="true" />
        <p className="text-muted text-sm leading-relaxed">
          What I keep stocked. Not exhaustive — just what I'd reach for 90% of the time.
        </p>
      </header>

      <div className="space-y-10">
        {PANTRY.map(({ category, items }) => (
          <section key={category}>
            <h2 className="text-xs font-medium text-tan uppercase tracking-widest mb-3">
              {category}
            </h2>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-espresso">
                  <span className="mt-[5px] w-1 h-1 rounded-full bg-terracotta flex-shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

    </div>
  );
}

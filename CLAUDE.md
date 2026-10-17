# Ola's Garden — Project Instructions

## 1. Project vision

Build a beautiful, personal, installable garden experience for iPhone.

This is NOT a conventional game. There is no player character, movement, exploration, combat, quests, or grind. The user opens the garden to admire flowers, water them, watch them grow, and arrange them.

The primary goal is to create something genuinely pretty, peaceful, atmospheric, and carefully crafted. Visual quality is more important than the number of features.

The result should feel like a small illustrated world made by a thoughtful human artist, not a generic AI-generated game.

## 2. Art direction

### Overall style

* Front-facing 2D illustration is the preferred starting direction.
* Create a cohesive, hand-crafted botanical storybook aesthetic.
* Use beautiful, distinctive flowers, elegant shapes, natural compositions, carefully chosen colors, and detailed environments.
* Aim for soft, polished illustrations with subtle depth, delicate highlights, and restrained glossy details.
* Keep the scene visually rich without making it cluttered.
* Prioritize attractive silhouettes, carefully drawn petals, believable stems and leaves, and thoughtful color relationships.
* Use subtle animation to make the environment feel alive.
* Every visual element must look as though it belongs to the same illustrated world.

### Avoid the generic AI look

* Do not rely on generic gradients, excessive glow, random sparkles, excessive symmetry, or arbitrary decorative details.
* Do not use emoji as artwork.
* Do not use stock-looking assets, hotlinked images, or a mixture of unrelated illustration styles.
* Do not generate a large quantity of mediocre assets just to fill the screen.
* Do not make every flower a recolored copy of the same design.
* Avoid generic dashboard aesthetics, excessive cards, unnecessary borders, and conventional farming-game interfaces.
* Prefer a few exceptional, coherent illustrations over many mediocre ones.

### Flowers

Flowers are the main attraction.

Create distinct, recognizable species with their own silhouettes, petal structures, colors, leaves, stems, and growth patterns.

Start with five species: daisy, tulip, rose, lavender, and sunflower. These are initial suggestions, not a requirement to sacrifice visual quality for quantity.

Each species needs four growth stages:

1. Seed
2. Seedling
3. Bud
4. Bloom

Growth stages must look like genuine stages of the same plant, not merely different sizes of an identical image.

Use original local SVG illustrations where practical. Carefully crafted CSS or canvas effects may supplement them, but the underlying artwork must be intentional and cohesive.

### Garden composition

Do not assume the garden must be a conventional rectangular plot viewed from above.

Explore a composition where flowers grow around the edges of the screen, along the bottom, on shelves, in individual pots, and in small clusters. Leave enough open space to see the sky and appreciate the environment.

Pots may have different shapes, colors, patterns, and decorative details. Plants and decorations should gradually give the scene a personal character.

The layout must work on narrow iPhone screens without covering all the sky or making the flowers too small.

The user should be able to add plants, select them, water them, and rearrange the composition without needing a character or complicated controls.

Prototype the composition before committing to a large collection of assets. If a slightly angled or layered 2.5D approach produces a substantially prettier result than front-facing 2D, explain the trade-off and show a small prototype before changing direction.

## 3. Environment, sky, and atmosphere

The environment is just as important as the flowers.

The sky must be a visible, integrated part of the illustration, not an unrelated wallpaper behind the garden.

Create coherent environmental states:

* **Sunny day:** a beautiful sun, soft daylight, gentle shadows, warm highlights, and a pleasant sky.
* **Cloudy day:** layered clouds, softer lighting, and muted colors.
* **Rain:** visible falling rain, appropriate sky colors, wet leaves, water droplets, and subtle reactions from the plants.
* **Night:** a beautiful moon, stars, a darker sky, cooler lighting, and a peaceful nighttime atmosphere.
* **Sunrise and sunset:** optional later, with warm transitional colors.

Use the device's local time to determine day and night. If live weather is implemented, use a weather API such as Open-Meteo, with an explicitly selected location or optional location permission.

Weather must fail gracefully. Cache recent results, avoid constant polling, and provide a pleasant fallback when offline or when weather data is unavailable. Never require location permission just to use the garden.

Environmental effects should complement the artwork rather than overwhelm it. Keep the moon, sun, clouds, and rain beautifully illustrated and stylistically consistent with the flowers.

## 4. Interaction and growth

Keep interactions simple and satisfying.

* Tap a flower to inspect it.
* Water a plant with an obvious, pleasant visual response.
* Plant new flowers in available spaces.
* Rearrange plants and decorations.
* Allow the user to appreciate the garden without interacting with it.
* Save the garden automatically.
* Grow flowers according to real elapsed time, including while the app is closed.
* Make growth stages visible and satisfying.
* Never permanently kill or punish flowers because the user forgets to visit.
* Avoid timers, streaks, guilt, intrusive notifications, or mechanics that demand daily attention.

Watering should have a visible effect, such as animated droplets, subtle leaf movement, or darkened soil. Avoid excessive particles and effects.

## 5. Technical direction

Use:

* React
* TypeScript with strict type checking
* Vite
* SVG and CSS for original 2D artwork and animations
* IndexedDB for persistent garden state
* `vite-plugin-pwa` for installation and offline support
* Vitest for testing core logic

Keep the project modular, understandable, and easy to maintain.

Separate plant data, growth calculations, persistence, weather handling, and UI components. Avoid unnecessary abstractions and dependencies.

Persist plant species, growth timestamps, garden arrangement, decorations, settings, and other necessary state.

Calculate growth from timestamps rather than relying on continuously running timers.

Use a versioned save format and handle corrupted or outdated saves gracefully.

Do not introduce a backend, account system, ads, monetization, or analytics.

## 6. iPhone experience and PWA

The primary target is an iPhone.

* Make the layout mobile-first and responsive.
* Use touch targets of approximately 44 CSS pixels or larger.
* Respect safe areas and notches.
* Avoid accidental scrolling or selecting text during interactions.
* Support portrait orientation well.
* Include an installable PWA manifest, app icons, and offline caching.
* Ensure the core garden works without an internet connection after initial loading.
* Keep animations efficient and respect reduced-motion preferences.

A future native iOS home-screen widget is a possible extension, but do not build native iOS code now. Do not compromise the main experience to accommodate a widget.

## 7. Development workflow

Work in small, verifiable stages.

1. Inspect the existing project before making changes.
2. Present two or three distinct visual directions for the garden.
3. Explain the proposed composition, flower illustration approach, environmental lighting, and asset pipeline.
4. Create a small visual prototype before building the full game.
5. Prioritize the quality of the flowers, sky, and overall scene.
6. After the art direction is approved, implement planting, watering, growth, and saving.
7. Add weather, further customization, and secondary features only after the core experience is visually convincing.
8. Test on a narrow mobile viewport and fix layout problems.
9. Run relevant tests and a production build after meaningful changes.

Do not implement the entire project in one enormous change. Do not replace working code without a reason. Do not delete user work without checking first.

Never claim a feature has been tested unless it actually has been tested.

Keep explanations concise. At the end of each implementation task, report what changed, which checks were run, and what remains unfinished.

## 8. First milestone

Before writing implementation code, propose two or three concrete visual directions.

For each direction, describe:

* The camera and garden composition.
* How the flowers and pots are illustrated.
* How much sky is visible.
* How sunlight, rain, and nighttime will look.
* How the design avoids a generic AI-generated appearance.
* How it can be implemented efficiently with original local assets.

Recommend one direction, but explain the trade-offs honestly.

Then propose the smallest useful art prototype: a small garden scene with a few exceptionally well-designed flowers, pots, a visible sky, and day/night or weather variations.

Wait for my approval before implementing anything.

The first milestone is not a complete game. It is proof that the visual direction can achieve the quality and atmosphere this project needs.

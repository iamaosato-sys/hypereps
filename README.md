# HypeReps

Free calisthenics progress tracker by Entwisle Fitness. Sister app to Barbell Five.

- Plain HTML/CSS/JS, no build step, no backend. Deploy on Vercel as a static site.
- Data in browser localStorage (`hypereps.v1`, consent in `hypereps.consent`). Export/import JSON, CSV export, delete-all.

## Program
- Workout A: Squat, Push-up, Row, Core. Workout B: Squat, Shoulder press, Pull-up (or Row without a bar), Hinge. Alternates.
- 3 sets per exercise. Each level has a target range (reps or seconds).
- Hit target on all sets: target +1 rep (or +5s). Top of range: next level, target resets to its min.
- 3 missed sessions in a row: target resets to min; if already at min, drop one level.
- Ladders in `LADDERS` (app.js), progression in `progress()`, hype lines in `HYPE`, badges in `BADGES`.

## Setup to-dos
1. Put the GA4 Measurement ID in `window.GA_ID` (index.html and the three legal pages).
2. Verify in Google Search Console (HTML tag token in `window.GSC_TOKEN`, or DNS), submit `sitemap.xml`, link Search Console to GA4.
3. Optional custom domain (hypereps.app / hypereps.co.uk free at time of build). Update canonical, sitemap, robots if changed.

---
name: Subscription Tiers
description: Three subscription tiers (Classic 39€, Business 59€, Premium 99€) with feature gating
type: feature
---
## Tiers
- **Classic** (39€/mois, 9 plats): AR, badges, prep time, availability, QR code, FR/EN
- **Business** (59€/mois, 15 plats): + Stats détaillées, heatmap, horaires midi/soir
- **Premium** (99€/mois, 25 plats): + Multi-sites, storytelling, personnalisation avancée, multilingue

## Feature gating
- `useSubscriptionFeatures(restaurantId)` hook returns booleans per feature
- Admin tabs and form fields are conditionally shown based on tier
- Stats tab only visible for Business+ tiers

## DB fields on dishes
prep_time, is_available, badge, time_slot, story_text, story_image

## Context
- The home page currently presents generic messaging and lacks visuals that communicate long-term wealth tracking. Existing sections: hero, navigation, CTAs, and feature highlights.
- We need to emphasize that wealth building is a marathon: disciplined tracking of assets and liabilities over multiple years.
- We will add illustrative trend graphics (static images or lightweight chart renders) showing assets vs. liabilities across years, paired with supporting copy.
- Must keep the page lightweight and accessible; charts are illustrative, not live data.

## Goals / Non-Goals
**Goals:**
- Deliver clear hero and supporting copy that frame wealth building as long-term, disciplined tracking.
- Add illustrative multi-year asset vs. liability visuals with alt text and captions to set expectations.
- Keep CTA aligned with tracking (“Start tracking your net worth”).

**Non-Goals:**
- No backend changes or live data integrations.
- No new auth flows; reuse existing Clerk setup and navigation.
- No advanced interactive charting beyond simple illustrative visuals.

## Decisions
- **Visuals format:** Use static or lightweight chart renders (e.g., SVG/PNG or simple chart component with hardcoded sample data) to illustrate multi-year assets vs. liabilities. This keeps build simple and avoids runtime data dependencies.
- **Placement:** Position the chart/visual section near the hero/supporting copy to reinforce the marathon narrative.
- **Accessibility:** Provide alt text and captions clarifying that the chart is illustrative, not actual user data.
- **Copy tone:** Emphasize discipline, steady progress, and tracking habits; CTA invites starting/continuing tracking.
- **Performance:** Keep assets optimized (compressed images or lightweight SVG) to preserve page speed and avoid large bundle impact.

## Risks / Trade-offs
- **Risk:** Charts could be misinterpreted as real data. → **Mitigation:** Add caption/alt text stating they are illustrative examples.
- **Risk:** Added assets could slow load. → **Mitigation:** Use optimized SVG/PNG and defer non-critical images with Next/Image if used.
- **Risk:** Visual clutter could dilute CTA. → **Mitigation:** Keep layout focused: concise copy, single primary CTA, balanced whitespace.

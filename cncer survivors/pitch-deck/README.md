# Bridge Survivorship — seed pitch deck

YC / seed-VC screening structure. Present in browser or export PPTX.

## Quick start

1. **Present:** `BridgeSurvivorship_Seed.html` (Chrome · scroll or ↑↓ / space)
2. **Edit copy:** `slide-copy.md` → `pitch_data.json` → regenerate PPTX
3. **Structure reference:** `skills/SEED_DECK_GUIDE.md`

```bash
cd "/Users/kmr/TheBridge/cncer survivors/pitch-deck"
.venv/bin/python scripts/create_pitch_deck.py pitch_data.json BridgeSurvivorship_Seed.pptx
```

## Files

| File | Description |
|------|-------------|
| `BridgeSurvivorship_Seed.html` | 11-slide presentation |
| `BridgeSurvivorship_Seed.pptx` | PowerPoint export |
| `pitch_data.json` | PPTX generator input |
| `slide-outline.md` / `slide-copy.md` | Narrative + speaker notes |
| `skills/SEED_DECK_GUIDE.md` | YC + seed partner slide jobs |
| `MARKET_PRICING_CPT.md` | TAM/SAM $/yr derived from CMS codes |
| `../CancerSurvivorship_VentureDiligence.html` | Full diligence memo |

## Slide order (screening-optimized)

Title → Problem → Solution → Product → **Traction** → Market → Business model → GTM → Competition → Team → Ask

Traction sits **before** market (YC default). “Why now” is folded into Problem.

## Before investors

Replace `[Name]`, `[email]`, and traction placeholders. Run pitch-deck-analysis on `slide-copy.md` if you want a scorecard.

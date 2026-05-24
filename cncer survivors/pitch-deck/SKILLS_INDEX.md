# Pitch deck skills — local kit

Bundled references for a **seed deck that passes YC and top-tier VC first screens**. Full skills: `~/.claude/skills/`.

| Step | File | Purpose |
|------|------|---------|
| 1 | `skills/SEED_DECK_GUIDE.md` | 11-slide YC / seed partner structure |
| 2 | `slide-outline.md` | Storyboard |
| 3 | `slide-copy.md` | On-slide + speaker notes |
| 4 | `pitch_data.json` | PPTX input |
| 5 | `BridgeSurvivorship_Seed.html` | Browser deck |
| 6 | `../CancerSurvivorship_VentureDiligence.html` | Numbers & thesis source |

## Related skills (on disk)

| Skill | Path |
|-------|------|
| pitch-deck-creation | `skills/pitch-deck-creation-SKILL.md` |
| slide-outline | `~/.claude/skills/claude-gtm-plugin/skills/slide-outline/SKILL.md` |
| pitch-deck-analysis | `~/.claude/skills/pitch-deck-analysis/SKILL.md` |
| market-analysis | `~/.claude/skills/market-analysis/SKILL.md` |
| vc-due-diligence | `~/.claude/skills/vc-due-diligence/SKILL.md` |

## Generate PPTX

```bash
cd "/Users/kmr/TheBridge/cncer survivors/pitch-deck"
.venv/bin/python scripts/create_pitch_deck.py pitch_data.json BridgeSurvivorship_Seed.pptx
```

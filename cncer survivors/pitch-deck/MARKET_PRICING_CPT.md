# Market sizing — CPT / HCPCS reimbursement basis

The old **$120–$300/year** figure was a rough blended placeholder. It roughly matches **platform PMPM ($15–25/mo)** but is **not** a defensible TAM input by itself. TAM should use **addressable billable survivorship services** derived from Medicare fee schedule codes (with commercial/VBC as upside).

> **There is no standalone CPT for “survivorship care plan only.”** SCP work is usually bundled into E/M visits or care-management codes. Bridge enables practices to bill **navigation, CCM, RPM, and behavioral health integration** for eligible survivors.

Sources: CMS CY2024 MPFS (ACCC/Cancer Care Comprehensive table); ACS survivor counts 2025.

---

## Core codes for post-treatment cancer survivors

| Code | Description | CY2024 Medicare (~national) | Frequency | Notes |
|------|-------------|----------------------------|-----------|--------|
| **G0023** | Principal illness navigation (PIN), first 60 min/month | **$78.92** | Monthly | Cancer = qualifying serious/high-risk condition; non-clinical navigator under MD/NPP [ACCC Table 1] |
| **G0024** | PIN, each additional 30 min | **$49.45** | Monthly add-on | Unlimited 30-min increments after G0023 |
| **G0136** | SDOH risk assessment | **$18.67** | ≤1 per 6 mo | Often at initiating visit |
| **99490** | Chronic care management (CCM), 20+ min clinical staff/month | **~$60** | Monthly | Requires **2+ chronic conditions** ≥12 mo; cancer history + mood/sleep/CVD common |
| **99439** | CCM add-on, each additional 20 min | **~$46** | Monthly add-on | After 99490 |
| **99491** | CCM by physician/QHP, 30+ min/month | **~$82** | Monthly | Cannot bill 99490 same month |
| **G0506** | Comprehensive CCM assessment & care planning (add-on) | Varies | Once at CCM start | Initiating planning; separate from monthly CCM |
| **99453** | RPM setup & patient education | **~$20** | One-time | Device supply |
| **99454** | RPM device supply, 30-day periods | **~$47** | Monthly | When device transmits |
| **99457** | RPM treatment management, first 20 min | **~$48** | Monthly | PRO/symptom monitoring fits here |
| **99458** | RPM, each additional 20 min | **~$39** | Monthly add-on | |
| **99484** | Behavioral health integration (BHI), 20+ min | **~$48–53** | Monthly | Distress, FCR, anxiety screening follow-up |
| **99212–99215** | E/M office visits | **~$75–$210** | Per visit | Survivorship follow-up visits (face-to-face), not monthly |

**Also relevant (not stacked blindly):** G0019/G0022 CHI ($79/$49); 99487–99489 complex CCM; 99424–99427 principal care management; CoCM 99492–99494; TCM 99495–99496 post-discharge.

**Rules:** Same minutes cannot be double-counted across CCM, PIN, and RPM. Patient consent required for CCM/PIN. Commercial rates and MA plans differ; Medicare Advantage often covers PIN/CCM.

---

## Example Medicare FFS stacks (per survivor / month)

| Scenario | Codes | Approx. monthly | Approx. annual |
|----------|-------|-----------------|----------------|
| **Navigation only** | G0023 | $79 | **~$950** |
| **Navigation + CCM** | G0023 + 99490 | $139 | **~$1,670** |
| **Navigation + CCM + RPM + BHI** | G0023 + 99490 + 99454 + 99457 + 99484 | ~$235* | **~$2,820** |

\*Assumes distinct documented time; 99454 + 99457 for engaged PRO monitoring; not all survivors qualify for all codes.

---

## What to use for TAM vs. Bridge revenue

| Layer | Definition | Suggested $/survivor/year |
|-------|------------|---------------------------|
| **Gross billable pool** | Theoretical Medicare FFS if full stack + 1–2 E/M visits | **$950 – $2,800** (engaged Medicare patient) |
| **Realized practice capture** | Eligibility gaps, documentation, staffing, partial months | **~25–40%** of gross → **$240 – $1,100** |
| **Blended TAM input** | All payers, all cancers, not every survivor enrolled monthly | **$400 – $900** × population |
| **Bridge platform fee** | What you charge practice/payer (PMPM) | **$15 – $25/mo → $180 – $300/yr** |

### Revised US TAM (all cancer survivors)

```
18.6M survivors × $400–$900/yr addressable survivorship services
= $7.4B – $16.7B TAM
```

Midpoint ~**$11B** — replaces the old $2.2B–$5.6B band that used the wrong per-capita assumption.

**SAM / SOM** unchanged in logic; update $/yr if desired:
- SAM: ~6–8M reachable × $400–$700 ≈ **$2.4B – $5.6B**
- SOM: 250k–600k lives × $180–$260 platform + shared savings ≈ **$45M – $156M ARR** (platform revenue, not total billable pool)

---

## Pitch deck one-liner

> **TAM is sized on CPT-backed survivorship services (PIN, CCM, RPM, BHI) — ~$400–900/survivor/year blended across payers — not a random $120–300 placeholder. Bridge captures $180–300/yr via PMPM as a fraction of the gross billable pool practices can unlock.**

---

## References

- [ACCC — CMS Will Pay for Patient Navigation (Table 1, 2024 rates)](https://www.accc-cancer.org/docs/projects/comprehensive-cancer-care-survey/the-centers-for-medicare-medicaid-services-will-pay-for-patient-navigation-now-what.pdf)
- [ACS — PIN payment FAQ (G0023 $79 / G0024 $49)](https://www.cancer.org/content/dam/cancer-org/online-documents/en/pdf/brochures/acs-lion-pin-payment-faq-01-22-24.pdf)
- [CMS — Chronic Care Management FAQs](https://www.cms.gov/files/document/chronic-care-management-faqs.pdf)
- [Community Oncology Alliance — CCM in oncology](https://communityoncology.org/downloads/can/pdfs/COA_CCM.pdf)

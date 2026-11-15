# SPR Assay Planner, Rmax Calculator & KD Dilution Tool

A single-file web application for designing **Surface Plasmon Resonance (SPR)** experiments.

## Features

1. **Bidirectional $R_{\max}$ & Immobilization Calculator**
   - **Solve for $R_{\max}$:** Estimate the theoretical maximum analyte binding response (in RU) from your immobilized ligand level ($R_{\text{ligand}}$).
   - **Solve for $R_{\text{ligand}}$:** Calculate the exact target RU of ligand to immobilize on your sensor chip to hit an optimal kinetic $R_{\max}$ (typically 20–100 RU).
   - Supports **Da** and **kDa** molecular weights, ligand valency, and estimated active ligand fraction.
   - Built-in real-time quality alerts for baseline noise thresholds (<5 RU) and mass transport risks (>120 RU).

2. **$K_D$ Serial Dilution Planner**
   - Automatically generates a 5- to 8-point analyte concentration series spanning **$0.1\times K_D$ to $10\times K_D$**.
   - Supports 2-fold, 3-fold, half-log (~3.16-fold), and 5-fold dilution schemes.
   - Calculates exact bench pipetting volumes and inserts **buffer blank cycles** (for double referencing) and a **mid-series QC duplicate cycle**.

3. **Ligand–Analyte Reference Table & CSV Export**
   - Quick-reference parameter table covering 8 common SPR workflows—from **small-molecule fragment screening (100–300 Da)** to **large antibodies (~150 kDa)** and **virus-like particles (>500 kDa)**.
   - One-click **Load** buttons populate the calculator directly from any assay class.
   - **Export Run Sheet (CSV)** downloads your calculated immobilization targets and serial dilution bench sheet.

## Quick Start & GitHub Pages Hosting

1. Clone or fork this repository.
2. Ensure `index.html` is in the root directory of your repository.
3. Go to **Settings → Pages** in your GitHub repository.
4. Under **Build and deployment**, select **Deploy from a branch**, choose `main` (and `/ (root)`), and click **Save**.
5. Your live SPR calculator will be published at `https://<your-username>.github.io/<repository-name>/`.

## Core SPR Formula Used

$$R_{\max} = \frac{\text{MW}_{\text{analyte}}}{\text{MW}_{\text{ligand}}} \times R_{\text{ligand}} \times \text{Valency} \times \text{Fraction Active}$$

## License

This project is released as open-source software under the **MIT License**.
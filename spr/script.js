const CHIPS = [
  { name: 'CM5 (Standard)', cat: 'covalent', reuse: 'Single-Immobilization (Regenerable)', matrix: 'Carboxymethylated dextran (~100 nm)', coupling: 'Amine, thiol, aldehyde (EDC/NHS)', ligands: 'General proteins, antibodies, small molecules. Regenerate analyte for 100+ cycles.' },
  { name: 'CM4 (Low Charge)', cat: 'covalent', reuse: 'Single-Immobilization (Regenerable)', matrix: 'Low-charge CM-dextran (~30% COOH)', coupling: 'Covalent amine / thiol', ligands: 'Basic proteins (pI > 8), nucleic acids, crude samples. Minimizes electrostatic NSB.' },
  { name: 'CM3 (Short Dextran)', cat: 'covalent', reuse: 'Single-Immobilization (Regenerable)', matrix: 'Short-chain CM-dextran (~30 nm)', coupling: 'Covalent amine / thiol', ligands: 'Large complexes, viruses, phages, ribosomes. Keeps partners near gold surface.' },
  { name: 'C1 (Dextran-Free)', cat: 'covalent', reuse: 'Single-Immobilization (Regenerable)', matrix: 'Flat carboxymethylated monolayer', coupling: 'Covalent amine / thiol', ligands: 'Whole cells, VLPs, multivalent nanoparticles. Zero steric hindrance or dextran avidity.' },
  { name: 'CM7 (High Capacity)', cat: 'covalent', reuse: 'Single-Immobilization (Regenerable)', matrix: 'High-density CM-dextran (~3x COOH)', coupling: 'Covalent amine / thiol', ligands: 'Small-molecule fragments (<300 Da). Maximizes Rmax for low-MW analytes.' },
  { name: 'PEG / Polycarboxylate', cat: 'covalent', reuse: 'Single-Immobilization (Regenerable)', matrix: 'Linear/branched PEG brush', coupling: 'Amine (EDC/NHS) or NeutrAvidin', ligands: 'Serum, plasma, cell lysates, sticky proteins. Ultra-low non-specific fouling.' },
  { name: 'Biotin CAPture (CAP)', cat: 'reusable', reuse: 'Fully Reusable (100+ Ligand Reloads)', matrix: 'ssDNA-modified CM-dextran', coupling: 'Reversible ssDNA-Streptavidin hybridization', ligands: 'Biotinylated proteins/DNA. Strip completely with 6 M Gua-HCl + 0.25 M NaOH and reload.' },
  { name: 'NTA / Tris-NTA', cat: 'reusable', reuse: 'Fully Reusable (Ni²⁺/Co²⁺ Recharge)', matrix: 'Nitrilotriacetic acid on dextran', coupling: 'Poly-histidine (6x–10xHis) chelation', ligands: 'His-tagged proteins. Strip with 350 mM EDTA; recharge with 0.5 mM NiCl₂ for fresh capture.' },
  { name: 'Protein A / G / L', cat: 'reusable', reuse: 'Fully Reusable (100+ mAb Captures)', matrix: 'Recombinant Fc / Kappa ligands on dextran', coupling: 'Oriented IgG / Fc / Fab affinity capture', ligands: 'Monoclonal antibodies, Fc-fusions, Fabs. Strip mAb with 10 mM Glycine pH 1.5–2.0.' },
  { name: 'Anti-His / Anti-GST / Anti-Fc', cat: 'reusable', reuse: 'Fully Reusable Capture Surface', matrix: 'Capture mAb covalently coupled to CM5', coupling: 'Tag-specific antibody capture', ligands: 'His-, GST-, or Fc-tagged proteins. Regenerate capture mAb with Glycine pH 1.7–2.0.' },
  { name: 'SpyCatcher / HaloTag Chip', cat: 'reusable', reuse: 'Covalent Site-Specific (Analytes Regenerable)', matrix: 'SpyCatcher or HaloTag ligand on dextran', coupling: 'Isopeptide bond / chloroalkane capture', ligands: 'SpyTag- or HaloTag-fused proteins. Ultra-stable covalent orientation.' },
  { name: 'SA (Streptavidin)', cat: 'affinity', reuse: 'Irreversible Capture (Analyte Regenerable)', matrix: 'Streptavidin on CM-dextran', coupling: 'High-affinity biotin capture (KD ~ 10⁻¹⁵ M)', ligands: 'Biotinylated DNA/RNA, peptides, AviTag proteins. Tolerates harsh analyte regeneration.' },
  { name: 'L1 (Liposome Capture)', cat: 'lipid', reuse: 'Fully Reusable (Lipid Strip & Reload)', matrix: 'Lipophilic alkyl chains on dextran', coupling: 'Hydrophobic insertion of intact liposomes', ligands: 'GPCRs, ion channels. Strip liposomes with 20 mM CHAPS or isopropanol/NaOH.' },
  { name: 'HPA (Monolayer)', cat: 'lipid', reuse: 'Reusable Monolayer (Detergent Strip)', matrix: 'Flat hydrophobic alkanethiol SAM', coupling: 'Hybrid lipid monolayer formation', ligands: 'Lipid-protein interactions, antimicrobial peptides. Strip lipids with 40 mM Octyl-glucoside.' },
  { name: 'Au / Bare Gold (SAM)', cat: 'covalent', reuse: 'Custom Surface / Piranha or Plasma Clean', matrix: 'Unmodified planar gold film', coupling: 'Thiol-gold chemisorption', ligands: 'Custom mixed alkanethiols, DNA-thiol probes, glycan arrays.' }
];

const MODELS = [
  { id: '1to1', name: '1:1 Langmuir (Ideal)', eq: 'A + B ⇌ AB   |   KD = kd / ka', sig: 'Smooth exponential rise approaching steady-state equilibrium, followed by clean mono-exponential decay back toward baseline.', cause: 'One soluble analyte molecule binds reversibly to one independent immobilized ligand site without steric hindrance or diffusion limits.', fix: 'Fit globally across 5–8 analyte concentrations using a 1:1 Langmuir binding model with local or global Rmax.', fn: (t) => t < 60 ? 0 : (t < 240 ? 100 * (1 - Math.exp(-0.025 * (t - 60))) : 100 * (1 - Math.exp(-0.025 * 180)) * Math.exp(-0.012 * (t - 240))) },
  { id: 'bivalent', name: 'Bivalent Analyte (Avidity)', eq: 'A + B ⇌ AB;  AB + B ⇌ AB₂', sig: 'Biphasic association and unusually slow, multiphasic dissociation that fails to return to baseline.', cause: 'Bivalent analyte (e.g., IgG in flow) cross-links two adjacent immobilized ligands on a high-density surface.', fix: 'Lower R_ligand density (<50 RU) or invert assay orientation (immobilize IgG on Protein A/G chip and flow monovalent antigen).', fn: (t) => t < 60 ? 0 : (t < 240 ? 60 * (1 - Math.exp(-0.04 * (t - 60))) + 45 * (1 - Math.exp(-0.008 * (t - 60))) : 105 * (0.3 * Math.exp(-0.02 * (t - 240)) + 0.7 * Math.exp(-0.0015 * (t - 240)))) },
  { id: 'heterolig', name: 'Heterogeneous Ligand', eq: 'A + B₁ ⇌ AB₁  &  A + B₂ ⇌ AB₂', sig: 'Biphasic association and biphasic dissociation curved on a log-linear plot.', cause: 'Two distinct immobilized ligand populations on the chip (e.g., partial steric occlusion from random amine coupling).', fix: 'Fit with a Heterogeneous Ligand (2-site parallel) model or switch to oriented site-specific capture (AviTag-SA or His-NTA).', fn: (t) => t < 60 ? 0 : (t < 240 ? 55 * (1 - Math.exp(-0.05 * (t - 60))) + 45 * (1 - Math.exp(-0.01 * (t - 60))) : 55 * Math.exp(-0.035 * (t - 240)) + 45 * Math.exp(-0.003 * (t - 240))) },
  { id: 'heteroana', name: 'Heterogeneous Analyte', eq: 'A₁ + B ⇌ A₁B  &  A₂ + B ⇌ A₂B', sig: 'Overshoot "roll-over" peak during association followed by a downward decay before injection even ends.', cause: 'Two competing analyte species in solution (e.g., monomer + dimer/aggregate, or high-MW/low-affinity + low-MW/high-affinity).', fix: 'Purify analyte by SEC immediately before SPR run, or fit with a Heterogeneous Analyte competition model.', fn: (t) => t < 60 ? 0 : (t < 240 ? 115 * (1 - Math.exp(-0.06 * (t - 60))) - 35 * (1 - Math.exp(-0.015 * (t - 60))) : 80 * Math.exp(-0.005 * (t - 240))) },
  { id: 'twostate', name: 'Two-State Conformational', eq: 'A + B ⇌ AB ⇌ AB*', sig: 'Slow secondary tightening phase where complex stability increases with longer injection contact time.', cause: 'Initial encounter complex (AB) undergoes a slower conformational isomerization into a more stable state (AB*).', fix: 'Perform a linked-reactions test by varying contact time (60 s vs 300 s) and fit with a two-state reaction model.', fn: (t) => t < 60 ? 0 : (t < 240 ? 75 * (1 - Math.exp(-0.045 * (t - 60))) + 30 * (1 - Math.exp(-0.006 * (t - 60))) : 95 * Math.exp(-0.003 * (t - 240))) },
  { id: 'sck', name: 'Single-Cycle Kinetics (SCK)', eq: '5 Sequential Injections → 1 Dissociation', sig: 'Staircase ascending association steps without intermediate regeneration, followed by a single long dissociation phase.', cause: 'Used when ligands are too fragile for regeneration or dissociation is extremely slow (kd < 10⁻⁴ s⁻¹).', fix: 'Inject 5 ascending concentrations (e.g., 3-fold series) and fit globally using a Single-Cycle Kinetics 1:1 model.', fn: (t) => {
    if (t < 40) return 0;
    if (t < 100) return 22 * (1 - Math.exp(-0.04 * (t - 40)));
    if (t < 160) return 20 + 25 * (1 - Math.exp(-0.04 * (t - 100)));
    if (t < 220) return 43 + 27 * (1 - Math.exp(-0.04 * (t - 160)));
    if (t < 280) return 68 + 22 * (1 - Math.exp(-0.04 * (t - 220)));
    if (t < 340) return 88 + 15 * (1 - Math.exp(-0.04 * (t - 280)));
    return 102 * Math.exp(-0.004 * (t - 340));
  }},
  { id: 'mtl', name: 'Mass Transport Limitation', eq: 'A_bulk ⇌ A_surface + B ⇌ AB', sig: 'Nearly linear initial association slope and suppressed apparent ka/kd rates.', cause: 'Analyte diffusion from bulk flow to the sensor surface is slower than the intrinsic association rate.', fix: 'Increase flow rate (50–100 µL/min), reduce R_ligand density, and include a mass transport coefficient (km) in global fit.', fn: (t) => t < 60 ? 0 : (t < 240 ? Math.min(100, 0.58 * (t - 60)) : 100 * Math.exp(-0.006 * (t - 240))) },
  { id: 'steady', name: 'Steady-State (Fast On/Off)', eq: 'Req = (Rmax · [A]) / (KD + [A])', sig: 'Square-wave sensorgram profile reaching a flat plateau within seconds and dropping immediately to baseline.', cause: 'Weak affinity / fragment interaction with very fast dissociation rate (kd > 0.5 s⁻¹).', fix: 'Do not fit ka/kd; plot plateau response (Req) vs [Analyte] and fit the Langmuir equilibrium isotherm.', fn: (t) => t < 60 ? 0 : (t < 240 ? 85 * (1 - Math.exp(-0.35 * (t - 60))) : 85 * Math.exp(-0.35 * (t - 240))) },
  { id: 'nsb', name: 'Non-Specific Binding (NSB)', eq: 'R_total = R_specific + k_nsb · [A] · t', sig: 'Linear upward drift during association that does not saturate and elevates reference flow cell signal.', cause: 'Electrostatic or hydrophobic sticking of analyte to the dextran matrix or reference surface.', fix: 'Switch to low-charge CM4 or PEG chip, increase NaCl (300–500 mM), or add 0.05% P20 / 1 mg/mL soluble dextran.', fn: (t) => t < 60 ? 0 : (t < 240 ? 65 * (1 - Math.exp(-0.03 * (t - 60))) + 0.25 * (t - 60) : 65 * Math.exp(-0.015 * (t - 240)) + 45) },
  { id: 'drift', name: 'Baseline Drift / Ligand Decay', eq: 'R(t) = R_binding(t) - k_decay · t', sig: 'Continuous downward slope across baseline, association, and dissociation phases.', cause: 'Gradual leaching of non-covalently captured ligand (e.g., His-tag from NTA) or incomplete temperature equilibration.', fix: 'Use capture-coupling (brief EDC/NHS pulse after capture), switch to Tris-NTA/SA, or allow 30 min buffer prime.', fn: (t) => {
    const base = -0.08 * t;
    const bind = t < 60 ? 0 : (t < 240 ? 90 * (1 - Math.exp(-0.025 * (t - 60))) : 90 * (1 - Math.exp(-0.025 * 180)) * Math.exp(-0.012 * (t - 240)));
    return base + bind;
  }}
];

let activeModelIdx = 0;

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  document.getElementById('themeBtn').textContent = isLight ? 'Dark Mode' : 'Light Mode';
  calcAll();
  selectModel(activeModelIdx, document.querySelectorAll('#modelBtns .btn')[activeModelIdx]);
}

function showTab(idx, btn) {
  document.querySelectorAll('.panel').forEach((p, i) => p.classList.toggle('active', i === idx));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

function setRmaxPreset(mwL, mwA, ru) {
  document.getElementById('mwL').value = mwL;
  document.getElementById('mwA').value = mwA;
  document.getElementById('inputRU').value = ru;
  document.getElementById('rmaxMode').value = 'ligand';
  calcAll();
}

function calcAll() {
  const mode = document.getElementById('rmaxMode').value;
  const mwL = +document.getElementById('mwL').value || 1;
  const mwA = +document.getElementById('mwA').value || 1;
  const inRU = +document.getElementById('inputRU').value || 0;
  const val = +document.getElementById('valency').value || 1;
  const act = (+document.getElementById('activity').value || 100) / 100;

  if (mode === 'ligand') {
    const theoL = (inRU * mwL) / (mwA * val);
    const adjL = theoL / act;
    document.getElementById('resRmaxMain').textContent = Math.round(adjL) + ' RU (Target R_ligand)';
    document.getElementById('resRmaxSub').textContent = `Theoretical 100% active R_ligand: ${Math.round(theoL)} RU • Adjusted for ${Math.round(act*100)}% activity`;
  } else {
    const theoMax = (inRU * mwA * val) / mwL;
    const effMax = theoMax * act;
    document.getElementById('resRmaxMain').textContent = effMax.toFixed(1) + ' RU (Expected R_max)';
    document.getElementById('resRmaxSub').textContent = `Theoretical 100% R_max: ${theoMax.toFixed(1)} RU • Adjusted for ${Math.round(act*100)}% activity`;
  }

  const ka = +document.getElementById('ka').value || 1;
  const kd = +document.getElementById('kd').value || 1e-6;
  const kdNm = (kd / ka) * 1e9;
  const tHalfMin = (Math.log(2) / kd) / 60;
  document.getElementById('resKD').textContent = `K_D = ${kdNm.toFixed(2)} nM`;
  document.getElementById('resHalfLife').textContent = `Complex Half-Life (t1/2): ${tHalfMin.toFixed(1)} min • Recommended Range: ${(kdNm*0.1).toFixed(1)} – ${(kdNm*10).toFixed(1)} nM`;

  const top = +document.getElementById('topConc').value || 100;
  const df = +document.getElementById('dilFactor').value || 2;
  const vol = +document.getElementById('tubeVol').value || 200;
  const transfer = +(vol / (df - 1)).toFixed(1);
  const bufferVol = +(vol - transfer).toFixed(1);
  let rows = '';
  for (let i = 0; i < 6; i++) {
    const c = top / Math.pow(df, i);
    const occ = (c / (c + kdNm)) * 100;
    const inst = i === 0 ? `Prepare ${vol} µL working top stock in running buffer` : `Transfer ${transfer} µL from Tube ${i} + ${bufferVol} µL Running Buffer`;
    rows += `<tr><td>Tube ${i+1}</td><td>${c.toFixed(2)} nM</td><td>${occ.toFixed(1)}%</td><td>${inst}</td></tr>`;
  }
  rows += `<tr><td>Blank</td><td>0.00 nM</td><td>0.0%</td><td>${vol} µL 100% Running Buffer (Double-Reference)</td></tr>`;
  document.getElementById('dilutionTable').innerHTML = rows;

  const binKD = +document.getElementById('binKD').value || 1;
  const terKD = +document.getElementById('terKD').value || 1;
  const e3KD = +document.getElementById('e3KD').value || 40;
  const alpha = binKD / terKD;
  const ddG = -0.001987 * 298.15 * Math.log(alpha);
  const peakP = Math.sqrt(terKD * e3KD);
  const badge = document.getElementById('alphaBadge');
  if (alpha > 1.5) { badge.textContent = 'Positive'; badge.className = 'badge b-teal'; }
  else if (alpha < 0.7) { badge.textContent = 'Negative'; badge.className = 'badge b-orange'; }
  else { badge.textContent = 'Non-Cooperative'; badge.className = 'badge b-olive'; }
  document.getElementById('resAlpha').textContent = `α = ${alpha.toFixed(2)}×`;
  document.getElementById('resDDG').textContent = `ΔΔG = ${ddG.toFixed(2)} kcal/mol at 25°C • Hook Peak at ~${peakP.toFixed(1)} nM PROTAC`;
  drawHookPlot(terKD, e3KD);

  const dmsoTarget = +document.getElementById('dmsoTarget').value || 2.0;
  const slope = +document.getElementById('dmsoSlope').value || -0.015;
  const rawRU = +document.getElementById('sampleRaw').value || 0;
  const fc1RU = +document.getElementById('sampleFc1').value || 2400;
  const offset = slope * fc1RU;
  const corrRU = rawRU - offset;
  document.getElementById('resDmsoCorr').textContent = `Corrected Response: ${corrRU >= 0 ? '+' : ''}${corrRU.toFixed(1)} RU`;
  document.getElementById('resDmsoSub').textContent = `Interpolated Offset: ${offset.toFixed(1)} RU at Fc1 = ${fc1RU} RU (Target ${dmsoTarget.toFixed(1)}% DMSO)`;
  drawDmsoPlot(dmsoTarget, slope, fc1RU, offset);
}

function getCssVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function drawHookPlot(terKD, e3KD) {
  const svg = document.getElementById('hookSvg');
  const strokeCol = getCssVar('--olive');
  const axisCol = getCssVar('--border');
  const textCol = getCssVar('--muted');
  let pts = [];
  for (let i = 0; i <= 50; i++) {
    const logP = -1 + (i / 50) * 5;
    const p = Math.pow(10, logP);
    const frac = (p / terKD) / (1 + (p / terKD) + (p * p) / (terKD * e3KD));
    const x = 40 + (i / 50) * 380;
    const y = 135 - Math.min(1, frac * 1.4) * 110;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  svg.innerHTML = `<line x1="40" y1="135" x2="420" y2="135" stroke="${axisCol}"/><line x1="40" y1="20" x2="40" y2="135" stroke="${axisCol}"/><polyline fill="none" stroke="${strokeCol}" stroke-width="2.5" points="${pts.join(' ')}"/><text x="230" y="152" fill="${textCol}" font-size="10" text-anchor="middle">log10 [PROTAC] (0.1 nM → 10 µM) — Hook Effect Profile</text>`;
}

function drawDmsoPlot(target, slope, sampleFc1, sampleOffset) {
  const svg = document.getElementById('dmsoSvg');
  const lineCol = getCssVar('--orange');
  const dotCol = getCssVar('--peach');
  const axisCol = getCssVar('--border');
  const textCol = getCssVar('--muted');
  const minFc1 = Math.max(600, (target - 0.6) * 1200);
  const maxFc1 = (target + 0.6) * 1200;
  const x1 = 45, y1 = 75 - (slope * minFc1) * 0.8;
  const x2 = 415, y2 = 75 - (slope * maxFc1) * 0.8;
  const sx = 45 + Math.min(1, Math.max(0, (sampleFc1 - minFc1) / (maxFc1 - minFc1))) * 370;
  const sy = 75 - sampleOffset * 0.8;
  svg.innerHTML = `<line x1="45" y1="75" x2="415" y2="75" stroke="${axisCol}" stroke-dasharray="3,3"/><line x1="${x1}" y1="${y1.toFixed(1)}" x2="${x2}" y2="${y2.toFixed(1)}" stroke="${lineCol}" stroke-width="2.5"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5" fill="${dotCol}"/><text x="230" y="152" fill="${textCol}" font-size="10" text-anchor="middle">Reference Fc1 Bulk Signal (RU) vs (Fc2 - Fc1) Offset</text>`;
}

function filterChips(cat, btn) {
  document.querySelectorAll('.btn-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const list = cat === 'all' ? CHIPS : CHIPS.filter(c => c.cat === cat);
  document.getElementById('chipTable').innerHTML = list.map(c => {
    const badgeClass = c.cat === 'reusable' ? 'b-teal' : (c.cat === 'lipid' ? 'b-orange' : 'b-peach');
    return `<tr><td><strong>${c.name}</strong></td><td><span class="badge ${badgeClass}">${c.reuse}</span></td><td>${c.matrix}</td><td>${c.coupling}</td><td>${c.ligands}</td></tr>`;
  }).join('');
}

function initModels() {
  const box = document.getElementById('modelBtns');
  box.innerHTML = MODELS.map((m, i) => `<button class="btn btn-sm ${i===0?'btn-peach':''}" onclick="selectModel(${i}, this)">${m.name}</button>`).join('');
  selectModel(0, box.firstChild);
}

function selectModel(idx, btn) {
  activeModelIdx = idx;
  document.querySelectorAll('#modelBtns .btn').forEach(b => b.classList.remove('btn-peach'));
  if (btn) btn.classList.add('btn-peach');
  const m = MODELS[idx];
  document.getElementById('modelDetails').innerHTML = `<strong>${m.name}</strong><div class="eq-pill">${m.eq}</div><p style="margin:8px 0;"><span style="color:var(--teal);font-weight:600;">Visual Signature:</span> ${m.sig}</p><p style="margin:8px 0;"><span style="color:var(--peach);font-weight:600;">Biophysical Cause:</span> ${m.cause}</p><p style="margin:8px 0;"><span style="color:var(--olive);font-weight:600;">Remediation / Fitting:</span> ${m.fix}</p>`;
  const svg = document.getElementById('curveSvg');
  const axisCol = getCssVar('--border');
  const textCol = getCssVar('--muted');
  const scales = m.id === 'sck' ? [1.0] : [1.0, 0.65, 0.4, 0.22];
  const colors = [getCssVar('--peach'), getCssVar('--teal'), getCssVar('--olive'), getCssVar('--orange')];
  let polylines = '';
  scales.forEach((sc, sIdx) => {
    let pts = [];
    for (let t = 0; t <= 420; t += 4) {
      const x = 40 + (t / 420) * 440;
      const y = 185 - (m.fn(t) * sc) * 1.25;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    polylines += `<polyline fill="none" stroke="${colors[sIdx]}" stroke-width="2.2" points="${pts.join(' ')}"/>`;
  });
  svg.innerHTML = `<line x1="40" y1="185" x2="480" y2="185" stroke="${axisCol}"/><line x1="40" y1="15" x2="40" y2="210" stroke="${axisCol}"/>${polylines}<text x="70" y="225" fill="${textCol}" font-size="10">Baseline</text><text x="175" y="225" fill="${textCol}" font-size="10">Association</text><text x="340" y="225" fill="${textCol}" font-size="10">Dissociation</text>`;
}

function resetChecks() {
  document.querySelectorAll('#checklistBox input').forEach(c => { c.checked = false; });
}

function exportCSV() {
  const expId = document.getElementById('metaExp').value;
  const lig = document.getElementById('metaLigand').value;
  const inst = document.getElementById('metaInst').value;
  const lines = [
    'Section,Parameter,Value,Notes',
    `Metadata,Experiment ID,"${expId}","${inst}"`,
    `Metadata,Target Ligand,"${lig}",Ligand MW: ${document.getElementById('mwL').value} Da | Analyte MW: ${document.getElementById('mwA').value} Da`,
    `Rmax,"${document.getElementById('resRmaxMain').textContent}","${document.getElementById('resRmaxSub').textContent}",Valency: ${document.getElementById('valency').value}`,
    `Kinetics,"${document.getElementById('resKD').textContent}","${document.getElementById('resHalfLife').textContent}",ka=${document.getElementById('ka').value} | kd=${document.getElementById('kd').value}`,
    `PROTAC,"${document.getElementById('resAlpha').textContent}","${document.getElementById('resDDG').textContent}",Binary KD=${document.getElementById('binKD').value} nM | Ternary KD=${document.getElementById('terKD').value} nM`,
    `DMSO,"${document.getElementById('resDmsoCorr').textContent}","${document.getElementById('resDmsoSub').textContent}",Slope=${document.getElementById('dmsoSlope').value}`
  ];
  document.querySelectorAll('#dilutionTable tr').forEach(tr => {
    const tds = Array.from(tr.querySelectorAll('td')).map(td => `"${td.textContent}"`);
    lines.push(`Serial Dilution,${tds.join(',')}`);
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${expId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-runsheet.csv`;
  a.click();
}

calcAll();
filterChips('all', document.querySelector('.btn-chip'));
initModels();
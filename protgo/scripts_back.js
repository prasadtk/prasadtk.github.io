
// ====== State ======
const organismInput = document.getElementById('organism');
const organismList = document.getElementById('organismList');
let selectedOrganismId = "";

// ====== Helpers ======
function showList(el) { el.style.display = "block"; }
function hideList(el) { el.style.display = "none"; }
function safeText(s) { return (s === null || s === undefined) ? "" : String(s); }

// Close autocomplete when clicking outside
document.addEventListener('click', (e) => {
  if (!organismInput.contains(e.target) && !organismList.contains(e.target)) {
    hideList(organismList);
  }
});

// ====== Autocomplete for organisms ======
organismInput.addEventListener('input', async function() {
  const term = organismInput.value.trim();
  selectedOrganismId = "";
  if (!term) { hideList(organismList); return; }

  try {
    const url = `https://rest.uniprot.org/taxonomy/search?query=${encodeURIComponent(term)}&size=10&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    organismList.innerHTML = "";
    (data.results || []).forEach(org => {
      const item = document.createElement('button');
      item.type = "button";
      item.className = "list-group-item list-group-item-action";
      item.textContent = `${org.scientificName} (ID: ${org.taxonId})`;
      item.onclick = () => {
        organismInput.value = org.scientificName;
        selectedOrganismId = org.taxonId;
        hideList(organismList);
      };
      organismList.appendChild(item);
    });

    (data.results || []).length ? showList(organismList) : hideList(organismList);
  } catch (err) {
    hideList(organismList);
  }
});

// ====== Search UniProt and render results ======
document.getElementById('searchForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const query = document.getElementById('query').value.trim();
  const field = document.getElementById('field').value;
  if (!query) return;

  let searchField = field === "gene" ? `gene:${query}` : `protein_name:${query}`;
  let url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(searchField)}`;
  if (selectedOrganismId) url += `+AND+organism_id:${selectedOrganismId}`;
  url += "&format=json&size=5";

  const resultsBody = document.getElementById('resultsBody');
  resultsBody.innerHTML = `<tr><td colspan="7" class="text-center"><span class="spinner"></span> Searching...</td></tr>`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    resultsBody.innerHTML = "";

    (data.results || []).forEach(entry => {
      const uniId = safeText(entry.primaryAccession);
      const uniLink = `https://www.uniprot.org/uniprotkb/${uniId}`;
      const proteinName = safeText(entry.proteinDescription?.recommendedName?.fullName?.value) || "N/A";
      const geneName = safeText(entry.genes?.[0]?.geneName?.value) || "N/A";
      const organismName = safeText(entry.organism?.scientificName) || "N/A";
      const seqLength = safeText(entry.sequence?.length) || "N/A";

      // Combined Protein + Organism column
      const proteinOrganismCol = `
        <div>${proteinName}</div>
        <div style="margin-top:0.5em;"><em>${organismName}</em></div>
      `;

      // ====== PDB xrefs grouped by chain/position ======
      const pdbRefs = (entry.uniProtKBCrossReferences || []).filter(ref => ref.database === "PDB");
      const grouped = {};
      pdbRefs.forEach(ref => {
        const chainPos = (ref.properties || []).find(p => p.key === "Chains")?.value || "Unspecified";
        if (!grouped[chainPos]) grouped[chainPos] = [];
        grouped[chainPos].push(ref.id);
      });

      let pdbListHtml = "";
      Object.entries(grouped).forEach(([pos, pdbIds], idx) => {
        const collapseId = `${uniId}-pdb-${idx}`;
        const links = pdbIds.map(pdbId => {
          const rcsbLink = `https://www.rcsb.org/structure/${pdbId}`;
          const detailsId = `${collapseId}-details-${pdbId}`;
          return `
            <div class="mb-2">
              <strong>${pdbId}</strong>
              [<a class="link" href="${rcsbLink}" target="_blank">RCSB</a>]
              <button class="btn btn-sm btn-outline-info ms-2 w-100 w-md-auto" onclick="checkPDB('${pdbId}', '${detailsId}')">Title</button>
              <div id="${detailsId}" class="small-text mt-1"></div>
            </div>
          `;
        }).join("");
        pdbListHtml += `
          <div class="pdb-group">
            <button class="btn btn-sm btn-outline-secondary w-100 w-md-auto" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
              ${pos}
            </button>
            <div id="${collapseId}" class="collapse mt-2">${links}</div>
          </div>`;
      });

      if (!pdbListHtml) pdbListHtml = `<span class="muted">No PDB structures</span>`;

      // Always add AlphaFold link
      const alphaFoldLink = `https://www.alphafold.ebi.ac.uk/entry/${uniId}`;
      pdbListHtml += `
        <div class="mt-2">
          <a class="link" href="${alphaFoldLink}" target="_blank">AlphaFold Model</a>
        </div>`;

      // ====== Sequence column: button + length ======
      const seqCol = `
        <div>
          <button class="btn btn-sm btn-info w-100 w-md-auto mb-1" onclick="showSequence('${uniId}')">View Sequence</button>
          <div class="small-text">Length: ${seqLength} aa</div>
        </div>`;

      // ====== Domain features ======
      const domainFeatures = (entry.features || [])
        .filter(f => f.type === "Domain")
        .map(f => {
          const start = f.location?.start?.value || "?";
          const end = f.location?.end?.value || "?";
          return `${f.description || "Domain"} (${start}-${end})`;
        });

      let domainHtml = "";
      if (domainFeatures.length) {
        domainHtml = domainFeatures.map(d => `<div>${d}</div>`).join("");
      } else {
        domainHtml = `<span class="muted">No domain annotations</span>`;
      }

      // ====== Cross-links ======
      const crossLinks = `
        <a class="link" href="https://www.proteinatlas.org/search/${encodeURIComponent(geneName)}" target="_blank">HPA</a> |
        <a class="link" href="https://string-db.org/search?query=${encodeURIComponent(geneName)}" target="_blank">STRING</a> |
        <a class="link" href="https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${encodeURIComponent(geneName)}" target="_blank">Ensembl</a> |
        <a class="link" href="https://www.ncbi.nlm.nih.gov/gene/?term=${encodeURIComponent(geneName)}" target="_blank">NCBI Gene</a>`;

      // ====== Row HTML ======
      const row = `<tr>
        <td><a class="link" href="${uniLink}" target="_blank">${uniId}</a></td>
        <td>${proteinOrganismCol}</td>
        <td>${geneName}</td>
        <td>${pdbListHtml}</td>
        <td>${seqCol}</td>
        <td>${domainHtml}</td>
        <td>${crossLinks}</td>
      </tr>`;
      resultsBody.innerHTML += row;
    });

    document.getElementById('resultsTable').classList.remove('d-none');
    if (!(data.results || []).length) {
      resultsBody.innerHTML = `<tr><td colspan="7" class="text-center muted">No results found.</td></tr>`;
    }
  } catch (err) {
    resultsBody.innerHTML = `<tr><td colspan="7" class="text-danger">Error fetching results. Please try again.</td></tr>`;
  }
});



// ====== Sequence modal (FASTA) ======
async function showSequence(uniId) {
  const seqUrl = `https://rest.uniprot.org/uniprotkb/${encodeURIComponent(uniId)}.fasta`;
  const pre = document.getElementById('sequenceContent');
  pre.textContent = "Loading sequence...";
  try {
    const fasta = await fetch(seqUrl).then(r => r.text());
    pre.textContent = fasta || "No sequence available.";
  } catch (err) {
    pre.textContent = "Failed to load sequence.";
  }
  const modal = new bootstrap.Modal(document.getElementById('sequenceModal'));
  modal.show();
}



// ====== Fetch only PDB title from RCSB ======
async function checkPDB(pdbId, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = `Fetching title <span class="spinner"></span>`;

  try {
    const url = `https://data.rcsb.org/rest/v1/core/entry/${encodeURIComponent(pdbId)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("RCSB response not OK");
    const data = await res.json();

    const title = data.struct?.title || "No title available";
    target.innerHTML = `<div><strong>Title:</strong> ${title}</div>`;
  } catch (err) {
    target.innerHTML = `<span class="text-danger">Failed to fetch title for ${pdbId}.</span>`;
  }
}

// Никаких установок. Чистый JS.

const state = { works: [], tags: new Set(), activeTag: null, query: "" };
const $grid = document.getElementById('grid');
const $tags = document.getElementById('tags');
const $search = document.getElementById('search');
const $year = document.getElementById('year');
$year.textContent = new Date().getFullYear();

fetch('data/works.json')
  .then(r => r.json())
  .then(data => {
    state.works = data;
    data.forEach(w => (w.tags || []).forEach(t => state.tags.add(t)));
    renderTags(); renderGrid();
  })
  .catch(() => { $grid.innerHTML = '<p>Не удалось загрузить список работ.</p>'; });

$search.addEventListener('input', e => { state.query = e.target.value.trim().toLowerCase(); renderGrid(); });

function renderTags() {
  $tags.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'tag' + (state.activeTag === null ? ' active' : '');
  all.textContent = 'Все';
  all.onclick = () => { state.activeTag = null; renderTags(); renderGrid(); };
  $tags.appendChild(all);

  [...state.tags].sort().forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag' + (state.activeTag === tag ? ' active' : '');
    btn.textContent = tag;
    btn.onclick = () => { state.activeTag = (state.activeTag===tag?null:tag); renderTags(); renderGrid(); };
    $tags.appendChild(btn);
  });
}

function renderGrid() {
  const q = state.query, tag = state.activeTag;
  const items = state.works.filter(w => {
    const byTag = !tag || (w.tags || []).includes(tag);
    const text = (w.title + ' ' + (w.tags||[]).join(' ') + ' ' + (w.year||'')).toLowerCase();
    const byQuery = !q || text.includes(q);
    return byTag && byQuery;
  });

  if (items.length === 0) { $grid.innerHTML = '<p>Ничего не найдено.</p>'; return; }

  $grid.innerHTML = items.map(w => cardHTML(w)).join('');
  attachCardHandlers(items);
}

function cardHTML(w) {
  const thumbAttr = w.thumb ? `src="${w.thumb}"` : `src="${w.src}"`;
  const alt = w.title ? `alt="${escapeHTML(w.title)}"` : 'alt=""';
  return `
  <article class="card" data-id="${w.id}">
    <img class="thumb" loading="lazy" ${thumbAttr} ${alt} />
    <div class="card-body">
      <h4 class="card-title">${escapeHTML(w.title || '')}</h4>
      <p class="card-meta">${[w.year, (w.tags||[]).join(' · ')].filter(Boolean).join(' · ')}</p>
    </div>
  </article>`;
}

function attachCardHandlers(items) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const w = items.find(x => String(x.id) === String(id)) || state.works.find(x => String(x.id)===String(id));
      openLightbox(w);
    });
  });
}

const $lb = document.getElementById('lightbox');
const $lbContent = document.getElementById('lbContent');
const $lbClose = document.getElementById('lbClose');
$lbClose.addEventListener('click', () => $lb.close());
$lb.addEventListener('click', (e) => { if (e.target === $lb) $lb.close(); });

function openLightbox(w) {
  if (!w) return;
  let inner = '';
  if (w.type === 'video') {
    if (w.embed) {
      inner = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:10px;">
        <iframe src="${w.embed}" title="${escapeHTML(w.title || '')}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe>
      </div>`;
    } else {
      inner = `<video class="lb-media" src="${w.src}" controls playsinline></video>`;
    }
  } else {
    inner = `<img class="lb-media" src="${w.src}" alt="${escapeHTML(w.title || '')}" />`;
  }
  const caption = `<div class="lb-caption"><strong>${escapeHTML(w.title || '')}</strong>
    ${w.year ? ` · ${escapeHTML(String(w.year))}` : ''} ${w.tags?.length ? ` · ${w.tags.map(escapeHTML).join(', ')}` : ''}</div>`;
  $lbContent.innerHTML = inner + caption;
  $lb.showModal();
}

function escapeHTML(s){ return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

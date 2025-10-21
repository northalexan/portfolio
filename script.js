{\rtf1\ansi\ansicpg1251\cocoartf2761
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // \uc0\u1053 \u1080 \u1082 \u1072 \u1082 \u1080 \u1093  \u1091 \u1089 \u1090 \u1072 \u1085 \u1086 \u1074 \u1086 \u1082 . \u1063 \u1080 \u1089 \u1090 \u1099 \u1081  JS.\
\
const state = \{ works: [], tags: new Set(), activeTag: null, query: "" \};\
const $grid = document.getElementById('grid');\
const $tags = document.getElementById('tags');\
const $search = document.getElementById('search');\
const $year = document.getElementById('year');\
$year.textContent = new Date().getFullYear();\
\
fetch('data/works.json')\
  .then(r => r.json())\
  .then(data => \{\
    state.works = data;\
    data.forEach(w => (w.tags || []).forEach(t => state.tags.add(t)));\
    renderTags(); renderGrid();\
  \})\
  .catch(() => \{ $grid.innerHTML = '<p>\uc0\u1053 \u1077  \u1091 \u1076 \u1072 \u1083 \u1086 \u1089 \u1100  \u1079 \u1072 \u1075 \u1088 \u1091 \u1079 \u1080 \u1090 \u1100  \u1089 \u1087 \u1080 \u1089 \u1086 \u1082  \u1088 \u1072 \u1073 \u1086 \u1090 .</p>'; \});\
\
$search.addEventListener('input', e => \{ state.query = e.target.value.trim().toLowerCase(); renderGrid(); \});\
\
function renderTags() \{\
  $tags.innerHTML = '';\
  const all = document.createElement('button');\
  all.className = 'tag' + (state.activeTag === null ? ' active' : '');\
  all.textContent = '\uc0\u1042 \u1089 \u1077 ';\
  all.onclick = () => \{ state.activeTag = null; renderTags(); renderGrid(); \};\
  $tags.appendChild(all);\
\
  [...state.tags].sort().forEach(tag => \{\
    const btn = document.createElement('button');\
    btn.className = 'tag' + (state.activeTag === tag ? ' active' : '');\
    btn.textContent = tag;\
    btn.onclick = () => \{ state.activeTag = (state.activeTag===tag?null:tag); renderTags(); renderGrid(); \};\
    $tags.appendChild(btn);\
  \});\
\}\
\
function renderGrid() \{\
  const q = state.query, tag = state.activeTag;\
  const items = state.works.filter(w => \{\
    const byTag = !tag || (w.tags || []).includes(tag);\
    const text = (w.title + ' ' + (w.tags||[]).join(' ') + ' ' + (w.year||'')).toLowerCase();\
    const byQuery = !q || text.includes(q);\
    return byTag && byQuery;\
  \});\
\
  if (items.length === 0) \{ $grid.innerHTML = '<p>\uc0\u1053 \u1080 \u1095 \u1077 \u1075 \u1086  \u1085 \u1077  \u1085 \u1072 \u1081 \u1076 \u1077 \u1085 \u1086 .</p>'; return; \}\
\
  $grid.innerHTML = items.map(w => cardHTML(w)).join('');\
  attachCardHandlers(items);\
\}\
\
function cardHTML(w) \{\
  const thumbAttr = w.thumb ? `src="$\{w.thumb\}"` : `src="$\{w.src\}"`;\
  const alt = w.title ? `alt="$\{escapeHTML(w.title)\}"` : 'alt=""';\
  return `\
  <article class="card" data-id="$\{w.id\}">\
    <img class="thumb" loading="lazy" $\{thumbAttr\} $\{alt\} />\
    <div class="card-body">\
      <h4 class="card-title">$\{escapeHTML(w.title || '')\}</h4>\
      <p class="card-meta">$\{[w.year, (w.tags||[]).join(' \'b7 ')].filter(Boolean).join(' \'b7 ')\}</p>\
    </div>\
  </article>`;\
\}\
\
function attachCardHandlers(items) \{\
  document.querySelectorAll('.card').forEach(card => \{\
    card.addEventListener('click', () => \{\
      const id = card.getAttribute('data-id');\
      const w = items.find(x => String(x.id) === String(id)) || state.works.find(x => String(x.id)===String(id));\
      openLightbox(w);\
    \});\
  \});\
\}\
\
const $lb = document.getElementById('lightbox');\
const $lbContent = document.getElementById('lbContent');\
const $lbClose = document.getElementById('lbClose');\
$lbClose.addEventListener('click', () => $lb.close());\
$lb.addEventListener('click', (e) => \{ if (e.target === $lb) $lb.close(); \});\
\
function openLightbox(w) \{\
  if (!w) return;\
  let inner = '';\
  if (w.type === 'video') \{\
    if (w.embed) \{\
      inner = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:10px;">\
        <iframe src="$\{w.embed\}" title="$\{escapeHTML(w.title || '')\}"\
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"\
          allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe>\
      </div>`;\
    \} else \{\
      inner = `<video class="lb-media" src="$\{w.src\}" controls playsinline></video>`;\
    \}\
  \} else \{\
    inner = `<img class="lb-media" src="$\{w.src\}" alt="$\{escapeHTML(w.title || '')\}" />`;\
  \}\
  const caption = `<div class="lb-caption"><strong>$\{escapeHTML(w.title || '')\}</strong>\
    $\{w.year ? ` \'b7 $\{escapeHTML(String(w.year))\}` : ''\} $\{w.tags?.length ? ` \'b7 $\{w.tags.map(escapeHTML).join(', ')\}` : ''\}</div>`;\
  $lbContent.innerHTML = inner + caption;\
  $lb.showModal();\
\}\
\
function escapeHTML(s)\{ return (s||'').replace(/[&<>"']/g, m => (\{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'\}[m])); \}\
}
// Год в футере
if(yEl) yEl.textContent = new Date().getFullYear();


// Лайтбокс
const lb = document.getElementById('lightbox');
const lbContent = document.getElementById('lbContent');
const lbClose = document.getElementById('lbClose');


function openLightbox(el){
const type = el.dataset.type;
const src = el.dataset.src;
const poster = el.dataset.poster || '';
lbContent.innerHTML = '';
if(type === 'video'){
const v = document.createElement('video');
v.src = src; if(poster) v.poster = poster;
v.controls = true; v.autoplay = true;
lbContent.appendChild(v);
} else {
const img = document.createElement('img');
img.src = src; img.alt = el.querySelector('img')?.alt || '';
lbContent.appendChild(img);
}
lb.classList.add('open');
lb.setAttribute('aria-hidden','false');
}
function closeLightbox(){
lb.classList.remove('open');
lb.setAttribute('aria-hidden','true');
lbContent.innerHTML = '';
}


document.getElementById('gallery').addEventListener('click', (e)=>{
const card = e.target.closest('.card');
if(!card) return; openLightbox(card);
});
if(lb){
lb.addEventListener('click', (e)=>{ if(e.target === lb) closeLightbox(); });
lbClose.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox(); });
}


// Фильтр и поиск
const chips = document.querySelectorAll('.chip');
const search = document.getElementById('search');
const cards = Array.from(document.querySelectorAll('#gallery .card'));
let currentFilter = 'all';


function normalize(s){ return (s||'').toLowerCase().trim(); }


function applyFilters(){
const q = normalize(search?.value);
cards.forEach(card=>{
const type = card.dataset.type;
const tags = (card.dataset.tags||'').toLowerCase();
const title = card.querySelector('.title')?.textContent.toLowerCase()||'';
const matchType = currentFilter==='all' || currentFilter===type;
const matchText = !q || tags.includes(q) || title.includes(q);
card.style.display = (matchType && matchText) ? '' : 'none';
});
}


chips.forEach(ch=>{
ch.addEventListener('click',()=>{
chips.forEach(c=>c.classList.remove('active'));
ch.classList.add('active');
currentFilter = ch.dataset.filter;
applyFilters();
});
});
if(search){ search.addEventListener('input', applyFilters); }

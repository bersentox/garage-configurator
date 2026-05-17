const toggle=document.querySelector('.menu-toggle');
const menu=document.getElementById('mobile-menu');
if(toggle&&menu){toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',open);});}
const path=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.nav-link').forEach(l=>{if(l.getAttribute('href')===path)l.classList.add('active');});
const obs='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('reveal-visible')),{threshold:.12}):null;
document.querySelectorAll('.reveal').forEach(el=>obs?obs.observe(el):el.classList.add('reveal-visible'));


window.addEventListener('load', () => {
  const intro = document.getElementById('intro');
  if (intro) setTimeout(() => intro.classList.add('done'), 2600);
});
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 20); });
const ham = document.getElementById('hamburger');
const menu = document.getElementById('mobile-menu');
if (ham && menu) {
  ham.addEventListener('click', () => { ham.classList.toggle('open'); menu.classList.toggle('open'); });
}
function closeMobile(){ if(ham&&menu){ham.classList.remove('open');menu.classList.remove('open');} }
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

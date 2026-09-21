
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

// 画像の右クリック・ドラッグ・長押し保存の抑止（2026-09-07）
document.addEventListener('contextmenu', e => { if (e.target.closest('img, svg, .dwg-card')) e.preventDefault(); });
document.addEventListener('dragstart', e => { if (e.target.closest('img, svg')) e.preventDefault(); });

// デモ機・中古機ページからの問い合わせ（index.html?used=ID#contact）：種別と本文を事前入力（2026-09-21）
(function(){
  var m = new URLSearchParams(location.search).get('used'); if(!m) return;
  var f = document.querySelector('.contact-form'); if(!f) return;
  var cat = f.querySelector('[name="category"]'); if(cat) cat.value = 'used';
  var msg = f.querySelector('[name="message"]');
  if(msg && !msg.value) msg.value = 'デモ機・中古機（ID：' + m + '）について問い合わせます。\n\nご希望（価格・追加写真・テストカット・納期など）：\n';
})();

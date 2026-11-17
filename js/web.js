/* Sergio Martínez Cid · web personal (ESI-UCLM)
   Sin dependencias. La página funciona igual sin este fichero. */

/* 1. Resalta en el menú la sección que se está leyendo. */
(function () {
  var enlaces = [].slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  if (!('IntersectionObserver' in window) || !enlaces.length) return;
  var porId = {};
  enlaces.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting || !porId[e.target.id]) return;
      enlaces.forEach(function (a) { a.removeAttribute('aria-current'); });
      var a = porId[e.target.id];
      a.setAttribute('aria-current', 'location');
      var ul = a.closest('ul');
      if (ul.scrollWidth > ul.clientWidth) ul.scrollLeft = a.offsetLeft - ul.clientWidth / 2 + a.offsetWidth / 2;
    });
  }, { rootMargin: '-25% 0px -65% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { obs.observe(s); });
})();

/* 2. Un saludo en ASCII para quien abra la consola del navegador. */
(function () {
  if (!window.console || !console.log) return;
  var arte = [
    ' ____  __  __  ____ ',
    '/ ___||  \\/  |/ ___|',
    '\\___ \\| |\\/| | |    ',
    ' ___) | |  | | |___ ',
    '|____/|_|  |_|\\____|'
  ].join('\n');
  var texto = document.documentElement.lang === 'en'
    ? 'If you like tinkering, do your Bachelor\'s or Master\'s thesis with me → sergio.martinezcid@uclm.es'
    : 'Si te gusta trastear, haz tu TFG/TFM conmigo → sergio.martinezcid@uclm.es';
  console.log('%c' + arte + '\n\n%c' + texto, 'color:#c43b62;font-family:monospace;font-weight:bold', 'font-size:12px');
})();

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

/* 2. Portada (solo escritorio, y no si el usuario pide menos movimiento).
   Arriba del todo, el nombre, el puesto, los enlaces y el menú se ven en grande en la
   cabecera del contenido; al hacer scroll se desplazan hasta su sitio en la barra lateral.
   Los elementos que se mueven son los de la barra (no hay contenido duplicado para los
   lectores de pantalla): la portada es una copia invisible que solo marca dónde empiezan. */
(function () {
  var raiz = document.documentElement;
  var lateral = document.querySelector('.lateral');
  var cont = document.querySelector('main .contenedor');
  if (!lateral || !cont || !window.matchMedia || !window.requestAnimationFrame) return;
  var ancho = window.matchMedia('(min-width: 62rem)');
  var calma = window.matchMedia('(prefers-reduced-motion: reduce)');
  var portada = null, pares = [], recorrido = 1, pendiente = false;

  // Cada elemento recorre su camino en dos ejes con ritmos distintos (fracción del recorrido total):
  //  - nombre y puesto (cambian de tamaño): primero bajan y luego van a la izquierda,
  //    para no pasar por encima de la foto;
  //  - enlaces y menú: primero van a la izquierda y luego bajan,
  //    para salir de la columna de texto antes de que suba el contenido.
  var TEXTO = { x: 0.75, y: 0.5 }, LISTA = { x: 0.45, y: 0.6 };
  function par(enBarra, enPortada, escala, ritmo) {
    pares.push({ barra: enBarra, portada: enPortada, escala: escala, ritmo: ritmo });
  }

  function construir() {
    portada = document.createElement('div');
    portada.className = 'portada';
    portada.setAttribute('aria-hidden', 'true');

    var h1 = lateral.querySelector('h1');
    var nombre = document.createElement('p');
    nombre.className = 'nombre-portada';
    nombre.textContent = h1.textContent;
    var cargo = lateral.querySelector('.cargo');
    var cargoCopia = cargo.cloneNode(true);
    var enlCopia = document.createElement('ul');
    enlCopia.className = 'enlaces';
    var menuCopia = document.createElement('ul');
    menuCopia.className = 'menu-portada';
    portada.appendChild(nombre);
    portada.appendChild(cargoCopia);
    portada.appendChild(enlCopia);
    portada.appendChild(menuCopia);

    par(h1, nombre, true, TEXTO);
    par(cargo, cargoCopia, true, TEXTO);
    [].forEach.call(lateral.querySelectorAll('.enlaces > li'), function (li) {
      if (li.querySelector('.idioma')) return;            // el botón de idioma no se mueve
      var c = li.cloneNode(true); enlCopia.appendChild(c); par(li, c, false, LISTA);
    });
    [].forEach.call(lateral.querySelectorAll('.menu li'), function (li) {
      var c = li.cloneNode(true); menuCopia.appendChild(c); par(li, c, false, LISTA);
    });
    [].forEach.call(portada.querySelectorAll('a'), function (a) {
      a.removeAttribute('href'); a.removeAttribute('aria-current'); a.removeAttribute('hreflang');
    });
    cont.insertBefore(portada, cont.firstChild);
  }

  function medir() {
    var y = window.scrollY;
    pares.forEach(function (p) { p.barra.style.transform = ''; });
    pares.forEach(function (p) {
      var f = p.barra.getBoundingClientRect();
      var h = p.portada.getBoundingClientRect();
      p.fx = f.left; p.fy = f.top;                         // la barra es fija: no cambia con el scroll
      p.hx = h.left; p.hy = h.top + y;                     // la portada se mueve con la página
      p.s = p.escala && f.width ? h.width / f.width : 1;
      p.barra.style.transformOrigin = '0 0';
    });
    recorrido = Math.max(1, portada.offsetHeight * 0.8);
    pintar();
  }

  function avance(y, tramo) {
    var t = Math.min(1, Math.max(0, y / tramo));
    return t * t * (3 - 2 * t);                            // suaviza el principio y el final
  }

  function pintar() {
    pendiente = false;
    var y = window.scrollY;
    pares.forEach(function (p) {
      var kx = 1 - avance(y, recorrido * p.ritmo.x);
      var ky = 1 - avance(y, recorrido * p.ritmo.y);
      if (kx === 0 && ky === 0) { p.barra.style.transform = ''; return; }
      var dx = (p.hx - p.fx) * kx;
      var dy = (p.hy - y - p.fy) * ky;
      var s = 1 + (p.s - 1) * kx;
      p.barra.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
    });
  }

  function activa() { return raiz.classList.contains('portada-activa'); }

  function evaluar() {
    if (ancho.matches && !calma.matches) {
      if (!portada) construir();
      raiz.classList.add('portada-activa');
      medir();
    } else if (activa()) {
      raiz.classList.remove('portada-activa');
      pares.forEach(function (p) { p.barra.style.transform = ''; });
    }
  }

  window.addEventListener('scroll', function () {
    if (activa() && !pendiente) { pendiente = true; requestAnimationFrame(pintar); }
  }, { passive: true });
  window.addEventListener('resize', function () { if (activa()) medir(); });
  window.addEventListener('load', function () { if (activa()) medir(); });
  [ancho, calma].forEach(function (m) {
    if (m.addEventListener) m.addEventListener('change', evaluar); else m.addListener(evaluar);
  });
  evaluar();
})();

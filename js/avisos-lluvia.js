/*! © 2026 Agustín Escribano · necesitounaapp.es · Todos los derechos reservados. Prohibida su copia, reproducción o uso sin permiso por escrito. */
(function(){"use strict";const c=`
    <svg viewBox="0 0 80 150" class="empapado-figura" aria-hidden="true">
      <defs>
        <clipPath id="silueta-aficionado">
          <circle cx="40" cy="20" r="13"/>
          <path d="M22 42c0-7 6-11 18-11s18 4 18 11l5 40-9 2-3-28-1 32H31l-1-32-3 28-9-2z"/>
          <path d="M30 88h20l2 52H43l-3-40-3 40h-9z"/>
        </clipPath>
        <clipPath id="agua-aficionado"><rect x="0" y="0" width="80" height="0" data-nivel-agua/></clipPath>
        <pattern id="franjas-aficionado" width="8" height="10" patternUnits="userSpaceOnUse">
          <rect width="4" height="10" fill="#962a36"/><rect x="4" width="4" height="10" fill="#282348"/>
        </pattern>
      </defs>
      <g class="aficionado">
        <path d="M30 88h20l2 52H43l-3-40-3 40h-9z" fill="#3b5378"/>
        <rect x="27" y="137" width="11" height="6" rx="2" fill="#1d1a2e"/>
        <rect x="42" y="137" width="11" height="6" rx="2" fill="#1d1a2e"/>
        <path d="M22 42c0-7 6-11 18-11s18 4 18 11l5 40-9 2-3-28-1 32H31l-1-32-3 28-9-2z" fill="url(#franjas-aficionado)"/>
        <path d="M30 33c3 4 7 5 10 5s7-1 10-5l2 4c-3 5-8 7-12 7s-9-2-12-7z" fill="#c9a35b"/>
        <path d="M45 40l4 22-5 1-3-21z" fill="#c9a35b"/>
        <circle cx="40" cy="20" r="13" fill="#e8c4a0"/>
        <path class="pelo" d="M27 19c0-9 6-13 13-13s13 4 13 13c-3-4-7-6-13-6s-10 2-13 6z" fill="#3a2a20"/>
        <circle cx="35.5" cy="21" r="1.3" fill="#1d1a2e"/><circle cx="44.5" cy="21" r="1.3" fill="#1d1a2e"/>
        <path class="boca" d="M36 27c2.5 2 5.5 2 8 0" stroke="#1d1a2e" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      </g>
      <g clip-path="url(#agua-aficionado)">
        <rect width="80" height="150" fill="rgba(35, 96, 159, 0.55)" clip-path="url(#silueta-aficionado)"/>
        <g class="chorretones" fill="rgba(190, 215, 245, 0.85)">
          <path d="M28 46c1 3 1 6 0 9-1-3-1-6 0-9z"/><path d="M52 50c1 3 1 6 0 9-1-3-1-6 0-9z"/>
          <path d="M40 60c1 3 1 6 0 9-1-3-1-6 0-9z"/><path d="M34 98c1 3 1 6 0 9-1-3-1-6 0-9z"/>
          <path d="M47 106c1 3 1 6 0 9-1-3-1-6 0-9z"/><path d="M31 12c1 2 1 4 0 6-1-2-1-4 0-6z"/>
        </g>
      </g>
      <g class="goteo" fill="#7fb2e5">
        <path d="M22 84c1.5 2.5 1.5 4 0 5-1.5-1-1.5-2.5 0-5z"/>
        <path d="M58 84c1.5 2.5 1.5 4 0 5-1.5-1-1.5-2.5 0-5z"/>
        <path d="M33 143c1.5 2.5 1.5 4 0 5-1.5-1-1.5-2.5 0-5z"/>
      </g>
    </svg>`,r=[{hasta:.08,texto:"Seco"},{hasta:.35,texto:"Mojado"},{hasta:.7,texto:"Calado"},{hasta:1.01,texto:"Empapado"}];function h(i){i.insertAdjacentHTML("beforeend",`
      <div class="aviso-lluvia" data-aviso-lluvia role="status" aria-live="assertive">
        <svg class="aviso-lluvia-icono" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5c3.6 4.6 5.4 7.7 5.4 10.1a5.4 5.4 0 0 1-10.8 0c0-2.4 1.8-5.5 5.4-10.1z" fill="currentColor"/></svg>
        <div><strong data-aviso-titulo></strong><span data-aviso-texto></span></div>
      </div>
      <div class="empapado" data-empapado>
        ${c}
        <div class="empapado-datos">
          <small>As\xED acabas el partido</small>
          <strong data-empapado-texto>Seco</strong>
          <div class="empapado-barra"><span data-empapado-barra></span></div>
        </div>
      </div>`);const t=i.querySelector("[data-aviso-lluvia]"),p=t.querySelector("[data-aviso-titulo]"),n=t.querySelector("[data-aviso-texto]"),e=i.querySelector("[data-empapado]"),u=e.querySelector("[data-nivel-agua]"),v=e.querySelector("[data-empapado-texto]"),f=e.querySelector("[data-empapado-barra]");let s=null,l=!1;function g({teMojas:a,titular:o,explicacion:m}){clearTimeout(s),p.textContent=o,n.textContent=m,t.classList.toggle("es-peligro",a),t.classList.remove("es-visible"),t.offsetWidth,t.classList.add("es-visible"),e.classList.toggle("es-visible",a),a&&!l&&navigator.vibrate&&navigator.vibrate([90,60,90]),l=a,a||(s=setTimeout(()=>t.classList.remove("es-visible"),3200))}function x(){clearTimeout(s),t.classList.remove("es-visible"),e.classList.remove("es-visible"),l=!1}let d=-1;function b(a){Math.abs(a-d)<.005||(d=a,u.setAttribute("height",a*150),v.textContent=r.find(o=>a<o.hasta).texto,f.style.width=`${Math.round(a*100)}%`,e.style.setProperty("--goteo",a>.35?1:0))}return{avisar:g,ocultar:x,empapar:b}}window.AvisosLluvia={crear:h,AFICIONADO:c,NIVELES:r}})();

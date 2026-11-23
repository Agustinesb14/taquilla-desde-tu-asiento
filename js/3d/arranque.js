/*! © 2026 Agustín Escribano · necesitounaapp.es · Todos los derechos reservados. Prohibida su copia, reproducción o uso sin permiso por escrito. */
import{crearVista3D as e}from"./vista3d.js";const a=document.querySelector("[data-vista-3d]");if(a)try{const t=await e(a);window.dispatchEvent(new CustomEvent("vista3d",{detail:t}))}catch(t){console.warn("Vista 3D no disponible, se usa la 2D:",t)}

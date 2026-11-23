/*! © 2026 Agustín Escribano · necesitounaapp.es · Todos los derechos reservados. Prohibida su copia, reproducción o uso sin permiso por escrito. */
import*as a from"three";import{EffectComposer as $}from"three/addons/postprocessing/EffectComposer.js";import{RenderPass as k}from"three/addons/postprocessing/RenderPass.js";import{UnrealBloomPass as X}from"three/addons/postprocessing/UnrealBloomPass.js";import{OutputPass as Z}from"three/addons/postprocessing/OutputPass.js";import{ShaderPass as J}from"three/addons/postprocessing/ShaderPass.js";import{crearEstadio as K}from"./estadio3d.js";import{crearLluvia as L}from"./lluvia3d.js";a.Object3D.DEFAULT_UP.set(0,0,1);const y=window.Estadio,Q=`
  varying vec3 vDireccion;
  void main() {
    vDireccion = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,Y=`
  uniform vec3 uArriba;
  uniform vec3 uHorizonte;
  uniform vec3 uAbajo;
  uniform vec3 uSol;
  uniform float uBrilloSol;
  uniform float uNubes;
  uniform float uTiempo;
  uniform float uRelampago;
  varying vec3 vDireccion;
  float ruido(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
    float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
    float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
    float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * ruido(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  void main() {
    vec3 d = normalize(vDireccion);
    float h = d.z;
    vec3 color = h > 0.0 ? mix(uHorizonte, uArriba, pow(h, 0.55)) : mix(uHorizonte, uAbajo, min(1.0, -h * 6.0));
    float sol = max(dot(d, normalize(uSol)), 0.0);
    color += uBrilloSol * (pow(sol, 900.0) * vec3(1.0, 0.96, 0.85) * 6.0 + pow(sol, 12.0) * vec3(1.0, 0.75, 0.45) * 0.35);
    if (uNubes > 0.0 && h > -0.02) {
      vec2 p = d.xy / (h + 0.18) * 1.6 + vec2(uTiempo * 0.035, uTiempo * 0.012);
      float n = fbm(p);
      float capa = smoothstep(0.35, 0.75, n);
      vec3 nube = mix(uHorizonte * 0.55, uHorizonte * 1.25, fbm(p * 2.0 + 7.0));
      color = mix(color, nube, capa * uNubes);
      color += uRelampago * vec3(0.7, 0.75, 1.0) * (0.4 + capa);
    }
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;function q(){const p=new a.ShaderMaterial({vertexShader:Q,fragmentShader:Y,side:a.BackSide,depthWrite:!1,fog:!1,uniforms:{uArriba:{value:new a.Color},uHorizonte:{value:new a.Color},uAbajo:{value:new a.Color("#15141c")},uSol:{value:new a.Vector3(0,0,1)},uBrilloSol:{value:0},uNubes:{value:0},uTiempo:{value:0},uRelampago:{value:0}}}),x=new a.Mesh(new a.SphereGeometry(1500,48,24),p);return x.renderOrder=-1,x}function ee(p,x){const s=new a.Group;return s.scale.z=-1,s.add(x.paneles.paneles.clone()),x.torres.cabezales.forEach(c=>{const d=new a.Sprite(new a.SpriteMaterial({map:x.texturas.halo,color:"#fff0d0",transparent:!0,depthWrite:!1,blending:a.AdditiveBlending,opacity:.55}));d.position.copy(c),d.scale.set(5,30,1),s.add(d)}),s.visible=!1,p.add(s),s}const oe={uniforms:{tDiffuse:{value:null},uPaso:{value:new a.Vector2},uFuerza:{value:.45}},vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform vec2 uPaso;
    uniform float uFuerza;
    varying vec2 vUv;
    void main() {
      vec4 centro = texture2D(tDiffuse, vUv);
      vec3 vecinos = texture2D(tDiffuse, vUv + vec2(uPaso.x, 0.0)).rgb + texture2D(tDiffuse, vUv - vec2(uPaso.x, 0.0)).rgb
        + texture2D(tDiffuse, vUv + vec2(0.0, uPaso.y)).rgb + texture2D(tDiffuse, vUv - vec2(0.0, uPaso.y)).rgb;
      gl_FragColor = vec4(max(centro.rgb + (centro.rgb - vecinos * 0.25) * uFuerza, 0.0), centro.a);
    }`};function ae(p,x){const c=Math.min(p.pixeles,Math.max(1,window.devicePixelRatio||1));let d=c,r=0,v=[],M=0;function w(){const S=performance.now();if(r&&S-r<250&&v.push(S-r),r=S,v.length<20)return;const z=v.reduce((l,P)=>l+P,0)/v.length;v=[],M=z<13?M+1:0;let h=d;z>18.5?h=Math.max(.7,d*.85):M>=5&&(h=Math.min(c,d*1.1)),!(Math.abs(h-d)<.01)&&(d=h,M=0,x())}return{medir:w,actual:()=>d}}export function detectarCalidad(){const p=window.matchMedia("(pointer: coarse)").matches||window.innerWidth<900;return{movil:p,pixeles:p?Math.min(window.devicePixelRatio||1,2):2,sombras:p?2048:4096}}export async function crearVista3D(p,x={}){await document.fonts.ready;const s={...detectarCalidad(),...x.calidad},c=new a.WebGLRenderer({canvas:p,antialias:!s.movil,powerPreference:"high-performance",preserveDrawingBuffer:!!x.conservarImagen}),d=Math.min(s.pixeles,Math.max(1,window.devicePixelRatio||1));c.setPixelRatio(d),c.toneMapping=a.ACESFilmicToneMapping,c.toneMappingExposure=1.12,c.outputColorSpace=a.SRGBColorSpace,c.shadowMap.enabled=!0,c.shadowMap.type=a.PCFShadowMap,c.shadowMap.autoUpdate=!1;const r=new a.Scene;r.fog=new a.FogExp2("#9fb0c4",.002);const v=new a.PerspectiveCamera(54,16/9,.08,4e3),M=q();r.add(M);const w=await K(r,s),S=c.capabilities.getMaxAnisotropy();r.traverse(e=>[e.material].flat().forEach(o=>{["map","emissiveMap","alphaMap"].forEach(t=>{o?.[t]&&(o[t].anisotropy=S,o[t].needsUpdate=!0)})}));const z=ee(r,w),h=new a.HemisphereLight("#c9d8ef","#4a4436",.6),l=new a.DirectionalLight("#fff3df",3);l.castShadow=!0,l.shadow.mapSize.set(s.sombras,s.sombras),Object.assign(l.shadow.camera,{left:-110,right:110,top:110,bottom:-110,near:10,far:600}),l.shadow.bias=-4e-4,l.shadow.normalBias=.04,r.add(h,l,l.target);const P=L(r,w,s);function C(e,o){const t=new $(c,new a.WebGLRenderTarget(1,1,{type:a.HalfFloatType,samples:e}));t.addPass(new k(r,v));const n=new X(new a.Vector2(256,256),.5,.6,.9);t.addPass(n),t.addPass(new Z);const b=o?new J(oe):null;return b&&t.addPass(b),{composer:t,resplandor:n,nitidez:b}}const E=C(4,!0),R=s.fija?E:C(0,!1),j=[...new Set([E,R])];let D=E;const B=ae(s,()=>A()),H=e=>e===E?s.pixeles:B.actual(),m={clave:"",claveSombras:"",lluvia:!1,moviendo:!1,nitido:null};function A(){const{clientWidth:e,clientHeight:o}=p;!e||!o||(j.forEach(t=>{const n=H(t);t.composer.setPixelRatio(n),t.composer.setSize(e,o),t.nitidez?.uniforms.uPaso.value.set(1/(e*d),1/(o*d))}),c.setSize(e,o,!1),v.aspect=e/o,v.updateProjectionMatrix())}function I({grada:e,bloque:o,fila:t,giro:n=0}){const b=(y.limitesBloque(e,o).desde+y.limitesBloque(e,o).hasta)/2,i=y.aMundo(e,b,y.profundidadFila(e,t)-.3,y.alturaFila(e,t)+1.15),f=e.normal[0]===0?[i[0]*.6,i[1]*.3,0]:[i[0]*.3,i[1]*.6,0],g=f[0]-i[0],u=f[1]-i[1];return v.position.set(...i),v.lookAt(i[0]+g*Math.cos(n)-u*Math.sin(n),i[1]+g*Math.sin(n)+u*Math.cos(n),0),v.position}function N(e,o){const t=e.elevacion,n=t<=-.05,b=!n&&t<.22,i=M.material.uniforms,f=o||n||b;if(l.position.set(...e.direccion.map(u=>u*300)),i.uSol.value.set(...e.direccion),o)i.uArriba.value.set(n?"#05060a":"#2c323e"),i.uHorizonte.value.set(n?"#151821":"#6f7886"),i.uBrilloSol.value=0,i.uNubes.value=1,l.intensity=0,l.castShadow=!1,h.intensity=n?.12:.55,h.color.set("#a9b6c8"),r.fog.color.set(n?"#1a1e27":"#6d7684"),r.fog.density=.0042;else if(n)i.uArriba.value.set("#04050c"),i.uHorizonte.value.set("#1a1b33"),i.uBrilloSol.value=0,i.uNubes.value=0,l.intensity=0,l.castShadow=!1,h.intensity=.1,r.fog.color.set("#151627"),r.fog.density=.0018;else{const u=b?1-t/.22:0;i.uArriba.value.set("#1f62d0").lerp(new a.Color("#2b3b70"),u),i.uHorizonte.value.set("#a9cdf0").lerp(new a.Color("#f1a46a"),u),i.uBrilloSol.value=1,i.uNubes.value=.32,l.intensity=4.6*Math.min(1,t/.12),l.castShadow=!0,l.color.set("#fff3df").lerp(new a.Color("#ffb070"),u),h.intensity=.55+(1-u)*.2,h.color.set("#c9d8ef"),r.fog.color.copy(i.uHorizonte.value),r.fog.density=.0011}w.torres.focos.forEach(u=>{u.intensity=f?o?1.7:2.4:0}),w.torres.lamparas.emissiveIntensity=f?3.2:.05,w.focosCubierta.material.emissiveIntensity=f?4:0,w.torres.halo.opacity=f?.9:0,j.forEach(u=>{u.resplandor.strength=f?.75:.12});const g=w.mat.cesped;g.roughness=o?.55:.92,g.color.set(o?"#7d8f84":"#ffffff"),g.opacity=o?.88:1,g.transparent!==o&&(g.transparent=o,g.needsUpdate=!0),w.mat.hormigon.roughness=o?.35:.9,w.mat.hormigon.color.set(o?"#8c8a95":"#b3b0ba"),z.visible=o}function _({grada:e,bloque:o,fila:t,giro:n,sol:b,clima:i}){const f=i==="lluvia",g=I({grada:e,bloque:o,fila:t,giro:n}),u=`${e.id}-${o}-${t}-${f}`;u!==m.clave&&(w.gradas.colocar(g,f),m.clave=u),N(b,f);const U=`${u}-${b.direccion.map(W=>W.toFixed(4))}`;U!==m.claveSombras&&(m.claveSombras=U,c.shadowMap.needsUpdate=!0),m.lluvia=f;const G=y.posicionAsiento(e,o,t),F=f&&y.asientoSeMoja(e,G);return P.configurar({activa:f,grada:e,camara:g,expuesto:F,noche:b.elevacion<=-.05}),{expuesto:F}}function T(e){D=e?R:E,e&&!s.fija&&B.medir()}function O(e){m.moviendo=e,clearTimeout(m.nitido),!(e||m.lluvia)&&(m.nitido=setTimeout(()=>{m.moviendo||m.lluvia||(T(!1),D.composer.render())},120))}function V(e){if(T(m.lluvia||m.moviendo),m.lluvia){const o=P.animar(e,v);M.material.uniforms.uTiempo.value=e,M.material.uniforms.uRelampago.value=o,h.intensity+=o*2.5,D.composer.render(),h.intensity-=o*2.5;return}D.composer.render()}return A(),{actualizar:_,pintar:V,moviendo:O,redimensionar:A,lienzo:p,escena:r,renderer:c,programarRayos:P.programarRayos}}

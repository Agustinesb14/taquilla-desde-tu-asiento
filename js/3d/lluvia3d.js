/*! © 2026 Agustín Escribano · necesitounaapp.es · Todos los derechos reservados. Prohibida su copia, reproducción o uso sin permiso por escrito. */
import*as a from"three";import{texturaNiebla as I}from"./texturas.js";const A=window.Estadio,D=Math.tan(25*Math.PI/180),C=`
  uniform float uTiempo;
  uniform vec3 uFocos[4];
  uniform float uLuzFocos;
  uniform float uAmbiente;
  uniform vec3 uCamara;
  float azar(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  /* Cu\xE1nta luz recibe una gota: focos cercanos y, sobre todo, focos que quedan detr\xE1s. */
  float iluminacion(vec3 p) {
    float luz = uAmbiente;
    vec3 haciaGota = normalize(p - uCamara);
    for (int i = 0; i < 4; i++) {
      vec3 aFoco = uFocos[i] - p;
      float d2 = dot(aFoco, aFoco);
      float contraluz = pow(max(dot(haciaGota, normalize(aFoco)), 0.0), 6.0);
      luz += uLuzFocos * (1.0 + contraluz * 4.0) / (1.0 + d2 / 1400.0);
    }
    return luz;
  }`,_=`
  ${C}
  attribute vec2 aEsquina;
  attribute vec4 aSemilla;
  uniform vec3 uCentro;
  uniform vec3 uTamano;
  uniform vec2 uViento;
  uniform float uVelocidad;
  uniform float uLargo;
  uniform float uAncho;
  uniform vec4 uTechos[2];
  uniform vec4 uTechoMedidas[2];
  varying vec2 vUv;
  varying float vBrillo;
  varying float vVisible;

  /* Se sigue la trayectoria de la gota hacia arriba y se mira si cruza la cubierta,
     que sube hacia el campo: altura = alturaFondo + pendiente * (fondo - d). */
  bool bajoTecho(vec3 p) {
    for (int i = 0; i < 2; i++) {
      vec4 t = uTechos[i];
      vec4 c = uTechoMedidas[i];
      float pendiente = (c.z - c.w) / (c.y - c.x);
      float d0 = t.x * p.x + t.y * p.y - t.z;
      float a0 = -t.y * p.x + t.x * p.y;
      float avanceD = -(t.x * uViento.x + t.y * uViento.y);
      float avanceA = -(-t.y * uViento.x + t.x * uViento.y);
      float subida = (c.w + pendiente * (c.y - d0) - p.z) / (1.0 + pendiente * avanceD);
      if (subida <= 0.0) continue;
      float d = d0 + avanceD * subida;
      float a = a0 + avanceA * subida;
      if (d > c.x && d < c.y && abs(a) < t.w) return true;
    }
    return false;
  }

  void main() {
    float velocidad = uVelocidad * (0.85 + aSemilla.w * 0.3);
    float altura = mod(aSemilla.z * uTamano.z - uTiempo * velocidad, uTamano.z);
    vec3 p;
    p.z = uCentro.z - uTamano.z * 0.5 + altura;
    vec2 plano = aSemilla.xy * uTamano.xy - uViento * altura;
    p.xy = uCentro.xy + mod(plano - uCentro.xy, uTamano.xy) - uTamano.xy * 0.5;

    vec3 cola = p + normalize(vec3(-uViento, 1.0)) * uLargo * (0.7 + aSemilla.w * 0.6);
    vec4 cabezaVista = modelViewMatrix * vec4(p, 1.0);
    vec4 colaVista = modelViewMatrix * vec4(cola, 1.0);
    vec2 sentido = colaVista.xy - cabezaVista.xy;
    sentido = length(sentido) < 1e-5 ? vec2(0.0, 1.0) : normalize(sentido);
    vec2 lado = vec2(-sentido.y, sentido.x);
    vec4 vista = mix(cabezaVista, colaVista, aEsquina.y);
    float distancia = -cabezaVista.z;
    vista.xy += lado * aEsquina.x * uAncho * (1.0 + distancia * 0.015);
    gl_Position = projectionMatrix * vista;

    vUv = aEsquina;
    vBrillo = iluminacion(p);
    vVisible = bajoTecho(p) || p.z < -0.05 ? 0.0 : smoothstep(0.25, 1.2, distancia) * exp(-distancia * 0.011);
  }`,N=`
  uniform float uOpacidad;
  varying vec2 vUv;
  varying float vBrillo;
  varying float vVisible;
  void main() {
    if (vVisible <= 0.001) discard;
    float a = (1.0 - abs(vUv.x)) * (1.0 - vUv.y * 0.85) * uOpacidad * vVisible * min(vBrillo, 3.0);
    vec3 color = mix(vec3(0.62, 0.7, 0.82), vec3(1.0, 0.97, 0.9), clamp(vBrillo - 0.4, 0.0, 1.0));
    gl_FragColor = vec4(color, a);
  }`,j=`
  ${C}
  attribute vec2 aEsquina;
  attribute vec4 aSemilla;
  uniform vec4 uZona;
  uniform float uPeriodo;
  uniform float uTamanoGota;
  uniform vec4 uGrada;
  uniform vec2 uPerfil;
  uniform float uSobreGrada;
  varying vec2 vUv;
  varying float vFase;
  varying float vBrillo;
  void main() {
    float t = uTiempo / uPeriodo + aSemilla.w;
    float ciclo = floor(t);
    vFase = fract(t);
    vec2 r = vec2(azar(aSemilla.xy + ciclo), azar(aSemilla.yx * 1.7 + ciclo));
    vec3 p = vec3(uZona.xy + r * uZona.zw, 0.03);
    if (uSobreGrada > 0.5) {
      float d = uGrada.x * p.x + uGrada.y * p.y - uGrada.z;
      p.z = 1.2 + max(d, 0.0) / uPerfil.x * uPerfil.y + 0.45;
    }
    vec4 vista = modelViewMatrix * vec4(p, 1.0);
    vista.xy += aEsquina * uTamanoGota * vec2(1.0, 0.7);
    gl_Position = projectionMatrix * vista;
    vUv = aEsquina;
    vBrillo = iluminacion(p);
  }`,Z=`
  uniform float uOpacidad;
  varying vec2 vUv;
  varying float vFase;
  varying float vBrillo;
  void main() {
    if (vFase > 0.45) discard;
    float f = vFase / 0.45;
    vec2 uv = vUv;
    float anillo = smoothstep(0.09, 0.0, abs(length(uv * vec2(1.0, 2.6) + vec2(0.0, 0.9)) - f * 0.75));
    float corona = 0.0;
    for (int i = 0; i < 6; i++) {
      float x = (float(i) - 2.5) * 0.2 * (0.4 + f);
      float y = -0.75 + (2.4 * f - 2.6 * f * f) * 1.1 - abs(x) * 0.5;
      corona += smoothstep(0.07, 0.0, length(uv - vec2(x, y)));
    }
    float a = (anillo * 0.7 + corona) * (1.0 - f) * uOpacidad * min(vBrillo, 2.5);
    gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), a);
  }`,H=`
  ${C}
  attribute vec2 aEsquina;
  attribute vec4 aSemilla;
  uniform float uLargo;
  uniform float uAncho;
  varying vec2 vUv;
  varying float vBrillo;
  void main() {
    float recorrido = aSemilla.z - aSemilla.w;
    float bajada = mod(uTiempo * 9.0 + aSemilla.x * 3.7 + aSemilla.y * 1.3, recorrido + uLargo);
    vec3 p = vec3(aSemilla.xy, aSemilla.z - bajada);
    vec4 cabeza = modelViewMatrix * vec4(p, 1.0);
    vec4 cola = modelViewMatrix * vec4(p + vec3(0.0, 0.0, uLargo), 1.0);
    vec2 sentido = normalize(cola.xy - cabeza.xy + vec2(0.0, 1e-5));
    vec4 vista = mix(cabeza, cola, aEsquina.y);
    vista.xy += vec2(-sentido.y, sentido.x) * aEsquina.x * uAncho;
    gl_Position = projectionMatrix * vista;
    vUv = aEsquina;
    vBrillo = p.z < aSemilla.w ? 0.0 : iluminacion(p);
  }`,W=`
  uniform float uOpacidad;
  varying vec2 vUv;
  varying float vBrillo;
  void main() {
    if (vBrillo <= 0.0) discard;
    float a = (1.0 - abs(vUv.x)) * uOpacidad * min(vBrillo, 2.5);
    gl_FragColor = vec4(vec3(0.8, 0.86, 0.95), a);
  }`;function S(i){return{uTiempo:{value:0},uFocos:{value:i},uLuzFocos:{value:1},uAmbiente:{value:.3},uCamara:{value:new a.Vector3},uOpacidad:{value:1}}}function E(i,t){const e=new a.InstancedBufferGeometry;return e.setAttribute("position",new a.Float32BufferAttribute([-1,0,0,1,0,0,1,1,0,-1,1,0],3)),e.setAttribute("aEsquina",new a.Float32BufferAttribute([-1,0,1,0,1,1,-1,1],2)),e.setIndex([0,1,2,0,2,3]),e.setAttribute("aSemilla",new a.InstancedBufferAttribute(t,4)),e.instanceCount=i,e}function R(i){const t=new Float32Array(i*4);for(let e=0;e<t.length;e++)t[e]=Math.random();return t}function F(i,t,e){return new a.ShaderMaterial({vertexShader:i,fragmentShader:t,uniforms:e,transparent:!0,depthWrite:!1,blending:a.AdditiveBlending,side:a.DoubleSide})}function O(i,t,{cantidad:e,tamano:r,centro:l,velocidad:d,largo:s,ancho:v,opacidad:y}){const m={...S(i),uCentro:{value:l},uTamano:{value:r},uViento:{value:new a.Vector2},uVelocidad:{value:d},uLargo:{value:s},uAncho:{value:v},uTechos:{value:t.posicion},uTechoMedidas:{value:t.medidas}};m.uOpacidad.value=y;const u=new a.Mesh(E(e,R(e)),F(_,N,m));return u.frustumCulled=!1,u}function L(i,{cantidad:t,zona:e,tamano:r,opacidad:l,sobreGrada:d=!1}){const s={...S(i),uZona:{value:e},uPeriodo:{value:.55},uTamanoGota:{value:r},uGrada:{value:new a.Vector4},uPerfil:{value:new a.Vector2(.8,.4)},uSobreGrada:{value:d?1:0}};s.uOpacidad.value=l;const v=new a.Mesh(E(t,R(t)),F(j,Z,s));return v.frustumCulled=!1,v}function $(i){const t=[];A.GRADAS.filter(l=>l.cubierta).forEach(l=>{const d=l.mitadLargo+2,{frente:s,alturaFrente:v}=l.cubierta,y=A.alturaFila(l,Math.max(1,Math.ceil(s/l.paso)))+.1;for(let m=-d;m<=d;m+=.45)for(let u=0;u<3;u++){const x=A.aMundo(l,m+(Math.random()-.5)*.3,s-.1,v-1);t.push(x[0],x[1],x[2],y)}});const e={...S(i),uLargo:{value:.9},uAncho:{value:.018}};e.uOpacidad.value=.55;const r=new a.Mesh(E(t.length/4,new Float32Array(t)),F(H,W,e));return r.frustumCulled=!1,r}function k(){const i=I(),t=new a.Group;for(let e=0;e<7;e++){const r=new a.Sprite(new a.SpriteMaterial({map:i,color:"#c4ccd8",transparent:!0,depthWrite:!1,opacity:.35}));r.scale.set(90+Math.random()*60,26+Math.random()*14,1),r.userData={x:(Math.random()-.5)*220,y:(Math.random()-.5)*150,velocidad:3+Math.random()*4},t.add(r)}return t}function J(){const i=[];let t=0;for(let l=260;l>30;l-=14)i.push(new a.Vector3(t,0,l)),t+=(Math.random()-.5)*26;const e=new a.CatmullRomCurve3(i,!1,"catmullrom",.1),r=new a.Mesh(new a.TubeGeometry(e,80,1.1,5),new a.MeshBasicMaterial({color:"#f2f4ff",transparent:!0,opacity:0,fog:!1,blending:a.AdditiveBlending,depthWrite:!1}));return r.visible=!1,r}export function crearLluvia(i,t,e){const r=t.torres.cabezales.map(o=>o.clone()),l=A.GRADAS.filter(o=>o.cubierta),d={posicion:l.map(o=>new a.Vector4(o.normal[0],o.normal[1],o.base,o.mitadLargo+2)),medidas:l.map(({cubierta:o})=>new a.Vector4(o.frente,o.fondo+.3,o.alturaFrente,o.alturaFondo))},s=e.movil,v=O(r,d,{cantidad:s?7e3:15e3,tamano:new a.Vector3(26,26,16),centro:new a.Vector3,velocidad:9,largo:.7,ancho:.008,opacidad:.38}),y=O(r,d,{cantidad:s?22e3:4e4,tamano:new a.Vector3(300,240,60),centro:new a.Vector3(0,0,30),velocidad:9,largo:1.7,ancho:.016,opacidad:.2}),m=L(r,{cantidad:s?3500:8e3,zona:new a.Vector4(-60,-43,120,86),tamano:.32,opacidad:.45}),u=L(r,{cantidad:700,zona:new a.Vector4,tamano:.07,opacidad:.9,sobreGrada:!0}),x=$(r),G=k(),h=J(),V=new a.Group;V.add(y,v,m,u,x,G,h),V.visible=!1,i.add(V);const B=[v,y,m,u,x],f={en:5,inicio:-10,programados:null,ultimoTiempo:0};function P({activa:o,grada:c,camara:b,expuesto:T,noche:p}){if(V.visible=o,!o)return;const w=new a.Vector2(c.normal[0],c.normal[1]).multiplyScalar(D);[v,y].forEach(g=>g.material.uniforms.uViento.value.copy(w)),v.material.uniforms.uCentro.value.set(b.x,b.y,b.z+2),B.forEach(g=>{g.material.uniforms.uLuzFocos.value=p?1.25:.9,g.material.uniforms.uAmbiente.value=p?.18:.38}),u.visible=T,u.material.uniforms.uGrada.value.set(c.normal[0],c.normal[1],c.base,0),u.material.uniforms.uPerfil.value.set(c.paso,c.subida);const n=new a.Vector2(-c.normal[0],-c.normal[1]),z=new a.Vector2(b.x,b.y).addScaledVector(n,3.2),M=new a.Vector2(Math.abs(n.x)>.5?5:9,Math.abs(n.y)>.5?5:9);u.material.uniforms.uZona.value.set(z.x-M.x/2,z.y-M.y/2,M.x,M.y)}function U(o,c){B.forEach(n=>{n.material.uniforms.uTiempo.value=o,n.material.uniforms.uCamara.value.copy(c.position)}),G.children.forEach(n=>{const z=(n.userData.x+o*n.userData.velocidad+150)%300-150;n.position.set(z,n.userData.y,10),n.material.opacity=.22+Math.sin(o*.3+n.userData.y)*.08});const b=f.programados?.some(n=>f.ultimoTiempo<n&&n<=o),T=!f.programados&&o>f.en;if(f.ultimoTiempo=o,b||T){f.inicio=o,f.en=o+7+Math.random()*9;const n=Math.atan2(c.position.y,c.position.x)+Math.PI+(Math.random()-.5)*1.2;h.position.set(Math.cos(n)*520,Math.sin(n)*520,0),h.rotation.set(0,0,n+Math.PI/2)}const p=o-f.inicio,w=p<0||p>.6?0:p<.07?1:p<.14?.2:p<.22?.85:Math.max(0,1-(p-.22)/.38)*.45;return h.visible=w>.3,h.material.opacity=w,w}function q(o){f.programados=o}return{configurar:P,animar:U,programarRayos:q}}

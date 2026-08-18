// Genera network.svg — grafo animado: cluster de datos (indigo) ←→ cluster de
// personas (emerald), unidos por un puente. SMIL puro: anima dentro de GitHub
// (que sanea CSS y JS) y no depende de ningún servicio externo.
//   node assets/network.mjs
import { writeFileSync } from 'node:fs';

const IND = '#6366f1', EME = '#10b981';

const N = {
  d1:[ 60,120,5],   d2:[118, 64,4],   d3:[128,176,4],  d4:[196,112,6.5],
  d5:[246, 52,3.5], d6:[252,178,4],
  h1:[330,110,8],   h2:[432, 72,5],   h3:[440,152,5],
  p1:[540,110,6.5], p2:[606, 54,4],   p3:[614,168,4],  p4:[694,100,5],
  p5:[742,164,3.5], p6:[780, 58,4],   p7:[836,120,4.5],
};

const E = [
  ['d1','d2',IND],['d1','d3',IND],['d1','d4',IND],['d2','d4',IND],['d3','d4',IND],
  ['d4','d5',IND],['d4','d6',IND],['d2','d5',IND],['d3','d6',IND],
  ['d4','h1','G'],['d5','h1','G'],['d6','h1','G'],
  ['h1','h2','G'],['h1','h3','G'],['h2','p1','G'],['h3','p1','G'],['h2','h3','G'],
  ['p1','p2',EME],['p1','p3',EME],['p1','p4',EME],['p2','p4',EME],['p3','p4',EME],
  ['p4','p6',EME],['p4','p5',EME],['p5','p7',EME],['p6','p7',EME],['p4','p7',EME],
];

// El pulso cruza el grafo entero: dato → puente → persona.
const ROUTE = ['d1','d4','h1','h2','p1','p4','p7'];
const routeD = ROUTE.map((k,i)=>`${i?'L':'M'}${N[k][0]} ${N[k][1]}`).join(' ');
const LOOP = 7.8;

const col = (c) => c === 'G' ? 'url(#bridge)' : c;
let s = '';

// ── Aristas: base tenue + chispa viajera (dasharray sobre pathLength=1) ─────
E.forEach(([a,b,c],i) => {
  const [x1,y1] = N[a], [x2,y2] = N[b];
  const dur = (3.4 + (i % 7) * 0.55).toFixed(2);
  const delay = ((i * 0.37) % 4).toFixed(2);
  s += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col(c)}" stroke-width="1" opacity=".22"/>\n`;
  s += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col(c)}" stroke-width="1.6"`
     + ` stroke-linecap="round" opacity=".85" pathLength="1" stroke-dasharray="0.14 0.86">\n`
     + `    <animate attributeName="stroke-dashoffset" values="1;0" dur="${dur}s"`
     + ` begin="${delay}s" repeatCount="indefinite"/>\n  </line>\n`;
});

// ── Nodos: halo que respira + núcleo ───────────────────────────────────────
Object.entries(N).forEach(([k,[x,y,r]],i) => {
  const c = k[0] === 'd' ? IND : k[0] === 'p' ? EME : 'url(#bridge)';
  const dur = (2.8 + (i % 5) * 0.6).toFixed(2);
  const delay = ((i * 0.31) % 3).toFixed(2);
  s += `  <circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".18">\n`
     + `    <animate attributeName="r" values="${r};${(r*2.1).toFixed(1)};${r}" dur="${dur}s"`
     + ` begin="${delay}s" repeatCount="indefinite"/>\n`
     + `    <animate attributeName="opacity" values=".22;0;.22" dur="${dur}s"`
     + ` begin="${delay}s" repeatCount="indefinite"/>\n  </circle>\n`
     + `  <circle cx="${x}" cy="${y}" r="${r}" fill="${c}" filter="url(#glow)"/>\n`;
});

// ── Pulso: vira de indigo a emerald al cruzar. Nada de blanco: sobre el tema
//    claro de GitHub un pulso blanco es invisible.
[0, 2.6, 5.2].forEach((begin) => {
  s += `  <circle r="4" fill="${IND}" filter="url(#glow)">\n`
     + `    <animateMotion dur="${LOOP}s" begin="${begin}s" repeatCount="indefinite" path="${routeD}"/>\n`
     + `    <animate attributeName="fill" values="${IND};#8b5cf6;${EME}" dur="${LOOP}s"`
     + ` begin="${begin}s" repeatCount="indefinite"/>\n`
     + `    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.08;.9;1"`
     + ` dur="${LOOP}s" begin="${begin}s" repeatCount="indefinite"/>\n  </circle>\n`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 220" width="880" height="220"
     role="img" aria-label="Animated graph: a cluster of data nodes connected through a bridge to a cluster of people nodes">
  <title>Human capital, connected through data</title>
  <defs>
    <linearGradient id="bridge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${IND}"/>
      <stop offset="100%" stop-color="${EME}"/>
    </linearGradient>
    <filter id="glow" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="2.4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
${s}  <g font-family="ui-sans-serif,-apple-system,Segoe UI,Helvetica,Arial,sans-serif"
     font-size="9" letter-spacing="2.6" fill="#8b8b95" opacity=".9">
    <text x="60" y="209">D A T A</text>
    <text x="292" y="209">B R I D G E</text>
    <text x="540" y="209">P E O P L E</text>
  </g>
</svg>
`;
writeFileSync(new URL('./network.svg', import.meta.url), svg);
console.log('network.svg ·', svg.length, 'bytes');

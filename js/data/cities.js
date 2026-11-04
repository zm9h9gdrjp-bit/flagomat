// Hand-drawn, simplified SVG flags for cities and regions.
// Coats of arms / seals are simplified to keep the files tiny — the colours and layout match the real flags.
(function () {
  const W = 300, H = 200;
  const svg = (body, w = W, h = H) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`;
  const rect = (x, y, w, h, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`;
  const hstripes = (cols, w = W, h = H) => cols.map((c, i) => rect(0, (h / cols.length) * i, w, h / cols.length + 0.5, c)).join('');
  const vstripes = (cols, w = W, h = H) => cols.map((c, i) => rect((w / cols.length) * i, 0, w / cols.length + 0.5, h, c)).join('');
  const star = (cx, cy, r, f, n = 5, inner = 0.382, rot = -90) => {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const rr = i % 2 ? r * inner : r;
      const a = ((rot + (180 / n) * i) * Math.PI) / 180;
      pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="${f}"/>`;
  };
  const fleur = (x, y, s, f) =>
    `<g transform="translate(${x} ${y}) scale(${s / 100})" fill="${f}">
      <path d="M50 5C60 20 62 40 55 60H45C38 40 40 20 50 5Z"/>
      <path d="M44 58C30 60 15 50 15 35C15 25 25 20 30 28C22 30 22 42 32 46C38 48 42 50 44 58Z"/>
      <path d="M56 58C70 60 85 50 85 35C85 25 75 20 70 28C78 30 78 42 68 46C62 48 58 50 56 58Z"/>
      <rect x="32" y="58" width="36" height="8"/>
      <path d="M44 66C40 80 32 85 28 92H40C46 86 48 78 50 72C52 78 54 86 60 92H72C68 85 60 80 56 66Z"/></g>`;
  const saltire = (cx, cy, s, c, w) =>
    `<path d="M${cx - s} ${cy - s}L${cx + s} ${cy + s}M${cx + s} ${cy - s}L${cx - s} ${cy + s}" stroke="${c}" stroke-width="${w}"/>`;
  const cross = (c, bg, t = 40) => rect(0, 0, W, H, bg) + rect((W - t) / 2, 0, t, H, c) + rect(0, (H - t) / 2, W, t, c);
  const seal = (cx, cy, r, ring, fill) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${ring}" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="none" stroke="${ring}" stroke-width="3"/>`;
  const catalan = (x, y, w, h, vertical) => {
    let s = rect(x, y, w, h, '#FCDD09');
    for (let i = 0; i < 4; i++) {
      if (vertical) s += rect(x + (w / 9) * (2 * i + 1), y, w / 9, h, '#DA121A');
      else s += rect(x, y + (h / 9) * (2 * i + 1), w, h / 9, '#DA121A');
    }
    return s;
  };

  const C = []; // { id, name, country (iso2), kind: 'city'|'region', svg | img, fact }
  const add = (id, name, country, kind, svgStr, fact) => C.push({ id, name, country, kind, svg: svgStr, fact });
  const addImg = (id, name, country, kind, img, fact) => C.push({ id, name, country, kind, img, fact });

  // ───────────── Cities ─────────────
  add('amsterdam', 'Amsterdam', 'nl', 'city',
    svg(hstripes(['#EC1C24', '#000', '#EC1C24']) + [75, 150, 225].map((x) => saltire(x, 100, 18, '#fff', 9)).join('')),
    'The three X-crosses are St Andrew’s crosses — locals jokingly say they protect against flood, fire and plague. You’ll see them on every bollard (“Amsterdammertje”) in town.');
  add('dc', 'Washington, D.C.', 'us', 'city',
    svg(rect(0, 0, 300, 150, '#fff') + [90, 150, 210].map((x) => star(x, 38, 20, '#E91436')).join('') + rect(0, 70, 300, 25, '#E91436') + rect(0, 112, 300, 25, '#E91436'), 300, 150),
    'Based on George Washington’s family coat of arms. D.C. license plates used it to protest “Taxation without representation”.');
  add('chicago', 'Chicago', 'us', 'city',
    svg(rect(0, 0, W, H, '#fff') + rect(0, 50, W, 28, '#B3DDF2') + rect(0, 122, W, 28, '#B3DDF2') + [60, 120, 180, 240].map((x) => star(x, 100, 18, '#FF0000', 6, 0.5)).join('')),
    'Each six-pointed star marks a historic event — e.g. the Great Chicago Fire of 1871. Chicagoans tattoo it more than any other city flag.');
  add('paris', 'Paris', 'fr', 'city', svg(vstripes(['#0B2D72', '#D7141A'], W, H)),
    'Blue and red are the traditional colours of Paris. Add the royal white in the middle and you get… the French tricolour.');
  add('marseille', 'Marseille', 'fr', 'city', svg(cross('#1E4B9A', '#fff', 36)),
    'A blue cross on white — Marseille’s colours since the Middle Ages. Marseille is France’s oldest city, founded by Greek sailors around 600 BC.');
  add('barcelona', 'Barcelona', 'es', 'city',
    svg(rect(0, 0, 150, 100, '#fff') + rect(60, 0, 30, 100, '#DA121A') + rect(0, 35, 150, 30, '#DA121A') + catalan(150, 0, 150, 100, true) + catalan(0, 100, 150, 100, true) + rect(150, 100, 150, 100, '#fff') + rect(210, 100, 30, 100, '#DA121A') + rect(150, 135, 150, 30, '#DA121A')),
    'Two St George’s crosses (Sant Jordi is Catalonia’s patron saint) plus two copies of the Catalan stripes.');
  add('rome', 'Rome', 'it', 'city',
    svg(vstripes(['#8E1B2E', '#F0B323']) + '<text x="150" y="118" font-family="Georgia,serif" font-size="46" font-weight="700" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="1">SPQR</text>'),
    'SPQR = “Senatus Populusque Romanus” (the Senate and People of Rome). It’s still printed on Rome’s manhole covers.');
  add('vienna', 'Vienna', 'at', 'city', svg(hstripes(['#ED2939', '#fff'])),
    'Simple red over white. Austria’s red-white-red legend says it came from a duke’s blood-soaked tunic with a clean strip under his belt.');
  add('warsaw', 'Warsaw', 'pl', 'city', svg(hstripes(['#FFD200', '#DC143C'])),
    'Yellow and red — taken from Warsaw’s coat of arms, which shows a mermaid with a sword (the Syrenka).');
  add('krakow', 'Kraków', 'pl', 'city', svg(hstripes(['#fff', '#1C64B4'])),
    'White over blue. Kraków was Poland’s royal capital for ~500 years.');
  add('munich', 'Munich', 'de', 'city', svg(hstripes(['#000', '#FFC72C'])),
    'Black and gold — colours of the Holy Roman Empire. The city’s mascot is the “Münchner Kindl”, a little monk.');
  add('hamburg', 'Hamburg', 'de', 'city',
    svg(rect(0, 0, W, H, '#E1001A') + '<g fill="#fff">' + rect(95, 95, 110, 60, '#fff') + rect(95, 70, 30, 30, '#fff') + rect(175, 70, 30, 30, '#fff') + rect(135, 55, 30, 45, '#fff') +
      '<polygon points="95,70 110,52 125,70"/><polygon points="175,70 190,52 205,70"/><polygon points="135,55 150,35 165,55"/></g>' +
      '<path d="M138 155v-25a12 12 0 0 1 24 0v25Z" fill="#E1001A"/>'),
    'A white castle on red: Hamburg’s “Hammaburg”. The city is still officially the “Free and Hanseatic City of Hamburg”.');
  add('berlin', 'Berlin', 'de', 'city',
    svg(rect(0, 0, W, H, '#fff') + rect(0, 0, W, 40, '#E2001A') + rect(0, 160, W, 40, '#E2001A') +
      '<g fill="#000"><ellipse cx="150" cy="105" rx="30" ry="38"/><circle cx="128" cy="66" r="16"/><circle cx="120" cy="52" r="6"/><circle cx="136" cy="51" r="6"/>' +
      '<path d="M112 70l-14 6 14 4z"/><path d="M128 90l-28-18 6-8 30 16z"/><path d="M162 85l20-26 9 5-22 30z"/>' +
      '<path d="M135 135l-10 20h14l10-18z"/><path d="M165 135l12 20h-14l-10-18z"/><path d="M178 110l14 6-4 8-14-6z"/></g>'),
    'The Berlin Bear has been the city’s symbol since the 13th century — probably a pun on the name “Ber-lin”.');
  add('zurich', 'Zurich', 'ch', 'city',
    svg('<polygon points="0,0 200,200 0,200" fill="#0065BD"/><polygon points="0,0 200,0 200,200" fill="#fff"/>', 200, 200),
    'Square, like Switzerland’s own flag — only Switzerland and Vatican City have square national flags.');
  add('rotterdam', 'Rotterdam', 'nl', 'city', svg(hstripes(['#00843D', '#fff', '#00843D'])),
    'Green-white-green. Rotterdam has Europe’s largest port — and a lot of cube houses.');
  add('thehague', 'The Hague', 'nl', 'city', svg(hstripes(['#FFD800', '#009A3D'])),
    'Yellow over green. The Hague is the seat of the Dutch government, though Amsterdam is the capital. Make it make sense.');
  add('budapest', 'Budapest', 'hu', 'city', svg(hstripes(['#C8102E', '#FFD100', '#0055A4'])),
    'Red, yellow, blue. Budapest was born in 1873 when Buda, Óbuda and Pest merged into one city.');
  add('lisbon', 'Lisbon', 'pt', 'city',
    svg(rect(0, 0, W, H, '#fff') + '<g fill="#000"><polygon points="150,100 0,0 150,0"/><polygon points="150,100 300,0 300,100"/><polygon points="150,100 300,200 150,200"/><polygon points="150,100 0,200 0,100"/></g>'),
    'Black and white segments (“gironado”) — like the famous black-and-white calçada pavement all over Lisbon.');
  add('london', 'City of London', 'gb', 'city',
    svg(cross('#D4213D', '#fff', 36) + '<g fill="#D4213D"><rect x="62" y="12" width="8" height="58"/><rect x="50" y="62" width="32" height="7"/></g>'),
    'St George’s cross with a red sword — the sword of St Paul, patron of the City of London (the tiny financial “Square Mile”).');
  add('nyc', 'New York City', 'us', 'city', svg(vstripes(['#0F2B78', '#fff', '#FF6A13']) + seal(150, 100, 35, '#0F2B78', '#fff')),
    'Blue, white and orange — the colours of the Dutch flag back when NYC was “New Amsterdam” (1625–1664).');
  add('la', 'Los Angeles', 'us', 'city',
    svg(rect(0, 0, W, H, '#F6C93A') + '<polygon points="0,0 100,0 85,25 100,50 85,75 100,100 85,125 100,150 85,175 100,200 0,200" fill="#0B7B3E"/>' +
      '<polygon points="300,0 200,0 215,25 200,50 215,75 200,100 215,125 200,150 215,175 200,200 300,200" fill="#E35A22"/>' + seal(150, 100, 32, '#7A5A12', '#F6C93A')),
    'Green for olive trees, gold for orange groves, red-orange for vineyards. The zigzag edges look like an old-school Californian mural.');
  add('philly', 'Philadelphia', 'us', 'city', svg(vstripes(['#6CACE4', '#F2C75C', '#6CACE4']) + seal(150, 100, 32, '#1B3A6B', '#F2C75C')),
    'Azure and gold come from the flag of Sweden — the first Europeans in the area were from New Sweden. Go Birds!');
  add('tokyo', 'Tokyo', 'jp', 'city',
    svg(rect(0, 0, W, H, '#5A2B81') + '<g fill="#fff">' + [0, 60, 120, 180, 240, 300].map((a) => `<polygon points="150,48 140,90 160,90" transform="rotate(${a} 150 100)"/>`).join('') + '<circle cx="150" cy="100" r="16" fill="#5A2B81"/><circle cx="150" cy="100" r="11"/></g>'),
    'Edo purple with a white sun of six rays. Tokyo was called Edo until 1868.');
  add('dubai', 'Dubai', 'ae', 'city', svg(rect(0, 0, W, H, '#C8102E') + rect(0, 0, 75, H, '#fff')),
    'Red with a white band at the hoist — shared by the Emirate of Dubai. Habibi, come to Dubai.');
  add('abudhabi', 'Abu Dhabi', 'ae', 'city', svg(rect(0, 0, W, H, '#C8102E') + rect(0, 0, 100, 70, '#fff')),
    'Red with a white canton. Abu Dhabi is the capital of the UAE — not Dubai, contrary to popular belief.');
  add('rio', 'Rio de Janeiro', 'br', 'city', svg(rect(0, 0, W, H, '#fff') + saltire(150, 100, 140, '#1B4FA0', 34) + seal(150, 100, 30, '#C9A227', '#fff')),
    'A blue saltire on white. Rio was Brazil’s capital until Brasília was built in 1960.');
  add('florence', 'Florence', 'it', 'city', svg(rect(0, 0, W, H, '#fff') + fleur(100, 45, 110, '#D21034')),
    'The red giglio (lily) of Florence — also printed on the old florin, one of medieval Europe’s strongest coins.');
  add('bremen', 'Bremen', 'de', 'city',
    svg(Array.from({ length: 8 }, (_, i) => rect(0, i * 25, W, 25, i % 2 ? '#fff' : '#E30613')).join('') +
      Array.from({ length: 16 }, (_, i) => rect((i % 2) * 18, Math.floor(i / 2) * 25, 18, 25, (i % 2) ^ (Math.floor(i / 2) % 2) ? '#fff' : '#E30613')).join('')),
    'Nicknamed the “Speckflagge” (bacon flag) because it looks like streaky bacon. Famous for the Town Musicians of Bremen.');
  // City-states & city-territories (real flags from flag-icons)
  addImg('singapore', 'Singapore', 'sg', 'city', 'flags/sg.svg', 'A city AND a country. The crescent + 5 stars stand for a young nation rising and its 5 ideals.');
  addImg('monaco', 'Monaco', 'mc', 'city', 'flags/mc.svg', 'Red over white — almost identical to Indonesia’s, which caused a diplomatic “bro, that’s my flag” moment in 1945.');
  addImg('vatican', 'Vatican City', 'va', 'city', 'flags/va.svg', 'The world’s smallest country, with a square flag and the keys of St Peter.');
  addImg('hongkong', 'Hong Kong', 'hk', 'city', 'flags/hk.svg', 'A white bauhinia flower with five red-starred petals.');
  addImg('macau', 'Macau', 'mo', 'city', 'flags/mo.svg', 'A lotus over the Governor Nobre de Carvalho Bridge and water. The “Las Vegas of Asia”.');
  addImg('gibraltar', 'Gibraltar', 'gi', 'city', 'flags/gi.svg', 'A castle and a golden key: the “key to the Mediterranean”. Famous for its cheeky monkeys (Barbary macaques).');

  // ───────────── Regions & nations ─────────────
  addImg('england', 'England', 'gb', 'region', 'flags/gb-eng.svg', 'St George’s Cross. It’s coming home (it is not coming home).');
  addImg('scotland', 'Scotland', 'gb', 'region', 'flags/gb-sct.svg', 'The Saltire — one of the oldest flags still in use. Scotland’s national animal is the unicorn. Really.');
  addImg('wales', 'Wales', 'gb', 'region', 'flags/gb-wls.svg', 'Y Ddraig Goch — the red dragon. The Union Jack has no Welsh element, which the dragon has never forgiven.');
  addImg('nireland', 'Northern Ireland', 'gb', 'region', 'flags/gb-nir.svg', 'The Ulster Banner, with the Red Hand of Ulster. It has had no official status since 1972.');
  addImg('catalonia', 'Catalonia', 'es', 'region', 'flags/es-ct.svg', 'La Senyera: four red stripes on gold. Legend says they were drawn with a dying count’s bloody fingers.');
  addImg('basque', 'Basque Country', 'es', 'region', 'flags/es-pv.svg', 'The Ikurriña — designed in 1894 by the Arana brothers, inspired by the Union Jack.');
  addImg('galicia', 'Galicia', 'es', 'region', 'flags/es-ga.svg', 'White with a diagonal blue band — Galicia is the land of octopus (pulpo á feira) and bagpipes.');
  add('madrid', 'Community of Madrid', 'es', 'region',
    svg(rect(0, 0, W, H, '#C8102E') + [75, 125, 175, 225].map((x) => star(x, 70, 17, '#fff')).join('') + [100, 150, 200].map((x) => star(x, 125, 17, '#fff')).join('')),
    'Seven white stars on crimson — taken from the old coat of arms of Madrid (the bear-and-strawberry-tree one).');
  add('valencia', 'Valencian Community', 'es', 'region', svg(catalan(0, 0, W, H, false) + rect(0, 0, 75, H, '#0057B8') + '<path d="M22 60l15-25 15 25-15-8z" fill="#FCDD09"/>'),
    'La Senyera Coronada — the Catalan stripes with a crowned blue band. Home of paella (do NOT put chorizo in it).');
  add('bavaria', 'Bavaria', 'de', 'region',
    svg('<defs><pattern id="bav" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="40" height="40" fill="#fff"/><path d="M20 0L40 20L20 40L0 20Z" fill="#0098D4"/></pattern></defs><rect width="300" height="200" fill="url(#bav)"/>'),
    'White and blue lozenges (“Rautenflagge”). Yes, that’s where the BMW logo colours come from.');
  add('brittany', 'Brittany', 'fr', 'region',
    svg(Array.from({ length: 9 }, (_, i) => rect(0, i * (H / 9), W, H / 9 + 0.5, i % 2 ? '#fff' : '#000')).join('') + rect(0, 0, 135, (H / 9) * 5, '#fff') +
      [[25, 25], [67, 25], [109, 25], [46, 55], [88, 55], [25, 85], [67, 85], [109, 85]].map(([x, y]) => `<g fill="#000"><path d="M${x} ${y - 8}l4 14h-8z"/><circle cx="${x}" cy="${y - 10}" r="3"/></g>`).join('')),
    'The Gwenn-ha-du (“white and black”): 9 stripes and a canton of ermine spots. Brittany is the land of crêpes and cider.');
  add('texas', 'Texas', 'us', 'region', svg(rect(0, 0, W, H, '#fff') + rect(0, 100, W, 100, '#BF0D3E') + rect(0, 0, 100, H, '#002868') + star(50, 100, 32, '#fff')),
    'The Lone Star flag. Texas was its own country from 1836 to 1845 — and Texans will remind you.');
  add('ohio', 'Ohio', 'us', 'region',
    svg('<defs><clipPath id="ohc"><polygon points="0,0 300,40 240,100 300,160 0,200"/></clipPath></defs><g clip-path="url(#ohc)">' +
      Array.from({ length: 5 }, (_, i) => rect(0, i * 40, W, 40, i % 2 ? '#fff' : '#C8102E')).join('') +
      '<polygon points="0,0 160,30 160,170 0,200" fill="#002868"/></g><circle cx="70" cy="100" r="26" fill="#fff"/><circle cx="70" cy="100" r="16" fill="#C8102E"/>' +
      Array.from({ length: 13 }, (_, i) => { const a = (-90 + i * (360 / 13)) * Math.PI / 180; return star(70 + 52 * Math.cos(a), 100 + 52 * Math.sin(a), 8, '#fff'); }).join('')),
    'The only US state flag that is not a rectangle — it’s a swallowtail “burgee”. Only in Ohio. 💀');
  add('quebec', 'Québec', 'ca', 'region', svg(cross('#fff', '#003DA5', 30) + fleur(30, 18, 66, '#fff') + fleur(204, 18, 66, '#fff') + fleur(30, 118, 66, '#fff') + fleur(204, 118, 66, '#fff')),
    'The Fleurdelisé — four fleurs-de-lis remembering New France. Tabarnak, it’s pretty.');
  addImg('eu', 'European Union', 'eu', 'region', 'flags/eu.svg', '12 stars, but not for 12 members: 12 is just a symbol of perfection. The EU has had 27 members since Brexit.');
  addImg('un', 'United Nations', 'un', 'region', 'flags/un.svg', 'A world map seen from the North Pole surrounded by olive branches. Fun detail: Antarctica is left off.');

  window.CITY_FLAGS = C;
})();

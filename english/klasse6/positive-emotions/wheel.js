const words = [
  ['happy', 'glücklich', '#ffdb76'],
  ['excited', 'aufgeregt, voller Vorfreude', '#84d9d3'],
  ['proud', 'stolz', '#c1affa'],
  ['relaxed', 'entspannt', '#ffaeba'],
  ['cheerful', 'fröhlich', '#9dd3fa'],
  ['grateful', 'dankbar', '#bce18e'],
  ['confident', 'selbstbewusst', '#ffbd84'],
  ['hopeful', 'hoffnungsvoll', '#a6b9fc'],
  ['surprised', 'überrascht', '#f5a7d5'],
  ['calm', 'ruhig, gelassen', '#87dfbd'],
  ['loved', 'geliebt', '#fbe19a'],
  ['interested', 'interessiert', '#a5d7f5'],
  ['curious', 'neugierig', '#d7b1ee'],
  ['relieved', 'erleichtert', '#ffb59d'],
  ['joyful', 'voller Freude', '#b6de95'],
];

const canvas = document.getElementById('emotion-wheel');
const context = canvas.getContext('2d');
const button = document.getElementById('spin-wheel');
const resultWord = document.getElementById('emotion-word');
const resultMeaning = document.getElementById('emotion-meaning');
const list = document.getElementById('emotion-vocabulary');
const turn = 2 * Math.PI;
const sector = turn / words.length;
const center = 300;
const radius = 283;
const ink = '#24334c';
let rotation = 0;
let spinning = false;

for (const [word, meaning] of words) {
  const item = document.createElement('li');
  const term = document.createElement('strong');
  term.lang = 'en';
  term.textContent = word;
  item.append(term, ` – ${meaning}`);
  list.append(item);
}

function drawWheel() {
  context.clearRect(0, 0, center * 2, center * 2);
  context.save();
  context.translate(center, center);

  words.forEach(([word, , color], index) => {
    const angle = index * sector - Math.PI / 2 + rotation;
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius, angle - sector / 2, angle + sector / 2);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = '#fbfafd';
    context.lineWidth = 2;
    context.stroke();

    context.save();
    context.rotate(angle);
    context.translate(193, 0);
    if (Math.cos(angle) < -0.0001) context.rotate(Math.PI);
    context.fillStyle = ink;
    context.font = '750 26px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(word, 0, 0, 148);
    context.restore();
  });

  context.beginPath();
  context.arc(0, 0, radius + 2, 0, turn);
  context.lineWidth = 6;
  context.strokeStyle = ink;
  context.stroke();

  context.beginPath();
  context.arc(0, 0, 31, 0, turn);
  context.fillStyle = ink;
  context.fill();
  context.beginPath();
  context.arc(0, 0, 11, 0, turn);
  context.fillStyle = '#fbfafd';
  context.fill();
  context.restore();
}

function spin() {
  if (spinning) return;

  const selected = Math.floor(Math.random() * words.length);
  const target = (turn - selected * sector) % turn;
  const [word, meaning] = words[selected];

  function finish() {
    rotation = target;
    drawWheel();
    resultWord.textContent = word;
    resultMeaning.textContent = meaning;
    resultMeaning.hidden = false;
    button.removeAttribute('aria-disabled');
    spinning = false;
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finish();
    return;
  }

  spinning = true;
  button.setAttribute('aria-disabled', 'true');
  resultWord.textContent = 'Spinning…';
  resultMeaning.hidden = true;

  const start = rotation;
  const distance = 4 * turn + ((target - start + turn) % turn);
  const duration = 3300;
  const started = performance.now();

  function animate(time) {
    const progress = Math.min(1, Math.max(0, (time - started) / duration));
    if (progress === 1) {
      finish();
      return;
    }

    rotation = start + distance * (1 - (1 - progress) ** 4);
    drawWheel();
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

if (context) {
  context.scale(canvas.width / (center * 2), canvas.height / (center * 2));
  drawWheel();
  button.addEventListener('click', spin);
  button.disabled = false;
}

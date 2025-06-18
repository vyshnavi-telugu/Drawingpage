const drawings = [
  /* Replace each placeholder URL with your hosted image link */
  'https://i.postimg.cc/https://postimage.me/images/2025/06/18/1000072875.jpg/mermaid.png',
  'https://i.postimg.cc/https://postimage.me/images/2025/06/18/1000072873.jpg/unicorn1.png',
  'https://i.postimg.cc/https://postimage.me/images/2025/06/18/1000072874.jpg/princess-dog.png',
  'https://i.postimg.cc/XYZ/unicorn2.png',
  'https://i.postimg.cc/XYZ/pikachu-love.png',
  'https://i.postimg.cc/XYZ/portrait-lineart.png',
  'https://i.postimg.cc/XYZ/princess-full.png'
];

const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let currentTool = 'brush', drawColor = 'black', drawing = false;
const img = new Image();
const undoStack = [], redoStack = [];

const toolsEl = document.getElementById('tools');
const colorsEl = document.getElementById('colors');
const pagesEl = document.getElementById('pages');

// Page buttons
drawings.forEach((src, idx) => {
  const btn = document.createElement('button');
  btn.textContent = `Page ${idx+1}`;
  btn.onclick = () => loadPage(idx, true);
  pagesEl.appendChild(btn);
});

// Color swatches
['black', 'red', 'green', 'blue', 'orange'].forEach(c => {
  const div = document.createElement('div');
  div.className = 'color';
  div.style.background = c;
  div.dataset.color = c;
  colorsEl.appendChild(div);
});

// Tool selection
toolsEl.addEventListener('click', e => {
  if (e.target.dataset.tool) {
    currentTool = e.target.dataset.tool;
    Array.from(toolsEl.children).forEach(el => el.classList.toggle('active', el === e.target));
  }
});

// Color selection
colorsEl.addEventListener('click', e => {
  if (e.target.dataset.color) {
    drawColor = e.target.dataset.color;
    Array.from(colorsEl.children).forEach(el => el.classList.toggle('active', el === e.target));
  }
});

// Undo/Redo/Save buttons
document.getElementById('undo').onclick = undo;
document.getElementById('redo').onclick = redo;
document.getElementById('save').onclick = saveImage;

// Load initial page
loadPage(0, false);

// Canvas mouse events
canvas.onmousedown = e => {
  drawing = true;
  const { x, y } = getXY(e);
  if (currentTool === 'bucket') {
    floodFill(x, y, drawColor);
    pushUndo();
  } else {
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
};
canvas.onmousemove = draw;
canvas.onmouseup = () => {
  if (drawing && currentTool !== 'bucket') {
    draw(undefined, true);
    pushUndo();
  }
  drawing = false;
};

function loadPage(index, clearHistory = true) {
  if (clearHistory) undoStack.length = redoStack.length = 0;
  img.src = drawings[index];
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    pushUndo();
  };
}

function draw(e, end=false) {
  if (!drawing) return;
  const { x, y } = getXY(e);
  if (currentTool === 'eraser') {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 20;
  } else {
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = currentTool === 'brush' ? 5 : 15;
    ctx.globalAlpha = currentTool === 'crayon' ? 0.3 : 1;
  }
  ctx.lineCap = (currentTool === 'brush') ? 'round' : 'square';
  ctx.lineTo(x, y);
  ctx.stroke();
  if (end) ctx.globalAlpha = 1;
}

function getXY(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function floodFill(sx, sy, newColor) {
  const w = canvas.width, h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const idx = (sy * w + sx) * 4;
  const orig = d.slice(idx, idx+4);
  const fill = colorToRGBA(newColor);
  if (orig.every((v, i) => v === fill[i])) return;
  const stack = [[sx, sy]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x<0||y<0||x>=w||y>=h) continue;
    const pos = (y*w + x)*4;
    if (!orig.every((v, i) => v === d[pos+i])) continue;
    for (let i = 0; i < 3; i++) d[pos + i] = fill[i];
    d[pos+3] = 255;
    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  ctx.putImageData(imgData, 0, 0);
}

function colorToRGBA(c) {
  const tmp = document.createElement('div');
  tmp.style.color = c;
  document.body.appendChild(tmp);
  const rgb = getComputedStyle(tmp).color;
  document.body.removeChild(tmp);
  return rgb.match(/\d+/g).map(n => +n).concat(255);
}

function pushUndo() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 50) undoStack.shift();
  redoStack.length = 0;
}

function undo() {
  if (undoStack.length < 2) return;
  redoStack.push(undoStack.pop());
  restoreFromDataURL(undoStack[undoStack.length - 1]);
}

function redo() {
  if (!redoStack.length) return;
  const data = redoStack.pop();
  undoStack.push(data);
  restoreFromDataURL(data);
}

function restoreFromDataURL(data) {
  const i = new Image();
  i.src = data;
  i.onload = () => ctx.drawImage(i, 0, 0);
}

function saveImage() {
  const link = document.createElement('a');
  link.download = 'coloring.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

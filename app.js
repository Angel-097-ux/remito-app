/* ============================================
   REMITO APP — JAVASCRIPT
   ============================================ */

// ===== NAVEGACIÓN =====
function irA(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const dest = document.getElementById(screenId);
  if (dest) dest.classList.add('active');
  window.scrollTo(0, 0);

  if (screenId === 'screen-nuevo') {
    cargarDatosEmpresa();
    if (document.getElementById('rem-fecha').value === '') {
      document.getElementById('rem-fecha').value = new Date().toISOString().slice(0, 10);
    }
    if (document.querySelectorAll('.item-row').length === 0) {
      agregarFila();
      agregarFila();
      agregarFila();
    }
  }
  if (screenId === 'screen-config') {
    cargarConfigForm();
  }
}

// ===== CONFIG / DATOS EMPRESA =====
function guardarConfig() {
  const datos = {
    nombre: document.getElementById('cfg-nombre').value.trim(),
    rubro: document.getElementById('cfg-rubro').value.trim(),
    tel: document.getElementById('cfg-tel').value.trim(),
    ciudad: document.getElementById('cfg-ciudad').value.trim(),
    cuit: document.getElementById('cfg-cuit').value.trim(),
    email: document.getElementById('cfg-email').value.trim(),
  };
  localStorage.setItem('remito_empresa', JSON.stringify(datos));
  mostrarToast('✅ Datos guardados');
  setTimeout(() => irA('screen-home'), 700);
}

function cargarConfigForm() {
  const datos = obtenerDatosEmpresa();
  document.getElementById('cfg-nombre').value = datos.nombre || '';
  document.getElementById('cfg-rubro').value = datos.rubro || '';
  document.getElementById('cfg-tel').value = datos.tel || '';
  document.getElementById('cfg-ciudad').value = datos.ciudad || '';
  document.getElementById('cfg-cuit').value = datos.cuit || '';
  document.getElementById('cfg-email').value = datos.email || '';
}

function obtenerDatosEmpresa() {
  try {
    return JSON.parse(localStorage.getItem('remito_empresa')) || {};
  } catch { return {}; }
}

function cargarDatosEmpresa() {
  const d = obtenerDatosEmpresa();
  setText('show-nombre', d.nombre || 'MI EMPRESA');
  setText('show-rubro', d.rubro || 'Rubro / Descripción');
  setText('show-tel', d.tel || 'Teléfono');
  setText('show-ciudad', d.ciudad || 'Ciudad');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ===== TABLA ITEMS =====
let rowCounter = 0;

function agregarFila() {
  rowCounter++;
  const id = rowCounter;
  const list = document.getElementById('items-list');
  const row = document.createElement('div');
  row.className = 'item-row';
  row.dataset.id = id;
  row.innerHTML = `
    <input type="number" class="inp-qty" placeholder="0" min="0" inputmode="decimal" onchange="recalcular()" oninput="recalcular()" />
    <input type="text" class="inp-desc" placeholder="Descripción del producto" />
    <input type="number" class="inp-price" placeholder="0.00" min="0" step="0.01" inputmode="decimal" onchange="recalcular()" oninput="recalcular()" />
    <span class="cell-total">$ 0,00</span>
    <button class="btn-del" onclick="eliminarFila(this)" title="Eliminar fila">✕</button>
  `;
  list.appendChild(row);
}

function eliminarFila(btn) {
  const row = btn.closest('.item-row');
  if (document.querySelectorAll('.item-row').length <= 1) {
    mostrarToast('⚠️ Debe haber al menos una fila');
    return;
  }
  row.remove();
  recalcular();
}

function recalcular() {
  let total = 0;
  document.querySelectorAll('.item-row').forEach(row => {
    const qty = parseFloat(row.querySelector('.inp-qty').value) || 0;
    const price = parseFloat(row.querySelector('.inp-price').value) || 0;
    const sub = qty * price;
    row.querySelector('.cell-total').textContent = '$ ' + formatNum(sub);
    total += sub;
  });
  document.getElementById('gran-total').textContent = '$ ' + formatNum(total);
}

function formatNum(n) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ===== LIMPIAR / IMPRIMIR =====
function limpiarRemito() {
  if (!confirm('¿Limpiar todos los datos del remito?')) return;
  document.getElementById('rem-numero').value = '';
  document.getElementById('rem-fecha').value = new Date().toISOString().slice(0, 10);
  document.getElementById('rem-marca').value = '';
  document.querySelectorAll('.cliente-row input').forEach(i => i.value = '');
  document.getElementById('obs-text').value = '';
  document.getElementById('items-list').innerHTML = '';
  rowCounter = 0;
  agregarFila();
  agregarFila();
  agregarFila();
  recalcular();
  mostrarToast('🗑 Remito limpio');
}

function imprimirRemito() {
  window.print();
}

// ===== TOAST =====
function mostrarToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = `
      position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
      background:#0f172a; color:#fff; padding:12px 22px; border-radius:50px;
      font-family:'DM Sans',sans-serif; font-size:0.88rem; font-weight:500;
      z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,0.3);
      transition:opacity 0.3s; pointer-events:none;
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => { t.style.opacity = '0'; }, 2000);
}

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar home al inicio
  irA('screen-home');
});

let storage = JSON.parse(localStorage.getItem('myFinanceDB')) || { entradas: [] };
let config = JSON.parse(localStorage.getItem('myFinanceConfig')) || { darkMode: false, limpezaMeses: 0 };
let g1 = null;
let g2 = null;

const formatar = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ehRenda = (tipo) => String(tipo || '').toLowerCase().trim() === 'renda';

function salvarTudo() {
localStorage.setItem('myFinanceDB', JSON.stringify(storage));
localStorage.setItem('myFinanceConfig', JSON.stringify(config));
}

function aplicarConfig() {
document.body.classList.toggle('dark-mode', Boolean(config.darkMode));
const chk = document.getElementById('toggleDarkMode');
if (chk) chk.checked = Boolean(config.darkMode);

const sel = document.getElementById('prazoLimpeza');
if (sel) sel.value = String(config.limpezaMeses || 0);

if (Number(config.limpezaMeses) > 0) {
const limite = new Date();
limite.setMonth(limite.getMonth() - Number(config.limpezaMeses));
storage.entradas = storage.entradas.filter(item => new Date(item.data) >= limite);
salvarTudo();
}
}

function alternarTemaEscuro() {
const chk = document.getElementById('toggleDarkMode');
config.darkMode = chk ? chk.checked : false;
salvarTudo();
aplicarConfig();
}

function salvarConfigLimpeza() {
const sel = document.getElementById('prazoLimpeza');
config.limpezaMeses = sel ? Number(sel.value) : 0;
salvarTudo();
aplicarConfig();
renderizar();
}

function showTab(id) {
document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
document.querySelectorAll(".nav").forEach(n => n.classList.remove("active"));

document.getElementById(id).style.display = "block";
document.getElementById('nav-' + id).classList.add("active");

renderizar();
}

function adicionarOutro() {
const desc = document.getElementById("descricaoOutro").value.trim();
const valor = parseFloat(document.getElementById("valorOutro").value);
const tipo = document.getElementById("tipoLancamento").value;
const cat = document.getElementById("categoriaLancamento").value;
const fixo = document.getElementById("itemFixo").checked;

if (!desc || isNaN(valor)) return alert("Preencha descrição e valor corretamente!");

storage.entradas.push({
id: Date.now(),
desc,
valor,
tipo: ehRenda(tipo) ? 'renda' : 'despesa',
cat,
fixo,
data: new Date().toISOString()
});

salvarTudo();

document.getElementById("descricaoOutro").value = "";
document.getElementById("valorOutro").value = "";
document.getElementById("itemFixo").checked = false;

alert("Lançamento guardado!");
renderizar();
}

function editarItem(id) {
const item = storage.entradas.find(e => e.id === id);
if (!item) return;

const novaDesc = prompt("Descrição:", item.desc);
if (novaDesc === null) return;

const novoValorStr = prompt("Valor:", String(item.valor));
if (novoValorStr === null) return;

const novoValor = parseFloat(novoValorStr.replace(",", "."));
if (!novaDesc.trim() || isNaN(novoValor)) return alert("Valor ou descrição inválidos!");

const novoTipo = prompt("Tipo (renda ou despesa):", item.tipo);
item.desc = novaDesc.trim();
item.valor = novoValor;
if (novoTipo !== null) {
item.tipo = ehRenda(novoTipo) ? 'renda' : 'despesa';
}

salvarTudo();
renderizar();
}

function excluirItem(id) {
if (!confirm("Deseja excluir este lançamento?")) return;
storage.entradas = storage.entradas.filter(e => e.id !== id);
salvarTudo();
renderizar();
}

function exportarBackup() {
const dados = JSON.stringify({ storage, config }, null, 2);
const blob = new Blob([dados], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "myfinance-backup.json";
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
}

function renderizar() {
let rec = 0;
let desp = 0;
let somaCat = {};

const lSaldo = document.getElementById("listaResumoSaldo");
const lDesp = document.getElementById("listaDespesas") || document.getElementById("listaDespesasFim");
const lHist = document.getElementById("historicoGeral") || document.getElementById("listaHistorico");

if (lSaldo) lSaldo.innerHTML = "";
if (lDesp) lDesp.innerHTML = "";
if (lHist) lHist.innerHTML = "";

const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const hoje = new Date();
const chaveMesAtual = `${mesesNomes[hoje.getMonth()]} ${hoje.getFullYear()}`;

const elMes = document.querySelector(".mes");
if (elMes) elMes.innerText = mesesNomes[hoje.getMonth()];

const transacoesPorMes = {};

storage.entradas.forEach(e => {
const d = new Date(e.data);
const chaveOrigem = `${mesesNomes[d.getMonth()]} ${d.getFullYear()}`;

if (!transacoesPorMes[chaveOrigem]) transacoesPorMes[chaveOrigem] = [];
transacoesPorMes[chaveOrigem].push(e);

if (e.fixo) {
let cursor = new Date(d.getFullYear(), d.getMonth() + 1, 1);
while (cursor <= hoje) {
const chaveC = `${mesesNomes[cursor.getMonth()]} ${cursor.getFullYear()}`;
if (!transacoesPorMes[chaveC]) transacoesPorMes[chaveC] = [];
if (!transacoesPorMes[chaveC].some(x => x.id === e.id)) {
transacoesPorMes[chaveC].push({ ...e, replicado: true });
}
cursor.setMonth(cursor.getMonth() + 1);
}
}
});

if (transacoesPorMes[chaveMesAtual]) {
transacoesPorMes[chaveMesAtual].forEach(item => {
if (ehRenda(item.tipo)) {
rec += Number(item.valor);
} else {
desp += Number(item.valor);
const nomeExibicao = (item.cat === "Outros") ? item.desc : item.cat;
somaCat[nomeExibicao] = (somaCat[nomeExibicao] || 0) + Number(item.valor);
}
});
}

const mesesOrdenados = Object.keys(transacoesPorMes).sort((a, b) => {
const [m1, a1] = a.split(" ");
const [m2, a2] = b.split(" ");
return new Date(a2, mesesNomes.indexOf(m2)) - new Date(a1, mesesNomes.indexOf(m1));
});

if (lHist) {
mesesOrdenados.forEach(mes => {
const itensDoMes = transacoesPorMes[mes];
const totalRendaMes = itensDoMes
.filter(i => ehRenda(i.tipo))
.reduce((acc, i) => acc + Number(i.valor), 0);
const totalDespesaMes = itensDoMes
.filter(i => !ehRenda(i.tipo))
.reduce((acc, i) => acc + Number(i.valor), 0);

const header = document.createElement("div");
header.className = "mes-header";
header.innerHTML = `<span>${mes}</span> ${mes === chaveMesAtual ? '<small>(Mês Atual)</small>' : ''}`;
lHist.appendChild(header);

const ul = document.createElement("ul");
ul.className = "lista";

itensDoMes.forEach(t => {
const li = document.createElement("li");
const isR = ehRenda(t.tipo);
const baseTotal = isR ? totalRendaMes : totalDespesaMes;
const percItem = baseTotal > 0 ? ((Number(t.valor) / baseTotal) * 100).toFixed(1) : "0.0";

li.innerHTML = `
<span>${t.desc} ${t.fixo ? '🔄' : ''} <small>(${t.cat})</small></span>
<div>
<strong style="color: ${isR ? '#28a745' : '#e83e8c'}">${formatar(t.valor)}</strong>
<small style="opacity:0.75; margin-left:4px;">(${percItem}%)</small>
${!t.replicado ? `
<button class="btn-mini" onclick="editarItem(${t.id})" title="Editar">✏️</button>
<button class="btn-mini" onclick="excluirItem(${t.id})" title="Excluir">🗑️</button>
` : ''}
</div>
`;
ul.appendChild(li);
});
lHist.appendChild(ul);
});
}

if (lDesp && transacoesPorMes[chaveMesAtual]) {
transacoesPorMes[chaveMesAtual].forEach(item => {
const isR = ehRenda(item.tipo);
const li = document.createElement("li");
li.innerHTML = `
<span>${item.desc} <small>(${isR ? 'Renda' : item.cat})</small></span>
<div>
<strong style="color: ${isR ? '#28a745' : '#e83e8c'}">${formatar(item.valor)}</strong>
${!item.replicado ? `
<button class="btn-mini" onclick="editarItem(${item.id})" title="Editar">✏️</button>
<button class="btn-mini" onclick="excluirItem(${item.id})" title="Excluir">🗑️</button>
` : ''}
</div>
`;
lDesp.appendChild(li);
});
}

const elSaldoGeral = document.querySelector(".saldo-total");
const elRecTotal = document.getElementById("txtRendaTotal");
const elDespTotal = document.getElementById("txtDespesasTotal");

if (elSaldoGeral) elSaldoGeral.innerText = formatar(rec - desp);
if (elRecTotal) elRecTotal.innerText = formatar(rec);
if (elDespTotal) elDespTotal.innerText = formatar(desp);

for (const c in somaCat) {
const perc = desp > 0 ? ((somaCat[c] / desp) * 100).toFixed(1) : 0;
const liHtml = `<li><span>${c}</span><strong>${formatar(somaCat[c])} <small style="font-weight:normal; color:#666">(${perc}%)</small></strong></li>`;
if (lSaldo) lSaldo.innerHTML += liHtml;
}

if (typeof atualizarGraficos === "function") {
atualizarGraficos(somaCat);
}
}

function atualizarGraficos(dados) {
const configGrafico = {
type: "doughnut",
data: {
labels: Object.keys(dados),
datasets: [{
data: Object.values(dados),
backgroundColor: ["#7b2ff7", "#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff", "#ff9f40", "#c9cbcf"]
}]
},
options: {
plugins: {
legend: { display: false },
tooltip: {
callbacks: {
label: function(context) {
const valor = context.parsed;
const total = context.dataset.data.reduce((a, b) => a + b, 0);
const perc = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
return `${context.label}: ${formatar(valor)} (${perc}%)`;
}
}
}
}
}
};

if (g1) g1.destroy();
if (g2) g2.destroy();

const ctx1 = document.getElementById("grafico");
const ctx2 = document.getElementById("graficoDespesas");

if (ctx1) g1 = new Chart(ctx1, configGrafico);
if (ctx2) g2 = new Chart(ctx2, configGrafico);
}

function apagarTudo() {
if (confirm("Deseja apagar todos os dados de anos e meses anteriores?")) {
localStorage.removeItem('myFinanceDB');
storage = { entradas: [] };
renderizar();
}
}

document.addEventListener("DOMContentLoaded", () => {
aplicarConfig();
renderizar();
});

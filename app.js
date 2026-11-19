const CHAVE_DB = 'myFinanceDB';
const CHAVE_CONFIG = 'myFinanceConfig';

let storage = JSON.parse(localStorage.getItem(CHAVE_DB)) || { entradas: [] };
let configApp = JSON.parse(localStorage.getItem(CHAVE_CONFIG)) || {
darkMode: false,
mesesLimpeza: 0
};

let g1 = null;
let g2 = null;

const formatar = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function salvarDados() {
localStorage.setItem(CHAVE_DB, JSON.stringify(storage));
}

function salvarConfig() {
localStorage.setItem(CHAVE_CONFIG, JSON.stringify(configApp));
}

function aplicarConfiguracoes() {
document.body.classList.toggle('dark-theme', Boolean(configApp.darkMode));
const chkDark = document.getElementById('toggleDarkMode');
if (chkDark) chkDark.checked = Boolean(configApp.darkMode);

const selLimpeza = document.getElementById('prazoLimpeza');
if (selLimpeza) selLimpeza.value = String(configApp.mesesLimpeza || 0);

if (configApp.mesesLimpeza > 0) {
const limite = new Date();
limite.setMonth(limite.getMonth() - Number(configApp.mesesLimpeza));
const antes = storage.entradas.length;
storage.entradas = storage.entradas.filter(item => new Date(item.data) >= limite);
if (storage.entradas.length !== antes) {
salvarDados();
}
}
}

function alternarTemaEscuro() {
const chkDark = document.getElementById('toggleDarkMode');
configApp.darkMode = chkDark ? chkDark.checked : false;
salvarConfig();
aplicarConfiguracoes();
}

function salvarConfigLimpeza() {
const selLimpeza = document.getElementById('prazoLimpeza');
configApp.mesesLimpeza = selLimpeza ? Number(selLimpeza.value) : 0;
salvarConfig();
aplicarConfiguracoes();
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
const tipo = document.getElementById("tipoLancamento").value; // "renda" ou "despesa"
const cat = document.getElementById("categoriaLancamento").value;
const fixo = document.getElementById("itemFixo").checked;

if (!desc || isNaN(valor) || valor <= 0) {
return alert("Preencha uma descrição e um valor maior que zero!");
}

storage.entradas.push({
id: Date.now(),
desc,
valor,
tipo,
cat,
fixo,
data: new Date().toISOString()
});

salvarDados();

document.getElementById("descricaoOutro").value = "";
document.getElementById("valorOutro").value = "";
document.getElementById("itemFixo").checked = false;

renderizar();
alert("Lançamento salvo com sucesso!");
}

function editarTransacao(id) {
const item = storage.entradas.find(e => e.id === id);
if (!item) return;

const novaDesc = prompt("Nova descrição:", item.desc);
if (novaDesc === null) return;

const novoValorStr = prompt("Novo valor (ex: 150.00):", String(item.valor));
if (novoValorStr === null) return;

const novoValor = parseFloat(novoValorStr.replace(",", "."));
const novoTipo = prompt("Tipo ('renda' ou 'despesa'):", item.tipo);

if (!novaDesc.trim() || isNaN(novoValor) || novoValor <= 0) {
return alert("Dados inválidos para edição.");
}

const tipoNormalizado = (novoTipo || "").toLowerCase().trim() === "renda" ? "renda" : "despesa";

item.desc = novaDesc.trim();
item.valor = novoValor;
item.tipo = tipoNormalizado;

salvarDados();
renderizar();
}

function excluirTransacao(id) {
if (!confirm("Deseja realmente excluir este lançamento?")) return;
storage.entradas = storage.entradas.filter(e => e.id !== id);
salvarDados();
renderizar();
}

function exportarBackup() {
const blob = new Blob([JSON.stringify(storage, null, 2)], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `myfinance-backup-${new Date().toISOString().slice(0, 10)}.json`;
a.click();
URL.revokeObjectURL(url);
}

function renderizar() {
let rec = 0;
let desp = 0;
let somaCat = {};

const lSaldo = document.getElementById("listaResumoSaldo");
const lDesp = document.getElementById("listaDespesasFim");
const lHist = document.getElementById("listaHistorico");

if (lSaldo) lSaldo.innerHTML = "";
if (lDesp) lDesp.innerHTML = "";
if (lHist) lHist.innerHTML = "";

const mesesNomes = [
"Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
"Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
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
const jaExiste = transacoesPorMes[chaveC].some(x => x.id === e.id);
if (!jaExiste) {
transacoesPorMes[chaveC].push({ ...e, replicado: true });
}
cursor.setMonth(cursor.getMonth() + 1);
}
}
});

if (transacoesPorMes[chaveMesAtual]) {
transacoesPorMes[chaveMesAtual].forEach(item => {
if (item.tipo === 'renda') {
rec += item.valor;
} else {
desp += item.valor;
const nomeExibicao = (item.cat === "Outros") ? item.desc : item.cat;
somaCat[nomeExibicao] = (somaCat[nomeExibicao] || 0) + item.valor;
}
});
}

const mesesOrdenados = Object.keys(transacoesPorMes).sort((a, b) => {
const [m1, a1] = a.split(" ");
const [m2, a2] = b.split(" ");
return new Date(Number(a2), mesesNomes.indexOf(m2)) - new Date(Number(a1), mesesNomes.indexOf(m1));
});

if (lHist) {
if (mesesOrdenados.length === 0) {
lHist.innerHTML = '<p class="texto-apoio">Nenhuma transação registrada ainda.</p>';
} else {
mesesOrdenados.forEach(mes => {
const header = document.createElement("div");
header.className = "mes-header";
header.innerHTML = `<span>${mes}</span> ${mes === chaveMesAtual ? '<small>(Mês Atual)</small>' : ''}`;
lHist.appendChild(header);

const ul = document.createElement("ul");
ul.className = "lista";

transacoesPorMes[mes].forEach(t => {
const li = document.createElement("li");
const corValor = t.tipo === 'renda' ? '#28a745' : '#e83e8c';
const sinal = t.tipo === 'renda' ? '+ ' : '- ';

li.innerHTML = `
<span>${t.desc} ${t.fixo ? '🔄' : ''} <small>(${t.cat})</small></span>
<div class="item-acoes">
<strong style="color: ${corValor}">${sinal}${formatar(t.valor)}</strong>
${!t.replicado ? `
<button class="btn-icone" onclick="editarTransacao(${t.id})" title="Editar">✏️</button>
<button class="btn-icone" onclick="excluirTransacao(${t.id})" title="Excluir">🗑️</button>
` : ''}
</div>
`;
ul.appendChild(li);
});
lHist.appendChild(ul);
});
}
}

const elSaldoGeral = document.querySelector(".saldo-total");
const elRecTotal = document.getElementById("txtRendaTotal");
const elDespTotal = document.getElementById("txtDespesasTotal");

if (elSaldoGeral) elSaldoGeral.innerText = formatar(rec - desp);
if (elRecTotal) elRecTotal.innerText = formatar(rec);
if (elDespTotal) elDespTotal.innerText = formatar(desp);

for (const c in somaCat) {
const perc = desp > 0 ? ((somaCat[c] / desp) * 100).toFixed(1) : 0;
const liHtml = `<li><span>${c}</span><strong>${formatar(somaCat[c])} <small style="font-weight:normal; opacity:0.75;">(${perc}%)</small></strong></li>`;
if (lSaldo) lSaldo.innerHTML += liHtml;
if (lDesp) lDesp.innerHTML += liHtml;
}

if (typeof atualizarGraficos === "function") {
atualizarGraficos(somaCat);
}
}

function atualizarGraficos(dados) {
const config = {
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

if (ctx1) g1 = new Chart(ctx1, config);
if (ctx2) g2 = new Chart(ctx2, config);
}

function apagarTudo() {
if (confirm("Deseja realmente apagar todos os lançamentos salvos?")) {
localStorage.removeItem(CHAVE_DB);
storage = { entradas: [] };
renderizar();
}
}

document.addEventListener("DOMContentLoaded", () => {
aplicarConfiguracoes();
renderizar();
});

let storage = JSON.parse(localStorage.getItem('myFinanceDB')) || { entradas: [] };
let g1 = null;
let g2 = null;

const formatar = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function showTab(id) {
    document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
    document.querySelectorAll(".nav").forEach(n => n.classList.remove("active"));
    
    document.getElementById(id).style.display = "block";
    document.getElementById('nav-' + id).classList.add("active");
    
    renderizar();
}

function adicionarOutro() {
    const desc = document.getElementById("descricaoOutro").value;
    const valor = parseFloat(document.getElementById("valorOutro").value);
    const tipo = document.getElementById("tipoLancamento").value;
    const cat = document.getElementById("categoriaLancamento").value;
    const fixo = document.getElementById("itemFixo").checked; // Pega se é fixo

    if (!desc || isNaN(valor)) return alert("Preencha descrição e valor corretamente!");

    storage.entradas.push({ 
        id: Date.now(),
        desc, 
        valor, 
        tipo, 
        cat, 
        fixo, 
        data: new Date().toISOString() 
    });

    localStorage.setItem('myFinanceDB', JSON.stringify(storage));
    
    document.getElementById("descricaoOutro").value = "";
    document.getElementById("valorOutro").value = "";
    document.getElementById("itemFixo").checked = false;
    
    alert("Lançamento guardado!");
    renderizar();
}
function renderizar() {
    let rec = 0; let desp = 0; let somaCat = {};
    const lSaldo = document.getElementById("listaResumoSaldo");
    const lDesp = document.getElementById("listaDespesas") || document.getElementById("listaDespesasFim");
    const lHist = document.getElementById("historicoGeral") || document.getElementById("listaHistorico");

    if (lSaldo) lSaldo.innerHTML = "";
    if (lDesp) lDesp.innerHTML = "";
    if (lHist) lHist.innerHTML = "";

    const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const hoje = new Date();
    const chaveMesAtual = `${mesesNomes[hoje.getMonth()]} ${hoje.getFullYear()}`;

    // Atualiza o nome do mês no topo do dashboard
    const elMes = document.querySelector(".mes");
    if (elMes) elMes.innerText = mesesNomes[hoje.getMonth()];

    const transacoesPorMes = {};

    // 1. ORGANIZANDO POR MÊS E REPLICANDO FIXOS
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
                transacoesPorMes[chaveC].push({ ...e, replicado: true });
                cursor.setMonth(cursor.getMonth() + 1);
            }
        }
    });

    // 2. CÁLCULOS DO MÊS ATUAL (Soma apenas o que aparece no Dashboard)
    if (transacoesPorMes[chaveMesAtual]) {
        transacoesPorMes[chaveMesAtual].forEach(item => {
            if (item.tipo === 'receita') rec += item.valor;
            else {
                desp += item.valor;
                const nomeExibicao = (item.cat === "Outros") ? item.desc : item.cat;
                somaCat[nomeExibicao] = (somaCat[nomeExibicao] || 0) + item.valor;
            }
        });
    }

    // 3. DESENHANDO AS PASTAS NO HISTÓRICO
    const mesesOrdenados = Object.keys(transacoesPorMes).sort((a, b) => {
        const [m1, a1] = a.split(" "); const [m2, a2] = b.split(" ");
        return new Date(a2, mesesNomes.indexOf(m2)) - new Date(a1, mesesNomes.indexOf(m1));
    });

    if (lHist) {
        mesesOrdenados.forEach(mes => {
            const header = document.createElement("div");
            header.className = "mes-header"; 
            header.innerHTML = `<span>${mes}</span> ${mes === chaveMesAtual ? '<small>(Mês Atual)</small>' : ''}`;
            lHist.appendChild(header);

            const ul = document.createElement("ul");
            ul.className = "lista";

            transacoesPorMes[mes].forEach(t => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${t.desc} ${t.fixo ? '🔄' : ''} <small>(${t.cat})</small></span>
                    <strong style="color: ${t.tipo === 'receita' ? '#28a745' : '#e83e8c'}">${formatar(t.valor)}</strong>
                `;
                ul.appendChild(li);
            });
            lHist.appendChild(ul);
        });
    }

    // 4. ATUALIZANDO OS CARDS DE SALDO
    const elSaldoGeral = document.querySelector(".saldo-total");
    const elRecTotal = document.getElementById("txtReceitasTotal");
    const elDespTotal = document.getElementById("txtDespesasTotal");

    if (elSaldoGeral) elSaldoGeral.innerText = formatar(rec - desp);
    if (elRecTotal) elRecTotal.innerText = formatar(rec);
    if (elDespTotal) elDespTotal.innerText = formatar(desp);

    // 5. PREENCHENDO LISTAS DE CATEGORIAS COM PORCENTAGEM
    for (const c in somaCat) {
        const perc = desp > 0 ? ((somaCat[c] / desp) * 100).toFixed(1) : 0;
        const liHtml = `<li><span>${c}</span><strong>${formatar(somaCat[c])} <small style="font-weight:normal; color:#666">(${perc}%)</small></strong></li>`;
        if (lSaldo) lSaldo.innerHTML += liHtml;
        if (lDesp) lDesp.innerHTML += liHtml;
    }

    // 6. ATUALIZAÇÃO DOS GRÁFICOS
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
                // Adicionei mais cores caso você crie muitos itens em "Outros"
                backgroundColor: ["#7b2ff7", "#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff", "#ff9f40", "#c9cbcf"]
            }]
        },
        options: { 
            plugins: { 
                legend: { display: false },
                // Isso faz a porcentagem aparecer quando você coloca o mouse sobre o gráfico
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const valor = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const perc = ((valor / total) * 100).toFixed(1);
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
    if (confirm("Deseja apagar todos os dados de anos e meses anteriores?")) {
        localStorage.removeItem('myFinanceDB');
        storage = { entradas: [] };
        renderizar();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderizar();
});

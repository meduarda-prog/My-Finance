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

    if (!desc || !valor) return alert("Preencha descrição e valor!");

    storage.entradas.push({ desc, valor, tipo, cat, data: new Date().toISOString() });
    localStorage.setItem('myFinanceDB', JSON.stringify(storage));

    document.getElementById("descricaoOutro").value = "";
    document.getElementById("valorOutro").value = "";
    alert("Lançamento guardado!");
    renderizar();
}

function renderizar() {
    let rec = 0;
    let desp = 0;
    let somaCat = { "Educação": 0, "Alimentação": 0, "Transporte": 0, "Academia": 0, "Outros": 0 };
    
    const lSaldo = document.getElementById("listaResumoSaldo");
    const lDesp = document.getElementById("listaDespesasFim");
    const lHist = document.getElementById("listaHistorico");

    if (lSaldo) lSaldo.innerHTML = "";
    if (lDesp) lDesp.innerHTML = "";
    if (lHist) lHist.innerHTML = "";

    storage.entradas.forEach(e => {
    if (e.tipo === 'receita') {
        rec += e.valor;
    } else {
        desp += e.valor;
        // Se for "Outros", o nome no gráfico será o que você escreveu na descrição
        const nomeParaExibir = (e.cat === "Outros") ? e.desc : e.cat;
        somaCat[nomeParaExibir] = (somaCat[nomeParaExibir] || 0) + e.valor;
    }

    if (lHist) {
        const dataObjeto = new Date(e.data);
        const dataFormatada = dataObjeto.toLocaleDateString('pt-BR');
        // Agora mostra Descrição + Categoria + Data
        lHist.innerHTML += `<li>
            <span>${e.desc} <small style="color:#888;">(${e.cat} - ${dataFormatada})</small></span>
            <strong style="color: ${e.tipo === 'receita' ? '#28a745' : '#e83e8c'}">${formatar(e.valor)}</strong>
        </li>`;
    }
});

    document.getElementById("txtSaldoGeral").innerText = formatar(rec - desp);
    document.getElementById("txtReceitasTotal").innerText = formatar(rec);
    document.getElementById("txtDespesasTotal").innerText = formatar(desp);

   for (const c in somaCat) {
    if (somaCat[c] > 0) {
        // Calcula a porcentagem comparando a categoria com o total de despesas
        const porcentagem = desp > 0 ? ((somaCat[c] / desp) * 100).toFixed(1) : 0;
        
        const li = `<li>
            <span>${c}</span>
            <strong>${formatar(somaCat[c])} <small style="font-weight:normal; color:#666;">(${porcentagem}%)</small></strong>
        </li>`;
        
        if (lSaldo) lSaldo.innerHTML += li;
        if (lDesp) lDesp.innerHTML += li;
    }
}

    atualizarGraficos(somaCat);
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

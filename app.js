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
            somaCat[e.cat] = (somaCat[e.cat] || 0) + e.valor;
        }

        if (lHist) {
            const dataObjeto = new Date(e.data);
            const dataFormatada = dataObjeto.toLocaleDateString('pt-BR');
            lHist.innerHTML += `<li><span>${e.desc} (${dataFormatada})</span><strong style="color: ${e.tipo === 'receita' ? '#28a745' : '#e83e8c'}">${formatar(e.valor)}</strong></li>`;
        }
    });

    document.getElementById("txtSaldoGeral").innerText = formatar(rec - desp);
    document.getElementById("txtReceitasTotal").innerText = formatar(rec);
    document.getElementById("txtDespesasTotal").innerText = formatar(desp);

    for (const c in somaCat) {
        if (somaCat[c] > 0) {
            const li = `<li><span>${c}</span><strong>${formatar(somaCat[c])}</strong></li>`;
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
                backgroundColor: ["#7b2ff7", "#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0"]
            }]
        },
        options: { plugins: { legend: { display: false } } }
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

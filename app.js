// Estado global da aplicação
let dados = JSON.parse(localStorage.getItem('myFinanceData')) || {
    transacoes: []
};

let meuGrafico = null;

// Formatador de moeda
const formatar = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function showTab(id) {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".nav").forEach(btn => btn.classList.remove("active"));
    
    document.getElementById(id).classList.add("active");
    // Adiciona classe active no botão clicado (lógica simplificada)
    event.currentTarget.classList.add("active");

    if(id === 'dashboard' || id === 'transacoes') atualizarInterface();
}

function adicionarDados() {
    const desc = document.getElementById("descLancamento").value;
    const valor = parseFloat(document.getElementById("valorLancamento").value);
    const tipo = document.getElementById("tipoLancamento").value;
    const cat = document.getElementById("catLancamento").value;

    if (!desc || !valor) return alert("Preencha os campos!");

    const novaTransacao = {
        id: Date.now(),
        descricao: desc,
        valor: tipo === 'despesa' ? -valor : valor,
        categoria: cat,
        data: new Date().toISOString()
    };

    dados.transacoes.push(novaTransacao);
    localStorage.setItem('myFinanceData', JSON.stringify(dados));
    
    // Limpar campos
    document.getElementById("descLancamento").value = "";
    document.getElementById("valorLancamento").value = "";
    
    alert("Lançado com sucesso!");
    atualizarInterface();
}

function atualizarInterface() {
    const resumoCat = {};
    let totalReceitas = 0;
    let totalDespesas = 0;

    // Processar transações
    dados.transacoes.forEach(t => {
        if (t.valor > 0) {
            totalReceitas += t.valor;
        } else {
            totalDespesas += Math.abs(t.valor);
            resumoCat[t.categoria] = (resumoCat[t.categoria] || 0) + Math.abs(t.valor);
        }
    });

    // Atualizar Números
    document.getElementById("saldoGeral").innerText = formatar(totalReceitas - totalDespesas);
    document.getElementById("totalReceitas").innerText = formatar(totalReceitas);
    document.getElementById("totalDespesas").innerText = formatar(totalDespesas);
    document.getElementById("displayMes").innerText = new Intl.DateTimeFormat('pt-BR', {month: 'long'}).format(new Date());

    atualizarGrafico(resumoCat);
    atualizarTabela();
    atualizarListaResumo(resumoCat, totalDespesas);
}

function atualizarGrafico(resumo) {
    const ctx = document.getElementById("graficoDashboard").getContext("2d");
    const labels = Object.keys(resumo);
    const valores = Object.values(resumo);

    if (meuGrafico) meuGrafico.destroy();

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: ["#7b2ff7", "#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff"]
            }]
        },
        options: { plugins: { legend: { display: false } } }
    });
}

function atualizarTabela() {
    const corpo = document.getElementById("corpoTransacoes");
    corpo.innerHTML = "";

    dados.transacoes.reverse().forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="padding:10px">${t.descricao}</td>
            <td>${t.categoria}</td>
            <td style="color: ${t.valor > 0 ? '#28a745' : '#e83e8c'}">${formatar(t.valor)}</td>
            <td><button onclick="deletarItem(${t.id})" style="border:none; background:none; cursor:pointer">🗑️</button></td>
        `;
        corpo.appendChild(tr);
    });
}

function atualizarListaResumo(resumo, total) {
    const lista = document.getElementById("listaResumo");
    lista.innerHTML = "";
    for (let cat in resumo) {
        const perc = ((resumo[cat] / total) * 100).toFixed(0);
        lista.innerHTML += `<li><span>${cat}</span> <strong>${perc}%</strong></li>`;
    }
}

function deletarItem(id) {
    dados.transacoes = dados.transacoes.filter(t => t.id !== id);
    localStorage.setItem('myFinanceData', JSON.stringify(dados));
    atualizarInterface();
}

function limparDados() {
    if(confirm("Deseja apagar TODO o histórico?")) {
        localStorage.clear();
        location.reload();
    }
}

// Iniciar
document.addEventListener("DOMContentLoaded", atualizarInterface);

// GRAFICO DO DASHBOARD
const ctx = document.getElementById("grafico");

new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Educação", "Alimentação", "Transporte", "Academia"],
    datasets: [{
      data: [500, 300, 230, 120],
      backgroundColor: [
        "#7b2ff7",
        "#ff6384",
        "#36a2eb",
        "#ffcd56"
      ]
    }]
  }
});


// CATEGORIAS
const despesasCategorias = [
  { nome: "Educação", valor: 500 },
  { nome: "Alimentação", valor: 300 },
  { nome: "Transporte", valor: 230 },
  { nome: "Academia", valor: 120 },
  { nome: "Outros", valor: 0 }
];

// DETALHES DE OUTROS
let outrosDetalhes = [];

let graficoDespesas = null;


// CRIAR GRAFICO DE DESPESAS
function criarGraficoDespesas() {

  const canvas = document.getElementById("graficoDespesas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const labels = despesasCategorias.map(c => c.nome);
  const valores = despesasCategorias.map(c => c.valor);

  const total = valores.reduce((soma, v) => soma + v, 0);

  // destruir gráfico antigo se existir
  if (graficoDespesas) {
    graficoDespesas.destroy();
  }

  graficoDespesas = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: [
          "#7b2ff7",
          "#ff6384",
          "#36a2eb",
          "#ffcd56",
          "#4bc0c0"
        ]
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {

              const valor = context.raw;

              const percentual = total > 0
                ? ((valor / total) * 100).toFixed(1)
                : 0;

              return `${context.label}: R$ ${valor} (${percentual}%)`;
            }
          }
        }
      }
    }
  });

  atualizarListaDespesas(total);
}


// ATUALIZAR LISTA
function atualizarListaDespesas(total) {

  const lista = document.getElementById("listaDespesas");

  if (!lista) return;

  lista.innerHTML = "";

  despesasCategorias.forEach(item => {

    const percentual = total > 0
      ? ((item.valor / total) * 100).toFixed(1)
      : 0;

    const li = document.createElement("li");

    li.innerHTML = `
      <span>${item.nome}</span>
      <strong>R$ ${item.valor} (${percentual}%)</strong>
    `;

    lista.appendChild(li);

    // mostrar detalhes de outros
    if (item.nome === "Outros" && outrosDetalhes.length > 0) {

      outrosDetalhes.forEach(d => {

        const sub = document.createElement("li");

        sub.style.fontSize = "14px";
        sub.style.marginLeft = "15px";

        sub.innerHTML = `• ${d.descricao} — R$ ${d.valor}`;

        lista.appendChild(sub);

      });

    }

  });

}


// ADICIONAR DESPESA EM OUTROS
function adicionarOutro() {

  const descricao = document.getElementById("descricaoOutro").value;
  const valor = Number(document.getElementById("valorOutro").value);

  if (!descricao || !valor) {

    alert("Preencha descrição e valor");

    return;
  }

  // salvar detalhe
  outrosDetalhes.push({
    descricao,
    valor
  });

  // atualizar valor da categoria
  const outros = despesasCategorias.find(c => c.nome === "Outros");

  outros.valor += valor;

  // limpar campos
  document.getElementById("descricaoOutro").value = "";
  document.getElementById("valorOutro").value = "";

  // atualizar gráfico
  criarGraficoDespesas();
}


// TROCAR ABAS
function showTab(id) {

  document.querySelectorAll(".tab").forEach(tab => {
    tab.style.display = "none";
  });

  const tab = document.getElementById(id);

  if (tab) {
    tab.style.display = "block";
  }

}


// INICIAR
document.addEventListener("DOMContentLoaded", () => {

  criarGraficoDespesas();

});

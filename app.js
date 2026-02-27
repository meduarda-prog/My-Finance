function showTab(id, btn) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav").forEach(b => {
    b.classList.remove("active");
  });

  btn.classList.add("active");
}


let despesas = [
  { categoria: "Educação", valor: 500, descricao: "Curso" },
  { categoria: "Alimentação", valor: 300, descricao: "Mercado" },
  { categoria: "Transporte", valor: 230, descricao: "Ônibus" },
  { categoria: "Outros", valor: 120, descricao: "Academia" }
];


function calcularCategorias() {
  const categorias = {};

  despesas.forEach(d => {
    categorias[d.categoria] = (categorias[d.categoria] || 0) + d.valor;
  });

  return categorias;
}


function criarGrafico(idCanvas) {
  const categorias = calcularCategorias();
  const labels = Object.keys(categorias);
  const valores = Object.values(categorias);

  const total = valores.reduce((a, b) => a + b, 0);

  return new Chart(document.getElementById(idCanvas), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: [
          "#7b2ff7",
          "#ff6384",
          "#36a2eb",
          "#ffcd56"
        ]
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function(ctx) {
              const valor = ctx.raw;
              const perc = ((valor / total) * 100).toFixed(1);
              return `${ctx.label}: R$ ${valor} (${perc}%)`;
            }
          }
        }
      }
    }
  });
}


function adicionarDespesa() {
  const desc = document.getElementById("descDespesa").value;
  const valor = Number(document.getElementById("valorDespesa").value);

  if (!desc || !valor) return;

  despesas.push({
    categoria: "Outros",
    valor,
    descricao: desc
  });

  document.getElementById("descDespesa").value = "";
  document.getElementById("valorDespesa").value = "";

  location.reload();
}

criarGrafico("graficoDashboard");
criarGrafico("graficoDespesas");

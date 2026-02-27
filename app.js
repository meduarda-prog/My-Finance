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

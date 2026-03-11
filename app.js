const hoje = new Date();
const mesAtual = hoje.getMonth();
const anoAtual = hoje.getFullYear();

const nomesMeses = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const nomeMes = nomesMeses[mesAtual];



document.addEventListener("DOMContentLoaded", () => {

  const mesElemento = document.querySelector(".mes");

  if (mesElemento) {
    mesElemento.innerText = nomeMes + " " + anoAtual;
  }

  showTab("dashboard");

  carregarDados();

});



const chaveMes = `financas_${anoAtual}_${mesAtual}`;





let despesasCategorias = [
  { nome: "Educação", valor: 0 },
  { nome: "Alimentação", valor: 0 },
  { nome: "Transporte", valor: 0 },
  { nome: "Academia", valor: 0 },
  { nome: "Outros", valor: 0 }
];

let outrosDetalhes = [];

let graficoDespesas = null;





function salvarDados() {

  const dados = {
    categorias: despesasCategorias,
    outros: outrosDetalhes
  };

  localStorage.setItem(chaveMes, JSON.stringify(dados));

}





function carregarDados() {

  const dadosSalvos = localStorage.getItem(chaveMes);

  if (dadosSalvos) {

    const dados = JSON.parse(dadosSalvos);

    despesasCategorias = dados.categorias;
    outrosDetalhes = dados.outros;

  }

  criarGraficoDespesas();

}





function criarGraficoDespesas() {

  const canvas = document.getElementById("graficoDespesas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const labels = despesasCategorias.map(c => c.nome);
  const valores = despesasCategorias.map(c => c.valor);

  const total = valores.reduce((soma,v)=> soma+v,0);

  if (graficoDespesas) {
    graficoDespesas.destroy();
  }

  graficoDespesas = new Chart(ctx,{

    type:"doughnut",

    data:{
      labels:labels,
      datasets:[{
        data:valores,
        backgroundColor:[
          "#7b2ff7",
          "#ff6384",
          "#36a2eb",
          "#ffcd56",
          "#4bc0c0"
        ]
      }]
    }

  });

  atualizarListaDespesas(total);

}





function atualizarListaDespesas(total){

  const lista = document.getElementById("listaDespesas");

  if(!lista) return;

  lista.innerHTML="";

  despesasCategorias.forEach(item=>{

    const percentual = total>0
      ?((item.valor/total)*100).toFixed(1)
      :0;

    const li = document.createElement("li");

    li.innerHTML=`
      <span>${item.nome}</span>
      <strong>R$ ${item.valor} (${percentual}%)</strong>
    `;

    lista.appendChild(li);

    if(item.nome==="Outros" && outrosDetalhes.length>0){

      outrosDetalhes.forEach(d=>{

        const sub = document.createElement("li");

        sub.style.fontSize="14px";
        sub.style.marginLeft="15px";

        sub.innerHTML=`• ${d.descricao} — R$ ${d.valor}`;

        lista.appendChild(sub);

      });

    }

  });

}





function adicionarOutro(){

  const descricao = document.getElementById("descricaoOutro").value;
  const valor = Number(document.getElementById("valorOutro").value);

  if(!descricao || !valor){
    alert("Preencha descrição e valor");
    return;
  }

  outrosDetalhes.push({descricao,valor});

  const outros = despesasCategorias.find(c=>c.nome==="Outros");

  outros.valor += valor;

  document.getElementById("descricaoOutro").value="";
  document.getElementById("valorOutro").value="";

  salvarDados();

  criarGraficoDespesas();

}





function showTab(id){

  document.querySelectorAll(".tab").forEach(tab=>{
    tab.style.display="none";
  });

  const tab = document.getElementById(id);

  if(tab){
    tab.style.display="block";
  }

}

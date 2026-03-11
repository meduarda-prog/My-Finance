let categorias = [
{nome:"Educação",valor:0},
{nome:"Alimentação",valor:0},
{nome:"Transporte",valor:0},
{nome:"Academia",valor:0},
{nome:"Outros",valor:0}
];

let grafico;

document.addEventListener("DOMContentLoaded",()=>{

// mês automático
const hoje = new Date();

const meses = [
"Janeiro","Fevereiro","Março","Abril","Maio","Junho",
"Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

document.getElementById("mes").innerText =
meses[hoje.getMonth()] + " " + hoje.getFullYear();

showTab("dashboard");

criarGrafico();

atualizarLista();

});

function showTab(id){

document.querySelectorAll(".tab").forEach(t=>{
t.style.display="none";
});

document.getElementById(id).style.display="block";

}

function criarGrafico(){

const ctx = document.getElementById("grafico");

grafico = new Chart(ctx,{

type:"doughnut",

data:{
labels:categorias.map(c=>c.nome),

datasets:[{
data:categorias.map(c=>c.valor)
}]
}

});

}

function atualizarLista(){

const lista = document.getElementById("lista");

lista.innerHTML="";

categorias.forEach((cat,i)=>{

const li = document.createElement("li");

li.innerText = cat.nome + " - R$ " + cat.valor;

li.onclick = ()=>editar(i);

lista.appendChild(li);

});

grafico.data.datasets[0].data =
categorias.map(c=>c.valor);

grafico.update();

}

function editar(i){

let valor = prompt("Digite valor para "+categorias[i].nome);

if(valor===null) return;

valor = Number(valor);

if(isNaN(valor)) return;

categorias[i].valor = valor;

atualizarLista();

}

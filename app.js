let grafico;

let categorias = [
{nome:"Educação",valor:0},
{nome:"Alimentação",valor:0},
{nome:"Transporte",valor:0},
{nome:"Academia",valor:0},
{nome:"Outros",valor:0}
];


document.addEventListener("DOMContentLoaded",()=>{

const hoje = new Date();

const meses=[
"Janeiro","Fevereiro","Março","Abril","Maio","Junho",
"Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

document.querySelector(".mes").innerText =
meses[hoje.getMonth()]+" "+hoje.getFullYear();

showTab("dashboard");

criarGrafico();

atualizarInterface();

});



function showTab(id){

document.querySelectorAll(".tab").forEach(tab=>{
tab.style.display="none";
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

data:categorias.map(c=>c.valor),

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

}



function atualizarInterface(){

const lista=document.getElementById("listaCategorias");

lista.innerHTML="";

categorias.forEach((cat,i)=>{

const li=document.createElement("li");

li.innerText=cat.nome+" — R$ "+cat.valor;

li.onclick=()=>editarValor(i);

lista.appendChild(li);

});

grafico.data.datasets[0].data=
categorias.map(c=>c.valor);

grafico.update();

const total= categorias.reduce((s,v)=>s+v.valor,0);

document.getElementById("totalDespesas").innerText="R$ "+total;

}



function editarValor(index){

let valor = prompt("Digite o valor para "+categorias[index].nome);

if(valor===null) return;

valor = Number(valor);

if(isNaN(valor)) return;

categorias[index].valor=valor;

atualizarInterface();

}

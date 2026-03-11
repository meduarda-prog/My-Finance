const hoje = new Date();

const meses = [
"Janeiro","Fevereiro","Março","Abril","Maio","Junho",
"Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const mesAtual = meses[hoje.getMonth()] + " " + hoje.getFullYear();

document.querySelector(".mes").innerText = mesAtual;



let categorias = [
{nome:"Educação",valor:0},
{nome:"Alimentação",valor:0},
{nome:"Transporte",valor:0},
{nome:"Academia",valor:0},
{nome:"Outros",valor:0}
];



const ctx = document.getElementById("grafico");

let grafico = new Chart(ctx,{

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



function atualizarInterface(){

const lista = document.getElementById("listaCategorias");

lista.innerHTML="";

categorias.forEach((cat,i)=>{

const li=document.createElement("li");

li.innerText = cat.nome + " — R$ " + cat.valor;

li.onclick=()=>editarValor(i);

lista.appendChild(li);

});



grafico.data.datasets[0].data = categorias.map(c=>c.valor);

grafico.update();



const totalDespesas = categorias.reduce((s,v)=>s+v.valor,0);

document.getElementById("despesaTotal").innerText="R$ "+totalDespesas;

}



function editarValor(index){

let novo = prompt("Digite o valor para "+categorias[index].nome);

if(novo===null) return;

novo = Number(novo);

if(isNaN(novo)) return;

categorias[index].valor = novo;

atualizarInterface();

}



atualizarInterface();

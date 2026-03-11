const hoje = new Date();

const mesAtual = hoje.getMonth();

const anoAtual = hoje.getFullYear();

const nomesMeses = [
"Janeiro","Fevereiro","Março","Abril","Maio","Junho",
"Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const nomeMes = nomesMeses[mesAtual];

let receitas = [];

let despesasCategorias = [
{nome:"Educação",valor:0},
{nome:"Alimentação",valor:0},
{nome:"Transporte",valor:0},
{nome:"Academia",valor:0},
{nome:"Outros",valor:0}
];

let grafico;



document.addEventListener("DOMContentLoaded",()=>{

document.querySelector(".mes").innerText =
nomeMes+" "+anoAtual;

showTab("dashboard");

criarGrafico();

});



function showTab(id){

document.querySelectorAll(".tab").forEach(tab=>{

tab.style.display="none";

});

document.getElementById(id).style.display="block";

}



function adicionarReceita(){

const descricao =
document.getElementById("descricaoReceita").value;

const valor =
Number(document.getElementById("valorReceita").value);

if(!descricao || !valor){

alert("Preencha os campos");

return;

}

receitas.push({descricao,valor});

document.getElementById("descricaoReceita").value="";
document.getElementById("valorReceita").value="";

atualizarResumo();

}



function adicionarDespesa(){

const descricao =
document.getElementById("descricaoDespesa").value;

const valor =
Number(document.getElementById("valorDespesa").value);

const categoria =
document.getElementById("categoriaDespesa").value;

if(!descricao || !valor){

alert("Preencha os campos");

return;

}

const cat =
despesasCategorias.find(c=>c.nome===categoria);

cat.valor += valor;

document.getElementById("descricaoDespesa").value="";
document.getElementById("valorDespesa").value="";

criarGrafico();

atualizarResumo();

}



function atualizarResumo(){

const totalReceitas =
receitas.reduce((soma,r)=>soma+r.valor,0);

const totalDespesas =
despesasCategorias.reduce((soma,d)=>soma+d.valor,0);

const saldo =
totalReceitas-totalDespesas;

document.getElementById("totalReceitas").innerText =
"R$ "+totalReceitas;

document.getElementById("totalDespesas").innerText =
"R$ "+totalDespesas;

document.getElementById("saldoTotal").innerText =
"R$ "+saldo;

}



function criarGrafico(){

const ctx =
document.getElementById("graficoDespesas");

if(!ctx) return;

const labels =
despesasCategorias.map(c=>c.nome);

const valores =
despesasCategorias.map(c=>c.valor);

if(grafico){
grafico.destroy();
}

grafico = new Chart(ctx,{

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

}

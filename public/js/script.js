
//faz a busca sequecial dos dados 
function busca(vetor, mes){
    cont = 0;
    for(i=0; i<vetor.length; i++){
        if(mes == vetor[i]){   
            cont += 1
        }
    }  
    return cont
}

//função preenche array com a quantidade de vezes
function preenche(mes=[] ,vet = []){
    //preenche o array com os dados pesquisados
    for(j=0; j<mes.length; j++){
        if(mes[j]== 'janeiro'){
            vet[0] = busca(mes, mes[j])
        }else
        if(mes[j]== 'fevereiro'){
            vet[1] = busca(mes, mes[j])
        }else
        if(mes[j]== 'março'){
            vet[2] = busca(mes, mes[j])
        }else
        if(mes[j]== 'abril'){
            vet[3] = busca(mes, mes[j])
        }else
        if(mes[j]== 'maio'){
            vet[4] = busca(mes, mes[j])
        }else
        if(mes[j]== 'junho'){
            vet[5] = busca(mes, mes[j])
        }else
        if(mes[j]== 'julho'){
            vet[6] = busca(mes, mes[j])
        }else
        if(mes[j]== 'agosto'){
            vet[7] = busca(mes, mes[j])
        }else
        if(mes[j]== 'setembro'){
            vet[8] = busca(mes, mes[j])
        }else
        if(mes[j]== 'outubro'){
            vet[9] = busca(mes, mes[j])
        }else
        if(mes[j]== 'novembro'){
            vet[10] = busca(mes, mes[j])
        }else
        if(mes[j]== 'dezembro'){
            vet[11] = busca(mes, mes[j])
        }
    }

    //organiza os dados no array
    j=0;
    while( j < 12){
        if(vet[j] == '' || vet[j] ==undefined){
            vet[j]=0;
        }
        j++;
    }
    return vet;
}

$(document).ready(function () {

  //Barra de progresso
  var user=[], post=[];
    $('.carousel').carousel({
        interval: 3000
    });
    $('.carousel').carousel('next');


  //Pegando os meses
  mes = document.querySelectorAll('.postagens_mes')
  usu_mes = document.querySelectorAll('.usuarios_mes')

    //converte numero em meses
    const meses ={
      01: 'janeiro',
      02: 'fevereiro',
      03: 'março',
      04: 'abril',
      05: 'maio',
      06: 'junho',
      07: 'julho',
      08: 'agosto',
      09: 'setembro',
      10: 'outubro',
      11: 'novembro',
      12: 'dezembro',
    }

    //postagens
    let i = 0;
    var a = [], a1=[],m=[], m1=[];
    while(i < mes.length){
      a[i]  = mes[i].value;
      m[i]  = meses[parseInt(a[i])]
      i++;
    }
    post = preenche(m, post) //passa o vetor com a quantidade de posts

    //usuarios
    i=0;
    while(i< usu_mes.length){
      a1[i]  = usu_mes[i].value;
      m1[i] = meses[parseInt(a1[i])]
      i++;
    }
    user = preenche(m1, user) //passa o vetor com a quantidade de usuarios

    
    //circulo
    let usuario = document.getElementById('user');
    usuario = usuario.value;

    let postagens = document.getElementById('post');
    postagens =postagens.value;

    let categorias = document.getElementById('category');
    categorias =categorias.value;
    
    let c1 = document.getElementById('circulo1');
    let circulo1 = new ProgressBar.Circle(c1, {
        color:'#6aDAF9', //cor
        strokeWidth: 8, //largura
        duration: 1400, //duração
        from:{color:'#AAA'}, //Como começa a cor
        to: {color:'#6aDAF9'}, //Como termina
        step: function(state, circle){
            circle.path.setAttribute('stroke', state.color);
            let value = Math.round(usuario);
            circle.setText(value);
        }
    });
    let c2 = document.getElementById('circulo2');
    let circulo2 = new ProgressBar.Circle(c2, {
        color:'#6aDAF9', //cor
        strokeWidth: 8, //largura
        duration: 1400, //duração
        from:{color:'#AAA'}, //Como começa a cor
        to: {color:'#6aDAF9'}, //Como termina
        step: function(state, circle){
            circle.path.setAttribute('stroke', state.color);
            let value = Math.round(postagens);
            circle.setText(value);   
        }

    });

    let c3 = document.getElementById('circulo3');
    let circulo3 = new ProgressBar.Circle(c3, {
        color:'#6aDAF9', //cor
        strokeWidth: 8, //largura
        duration: 1400, //duração
        from:{color:'#AAA'}, //Como começa a cor
        to: {color:'#6aDAF9'}, //Como termina
        step: function(state, circle){
            circle.path.setAttribute('stroke', state.color);
            let value = Math.round(categorias);
            circle.setText(value);
        }

    });

    circulo1.animate(1.0)
    circulo2.animate(1.0)
    circulo3.animate(1.0)


//Gráfico
const labels = [
'janeiro',
'fevereiro',
'março',
'abril',
'maio',
'junho',
'julho',
'agosto',
'setembro',
'outubro',
'novembro',
'dezembro',
];

const data = {
  labels: labels,
  datasets: [{
    label: 'Usuários',
    backgroundColor: 'rgb(43, 255, 30)',
    borderColor: 'rgb(43, 255, 30)',
    data: []
  },

  {
    label: 'Postagens',
    backgroundColor: 'rgb(255, 0, 0)',
    borderColor: 'rgb(255, 0, 0)',
    data: [],
  }

]
};


const config = {
  type: 'line',
  data: data,
  options: {}
};

const myChart = new Chart(
  document.getElementById('myChart'),
  config
);

//usuarios
myChart.data.datasets[0].data = user;

//postagens
myChart.data.datasets[1].data = post;
myChart.update();

});




//Mostrar e esconder botão
var buttonB = document.getElementById('btn-editar')


function clica(id){
        var comentario = document.getElementById(id) //div comentario
        var but = document.getElementById('btn-confirma')
        comentario.classList.toggle('hide'); //tira ou coloca a classe hide do
        but.classList.toggle('hide');//Esconde o botão 
}

//pegando total de páginas e publicações
const bt = document.querySelector('#send')
ntotalpagina = ''; //total de páginas
ntotal = '';////numero total das publicações
bt.addEventListener('click', function(e){
    var numtotalpagina = document.querySelector('#numtotalpagina')
    var numtotal = document.querySelector('#numtotal') 
    ntotalpagina = numtotalpagina.value
    ntotal = numtotal.value;
})
bt.click();//faz o envio automático do formulário.

//pega o total de paginas e cria a paginação
    for(i =0; i<ntotalpagina; i++){
        document.getElementById('paginacao').innerHTML +=
        '<li class="page-item"> '+
            '<form method="post" action="">'+
                '<input type="hidden" name="valor" value='+ ' "'+ (i) + '" ' + '/>' +           
                '<button  class="page-link" type="submit" >' + (i+1) + '</button>'+
            '</form>'+
        '</li>'
    }

//função retroceder
function voltar() {
  window.history.back()
}


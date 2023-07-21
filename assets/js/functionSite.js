//Google Login 
//decodifica o jwt
var tokenUser = null;
function jwtDecode (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function loginCallback(resp) {
  // Decodifica o token e obtém as informações do usuário logado
  cred = jwtDecode(resp.credential);

  // Salva o token inteiro no localStorage
  // Cuidado, esse token é mutável, não pode ser usado como chave no banco
  localStorage.setItem("gauth-token", resp.credential);

  // Configura o status do login e a variável tokenUser
  setLoginStatus(cred);

  // Agora que setLoginStatus() foi chamada e a variável tokenUser está definida,
  // podemos chamar a função updateListBoletim()
  updateListBoletim();
  updateListProblema();
}



function logout(){
    localStorage.setItem("gauth-token", undefined);
    document.querySelector(".g_id_logado").innerHTML = "";
    document.querySelector(".g_id_signin").style.display = 'block';
    document.getElementById('boletimNavBar').innerHTML = "";
    document.getElementById('problemaNavBar').innerHTML = "";
    window.location.replace("index.html")
}

function setLoginStatus(cred){
    tokenUser = cred.sub;
    //esconde o botao de login do google
    document.querySelector(".g_id_signin").style.display = 'none';
    //mostra o usuario logado
    html = `<div class='g_login'>
                <img class='g_pic' src="${cred.picture}">
                <span><div class='g_name'>${cred.given_name} ${cred.family_name}</div><div class='g_email'>${cred.email}</div></span>
                <a href='#' onclick='logout()'><img src="assets/imagens/fechar.png" alt="Sair da conta"/></a>
            </div>`
    document.querySelector(".g_id_logado").innerHTML = html;
    //Mostra as opções de cadastrar Problema e Boletim ao usuario logado 
    var problemaNavBar = document.getElementById('problemaNavBar');
    problemaNavBar.innerHTML = `<div class="nav-item"><a class="nav-link active px-lg-3 py-1 py-lg-1" href="cadastrarProblema.html">Cadastrar Problema</a></div>`
    if(tokenUser == "110955377050310839557" || tokenUser == "114600802078895812317"){
        var boletimNavBar = document.getElementById('boletimNavBar');
        boletimNavBar.innerHTML = `<div class="nav-item"><a class="nav-link active px-lg-3 py-1 py-lg-1" href="cadastrarBoletim.html">Cadastrar Boletim</a></div>`
    }
  updateListUserProblema();
  updateListUserBoletim();
}

//ao carregar a pagina, verifica se ja esta logado
window.addEventListener("load",() => {
    if (localStorage.getItem("gauth-token") != undefined){
        //se houver um token salvo
        cred = jwtDecode(localStorage.getItem("gauth-token"));
        //descriptografa e mostra o usuario logado
        setLoginStatus(cred);
    }
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

// enviando dados para o back-end

var URL_BASE = "http://localhost:8080/"
var URL_EDIT = null;

function saveBoletim(){
   
  var validar = ["tipo_problema_boletim", "cep_boletim", "cidade_boletim", "estado_boletim", "logradouro_boletim", "previsao_boletim", "desc_boletim", "bairro_boletim"];

  var formValido = true;

  //cada campo a ser validado
  validar.forEach(function(campo) {
      var elemento = document.getElementById(campo);
      var feedbackElemento = document.querySelector(`#${campo} + .invalid-feedback`);

      if (elemento.value.trim() === "") {
          elemento.classList.add("is-invalid");
          feedbackElemento.style.display = "block";
          formValido = false;
      } else {
          elemento.classList.remove("is-invalid");
          elemento.classList.add("is-valid");
          feedbackElemento.style.display = "none";
      }
  });

 
  if (formValido) {

    //captura os dados do form, já colocando como um JSON
    dados = $('#tipo_problema_boletim,#cep_boletim,#cidade_boletim,#estado_boletim,#logradouro_boletim,#bairro_boletim,#desc_boletim,#token_user_boletim,#previsao_boletim, #previsao_boletim').serializeJSON();
    dados['token_user_boletim'] = tokenUser;

      if (URL_EDIT != null) {
        //envia para a url do objeto
        url = URL_EDIT;
        method = "PUT";
      } else {
        //caso contrário, envia para a url de salvar
        url = URL_BASE + "boletim/";
        method = "POST";
      }

    //envia para o backend
    $.ajax(url, {
        data: JSON.stringify(dados),
        method: method,
        contentType: "application/json",
      }).done(function (res) {
        URL_EDIT = URL_BASE + "boletim/" + res.id_boletim

        updateListBoletim();
      }).fail(function (res) {
        console.log(res);
      });
      var confirmacaoBoletim = confirm("Boletim Publicado!");
        if (confirmacaoBoletim) {
        location.reload();
        }
  }
}

function editBoletim(url) {
    url = URL_BASE + url
    // Primeiro, solicita as informações do problema ao backend
    $.ajax(url, {
      method: 'GET',
    }).done(function(res) {
      // Preenche os campos do formulário com os dados retornados
      $('#tipo_problema_boletim').val(res.tipo_problema_boletim);
      $('#cep_boletim').val(res.cep_boletim);
      $('#cidade_boletim').val(res.cidade_boletim);
      $('#estado_boletim').val(res.estado_boletim);
      $('#logradouro_boletim').val(res.logradouro_boletim);
      $('#previsao_boletim').val(res.previsao_boletim);
      $('#bairro_boletim').val(res.bairro_boletim);
      $('#desc_boletim').val(res.desc_boletim);
      
      // Armazena a URL do objeto que está sendo editado
      URL_EDIT = url;
    });
}
 
function updateListBoletim() {
  $.ajax(URL_BASE + "boletim/", {
    method: 'get',
  }).done(function (res) {
    let table = $('#tableContentBoletimHome');
    table.html("");

    // Ordenar o array res em ordem decrescente com base na propriedade id_boletim
    res.sort(function (a, b) {
      return b.id_boletim - a.id_boletim;
    });

    $(res).each(function (k, el) {
      let resItem = el;
      const div = $(`
        <div class="card-body">
        <h4 class="card-title">${resItem.tipo_problema_boletim} - Previsão: ${resItem.previsao_boletim}h</h4>
        <p class="card-text">${resItem.desc_boletim}</p>
        <p class="card-text"><small class="text-body-secondary">${resItem.logradouro_boletim} - ${resItem.bairro_boletim}, ${resItem.cidade_boletim}/${resItem.estado_boletim} - Cep: ${resItem.cep_boletim}</small></p></div>`);
      div.append(`<br/><hr>`);
      table.append(div);
    });

  }).fail(function (res) {
    let table = $('#tableContentBoletimHome');
    table.html("");
    const tr = $(`<div class="card-body"><p colspan='4'>Não foi possível carregar a lista</p></div>`);
    table.append(tr);
  });
}


function updateListUserBoletim() {
  $.ajax(URL_BASE + "boletim/", {
    method: 'get',
  }).done(function (res) {
    let table = $('#tableContentBoletim');
    table.html("");

    // Filtrar os problemas relevantes ao tokenUser usando Array.filter()
    const boletimUsuario = res.filter((res) => res.token_user_boletim === tokenUser);

    // Ordenar os boletins em ordem decrescente com base na propriedade id_boletim
    boletimUsuario.sort(function (a, b) {
      return b.id_boletim - a.id_boletim;
    });

    boletimUsuario.forEach(function (res) {
      const div = $(`
        <div class="card-body">
        <h1 class="centraliza">Boletins Informativos</h1>
        <h4 class="card-title">${res.tipo_problema_boletim} - Previsão: ${res.previsao_boletim}h</h4>
        <p class="card-text">${res.desc_boletim}</p>
        <p class="card-text"><small class="text-body-secondary">${res.logradouro_boletim} - ${res.bairro_boletim}, ${res.cidade_boletim}/${res.estado_boletim} - Cep: ${res.cep_boletim}</small></p></div>`);
        if (tokenUser === res.token_user_boletim) {
          div.append(`
            <button class="btn btn-primary"><a href="#" class="configuraBotao" onclick="editBoletim('boletim/${res.id_boletim}')">Editar</a></button>
            <button class="btn btn-danger"><a href="#" class="configuraBotao" onclick="delBoletim('boletim/${res.id_boletim}')">Deletar</a></button>
          `);
        }
      div.append(`<br/><hr>`);
      table.append(div);
    });

  }).fail(function (res) {
    let table = $('#tableContentBoletim');
    table.html("");
    const tr = $(`<div class="card-body"><p colspan='4'>Não foi possível carregar a lista</p></div>`);
    table.append(tr);
  });
}


function delBoletim(url){
  if (confirm("Deseja realmente deletar esse registro?")){
    //envia para o backend
    $.ajax({
    url: URL_BASE + url, // URL do endpoint da API
    method: 'DELETE', // Método HTTP DELETE
    }).done(function(res) {
    console.log('Objeto deletado com sucesso');
    // Faça algo após a exclusão do objeto
    updateListBoletim();
    }).fail(function(error) {
      console.error('Erro ao deletar objeto:', error);
      // Lida com possíveis erros na exclusão do objeto
    console.log(res);
    });
  }
}

var tipo_do_problema_boletim;

function buscarBoletim(parametro_boletim) {

  var seachBoletim = document.getElementById("tipo_problema_boletim");

  if(parametro_boletim != ""){ 
  tipo_do_problema_boletim = parametro_boletim; // Atribui o valor do parâmetro à variável tipo_do_problema_boletim
  seachBoletim.classList.remove("is-invalid");
  seachBoletim.classList.add("is-valid");

  $.ajax(URL_BASE + "boletim/", {
    method: 'get',
  }).done(function (res) {
    let table = $('#tableContentBoletimBuscar');
    table.html("");

    $(res).each(function (k, el) {
      let res = el;

      // Realiza a comparação entre tipo_do_problema_boletim e res.tipo_problema
      if (tipo_do_problema_boletim === res.tipo_problema_boletim) {
        let res = el;
        const div = $(`
          <div class="card-body">
          <h1 class="centraliza">Boletins relatados:</h1>
          <h4 class="card-title">${res.tipo_problema_boletim} - Previsão: ${res.previsao_boletim}h</h4>
          <p class="card-text">${res.desc_boletim}</p>
          <p class="card-text"><small class="text-body-secondary">${res.logradouro_boletim} - ${res.bairro_boletim}, ${res.cidade_boletim}/${res.estado_boletim} - Cep: ${res.cep_boletim}</small></p></div>`);
          if (tokenUser === res.token_user_boletim) {
            div.append(`
            <button class="btn btn-primary"><a href="#" class="configuraBotao" onclick="editBoletim('boletim/${res.id_boletim}')">Editar</a></button>
            <button class="btn btn-danger"><a href="#" class="configuraBotao" onclick="delBoletim('boletim/${res.id_boletim}')">Deletar</a></button>
          `);
        }
        div.append(`</hr>`);
        table.append(div);
      }
    });

    parametro_boletim = '';

    }).fail(function (res) {
      let table = $('#tableContentBoletimBuscar');
      table.html("");
      const tr = $(`<div class="card-body"><p colspan='4'>Não foi possível carregar a lista</p></div>`);
      table.append(tr);
    });
  }else{
    seachBoletim.classList.add("is-invalid");
  }
}

function resetFormulario() {
  // Limpar todos os campos do formulário
  document.getElementById("formBoletim").reset();

  // Limpar as classes de feedback de erro
  var camposInvalidos = document.querySelectorAll(".is-invalid");
  camposInvalidos.forEach(function (campo) {
      campo.classList.remove("is-invalid");
  });

  // Limpar as classes de feedback de sucesso
  var camposValidos = document.querySelectorAll(".is-valid");
  camposValidos.forEach(function (campo) {
      campo.classList.remove("is-valid");
  });

  // Esconder as mensagens de feedback de erro
  var feedbacks = document.querySelectorAll(".invalid-feedback");
  feedbacks.forEach(function (feedback) {
      feedback.style.display = "none";
  });
}


//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function saveProblema() {
  var camposAValidar = ["tipo_problema", "foto", "cep_problema", "cidade_problema", "estado_problema", "logradouro_problema", "numero_rua_problema", "bairro_problema", "desc_problema"];

  var formValido = true;

  // Iterar por cada campo a ser validado
  camposAValidar.forEach(function(campo) {
      var elemento = document.getElementById(campo);
      var feedbackElemento = document.querySelector(`#${campo} + .invalid-feedback`);

      if (elemento.value.trim() === "") {
          elemento.classList.add("is-invalid");
          feedbackElemento.style.display = "block";
          formValido = false;
      } else {
          elemento.classList.remove("is-invalid");
          elemento.classList.add("is-valid");
          feedbackElemento.style.display = "none";
      }
  });

  // Verificar o tamanho da imagem selecionada
  var fileInput = document.getElementById('foto');
  var file = fileInput.files[0];
  const maxSizeInBytes = 3 * 1024 * 1024; // 5 MB

  if (file && file.size > maxSizeInBytes) {
    var feedbackElemento = document.querySelector("#foto + .invalid-feedback");
    feedbackElemento.textContent = "O tamanho da imagem excede o limite de 3MB.";
    fileInput.classList.add("is-invalid");
    feedbackElemento.style.display = "block";
    formValido = false;
  }

  if (formValido) {

  const fileInput = document.getElementById('foto');
  const file = fileInput.files[0];
  

  convertImageToString(file)
    .then(base64String => {

      //captura os dados do form, já colocando como um JSON
      dados = $('#tipo_problema,#cep_problema,#cidade_problema,#estado_problema,#logradouro_problema,#numero_rua_problema,#bairro_problema,#desc_problema,#token_user_problema').serializeJSON();
      dados['token_user_problema'] = tokenUser;
      dados['foto'] = base64String; // Atribui a string base64 no campo 'foto'

      console.log(dados);

      if (URL_EDIT != null) {
        //envia para a url do objeto
        url = URL_EDIT;
        method = "PUT";
      } else {
        //caso contrário, envia para a url de salvar
        url = URL_BASE + "problema/";
        method = "POST";
      }

      //envia para o backend
      $.ajax(url, {
        data: JSON.stringify(dados),
        method: method,
        contentType: "application/json",
      }).done(function (res) {
        URL_EDIT = URL_BASE + "problema/" + res.id_problema

        updateListProblema();
      }).fail(function (res) {
        console.log(res);
      });
      var confirmacaoProblema = confirm("Problema Publicado!");
      if (confirmacaoProblema) {
      location.reload();
      }
    })
    .catch(error => {
      console.error('Erro ao converter imagem:', error);
    });
  }
}

function updateListProblema() {
  $.ajax(URL_BASE + "problema/", {
    method: 'get',
  }).done(function (res) {
    let table = $('#tableContentProblemaHome');
    table.html("");

    // Ordenar o array res em ordem decrescente com base na propriedade id_problema
    res.sort(function (a, b) {
      return b.id_problema - a.id_problema;
    });

    $(res).each(function (k, el) {
      let resItem = el;
      const div = $(`
        <div class="card-body">
        <h4 class="card-title">${resItem.tipo_problema}</h4>
        <p class="card-text">${resItem.desc_problema}</p>`);
        const img = $('<img>'); // Criar um elemento <img>
        img.attr('src', `data:image/png;base64, ${resItem.foto}`); // Definir a fonte da imagem como a string base64
        img.addClass('img-postagem'); // Adicionar a classe para estilização (se necessário)
        div.append(img); // Adicionar a imagem à div
        div.append(`<p class="card-tex"><small class="text-body-secondary">${resItem.logradouro_problema}, N° ${resItem.numero_rua_problema} - ${resItem.bairro_problema}, ${resItem.cidade_problema}/${resItem.estado_problema} - Cep: ${resItem.cep_problema}</small></p></div><br/><hr>`);
        table.append(div);
    });

  }).fail(function (res) {
    let table = $('#tableContentProblemaHome');
    table.html("");
    const tr = $(`<div class="card-body"><p colspan='4'>Não foi possível carregar a lista</p></div>`);
    table.append(tr);
  });
}


function updateListUserProblema() {
  $.ajax(URL_BASE + "problema/", {
    method: 'get',
  }).done(function (res) {
    let table = $('#tableContentProblema');
    table.html("");

    // Filtrar os problemas relevantes ao tokenUser usando Array.filter()
    const problemasUsuario = res.filter((res) => res.token_user_problema === tokenUser);

    // Ordenar os problemas em ordem decrescente com base na propriedade id_problema
    problemasUsuario.sort(function (a, b) {
      return b.id_problema - a.id_problema;
    });

    problemasUsuario.forEach(function (res) {
      const div = $(`
          <div class="card-body">
          <h1 class="centraliza">Problemas dos Usuários</h1>
          <h4 class="card-title">${res.tipo_problema}</h4>
          <p class="card-text">${res.desc_problema}</p>`);
          const img = $('<img>'); // Criar um elemento <img>
          img.attr('src', `data:image/png;base64, ${res.foto}`); // Definir a fonte da imagem como a string base64
          img.addClass('img-postagem'); // Adicionar a classe para estilização (se necessário)
          div.append(img); // Adicionar a imagem à div
          div.append(`<p class="card-tex"><small class="text-body-secondary">${res.logradouro_problema}, N° ${res.numero_rua_problema} - ${res.bairro_problema}, ${res.cidade_problema}/${res.estado_problema} - Cep: ${res.cep_problema}</small></p></div>`);
          if (tokenUser === res.token_user_problema) {
            div.append(`
              <button class="btn btn-primary"><a href="#" class="configuraBotao" onclick="editProblema('problema/${res.id_problema}')">Editar</a></button>
              <button class="btn btn-danger"><a href="#" class="configuraBotao" onclick="delProblema('problema/${res.id_problema}')">Deletar</a></button>
            `);
          }
      div.append(`<br/><hr>`);
      table.append(div);
    });

  }).fail(function (res) {
    let table = $('#tableContentProblema');
    table.html("");
    const tr = $(`<div class="card-body"><p colspan='4'>Não foi possível carregar a lista</p></div>`);
    table.append(tr);
  });
}


$(document).ready(function() {
    $('#formBuscaProblema').submit(function(event) {
      event.preventDefault(); // Impede o envio padrão do formulário
  
      const parametro_problema = $('#tipo_problema').val(); // Obtém o valor do campo de busca
  
      buscarProblema(parametro_problema); // Chama a função buscar com o valor do parâmetro
    });
});

var tipo_do_problema;

function buscarProblema(parametro_problema) {

  var seachProblema = document.getElementById("tipo_problema");

  if(parametro_problema != ""){ 

    tipo_do_problema = parametro_problema; // Atribui o valor do parâmetro à variável tipo_do_problema
    seachProblema.classList.remove("is-invalid");
    seachProblema.classList.add("is-valid");
  
    $.ajax(URL_BASE + "problema/", {
      method: 'get',
    }).done(function (res) {
      let table = $('#tableContentProblemaBuscar');
      table.html("");
  
      $(res).each(function (k, el) {
        let res = el;
  
        // Realiza a comparação entre tipo_do_problema e res.tipo_problema
        if (tipo_do_problema === res.tipo_problema) {
          const div = $(`<div class="card-body">
          <h1 class="centraliza">Problemas relatados</h1>
          <h4 class="card-title">${res.tipo_problema}</h4>
          <p class="card-text">${res.desc_problema}</p>`);
          const img = $('<img>'); // Criar um elemento <img>
          img.attr('src', `data:image/png;base64, ${res.foto}`); // Definir a fonte da imagem como a string base64
          img.addClass('img-postagem'); // Adicionar a classe para estilização (se necessário)
          div.append(img); // Adicionar a imagem à div
          div.append(`<p class="card-tex"><small class="text-body-secondary">${res.logradouro_problema}, N° ${res.numero_rua_problema} - ${res.bairro_problema}, ${res.cidade_problema}/${res.estado_problema} - Cep: ${res.cep_problema}</small></p></div>`);
          if (tokenUser === res.token_user_problema) {
          div.append(`<button class="btn btn-primary"><a href="#" class="configuraBotao" onclick="editProblema('problema/${res.id_problema}')">Editar</a></button>
              <button class="btn btn-danger"><a href="#" class="configuraBotao" onclick="delProblema('problema/${res.id_problema}')">Deletar</a></button>`);
          }
          div.append(`<br/><hr>`);
          table.append(div);
        }
      });
  
      parametro_boletim = '';
  
    }).fail(function (res) {
      let table = $('#tableContentProblemaBuscar');
      table.html("");
      const tr = $(`<div class="card-body"><p colspan='4'>Não foi possível carregar a lista</p></div>`);
      table.append(tr);
    });
  }else{
    seachProblema.classList.add("is-invalid");
  }
}

$(document).ready(function() {
  $('#formBuscaBoletim').submit(function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
  
    const parametro_boletim = $('#tipo_problema_boletim').val(); // Obtém o valor do campo de busca
  
    buscarBoletim(parametro_boletim); // Chama a função buscar com o valor do parâmetro
  });
});

function editProblema(url) {
    url = URL_BASE + url
    // Primeiro, solicita as informações do problema ao backend
    $.ajax(url, {
      method: 'GET',
    }).done(function(res) {
      // Preenche os campos do formulário com os dados retornados
      $('#tipo_problema').val(res.tipo_problema);
      $('#cep_problema').val(res.cep_problema);
      $('#cidade_problema').val(res.cidade_problema);
      $('#estado_problema').val(res.estado_problema);
      $('#logradouro_problema').val(res.logradouro_problema);
      $('#numero_rua_problema').val(res.numero_rua_problema);
      $('#bairro_problema').val(res.bairro_problema);
      $('#desc_problema').val(res.desc_problema);
      
      // Armazena a URL do objeto que está sendo editado
      URL_EDIT = url;
    });
}
  
function delProblema(url){
    if (confirm("Deseja realmente deletar esse registro?")){
      //envia para o backend
      $.ajax({
        url: URL_BASE + url, // URL do endpoint da API
            method: 'DELETE', // Método HTTP DELETE
          }).done(function(res) {
            console.log('Objeto deletado com sucesso');
            // Faça algo após a exclusão do objeto
            updateListProblema();
          }).fail(function(error) {
            console.error('Erro ao deletar objeto:', error);
            // Lida com possíveis erros na exclusão do objeto
            console.log(res);
          });
  }
}

function convertImageToString(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function () {
          const arrayBuffer = reader.result;
          const byteArray = new Uint8Array(arrayBuffer);
          const binaryString = byteArray.reduce((data, byte) => data + String.fromCharCode(byte), '');
          
          resolve(btoa(binaryString)); // Converte para base64
        };

        reader.onerror = function (error) {
          reject(error);
        };
        
        reader.readAsArrayBuffer(file);
      });
    }
    
    function convertStringToImage(base64String) {
      const img = document.createElement('img');
    img.src = `data:image/png;base64,${base64String}`;
    return img;
}

function convertImageToString(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function () {
      const arrayBuffer = reader.result;
      const byteArray = new Uint8Array(arrayBuffer);
      const binaryString = byteArray.reduce((data, byte) => data + String.fromCharCode(byte), '');
      
      resolve(btoa(binaryString)); // Converte para base64
    };
    
    reader.onerror = function (error) {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}
function resetFormulario() {
  // Limpar todos os campos do formulário
  document.getElementById("formProblema").reset();

  // Limpar as classes de feedback de erro
  var camposInvalidos = document.querySelectorAll(".is-invalid");
  camposInvalidos.forEach(function (campo) {
      campo.classList.remove("is-invalid");
  });

  // Limpar as classes de feedback de sucesso
  var camposValidos = document.querySelectorAll(".is-valid");
  camposValidos.forEach(function (campo) {
      campo.classList.remove("is-valid");
  });

  // Esconder as mensagens de feedback de erro
  var feedbacks = document.querySelectorAll(".invalid-feedback");
  feedbacks.forEach(function (feedback) {
      feedback.style.display = "none";
  });
}

//-------------------------------------------------------------------------------------------------------------------------------------------------

$(function(){
    //Sempre que carregar a página atualiza a lista
    updateListProblema();
    updateListBoletim();
});

document.querySelector('.div1').addEventListener('scroll', function(event) {
  document.querySelector('.div2').scrollTop = event.target.scrollTop;
});

document.querySelector('.div2').addEventListener('scroll', function(event) {
  document.querySelector('.div1').scrollTop = event.target.scrollTop;
});
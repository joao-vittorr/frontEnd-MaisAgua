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

//essa é a funcao que o google irá chamar quando um usuario se autenticar
function loginCallback(resp){
    cred = jwtDecode(resp.credential);
    //salva o token inteiro, pois só é possível salvar strings no localStorage
    //cuidado, esse token é mutavel, não pode ser usado como chave no banco
    localStorage.setItem("gauth-token", resp.credential);
    setLoginStatus(cred);
}


function logout(){
    localStorage.setItem("gauth-token", undefined);
    document.querySelector(".g_id_logado").innerHTML = "";
    document.querySelector(".g_id_signin").style.display = 'block';
    document.getElementById('boletimNavBar').innerHTML = "";
    document.getElementById('problemaNavBar').innerHTML = "";

}

function setLoginStatus(cred){
    tokenUser = cred.sub;
    //esconde o botao de login do google
    document.querySelector(".g_id_signin").style.display = 'none';
    //mostra o usuario logado
    html = `<div class='g_login'>
                <img class='g_pic' src="${cred.picture}">
                <span><div class='g_name'>${cred.given_name} ${cred.family_name}</div><div class='g_email'>${cred.email}</div></span>
                <a href='#' onclick='logout()'><img src="assets/fechar.png" alt="Sair da conta"/></a>
            </div>`
    document.querySelector(".g_id_logado").innerHTML = html;
    //Mostra as opções de cadastrar Problema e Boletim ao usuario logado 
    var problemaNavBar = document.getElementById('problemaNavBar');
    problemaNavBar.innerHTML = `<div class="nav-item"><a class="nav-link active px-lg-3 py-1 py-lg-1" href="cadastrarProblema.html">Cadastrar problema</a></div>`
    if(tokenUser == "110955377050310839557" || tokenUser == "114600802078895812317"){
        var boletimNavBar = document.getElementById('boletimNavBar');
        boletimNavBar.innerHTML = `<div class="nav-item"><a class="nav-link active px-lg-3 py-1 py-lg-1" href="cadastrarBoletim.html">Cadastrar Boletim</a></div>`
    }
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



// enviando dados para o back-end

var URL_BASE = "http://localhost:8080/"
var URL_EDIT = null;

function saveBoletim(){
    //captura os dados do form, já colocando como um JSON
    dados = $('#tipo_problema_boletim,#cep_boletim,#cidade_boletim,#estado_boletim,#logradouro_boletim,#bairro_boletim,#desc_boletim,#token_user_boletim,#previsao_boletim').serializeJSON();
    dados['token_user_boletim'] = tokenUser;

    console.log(dados);

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

}

function saveProblema() {
    const fileInput = document.getElementById('foto');
  
    const file = fileInput.files[0];
    if (!file) {
      alert('Selecione uma imagem.');
      return;
    }
  
    convertImageToString(file)
      .then(base64String => {
        // Envie a string base64 para o servidor, salve em um campo oculto no formulário, etc.
        console.log('String base64:', base64String);
  
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
  
      })
      .catch(error => {
        console.error('Erro ao converter imagem:', error);
      });
  }

  function updateListProblema() {
    $.ajax(URL_BASE + "problema/", {
        method: 'get',
    }).done(function (res) {
        let table = $('#tableContentProblema');
        table.html("");
        $(res).each(function (k, el) {
            let res = el;
            const div = $(`<div class="row g-0">
                                <div class="col-md-8">
                                <div class="card-body">
                                <h5 class="card-title">${res.tipo_problema}</h5>
                                <p class="card-text">${res.desc_problema}</p>
                                <p class="card-text"><small class="text-body-secondary">${res.logradouro_problema}, N° ${res.numero_rua_problema} - ${res.bairro_problema}, ${res.cidade_problema}/${res.estado_problema} - Cep: ${res.cep_problema}</small></p>
                                </div>
                            </div>`);
            const img = $('<img>'); // Criar um elemento <img>
            img.attr('src', `data:image/png;base64, ${res.foto}`); // Definir a fonte da imagem como a string base64
            img.addClass('img-fluid'); // Adicionar a classe para estilização (se necessário)
            img.addClass('img-postagem'); // Adicionar a classe para estilização (se necessário)
            div.append(img); // Adicionar a imagem à div
            div.append(`<p class="card-text"><small class="text-body-secondary"><a href="#" onclick="editProblema('problema/${res.id_problema}')">Editar</a></small>
                        <small class="text-body-secondary"><a href="#" onclick="delProblema('problema/${res.id_problema}')">Deletar</a></small></p><hr/>`);
            table.append(div);
        })

    }).fail(function (res) {
        let table = $('#tableContentProblema');
        table.html("");
        const tr = $(`<tr><td colspan='4'>Não foi possível carregar a lista</td></tr>`);
        table.append(tr);
    });
}

function updateListBoletim() {
    $.ajax(URL_BASE + "boletim/", {
        method: 'get',
    }).done(function (res) {
        let table = $('#tableContentBoletim');
        table.html("");
        $(res).each(function (k, el) {
            let res = el;
            const div = $(`<div class="row g-0">
                                <div class="col-md-8">
                                <div class="card-body">
                                <h5 class="card-title">${res.tipo_problema_boletim} - Previsão: ${res.previsao_boletim}h</h5>
                                <p class="card-text">${res.desc_boletim}</p>
                                <p class="card-text"><small class="text-body-secondary">${res.logradouro_boletim} - ${res.bairro_boletim}, ${res.cidade_boletim}/${res.estado_boletim} - Cep: ${res.cep_boletim}</small></p>
                                </div>
                            </div>`);
            div.append(`<p class="card-text"><small class="text-body-secondary"><a href="#" onclick="editboletim('boletim/${res.id_boletim}')">Editar</a></small>
                        <small class="text-body-secondary"><a href="#" onclick="delBoletim('boletim/${res.id_boletim}')">Deletar</a></small></p><hr/>`);
            table.append(div);
        })

    }).fail(function (res) {
        let table = $('#tableContentBoletim');
        table.html("");
        const tr = $(`<tr><td colspan='4'>Não foi possível carregar a lista</td></tr>`);
        table.append(tr);
    });
}

$(function(){
    //Sempre que carregar a página atualiza a lista
    updateListProblema();
    updateListBoletim();
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
function editboletim(url) {
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
    // Obtém o formulário pelo ID
    const formulario = document.getElementById('form');

    // Reseta o formulário para o estado inicial
    formulario.reset();
}
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

function saveBoletim(){
    //captura os dados do form, já colocando como um JSON
    dados = $('#tipoProblema_boletim,#cep_boletim,#cidade_boletim,#estado_boletim,#logradouro_boletim,#bairro_boletim,#desc_boletim,#token_user_boletim,#previsao_boletim').serializeJSON();
    dados['previsao_boletim'] = parseFloat(dados['previsao_boletim']);
    dados['token_user_boletim'] = tokenUser;

    console.log(dados);

    //envia para o backend
    $.ajax(URL_BASE+"boletim",{
        data:JSON.stringify(dados),
        method:'post',
        contentType: "application/json",
    }).done(function(res) {

        let table = $('#tableContent');
        table.html("");
        $(res._embedded.problema).each(function(k,el){
            let problema = el;
            tr = $(`<tr><td>Editar</td><td>${problema.logradoudo_problema}</td><td>Deletar</td></tr>`);
            table.append(tr);
        })
    
    })
    .fail(function(res) {
        console.log(res);
    });  

}

function saveProblema(){
    //captura os dados do form, já colocando como um JSON
    dados = $('#tipo_problema,#cep_problema,#cidade_problema,#estado_problema,#logradouro_problema,#numero_rua_problema,#bairro_problema,#desc_problema,#token_user_problema').serializeJSON();
    dados['token_user_problema'] = tokenUser;

    console.log(dados);

    //envia para o backend
    $.ajax(URL_BASE+"problema",{
        data:JSON.stringify(dados),
        method:'post',
        contentType: "application/json",
    }).done(function(res) {

        let table = $('#tableContent');
        table.html("");
        $(res._embedded.problema).each(function(k,el){
            let problema = el;
            tr = $(`<tr><td>Editar</td><td>${problema.logradoudo_problema}</td><td>Deletar</td></tr>`);
            table.append(tr);
        })
    
    })
    .fail(function(res) {
        console.log(res);
    });  

}

function updateList(){

    $.ajax(URL_BASE+"problema",{
        method:'get',
    }).done(function(res){

        let table = $('#tableContent');
        table.html("");
        $(res._embedded.problema).each(function(k,el){
            let res = el;
            tr = $(`<tr><td>Editar</td><td>${problema.tipo_problema}</td><td>${problema.desc_problema}</td><td>Deletar</td></tr>`);
            table.append(tr);
        })
       
    })
    .fail(function(res) {
        let table = $('#tableContent');
        table.html("");
        tr = $(`<tr><td colspan='4'>Não foi possível carregar a lista</td></tr>`);
        table.append(tr);
    });
}
$(function(){
    //Sempre que carregar a página atualiza a lista
    updateList();
});

var data = null;


function handleCredentialResponse(response) {
    data = jwt_decode(response.credential)
  
    fullName.textContent = data.name
    sub.textContent = data.sub // token do google
    given_name.textContent = data.given_name
    family_name.textContent = data.family_name
    email.textContent = data.email
    verifiedEmail.textContent = data.email_verified
    picture.setAttribute("src", data.picture)
}


google.accounts.id.initialize({
    client_id: "237096676007-vfap0beu1eusvicj0t7hvr85o2l7no6b.apps.googleusercontent.com", callback: handleCredentialResponse
});

google.accounts.id.renderButton( 
    document.getElementById("buttonDiv"), {
        theme: "filled_black",
    size: "large",
    type: "standard",
    shape: "pill",
    locale: "pt-BR",
    logo_alignment: "left",
});


google.accounts.id.prompt(); // also display the One Tap dialog

var URL_BASE = "http://localhost:8080/"

function saveBoletim(){
    //captura os dados do form, já colocando como um JSON
    dados = $('#tipo_boletim, #cep_boletim, #cidade_boletim, #estado_boletim,#logradouro_boletim, #bairro_boletim, #desc_boletim, #previsao_boletim,#token_user').serializeJSON();
    dados['token_user'] = data.sub;
    dados['previsao_boletim'] = parseFloat(dados['previsao_boletim'])

    console.log(dados);

    //envia para o backend
    $.ajax(URL_BASE+"boletim",{
        data:JSON.stringify(dados),
        method:'post',
        contentType: "application/json",
    }).done(function(res) {
        console.log(res);
    })
    .fail(function(res) {
        console.log(res);
    });  

}

function listar(){

$.ajax(URL_BASE+"problema",{
    method:'get',
}).done(function(res) {

    let table = $('#tableContent');
    table.html("");
    $(res._embedded.problema).each(function(k,el){
        let problema = el;
        tr = $(`<tr><td>Editar</td><td>${problema.logradoudo_problema}</td><td>${problema.cidade_problema}</td><td>Deletar</td></tr>`);
        table.append(tr);
    })
    })
};

$(function(){
    $('#submit').click(saveProblema);
});


function saveProblema(){
    //captura os dados do form, já colocando como um JSON
    dados = $('#tipo_problema,#cep_problema,#cidade_problema,#estado_problema,#logradouro_problema,#numero_rua_problema,#bairro_problema,#desc_problema,#token_user').serializeJSON();
    dados['token_user'] = data.sub;

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
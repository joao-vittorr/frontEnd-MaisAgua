var URL_BASE = "http://localhost:8080/"

function saveBoletim(){
    //captura os dados do form, já colocando como um JSON
    dados = $('#token_boletim,#tipoProblema_boletim,#desc_boletim,#latitude_boletim,#longitude_boletim').serializeJSON();
    dados['longitude_boletim'] = parseFloat(dados['longitude_boletim'])
    dados['latitude_boletim'] = parseFloat(dados['latitude_boletim'])

    console.log(dados);

     //envia para o backend
    $.ajax(URL_BASE+"boletim/",{
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

function saveProblema(){
    //captura os dados do form, já colocando como um JSON
    dados = $('#token_boletim,#tipoProblema_boletim,#desc_boletim,#latitude_boletim,#longitude_boletim').serializeJSON();
    dados['longitude_boletim'] = parseFloat(dados['longitude_boletim'])
    dados['latitude_boletim'] = parseFloat(dados['latitude_boletim'])

    console.log(dados);

     //envia para o backend
    $.ajax(URL_BASE+"problema/",{
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



function save(){

    //envia para o backend
    $.ajax(URL_BASE+"boletim",{
    
    }).done(function(res) {
        console.log(res);
        //atualiza a lista após salvar
        updateList();
    })
    .fail(function(res) {
        console.log(res);
    });
}

var URL_BASE = "http://localhost:8080/"

function save(){
    //captura os dados do form, já colocando como um JSON
    dados = $('#token_boletim,#tipoProblema_boletim,#desc_boletim,#latitude_boletim,#longitude_boletim').serializeJSON();
    dados['longitude_boletim'] = parseFloat(dados['longitude_boletim'])
    dados['latitude_boletim'] = parseFloat(dados['latitude_boletim'])

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

function updateList(){

    $.ajax(URL_BASE+"boletim",{
        method:'get',
    }).done(function(res) {

        let table = $('#tableContent');
        table.html("");
        $(res._embedded.boletim).each(function(k,el){
            let boletim = el;
            tr = $(`<tr><td>Editar</td><td>Deletar</td></tr>`);
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
    $('#submit').click(save);

    //Sempre que carregar a página atualiza a lista
    updateList();
});

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

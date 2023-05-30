function updateList(){

    $.ajax(URL_BASE+"listarBoletim",{
        method:'get',
    }).done(function(res) {

        let table = $('#tableContent');
        table.html("");
        $(res._embedded.token).each(function(k,el){
            let token = el;
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

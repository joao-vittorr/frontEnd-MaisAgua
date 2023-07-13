//decodifica o jwt
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
    //aqui voce podera ver todas as informacoes que o google retorna
    console.log(cred);
    //salva o token inteiro, pois só é possível salvar strings no localStorage
    //cuidado, esse token é mutavel, não pode ser usado como chave no banco
    localStorage.setItem("gauth-token", resp.credential);
    setLoginStatus(cred);
}

function logout(){
    localStorage.setItem("gauth-token", undefined);
    document.querySelector(".g_id_logado").innerHTML = "";
    document.querySelector(".g_id_signin").style.display = 'block';
}

function setLoginStatus(cred){
    console.log(cred);
    //esconde o botao de login do google
    document.querySelector(".g_id_signin").style.display = 'none';
    //mostra o usuario logado
    html = `<div class='g_login'>
                <img class='g_pic' src="${cred.picture}">
                <span><div class='g_name'>${cred.given_name} ${cred.family_name}</div><div class='g_email'>${cred.email}</div></span>
                <a href='#' onclick='logout()'>Logout</a>
            </div>`
    document.querySelector(".g_id_logado").innerHTML = html;
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
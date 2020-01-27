/*****************************************LOGIN*****************************************************************/

/**
* Se i dati inseriti sono corretti, effettua il login, altrimenti visualizza un messaggio di errore.
*/
$('#loginbtn').click(function(){
    var email = $('#loginemail').val();
    var password = $('#loginpassword').val();
    if (!(email && password)) $('#login_error').text('Inserisci email e password.');
    else{
        $.get('/api/authentication/'+ email + '/' + password, (resultAuth) =>{
            resultAuth = JSON.parse(resultAuth).message;
            if(resultAuth !='') $('#login_error').text(resultAuth); 
            else{
                $.post('/api/savesession/' + email);
                location.replace('../FindMeFriend.html');
            } 
        });
    } 
});

/*****************************************REGISTRATION*****************************************************************/

$('#registration_btn').click(function(){$('#registration_window').show()});

/**
* Registra l'utente solo se tutti i campi della registrazione sono compilati nel giusto modo, rispettando i seguenti vincoli:
* - l'indirizzo email non deve corrispondere a quello di un utente già registrato;
* - il nickname deve essere unico e non deve corrispondere a quello di un utente già registrato;
* - le due password inserite devono essere uguali.
* L'utente viene informato di eventuali errori.
*/
$('#btnregistration').click(function(){
    var email = $('#regemail').val();
    var password = $('#regpassword').val();
    var repeat_password = $('#regrepeatpassword').val();
    var name = $('#regname').val();
    var surname = $('#regsurname').val();
    var nickname = $('#regnickname').val();
    var year = $('#regyear').val();
    var province = $('#regprovince').val();

    if(!( email && password && repeat_password && name && surname && nickname && year && province)) $('#reg_message').text('Compila tutti i campi!');
    else {
        if(password != repeat_password) $('#reg_message').text("Le password devono coincidere!");
        else{
            $.post('/api/insertuser/' + email +'/'+ password+'/'+ name+'/'+ surname+'/'+ nickname+'/'+ year+'/'+ province, (res)=>{
                $('#reg_message').text(JSON.parse(res).message);
            });    
        }
    }
});

/**
* Invia una mail al team. Eventuali errori verranno comunicati all'utente.
*/  
$('#btnsend').click(function(){
    var send = $('#sender').val();
    var pass = $('#pass').val();
    var subj = $('#subj').val();
    var text = $('#text').val();
    if(send!='' && text!='' && pass!=''){ 
        var message = {
            sender : send,
            password : pass,
            to : '',
            subj : subj,
            text : text
        };
        $.post('/api/sendemail', message , (result)=>{
            result = JSON.parse(result);
            if(result.code == 0 ) $('#send_feedback_message').text(result.message);
            else{ 
                alert(result.message);
                $("#feedback input[type= 'text']").val('');
            }
        })
    }else $('#send_feedback_message').text("Inserisci la tua email, la tua password dell'account di posta elettronica e il messaggio che vuoi inviare");
});
var template_informations = '';
var template_interests = '';
var last_item = '';
var session;

$(document).ready(function(){prepareProfile()})
/**
 * Compone il template per il profilo, compilandolo in base ai dati della sessione.
 */
function prepareProfile(){

    if(!session){
        $.get('/api/getsession', (s) =>{
            session = JSON.parse(s);
            prepareProfile();
        })
    }else{
        if(template_informations=='') showInformations();
        if(session.Interests.length != 0) showInterests();
    }
};

/**
 * Costruisce il template per le informazioni.
 */
function showInformations(){
    template_informations = "<div class='businesscard'><table id='tabellainformazioni'><tr><th><span>Nome: </span></th><td><p>"+session.Name+"</p></td></tr>"+
        "<tr><th><span>Cognome: </span></th><td><p>"+session.Surname+"</p></td></tr>"+
        "<tr><th><span>Nickname: </span></th><td><p  title = 'Fai doppio click per modificare questo campo'  ondblclick= "+'"' + "set('info_Nickname') " + '"' + ">" + session.Nickname+"</p></td></tr>"+
        "<tr><th><span>Anno di nascita: </span></th><td><p>"+ session.Year+"</p></td></tr>" +
        " <tr><th><span>Provincia: </span></th><td><p  title = 'Fai doppio click per modificare questo campo'  ondblclick= "+'"' + "set('info_Province') " + '"' + ">"+session.Province+"</p></td></tr></table></div>";
    $('#informations').html(template_informations);    
}

/**
 * Costruisce il template per gli interessi.
 */
function showInterests() {
    template_interests = "";
    session.Interests.forEach((inter, index)=>{
        template_interests += "<div class= 'businesscard'>"+
            "<table class = 'tabellainteressi'>"+
            "<tr><th>Nome interesse: </th><td title = 'Fai doppio click per modificare questo campo' id = 'inter_Name-"+index+"' ondblclick= "+'"' + "set('inter_Name-"+index+"') "+'"' + ">" + inter.Name+"</td></tr>"+
            "<tr><th>Key 1 : </th><td title = 'Fai doppio click per modificare questo campo'  id = 'inter_key1-"+index+"' ondblclick= "+'"' + "set('inter_key1-"+index+"') "+'"' + ">" + inter.Key1+"</td></tr>"+
            "<tr><th>Key 2: </th><td title = 'Fai doppio click per modificare questo campo'  id = 'inter_Key2-"+index+"' ondblclick= "+'"' + "set('inter_Key2-"+index+"') "+'"' + ">" + (inter.Key2 == null? "" : inter.Key2) +"</td></tr>"+
            "<tr><th>Key 3 : </th><td title = 'Fai doppio click per modificare questo campo'  id = 'inter_Key3-"+index+"' ondblclick= "+'"' + "set('inter_Key3-"+index+"') "+'"' + ">" + (inter.Key3 == null? "" : inter.Key3) +"</td></tr>"+
            "<tr><th>Key 4 : </th><td title = 'Fai doppio click per modificare questo campo'  id = 'inter_Key4-"+index+"' ondblclick= "+'"' + "set('inter_Key4-"+index+"') "+'"' + ">" + (inter.Key4 == null? "" : inter.Key4) +"</td></tr>"+
            "<tr><th class = 'descr' colspan=2><b>Descrizione: </b></th></tr>"+
            "<tr><td title = 'Fai doppio click per modificare questo campo' id = 'inter_Description-"+index+"' colspan=2 ondblclick= "+'"' + "set('inter_Description-"+index+"') "+'"' + ">" + inter.Description+"</td></tr>"+
            "<tr><td   colspan= 2 class='tdbtn'><input type='button' id= 'eliminainteresse' class='delete_interest_btn btn btn-danger' value='Elimina interesse' onclick= "+'"' + "deleteInterest("+index+") "+'"' + "></td></tr>"+
            "</table></div>";
    }); 
    $.get('/api/getrules', (rules)=>{
        rules = JSON.parse(rules);
        if(session.Interests.length == rules.max_interests) $('#btn_add_interest').hide();
        $('#interests').html(template_interests);
    })
}

/*******************************************MODIFICA ELEMENTO*************************************************************/
/**
* Al doppio click fatto sugli elementi che si possono modificare, fa apparire la finestra per la modifica 
* dell'elemento.
*/
function set(item){
    $('#set_window').css({"display": "flex"});
    last_item = item;

    console.log("%s %s %s",last_item, "|||||",  $('#'+ last_item).text());
    $('#set_window_input').val($('#'+ last_item).text());
};

/**
* Al click del bottone ok nella finestra per la modifica dell'elemento, eseguo i controlli necessari.
*/
$('#set_window_ok_button').click(function(){
    last_item = last_item.split('_');
    var prefix = last_item[0];
    var column = last_item[1]; 
    var newtext = $('#set_window_input').val();
    var link = '';

    if(prefix == 'info'){
        if((column == 'nickname' & session.Nickname != newtext) || session.Province != newtext) link = '/api/setinformation/' + column +'/' + newtext + '/' + session.Email;
    } else link ='/api/setinterest/' + column.split('-')[0] +'/' + newtext + '/' + session.Interests[column.split('-')[1]].Name + '/' + session.Email;
    
    if(link != ''){
        $.ajax({
            url: link,
            type:'PUT',
            success : result =>{
                result = JSON.parse(result);
                alert(result.message);
                if(result.code == 201) updateSession(prefix =='info' ? 0:1);
            }
        })
    }
    $('#set_window_input').val('');
    $('#set_window').hide();
    last_item= '';
});

/*******************************************AGGIUNTA INTERESSE************************************************************/

/**
* Al click sul bottone Aggiungi interesse si apre una finestra apposita
*/
$('#btn_add_interest').click(function(){$('#add_interest_window').show()});

/**
* Al click sul bottone aggiungi, si effettuano i controlli necessari per l'aggiunta di tale interesse.
*/
$('#add_interest_add_button').click(function(){

    var k = [$('#new_key1').val() , $('#new_key2').val() , $('#new_key3').val() , $('#new_key4').val()];
    var interest ={
        name : $('#new_name').val(),
        key1 : "",
        key2 : "",
        key3 :"",
        key4: "",
        description : $('#new_description').val()
    }

    if(
        interest.name == '' | interest.description == '' | 
        (k[0]=='' & k[1]=='' & k[2]=='' & k[3]=='')
    ) $('#add_interest_message').text('Inserisci il nome che identifica il tuo interesse, la sua descrizione e almeno una parola chiave.');
    else{
        
        for(i = 0; i < 4; i++){ 
            if(k[i] == '') {// sposta gli elementi vuoti alla fine e li rimpiazza con la stringa null
                k.splice(i,1);
                k.push('null');
                i--; 
            }
        }
        
        interest.key1 = k[0];
        interest.key2 = k[1];
        interest.key3 = k[2];
        interest.key4 = k[3];
                
        $.post('/api/addinterest/' + session.Email , interest, (res) =>{
            res = JSON.parse(res);
            if (res.code == 201){ 
                $('#add_interest_window').hide();
                alert(res.message);
                $("#add_interest_window input[type = 'text']").val('');
                updateSession(1);
                $('#add_interest_message').text("");
                $('#new_key1').val(""); 
                $('#new_key2').val("");
                $('#new_key3').val("");
                $('#new_key4').val("");
                $('#new_name').val("");
                $('#new_description').val("");
            }else $('#add_interest_message').text(res.message);

        })  
    }
})

/*******************************************ELIMINA INTERESSE*************************************************************/

/**
* Permette di cancellare l'interesse.
*/
function deleteInterest(index){
    $('#delete_interest_window').show();
    var inter = session.Interests[index]
    $('#delete_interest_window_interest').html("<tr><th>Nome interesse: </th><td>" + inter.Name+"</td></tr><tr><th>Key 1 : </th><td>" + inter.Key1+"</td></tr><tr><th>Key 2: </th><td>" + (inter.Key2 == null? "" : inter.Key2) +"</td></tr><tr><th>Key 3 : </th><td>" + (inter.Key3 == null? "" : inter.Key3) +"</td><tr><th>Key 4 : </th><td>" + (inter.Key4 == null? "" : inter.Key4) +"</td></tr><tr><th>Descrizione: </th><td>" + inter.Description+"</td></tr>");
    last_item = index;
}

/**
 * Avvia la cancellazione dell'interesse.
 */
$('#delete_interest_yes_button').click(function(){
    $('#delete_interest_window').hide();
    $.ajax({
        url: '/api/delete/interest/' + session.Interests[last_item].Name +'/' + session.Email,
        type:'DELETE',
        success : result =>{
            result = JSON.parse(result);
            alert(result.message);
            if(result.code == 201) updateSession(1);
            last_item='';   
        }
    })
});

/*******************************************ELIMINA PROFILO***************************************************************/

/**
 * Apre una finestra per la cancellazione dell'account.
 */
$('#delete_profile_btn').click(function(){
    $('#delete_profile_window').show();
});

/**
 * Avvia la cancellazione dell'account.
 */
$('#delete_profile_yes_btn').click(function(){

    $('#delete_profile_window').hide();
    $.ajax({
        url: '/api/delete/profile/' + session.Email,
        type:'DELETE',
        success : result =>{
            result = JSON.parse(result);
            alert(result.message);
            if(result.code == 201) $.get('/', ()=>{ 
                $('#page').load('./Welcome.html');            
            });
        }
    })
});

/*******************************************CAMBIA PASSWORD***************************************************************/

/**
 * Apre una finestra per la modifica della password.
 */
$('#set_password_btn').click(function(){
    $('#set_password_window').show();
});

/**
 * Effettua i controlli necessari e se non ci sono errori, avvia la modifica della password, altrimenti 
 * visualizza un messaggio di errore.
 */
$('#set_password_ok_btn').click(function(){
    $('#set_password_message').text('');
    var old_password = $('#old_password_input').val();
    var new_password = $('#new_password_input').val();
    var repeat_password = $('#repeat_new_password_input').val();
    
    if(new_password != repeat_password) $('#set_password_message').text('Le nuove password devono essere uguali!');
    else{
        if(old_password != '' & new_password !='' & repeat_password !=''){ 
        
            $.ajax({
                url: "/api/setpassword/" + old_password + '/' + new_password + '/' + session.Email,
                type:'PUT',
                success : result =>{alert(JSON.parse(result).message);}
            })
        }

        $('#old_password_input').val('');
        $('#new_password_input').val('');
        $('#repeat_new_password_input').val('');
        $('#set_password_window').hide();
    }
});
/***********************************************FUNCTIONS****************************************************************/
/**
 * Aggiorna una sezione della sessione in locale prendendoli dal file session.json.
 * Se @param section == 0, si deve aggiornare le informazioni, altrimenti gli interessi.
 * @param {int} section : indica la sezione da aggiornare: 0 per le informazioni, 1 per gli interessi.
 */
function updateSession(section){
    $.get('/api/getsession', s =>{  
        session = JSON.parse(s);
        if(section == 1) showInterests();
        else showInformations();
    })
}

/**
* Al click dei bottoni Annulla/No, la finestra a cui appartiene il bottone si chiude.
*/
$('.cancel_btn').click(function () {
    $(this).parent().parent().hide();
})

$('#annullabtn').click(function(){
    $('#set_window').hide();
})

$('#logout_btn').click(function(){
    $.get('/api/logout', result =>{
        $('#page').load('./Welcome.html');
    })
})

$('#opt').click(function(){
    if($('#titolo1 div').css('display')!='none'){//se si legge
        $('#titolo1 div').hide();
    }else{
        $('#titolo1 div').show();
    }
})

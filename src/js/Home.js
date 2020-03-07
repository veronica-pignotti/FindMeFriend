var results = [];

/**
* Template di base: visualizza i risultati migliori corrispondente al profilo.
*/
var template_home = 'Si è verificato un errore.';

/**
 * Indice del risultato a cui si vuole mandare un messaggio.
 */
var index_recipient;

/**
 * Stringa da visualizzare in mancaza di risultati inerenti alla ricerca effettuata.
 */
var no_results_string = "<p style = 'text-align: center; font-size: xx-large; margin: 10px'>OPS!<br>Attualmente non ci sono persone che corrispondono ai tuoi dati di ricerca.</p>";

$(document).ready(function(){
    prepareHome(true);
})

/**
 * Ad ogni apertura della pagina Home, viene effettuata una ricerca, prendendo come parametri le informazioni e 
 * gli interessi dell'utente.
 * @param {boolean} firstAccess : indica se il metodo è invocato al primo accesso.
 */
function prepareHome(firstAccess) {

    if(!firstAccess) search(false);
    else{
        $.get('/api/getrules', rules =>{
            rules = JSON.parse(rules);
            var str ='';
            for(j = 0; j<2; j++){
                str += j ==0? "<select id='agemin'>" : "<select id='agemax'>";
                for(i = rules.min_age_subscribe; i<= rules.max_age_subscribe; i++){
                    str += "<option value='" + i + "'";
                    if((j== 0 & i== rules.min_age_subscribe) | (j == 1 & i== rules.max_age_subscribe)) str += " selected = 'selected'";
                    str += ">" + i + "</option>";
                }
                str += "</select>";
            }        
            $("#sez_età").append(str);
            prepareHome(false);
        })
    }
}
/*******************************************RICERCA*********************************************************************/

/**
* Al click del bottone "Cerca", viene effettuata uan ricerca in base ai filtri inseriti.
*/
$('#btnsearch').click(function(){search(true);});

/**
 * Effettua una ricerca in base al parametro @param isASearch:
 * - se @param isASearch == true : la ricerca è voluta dall'utente, ossia ha cliccato il tasto di ricerca; vengono considerati i parametri inseriti.
 * - se @param isASearch == false : la ricerca parte dal caricamento della pagina (ricerca di default); vengono considerate le informazioni e gli interessi dell'utente.
 * @param {boolean} isASearch: indica se la ricerca è di default oppure è voluta dall'utente.
 */
function search(isASearch){
    var pr = isASearch? $('#province').val() : 'null';
    var k =  $('#key').val() != ''? $('#key').val() : 'null';
    var min = $('#agemin').val() !=''? $('#agemin').val() : 'null';
    var max = $('#agemax').val() !='' ? $('#agemax').val() : 'null';
    var only_null = pr == 'null' && k == 'null'; // && min == 'null' && max == 'null'; 

    if(isASearch && only_null) prepareHome(false);
    else{
        
        $.get('/api/search/' + pr + "/" + k +"/" + min + "/" + max, (response) =>{
            
            response = JSON.parse(response);


            if(response.code == 400){
                if(response.res == "") $.get('/', ()=>{ location.replace('../Welcome.html');});
                else {
                    search(false);
                }
            } else if(response.code > 204) $('#results_research').html(template_home);
            else{

                results = response.res;
                visualizeResults();
                $('#key').val('');
                $('#province').val('');
            }
        })
    }
};

/**
* Prepara e visualizza il template per la sezione dei risultati di ricerca.
*/
function visualizeResults(){

    if(results.length == 0) $('#results_research').html(no_results_string);
    else{

        var color;
        $('#results_research').html('');
        template_home ='';
        results.forEach(function(res, index){
            color = res.Compatibility < 34? 'red': res.Compatibility < 64? '#FFCC00': 'green';
            $('#results_research').append(" <div id=' "+ res.Nickname + "' class='businesscard' style ='border: 5px dotted " + color + "'><table id='tabellainformazioni'><tr><th><span>NickName :</span></th><td><p>"+ res.Nickname + "</p></td></tr><tr><th><span>Anno di nascita :</span></th><td><p>" + res.Year + "</p></td></tr><tr><th><span>Provincia :</span></th><td><p>" + res.Province + "</p></td></tr><tr><th><span>Interessi in comune :</span></th></tr><td><p>"+ res.CommonInterests +"</p></td></table><div style = 'background-color:" + color + " 'class = 'compability'>" + res.Compatibility + "%</div><p><input type='button' value='Invia un messaggio' class='btn btn-secondary' id='inviomessaggio' onclick = 'send( " + index + ")'><input type = 'button' class='open_profile_btn btn btn-primary' id='apriprofilo' value='Visualizza profilo' onclick = 'openProfile( " + index + ")'></p></div>" );
        });
    }
};

/*******************************************BIGLIETTO DA VISITA*********************************************************/
/**
* Apre la finestra per inviare un messaggio alla persona corrispondente al risultato selezionato.
* @param {int} index: indice del risultato.
*/
function send(index){
    $('#send_message_window').show();
    index_recipient= index;
}

/**
* Apre la pagina del profilo corrispondente al risultato index della ricerca.
* @param {int} index: indice del risultato.
*/
function openProfile(index){
    var template_result_profile;

    $.get('/api/getmissinginformations/' + results[index].Email, (result) =>{
        result = JSON.parse(result);
        if(result.code == 200){
            result = result.obj;
            template_result_profile = "<h1>Profilo di " + results[index].Nickname + "</h1><table><tr><th><span>Nome: </span></th><td><p>"+result.Name+"</p></td></tr><tr><th><span>Cognome: </span></th><td><p>"+result.Surname+"</p></td></tr><tr><th><span>Nickname: </span></th><td><p>" + results[index].Nickname+"</p></td></tr><tr><th><span>Anno di nascita: </span></th><td><p>"+ results[index].Year+"</p></td></tr><tr><th><span>Provincia: </span></th><td><p>"+results[index].Province+"</p></td></tr></table><h1>Interessi</h1><table>";
            
            (result.Interests).forEach((inter)=>{
                template_result_profile += " <tr><th>Nome interesse: </th><td>" + inter.Name+"</td></tr><tr><th>Descrizione: </th><td>" + inter.Description+"</td></tr>"
            });
            template_result_profile += '</table>'; 
            
        } else template_result_profile = "<h1>"+ result.message + "</h1>";
        $('#profile_window_content').html(template_result_profile);
        $('#profile_window').show();
    });
};
/*******************************************FINESTRE******************************************************************/


/**
* Invia un messaggio al risultato selezionato e visualizza eventuali errori.
*/
$('#send_btn').click(function(){

    if($('#text').val() =='' || $('#psw').val()) $('#send_message_error').text('Inserisci la tua password e un messaggio!');
    else if($('#text').val().length >= 500) $('#send_message_error').text('Ops! Il tuo messaggio è troppo lungo! \n Inserisci un messaggio più corto!');
    else {    
        var e = {
            sender :'',
            password : $('#psw').val(),
            to : 'test',//results[index_recipient].Email, --> Il commento è stato aggiunto per permettere i test
            subj : $('#obj').val(),
            text : $('#text').val()
        }
        $.post('/api/sendemail', e, (result)=>{
            result = JSON.parse(result);
            if(result.code != 200 ) $('#send_message_error').text(result.message);
            else{ 
                $("#send_message_window input[type= 'text']").val('');
                $('#send_message_window').hide();
            }
        })
    }
})

/**
* Al click dei bottoni chiudi, la finestra a cui appartiene il bottone si chiude.
*/
$('.cancel_btn').click(function () {
    $(this).parent().parent().hide();
})

$('#navbar').click(function(){
    if($('#navbarSupportedContent').css('display') == 'block') $('#navbarSupportedContent').hide();
    else $('#navbarSupportedContent').show();
})
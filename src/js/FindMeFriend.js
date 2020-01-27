var visualized_page ='';

/**
* Quando il documento è pronto, viene visualizzata la pagina Home.
*/  
$(document).ready(
    function(){
        visualizeHome(true);
    },
);

$('#btn_home').click(function(){visualizeHome(false)});

$('#btn_profile').click(function(){visualizeProfile()});

    
/**
* Visualizza la pagina home.
*/
function visualizeHome(firstAccess){
    if(visualized_page!='Home') {
        $('#Home').show();
        $('#Profile').hide();
        visualized_page = 'Home';
        prepareHome(firstAccess);
    }
};

/**
* Visualizza la pagina del profilo con tutti i suoi componenti.
*/
function visualizeProfile(){
    if(visualized_page!='Profile') {
        $('#Home').hide();
        $('#Profile').show();
        visualized_page = 'Profile';
        prepareProfile();
    }
};

/**
* Al click dei bottoni Annulla/No, la finestra a cui appartiene il bottone si chiude.
*/
$('.cancel_btn').click(function(){
    $(this).parent().parent().hide();
})
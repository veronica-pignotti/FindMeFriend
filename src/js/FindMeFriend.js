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
* Visualizza la pagina Home.
*/
function visualizeHome(firstAccess){
    if(visualized_page!='Home') {
        visualized_page = 'Home';
        $('#content').load('Home.html');
    }
};

/**
* Visualizza la pagina del profilo con tutti i suoi componenti.
*/
function visualizeProfile(){
    if(visualized_page!='Profile') {
        visualized_page = 'Profile';
        $('#content').load('Profile.html');
    }
};
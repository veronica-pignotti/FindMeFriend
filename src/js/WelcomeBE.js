var connection = require('./Database').connection;
const rules = require('../../index').rules;
var security = require('./Security');

/*************************************************LOGIN*****************************************************************/

/**
* Effettua l'autenticazione controllando il database.
* Ritorna l'istanza dell'utente nel database in formato JSON se è stato autenticato, null altrimenti.
* @param {string} email: indirizzo email dell'utente che vuole loggarsi.
* @param {string} password : password dell'utente che vuole loggarsi.
* @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
*/
module.exports.authentication = (email, password, response) => {

    email = security.checkString(email);

    if(!email || !password) response.end(JSON.stringify({code : 400, message : 'Non puoi inserire i caratteri " < >.'}));

    connection.query("SELECT Email, Name, Surname, Nickname, Year, Province FROM User WHERE Email = '" + email + "' AND Password = '" + security.encodePassword(password) + "'", (err, resQuery) => {
        var obj;
        if(err){
            console.log("Si è verificato un errore durante l'autenticazione: " + err);
            obj = {code : 500, message : "Si è verificato un errore durante l'autenticazione."};
        } else if(resQuery.length == 0) obj = {code : 401, message : "I dati inseriti non sono corretti oppure non sei ancora registrato."};
        else{
            createSession(resQuery[0])
            obj = {code :202, message: ""};
        } 
        response.end(JSON.stringify(obj));
    });
}

/**
 * Salva i dati della sessione nel file session.json.
 * @param {*} obj: l'oggetto contentente tutti i dati conosciuto dell'utente (esclusa la password).
 */
function createSession(obj){
    var session = {
        Email : obj.Email,
        Name : obj.Name,
        Surname : obj.Surname,
        Nickname : obj.Nickname,
        Year : obj.Year,
        Province : obj.Province,
        Interests:[]
    }
    
    connection.query("SELECT * FROM Interest WHERE Interest.User = '" + session.Email + "'", (err, resQueryInterest) => {
        if (err) console.log("Si è verificato un errore di connessione con il database2: " + err);
        else if(resQueryInterest.length !=0) session.Interests = resQueryInterest;
        require('fs').writeFile('session.json', JSON.stringify(session), ()=>{console.log("Le informazioni relative all'utente con email " + session.Email + " sono state aggiunte al file session.json")});
    }) 
  }

/*********************************************REGISTRATION**************************************************************/

/**
* Prova ad eseguire l'insert nel database con i parametri passati e restituisce un JSON contenente un messaggio.
* L'utente deve avere un'età compresa tra rules.min_age_subscribe e rules.max_age_subscribe.
* Gli errori inerenti all'inserimento di tale nuova istanza vengono captati sfruttando i vincoli del database User: 
* - ogni email è chiave primaria, quindi non possono esistere due istanze aventi lo stesso campo Email
* - ogni nickname deve essere unico, quindi, nel caso di inserimento di un nickname uguale ad uno già presente, viene lanciato un errore.
*/
module.exports.insertUser = (user, response)=>{
    
    user = security.checkUser(user);
    if(!user) response.end(JSON.stringify({code : 400, message : 'Non puoi inserire i caratteri " < >.'}));

    var user_age = new Date().getFullYear() - user.year;
    if(user_age < rules.min_age_subscribe | user_age > rules.max_age_subscribe ) response.end(JSON.stringify({message : "Mi dispiace! Devi avere un'età copresa tra i 18 e i 30 per iscriverti!"}));
    else{
        var insert = "INSERT INTO User (Email, Password, Name, Surname, Nickname, Year, Province) VALUES ( '" + user.email + "', '" + security.encodePassword(user.password) + "', '" +  user.name +"', '" + user.surname+"', '" + user.nickname+"', " + user.year+", '" + user.province + "');";
        connection.query(insert, (err) => { 
            var obj;
            if (err) {
                console.log(err);
                if(err.toString().indexOf("ER_DUP_ENTRY: Duplicate entry '" + user.email)!= -1) obj = {code: 205, message: "L'email inserita corrisponde ad un account già registrato!"};
                else if(err.toString().indexOf("ER_DUP_ENTRY: Duplicate entry '" + user.nickname)!= -1) obj = {code: 205, message: "Nickname già utilizzato! Inserisci un altro nickname!"};
                else obj = {code : 500, message : "Si è verificato un errore durante la connessione con il database."};
            } else obj = {code: 201, message:str ="La tua registrazione è andata a buon fine!"};
            response.end(JSON.stringify(obj));
        });
    }
};
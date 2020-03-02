var connection = require('./Database').connection;
var security = require('./Security');

/*******************************************MODIFICA ELEMENTO*************************************************************/

/**
* Apporta le modifiche alle informazioni dell'utente seguendo i parametri inseriti.
* @param {string} column la colonna corrispondente al valore da modificare; può essere Nickname o Province.
* @param {string} value il nuovo valore che deve assumere column
* @param {string} email l'email dell'utente.
* @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
*/
module.exports.setInformationUpdate = (column, value, email, response)=>{
    if(!security.checkString(value)) response.end(JSON.stringify({code : 400, message : 'Non puoi inserire i caratteri " < >.'}));
    else {connection.query("UPDATE User SET " + column + " = '" + value + "' WHERE Email = '" + email + "'", (err) => {
        var obj = err? 
            ( err.toString().indexOf("ER_DUP_ENTRY: Duplicate entry '" + value)!= -1? 
                {code: 205, message: "Nickname già utilizzato!"}: 
                {code : 500, message : "Si è verificato un errore durante la connessione con il database."} 
            ): {code: 201, message:"La tua modifica è andata a buon fine!"};
        if (err) console.log(err);
        else updateFile('User', email);
        response.end(JSON.stringify(obj));
    }); 
}
}

/**
* Apporta le modifiche agli interessi dell'utente seguendo i parametri inseriti.
* @param {string} column la colonna corrispondente al valore da modificare.
* @param {string} value il nuovo valore che deve assumere column
* @param {string} email l'email dell'utente.
* @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
*/
module.exports.setInterestUpdate = (column, value, name, email, response)=>{
    if(!security.checkString(value)) response.end(JSON.stringify({code : 400, message : 'Non puoi inserire i caratteri " < >.'}));
    else{
    connection.query("UPDATE Interest SET " + column + " = '" + value + "' WHERE User = '" + email + "' AND Name = '" + name + "'", (err) => {
        var obj = err? 
            ( err.toString().indexOf("ER_DUP_ENTRY: Duplicate entry '" + value)!= -1? 
                {code: 205, message: "Il nome inserito appartiene già ad un tuo interesse."}: 
                {code : 500, message : "Si è verificato un errore durante la connessione con il database."} 
            ): {code: 201, message:"La tua modifica è andata a buon fine!"};
        if (err) console.log(err);
        else updateFile('Interest', email);
        response.end(JSON.stringify(obj));
    });
    }
}

/*******************************************AGGIUNTA INTERESSE************************************************************/

/**
 * Aggiunge alla tabella degli interessi, l'interesse con le informazioni specificate e ritorna un file JSON contente un codice e un messaggio.
 * Gli apostrofi vengono sostituiti con [39].
 * @param {string} email l'email dell'utente.
 * @param {string} interest l'interesse da aggiungere.
 * @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
 * */
module.exports.addInterestUpdate = (email, interest, response) =>{
    interest = security.checkInterest(interest);
    if(!interest) response.end(JSON.stringify({code : 400, message : 'Non puoi inserire i caratteri " < >.'}));

    var sql = "INSERT INTO Interest (User, Name, Key1, Key2, Key3, Key4, Description) VALUES ( '" + email + "', '" + interest.name + "', '" + interest.key1 + "', '"+ interest.key2 + "', '" + interest.key3 + "', '" + interest.key4 + "', '"+ interest.description + "')";
    connection.query(sql, (err) => {
        var obj = err? 
                ( err.toString().indexOf("ER_DUP_ENTRY: Duplicate entry '" + interest.name)!= -1? 
                    {code: 205, message: "Il nome inserito appartiene già ad un tuo interesse."}: 
                    {code : 500, message : "Si è verificato un errore durante la connessione con il database."} 
                ): {code: 201, message: "La tua modifica è andata a buon fine!"};
        if (err) console.log(err);
        else updateFile('Interest', email);
        response.end(JSON.stringify(obj));
    })
}

/*******************************************ELIMINA INTERESSE*************************************************************/

/**
 * Elimima l'interesse specificato dal database.
 * @param {string} email: l'email dell'utente.
 * @param {string} name: il nome dell'interesse da eliminare. Ricordiamo che i nomi degli interessi non si possono ripetere per un singolo utente.
 * @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
 */
module.exports.deleteInterestUpdate = (email, name, response)=>{
    connection.query("DELETE FROM Interest WHERE User ='" + email + "' AND Name = '" + security.checkString(name) + "'", (err) => {
        var obj;
        if (err){
            console.log(err);
            obj = {code : 500, message : "Si è verificato un errore durante la connessione con il database."};
        } else{
            obj = {code: 201, message: "La tua modifica è andata a buon fine!"}
            updateFile('Interest', email);
        }
        response.end(JSON.stringify(obj));  
    });
};

/*******************************************ELIMINA PROFILO***************************************************************/

/**
 * Elimina ogni traccia dell'utente dal database.
 * @param {string} email: l'email dell'utente.
 * @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP. 
 */

module.exports.deleteProfileUpdate = (email, response)=>{
    // DELETE FROM Interest WHERE User = '" + email + "'";
    connection.query("DELETE FROM Interest WHERE User = '" + email + "' ", (err) => {
        var obj;
        if (err){
            console.log(err);
            response.end(JSON.stringify( {code : 500, message : "Si è verificato un errore durante la connessione con il database."}));
        } else{
            connection.query("DELETE FROM User WHERE Email = '" + email + "'", (err) => {
                var obj;
                if (err) console.log(err);
                obj = err?
                    {code : 500, message : "Si è verificato un errore durante la connessione con il database."}:
                    {code: 201, message:'La tua cancellazione è andata a buon fine! Non sei più registrato.'};
                response.end(JSON.stringify(obj));
            });
        }
    })
}

/*******************************************CAMBIA PASSWORD***************************************************************/

module.exports.setPasswordUpdate = (oldpass, newpass, email, response) =>{
    if(!security.checkString(oldpass)) response.end(JSON.stringify({code : 400, message : 'Non puoi inserire i caratteri " < >.'}));
    if (!security.checkString(newpass)) response.end(JSON.stringify({code : 400, message : 'Non puoi inserire i caratteri " < >.'}));
    oldpass = security.encodePassword(oldpass);
    connection.query("SELECT Password FROM User WHERE Email = '" + email + "'", (err, resQuery)=>{
        if(err){
            console.log(err);
            response.end(JSON.stringify({code: 500, message : 'Si è verificato un errore.'}));
        }else if(resQuery[0].Password != oldpass) response.end(JSON.stringify({code: 401, message : 'La password inserita è errata.'}));
        else {
            connection.query("UPDATE User SET Password = '" + security.encodePassword(newpass) + "' WHERE Email = '" + email + "'", (err)=>{
                var obj;
                if(err) console.log(err);
                obj = err? {code: 500, message : 'Si è verificato un errore.'}: {code:201, message : "La tua password è stata modificata!"};
                response.end(JSON.stringify(obj));
            });
        }
    })
};

/**
 * Aggiorna il file session.json a seconda del parametro table specificato, in modo da non riaggiornarlo tutto,
 * ma solo la sezione che ha subito modifiche.
 * Interroga la tabella table alle righe corrispondenti all'email table specificata e inserisce il risultato nel file session.json.
 * @param {string} table La tabella da interrogare.
 * @param {string} email L'email dell'utente che ha apportato modifiche.
 */
function updateFile(table, email){
    var column = table =="User"? "Email":"User";
    connection.query("SELECT * FROM " + table + " WHERE " + column +  " = '" + email + "'", (err, resQuery) => {

        var fs = require('fs');
        fs.readFile('session.json', (err, s) =>{
            s = JSON.parse(s);

            if(table == 'User'){
                s.Nickname = security.decodeString(resQuery[0].Nickname);
                s.Province = resQuery[0].Province;
            } else {
                resQuery.forEach(inter =>{ inter = security.decodeInterest(inter)})
                s.Interests = resQuery; 
            }
            fs.writeFile('session.json', JSON.stringify(s), ()=>{console.log("Il file session.json è stato aggiornato.")});            
        });
    });
}
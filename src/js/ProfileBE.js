var connection = require('./Database').connection;
var security = require('./Security');
/**
* Apporta le modifiche alle informazioni dell'utente seguendo i parametri inseriti.
* @param {string} column la colonna corrispondente al valore da modificare; può essere Nickname o Province.
* @param {string} value il nuovo valore che deve assumere column
* @param {string} email l'email dell'utente.
* @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
*/
module.exports.setInformationUpdate = (column, value, email, response)=>{
    value = security.checkString(value);
    if(!value) response.end(JSON.stringify({code:205, message: 'Non puoi inserire i simboli <, >, "'}));
    else{
        connection.query("UPDATE User SET " + column + " = '" + value + "' WHERE Email = '" + email + "'", (err) => {
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
    value = security.checkString(value);
    if(!value) response.end(JSON.stringify({code:205, message: 'Non puoi inserire i simboli <, >, "'}));
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

/**
 * Aggiunge alla tabella degli interessi, l'interesse con le informazioni specificate e ritorna un file JSON contente un codice e un messaggio.
 * Gli apostrofi vengono sostituiti con [39].
 * @param {string} email l'email dell'utente.
 * @param {string} name il nome dell'interesse.
 * @param {string[]}keys la lista di parole chiave.
 * @param {string} description la descrizione dell'interesse.
 * @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
 * */
module.exports.addInterestUpdate = (email, interest, response) =>{
    interest = security.checkInterest(interest);
    if(!interest) response.end({code:205, message: 'Non puoi inserire i simboli <, >, "'});
    var list_keys='';
    var values= '';
    var k = 0;
    interest.keys.forEach((key)=>{
        if(key !=null){
            k+=1;
            list_keys += 'Key'+(k) + ', ';
            values+= " '" + interest.keys[i] + "', ";
        }
    })
    var sql = "INSERT INTO Interest (User, Name, " + list_keys + " Description) VALUES ( '" + email + "', '" + interest.name + "', " + values + "'"+ interest.description + "')";
    connection.query(sql, (err) => {
        var obj = err? 
                ( err.toString().indexOf("ER_DUP_ENTRY: Duplicate entry '" + value)!= -1? 
                    {code: 205, message: "Il nome inserito appartiene già ad un tuo interesse."}: 
                    {code : 500, message : "Si è verificato un errore durante la connessione con il database."} 
                ): {code: 201, message: "La tua modifica è andata a buon fine!"};
        if (err) console.log(err);
        else updateFile('Interest', email);
        response.end(JSON.stringify(obj));
    })
}

/**
 * Elimima l'interesse specificato dal database.
 * @param {string} email: l'email dell'utente.
 * @param {string} name: il nome dell'interesse da eliminare. Ricordiamo che i nomi degli interessi non si possono ripetere per un singolo utente.
 * @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
 */
module.exports.deleteInterestUpdate = (email, name, response)=>{
    connection.query("DELETE FROM Interest WHERE User ='" + email + "' AND Name = '" + securiry.checkString(name) + "'", (err) => {
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

/**
 * Elimina ogni traccia dell'utente dal database.
 * @param {string} email: l'email dell'utente.
 * @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP. 
 */

module.exports.deleteProfileUpdate = (email, response)=>{
    // DELETE FROM Interest WHERE User = '" + email + "'";
    connection.query("DELETE FROM User WHERE Email = '" + email + "' ", (err) => {
        var obj;
        if (err){
            console.log(err);
            response.end(JSON.stringify( {code : 500, message : "Si è verificato un errore durante la connessione con il database."}));
        } else{
            connection.query("DELETE FROM Interest WHERE User = '" + email + "'", (err) => {
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

module.exports.setPasswordUpdate = (oldpass, newpass, email, response) =>{

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
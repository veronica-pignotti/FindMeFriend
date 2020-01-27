var connection = require('./Database').connection;

/**
* Apporta le modifiche alle informazioni dell'utente seguendo i parametri inseriti.
* @param {string} column la colonna corrispondente al valore da modificare; può essere Nickname o Province.
* @param {string} value il nuovo valore che deve assumere column
* @param {string} email l'email dell'utente.
* @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
*/
module.exports.setInformationUpdate = (column, value, email, response)=>{

    var sql = "UPDATE User SET " + column + " = '" + value + "' WHERE Email = '" + email + "'";
    connection.query(sql, (err) => {
        var n = err? 0:1;
        var mess = err? ( err.toString().indexOf("ER_DUP_ENTRY: Duplicate entry '" + value)!= -1? "Nickname già utilizzato!": 'Si è verificato un errore.' ): 'La modifica è andata a buon fine.';
        if (err) console.log(err);
        else updateFile('User', email);
        response.end(JSON.stringify({code : n , message:mess}));
    });
}

/**
* Apporta le modifiche agli interessi dell'utente seguendo i parametri inseriti.
* @param {string} column la colonna corrispondente al valore da modificare.
* @param {string} value il nuovo valore che deve assumere column
* @param {string} email l'email dell'utente.
* @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
*/
module.exports.setInterestUpdate = (column, value, name, email, response)=>{

    var sql = "UPDATE Interest SET " + column + " = '" + value + "' WHERE User = '" + email + "' AND Name = '" + name + "'";
    connection.query(sql, (err) => {
        var n = err? 0:1;
        var mess = err? ( err.toString().indexOf("ER_DUP_ENTRY: Duplicate entry '" + value)!= -1? "Il nome inserito appartiene già ad un tuo interesse.": 'Si è verificato un errore.' ): 'La modifica è andata a buon fine.';
        if (err) console.log(err);
        else updateFile('Interest', email);
        response.end(JSON.stringify({code : n , message:mess}));
    });
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
module.exports.addInterestUpdate = (email, name, keys, description, response) =>{
    if(name.indexOf("'")!=-1) name = (name.split("'")).join("[39]");
    if(description.indexOf("'")!=-1) description = description.split("'").join("[39]"); 

    var list_keys='';
    var values= '';
    var k = 0;
    for(i=0; i< keys.length; i++) {
        if(keys[i] != 'null'){
            if(keys[i].indexOf("'")!=-1) keys[i] = (keys[i].split("'")).join("[39]").toLowerCase();
            k+=1;
            list_keys += 'Key'+(k) + ', ';
            values+= " '" + keys[i] + "', ";
        } 
    }    
    var sql = "INSERT INTO Interest (User, Name, " + list_keys + " Description) VALUES ( '" + email + "', '" + name + "', " + values + "'"+ description + "')";
    connection.query(sql, (err) => {
        var mess = err?(err.toString().indexOf("ER_DUP_ENTRY: Duplicate entry")!= -1 ? "Non puoi inserire due interessi con lo stesso nome." : "Si è verificato un errore durante l'inserimento dell'interesse."): "L'interesse " + name + " è stato aggiunto";
        var n = err? 0:1;
        if (err) console.log("Si è verificato un errore durante l'inserimento dell'interesse: " + err);
        else updateFile('Interest', email);
        response.end(JSON.stringify({message:mess, code : n}));
    })
}

/**
 * Elimima l'interesse specificato dal database.
 * @param {string} email: l'email dell'utente.
 * @param {string} name: il nome dell'interesse da eliminare. Ricordiamo che i nomi degli interessi non si possono ripetere per un singolo utente.
 * @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
 */
module.exports.deleteInterestUpdate = (email, name, response)=>{
    connection.query("DELETE FROM Interest WHERE User ='" + email + "' AND Name = '" + name + "'", (err) => {
        var n = err? 0:1;
        var mess = err? 'Si è verificato un errore': "Il tuo interesse '" + name + "' è stato eliminato.";
        if(err) console.log(err);
        else updateFile('Interest', email);
        response.end(JSON.stringify({code : n , message:mess}));  
    });
};

/**
 * Elimina ogni traccia dell'utente dal database.
 * @param {string} email: l'email dell'utente.
 * @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP. 
 */

module.exports.deleteProfileUpdate = (email, response)=>{
    var sql = "DELETE FROM User WHERE Email = '" + email + "' " ;// DELETE FROM Interest WHERE User = '" + email + "'";
    connection.query(sql, (err) => {
        if (err) console.log(err);
        var n = err? 0:1;
        var mess = err? 'Si è verificato un errore.' :'La tua cancellazione è andata a buon fine! Non sei più registrato.';
        response.end(JSON.stringify({code:n, message:mess}));
    });
}

/*
Ritorna true se la password specificata corrisponde a quella dell'utente, false altrimenti.
*/
function verifyPassword(email, password){
    return getInformationsAbout(email).Password == encodePassword(password);
}

module.exports.setPasswordUpdate = (oldpass, newpass, email, response) =>{

    var encode = require('./WelcomeBE').encodePassword;
    oldpass = encode(oldpass);
    connection.query("SELECT Password FROM User WHERE Email = '" + email + "'", (err, resQuery)=>{
        if(err){
            console.log(err);
            response.end(JSON.stringify({message : 'Si è verificato un errore.'}));
        }else if(resQuery[0].Password != oldpass) response.end(JSON.stringify({message : 'La password inserita è errata.'}));
        else {

            newpass = encode(newpass)
            connection.query("UPDATE User SET Password = '" + newpass + "' WHERE Email = '" + email + "'", (err)=>{
                if(err) console.log(err);
                response.end(JSON.stringify({message : err? 'Si è verificato un errore.': "La tua password è stata modificata!"}));
            });
        }
    })
};

/**
 * Aggiorna il file session.json a seconda del parametro table specificato, in modo da non riaggiornarlo tutto,
 * ma solo la sezione che ha subito modifiche.
 * Interroga la tabella table alle righe corrispondenti all'email table specificata e inserisce il risultato nel file session.json.
 * Se presenti, le stringhe '[39]' vengono convertiti in apostrofi (').
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
                s.Password = resQuery[0].Password;
                s.Nickname = resQuery[0].Nickname;
                s.Province = resQuery[0].Province;
            } else {
                resQuery.forEach(inter =>{
                    if(inter.Name.indexOf('[39]')!= -1) inter.Name = inter.Name.split("[39]").join("'");
                    if(inter.Key1.indexOf('[39]')!= -1) inter.Key1 = inter.Key1.split("[39]").join("'");
                    if(inter.Key2 && inter.Key2.indexOf('[39]')!= -1) inter.Key2 = inter.Key2.split("[39]").join("'");
                    if(inter.Key3 && inter.Key3.indexOf('[39]')!= -1) inter.Key3 = inter.Key3.split("[39]").join("'");
                    if(inter.Key4 && inter.Key4.indexOf('[39]')!= -1) inter.Key4 = inter.Key4.split("[39]").join("'");
                    if(inter.Description.indexOf('[39]')!= -1) inter.Description = inter.Description.split("[39]").join("'");
                })
                s.Interests = resQuery; 
            }
            fs.writeFile('session.json', JSON.stringify(s), ()=>{console.log("Il file session.json è stato aggiornato.")});            
        });
    });
}
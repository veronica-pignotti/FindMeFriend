var connection = require("./Database").connection;
var fs = require('fs');

/***********************************************RICERCA*******************************************************************/
/**
* Ritorna il risultato della ricerca con i parametri inseriti.
* Se l'utente non specifica la provincia in cui cercare, viene presa in considerazione quella dell'utente stesso.
* Se l'utente specifica la parola chiave, viene presa in considerazione nella ricerca.
* Si considerano, inoltre, i nomi dei suoi interessi: verranno selezionate tutte le istanze che nei loro 
* interessi (nel nome e nelle parole chiave) hanno i nomi degli interessi dell'utente.
* Vengono infine controllati i valori dell'età.
* @param province : la provincia inserita dall'utente. Se non presente, viene considerata quella dell'utente stesso.
* @param word : la parola chiave inserita dall'utente.
* @param ageMin : l'età minima di ricerca inserita dall'utente.
* @param ageMax: l'età massima di ricerca inserita dall'utente.
* @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
*/
module.exports.search = (province, word, ageMin, ageMax, response)=>{

    var years = check([ageMin, ageMax]);
    
    fs.readFile('session.json', (err, data) =>{
        data = JSON.parse(data);
        if (err){ 
            console.log("C'è stato un errore con la lettura del file : " + err);
            response.end(JSON.stringify({code : 0, res :[]}))
        }else if(word) word = " AND ( Interest.Name = '" + word + "' OR Key1 = '"+ word + "' OR Key2 = '" + word + "' OR Key3 = '" + word + "' OR Key4 = '" + word + "')";
        else{
            word ='';
            data.Interests.forEach((inter, index) =>{

                word += index==0? ' AND (':' OR ';
                word +="( Interest.Name = '" + inter.Name + "' OR Key1 = '" + inter.Name + "' OR Key2 = '" + inter.Name + "' OR Key3 = '" + inter.Name + "' OR Key4 = '" + inter.Name + "')";
                if (index == data.Interests.length-1) word += ")";
            })
        }
        province =  "' AND Province = '" + (province? province: data.Province) + "'";

        var select = "SELECT Email, Nickname, Year, Province, Interest.Name AS Name, Key1, Key2, Key3, Key4 FROM Interest JOIN User ON User.Email = Interest.User WHERE User.Email <> '" + data.Email + province + word + years;

        connection.query(select, (err, result) => {

            if(err){ 
                console.log(err);
                response.end(JSON.stringify({code : 0, res :[]}))
            }else {
                if (result.length == 0) response.end(JSON.stringify({code : 1, res :[]}));
                else extractCommonInterests(result, data.Interests, response);
            }
        });
    })
}

/**
 * Converte e ordina l'array di età passato passato e produce una stringa in base a questi valori, da 
 * inserire nella chiamata al database.
 * @param {int[]} arr : l'array contenente l'età minima e l'età massima.
 */
function check(arr) {
    var current = new Date().getFullYear();
    for(i = 0; i < 2; i++) arr[i] = current - arr[i];
    arr.sort();
    return arr[0]==arr[1]?' AND Year = ' + arr[0]: ' AND Year >= ' + arr[0] + ' AND Year<=' + arr[1]; 
}

/**
* Ritorna una tabella contenente le informazioni che dovranno essere visualizzate nei risultati della Home.
* La tabella "interested_people" ha come colonne: Email, Nickname, Year, Province, Interest.Name, Key1, Key2, Key3, Key4.
* La tabella "user_interests" ha come colonne Interest.Name, Key1, Key2, Key3, Key4, Description.
*/
function extractCommonInterests(interested_people, user_interests, response){

    var table = [];
    var currentEmail = "";
    
    interested_people.forEach((row) =>{
        if(currentEmail != row.Email){
            currentEmail = row.Email;
            table.push({
                Email : currentEmail,
                Nickname: row.Nickname,
                Year: row.Year,
                Province : row.Province,
                Compatibility: 0,
                CommonInterests : []
            });
        }
        user_interests.forEach(inter =>{

            var name = inter.Name;
            if( name == row.Name | name == row.Key1 | name == row.Key2 | name == row.Key3 | name == row.Key4 ) table[table.length-1].CommonInterests.push(name);
        });
    })
    table.forEach(r=>{r.Compatibility = Math.round(r.CommonInterests.length*100/user_interests.length)});
    table.sort((a,b)=>{
        return a.Compatibility > b.Compatibility? -1: (a.Compatibility < b.Compatibility?1:0);
    });
    response.end(JSON.stringify({code : 1, res:table})); 
}

   
/*-------------------------------------VISUALIZZA PROFILO---------------------------------------------------------------------- */

/**
 * Ritorna le informazioni mancanti per visualizzare il profilo di @param email.
 * @param {string} email : l'email del profilo in cui bisogna estrarre le informazioni mancanti.
 * @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
 */
module.exports.getMissingInformations = (email, response)=>{
    var obj;
    var mess;
    connection.query("SELECT User.Name AS UserName, Surname, Interest.Name AS InterName, Description FROM User JOIN Interest ON Email = User WHERE Email = '" + email + "'", (err, res) =>{
        
        if (err){
            console.log('Si è verificato un errore: ' + err);
            mess = 'Si è verificato un errore';
            obj = null;
        }else{
            mess ='';
            obj = { Name: res[0].UserName, Surname: res[0].Surname, Interests: []};
            res.forEach(row =>{ obj.Interests.push({Name: row.InterName, Description: row.Description })});
        }
        response.end(JSON.stringify({message: mess, object: obj}));
    })
}
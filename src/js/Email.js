var nodemailer = require('nodemailer');
var fs = require('fs');
var security = require("./Security");
var test = true;

/**
* Invia una mail con i parametri specificati nell'oggetto @param object.
* @param {object} object : l'oggetto contenente tutte le informazioni necessarie per l'invio delle email.
* @param {Response} response l'oggetto di tipo Response che permette di inviare la risposta HTTP.
*/
module.exports.sendEmail = (object, response)=>{
    if(security.checkEmail(object)) response.end(JSON.stringify({code : 400, message : 'Non puoi inserire i caratteri " < >.'}));
    else if(test) this.sendEmailTest(object, response); // riga inserita per permettere i test
    else{
        fs.readFile('session.json', (err, data)=>{
            if(err){
                console.log(err);
                response.end(JSON.stringify({code :500, message: 'Si è verificato un errore!'}))
            }
            data = JSON.parse(data);
            // STEP 1: Estraggo l'indirizzo email dell'utente dal file.
            var sender = data.Email;
            var serv = (mitt.split("@")[1]).split(".")[0];

            // STEP 2 : Preparo i dati per l'email
            var mail = {
                from: object.sender ==''? sender:object.sender,
                to: object.to == ''? 'veronica.pignotti@studenti.unicam.it': object.to, // "to" vuoto solo se l'email è stata inviata senza fare il login
                subject: object.subj,
                text: object.text,
            };
            
            // STEP 3: Preparo il service in base a serv.
            var transporter;
            if(serv == 'outlook' || serv == 'msn'){ 
                transporter =  nodemailer.createTransport({
                    host: "smtp-mail.outlook.com", // hostname
                    secureConnection: false, // TLS requires secureConnection to be false
                    port: 587, // port for secure SMTP
                    tls: {
                       ciphers:'SSLv3',
                       rejectUnauthorized: false
                    },
                    auth: {user: sender, pass: object.password}
                });
            } else if(serv == 'hotmail' || serv == 'live'){ 
                transporter = nodemailer.createTransport( {
                    service: "hotmail",
                    tls: {
                        rejectUnauthorized: false
                    },
                    auth: {user: sender, pass: object.password}
                });
            }else if(serv == 'libero'){
                transporter = nodemailer.createTransport({
                    host: "smtp.libero.it",
                    port: 465,
                    tls: {
                        ciphers:'SSLv3',
                        rejectUnauthorized: false
                    },
                    auth: {user: sender, pass: object.password}
                    }); 
            }
    
            // STEP 4: Verifico la connessione
            transporter.verify((err) => { 
                if (err){
                    console.log(err);
                    response.end(JSON.stringify({code:500, message:'Si è verificato un errore con la connessione'}));
                }

                //STEP 5 : se non ci sono errori, invio l'email.
                transporter.sendMail(mail, (error) => {
                    console.log(error? error: 'messaggio inviato!');
                    response.end(JSON.stringify(err?{code:500, message: "Si è verificato un errore durante l'invio del messaggio"}:{code:200, message: "Il tuo messaggio è stato inviato!"}));            
                });
            })
        })
    }
}

var recipients = "pignlu@libero.it, silvana.rainati@hotmail.it, pignotti.veronica@outlook.com, veronickmsn94@msn.com, veronicapignotti94@gmail.com";

module.exports.sendEmailTest = (object, response)=>{

    var index = 1; // Da 0 a 3 poichè il 5° elemento corrisponde all'email gmail
    fs.readFile('FileTestEmail.json', (err, sender)=>{
        if(err){
            console.log(err);
            response.end(JSON.stringify({code : 500, message: 'Si è verificato un errore!'}))
        }
        // STEP 1: Estraggo l'indirizzo email dell'utente dal file.
        sender = JSON.parse(sender)[index];
        
        // STEP 2 : Preparo i dati per l'email
        var mail = {
            from: '"mittente di test" <' + sender.Email + '>',
            to: recipients,
            subject: object.subj,
            text: object.text,
        };
        
        // STEP 3: Preparo il service in base a serv.
        var serv = ((mail.from).split("@")[1]).split(".")[0];

        if(serv == 'outlook' || serv == 'msn'){ 
            transporter =  nodemailer.createTransport({
                host: "smtp-mail.outlook.com",
                secureConnection: false,
                port: 587, 
                tls: {
                    ciphers:'SSLv3',
                    rejectUnauthorized: false
                },
                auth: {user: sender.Email, pass: sender.Password}
            });
        } else if(serv == 'hotmail' || serv == 'live'){ 
            transporter = nodemailer.createTransport( {
                service: "hotmail",
                tls: {
                    rejectUnauthorized: false
                },
                auth: {user: sender.Email, pass: sender.Password}
            });
        }else if(serv == 'libero'){
            transporter = nodemailer.createTransport({
                host: "smtp.libero.it", 
                port: 465,
                    tls: {
                    ciphers:'SSLv3',
                    rejectUnauthorized: false
                    },
                    auth: {user: sender.Email, pass: sender.Password}
                }); 
        } 

        // STEP 4: Verifico la connessione
        transporter.verify((err) => { 
            if (err){
                console.log("Si è verificato un errore durante la verifica di connessione tramite l'indirizzo: %s : %s", sender.Email, err);
                response.end(JSON.stringify({code:500, message:'Si è verificato un errore con la connessione'}));
            }else{
                console.log("Connessione stabilita!");
                console.log("mail from = " + mail.from);

                //STEP 5 : se non ci sono errori, invio l'email.            
                transporter.sendMail(mail, (error) => {
                    console.log(error? "Si è verificato un errore durante l'invio delle email tramite l'indirizzo: " + sender.Email + ":" +  error: 'Messaggio inviato da: ' + sender.Email +  "!");
                    response.end(JSON.stringify(err?{code:500, message: "Si è verificato un errore durante l'invio del messaggio"}:{code:200, message: "Il tuo messaggio è stato inviato!"}));            
                })
            }
        }) // chiude verify
    }) // chiude readfile
}
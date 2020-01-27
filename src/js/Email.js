var nodemailer = require('nodemailer');
var fs = require('fs');

var test = true;
var recipients = "leonardodigiacinto@live.it, pignlu@libero.it, silvana.rainati@hotmail.it, veronickmsn94@msn.com, pignotti.veronica@outlook.com, veronicapignotti94@gmail.com,*/

/**
* Invia una mail con i parametri specificati. Ritorna true se l'invio è andato a buon fine, false altrimenti.
*/
module.exports.sendEmail = (object, response)=>{
    if(test) this.sendEmailTest(object, response);
    else{
        fs.readFile('session.json', (err, data)=>{
            if(err){
                console.log(err);
                response.end(JSON.stringify({message: 'Si è verificato un errore!'}))
            }
            data = JSON.parse(data);
            // STEP 1: Estraggo l'indirizzo email dell'utente dal file.
            var sender = data.Email;
            var serv = (mitt.split("@")[1]).split(".")[0];

            // STEP 2 : Preparo i dati per l'email
            var mail = {
                from: object.sender ==''? sender:object.sender,
                to: object.to == ''? 'veronica.pignotti@studenti.unicam.it': object.to,
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
            } else if(serv == 'gmail'){
                transporter =  nodemailer.createTransport({
                    //host: "smtp.gmail.com", // hostname
                    //secure : true,
                    service:'gmail',
                    // secureConnection: 'false', // TLS requires secureConnection to be false
                    // port: 465, //587, //465, // port for secure SMTP
                    //  tls: {
                    // //    ciphers:'SSLv3',
                    //      rejectUnauthorized: false
                    // },
                    auth: {user: sender.Email, pass: sender.Password}
                });
            } 
    
            // STEP 4: Verifico la connessione
            transporter.verify((err) => { 
                if (err){
                    console.log(err);
                    response.end(JSON.stringify({code:0, message:'Si è verificato un errore con la connessione'}));
                }

                //STEP 5 : se non ci sono errori, invio l'email.
                transporter.sendMail(mail, (error) => {
                    console.log(error? error: 'messaggio inviato!');
                    response.end(JSON.stringify(err?{code:0, message: "Si è verificato un errore durante l'invio del messaggio"}:{code:1, message: "Il tuo messaggio è stato inviato!"}));            
                });
            })
        })
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.sendEmailTest = (object, response)=>{

    console.log("sono in send emal test")

    var index = 2; // Da 0 a 3
    fs.readFile('FileTestEmail.json', (err, sender)=>{
        if(err){
            console.log(err);
            response.end(JSON.stringify({message: 'Si è verificato un errore!'}))
        }
        // STEP 1: Estraggo l'indirizzo email dell'utente dal file.
        sender = JSON.parse(sender)[index];
        
        // STEP 2 : Preparo i dati per l'email
        var mail = {
            from: '"mittente" <' + sender.Email + '>',
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
        }else if(serv == 'gmail'){
            transporter =  nodemailer.createTransport({
                //host: "smtp.gmail.com", // hostname
                //secure : true,
                service:'gmail',
                // secureConnection: 'false', // TLS requires secureConnection to be false
                // port: 465, //587, //465, // port for secure SMTP
                //  tls: {
                // //    ciphers:'SSLv3',
                //      rejectUnauthorized: false
                // },
                auth: {user: sender.Email, pass: sender.Password}
            });
        } 

        // STEP 4: Verifico la connessione
        transporter.verify((err) => { 
            if (err){
                console.log("Si è verificato un errore durante la verifica di connessione tramite l'indirizzo: %s : %s", sender.Email, err);
                response.end(JSON.stringify({code:0, message:'Si è verificato un errore con la connessione'}));
            }else{
                console.log("Connessione stabilita!");
                console.log("mail from = " + mail.from);

                //STEP 5 : se non ci sono errori, invio l'email.            
                transporter.sendMail(mail, (error) => {
                    console.log(error? "Si è verificato un errore durante l'invio delle email tramite l'indirizzo: " + sender.Email + ":" +  error: 'Messaggio inviato da: ' + sender.Email +  "!");
                    response.end(JSON.stringify(err?{code:0, message: "Si è verificato un errore durante l'invio del messaggio"}:{code:1, message: "Il tuo messaggio è stato inviato!"}));            
                })
            }
        }) // chiude verify
    }) // chiude readfile
}
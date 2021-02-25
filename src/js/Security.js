/**
 * Controlla la stringa passata se ha al suo interno i caratteri che mettono a rischio la sicurezza del sistema (<,>,").
 * Ritorna null se la stringa non è valida, altrimenti effettua ulteriori controlli e ritorna la stringa convertita.
 * @param {string} str: la stringa da controllare e convertire. 
 */
module.exports.checkString = (str) =>{
    return str.indexOf("<") != -1 || str.indexOf(">") != -1 || str.indexOf('"') != -1?
        null:
        (str=="null"? "" : encodeString(str));
}

/**
 * Sostituisce tutti gli apostrofi con la stringa [39].
 * @param {string} str la stringa da convertire.
 */
function encodeString(str){
    return str.indexOf("'") != -1 ? (str.split("'")).join("[39]") : str;
}

/**
 * Sostituisce tutti le stringhe [39] con gli apostrofi.
 * @param {string} str la stringa da converitire.
 */
module.exports.decodeString = (str) =>{
    return  str.indexOf('[39]')!= -1 ? str.split("[39]").join("'") : str;
}

/**
 * Cripta la password @param password utilizzando l'algoritmo SHA256.
 * @param password : la password da criptare.
 * @returns la password criptata.
 */
module.exports.encodePassword = (password)=>{
    return require('crypto').createHash('sha256').update(password).digest('hex');
}

module.exports.checkUser = (user) =>{
    user.email = this.checkString(user.email)
    user.name = this.checkString(user.name);
    user.surname = this.checkString(user.surname);
    user.nickname = this.checkString(user.nickname);
    return !user.email || !user.name || !user.surname || !user.nickname?
        null :
        user;   
}

module.exports.checkInterest = (interest) =>{
    interest = {
        name : this.checkString(interest.name),
        key1 : this.checkString(interest.key1), 
        key2 : interest.key2 == "null"? "" : this.checkString(interest.key2), 
        key3 : interest.key3 == "null"? "" : this.checkString(interest.key3), 
        key4 : interest.key4 == "null"? "" : this.checkString(interest.key4),        
        description: this.checkString(interest.description)
    }
    return !interest.name || !interest.key1 || interest.key2== null || interest.key3== null || interest.key4 == null || !interest.description  ? null : interest;
}

module.exports.decodeInterest = (interest) =>{
    return{
        name: this.decodeString(interest.Name),
        keys: [
            this.decodeString(interest.Key1),
            interest.Key2? this.decodeString(interest.Key2):"",
            interest.Key3? this.decodeString(interest.Key3):"",
            interest.Key4? this.decodeString(interest.Key4):""
        ],
        description: this.decodeString(interest.Description)
    } 
}

module.exports.checkEmail = (email) => {
    return  !this.checkString(email.sender) ||
            !this.checkString(email.to) ||
            !this.checkString(email.text) ?
            null: 
            email;
}
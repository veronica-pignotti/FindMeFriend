/**
 * Controlla la stringa passata se ha al suo interno i caratteri che mettono a rischio la sicurezza del sistema (<,>,").
 * Ritorna null se la stringa non è valida, altrimenti effettua ulteriori controlli e ritorna la stringa convertita.
 * @param {string} str: la stringa da controllare e convertire. 
 */
module.exports.checkString = (str) =>{
    return str.indexOf("<") != -1 || str.indexOf(">") != -1 || str.indexOf('"') != -1? null : encodeString(str);
}

/**
 * Sostituisce tutti gli apostrofi con la stringa [39].
 * @param {string} str la stringa da converitire.
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
    return (!user.email || !user.name || !user.surname || !user.nickname) ? null : user;
}

module.exports.checkInterest = (interest) =>{
    interest = {
        name:this.checkString(interest.name),
        keys:[this.checkString(interest.keys[0]), this.checkString(interest.keys[1]), this.checkString(interest.keys[2]), this.checkString(interest.keys[3])],
        description: this.checkString(interest.description)
    } 
    return (!interest.name || !interest.keys[0] || !interest.keys[1] || !interest.keys[2] || !interest.keys[3] || !description ) ? null : interest;
}

module.exports.decodeInterest = (interest) =>{
    return {
        name:decodeString(interest.name),
        keys:[decodeString(interest.keys[0]), decodeString(interest.keys[1]), decodeString(interest.keys[2]), decodeString(interest.keys[3])],
        description: decodeString(interest.description)
    } 
}
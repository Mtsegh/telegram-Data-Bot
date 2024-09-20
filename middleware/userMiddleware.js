const bcrypt = require("bcryptjs");

const encryptPassword = function(userSchema) {
    userSchema.pre("save", async function (next) {
        if (!this.isModified("password")) {
            return next();
        }
      
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    });
}

const generateReferenceId = (param) => {
    const prefix = Date.now().toString().slice(5);
    const characters = param?param:'NOPACBDEFH';
    let referenceId = prefix + generateRandomString(2, characters); // 2 characters after '@'...
    
    return referenceId;
};

// Function to generate a random string refIdf specified length
function generateRandomString(length, characters) {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        
    }
    return result;
}

module.exports = {
    encryptPassword,
    generateReferenceId,
    generateRandomString
}

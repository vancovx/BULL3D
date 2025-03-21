const mogoose = require('mongoose')

//Funcion 
const connectDB = async () => {
    try{
        const conn = await mogoose.connect(process.env.MONGO_URI)
        console.log(`MondoDB Connectese: ${conn.connection.host}`.cyan.underline);
    }catch (error){
        console.log(error);
        process.exit(1)
    }
}

module.exports = connectDB
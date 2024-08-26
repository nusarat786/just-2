const jwt = require('jsonwebtoken');
const userSchema = require('../Schema/userSchema.js')

const auth = async (req,res,next) =>{

    try{
        //console.log(req.cookies);
        const token = req.cookies.jwt;
        //console.log("jwt is : " +jwt)
        const verifyuser = jwt.verify(token,"mynameisnusarathaveliwalaiammcastudent");
        //console.log(verifyuser);
        
        const user = await userSchema.findOne({_id:verifyuser._id});
        //console.log(user);
        req.user = user;
        next();

    }catch(err){
        console.log(err);
        res.status(401).json(err);
    } 
}







module.exports = auth;
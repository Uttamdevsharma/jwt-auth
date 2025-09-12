const jwt = require("jsonwebtoken")

const verifyToken = (req,res,next) => {

    const authHeaders = req.headers.authorization;
    const token = authHeaders && req.headers.authorization.split(' ')[1]
    
    if(!token) return res.send({message : "Access Denied , Unauthorized token"  })

    jwt.verify(token , process.env.JWT_SECRET_KEY , (err, user) => {
        if(err) return res.send({message : "Invalid Token"})

            req.user = user
            next()    
    })    

   

}

module.exports = {
    verifyToken
}
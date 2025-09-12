const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000

//middleware
app.use(express.json())
app.use(cors())

// mongodb connect


const uri = process.env.MONGODB_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    // create db and collection
    const db = client.db("auth-Management");
    const userCollection = db.collection("users")
    const transactionCollection = db.collection("transaction")

    // await  userCollection.insertOne({
    //     email : "user1@gmail.com",
    //     password : 1234

    // })

   

    // register user
    app.post("/register" , async(req,res) => {
        const {email, password} = req.body;

        try{
            const existUser = await userCollection.findOne({ email: email });
            if (existUser) {
              return res.send({ message: "User already created" });
            }
            
            const hashPassword = await bcrypt.hash(password, 10);
           
            const newUser = {
                email,
                password : hashPassword,
                role : "user",
            }

            const result = await userCollection.insertOne(newUser);
            res.status(201).json({
                message : "User Created Successfully",
                result
            })
        }catch(error) {
            res.send({
                message : "not created",
                error
            })
        }
    })


    //login user
    app.post("/login" , async(req,res) => {
        const {email,password} = req.body;

        try {
            const user = await userCollection.findOne({email : email})
            if(!user) return res.send({message : "user not found"})

            const isPasswordValid = await bcrypt.compare(password,user.password )
            if(!isPasswordValid) return res.send({message : "password Credential"}) 

            const token  = jwt.sign({userId : user._id, role : user.role} , process.env.JWT_SECRET_KEY , { expiresIn: '1h' })    
            
            res.send({message : "User Login Successfully" , token})    

        } catch(error){
            res.send({message : "wrong", error})
        }
    })





    app.get("/users" , async(req,res) => {
        const result = await userCollection.find({},{projection : {password : 0}}).toArray()
        res.send({
            result
        })
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Authentication and Authorization system')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

//  uttamrohit4545_db_user
//  AzvpHOzzas4RgGfc

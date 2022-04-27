const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 4000



//middleware

app.use(cors());
app.use(express.json())

function verifyJWT(req, res, next) {
    const headerAuth = req.headers.authorization
    if(!headerAuth){
        return res.status(401).send({message: 'Invalid authorization'})
    }
    const token = headerAuth.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN_Secret, (err,decoded) => {
        if(err) return res.status(403).send({message: 'forbidden access'})
        
        req.decoded = decoded
        // console.log(decoded)
        next()
    })
    
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vu0hy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try {
        await client.connect()
        const serviceCollection = client.db('geniusCar').collection('service')
        const orderCollection = client.db('geniusCar').collection('order')

        app.get('/service', async (req, res) =>{
            const query = {}
            const cursor = serviceCollection.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })

        // AUTH 
        app.post('/login', async (req, res)=>{
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_Secret, {
                expiresIn: '1d'
            })
            res.send({accessToken: token})
        })

        // services api
        app.get('/service/:id', async (req, res) =>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })


        app.post('/service',async (req, res)=>{
            const newService = req.body
            console.log('adding new user', newService )
            const result = await serviceCollection.insertOne(newService)
            res.send(result)
        })

        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id : ObjectId(id)}
            const result = await serviceCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/order', verifyJWT, async (req, res)=>{
            const decodedEmail = req.decoded.email
            // console.log(decodedEmail)
            const email = req.query.email
            if(email === decodedEmail){
                const query = {email: email}
            const cursor = orderCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)
            }
            else{
                res.status(403).send({message: 'forbidden access'})
            }
        })

        app.post('/order', async (req, res)=>{
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })

    }
    finally{

    }



}

run().catch(console.dir)


app.get('/',(req, res) => {
    res.send('Running G Server')
})


app.listen(port, ()=> {
    console.log(port)
})
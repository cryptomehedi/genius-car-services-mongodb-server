const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { get } = require('express/lib/response');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 4000


//middleware

app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vu0hy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try {
        await client.connect()
        const serviceCollection = client.db('geniusCar').collection('service')

        app.get('/service', async (req, res) =>{
            const query = {}
            const cursor = serviceCollection.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })

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
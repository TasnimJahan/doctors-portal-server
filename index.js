const express = require('express')
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stbya.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db(`${process.env.DB_NAME}`).collection("appointment");


  //add apoinment er popup e ja valuedibo. name,age,weight etc eshob joma hobe.
  app.post('/addAppointment', (req,res)=> {
    const appointment = req.body;
    console.log("appointment", appointment);
    appointmentCollection.insertOne(appointment)
    .then(result =>{
      res.send(result.insertedCount>0)
    })
  })



  //date omujai appointement show korar post deoa
  app.post('/appointmentsByDate', (req,res)=> {
    const date = req.body;
    console.log("date", date.date);
    appointmentCollection.find({date:date.date})
    .toArray((err,documents) =>{
      res.send(documents);
    })
    // .then(result =>{
    //   res.send(result.insertedCount>0)
    // })
  })






  // client.close();
});





app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
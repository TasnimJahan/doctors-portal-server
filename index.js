const express = require('express')
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const fileUpload =require('express-fileUpload');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());

app.use(express.static('doctors')); //doctors folder e rakhbo tai ekhane doctors likhechi
app.use(fileUpload());


app.get('/', (req, res) => {
  res.send('Hello World!')
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stbya.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db(`${process.env.DB_NAME}`).collection("appointment");
  const doctorCollection = client.db(`${process.env.DB_NAME}`).collection("doctors");


  //add apoinment er popup e ja valuedibo. name,age,weight etc eshob joma hobe.
  app.post('/addAppointment', (req,res)=> {
    const appointment = req.body;
    console.log("appointment", appointment);
    appointmentCollection.insertOne(appointment)
    .then(result =>{
      res.send(result.insertedCount>0)
    })
  })



//shob golo patients er details dekhar jnno
  app.get('/appointments', (req, res) => {
    appointmentCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
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
  })




  //doctors er pic uploade
  app.post('/addADoctor',(req, res) =>{
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    console.log(name,email,file);

    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
  };

  doctorCollection.insertOne({ name, email, file })
      .then(result => {
          res.send(result.insertedCount > 0);
      })
      

      //extra
    file.mv(`${__dirname}/doctors/${file.name}`,err =>{
      if(err){
        console.log(err);
        return res.status(500).send({message:'Failed to upload image'});
      }
      return res.send({name:file.name,path:`/${file.name}`})
    })

  })




  // j j doctor golo ache tader list eith name and pic show kora 
  app.get('/doctors', (req, res) => {
    doctorCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});





  // client.close();
});





app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
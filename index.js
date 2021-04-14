const express = require('express')
const app = express();
const cors = require('cors');
const fs = require('fs-extra');
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






  //date omujai appointement show korar post deoa & id dr na hy se shb dekhte parbena . je tarikhe se koreche oi tarikhe click korle only nijer ta dekhbe
  app.post('/appointmentsByDate', (req,res)=> {
    const date = req.body;
    const email = req.body.email;
    console.log("date", date.date);


    doctorCollection.find({email:email})
    .toArray((err,doctors) =>{
      const filter = {date:date.date}
      if(doctors.length===0){
        filter.email=email;
      }

        appointmentCollection.find(filter)
        .toArray((err,documents) =>{
        res.send(documents);
        })
      
    })
    
  })




  //doctors er pic uploade
  app.post('/addADoctor',(req, res) =>{
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    console.log(name,email,file);
    const filePath = `${__dirname}/doctors/${file.name}`;

    file.mv(filePath,err =>{
      if(err){
        console.log(err);
        return res.status(500).send({message:'Failed to upload image'});
      }
      var newImg = fs.readFileSync(filePath);
      const encodedImg = newImg.toString('base64');

      var image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer(encImg, 'base64')
    };


      doctorCollection.insertOne({name,email,image})
      .then(result =>{
        fs.remove(filePath,error =>{
          if(error){
            console.log(error);
            res.status(500).send({message:'Failed to upload image'});
          }
          res.send(result.insertedCount > 0)
        })     
      })
      // return res.send({name:file.name,path:`/${file.name}`})
    })
  })




  



  // j j doctor golo ache tader list eith name and pic show kora 
  app.get('/doctors', (req, res) => {
    doctorCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});





//ei user ki dr or not ta dekhar jnno
app.post('/isDoctor', (req,res)=> {
  const email = req.body.email;
  console.log("date", date.date);


  doctorCollection.find({email:email})
  .toArray((err,doctors) =>{
    res.send(doctors.length>0);

    // const filter = {date:date.date}
    // if(doctors.length===0){
    //   filter.email=email;
    // }
      // appointmentCollection.find(filter)
      // .toArray((err,documents) =>{
      // res.send(documents);
      // })
  })
})



  // client.close();
})





app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
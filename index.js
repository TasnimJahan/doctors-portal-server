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
  res.send('Hello doctorss!')
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stbya.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db(`${process.env.DB_NAME}`).collection("appointment");
  const doctorCollection = client.db(`${process.env.DB_NAME}`).collection("doctors");

  const postCollection = client.db(`${process.env.DB_NAME}`).collection("posts");
  const cCollection = client.db(`${process.env.DB_NAME}`).collection("comments");


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





  // // doctors er pic upload previous version
  // app.post("/addADoctor", (req, res) => {
  //     const file = req.files.file;		
  //     const name = req.body.name;		
  //     const email = req.body.email;		
  //     console.log(name, email, file);		
  //     file.mv(`${__dirname}/doctors/${file.name}`, (err) => {		
  //       if (err) {				
  //         console.log(err);				
  //         return res.status(500).send({msg: "Failed to upload image in the server",});			
  //       }			   	
  //     doctorCollection.insertOne({name,email,img: file.name})
  //     .then((result) => {			
  //       res.send(result.insertedCount > 0);		
  //     });	
  //     // return res.send({name:file.name,path:`/${file.name}`})	
  //   })
  // });	




  // // doctors er pic upload
  // app.post('/addADoctor',(req, res) =>{
  //   const file = req.files.file;
  //   const name = req.body.name;
  //   const email = req.body.email;
  //   console.log(name,email,file);
  //   // const filePath = `${__dirname}/doctors/${file.name}`;

  //   // file.mv(filePath,err =>{
  //   //   if(err){
  //   //     console.log(err);
  //   //     return res.status(500).send({message:'Failed to upload image'});
  //   //   }
  //     // var newImg = fs.readFileSync(filePath);
  //     var newImg = file.data;
  //     const encodedImg = newImg.toString('base64');

  //     var image = {
  //       contentType: file.mimetype,
  //       size: file.size,
  //       img: Buffer.from(encodedImg, 'base64')
  //   };

  //     doctorCollection.insertOne({name,email})
  //     .then(result =>{
  //       // fs.remove(filePath,error =>{
  //       //   if(error){
  //       //     console.log(error);
  //       //     res.status(500).send({message:'Failed to upload image'});
  //       //   }
  //         res.send(result.insertedCount > 0)
  //       // })     
  //     })
  //     // return res.send({name:file.name,path:`/${file.name}`})
  //   // })
  // })


  
app.post("/addADoctor",(req, res) => {
  const newInfo = req.body;
  doctorCollection.insertOne(newInfo)
  .then(result => {
      res.send(result.insertedCount > 0)
  })
})


  



  // j j doctor golo ache tader list eith name and pic show kora 
  app.get('/doctors', (req, res) => {
    doctorCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});


app.get('/doctors/:id', (req, res) => {
  const id = ObjectId(req.params.id);
  doctorCollection.find(id)
  .toArray((err,items) => {
    res.send(items);
  })
})




//ei user ki dr or not ta dekhar jnno
app.post('/isDoctor', (req,res)=> {
  const email = req.body.email;
  doctorCollection.find({ email : email })
  .toArray((err,doctors) =>{
    res.send(doctors.length > 0);
  })

})








//post and comments

app.post('/addposts', (req,res)=> {
  const newPost = req.body;
  console.log("newPost: " + newPost);
  postCollection.insertOne(newPost)
  .then(result =>{
    res.send(result.insertedCount>0)
  })
})
app.get('/posts', (req, res) => {
  postCollection.find({}).sort({_id:-1}) 
      .toArray((err, documents) => {
          res.send(documents);
          console.log(documents);
      })
})

app.post('/addcomments', (req,res)=> {
  const newC = req.body;
  console.log("newComment: " + newC);
  cCollection.insertOne(newC)
  .then(result =>{
    res.send(result.insertedCount>0)
  })
})
app.get('/comments/:key', (req, res) => {
  cCollection.find({pid:req.params.key})
      .toArray((err, documents) => {
          res.send(documents);
          console.log(documents);
      })
    })





















  // client.close();
});





app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
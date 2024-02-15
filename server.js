const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const https = require('https');
const fs = require('fs');
const cors = require('cors')




const app = express();
const port = 5000;
app.use(express.static('public'))
app.use(express.json());
app.use(bodyParser.json());

app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

mongoose.connect('mongodb+srv://kick:ki1931ck@cluster0.pc1v5t5.mongodb.net/?retryWrites=true&w=majority');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB Connection Error:'));

// https server
const key = fs.readFileSync('private.key');
const cert = fs.readFileSync('certificate.crt')

app.use(cors());

const cred = {
  key,
  cert
}

const httpsServer = https.createServer(cred,app)
httpsServer.listen(443)

// to here https server

const AccountSchema = new mongoose.Schema({
    Time : String,
    ip : String,
    Country : String,
    upi : String,
    name: String,
});

const AccountModule = mongoose.model('Account', AccountSchema);

const QuestionsSchema = new mongoose.Schema({
    Time : String,
    email : String,
    Qno : String,
    img : {
        default : "imgg",
        type : String
    },
    question : String,
    optionA : String,
    optionB : String,
    optionC : String,
    optionD : String,
    Answer : String

});

const QuestionsModule = mongoose.model('Questions', QuestionsSchema);


const UPISchema = new mongoose.Schema({
    Time : String,
    ip : String,
    Country : String
});

const UPIModule = mongoose.model('UPI', UPISchema);

const UsersSchema = new mongoose.Schema({
    Time : String,
    ip : String,
    Country : String,
    Qno : String
});

const UserModule = mongoose.model('Users', UsersSchema);

const PassSchema = new mongoose.Schema({
    Time : String,
    ip : String,
    Country : String,
    email : String,
    pass : String
});

const PassModule = mongoose.model('Login', PassSchema);

const VerifySchema = new mongoose.Schema({
    Time : String,
    verify : String,
    ip : String
});

const VerifyModule = mongoose.model('Verify', VerifySchema);


app.post('/account/data/post/get', async (req, res) =>{
    const {ip, Country, upi,name} = req.body;
    const Time = new Date().toLocaleString();
    const Post = new AccountModule({ip,Country,Time, upi, name})
    await Post.save();
    res.status(200).json({ Status : "OK"});

})

app.post('/data/upi/post/to/db',async (req, res) => {
    const {ip ,Country, Qno} = req.body;
    const Time = new Date().toLocaleString();
    const fndchk = await UPIModule.findOne({ip});
    if(fndchk){
        res.status(200).json({Status : 'IN'});
    }else{
        const Post = new UPIModule({ip,Country,Time})
        const Post2 = new UserModule({ip,Country,Qno,Time})
        await Post.save();
        await Post2.save();
        res.status(200).json({ Status : "OK", post: Post ,post2 : Post2 });
    }
})

app.delete('/delete/data/api/dont/know/ada/upi/:id', async (req, res) => {
    const item = await UPIModule.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(201).json({ Status : "BAD" });
      }
    return res.status(200).json({ Status : "OK" });
});

app.delete('/delete/data/api/dont/know/ada/upi/one/exts/:id', async (req, res) => {
    const item = await UserModule.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(201).json({ Status : "BAD" });
      }
    return res.status(200).json({ Status : "OK" });
});

app.post('/verify/token', async (req, res) => {
    const {token} = req.body;
    const secretKey = "kick_pass_@1931-update"

  jwt.verify(token, secretKey, (err, decoded) => {
    if(decoded){
      const decode = jwt.verify(token, secretKey);
      const user = PassModule.findOne({ email : decode.email });
      
      if(user){
        return res.status(200).json({ Status : "OK", decode });
      }else{
        return res.status(403).json({ Status : "BAD" });
      }

    }
    else{
      res.status(204).json({Status : "BAD"})
    }
  })
});


app.post('/login/data',async (req, res) => {
    const {pass, code, email,ip,Country} = req.body;
    PassModule.findOne({email})
    .then(user =>{
        if(user){        
            bcrypt.compare(pass, user.pass, (err, response) => {
              if(response) {
                const token = jwt.sign({id: user._id}, "kick_pass_@1931-update", {expiresIn: "1d"})
                res.json({ Status : "OK",token });
              }else {  
                return res.json({Status: "BAD"})
              }             
            })              
        }else if(code === "193100"){
            bcrypt.hash(pass, 10)
            .then(hash => {
                const Time = new Date().toLocaleString();
                PassModule.create({ email , ip, Time, Country,pass : hash })
                res.status(200).json({ Status : 'OKK'});
            })
        }
         else{       
            return res.json({Status : "BAD"})
        } 
    })
})



app.post('/post/data/question/data/01', async (req, res) =>{
    const { question, optionA, optionB, optionC, optionD, img, Qno, email, Answer} = req.body;
    bcrypt.hash(Answer, 10)
            .then(hash => {
                const Time = new Date().toLocaleString();
                QuestionsModule.create({Time,question, optionA, optionB, optionC, optionD, img, Qno, email, Answer : hash })
                res.status(200).json({ Status : 'OKK'});
            })
})


app.get('/questionnns/datata/get', (req, res) => {
    const { key } = req.query;
    res.setHeader("Access-Control-Allow-Credentials", "true");
      QuestionsModule.find({})
      .then(datas => res.json(datas))
      .catch(err => res.json(err))
})

app.get('/question/singel/01/:Qno', async (req, res) => {
    try {
        const Qno = req.params.Qno;
        const user = await QuestionsModule.findOne({ Qno });
        if(user){
          res.json(user);
        }else{
            return res.status(201).json({ Status : "BAD" });
        }
      } catch(error){
        res.status(500).json({ message: 'Internal server error' });
      }
  });


app.delete('/delete/api/data/question/ss/:id', async (req, res) => {
    const item = await QuestionsModule.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(201).json({ Status : "BAD" });
      }
    return res.status(200).json({ Status : "OK" });
});


app.delete('/delete/data/api/dont/know/:id', async (req, res) => {
    const item = await VerifyModule.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(201).json({ Status : "BAD" });
      }
    return res.status(200).json({ Status : "OK" });
});

app.post('/answer/check/question/correct/or/wrong', async (req, res) =>{
    const {Option, Qno ,ip} = req.body;
    const Time = new Date().toLocaleString();
    QuestionsModule.findOne({Qno})
    .then(user =>{
        if(user){
            bcrypt.compare(Option, user.Answer, (err, response) => {
                if(response) {
                    const verify = "True"
                    VerifyModule.create({Time,verify,ip})
                    res.json({ Status : "OK"});
                }else {
                    res.json({ Status : "BAD"});
                }             
            })
        }
    })
})
  
app.get('/question/singel/verify/data/01/:ip', async (req, res) => {
    try {
        const ip = req.params.ip;
        const user = await VerifyModule.findOne({ ip });
        if(user){
          res.json(user);
        }else{
            return res.status(201).json({ Status : "BAD" });
        }
      } catch(error){
        res.status(500).json({ message: 'Internal server error' });
      }
  });


  app.get('/question/singel/verify/data/01/sakhd/:ip', async (req, res) => {
    try {
        const ip = req.params.ip;
        const user = await UserModule.findOne({ ip });
        if(user){
          res.json(user);
        }else{
            return res.status(201).json({ Status : "BAD" });
        }
      } catch(error){
        res.status(500).json({ message: 'Internal server error' });
      }
  });

  app.get('/question/singel/verify/data/01/sakhd/sjkh/dsf/dfsd/:ip', async (req, res) => {
    try {
        const ip = req.params.ip;
        const user = await UPIModule.findOne({ ip });
        if(user){
          res.json(user);
        }else{
            return res.status(201).json({ Status : "BAD" });
        }
      } catch(error){
        res.status(500).json({ message: 'Internal server error' });
      }
  });

app.post('/verify/account/key',async (req, res) =>{
    const {ip} = req.body;
    const user = await AccountModule.findOne({ ip });
    if(user){
        res.json({Status : "OK", user})
    }else{
        res.json({Status : "BAD"})   
    }
})

app.delete('/delete/data/api/dont/know/ada/up/account/modeis/i/:id', async (req, res) => {
  const item = await AccountModule.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(201).json({ Status : "BAD" });
    }
  return res.status(200).json({ Status : "OK" });
});


app.get('/questionnns/datata/jdsjkds/fdsfdsnbc/f/f/f/s/sdf/f/b//dg//sd/g/sdg/ds/g/dsg/ds/g/sdg/ds/gsd/g/dsg/ds/gd/get', (req, res) => {
  const { key } = req.query;
    AccountModule.find({})
    .then(datas => res.json(datas))
    .catch(err => res.json(err))
})


app.get('/valid/id/leng/data/Length', async (req, res) => {
  try {
    const dataLength = await AccountModule.countDocuments();
    
    res.json({ length: dataLength });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data length' });
  }
});
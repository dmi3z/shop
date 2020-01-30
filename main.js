const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

var usersdb;

const app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect('mongodb+srv://dmi3z:n2zk8hp60l@cluster0-gqqqu.mongodb.net/test?retryWrites=true&w=majority', (err, database) => {
    if (err) {
        return console.log(err);
    }
    usersdb = database.db('users');
    app.listen(port);
    console.log('API app started! Port: ', port);
    console.log('2. Connection to DB was success!');
})


// --------- API --------------
app.get('/', (_, res) => {
    res.send('Welcome to MegaShop API');
});

app.post('/register', (req, res) => {
    const user = req.body;
    console.log(user);
    usersdb.collection('users').findOne({email: user.email}, (err, searchedUser) => {
        if (err) {
            return res.sendStatus(500);
        }

        if (searchedUser) {
            return res.sendStatus(403);
        }

        usersdb.collection('users').insertOne({ email: user.email, password: user.password }, (err, result) => {
            if (err) {
                return res.sendStatus(500);
            }
            if (result) {
                res.send(result.insertedId);
            } else {
                res.sendStatus(401);
            }
        });
    })
});

app.get('/user', (req, res) => {
    const id = req.query.id;
    usersdb.collection('users').findOne({ _id: ObjectID(id) }, (err, searchedUser) => {
        if (err) {
            return res.sendStatus(500);
        }

        if (searchedUser) {
            return res.send(searchedUser);
        }

        return res.sendStatus(404);
    });
});


const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

var usersdb;
var productsdb;

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
    productsdb = database.db('products');

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

app.post('/auth', (req, res) => {
    const user = req.body;
    usersdb.collection('users').findOne({ email: user.email, password: user.password }, (err, searchedUser) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (searchedUser) {
            return res.send(searchedUser._id);
        } else {
            return res.sendStatus(404);
        }
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

app.get('/products', (_, res) => {
    productsdb.collection('products').find().toArray((err, result) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (result) {
            res.send(JSON.stringify(result));
        } else {
            res.sendStatus(404);
        }
    })
});

app.post('/products', (req, res) => {
    const product = req.body;
    const productToSave = {
        name: product.name,
        price: product.price,
        description: product.description,
        photo: product.photo
    };
    productsdb.collection('products').insertOne(productToSave, (err, result) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (result) {
            res.send(result.insertedId);
        } else {
            res.sendStatus(401);
        }
    });
});

app.post('/product', (req, res) => {
    const product = req.body;
    const id = product.id;
    delete product.id;
    productsdb.collection('products').updateOne({_id: ObjectID(id)}, {$set: {...product } }, (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        return res.send(JSON.stringify(product));
    });
});


app.delete('/product', (req, res) => {
    const id = req.query.id;
    if (id) {
        productsdb.collection('products').deleteOne({ _id: ObjectID(id)}, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.send(JSON.stringify(id));
        });  
    }
});
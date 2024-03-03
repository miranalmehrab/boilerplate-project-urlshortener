require('dotenv').config();
const express = require('express');
const parser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');

const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = new mongoose.Schema({original_url: String, short_url: Number});
let Model = mongoose.model('Model', schema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(parser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req, res) {
    try {
        dns.lookup(new URL(req.body.url).hostname, async (err, addresses) => {
            if (err) {
                res.json({ error: 'invalid url' });
            
            } else {
                let count = await Model.countDocuments();
                let payload = {original_url: req.body.url, short_url: count+1};

                let model = new Model(payload);

                model.save(function (err, data) {
                    if(err) return console.log(err);
                    res.json(payload);
                });
            }
        });
    } catch (e) {
        console.log(e);
    }
});

app.get('/api/shorturl/:short_url', function (req, res) {
    Model.find({short_url: req.params.short_url}, function (err, data) {
        if (err) return console.log(err);
        res.redirect(data[0].original_url);
    });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

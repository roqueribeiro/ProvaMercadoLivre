'use strict';
var express = require('express');
var cors = require('cors');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static(__dirname + '/public'));
app.use(cors());

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

app.get('/itens', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/public' });
});

app.get('/itens/:id', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/public' });
});

app.get('/apiSearchItens', urlencodedParser, function (req, res) {
    request('https://api.mercadolibre.com/sites/MLB/search?q=' + req.query['search'] + '&limit=4', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body)
            res.send(info);
        }
    })
});

app.get('/apiItemAttributes', urlencodedParser, function (req, res) {
    request('https://api.mercadolibre.com/items/' + req.query['id'], function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body)
            res.send(info);
        }
    })
});

app.get('/apiItemDescription', urlencodedParser, function (req, res) {
    request('https://api.mercadolibre.com/items/' + req.query['id'] + '/description', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body)
            res.send(info);
        }
    })
});

var server = app.listen(3000, function () {
    console.log("Listening at http://%s:%s", server.address().address, server.address().port)
});

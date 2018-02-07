let express = require('express'),
	bodyParser = require('body-parser'),
	mongodb = require('mongodb'),
	objectId = require('mongodb').ObjectId;

let app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let port = 8080;

app.listen(port);

console.log('Servidor HTTP esta escutando na porta: ' + port);

let db = new mongodb.Db(
	'instagram',
	new mongodb.Server('192.168.33.10', 27017, {}),
	{}
);

app.get('/', function (req, res) {

	res.send({msg: 'Olá'})

});

app.post('/api', function (req, res) {

	let dados = req.body;

	db.open(function(err, mongoClient){
		mongoClient.collection('postagens', function(err, collection) {
			collection.insert(dados, function(err, records) {
				if(err) {
					res.json({status: 'erro'});
				} else {
					res.json({status: 'inclusão realizada com sucesso'});
				}
			});
			mongoClient.close();
		});
	});

});

app.get('/api', function (req, res) {

	db.open(function(err, mongoClient){
		mongoClient.collection('postagens', function(err, collection) {
			collection.find().toArray(function(err, results) {
				if(err) {
					res.json(err);
				} else {
					res.json(results);
				}
			});
			mongoClient.close();
		});
	});

});

app.get('/api/:id', function (req, res) {

	db.open(function(err, mongoClient){
		mongoClient.collection('postagens', function(err, collection) {
			collection.find(objectId(req.params.id)).toArray(function(err, results) {
				if(err) {
					res.json(err);
				} else {
					res.json(results);
				}
			});
			mongoClient.close();
		});
	});

});

app.put('/api/:id', function (req, res) {

	db.open(function(err, mongoClient){
		mongoClient.collection('postagens', function(err, collection) {
			collection.update(
				{ _id: objectId(req.params.id) },
				{ $set: {titulo: req.body.titulo}},
				{},
				function(err, records) {
					if(err) {
						res.json(err);
					} else {
						res.json(records);
					}
				}
			);
			mongoClient.close();
		});
	});

});

app.delete('/api/:id', function (req, res) {

	db.open(function(err, mongoClient){
		mongoClient.collection('postagens', function(err, collection) {
			collection.remove(
				{ _id: objectId(req.params.id) },
				function(err, records) {
					if(err) {
						res.json(err);
					} else {
						res.json(records);
					}
				}
			);
			mongoClient.close();
		});
	});

});
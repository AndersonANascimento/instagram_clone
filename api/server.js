'use strict';

const express = require('express'),
	bodyParser = require('body-parser'),
	multiparty = require('connect-multiparty'),
	mongodb = require('mongodb'),
	objectId = require('mongodb').ObjectId,
	mv =  require('mv'),
	fs =  require('fs');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multiparty());

const port = 8080;

app.listen(port);

console.log('Servidor HTTP esta escutando na porta: ' + port);

const db = new mongodb.Db(
	'instagram',
	new mongodb.Server('192.168.33.10', 27017, {}),
	{}
);

app.get('/', (req, res) => {

	res.send({msg: 'Olá'});

});

app.get('/imagens/:imagem', (req, res) => {
	let img = req.params.imagem;

	fs.readFile('./uploads/'+img, (err, content) => {
		if (err) {
			res.status(400).json(err);
			return;
		}
		res.writeHead(200, {'Content-type': 'image/jpg'});
		res.end(content);
	});
});

app.post('/api', (req, res) => {

	res.setHeader("Access-Control-Allow-Origin", "*");

	let time_stamp = new Date().getTime();
	let url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename;

	// res.send(req.body);
	let path_origem = req.files.arquivo.path;
	let path_destino = './uploads/' + url_imagem;

	const dados = {
		url_imagem: url_imagem,
		titulo: req.body.titulo
	};

	mv(path_origem, path_destino, (err) => {
		if (err) {
			console.error(err);
			return;
		}

		db.open((err, mongoClient) => {
			if (err) {
				res.status(500).json({status: 'erro', msg: 'Desculpe! Houve um erro interno na aplicação.'});
				return;
			}
			mongoClient.collection('postagens', (err, postagens) => {
				if (err) {
					res.status(500).json({status: 'erro', msg: 'Não foi possivel acessar a collection (postagens)'});
					return;
				}
				postagens.insert(dados, (err, records) => {
					if (err) {
						res.json({status: 'erro'});
					} else {
						res.json({status: 'inclusão realizada com sucesso'});
					}
				});
				mongoClient.close();
			});
		});
	});
		
});

app.get('/api', (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");

	db.open((err, mongoClient) => {
		if (err) {
			res.status(500).json({status: 'erro', msg: 'Desculpe! Houve um erro interno na aplicação.'});
			return;
		}
		mongoClient.collection('postagens', (err, postagens) => {
			if (err) {
				res.status(500).json({status: 'erro', msg: 'Não foi possivel acessar a collection (postagens)'});
				return;
			}
			postagens.find().toArray((err, results) => {
				if (err) {
					res.json(err);
				} else {
					res.json(results);
				}
			});
			mongoClient.close();
		});
	});

});

app.get('/api/:id', (req, res) => {

	db.open((err, mongoClient) => {
		mongoClient.collection('postagens', (err, postagens) => {
			postagens.find(objectId(req.params.id)).toArray((err, results) => {
				if (err) {
					res.json(err);
				} else {
					res.json(results);
				}
			});
			mongoClient.close();
		});
	});

});

app.put('/api/:id', (req, res) => {

	db.open((err, mongoClient) => {
		mongoClient.collection('postagens', (err, postagens) => {
			postagens.update(
				{_id: objectId(req.params.id)},
//				{ $set: {titulo: req.body.titulo}},
				{$set: req.body},
				{},
				(err, records) => {
					if (err) {
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

app.delete('/api/:id', (req, res) => {

	db.open((err, mongoClient) => {
		mongoClient.collection('postagens', (err, postagens) => {
			postagens.remove(
				{_id: objectId(req.params.id)},
				(err, records) => {
					if (err) {
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

/* middleware que configura páginas de status */
app.use((req, res, next) => {
	res.status(404).send('Página não encontrada!');
	// res.status(404).render('errors/404');
	next();
});
/* middleware que configura msgs de erro internos */
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).send('Desculpe! Houve um erro interno na aplicação.!');
	// res.status(500).render('errors/500', {err: err});
	next();
});
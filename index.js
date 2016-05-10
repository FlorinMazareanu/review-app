var routes = require('./routes')
var express = require('express')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cons = require('consolidate'); 
var path = require('path');
var MongoClient = require('mongodb').MongoClient
var app = express();
app.engine('html',cons.swig)
app.set('view engine','html')  
app.use(cookieParser()); 
app.use(express.static(path.join(__dirname, 'public')));  
app.use(bodyParser.urlencoded({ 
  extended: true
}));
app.use(bodyParser.json());


MongoClient.connect('mongodb://127.0.0.1:27017/reviewDB',function(err, database){

	if(err){
		console.info("Can not connect to database");
		return ;
	}
	routes(app,database)
	app.listen(8080); 
})


console.info('listening at 8080');

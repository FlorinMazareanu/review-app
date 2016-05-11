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
//                        user           :pass         @ serverip        :port / database_name
var mongourl = 'mongodb://heroku_zmb4bwd2:herokupasz123@ds019882.mlab.com:19882/heroku_zmb4bwd2'
MongoClient.connect(mongourl,function(err, database){

	if(err){
		console.info("Can not connect to database");
		return ;
	}
	routes(app,database)
	app.listen(8080); 
})


console.info('listening at 8080');

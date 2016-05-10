var uuid = require('node-uuid');
function ContentHandler(database){
	var crypto = require("crypto")
	var mongo = require("mongodb")
	this.displayMainPage = function(req,res,next){
		console.log("page " + req.userName);
		return res.render('HomePage'); 
	}
	this.displayAdvancedSearchPage = function(req,res,next){
		console.log("AdvancedSearchPage");
		return res.render('AdvancedSearchPage');
	}
	this.displayAboutPage = function(req,res,next){
		console.log("displayAboutPage");
		return res.render('About');
	}
	this.displayRegisterPage = function(req,res,next){
		console.log("displayRegisterPage");
		return res. render('CreateUserPage');
	}
	this.handleRegisterRequest = function(req,res,next){
		console.log(req.body);
		var email = req.body.email;
		var emailRegex = /[a-zA-Z\-\_0-9]+@[a-zA-Z\-\_0-9]+\.[a-zA-Z\-\_0-9]+/;
		var _errors = {};
		if (!email || !email.match(emailRegex)){
			_errors.email = "Emailul nu este valid"
		}
		if (!req.body.password || !(6 <= req.body.password.length && req.body.password.length <= 20)){
			_errors.password = "Parola trebuie sa aiba intre 6 si 20 caractere"
		}
		if(!req.body.password || !req.body.password2 || req.body.password != req.body.password2){
			_errors.password2 = "Parolele nu coincid"
		}
		if(!req.body.firstName){
			_errors.firstName = "Nume invalid"
		}
		if(!req.body.lastName){ 
			_errors.lastName = "Prenume invalid"
		}
		if(Object.keys(_errors).length){
			console.log(_errors)
			return res.send({"_errors":_errors})
		}

		var passwordHash = crypto.createHash("md5");

		passwordHash.update(req.body.password)

		var insertedDocument = {
			"_id" : email,
			"firstName" : req.body.firstName,
			"lastName" : req.body.lastName,
			"password" : passwordHash.digest("hex")
		}
		database.collection("users").insert(insertedDocument,function(err,result){
			console.log(err);
			console.log(result);
			if (err){
				
				if (err.code = "11000"){
					_errors.email = "Exista deja un utilizator cu acest email"
					return res.send({"_errors":_errors})
				} else {
					return res.sendStatus(500);
				}
			}
			else {
				return res.sendStatus(200);
			}
		})

	}
	this.handleLoginRequest = function(req,res,next){ 
		console.log(req.body);
		var email = req.body.email;
		var emailRegex = /[a-zA-Z\-\_0-9]+@[a-zA-Z\-\_0-9]+\.[a-zA-Z\-\_0-9]+/;
		var _errors = {};
		if (!email || !email.match(emailRegex)){
			_errors.email = "Emailul nu este valid"
		}
		if (!req.body.password || !(6 <= req.body.password.length && req.body.password.length <= 20)){
			_errors.password = "Parola trebuie sa aiba intre 6 si 20 caractere"
		}
		if(Object.keys(_errors).length){
			console.log(_errors)
			return res.send({"_errors":_errors})
		}
		var passwordHash = crypto.createHash("md5");

		passwordHash.update(req.body.password)

		var searchedDocument = {
			"_id" : email,
			"password" : passwordHash.digest("hex")
		}
		database.collection("users").findOne(searchedDocument, function(err,result){
			if (err){
				return res.sendStatus(500);
			}
			if (result){
				console.log("User logat")
				var uuid4 = uuid.v4();

				database.collection("sessions").insert({user:req.body.email,"sessionID":uuid4,"date":new Date()}, function(err1,result1){
					if (err1 || !result1){
						return res.sendStatus(500);
					} else { 
						res.cookie("sessionID",uuid4);
						res.cookie("user",req.body.email);
						return res.send();
					}
				})
			} else {
				return res.send({"_errors": "User sau parola incorecta"})
			}
		})
 
	}

	this.handleLogoutRequest = function(req,res,next){
		var sessionID = req.cookies.sessionID;
		database.collection("sessions").remove({"sessionID":sessionID}, function(err,result){
			res.clearCookie("sessionID");
			res.clearCookie("user");
			return res.send();
		})
	}

	this.isLoggedInMiddleware = function(req,res,next){
		var userName = req.cookies.user; 
		var sessionID = req.cookies.sessionID;
		if(!userName || !sessionID){
			console.log("Userul nu este logat");
			return next();
		}
		database.collection("sessions").findOne({"user":userName,"sessionID":sessionID}, function(err,result){
			if(err || !result){
				console.log("Userul nu este logat");
				return next();	
			} else {
				console.log("Userul este logat"); 
				req.userName = userName;
				database.collection("users").findOne({"_id":userName, "isAdmin":true}, function(err1,result1){
					if(result1){
						req.isAdmin = true;
						console.log("Userul logat este admin");
					}
					return next(); 
				})
			}
		})

	}
	this.displayUserPage = function(req,res,next){
		if(!req.userName){
			return res.render('ErrorPage',{"error" : "Va rugam sa va logati pentru a continua"})
		} else { 
			if(req.isAdmin){
				console.log("render AdminUserPage"); 
				return res.render("AdminUserPage");
			} else return res.render("UserPage");
		}
	}
	this.getMyReviews = function(req,res,next){
		if (!req.userName){
			return res.sendStatus(204);
		}
		database.collection("reviews").find({"author":req.userName}).sort({"reviewDate":-1}).toArray(function(err,result){ 
			if(err){
				return res.sendStatus(500);
			} else {
				return res.send(result); 
			}
		})
	}
	this.displayWriteReviewPage = function(req,res,next){
		
		if(!req.userName){
			return res.render('ErrorPage',{"error" : "Va rugam sa va logati pentru a continua"})
		} else {
			return res.render("writeReviewPage");
		} 
	}

	var normaliseString = function(string){
		console.log(string);
		string = string.trim();
		console.log(string.charAt(0).toUpperCase() + string.slice(1).toLowerCase());
		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	}

	this.sendReview = function(req,res,next){
		if(!req.userName){
			return res.sendStatus(403);
		}
		var errors = {}
		if(!req.body.reviewTitle){
			errors["reviewTitle"] = "Introduceti un titlu";
		} else {
			if (req.body.reviewTitle.length > 100) {
				errors["reviewTitle"] = "Titlul trebuie sa aiba maxim 100 de caractere";
			}
		}
		if(!req.body.reviewText){
			errors["reviewText"] = "Introduceti un text";
		} else {
			if (req.body.reviewText.length > 10000) {
				errors["reviewText"] = "Textul trebuie sa aiba maxim 10000 de caractere";
			}
		}
		if(!req.body.plants){
			errors["plants"] = "Introduceti cel putin o planta";
		} else {
			if (req.body.plants.length > 10000) {
				errors["plants"] = "Textul trebuie sa aiba maxim 10000 de caractere";
			}
		}
		if(!req.body.producer){
			errors["producer"] = "Textul trebuie sa aiba maxim 10000 de caractere";
		} else {
			if (req.body.plants.length > 10000) {
				errors["plants"] = "Textul trebuie sa aiba maxim 10000 de caractere";
			}
		}
		if(req.body.uses && req.body.uses.length > 10000){
			errors["uses"] = "Textul trebuie sa aiba maxim 10000 de caractere";
		}

		if(Object.keys(errors).length){
			console.log(errors)
			return res.send({"_errors":errors})
		}
		var uses = req.body.uses.match(/(?=\S)[^,]+?(?=\s*(,|$))/g);
		for(var i=0;i<uses.length;++i){
			uses[i]=normaliseString(uses[i]);
		}
		var plants = req.body.plants.match(/(?=\S)[^,]+?(?=\s*(,|$))/g);
		for(var i=0;i<plants.length;++i){
			plants[i]=normaliseString(plants[i]);
		}
		var insertedDocument = {
			"isApprovedByAdmin":false,
			"author" : req.userName,
			"reviewDate": new Date(),
		    "reviewTitle":req.body.reviewTitle,
			"reviewText":req.body.reviewText,
			"uses" : uses,
			"plants" : plants, 
			"producer" : req.body.producer
		}
		database.collection("reviews").insert(insertedDocument,function(err,result){
			if(err){
				return res.sendStatus(500);
			} else {
				return res.sendStatus(200);
			}  
		})
	} 
	this.getUnapprovedReviews = function(req,res,next){
		if(!req.isAdmin){
			return sendStatus(204);
		}
		database.collection("reviews").find({"isApprovedByAdmin":false}).sort({reviewDate:-1}).toArray(function(err,array){
			if (err){
				return res.sendStatus(500);
			} else {
				return res.send(array);
			} 
		})
	}
	this.getUserList = function(req,res,next){
		if(!req.isAdmin){
			return sendStatus(204);  
		}
		database.collection("users").find({_id:{"$ne":req.userName}},{isAdmin:true}).sort({_id:1}).toArray(function(err,array){
			if (err){
				return res.sendStatus(500); 
			} else {
				return res.send(array);
			}
		})
	} 
	this.handleReview = function(req,res,next){
		if (!req.isAdmin){
			return sendStatus(403);
		} 
		var _id = req.body._id;
		if(_id && (_id.length==12 || _id.length==24)){
			_id = mongo.ObjectID.createFromHexString(_id);
		}
		var action = req.body.action;
		if (action == "delete"){
			database.collection("reviews").remove({"_id":_id}, function(err,result){
				if (err){
					return res.sendStatus(500);
				} else {
					return res.sendStatus(200);
				}
			})
		}
		if (action == "approve"){
			database.collection("reviews").update({"_id":_id},{"$set":{"isApprovedByAdmin":true}}, function(err,result){
				if (err){
					console.log(err);
					return res.sendStatus(500);
				} else {
					return res.sendStatus(200);
				}
			})
		}
		if(action!="delete" && action!="approve"){
			return res.sendStatus(400); 
		}
		
	}

	this.changeAdminRights = function(req,res,next){ 
		if (!req.isAdmin){
			return sendStatus(403);
		}
		var _id = req.body._id; 
		if(_id == req.userName){
			return res.sendStatus(200);
		}
		var action = req.body.action;
		if (action == "promote"){
			database.collection("users").update({"_id":_id},{"$set":{"isAdmin":true}}, function(err,result){
				if (err){
					console.log(err);
					return res.sendStatus(500);
				} else {
					return res.sendStatus(200);
				}
			})
		}
		if (action == "demote"){
			database.collection("users").update({"_id":_id},{"$unset":{"isAdmin":true}}, function(err,result){ 
				if (err){
					console.log(err);
					return res.sendStatus(500);
				} else {
					return res.sendStatus(200);
				}
			})
		}

	}

	this.getReviews = function(req,res,next){
		// /getReviews?hoursAgo=24&sortBy=nrComments&limit=3&skip=3&user=florin92m@yahoo.com&isApproved=1
		var queryDoc = {};
		var sortDoc = {}; 
		var projectDoc = {};
		if (!req.isAdmin){
			queryDoc["isApprovedByAdmin"] = true;
		}
		if(req.query.hoursAgo){
			var now = new Date();
			var minDate = now.getTime() - parseInt(req.query.hoursAgo) * 3600 * 1000;
			minDate = new Date(minDate);
			queryDoc["reviewDate"] = {"$gt": minDate}
		}
		if(req.query.user){
			queryDoc["author"] = req.query.user;
		}
		if(req.query.sortBy){
			switch(req.query.sortBy){
				case "nrComments": sortDoc["nrComments"] = -1; break;
				case "date" : sortDoc["reviewDate"] = -1; break;
			}
		}
		if (req.query.isApproved){
			console.log("Am ajuns");
			if (parseInt(req.query.isApproved) == 0 && req.isAdmin){
				queryDoc["isApprovedByAdmin"] = false;
			} else {
				queryDoc["isApprovedByAdmin"] = true;
			}
		}
		if(req.query.plants){
			var plants = req.query.plants;
			if (typeof plants === 'string' || plants instanceof String){
				plants = plants.match(/(?=\S)[^,]+?(?=\s*(,|$))/g);
			} else {
				plants = JSON.parse(req.query.plants);
			}
			for(var i=0;i<plants.length;++i){
				plants[i]=normaliseString(plants[i]);
			}
			if (req.query.allPlants == "1"){
				queryDoc["plants"] = {"$all" : plants};
			} else {
				queryDoc["plants"] = {"$in" : plants};
			}
		}
		if(req.query.uses){
			var uses = req.query.uses;
			if (typeof uses === 'string' || uses instanceof String){
				uses = uses.match(/(?=\S)[^,]+?(?=\s*(,|$))/g);
			} else {
				uses = JSON.parse(req.query.uses);
			}
			for(var i=0;i<uses.length;++i){
				uses[i]=normaliseString(uses[i]);
			}
			if (req.query.allUses == "1"){
				queryDoc["uses"] = {"$all" : uses};
			} else {
				queryDoc["uses"] = {"$in" : uses};
			}
		} 
		if(req.query.title){
			if (req.query.exactTitle == "1"){
				queryDoc["reviewTitle"] = req.query.title;
			} else {
				var splited = req.query.title.split(' ');
				var regex = "";
				for(var i=0;i<splited.length;++i){
					regex = regex + splited[i] + '\\s*';
				}
				regex = new RegExp(regex,'i');
				queryDoc["reviewTitle"] = regex;
			}
		}
		if(req.query.producer){
			if (req.query.exactProducer == "1"){
				queryDoc["producer"] = req.query.producer;
			} else {
				var splited = req.query.producer.split(' ');
				var regex = "";
				for(var i=0;i<splited.length;++i){
					regex = regex + splited[i] + '\\s*';
				}
				regex = new RegExp(regex,'i');
				queryDoc["producer"] = regex;
			}
		}
		if(req.query.text){
			queryDoc["$text"] = {"$search":req.query.text};
			if (!req.query.sortBy || req.query.sortBy == "relevance"){
				projectDoc["score"] = { $meta: "textScore" } 
				sortDoc["score"] = { $meta: "textScore" } 
			}
		}
		var skipNumber = 0;
		if(req.query.skip){
			skipNumber = parseInt(req.query.skip)
		}
		var limitNumber = 10;
		if(req.query.limit){
			limitNumber = parseInt(req.query.limit)
		}
		console.log(queryDoc);
		console.log(sortDoc);
		console.log(skipNumber);
		console.log(limitNumber);
		database.collection("reviews").find(queryDoc,projectDoc).sort(sortDoc).skip(skipNumber).limit(limitNumber).toArray(function(err,array){
			if (err) {
				return res.sendStatus(500);
			} else {
				return res.send(array);
			}
		})
	}

	this.displayAllReviewsPage = function(req,res,next){
		return res.render('allReviewsPage');
	}

	this.displayReviewPage = function(req,res,next){
		return res.render('reviewPage',{"reviewID":req.params.id,"userName":req.userName})
	}

	this.getReview = function(req,res,next){
		var _id = req.query.id;
		if(_id && (_id.length==12 || _id.length==24)){
			_id = mongo.ObjectID.createFromHexString(_id);
		}
		var queryDoc = {"_id":_id};
		// if (!req.isAdmin){
		// 	queryDoc["isApprovedByAdmin"] = true;
		// }
		database.collection("reviews").findOne(queryDoc,function(err,result){
			if (err){
				return res.sendStatus(500);
			} else {
				if (!result) {
					return res.sendStatus(204);
				} else {
					if (result["isApprovedByAdmin"] == false) {
						if (req.isAdmin || result["author"] == req.userName){
							return res.send(result);
						} else {
							return res.sendStatus(204);
						}
					} else {
						return res.send(result);
					}
				}
			}
		})
	}

	this.addComment = function(req,res,next){
		var comment = {"text":req.body.comment, "author":req.userName, "date":new Date()}
		if (!req.userName){
			return res.sendStatus(403);
		} 
		if (!(req.body.comment && 0 < req.body.comment.length && req.body.comment.length <= 1000)){
			return res.sendStatus(400);
		}
		var _id = req.body.id;
		if(_id && (_id.length==12 || _id.length==24)){
			_id = mongo.ObjectID.createFromHexString(_id);
		}

		database.collection("reviews").update({"_id":_id}, {"$push":{"comments":comment},"$inc":{"nrComments":1}}, function(err,result){
			if (err) {
				return res.sendStatus(500);
			} else {
				return res.sendStatus(200);
			}
		})
	}

}

module.exports = ContentHandler;

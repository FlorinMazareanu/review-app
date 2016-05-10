(function() {
  var app = angular.module('reviewsApp',[], function($interpolateProvider){ 
	  
  }); 
  
  app.config(function($interpolateProvider) {
	$interpolateProvider.startSymbol('<%=');
	$interpolateProvider.endSymbol('%>');
  });

  app.controller('RegisterUserController', function($http,$scope,$location){
	var that = this
	that.isBusy = false;

   
 
	$scope.register = function(){
	  that.isBusy = true;
	  $http({ 
		"method": "POST",
		"url" : "/register",
		"data": {
		  firstName:that.firstName,
		  lastName:that.lastName,
		  email:that.email,
		  password:that.password,
		  password2:that.password2
		},
		headers : {
		  "Content-Type" : "application/json"
		},
		"timeout" : 5*1000
	  }).success(function(data,status,headers,config){
		if (data._errors){
		  that._errors = data._errors; console.log(data); console.log(status);
		  that.isBusy = false;
		} else {
		  return location = "/"
		}
	  }).error(function(data,status,headers,config){
		alert("Eroare la comunicare. Va rugam incercati din nou mai tarziu.");
		that.isBusy = false;
	  })
	}
  });

  app.controller('LoginController', function($http,$scope,$location){
	var that = this; 
	that.isBusy = false;

	 $scope.login = function(){
	  that.isBusy = true;
	  $http({
		"method" : "POST",
		"url" : "/login",
		"data" : {
		  email : that.email,
		  password : that.password
		},
		headers : {
		  "Content-Type" : "application/json"
		}, 
		"timeout" : 5*1000 

	  }).success(function(data,status,headers,config){ 
		if (data._errors){
		  that._errors = data._errors; console.log(data); console.log(status);
		  that.isBusy = false;
		} else {
		  return location = "/" 
		} 
	  }).error(function(data,status,headers,config){
		alert("Eroare la comunicare. Va rugam incercati din nou mai tarziu.");
		that.isBusy = false;
	  })
	 }

  });

  app.controller('LogoutController', function($http,$scope,$location){
  	var that = this;
  	$scope.logout = function(){
  		$http({
  			"method" : "POST",
  			"url" : "/logout",
  			headers : {
  				"Content-Type" : "application/json"
  			},
  			"timeout" : 5*1000
  		}).success(function(data,status,headers,config){
  			return location = "/";
  		}).error(function(data,status,headers,config){
  			alert("Eroare la comunicare. Va rugam incercati din nou mai tarziu.");
  		})
  	}
  });

  app.controller('UserPageController', function($http,$scope,$location){
	var that = this;
	that.getMyReviews = function(){
		$http({
		  "method" : "GET",
		  "url" : "/getMyReviews"
		}).success(function(data,status,headers,config){
		  if(status == 204){
			return location = "/"
		  } else {
			that.reviews = data;
		  }
		}).error(function(data,status,headers,config){
		  alert("Eroare la server. Verificati conexiunea.");
		})
	}
  })

  app.controller('AdminUserPageController', function($http,$scope,$location){
	var that = this;
	$scope.selectedTab = "unapprovedReviews";
	this.getUnapprovedReviews = function(){
		$http({
			"method" : "GET",
			"url" : "/getUnapprovedReviews"
		}).success(function(data,status,headers,config){
			if(status == 204){
			 	that.unapprovedReviewsError = "Nu s-au primit date de la server";
			} else {
			 	that.unapprovedReviews = data;
			}
		}).error(function(data,status,headers,config){
			that.unapprovedReviewsError = "Nu s-au primit date de la server";
		})	 

	}
	this.getMyReviews = function(){
		$http({ 
			"method" : "GET",
			"url" : "/getMyReviews"
		}).success(function(data,status,headers,config){
			if(status == 204){
			 	that.myReviewsError = "Nu s-au primit date de la server";
			} else {
			 	that.myReviews = data;
			}
		}).error(function(data,status,headers,config){
			that.myReviewsError = "Nu s-au primit date de la server";
		})
	}
	this.getUserList = function(){
		$http({
			"method" : "GET",
			"url" : "/getUserList"
		}).success(function(data,status,headers,config){
			if(status == 204){
			 	that.userListError = "Nu s-au primit date de la server";
			} else {
			 	that.userList = data;
			}
		}).error(function(data,status,headers,config){
			that.userListError = "Nu s-au primit date de la server";
		}) 
	}
	that.initializePageInfo = function(){
		that.getMyReviews();
 		that.getUnapprovedReviews();
		that.getUserList();
	}
	that.handleReview = function(_id,action){
		$http({
			"method" : "POST",
			"url" : "/handleReview",
			"data" : {
				"action" : action,
				"_id" : _id
			},
			headers : {
			  "Content-Type" : "application/json"
			}, 
			"timeout" : 5*1000 

		}).success(function(data,status,headers,config){ 
			if(status == 403) {
				alert("Va rugam sa va logati din nou"); 
			} else{
				that.getUnapprovedReviews();
			}
		}).error(function(data,status,headers,config){
			alert("Eroare la comunicare. Va rugam incercati din nou mai tarziu.");
		})
	}
	that.changeAdminRights = function(_id,action){
		$http({
			"method" : "POST",
			"url": "changeAdminRights",
			"data" : {
				"action" : action,
				"_id" : _id
			},
			headers : { 
				"Content-Type" : "application/json"
			},
			"timeout" : 5*1000
		}).success(function(data,status,headers,config){
			if(status == 403) {
				alert("Va rugam sa va logati din nou");
			} else {
				that.getUserList();
			}
				
		}).error(function(data,status,headers,config){
			alert("Eroare la comunicare. Va rugam incercati din nou mai tarziu.");
		})
	}
  })
 
  app.controller('writeReviewController', function($http,$scope,$location){
	var that = this;
	var isSuccessful = false;
	$scope.sendReviewToServer = function(){
	  console.log("ddd")
	  $http({
		"method" : "POST",
		"url" : "/sendReview",
		"data" : {
		  reviewTitle : that.reviewTitle,
		  reviewText : that.reviewText,
		  plants : that.plants,
		  uses : that.uses,
		  producer : that.producer
		},
		headers : {
			"Content-Type" : "application/json"
		  }, 
		  "timeout" : 5*1000
	  }).success(function(data,status,headers,config){
		  if (data._errors){
			  that._errors = data._errors;
			} else {
				$scope.isSuccessful = true;
			} 
	  }).error(function(data,status,headers,config){
		alert("Eroare la server. Verificati conexiunea");
		that.isBusy = false;
	  })  
	}
  })

 app.controller('AllReviewsPageController', function($http,$scope,$location){
	var that = this;
	that.getReviews = function(){
		$http({
		  "method" : "GET",
		  "url" : "/getReviews",
		  "params" : {"sortBy":"date","isApproved" : "1"}
		}).success(function(data,status,headers,config){
		  if(status == 204){
			return location = "/"
		  } else {
			that.reviews = data;
		  }
		}).error(function(data,status,headers,config){
		  alert("Eroare la server. Verificati conexiunea.");
		})
	}
  })

 app.controller('ReviewPageController', function($http,$scope,$location){
 	var that = this;
 	that.getReview = function(){
 		$http({
 			"method" : "GET",
 			"url" : "/getReview",
 			"params" : {"id":that.reviewID}
 		}).success(function(data,status,headers,config){
 			if(status == 204){
 				that.error = "Reviewul nu exista sau nu aveti drepturi suficiente."
 				that.review = null;
 			} else {
 				that.error = null;
 				that.review = data;
 			}
 		}).error(function(data,status,headers,config){
 			that.error = "Eroare la server. Va rog incercati mai tarziu";
 			that.review = null;
 		})
 	}
 	that.addComment = function(){
 		$http({
 			"method" : "POST",
 			"url" : "/addComment",
 			"data" : {"comment":that.comment,"id":that.reviewID}
 		}).success(function(data,status,headers,config){
 			if (status == 403){
 				alert("Va rugam sa va logati pentru a continua");
 			} else if (status == 400) {
 				alert("Comentariul trebuie sa aiba intre 1 si 1000 de caractere.");
 			} else {
 				that.getReview();
 			}
 		}).error(function(data,status,headers,config){
 			alert("Eroare la server. Va rog incercati mai tarziu");
 		})
 	}
 })

 app.controller('AdvancedSearchController', function($http,$scope,$location){
	var that = this; 
	this.settings = {};
	 $scope.search = function(){
	  that.isBusy = true;
	  $http({
		"method" : "GET",
		"url" : "/getReviews",
		"params" : that.settings
	  }).success(function(data,status,headers,config){ 
		that.reviews = data;
	  }).error(function(data,status,headers,config){
		alert("Eroare la comunicare. Va rugam incercati din nou mai tarziu.");
		that.isBusy = false;
	  })
	 }

  });


})();


// var obj={
// 	"user" : "florin92m@yahoo.com",
// 	"hoursAgo" : "24",
// 	"sortBy" : "date"
// }
// $http({
// 	"method" : "GET",
// 	"url" : "/getReviews",
// 	"params" : obj
// })
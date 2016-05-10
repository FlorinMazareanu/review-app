var ContentHandler = require("./content")
module.exports = exports = function(app,database){
	var contentHandler = new ContentHandler(database); 
	app.use(contentHandler.isLoggedInMiddleware);
	app.get('/',contentHandler.displayMainPage); 
	app.get('/advancedSearch', contentHandler.displayAdvancedSearchPage);
	app.get('/AboutPage', contentHandler.displayAboutPage);
	app.get('/register', contentHandler.displayRegisterPage);
	app.post('/register', contentHandler.handleRegisterRequest);
	app.post('/login', contentHandler.handleLoginRequest); 
	app.get('/UserPage', contentHandler.displayUserPage);  
	app.get('/getMyReviews', contentHandler.getMyReviews); 
	app.get('/writeReviewPage', contentHandler.displayWriteReviewPage);   
	app.post('/sendReview', contentHandler.sendReview);
	app.get('/getUnapprovedReviews', contentHandler.getUnapprovedReviews);
	app.get('/getUserList', contentHandler.getUserList);  
	app.post('/handleReview', contentHandler.handleReview);
	app.post('/changeAdminRights', contentHandler.changeAdminRights);
	app.get('/getReviews', contentHandler.getReviews); 
	app.get('/allReviewsPage', contentHandler.displayAllReviewsPage);
	app.get('/review/:id', contentHandler.displayReviewPage);
	app.get('/getReview', contentHandler.getReview);
	app.post('/addComment', contentHandler.addComment);
	app.post('/logout', contentHandler.handleLogoutRequest);
} 

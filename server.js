// import modules
var express        = require('express'),				// npm install express
 	  app            = express(),
    fetch_timeline = require('./server/fetch-timeline.js');

app.get('/html/fetch_timeline', fetch_timeline.callback);

var port = process.env.PORT || 3001;
app.listen(port, function() {
	console.log("Express server listening on port %d", port);
});

app.use(express.static(__dirname));

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

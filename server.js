var port = process.env.PORT || 1336;
var api_key = process.env.KEY;

var swig = require('swig'),
	request = require('superagent'),
	express = require('express');

var app = express();

app.engine('swig', swig.renderFile);

app.set('view engine', 'swig');
app.set('views', __dirname + '/lib');

// todo: switch off
// Swig will cache templates for you, but you can disable
// that and use Express's caching instead, if you like:
app.set('view cache', false);
// To disable Swig's cache, do the following:
swig.setDefaults({ cache: false });

app.get("/", function(req, res){
	res.render("index");
});

app.get("/blog/:blogname/tagged/:tag", function(req, res){
	res.render("listen", {
		"blog" : req.params.blogname,
		"tag" : req.params.tag
	});
});

app.get("/blog/:blogname", function(req, res){
	res.render("listen", {
		"blog" : req.params.blogname
	});
});

app.get("/_posts", function(req, res){
	var blog = req.query['blog'];
	if(blog.indexOf(".") == -1) blog = blog + ".tumblr.com";

	request.get("http://api.tumblr.com/v2/blog/" + blog + "/posts")
			.query({
				"api_key" : api_key,
				"type" : "audio",
				"tag" : req.query['tag'] || null,
				"offset" : req.query['offset'] || 0
			})
			.end(function(x_res){
				res.json( x_res.body );
			});
});

app.use(express.static(__dirname + "/lib"));
app.listen(port);

console.log('Server running at http://127.0.0.1:' + port);
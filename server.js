var port = process.env.PORT || process.env.VCAP_APP_PORT || 1336;
var api_key = process.env.KEY;

var	request = require("superagent"),
	express = require("express"),
	sanitize = require("sanitize-html");

var app = express();

function sendApp(req, res){
	res.sendFile(__dirname + "/app/index.html");
}

app.get("/blog/:blogname/tagged/:tag", sendApp);
app.get("/blog/:blogname", sendApp);

app.get("/_posts", function(req, res){
	var blog = req.query['blog'];
	if(blog.indexOf(".") == -1) blog = blog + ".tumblr.com";
	request
	.get("http://api.tumblr.com/v2/blog/" + blog + "/posts")
	.query({
		"api_key" : api_key,
		"type" : "audio",
		"tag" : req.query['tag'] || null,
		"offset" : req.query['offset'] || 0
	})
	.end(function(x_res){
		var body = x_res.body;
		var rsp  = [];

		try{
			for(var p in body['response']['posts']){
				var data = body['response']['posts'][p];

				var audio_url = data['audio_url'];
				if(audio_url.indexOf("tumblr.com/audio_file") != -1){
					audio_url += "?plead=please-dont-download-this-or-our-lawyers-wont-let-us-host-audio";
				}

				var post = {
					post_url : data.post_url,
					album_art : data.album_art || "http://placekitten.com/g/200/200",
					audio_url : audio_url,
					artist : data.artist || data.source_title,
					album : data.album,
					track_name : data.track_name || sanitize(data.caption, {allowedTags:[]})
				};

				rsp.push(post);
			}

			res.json({
				blog : body['response']['blog'],
				posts : rsp
			});
		} catch(e){
			res.status(503).end(e);
		}
	});
});

app.use("/bower_components", express.static(__dirname + "/bower_components"));
app.use(express.static(__dirname + "/app"));

app.listen(port);
console.log('Server running at http://127.0.0.1:' + port);
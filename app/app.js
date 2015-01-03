window.ListenTumblr = Ember.Application.create({
	LOG_TRANSITIONS: true
});

ListenTumblr.Router.map(function() {
	this.resource('posts', { path : '/blog/:blog' }, function(){
		this.route('byTag', { path : '/tagged/:tag' });
	});
	this.resource('home', { path: '/' });
});

ListenTumblr.PostsRoute = Ember.Route.extend({
	model: function(p) {
		// This is a horrible part of Ember I found :(
		var transition = this.router.router.activeTransition;
		var params = {};
		for(var k in transition.params){
			for(var y in transition.params[k]){
				params[y] = transition.params[k][y];
			}
		}

		return $.getJSON("/_posts", params).then(function(rsp){
			rsp.track = {};
			return rsp;
		});
	},
	controllerName : "posts"
});

ListenTumblr.PostsController = Ember.ObjectController.extend({
	nowPlayingStyle : Ember.computed("model.track.elapsed", "model.track.total", function(){
		var w = (this.get("model.track.elapsed") / this.get("model.track.total"))*100;
		return "background: linear-gradient(to right, #111, #111 "+w+"%, #333 "+w+"%, #333)";
	})
});

ListenTumblr.PlayerView = Ember.View.extend({
	templateName : "player",
	didInsertElement: function() {
		console.log("ok");
		
		var player = this.$('audio')[0];
		var self = this;

		player.addEventListener('ended', function(event){
			console.log("ended song");
			self.get('controller').send('setNextSong');
		});
		player.addEventListener('timeupdate', function(event){
			self.set("track.elapsed", player.currentTime);
			self.set("track.total", player.duration);
		});
	}
});

ListenTumblr.TrackController = Ember.ObjectController.extend({
 	actions: {
		play: function() {
			this.set("parentController.model.track", this.get("model"));
		}
	}
});

ListenTumblr.Router.reopen({
  location: 'history'
});
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
			rsp.params = params;
			if( window['Notification'] ){
				rsp.notificationPermission = Notification.permission == "granted";
			} else{
				rsp.notificationPermission = true; // dismiss
			}
			return rsp;
		});
	},
	controllerName : "posts"
});

ListenTumblr.PostsController = Ember.ObjectController.extend(Ember.Evented, {
	nowPlayingStyle : Ember.computed("model.track.elapsed", "model.track.total", function(){
		var w = (this.get("model.track.elapsed") / this.get("model.track.total"))*100;
		return "background: linear-gradient(to right, #111, #111 "+w+"%, #333 "+w+"%, #333)";
	}),
	actions : {
		getMoreStuff : function(){
			this.set("model.loading", true);
			var params = this.get("params");
			params.offset = this.get("model.posts.length");

			var self = this;
			$.getJSON("/_posts", params).then(function(rsp){
				self.set("model.loading", false);
				self.get("model.posts").addObjects(rsp.posts);
			});
		},
		nextTrack : function(currentIndex){
			// Random -3 just to be safe :)
			if(currentIndex*1 > this.get("model.posts").length - 3){
				this.send("getMoreStuff");
			}
			this.set("model.track", this.get("model.posts." + (currentIndex*1+1)));
		},
		enableNotifications : function(){
			var self = this;
			Notification.requestPermission(function(permission){
				self.set("model.notificationPermission", permission == "granted");
			});
		},
		closeNotificationMessage : function(){
			self.set("model.notificationPermission", true);
		},
		playPause : function(){
			this.trigger("playPauseEvent");
		}
	}
});

ListenTumblr.ScrollView = Ember.View.extend({
	didInsertElement : function(){
		var self = this;

		var t = undefined;

		$(window).scroll(function () { 
			if ($(window).scrollTop() >= $(document).height() - $(window).height() - 60) {
				if(t == $(document).height()){ return; }
				t = $(document).height();
				self.get("controller").send("getMoreStuff");
			}
		});
	}
})

ListenTumblr.PlayerView = Ember.View.extend({
	templateName : "player",
	didInsertElement: function() {
		var player = this.$('audio')[0];
		var self = this;

		self.get("controller").on("playPauseEvent", this, function(){
			if(player.paused){
				player.play();
			} else{
				player.pause();
			}
		});

		player.addEventListener('ended', function(event){
			console.log("ended song");
			self.get('controller').send('nextTrack', self.get("track.index"));
		});
		player.addEventListener('timeupdate', function(event){
			self.set("track.elapsed", player.currentTime);
			self.set("track.total", player.duration);
		});
		player.addEventListener('loadeddata', function(){
			// Notifications if enabled
			if (window['Notification']) {
				if (Notification.permission === "granted") {
					new Notification("🔊 " + self.get("track.track_name"), {
						body : self.get("track.artist"),
						tag : "listentumblr",
						icon : self.get("track.album_art")
					});
				}
			}
		});
		player.addEventListener('play', function(){
			self.set("track.playing", true);
		});
		player.addEventListener('pause', function(){
			self.set("track.playing", false);
		})
		player.addEventListener('error', function(){
			self.get('controller').send('nextTrack', self.get("track.index"));
		});
	}
});

ListenTumblr.TrackController = Ember.ObjectController.extend({
	selected : Ember.computed("parentController.model.track.id", "model.id", function(){
		return this.get("parentController.model.track.id") == this.get("model.id");
	}),
 	actions: {
		play: function() {
			this.set("parentController.model.track", this.get("model"));
		}
	}
});

ListenTumblr.Router.reopen({
  location: 'history'
});

function rsz(){
	$(".cis").each(function(){
		$(this).css({
			"position" : "absolute",
			"left" : ( ($(window).width()/2) - ($(this).width()/2) ) + "px",
			"top" : ( ($(window).height()/2) - ($(this).height()/2) ) + "px"
		});
	});
}
$(window).on("resize", rsz);
$(document).ready(function(){ rsz();rsz(); } );
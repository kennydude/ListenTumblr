window.ListenTumblr = Ember.Application.create({
	LOG_TRANSITIONS: true
});

ListenTumblr.Router.map(function() {
	this.resource('post', { path : '/blog/:blog/post/:post_id' });
	this.resource('posts', { path : '/blog/:blog' }, function(){
		this.route('byTag', { path : '/tagged/:tag' });
	});
	this.resource('home', { path: '/' });
});

ListenTumblr.PostRoute = Ember.Route.extend({
	model : function(p){
		return $.getJSON("/_post", p).then(function(rsp){
			rsp.params = p;
			rsp.track.autoplay = false;
			rsp.nowPlayingStyle = {
				"fill" : "rgba(51,51,51,0.5)",
				"background" : "transparent"
			}

			return rsp;
		});
	}
});

// thnx http://stackoverflow.com/a/12423128
ListenTumblr.ImageView = Ember.View.extend({
	tagName: 'img',
	attributeBindings:['src'],
	src: null,
	didInsertElement: function(){
		var _this = this;
		this.$().on('load', function(evt){
			return _this.imageLoaded(evt);
		});
	},
	willDestroyElement: function(){
		this.$().off('load');
	},
	imageLoaded: function(event){
		this.get('controller').send("imageLoaded", this.$());
	}
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
			rsp.nowPlayingStyle = {
				"fill" : "#111",
				"background" : "#333"
			}
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

ListenTumblr.HomeController = Ember.ObjectController.extend({
	blog : "",
	actions : {
		jump : function(){
			this.transitionToRoute('posts', this.get("blog"));
		}
	}
});

ListenTumblr.PostsController = Ember.ObjectController.extend(Ember.Evented, {
	nowPlayingStyle : Ember.computed("model.track.elapsed", "model.track.total", function(){
		var w = (this.get("model.track.elapsed") / this.get("model.track.total"))*100;
		return "background: linear-gradient(to right, "
			+this.get("model.nowPlayingStyle.fill")+", "
			+this.get("model.nowPlayingStyle.fill")+" "+w+"%, "
			+this.get("model.nowPlayingStyle.background")+" "+w+"%, "
			+this.get("model.nowPlayingStyle.background")+")";
	}),
	actions : {
		getMoreStuff : function(){
			console.log("get more stuff");
			this.set("model.loading", true);
			var params = this.get("params");
			params.offset = this.get("model.posts.length");

			var self = this;
			$.getJSON("/_posts", params).then(function(rsp){
				self.set("model.loading", false);
				self.get("model.posts").addObjects(rsp.posts);
				self.trigger("gotMoreStuff");
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
		},
		tagLink : function(blog, tag){
			this.transitionToRoute("home");
			this.transitionToRoute('posts.byTag', blog, tag);
		}
	}
});

ListenTumblr.PostController = ListenTumblr.PostsController.extend({
	controlStyle : Ember.computed("nowPlayingStyle", "model.track.width", "model.track.height", function(){
		return this.get("nowPlayingStyle") + "; width: " + this.get("model.track.width") + "; height: " +
			this.get("model.track.height") + "; top: -" + this.get("model.track.height");
	}),
	actions : {
		imageLoaded : function(img){
			this.set("model.track.width", img.width());
			this.set("model.track.height", img.height());
		}
	}
});

ListenTumblr.ScrollView = Ember.View.extend({
	didInsertElement : function(){
		var self = this;

		var can = true;

		$(window).scroll(function () { 
			if ($(window).scrollTop() >= $(document).height() - $(window).height() - 60) {
				if(!can){ return; }
				can = false;
				self.get("controller").send("getMoreStuff");
			}
		});

		this.get("controller").on("gotMoreStuff", this, function(){
			can = true;
		});
	}
})

ListenTumblr.PlayerView = Ember.View.extend({
	templateName : "player",
	playTrack : Ember.observer("track.audio_url", function(){
		if(this.get("track.autoplay") == false) { return; };

		Ember.run.scheduleOnce('afterRender', this, function() {
			this.get("player").play();
		});
	}),
	didInsertElement: function() {
		var player = this.$('audio')[0];
		this.set("player", player);
		var self = this;

		if(this.get("track.autoplay") != false) {
			player.play();
		}

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
			self.set("track.playing", true);
			self.set("track.elapsed", player.currentTime);
			self.set("track.total", player.duration);
		});
		player.addEventListener('loadeddata', function(){
			self.set("track.hasNotified", false);
		});
		player.addEventListener('play', function(){
			self.set("track.playing", true);
			if(self.get("track.hasNotified") != true){
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
				self.set("track.hasNotified", true);
			}
			document.title = "▸ ListenToTumblr";
		});
		player.addEventListener('pause', function(){
			self.set("track.playing", false);
			document.title = "ListenToTumblr";
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
function formatTime(timeLeft){
	var s = timeLeft % 60;
    var m = Math.floor( timeLeft / 60 ) % 60;
    
    s = s < 10 ? "0"+s : s;
    m = m < 10 ? "0"+m : m;
    
    return m+":"+s;
}

var currentPlayer = null;
function playMe(player){
	if(currentPlayer != null){
		try{
			var track = $(currentPlayer).closest(".track");
			track.removeClass("current");
			$(".playing", track).addClass("hide");
			$(".playThisTrack", track).removeClass("hide");

			currentPlayer.currentTime = 0;
			currentPlayer.pause();
		} catch(e){}
	}
	currentPlayer = player;
	console.log(player);

	$("#thecurrenttrack").removeClass("hide");

	var track = $(player).closest(".track");
	track.addClass("current");
	$(".playing", track).removeClass("hide");
	$("#playIcon").addClass('hide'); 
	$(".playThisTrack", track).addClass("hide");

	$("#curAlbumArt").attr("src", $(".coverArt", track).attr("src"));
	$("#curTitle").text( $(".title", track).text() );
	$("#curSub").text( $(".sub", track).text() );

	if(window.useNotifications){
		setTimeout(function(){
			console.log("Notification: " + $(".title", track).text());
			new Notification("▶ " + $(".title", track).text().replace("\n"," "), {
				"body" : $(".sub", track).text() 
			});
		}, 100);
	}

	// Add events
	currentPlayer.addEventListener("timeupdate", function() {
		var duration = parseInt( currentPlayer.duration ),
			currentTime = parseInt( currentPlayer.currentTime );

		$("#currentTime").text( formatTime(currentTime) );
		$("#totalTime").text( formatTime(duration) );
	});

	currentPlayer.addEventListener("play", function(){
		$("#playIcon").addClass('hide'); $("#pauseIcon").removeClass('hide');
	});

	currentPlayer.addEventListener("pause", function(){
		$("#playIcon").removeClass('hide'); $("#pauseIcon").addClass('hide');
	});

	currentPlayer.addEventListener("ended", function(){
		playNext();
	});

	currentPlayer.play();
}

window.CURRENTOFFSET = 0;
function playNext(){
	var np = $("audio",$(currentPlayer).closest(".track").next()).get(0);
	if( np == undefined){
		nextPage(function(){ playNext(); });
		return;
	}
	playMe(  np );
}

var loading = false;
function nextPage(cb){
	if(loading) return;
	loading = true;
	window.CURRENTOFFSET = window.CURRENTOFFSET + 20;
	fetchListen("&offset=" + window.CURRENTOFFSET, function(){
		loading = false;
		cb();
	});
}

$(window).scroll(function () { 
   if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
      nextPage(function(){});
   }
});

$("#nextTrack").click(function(){
	playNext();
});

$("#prevTrack").click(function(){
	playMe( $("audio", $(currentPlayer).closest(".track").prev()) );
});

$("#playPause").click(function(){
	if(currentPlayer == null){
		playMe( $("audio").get(0) );
	} else{
		if(currentPlayer.paused){
			currentPlayer.play();
		} else{
			currentPlayer.pause();
		}
	}
});

function enableNotifications(){
	Notification.requestPermission(function (permission) {
		if (permission === "granted") {
			window.useNotifications = true;
			$("#enableNotifications").addClass("hide"); // goodbye
		}
	});
}
$("#enN").click(function(){
	enableNotifications();
});
$("#noNotif").click(function(){
	$("#enableNotifications").addClass("hide");
});

function scrollLeft(){
	var p = Math.min($("#scrollTitle").width(), 300);
	var t = $("#scrollTitle").text().length * 300;
	$("#scrollTitle").animate({
		"margin-left" : "-" + p + "px"
	}, t, function(){
		scrollRight();
	})
}

function scrollRight(){
	var t = $("#scrollTitle").text().length * 300;
	$("#scrollTitle").animate({
		"margin-left" : "0px"
	}, 3000, function(){
		scrollLeft();
	})
}
scrollLeft();

function fetchListen(ex, cb){
	$("#loading").fadeIn();
	$.getJSON("/_posts" + window.GETPREFIX + ex, function(data){
		console.log(data.meta.status);
		if(data.meta.status == 200){
			data.response.posts.forEach(function(post){
				var t = $("#template").clone().removeAttr("id");
				$(".coverArt", t).attr("src", post.album_art);

				var ex = post.track_name;
				if(!ex){
					ex = $("<div>").html( post.caption ).text();
				}
				$(".title", t).text(ex);

				ex = "";
				if(post.artist){
					ex += "by " + post.artist + " ";
				} if(post.album){
					ex += "on the album " + post.album;
				}
				$(".sub", t).text(ex+" ");

				var play = $("<audio>").appendTo(t).attr("preload","none");
				var url = post.audio_url;
				if(url.indexOf("?") == -1){
					url += "?plead=please-dont-download-this-or-our-lawyers-wont-let-us-host-audio";
				}
				$("<source>").attr("src", url).appendTo(play);

				$(".playThisTrack", t).click(function(){
					console.log("jump");
					playMe( $("audio", $(this).closest(".track") ).get(0) );
				});
				$(".permalink", t).attr("href", post.post_url);

				post.tags.forEach(function(tag){
					$("<a>").attr("href", "/blog/" + window.BLOG + "/tagged/" + tag).text("#"+tag).appendTo($(".tags", t));
				});

				t.appendTo("#posts");
			});
			$("#playControls").removeClass("hide");
			$("#loading").fadeOut();

			if(cb != null){ cb(); }

			if(window['Notification'] != null){
				if(Notification.permission != "granted"){
					$("#enableNotifications").removeClass("hide");
				} else{ // already granted
					window.useNotifications = true;
				}
			}
		} else{
			$("#loading").fadeOut();
			$("#notF").removeClass("hide");
		}
	});
}
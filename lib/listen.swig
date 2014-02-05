{% extends "layout.swig" %}
{% block content %}
<div class="hide alert alert-danger" id="notF">
	<p>Blog could not be found :(</p>
</div>
<div class="container" id="posts">
	<div class="alert alert-info hide" id="enableNotifications">
		<p>Enable Next Song Notifications</p>
		<button class="btn" id="enN">Enable</button>
	</div>
</div>
<div class="cis c b w" id="loading">
	<img src="/load.gif" />
</div>
<div class="hide">
	<div id="template" class="row track">
		<div class="col-xs-1">
			<span class="playing hide">
				<span style="float:right;color:#FFF;font-size:35px;" class="glyphicon glyphicon-volume-up"></span>
			</span>
			<button class="btn btn-default playThisTrack">
				<span class="glyphicon glyphicon-play"></span>
			</button>
		</div>
		<div class="col-xs-2"><img class="coverArt" src="http://placekitten.com/100/100" /></div>
		<div class="col-xs-9">
			<h5 class="title">Track Title</h5>
			<div class="sub">by XYZ on thw album YYY</div>
		</div>
	</div>
</div>
<div class="b bf hide" id="playControls">
	<div class="container">
		<div class="btn-group">
			<button type="button" class="btn btn-default btn-lg" id="prevTrack">
				<span class="glyphicon glyphicon-step-backward"></span>
			</button>
			<button type="button" class="btn btn-default btn-lg" id="playPause">
				<span id="playIcon" class="glyphicon glyphicon-play"></span>
				<span id="pauseIcon" class="glyphicon glyphicon-pause hide"></span>
			</button>
			<button type="button" class="btn btn-default btn-lg" id="nextTrack">
				<span class="glyphicon glyphicon-step-forward"></span>
			</button>
			<button type="button" id="thecurrenttrack" class="btn btn-default btn-lg hide">
				<span id="scrollTitle">
					<strong id="curTitle">Track title</strong>
					<span id="curSub">subtitle</span>
				</span>
			</button>
			<button type="button" class="btn btn-default btn-lg">
				<span id="currentTime">0:00</span> / <span id="totalTime">0:00</span>
			</button>
		</div>
		<img id="curAlbumArt" />
	</div>
</div>
{% endblock %}
{% block scripts %}
window.GETPREFIX = "?blog={{ blog }}{% if tag %}&tag={{tag}}{% endif %}";
fetchListen("");
{% endblock %}
{% block footer %}
<script type="text/javascript" src="/player.js"></script>
{% endblock %}
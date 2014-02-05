{% extends "layout.swig" %}
{% block content %}
<div class="cis c b">
	<h1>Listen to Tumblr</h1>
	<p>Want to listen to your tumblr?</p>
	<input type="text" id="blog" class="form-control" placeholder="Blog URL" />
</div>
{% endblock %}
{% block scripts %}
$("#blog").on("keyup", function(e){
	if(e.keyCode == 13){ // Enter
		document.location = "/blog/" + $("#blog").val();
	}
});
{% endblock %}
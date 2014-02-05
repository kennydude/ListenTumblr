<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, minimum-scale=1.0">

	<title>Listen to Tumblr</title>

	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css" />
	<link type="text/plain" rel="author" href="/humans.txt" />
	<link rel="stylesheet" href="/style.css" />
</head>
<body>

<noscript>
	<div class="alert alert-error">
		<p>What kind of day and age do you think is to run around with Javascript turned on?</p>
	</div>
</noscript>

    {% block content %}

    {% endblock %}

<script type="text/javascript" src="//code.jquery.com/jquery.min.js"></script>
{% block footer %}{% endblock %}
<script type="text/javascript">
function rsz(){ $(".cis").each(function(){
$(this).css({
"position" : "absolute",
"left" : ( ($(window).width()/2) - ($(this).width()/2) ) + "px",
"top" : ( ($(window).height()/2) - ($(this).height()/2) ) + "px"
});
})};
$(window).on("resize", rsz);
$(document).ready(function(){ rsz();rsz(); } );
{% block scripts %} {% endblock %}
</script>
</body>
</html>

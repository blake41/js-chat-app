var translate = function(toTranslate, accessToken) {
	var translatedText,
			from = "en",
			to = "es",
			path = ["/V2/Ajax.svc/Translate?text=", toTranslate,
		  				"&from=", from,
		    			"&to=", to].join(""),
			uri = "http://api.microsofttranslator.com" + path
			options = {
		  	uri: uri,
		  	headers : {
		  		Authorization : "Bearer " + accessToken
		  	}
			},
		request.get(options, function(err, res, body) {
			translatedText = body;
		})
	return translatedText;
}
module.exports.translate = function (toTranslate) {
	var request = require('request'),
		qs = require('querystring'),
		redis = require("redis"),
		client = redis.createClient(),
		postBody = qs.stringify({
			client_secret : "n0ZNqCAkaGNiiDu11EUH90MXmEs5A4+QQM++RM3U1Wk=",
			client_id : "blakeTranslate",
			grant_type : "client_credentials",
			scope : "http://api.microsofttranslator.com"
		}),
		translatedText;
		accessToken;
	client.hgetall("token", function(err, reply) {
		var nowInSeconds = Math.round(Date.now() / 1000),
			expiresOn = reply.expiresOn,
			accessToken = reply.accessToken
			postOptions = {
				url : "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13",
				body : postBody
			}
		if((expiresOn - nowInSeconds) > 0) {
			translatedText = translate(toTranslate, accessToken)
		}
		else {
			request.post(postOptions, function(e, r, body) {
				var tokenHash = JSON.parse(body);
				var expiresOn = qs.parse(tokenHash.access_token).ExpiresOn;
				var accessToken = tokenHash.access_token
				client.hmset("token", "accessToken", accessToken, "expiresOn", expiresOn, function() {
					translatedText = translate(toTranslate, accessToken)
				})
			})
		}
	})
	return translatedText;
}
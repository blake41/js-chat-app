var request = require('request'),
  	qs = require('querystring');

var makeRequest = function(toTranslate, accessToken, callback) {
	var from = "en",
			to = "es",
			path = ["/V2/Ajax.svc/Translate?text=", toTranslate,
		  				"&from=", from,
		    			"&to=", to].join(""),
			uri = "http://api.microsofttranslator.com" + path,
			options = {
		  	uri: uri,
		  	headers : {
		  		Authorization : "Bearer " + accessToken
		  	}
			}

	request.get(options, function(err, res, body) {
		callback(body);
	})
}
module.exports.translate = function (toTranslate, expiresOn, accessToken, redis, callback) {
	
	var postBody = qs.stringify({
  	client_secret : "n0ZNqCAkaGNiiDu11EUH90MXmEs5A4+QQM++RM3U1Wk=",
	  client_id : "blakeTranslate",
	  grant_type : "client_credentials",
	  scope : "http://api.microsofttranslator.com"
	}),
		nowInSeconds = Math.round(Date.now() / 1000),
		postOptions = {
			url : "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13",
			body : postBody
		}

	if((expiresOn - nowInSeconds) > 0) {
		makeRequest(toTranslate, accessToken, callback)
	}
	else {
		console.log('invalid token')
		request.post(postOptions, function(e, r, body) {
			var tokenHash = JSON.parse(body);
			var expiresOn = qs.parse(tokenHash.access_token).ExpiresOn;
			var accessToken = tokenHash.access_token
			redis.hmset("token", "accessToken", accessToken, "expiresOn", expiresOn, function() {
				makeRequest(toTranslate, accessToken, callback)
			})
		})
	}
}
// separate the translation from redis, pass in whatever we need for a translation
// args = word, token, callback
// separate out getting a token
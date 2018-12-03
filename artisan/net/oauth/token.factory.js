/* global angular */

(function() {
	"use strict";

	var app = angular.module('artisan');

	// todo

	/*
	usage

	in controller A

	add storage
	var auth = {
	    access_token: $routeParams.bearerId,
	    token_type: "bearer",
	    expires_in: 60 * 60 * 1000,
	    created_at: new Date().getTime() / 1000,
	    // external: true,
	};
	LocalStorage.set('authorization', auth);

	var token = new Token({ key: 'Garmin' });
	token.waiting({
	    callback: '/connect/{auth.access_token}/garmin/{token.oauth_verifier}',
	});
	... my awesome oauth call
	window.location.href = oauthUrl;

	in controller B
	var token = new Token({ key: 'Garmin' });
	token.set({ mytokenobj... });

	*/

	app.factory('Token', ['$q', 'LocalStorage', function($q, LocalStorage) {

		function Token() {
			var token = this;
			token.protocol = 'https';
			token.port = 44303;
			token.key = 'Key';
			token.storage = LocalStorage;
			if (options) {
				for (var p in options) {
					token[p] = options[p];
				}
			}
			token.await = 'Waiting' + token.key;
			token.token = 'Token' + token.key;
		}

		var statics = {};

		var publics = {
			getQuery: getQuery,
			getUri: getUri,
			get: get,
			set: set,
			waiting: waiting,
			redirect: redirect,
		};

		angular.extend(Token, statics);
		angular.extend(Token.prototype, publics);

		return Token;

		function getQuery() {
			var queryString = window.location.search.substring(1);
			var model = {};
			var vars = queryString.split('&');
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split('=');
				model[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
			}
			return model;
		}

		function getUri(callback, token) {
			var uri = callback;
			var auth = LocalStorage.get('authorization');
			for (var p in auth) {
				uri = uri.split('{auth.' + p + '}').join(auth[p]);
			}
			for (var p in token) {
				uri = uri.split('{token.' + p + '}').join(token[p]);
			}
			return uri;
		}

		function get() {
			return this.storage.get(this.token);
		}

		function set(model) {
			this.storage.set(this.token, model);
		}

		function redirect() {
			var scope = this;
			try {
				var await = this.storage.get(this.await);
				if (!await &&window.document.domain.indexOf('localhost') === -1) {
					var queryString = window.location.href.split('?')[1];
					window.location.href = this.protocol + '://localhost:' + this.port + '?' + queryString;
				} else {
					this.storage.delete(this.await);
					var model = this.getQuery();
					this.set(model);
					if (await.callback) {
						var uri = this.getUri(await.callback, model);
						window.location.href = uri;
					} else {
						window.close();
					}
				}
			} catch (e) {
				document.write('Error ' + e.message);
			}
		}

		function waiting(options) {
			var model = {
				uri: window.location.href,
			}
			if (options) {
				for (var p in options) {
					model[p] = options[p];
				}
			}
			// options.callback = '/connect/{auth.access_token}/garmin/{token.oauth_verifier}';
			var await = this.storage.set(this.await, model);
		}

    }]);

}());

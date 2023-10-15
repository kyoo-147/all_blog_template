/*
 * Pure Vanilla JavaScript solution that doesn't require any authorization. 
 * Uses JSONP request to get around CORS blocking.
 * The Short URL generated is copied to clipboard.
 *
 * Tested in Firefox, Chrome, Edge & IE11
 */

(function() {
	var debug = false;

	// JSONP request
	var loadJSONP = (function() {
		var unique = 0;
		return function(url, callback, context) {
			var name = "_jsonp_" + unique++;
			url += (url.match(/\?/) ? "&" : "?") + "callback=" + name;
			var script = document.createElement("script");
			script.src = url;
			window[name] = function(data) {
				callback.call(context || window, data);
				document.querySelector("head").removeChild(script);
				script = null;
				delete window[name];
			};
			document.querySelector("head").appendChild(script);
		};
	})();

	// Copy text to clipboard
	var copyToClipboard = function(txt) {
		var ta = document.createElement("textarea");
		ta.value = txt;
		ta.setAttribute("readonly", "");
		ta.style.position = "absolute";
		ta.style.left = "-9999px";
		document.body.appendChild(ta);
		ta.select();
		document.execCommand("copy");
		document.body.removeChild(ta);
	};

	// On mousedown handler
	var createShortUrl = function(e) {
		e.preventDefault();
		var url = this.value.trim();
		if (debug) console.log("mousedown event triggered");
		if (this.validity && this.validity.valid && url !== "") {
			if (debug) console.log("url is valid");
			var isgdUrl =
				"https://is.gd/create.php?format=json&url=" + encodeURIComponent(url);

			loadJSONP(isgdUrl, function(data) {
				if (debug) console.log("JSONP callback triggered");
				// Browsers won't allow ClipBoard action here due to callback is not a "user generated event"
				// So instead we set up a "mouseup" event, which is a "user generated event" and apply the clipboard action there.
				var mouseupHandler = function() {
					if (debug) console.log("mouseup event triggered");
					copyToClipboard(data.shorturl);
					outputEl.innerHTML =
						"<span>URL Pendek <strong>" +
						data.shorturl +
						"</strong> disalin ke papan klip.</span>";
					// IE/Edge doesn't support the "once: true" parameter
					// so the handler must be removed manually
					window.removeEventListener("mouseup", mouseupHandler, false);
				};

				window.addEventListener("mouseup", mouseupHandler, false);
				// Trigger the 'mouseup' event (it can only fire once)
				var event;
				if (typeof MouseEvent !== "function") {
					// IE/Edge
					event = document.createEvent("MouseEvent");
					event.initMouseEvent(
						"mouseup",
						true,
						true,
						window,
						0,
						0,
						0,
						0,
						0,
						false,
						false,
						false,
						false,
						0,
						null
					);
				} else {
					event = new MouseEvent("mouseup", {
						view: window,
						bubbles: true,
						cancelable: false
					});
				}
				window.dispatchEvent(event);
			});
		} else {
			outputEl.innerHTML =
				"<span class='error'>Harap masukkan URL yang valid, termasuk. http://</span>";
		}
	};

	var inputEl = document.querySelector("input#url"),
		buttonEl = document.querySelector("button#action"),
		outputEl = document.querySelector("#output");

	if (debug) inputEl.value = "https://stbi.pages.dev/";

	buttonEl.addEventListener("mousedown", createShortUrl.bind(inputEl), false);
	inputEl.addEventListener(
		"focus",
		function() {
			outputEl.innerHTML = "";
		},
		false
	);
})();

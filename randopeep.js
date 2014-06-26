(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/* global module */
/* global require */
/* global define */

var randopeep = {};

require('./src/randopeep.js')(randopeep);

randopeep.name = require('./src/name.js')(randopeep);
randopeep.cc = require('./src/cc.js')(randopeep);
randopeep.ipsum = require('./src/ipsum.js')(randopeep);
randopeep.address = require('./src/address.js')(randopeep);
randopeep.corporate = require('./src/corporate.js')(randopeep);
randopeep.internet = require('./src/internet.js')(randopeep);
randopeep.invention = require('./src/invention.js')(randopeep);

module.exports = require('./src/interface.js')(randopeep);

// wrapper for AMD/browser-global
// slightly wonky way to hand paths to laoder
// should figure out how to lazy-load better
/* global define */
if (typeof(define) === 'function'){
	define(function(){
		return module.exports;
	});
}else{
	if (typeof(window) !== 'undefined'){
		window.randopeep = module.exports;
	}
}

// pre-load data files
randopeep.data = {};
//<data>
randopeep.dataLocation="http://konsumer.github.io/randopeep/data/";
//</data>
},{"./src/address.js":2,"./src/cc.js":3,"./src/corporate.js":4,"./src/interface.js":5,"./src/internet.js":6,"./src/invention.js":7,"./src/ipsum.js":8,"./src/name.js":9,"./src/randopeep.js":10}],2:[function(require,module,exports){
'use strict';

module.exports = function(randopeep){
	// where do people come from that cities/streets are named after?
	var sOrigins = ['english','english','english','japanese','chinese','germanic','spanish'];

	var address = {
		zip:function(){
			return randopeep.replaceSymbolWithNumber(randopeep.randomEl(['#####', '#####-####']));
		},

		city: function (){
			switch (randopeep.int(6)) {
			case 0:
				return randopeep.format(
					'{0} {1}{2}',
					randopeep.get('city/prefix'),
					randopeep.name({'justLast': true, 'origin': sOrigins, 'prefix':false}),
					randopeep.get('city/suffix')
				);
			case 1:
				return randopeep.format(
					'{0} {1}{2}',
					randopeep.get('city/prefix'),
					randopeep.name({'last': false, 'origin': sOrigins, 'prefix':false}),
					randopeep.get('city/suffix')
				);
	        case 2:
				return randopeep.format(
					'{0}{1}',
					randopeep.name({'justLast': true, 'origin': sOrigins, 'prefix':false}),
					randopeep.get('city/suffix')
				);
			case 3:
				return randopeep.format(
					'{0}{1}',
					randopeep.name({'last': false, 'origin': sOrigins, 'prefix':false}),
					randopeep.get('city/suffix')
				);
	        case 4:
				return randopeep.format(
					'{0} {1}',
					randopeep.get('city/prefix'),
					randopeep.name({'justLast': true, 'origin': sOrigins, 'prefix':false})
				);
			case 5:
				return randopeep.format(
					'{0} {1}',
					randopeep.get('city/prefix'),
					randopeep.name({'last': false, 'origin': sOrigins, 'prefix':false})
				);
	        }
	    },

		geo:function(){
			return [(randopeep.int(180 * 10000) / 10000.0 - 90.0).toFixed(4), (randopeep.int(360 * 10000) / 10000.0 - 180.0).toFixed(4)];
		},
		
		streetName: function () {
			switch (randopeep.int(5)) {
			case 0:
			case 1:
			case 2:
			case 3:
				return randopeep.format(
					'{0} {1}',
					randopeep.name({'justLast': true, 'origin': sOrigins, 'prefix':false}),
					randopeep.get('street/suffix')
				);
			case 4:
				return randopeep.format(
					'{0} {1}',
					randopeep.titleCase(randopeep.get('bs/noun')),
					randopeep.get('street/suffix')
				);
			}
		},

		streetAddress: function (useFullAddress) {
			if (useFullAddress === 'random') { useFullAddress = randopeep.randomEl([true,false]); }
			var out = (useFullAddress) ? ', ' + address.secondaryAddress() : '';
			switch (randopeep.int(3)) {
			case 0:
				return randopeep.replaceSymbolWithNumber('#####') + ' ' + address.streetName() + out;
			case 1:
				return randopeep.replaceSymbolWithNumber('####') + ' ' + address.streetName() + out;
			case 2:
				return randopeep.replaceSymbolWithNumber('###') + ' ' + address.streetName() + out;
			}
		},

		secondaryAddress: function () {
			return randopeep.replaceSymbolWithNumber(randopeep.randomEl(
				[
					'Apt. ###',
					'Suite ###'
				]
			));
		},

		phone: function(){
			return randopeep.replaceSymbolWithNumber(randopeep.get('phone'));
		}
	};

	return address;
};
},{}],3:[function(require,module,exports){
'use strict';

module.exports = function(randopeep){
	
	var luhnGen = (function(){
		var d = [0, 1, 2, 3, 4, -4, -3, -2, -1, 0];
		return function (l,s,i,m) {
			s = 0;
			for (i=0; i<l.length; i++ ){ s += parseInt(l.substring(i,i+1),10); }
			for (i=l.length-1; i>=0; i-=2 ){ s += d[parseInt(l.substring(i, i + 1),10)]; }
			m = 10 - (s % 10);
			return (m === 10) ? 0 : m;
		};
	})();

	/**
	 * Generate a credit-card #
	 * http://en.wikipedia.org/wiki/Bank_card_number#Issuer_identification_number_.28IIN.29
	 * @param  String issuer  Issuer of CC #: visa (default), mastercard, amex, discover, diners
	 * @param Number len      For visa & mastercard, can be 13 or 16 (default)
	 * @return String         Your fake CC #
	 */
	return function(issuer, len){
		issuer = issuer || 'visa';
		len = len || 16;
		if (['visa', 'mastercard', 'amex', 'discover', 'diners'].indexOf(issuer) === -1){
			return false;
		}
		var out;

		if (issuer === 'visa'){
			if (len !== 16 && len !== 13){
				len = 16;
			}
			out = 4;
		}else{
			len = 16;
		}

		if (issuer === 'mastercard'){
			out = randopeep.randomEl([51, 52, 53, 54, 55]);
		}

		if (issuer === 'amex'){
			out = randopeep.randomEl([34, 37]);
		}

		if (issuer === 'discover'){
			out = randopeep.randomEl([6011, 622126+randopeep.int(799), 644+randopeep.int(5), 65]);
		}

		if (issuer === 'diners'){
			out = randopeep.randomEl([54, 55]);
		}

		out = out.toString().split('');
		while (out.length < (len-1)){
			out.push(randopeep.int().toString());
		}

		out.push(luhnGen(out.join('')));
		return out.join('');

	};
};

},{}],4:[function(require,module,exports){
'use strict';

module.exports = function(randopeep){
	var suffixes = {
		'cyber': ['Inc', 'Corp', 'Blok'],
		'small': ['and Sons', 'LLC', 'Group', 'and Daughters', 'Studio'],
		'large': ['Group', 'Inc', 'Corp']
	};

	// where do companies come from?
	var sOrigins = ['english','japanese','chinese','germanic','spanish'];

	var corporate = {
		name: function(format){
			format = format || randopeep.randomEl(['cyber', 'firm', 'small','large']);
			switch(format){
			case 'cyber':
				return randopeep.format(
					'{0}{1}',
					randopeep.name({'last': false, 'origin': 'netrunner', 'prefix':false}),
					randopeep.randomEl(suffixes.cyber)
				);
			case 'firm':
				// they are all from the same origin
				var origin = randopeep.randomEl(sOrigins);
				return randopeep.format(
					'{0}, {1} and {2}',
					randopeep.name({'justLast': true, 'origin': origin, 'prefix':false}),
					randopeep.name({'justLast': true, 'origin': origin, 'prefix':false}),
					randopeep.name({'justLast': true, 'origin': origin, 'prefix':false})
				);
			case 'small':
				return randopeep.format(
					'{0} {1}',
					randopeep.name({'justLast': true, 'origin': sOrigins, 'prefix':false}),
					randopeep.randomEl(suffixes.small)
				);
			case 'large':
				return randopeep.format(
					'{0} {1}',
					randopeep.name({'justLast': true, 'origin': sOrigins, 'prefix':false}),
					randopeep.randomEl(suffixes.large)
				);
			}
		},

		catchPhrase: function () {
			return randopeep.format(
				'{0} {1} {2}',
				randopeep.get('catchPhrase/adjective'),
				randopeep.get('catchPhrase/descriptor'),
				randopeep.get('catchPhrase/noun')
			);
		},

		bs: function () {
			return randopeep.format(
				'{0} {1} {2}',
				randopeep.get('bs/adjective'),
				randopeep.get('bs/buzz'),
				randopeep.get('bs/noun')
			);
		}
	};

	return corporate;
};
},{}],5:[function(require,module,exports){
'use strict';

/**
 * Help make the api more friendly & handle multiples
 */

module.exports = function(randopeep){
	function wrapFunc(n, func){
		var args = Array.prototype.slice.call(arguments,2);
		n = n || 1;
		var out = [];
		for(var i=0;i<n;i++){
			out.push(func.apply(randopeep, args));
		}
		return (n===1) ? out.pop() : out;
	}

	var api = {};

	api.data = randopeep.data;
	api.get = function(list, n){ return randopeep.getCount(n, list); };
	api.ipsum = randopeep.ipsum; // (n, list)

	api.name = function (params,n){ return wrapFunc(n, randopeep.name, params); };
	api.job = function(n) { return api.get('jobs',n); };
	api.cc = function(type, charCount, n){ return wrapFunc(n, randopeep.cc, type, charCount); };
	api.invention = function(n){ return wrapFunc(n, randopeep.invention); };

	api.address = {};
	api.address.state = function(n) { return api.get('us/state',n); };
	api.address.state.a = function(n) { return api.get('us/state/abbr',n); };
	api.address.zip = function(n){ return wrapFunc(n, randopeep.address.zip); };
	api.address.city = function(n){ return wrapFunc(n, randopeep.address.city); };
	api.address.geo = function(n){ return wrapFunc(n, randopeep.address.geo); };
	api.address.streetName = function(n){ return wrapFunc(n, randopeep.address.streetName); };
	api.address.streetAddress = function(useFullAddress,n){ return wrapFunc(n, randopeep.address.streetAddress, useFullAddress); };
	api.address.phone = function(n){ return wrapFunc(n, randopeep.address.phone); };
	api.address.uk = {};
	api.address.uk.country = function(n) { return api.get('uk/country',n); };
	api.address.uk.county = function(n) { return api.get('uk/county',n); };
	
	api.corporate = {};
	api.corporate.name = function (type,n){ return wrapFunc(n, randopeep.corporate.name, type); };
	api.corporate.catchPhrase = function (n){ return wrapFunc(n, randopeep.corporate.catchPhrase); };
	api.corporate.bs = function (n){ return wrapFunc(n, randopeep.corporate.bs); };
	
	api.internet = {};
	api.internet.ip = function (n){ return wrapFunc(n, randopeep.internet.ip); };
	api.internet.domain = function (derived,n){ return wrapFunc(n, randopeep.internet.domain, derived); };
	api.internet.email = function (derived,n){ return wrapFunc(n, randopeep.internet.email, derived); };
	api.internet.username = function (derived,n){ return wrapFunc(n, randopeep.internet.username, derived); };
	
	return api;
};
},{}],6:[function(require,module,exports){
'use strict';

module.exports = function(randopeep){
	// where do domains/usernames come from?
	var sOrigins = ['netrunner','netrunner','netrunner','english','japanese','chinese','germanic','spanish'];

	var internet = {
		email: function(derived){
			switch (randopeep.int(2)) {
			case 0:
				return internet.username(derived) + '@' + internet.domain();
			case 1:
				return internet.username() + '@' + internet.domain(derived);
			}
		},
		
		username:function(derived){
			if (!derived){
				switch (randopeep.int(3)) {
				case 0:
					derived = randopeep.name({'justLast':randopeep.randomEl([true,false]) , 'origin': sOrigins, 'prefix':false});
					break;
				case 1:
					derived = randopeep.get('bs/noun');
					break;
				case 2:
					derived = randopeep.get('catchPhrase/noun');
					break;
				}
			}
			return derived.replace(' ',randopeep.randomEl(['.','_'])).toLowerCase();
		},

		domain:function(derived){
			return randopeep.format(
				'{0}.{1}',
				internet.username(derived),
				randopeep.get('domain/suffix')
			);
		},
		
		ip:function(){
			var randNum = function () {
				return (Math.random() * 254 + 1).toFixed(0);
			};

			var result = [];
			for (var i = 0; i < 4; i++) {
				result[i] = randNum();
			}

			return result.join('.');
		}
	};

	return internet;
};
},{}],7:[function(require,module,exports){
'use strict';

module.exports = function(randopeep){
	var formats = [
		'{3} {1}',
		'{3} {4} {1}',
		'{3} {0}{1}',
		'{0}{4} {2}',
		'{3} {0}{1} {2}',
		'{3} {4} {1} {0}{2}',
		'{3} {4} {1} {2}',
		'{3} {0}{4} {1} {2}'
	];

	return function(){
		return randopeep.format(
			randopeep.randomEl(formats),
			randopeep.get('invention/prefix'),
			randopeep.get('invention/function1'),
			randopeep.get('invention/function2'),
			randopeep.get('invention/catalyst1'),
			randopeep.get('invention/catalyst2')
		);
	};
};
},{}],8:[function(require,module,exports){
'use strict';

module.exports = function(randopeep){
	/**
	 * Random series of sentences from wordlist
	 * @param  Number   len  Number of words to generate
	 * @param  String   list Wordlist to use. defaults to 'ipsum/lorem'
	 * @return String        Random text
	 */
	var ipsum = function(len, list){
		len = len || 200;
		list = list || 'ipsum/lorem';
		var out = [];
		var sentenceLengths = [10,12,13,15,14];
		var words = randopeep.getCount(len, list);

		words.forEach(function(word,i){
			if (i===0 || i % sentenceLengths[i%5] === 0){
				word = randopeep.titleCase(word);
				if (i!==0){
					out[i-1] += '.';
				}
			}
			out.push(word);
		});
		return out.join(' ') + '.';
	};

	// alias
	randopeep.lorem = ipsum;
	return ipsum;
};
},{}],9:[function(require,module,exports){
'use strict';

module.exports = function(randopeep){
	return function(params){
		params = params || {};
		var defaults = {
			'origin': ['chinese', 'dark/elven', 'dwarven','elven', 'english', 'germanic','japanese','orcish','spanish','netrunner'],
			'gender': ['male','female'],
			'last': true,
			'justLast': false,
			'prefix': [true, false],
			'returnData': false,
		};

		// arrays mean "pick a random 1"
		// if emtpy, set default
		for (var i in defaults){
			if (typeof(params[i]) === 'undefined'){
				params[i] = defaults[i];
			}
			if (typeof(params[i]) === 'object'){
				params[i] = randopeep.randomEl(params[i]);
			}
		}



		// some don't have gender
		// some don't have titles
		// some don't have prefixes
		if (params.origin === 'dark/elven'){
			params.gender = 'female';
			params.prefix = false;
		}
		if (params.origin === 'dwarven'){
			params.last = false;
			params.gender = 'male';
			params.prefix = false;
		}
		if (params.origin === 'orcish'){
			params.last = false;
			params.gender = false;
			params.prefix = false;
		}
		if (params.origin === 'netrunner'){
			params.gender = false;
		}
		if (params.origin === 'elven'){
			params.prefix = false;
		}

		var key = 'name/' + params.origin + '/';
		var out=[];

		if (params.prefix){
			if (params.gender){
				out.push(randopeep.get('name/prefix/'+params.gender));
			}else{
				out.push(randopeep.get('name/prefix/'+randopeep.randomEl(['male','female'])));
			}
		}
		
		if (!params.justLast){
			if (params.gender){
				out.push(randopeep.get(key + params.gender + '/first'));
			}else{
				out.push(randopeep.get(key + 'first'));
			}
		}

		if (params.last && params.origin !== 'netrunner'){
			if (params.origin !== 'dark/elven'){
				out.push(randopeep.get(key + 'last'));
			}else{
				out.push(randopeep.get('name/elven/last'));
			}
		}

		if (params.last && params.origin === 'netrunner'){
			out.push(randopeep.get(key + 'first'));
		}

		params.name = out.join(' ');

		return (params.returnData) ? params : params.name;

	};
};
},{}],10:[function(require,module,exports){
'use strict';

module.exports = function(randopeep){
    // synchronous AJAX for loading data files in light-mode
    /* global ActiveXObject */
    function getFile(url) {
        if (typeof(window) === 'undefined'){ return require(url); }
        var AJAX = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        if (AJAX) {
            AJAX.open('GET', url, false);
            AJAX.send(null);
            return JSON.parse(AJAX.responseText);
        } else {
            return false;
        }
    }


    randopeep.int = function(max){
        max = max || 10;
        return Math.floor(Math.random() * max);
    };

    randopeep.randomEl =  function (array) {
        return array[randopeep.int(array.length)];
    };


    /**
     * Get an element of a built-in dictionary of words
     * @param String [multiple]  all the dictionary names you want to load, in order
     * @return String            random array items, joined by " "
     */
    randopeep.get = function(){
        var out = [];
        for (var a in arguments){
            if (typeof(randopeep.data[arguments[a]]) === 'undefined'){
                // sync AJAX or dynamic require
                randopeep.data[arguments[a]] = getFile(randopeep.dataLocation + arguments[a]+'.json');
            }
            out.push(randopeep.randomEl(randopeep.data[arguments[a]]));
        }
        return out.join(' ');
    };

    randopeep.getCount = function(n, list){
        var out = [];
        n = n || 1;
        
        for (var a=0;a<n;a++){
            out.push(randopeep.get(list));
        }
        return out;
    };

    /**
     * Utility to turn "ssssSomeText" into "Sssssometext"
     * @param  String  str input
     * @return String      title-cased text
     */
    randopeep.titleCase = function(str){
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };

    // parses string for a symbol and replace it with a random number from 1-10
    randopeep.replaceSymbolWithNumber = function (string, symbol) {
        symbol = symbol || '#';
        var str = '';
        for (var i = 0; i < string.length; i++) {
            if (string[i] === symbol) {
                str += randopeep.int(10);
            } else {
                str += string[i];
            }
        }
        return str;
    };

    randopeep.format = function(){
        var args = Array.prototype.slice.apply(arguments);
        return args.shift().replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };

};
},{}]},{},[1])
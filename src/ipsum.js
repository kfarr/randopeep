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
		for (var i=0;i<len;i++){
			var word = randopeep.get(list);

			// dynamically make random sentences
			if (i===0 || i % sentenceLengths[i%sentenceLengths.length] === 0){
				word = randopeep.titleCase(word);
				if (i!==0){
					out[i-1] += '.';
				}
			}

			out.push(word);
		}
		return out.join(' ') + '.';
	};

	// alias
	randopeep.lorem = ipsum;
	return ipsum;
};
// A Trie created using JavaScript objects
const Trie = function(matchFn) {
	this.trie = {};
	this.words = [];

	if (matchFn) this.matchFn = matchFn;
};

// Insert word into trie
Trie.prototype.insert = function(word) {
	let current = this.trie;
	let letters = word.split('');
	for (let i = 0; i < letters.length; i++) {
		if (!current[letters[i]]) current[letters[i]] = {};
		current = current[letters[i]];
	}
	current.end = true;
	this.words.push(word);
};

Trie.prototype.match = function(word) {
	let closest = this.getClosest(word);
	return this.matchFn(word, closest);
};

Trie.prototype.getClosestMatch = function(word) {
	let closest = this.getClosest(word);
	return this.matchFn(word, closest) ? closest : false;
};

// Return the word in the trie that is closest to the given work
// In this case, by closest, we mean the largest word in the trie
// that is contained within the given word
Trie.prototype.getClosest = function(word) {
	let current = this.trie;
	let letters = word.split('');

	let largestEndingIndex = -1;
	for (let i = 0; i < letters.length; i++) {
		if (!current[letters[i]]) break;
		if (current[letters[i]].end) largestEndingIndex = i;
		current = current[letters[i]];
	}

	return largestEndingIndex != -1 ? word.substr(0, largestEndingIndex + 1) : '';
};

// User settable function that takes the word, and the closest word in the trie
// and returns whether they are a match
Trie.prototype.matchFn = function(word, closest) {
	return word == closest;
};

module.exports = Trie;
// A Trie created using JavaScript objects
const Trie = function() {
	this.trie = {};
	this.words = [];
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

// Checks if the given word has an exact match with a word in the trie
Trie.prototype.exists = function(word) {
	let current = this.trie;
	let letters = word.split('');
	for (let i = 0; i < letters.length; i++) {
		if (!current[letters[i]]) return false;
		current = current[letters[i]];
	}
	return current.end;
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

module.exports = Trie;
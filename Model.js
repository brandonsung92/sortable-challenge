const fs = require('fs');
const readline = require('readline');

const Trie = require('./Trie.js');

const Model = function(productsFilename, listingsFilename, resultsFilename) {
	this.productsFilename = productsFilename;
	this.listingsFilename = listingsFilename;
	this.resultsFilename = resultsFilename;

	this.dataObject = {};
	this.unmatchedListingsByType = {
		model: [],
		family: [],
		manufacturer: []
	};
};

Model.prototype.nullFamilyKey = '_noFamily';
Model.prototype.writeResults = function() {
	let results = [];
	for (let manufacturer in this.dataObject) {
		for (let model in this.dataObject[manufacturer]) {
			if (model == '_trie') continue;
			for (let family in this.dataObject[manufacturer][model]) {
				if (family == '_trie') continue;
				results.push(this.dataObject[manufacturer][model][family]);
			}
		}
	}

	// clear file first
	fs.writeFile(this.resultsFilename, '');
	for (let i = 0; i < results.length; i++) {
		let str = JSON.stringify(results[i]);
		if (i != results.length - 1) str += '\n';
		fs.appendFile(this.resultsFilename, str);
	}
}

// Checks two strings to see if they are 'close' enough to evaluate as matching models
Model.prototype.isModelMatch = function(str1, str2) {
	let largestStrSize = str1.length > str2.length ? str1.length : str2.length;
	let diff = str1.length > str2.length ? str1.substr(str2.length) : str2.substr(str1.length);

	// we consider it a match if the difference is small compared to the full string, and
	// when there are no numbers in the difference
	let match = (diff.length / largestStrSize < 0.4) && (diff.search(/[0-9]/g) == -1)
	return match;
};
Model.prototype.normalizeFamily = function (familyString) {
	return familyString.toLowerCase();
};
Model.prototype.normalizeModel = function (modelString) {
	return modelString.toLowerCase().replace(/[^0-9a-z]/g, '');
};
Model.prototype.normalizeManufacturer = function (manufacturerString) {
	return manufacturerString.toLowerCase();
};
Model.prototype.readProducts = function(onDone) {
	let linereader = readline.createInterface({
		input: fs.createReadStream(this.productsFilename)
	});

	linereader.on('line', function(line) {
		let product = JSON.parse(line);
		let manufacturerKey = this.normalizeManufacturer(product.manufacturer);
		let modelKey = this.normalizeModel(product.model);
		let familyKey = product.family ? this.normalizeFamily(product.family) : this.nullFamilyKey;

		if (!this.dataObject[manufacturerKey])
			this.dataObject[manufacturerKey] = {
				_trie: new Trie()
			};

		if (!this.dataObject[manufacturerKey][modelKey]) {
			this.dataObject[manufacturerKey]._trie.insert(modelKey);
			this.dataObject[manufacturerKey][modelKey] = {
				_trie: new Trie()
			};
		}

		if (!this.dataObject[manufacturerKey][modelKey][familyKey]) {
			this.dataObject[manufacturerKey][modelKey]._trie.insert(familyKey);
			this.dataObject[manufacturerKey][modelKey][familyKey] = {
				product_name: product.product_name,
				listings: []
			};
		} else {
			// duplicate product entries
		}
	}.bind(this));

	if (onDone) linereader.on('close', onDone);
};
Model.prototype.readListings = function(onDone) {
	let linereader = readline.createInterface({
		input: fs.createReadStream(this.listingsFilename)
	});

	linereader.on('line', function(line) {
		let listing = JSON.parse(line);
		this.insertListing(listing);
	}.bind(this));

	if (onDone) linereader.on('close', onDone);
};
Model.prototype.matchManufacturerKey = function(listingManufacturer, titleWords) {
	let normalizedManufacturer = this.normalizeManufacturer(listingManufacturer);
	if (this.dataObject[normalizedManufacturer]) return normalizedManufacturer;
	else {
		// if the first word is name of a manufacturer, assume that is the manufacturer
		let normalizedFirstWord = this.normalizeManufacturer(titleWords[0]);

		if (this.dataObject[normalizedFirstWord]) return normalizedFirstWord;
	}

	return '';
};
Model.prototype.matchModelKey = function(manufacturerRef, titleWords) {
	for (let i = 0; i < titleWords.length; i++) {
		let normalizedWord = this.normalizeModel(titleWords[i]);
		let closest = manufacturerRef._trie.getClosest(normalizedWord);
		if (this.isModelMatch(normalizedWord, closest)) return closest;
		else if (i != titleWords.length - 1) {
			// to handle cases where there is a space between parts of a model name in the title
			// we concatenate consecutive words
			let normalizedConcatenated = this.normalizeModel(titleWords[i] + titleWords[i + 1]);
			let closest = manufacturerRef._trie.getClosest(normalizedConcatenated);
			if (this.isModelMatch(normalizedConcatenated, closest)) return closest;
		}
	}

	return '';
};
Model.prototype.matchFamilyKey = function(modelRef, titleWords) {
	for (let i = 0; i < titleWords.length; i++) {
		let normalizedWord = this.normalizeFamily(titleWords[i]);
		if (modelRef._trie.exists(normalizedWord)) {
			return normalizedWord;
		}
	}

	return this.nullFamilyKey;
};
Model.prototype.insertListing = function(listing) {
	let titleWords = listing.title.split(' ');

	let manufacturerKey = this.matchManufacturerKey(listing.manufacturer, titleWords);

	if (!manufacturerKey) {
		this.unmatchedListingsByType.manufacturer.push(listing);
		return;
	}

	let modelKey = this.matchModelKey(this.dataObject[manufacturerKey], titleWords);

	if (!modelKey) {
		this.unmatchedListingsByType.model.push(listing);
		return;
	}

	let modelRef = this.dataObject[manufacturerKey][modelKey];
	let familyKey = this.matchFamilyKey(modelRef, titleWords);

	let listingsRef;
	if (modelRef._trie.words.length == 1) {
		// if there is only one product with the matched combination of manufacturer and model,
		// assume these are a match without checking family
		listingsRef = modelRef[modelRef._trie.words[0]].listings;
	} else if (modelRef[familyKey]) listingsRef = modelRef[familyKey].listings;

	if (listingsRef) listingsRef.push(listing);
	else this.unmatchedListingsByType.family.push(listing);
};

module.exports = Model;
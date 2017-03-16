const Model = require('./Model.js');

(function() {
	let time = process.hrtime();
	let model = new Model('./data/products.txt', './data/listings.txt', './results.txt');

	model.readProducts(function() {
		model.readListings(function() {
			model.writeResults();
			let runtime = process.hrtime(time);
			console.log('runtime: ' + runtime[0] + 's ' + runtime[1] + 'ns');
			console.log('matches: ' + model.matchedCount);
			console.log('listings: ' + model.listingCount);
			console.log('match rate: ' + Math.floor(100 * (model.matchedCount / model.listingCount)) + '%');
		});
	});
})();
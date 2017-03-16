# Sortable Coding Challenge

This is an entry for the [sortable coding challenge](https://sortable.com/challenge/).

To run, node must be installed (version I used was v6.9.5), in correct directory type:
`node index.js`.

## Strategy
### Products
The strategy I used here was to create a tree-like structure from the products where the root node's children are the manufacturer nodes, the manufacturer nodes' children are the models, and the model nodes' children are the family nodes.

### Manufacturer Matching
Manufacturer matching requires an exact match (case-sensitive).

### Model Matching
Model matching is less strict, allowing for extra letters after a model ID that may indicate color, or consecutive words in a listing title to form a model ID to account for some listings having whitespace in between parts of the model ID.

### Family Matching
Family matching requires an exact match, but if there is only one family with the combination of matched manufacturer and ID, we ignore the family, and proceed as if matched.

### Tries
Tries are used to allow faster matching, and to determine 'close' matches, which are used when attempting to match model IDs.

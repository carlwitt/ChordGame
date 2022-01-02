/**
 * Local storage to persist preferences and statistics.
 */
var storage;
var state;

function loadState(defaultState){
	state = JSON.parse(storage.chordGameState);
	const expectedFields = Object.getOwnPropertyNames(defaultState);
	for (var i = expectedFields.length - 1; i >= 0; i--) {
		if(! state.hasOwnProperty(expectedFields[i])){
			state[expectedFields[i]] = defaultState[expectedFields[i]];
		}
	}
}

/**
 * Writes the given data to local storage.
 * @param {obj} state 
 */
function persist(state){
	storage.chordGameState = JSON.stringify(state);
}

// replace local storage by a simple object in case it is not available
// options won't be persisted, but we don't get exceptions
try {
	localStorage.setItem('test', 'test');
	localStorage.removeItem('test');
	storage = localStorage;
} catch (e) {
	storage = {};
	console.log("No local storage available.")
}

var storage;
var state;

function loadState(){
	state = JSON.parse(storage.chordGameState);
	const expectedFields = Object.getOwnPropertyNames(defaultState);
	for (var i = expectedFields.length - 1; i >= 0; i--) {
		if(! state.hasOwnProperty(expectedFields[i])){
			state[expectedFields[i]] = defaultState[expectedFields[i]];
		}
	}
}

function persistState(){
	storage.chordGameState = JSON.stringify(state);
	refreshStats();
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
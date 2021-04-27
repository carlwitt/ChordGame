/**
 * Code related to recognizing chords displayed on the keyboard.
 * A random chord is generated with the music theory logic and the properties (key, mode, inversion) are saved to the state variables.
 * On clicking one of the chords in the scrollers, the selected chord's properties are compared to the state and the solution is marked as wrong or correct accordingly.
 */

/* ------------------------------------------------------------------------
 * Persistent State
 * ------------------------------------------------------------------------ */

var storage;
var state;

var defaultState = {
	// the range of the circle of fifths that is covered. This will generate triads from keys C ± maxAccidentals, 
	// e.g., 1 => F, C, and G 
	'maxAccidentals': 5,
	'language': 'german',
	// allowed chord inversions to generate randomly
	'allowedInversions': [0, 1, 2],
	'correctAnswers': 0,
	'wrongAnswers': 0
};

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

// load previous state if available from local storage
if(storage.chordGameState){
	loadState();
} else{ 
	state = defaultState;
}

/* ------------------------------------------------------------------------
 * State
 * ------------------------------------------------------------------------ */

var solution = {
	// the offset of the currently displayed key, where 0 corresponds to 6 flats
	'key': 6,
	// the mode of the current chord, e.g., modes[0] = 'major'
	'mode': modes[0],
	// the current random triad inversion, e.g., 0 for base position, 1 for first inversion
	'inversion': 0,
	// the notes of the currently random chord, e.g, ['Ab', 'C', 'Eb'] for Ab major
	'chord': []
}

// the key the user has currently selected (is compared to currentKey in solveAttempt)
var solveAttempt = {
	'key': null,
	'mode': null,
	'inversion': null		
}

/* ------------------------------------------------------------------------
 * Logic
 * ------------------------------------------------------------------------ */

function solveIfComplete(){
	// if a part of the solution is null, don't solve yet
	for(part in solveAttempt) if(solveAttempt[part] == null) return;
	
	if(solveAttempt.key == solution.key &&
	   solveAttempt.mode == solution.mode &&
	   solveAttempt.inversion == solution.inversion){
  		correctAnswerGiven();
		highlightSolution();
	} else {
		wrongAnswerGiven();
		// TODO show hint?
	}
	resetAnswer();
	return true;
}

function resetAnswer(){
	solveAttempt.key = null;
	solveAttempt.mode = null;
	solveAttempt.inversion = null;
	
	// unselect all key options
	document.querySelectorAll("#solution-options td").forEach(function(element, i){element.classList.remove("selected")});	
	// unselect all inversion options
	document.querySelectorAll("#solution-options-inversion td").forEach(function(element, i){element.classList.remove("selected")});
}

function nextChord(){
	random = randomTriad(state.maxAccidentals, state.allowedInversions); 
	solution.key = random['key'];
	solution.inversion = random['inversion'];
	solution.mode = random['mode'];
	solution.chord = random['chord'];
	highlightKeys();
}

function proposeKeyAndMode(mouseEvent){
	solveAttempt.key = mouseEvent.srcElement.key;
	solveAttempt.mode = mouseEvent.srcElement.mode;
	
	// unselect all key options
	document.querySelectorAll("#solution-options td").forEach(function(element, i){element.classList.remove("selected")});	
	mouseEvent.srcElement.classList.add('selected');
	
	solveIfComplete();
}

function proposeInversion(mouseEvent){
	solveAttempt.inversion = mouseEvent.srcElement.inversion;
	
	// unselect all inversion options
	document.querySelectorAll("#solution-options-inversion td").forEach(function(element, i){element.classList.remove("selected")});
	mouseEvent.srcElement.classList.add('selected');
	
	solveIfComplete();
}

function removeAttemptSelection(what){
	
	
}



function getStats(){
	return {
		'correct': state.correctAnswers,
		'wrong': state.wrongAnswers
	}	
}

function correctAnswerGiven(){
	state.correctAnswers++;
	persistState();
}

function wrongAnswerGiven(){
	state.wrongAnswers++;
	persistState();
}

function resetStats(){
	state.correctAnswers = 0;
	state.wrongAnswers = 0;
	persistState();
}

/* ------------------------------------------------------------------------
 * View
 * ------------------------------------------------------------------------ */

// takes an array of note names (e.g., ['E, G, C']) and highlights the according keys on the piano
function highlightKeys(){
	
	var chord = inversion(solution.inversion, solution.chord);

	// the chord's note to highlight, e.g., first, second third, maybe fourth
	var toHighlight = 0;
	for (var i = 0; i < keyElements.length; i++) {
		// reset previous highlighting
		keyElements[i].classList.remove('highlight', 'triad__prime', 'triad__third', 'triad__fifth');
		// apply new highlighting
		if(keyElements[i].classList.contains(chord[toHighlight])){
			keyElements[i].classList.add('highlight');
			toHighlight++;
		}
	}

}

// colors the highlighted keys according to their function: prime, third, or fifth
function highlightSolution(){
	
	// use this classes to show which key belongs to which note
	var highlightClasses = inversion(solution.inversion, ['triad__prime', 'triad__third', 'triad__fifth']);
	var chord = inversion(solution.inversion, solution.chord);

	// the chord's note to highlight, e.g., first, second third, maybe fourth
	var toHighlight = 0;
	for (var i = 0; i < keyElements.length; i++) {
		// reset previous highlighting
		keyElements[i].classList.remove('highlight', 'triad__prime', 'triad__third', 'triad__fifth');
		// apply new highlighting
		if(keyElements[i].classList.contains(chord[toHighlight])){
			keyElements[i].classList.add('highlight');
			keyElements[i].classList.add(highlightClasses[toHighlight]);
			toHighlight++;
		}
	}
}

// show the number of correct and wrong answers given so far
function refreshStats(){
	const stats = getStats();
	document.getElementById('correctAnswers').innerText = stats.correct;
	const totalAnswers = stats.correct + stats.wrong;
	document.getElementById('totalAnswers').innerText = totalAnswers;
	document.getElementById('percentageCorrectAnswers').innerText = totalAnswers == 0 ? 0 : Math.round(100 * stats.correct / totalAnswers);
}


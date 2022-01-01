/**
 * Code related to recognizing chords displayed on the keyboard.
 * A random chord is generated and its properties (key, mode, inversion) are saved to the state variables.
 * On clicking one of the chords, the solution is marked as wrong or correct accordingly.
 */

/* ------------------------------------------------------------------------
 * Persistent State
 * ------------------------------------------------------------------------ */

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

// avoid asking the same chord twice
var lastChord = null;

/* ------------------------------------------------------------------------
 * Logic
 * ------------------------------------------------------------------------ */

/**
 * Sets the hidden state to a new chord.
 */
function nextChord(){
	// generate random chords until a chord is generated that is not equal to the previously generated
	// but limit the attempts
	for (var i = 0; i < 25; i++) {
		random = randomTriad(state.maxAccidentals, state.allowedInversions); 
		if(lastChord !== JSON.stringify(random)) {
			lastChord = JSON.stringify(random);
			break;	
		}
	}
	
	solution.key = random['key'];
	solution.inversion = random['inversion'];
	solution.mode = random['mode'];
	solution.chord = random['chord'];

	highlightTask();
}

/* ------------------------------------------------------------------------
 * View
 * ------------------------------------------------------------------------ */


function proposeKeyAndMode(mouseEvent){
	solveAttempt.key = mouseEvent.srcElement.dataset.key;
	solveAttempt.mode = mouseEvent.srcElement.parentElement.dataset.mode;
	
	// unselect all key options
	document.querySelectorAll(".solution-option.key-and-mode td").forEach(function(element, i){element.classList.remove("selected")});	
	mouseEvent.srcElement.classList.add('selected');
	
	solveIfComplete();
}

function proposeInversion(mouseEvent){
	solveAttempt.inversion = mouseEvent.srcElement.dataset.inversion;
	
	// unselect all inversion options
	document.querySelectorAll(".solution-option.inversion td").forEach(function(element, i){element.classList.remove("selected")});
	mouseEvent.srcElement.classList.add('selected');
	
	solveIfComplete();
}

/**
 * If all parts of an answer (key, mode, inversion) are present, checks them. Otherwise doese nothing.
 * If the check succeeds, highlights the solution. 
 * @returns true, iff the chord was classified correctly
 */
function solveIfComplete(){
	// if a part of the solution is null, don't solve yet
	for(part in solveAttempt) if(solveAttempt[part] == null) return;
	
	var keysMatch = 
		solveAttempt.key == solution.key ||
		// from the keys on the keyboard, Gb is indistinguishable from F#
		solveAttempt.key == 12 && solution.key == 0 ||
		solveAttempt.key == 0 && solution.key == 12;

	var modesInversionsMatch =
		solveAttempt.mode == solution.mode &&
		solveAttempt.inversion == solution.inversion;

	if(keysMatch && modesInversionsMatch){
  		correctAnswerGiven();
		highlightSolution();
	} else {
		wrongAnswerGiven();
		// TODO show hint?
	}
	resetAnswer();
	return true;
}

/**
 * Unselect the selected key and inversion (after correct and wrong solution)
 */
function resetAnswer(){
	solveAttempt.key = null;
	solveAttempt.mode = null;
	solveAttempt.inversion = null;
	
	document.querySelectorAll(".solution-option td").forEach((e, i) => e.classList.remove("selected"));	
}

/**
 * Highlights the keys on the keyboard that correspond to the current chord to classify.
 */
function highlightTask(){
	const noteNames = inversion(solution.inversion, solution.chord);
	const keyIndices = noteNamesToKeyIndices(noteNames);
	highlightKeys(['highlight'], keyIndices);
}

/**
 * Colors the keys on the keyboard according to their function: prime, third, or fifth.
 */
function highlightSolution(){
	const noteNames = inversion(solution.inversion, solution.chord);
	const keyIndices = noteNamesToKeyIndices(noteNames);
	const  highlightClasses = inversion(solution.inversion, ['triad__prime', 'triad__third', 'triad__fifth']);
	highlightKeys(highlightClasses, keyIndices);
}

/**
 * Iterates through the keyboard keys lowest to highest. 
 * For each key that matches a key index, applies the next of given css classes instead.
 * Removes all highlight classes from all keys.
 * 
 * @param {[string]} cssClasses 
 * @param {[int]} keyIndices 
 */
function highlightKeys(cssClasses, keyIndices){
	// the chord's note to highlight
	var toHighlight = 0;
	for (const keyElement of keyElements) {
		// reset previous highlighting
		keyElement.classList.remove('highlight', 'triad__prime', 'triad__third', 'triad__fifth');
		// apply new highlighting
		if(keyElement.dataset.keyindex == keyIndices[toHighlight]){
			keyElement.classList.add(cssClasses[toHighlight % cssClasses.length]);
			toHighlight++;
		}
	}
}

/*
* Sow the number of correct and wrong answers given so far.
*/
function refreshStats(){
	const stats = getStats();
	document.getElementById('correctAnswers').innerText = stats.correct;
	const totalAnswers = stats.correct + stats.wrong;
	document.getElementById('totalAnswers').innerText = totalAnswers;
	document.getElementById('percentageCorrectAnswers').innerText = totalAnswers == 0 ? 0 : Math.round(100 * stats.correct / totalAnswers);
}


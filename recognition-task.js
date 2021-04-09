/**
 * Code related to recognizing chords displayed on the keyboard.
 * A random chord is generated with the music theory logic and the properties (key, mode, inversion) are saved to the state variables.
 * On clicking one of the chords in the scrollers, the selected chord's properties are compared to the state and the solution is marked as wrong or correct accordingly.
 */

/* ------------------------------------------------------------------------
 * State
 * ------------------------------------------------------------------------ */

// the offset of the current key in the circle of fifths, where 0 corresponds to 6 flats
var currentKey = 6;

// the mode of the current chord, e.g., modes[0] = 'major'
var currentMode = modes[0];

// the current random triad inversion, e.g., 0 for base position, 1 for first inversion
var currentInversion = 0;

// the notes of the currently random chord, e.g, ['Ab', 'C', 'Eb'] for Ab major
var currentChord = [];

// the range of the circle of fifths that is covered. This will generate triads from keys C ± maxAccidentals, 
// e.g., 1 => F, C, and G 
var maxAccidentals = 6;

// the scroller that the user is currently interacting with
var draggedScroller = undefined;

/* ------------------------------------------------------------------------
 * Logic
 * ------------------------------------------------------------------------ */

function nextChord(){
	random = randomTriad(maxAccidentals); 
	currentKey = random['key'];
	currentInversion = random['inversion'];
	currentMode = random['mode'];
	currentChord = random['chord'];
	highlightKeys();
	document.querySelectorAll('.scroller').forEach(resetScroller);
}

function solveAttempt(mouseEvent){
	var answer = mouseEvent.srcElement;
	if(answer.key == currentKey && answer.mode == currentMode && answer.inversion == currentInversion){
		correctAnswerGiven();
		answer.classList.add('correct');
		highlightSolution();
	} else {
		wrongAnswerGiven();
		answer.classList.add('wrong');
	}
}

function getStats(){
	return {
		'correct': localStorage.correctAnswers ? Number(localStorage.correctAnswers) : 0,
		'wrong': localStorage.wrongAnswers ? Number(localStorage.wrongAnswers) : 0
	}	
}

function correctAnswerGiven(){
	localStorage.correctAnswers = getStats().correct + 1;
	refreshStats();
}

function wrongAnswerGiven(){
	localStorage.wrongAnswers = getStats().wrong + 1;
	refreshStats();
}

function resetStats(){
	localStorage.removeItem('correctAnswers');
	localStorage.removeItem('wrongAnswers');
	refreshStats();
}

/* ------------------------------------------------------------------------
 * View
 * ------------------------------------------------------------------------ */

// takes an array of note names (e.g., ['E, G, C']) and highlights the according keys on the piano
function highlightKeys(){
	
	var chord = inversion(currentInversion, currentChord);

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
	var highlightClasses = inversion(currentInversion, ['triad__prime', 'triad__third', 'triad__fifth']);
	var chord = inversion(currentInversion, currentChord);

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

// cycle contents of a scroller by a given number of elements
function incrementScroller(scroller, increment){
	
	const currentPosition = scroller.selectedElement ? scroller.selectedElement : 0;
	const numElements = scroller.childElementCount;
	const newPosition = (currentPosition + increment + numElements) % numElements
	
	scroller.selectedElement = newPosition;
	
	// console.log('new scroll', scroller.children[newPosition].offsetTop - 9); //(scroller.scrollHeight + scroller.scrollTop + increment * scroller.scrollHeight / 3) % scroller.scrollHeight);
	scroller.scrollTop = scroller.children[newPosition].offsetTop - scroller.children[0].offsetTop; // + scroller.scrollTop + increment * scroller.scrollHeight / 3) % scroller.scrollHeight;
}

function resetScroller(scroller){
	scroller.querySelectorAll('a').forEach(a => a.classList.remove('wrong', 'correct'));
	scroller.selectedElement = 0;
	incrementScroller(scroller, 1);
}

// interactivity for scroller elements: when moving the mouse upwards with primary mouse button down (a drag gesture), cycle the scroller content up and vice versa.
function dragOut(mouseEvent){

	var element = mouseEvent.srcElement;

	// on drag, i.e. primary mouse button is down
	if(mouseEvent.buttons == 1 || mouseEvent.type.toLowerCase() === 'touchmove'){

		// ignore events triggered during an interaction with another scroller
		if(draggedScroller != undefined && element != draggedScroller) return;
		
		// mark this scroller as currently interacted with (released on mouseup anywhere)
		draggedScroller = element;

		// increment or decrement 
		var increment = mouseEvent.offsetY < 0 ? -1 : +1;
		incrementScroller(element, increment);		
	}
}

document.onmouseup = function(){
	draggedScroller = undefined;
}

// show the number of correct and wrong answers given so far
function refreshStats(){
	const stats = getStats();
	document.getElementById('correctAnswers').innerText = stats.correct;
	const totalAnswers = stats.correct + stats.wrong;
	document.getElementById('totalAnswers').innerText = totalAnswers;
	document.getElementById('percentageCorrectAnswers').innerText = totalAnswers == 0 ? 0 : Math.round(100 * stats.correct / totalAnswers);
}

// wire options control elements to state variables
document.getElementById('input_language').onchange = function(){
	naming = NAMING[this.value]
	highlightKeys();
};

document.getElementById('input_maxAccidentals').onchange = function(){
	maxAccidentals = this.value;
	document.getElementById('label_maxAccidentals').innerText = maxAccidentals;
};
document.getElementById('input_maxAccidentals').onchange();

function scroller(entries){
	const div = document.createElement('div');
	div.classList.add("scroller");
	entries.forEach(entry => div.appendChild(entry)); //div.appendChild(document.createElement('br'));});
	div.onmouseleave = dragOut;
	div.ontouchmove = dragOut;
	return div;
}

function chordLink(key, mode, inversion){
	const link = document.createElement('a');
	const keyName = naming.baseNote(applyAccidental(key, keys[mode].baseNote[key]), mode);
	link.innerText = inversion == 0 ? keyName : inversion;
	link.key = key;
	link.mode = mode;
	link.inversion = inversion;
	link.onclick = solveAttempt;
	return link;
}

// list all major/minor chords as solution options in order of the circle of fifths
for(const mode of modes){
	const options = document.querySelectorAll(`.solution.option.${mode} td`);
	options.forEach(function(element, i){
		// fill the table cell with the chord's base note name 
		element.appendChild(scroller([chordLink(i, mode, 1), chordLink(i, mode, 0), chordLink(i, mode, 2)]));	

		// var inversions = [, document.createElement('a'), document.createElement('a')];
		// inversions.forEach(function(link, inv){

		// 	element.appendChild(link);
		// });
		//element.innerHTML = `<a href="#">${keyName}</a> <a href="#">1</a> <a href="#">2</a>`;//keyName; //`<a>${keyName}</a>`; //<span class="inv top">1</span><span class="inv bottom">2</span>
		// element.key = i;
		// element.mode = mode;
		// element.inversion = 0;
		// element.onclick = solveAttempt;
	})
}
		
// add classes the piano keys that state their note name(s)
// get the SVG elements that represent the piano keys
var keyElements = Array.from(document.getElementsByClassName('key'));
// sort the keys by horizontal position, such that we get C, C#, D, D#, etc.
keyElements.sort((r1,r2)=>r1.attributes.x.value - r2.attributes.x.value)

// add css classes to black keys that use SHARP_SYMBOL and FLAT_SYMBOL
Array.from(document.getElementsByClassName('black key')).forEach(rect => {
	baseNote = rect.attributes.note.value;
	sharp = baseNote + SHARP_SYMBOL;
	flat = enharmonicEquivalent(sharp);
	rect.classList.add(sharp, flat);
});

// generate first chord
nextChord();
refreshStats();

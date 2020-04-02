// Thanks https://codepen.io/brianmearns
const editor = document.getElementById('editor');
const selectionOutput = document.getElementById('selection');

function getTextSegments(element) {
	const textSegments = [];
	Array.from(element.childNodes).forEach((node) => {
		switch (node.nodeType) {
			case Node.TEXT_NODE:
				textSegments.push({ text: node.nodeValue, node });
				break;

			case Node.ELEMENT_NODE:
				textSegments.splice(textSegments.length, 0, ...(getTextSegments(node)));
				break;

			default:
				throw new Error(`Unexpected node type: ${node.nodeType}`);
		}
	});
	return textSegments;
}

editor.addEventListener('input', updateEditor);

function updateEditor() {
	const sel = window.getSelection();
	const textSegments = getTextSegments(editor);
	const textContent = textSegments.map(({ text }) => text).join('');
	let anchorIndex = null;
	let focusIndex = null;
	let currentIndex = 0;
	textSegments.forEach(({ text, node }) => {
		if (node === sel.anchorNode) {
			anchorIndex = currentIndex + sel.anchorOffset;
		}
		if (node === sel.focusNode) {
			focusIndex = currentIndex + sel.focusOffset;
		}
		currentIndex += text.length;
	});

	editor.innerHTML = renderText(textContent);

	restoreSelection(anchorIndex, focusIndex);
}

function restoreSelection(absoluteAnchorIndex, absoluteFocusIndex) {
	const sel = window.getSelection();
	const textSegments = getTextSegments(editor);
	let anchorNode = editor;
	let anchorIndex = 0;
	let focusNode = editor;
	let focusIndex = 0;
	let currentIndex = 0;
	textSegments.forEach(({ text, node }) => {
		const startIndexOfNode = currentIndex;
		const endIndexOfNode = startIndexOfNode + text.length;
		if (startIndexOfNode <= absoluteAnchorIndex && absoluteAnchorIndex <= endIndexOfNode) {
			anchorNode = node;
			anchorIndex = absoluteAnchorIndex - startIndexOfNode;
		}
		if (startIndexOfNode <= absoluteFocusIndex && absoluteFocusIndex <= endIndexOfNode) {
			focusNode = node;
			focusIndex = absoluteFocusIndex - startIndexOfNode;
		}
		currentIndex += text.length;
	});

	sel.setBaseAndExtent(anchorNode, anchorIndex, focusNode, focusIndex);
}

function renderText(text) {
	const words = text.split(/(?!\[.*)(\s+)(?![^\[]*?\])/g);
	console.log(words);
	const output = words.map((word) => {
		if(word.startsWith("[") && word.endsWith("]")){
			const trimmedWord = word.substr(1, word.length-2);
			const wordParts = trimmedWord.split(",").map(item => item.trim());
			const finalString = `<span class="hl hl-${wordParts[0]}">${word}</span>`;
			return finalString;
		}else{
			return word;
		}
	});
	if(output[output.length - 2] == " ") output[output.length - 2] = "&nbsp;";
	console.log([output.join("")]);
	return output.join("");
}

updateEditor();
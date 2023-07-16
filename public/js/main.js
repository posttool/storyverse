function $(id) {
    return document.getElementById(id);
}
function $$(o) {
    if (o == null)
        o = {};
    if (o.el == null)
        o.el = 'div';
    var $t = document.createElement(o.el);
    if (o.text)
        $t.appendChild(document.createTextNode(o.text));
    if (o.color)
        $t.style.color = o.color;
    if (o.backgroundColor)
        $t.style.backgroundColor = o.backgroundColor;
    if (o.class)
        $t.setAttribute('class', o.class);
    if (o.id)
        $t.setAttribute('id', o.id);
    if (o.type)
        $t.setAttribute('type', o.type);
    if (o.value)
        $t.setAttribute('value', o.value);
    if (o.click)
        $t.addEventListener('click', o.click);
    if (o.parent)
        o.parent.appendChild($t);
    return $t;
}


function format(str, color, parent) {
    return $$({ el: 'span', text: str, parent: parent, color: color });
}


var characters = [];
var settings = [];

var dropped = false;
function handleDragStart(e) {
    this.style.opacity = '0.4';
    e.dataTransfer.setData("color", this.style.backgroundColor);
    e.dataTransfer.setData("idx", this.id.substring(2));
}

function handleDragEnd(e) {
    if (!dropped)
        this.style.opacity = '1'; // if you drop it in a wierd place
    dropped = false;
}

function allowDrop(e) {
    e.preventDefault();
    return false;
}

function drop(e) {
    e.preventDefault();
    var color = e.dataTransfer.getData("color");
    e.target.style.backgroundColor = color;
    e.target.style.border = '0'
    $("button-done").style.visibility = 'visible';
    dropped = true;
    var idx = Number(e.dataTransfer.getData("idx"));
    if (e.target.className == 'place') {
        characters.push(idx);
    } else {
        settings.push(idx);
    }
    return false;
}

var $stuff = $('stuff-body');
for (var i = 0; i < SB.length; i++) {
    var $si = $$({
        text: SB[i].type + ' ' + SB[i].name,
        parent: $stuff, class: 'stuff-item', id: 'si' + i
    });
    $si.draggable = "true";
    $si.addEventListener('dragstart', handleDragStart);
    $si.addEventListener('dragend', handleDragEnd);
    $si.style.backgroundColor = SB[i].color;
}

function change_framework(e) {
    var selectedText = e.options[e.selectedIndex].text;
    $instruction.innerText = selectedText + ' 🎭';
    if (populatef)
        populatef();
}



// state 2 // timeline
var $stage = $('stage-body');
var $button_done = $("button-done");
var $framework = $("framework");
var $instruction = $("instruction");
var populatef = null;
function showTimeline() {
    $instruction.innerText = 'Select framework and have fun'
    $button_done.style.visibility = 'hidden';
    $framework.style.visibility = 'visible';
    $stage.classList.remove('bigpad');
    $stage.style.display = 'block';
    $stage.innerHTML = '';
   
    var editor = new Storyline($stage);

    populatef = () => {
        while (characters.length < 2) {
            characters.push(Math.round(Math.random() * SB.length));
        }
        while (settings.length < 1) {
            settings.push(Math.round(Math.random() * SB.length));
        }
        // insert these characters into the "template"
        var s0 = settings[0], c1 = characters[1], c2 = characters[0];
        editor.sections[0].value.index = s0;
        editor.sections[0].targets[0].value.index = c1;
        editor.sections[1].value.index = s0;
        editor.sections[1].targets[0].value.index = c2;
        editor.sections[1].targets[1].value.index = c1;
        editor.sections[2].value.index = s0;
        editor.sections[2].targets[0].value.index = c1;
        editor.redraw();
        
    }

}

characters = [0, 2];
settings = [4];
showTimeline();
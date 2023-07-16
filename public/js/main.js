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

var dropped = false;
var characters = [];
var settings = [];

function handleDragStart(e) {
    this.style.opacity = '0.4';
    e.dataTransfer.setData("color", this.style.backgroundColor);
    e.dataTransfer.setData("id", this.id);
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
    var idx = Number(e.dataTransfer.getData("id").substring(2));
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
var $instruction = $("instruction");
var populatef = null;
function showTimeline() {
    $instruction.innerText = 'Select framework and have fun'
    $button_done.style.visibility = 'hidden';
    $stage.classList.remove('bigpad');
    $stage.style.display = 'block';
    $stage.innerHTML = '';
    var $top = $$({ class: 'timeline-top', parent: $stage });
    $$({ text: 'Character(s):', parent: $top });
    for (var i = 0; i < characters.length; i++) {
        var $p = $$({ parent: $top, class: 'place-small' });
        $p.style.backgroundColor = SB[characters[i]].color;
    }
    $$({ text: 'Setting(s):', parent: $top }).style.paddingLeft = '15px';
    for (var i = 0; i < settings.length; i++) {
        var $p = $$({ parent: $top, class: 'placesq-small' });
        $p.style.backgroundColor = SB[settings[i]].color;
    }
    var $climax = $$({ class: 'timeline-climax', parent: $stage });
    var $mid = $$({ class: 'timeline-mid', parent: $stage });
    var $labels = $$({ class: 'timeline-labels', parent: $mid })
    var $major = $$({ class: 'major', parent: $labels, text: 'Main' })
    var $minor = $$({ class: 'minor', parent: $labels, text: 'Minor' })
    var $major = $$({ class: 'major-line', parent: $labels })
    var $minor = $$({ class: 'minor-line', parent: $labels })
    var $t1 = addTimelineSection($mid, 'Beginning', '');
    var $t2 = addTimelineSection($mid, 'Middle', '');
    var $t3 = addTimelineSection($mid, 'End', '');
    addDragger($t1.container, $t2.container);
    addDragger($t2.container, $t3.container);

    populatef = () => {
        //populate
        var c1 = 1, c2 = 0;
        var spanc1 = '<b style="color: ' + SB[characters[c1]].color + '">';
        var spanc2 = '<b style="color: ' + SB[characters[c2]].color + '">';
        var $c11 = $$({
            class: 'char', parent: $t1.major_container,
            backgroundColor: SB[characters[c1]].color
        });
        $t1.text_container.innerHTML = spanc1 +
            SB[characters[c1]].name + '</b> gets scared by the fireworks and runs away.';
        var $c21 = $$({
            class: 'char', parent: $t2.major_container,
            backgroundColor: SB[characters[c2]].color
        });
        var $c22 = $$({
            class: 'char', parent: $t2.minor_container,
            backgroundColor: SB[characters[c1]].color
        });
        $t2.text_container.innerHTML = spanc2 +
            SB[characters[c2]].name + '</b> finds ' + spanc1 +
            SB[characters[c1]].name + '</b> and brings them home.';

        var $c31 = $$({
            class: 'char', parent: $t3.major_container,
            backgroundColor: SB[characters[c1]].color
        });
        $t3.text_container.innerHTML = spanc1 +
         SB[characters[c1]].name + '</b> is traumatized by the experience.';
    }

}

function addTimelineSection(parent, name, description) {
    var $s = $$({ class: 'section', parent: parent });
    var $l = $$({ class: 'label', parent: $s, text: name });
    var $c1 = $$({ class: 'major-container', parent: $s });
    var $c10 = $$({ class: 'major', parent: $c1 });
    var $c11 = $$({ class: 'major1', parent: $c1 });
    var $c12 = $$({ class: 'major2', parent: $c1 });
    var $c2 = $$({ class: 'minor-container', parent: $s });
    var $c20 = $$({ class: 'major', parent: $c2 });
    var $c21 = $$({ class: 'major1', parent: $c2 });
    var $c22 = $$({ class: 'major2', parent: $c2 });
    var $l = $$({ class: 'description', parent: $s, text: description });
    return {
        container: $s, major_container: $c1,
        minor_container: $c2, text_container: $l
    };
}

function addDragger(left, right) {
    var clickx = 0, leftw = 0, rightw = 0;
    var $s = $$({ class: 'dragger' });
    left.after($s);
    function dragf(e) {
        var d = (e.screenX - clickx);
        if (leftw + d < 70 || leftw + d > 270) {
            return;
        }
        left.style.width = (leftw + d) + 'px'
        right.style.width = (rightw - d) + 'px'
    }
    $s.addEventListener('mousedown', (e) => {
        leftw = left.offsetWidth;
        rightw = right.offsetWidth;
        clickx = e.screenX;
        window.document.addEventListener('mousemove', dragf)
    })

    window.document.addEventListener('mouseup', (e) => {
        window.document.removeEventListener('mousemove', dragf);
    })
    return $s;
}

// characters = [0, 2];
// settings = [3];
// showTimeline();
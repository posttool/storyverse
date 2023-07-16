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
    e.dataTransfer.setData("idx", this.id);
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
    var idx = Number(e.dataTransfer.getData("idx").substring(2));
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
    // $$({ text: 'Character(s):', parent: $top });
    // for (var i = 0; i < characters.length; i++) {
    //     var $p = $$({ parent: $top, class: 'place-small' });
    //     $p.style.backgroundColor = SB[characters[i]].color;
    // }
    // $$({ text: 'Setting(s):', parent: $top }).style.paddingLeft = '15px';
    // for (var i = 0; i < settings.length; i++) {
    //     var $p = $$({ parent: $top, class: 'placesq-small' });
    //     $p.style.backgroundColor = SB[settings[i]].color;
    // }
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

    // for all targets in t1,2,3 - "listen" to change events
    for (var k in _all_targets) {
        _all_targets[k].change = (t) => {
            console.log(t.section)
            _redraw(t.section);
        }
    }

    // update text based on (new) values
    function _redraw(section) {
        if (!section) {
            _redraw($t1);
            _redraw($t2);
            _redraw($t3);
        } else {
            _regen_text(section);
        }
    }

    function _regen_text(section) {
        // TODO format a prompt & send to service for results
        // currently displays the prompt
        var c00 = section.targets[0].getValue().index;
        var c01 = section.targets[1].getValue().index;
        var $ft = $$({ el: 'span' });
        if (c00 == -1 && c01 == -1) {

        } else if (c00 == -1 && c01 != -1) {
            format('Minor ', null, $ft);
            format(SB[c01].name, SB[c01].color, $ft);
        } else if (c00 != -1 && c01 == -1) {
            format('Main ', null, $ft);
            format(SB[c00].name, SB[c00].color, $ft);
        } else {
            format('Main ', null, $ft);
            format(SB[c00].name, SB[c00].color, $ft);
            format(' and minor ', null, $ft);
            format(SB[c01].name, SB[c01].color, $ft);
        }
        section.text_container.innerText = '';
        section.text_container.appendChild($ft);
    }

    populatef = () => {
        while (characters.length < 2) {
            characters.push(Math.round(Math.random()*SB.length));
        }
        var c1 = characters[1], c2 = characters[0];
        $t1.targets[0].setValue(c1);
        $t2.targets[0].setValue(c2);
        $t2.targets[1].setValue(c1);
        $t3.targets[0].setValue(c1);
        _redraw();
    }

}

function format(str, color, parent) {
    var $s = $$({ el: 'span', text: str, parent: parent });
    if (color)
        $s.style.color = color;
    return $s;
}

function addTimelineSection(parent, name, description) {
    var $s = $$({ class: 'section', parent: parent });
    var $l = $$({ class: 'label', parent: $s, text: name });
    var $c1 = addTarget('major-container', $s);
    var $c2 = addTarget('minor-container', $s);
    var $l = $$({ class: 'description', parent: $s, text: description });
    var section_closure = {
        name: name,
        container: $s,
        text_container: $l,
        targets: [$c1, $c2]
    };
    $c1.section = section_closure;
    $c2.section = section_closure;
    return section_closure;
}

var _all_targets = {};
var _all_targets_count = 0;
function addTarget(classname, $parent) {
    var value = { index: -1, size: 1 };
    var elId = '_target_' + (_all_targets_count++);
    var $c1 = $$({ class: classname, parent: $parent, id: elId });
    var $c10 = $$({ class: 'major', parent: $c1 });
    var $c11 = $$({ class: 'major1', parent: $c1 });
    var $c12 = $$({ class: 'major2', parent: $c1 });
    var $c13 = $$({ class: 'char', parent: $c1 });
    function _setValue($el, index, size) {
        value.index = index;
        value.size = size;
        _redraw($el);
    }
    function _redraw($el) {
        if (value.index == -1) {
            $el.style.opacity = 0;
        } else {
            $el.style.backgroundColor = SB[value.index].color;
            $el.style.opacity = 1;
        }
    }
    // DnD handling
    $c1.addEventListener('drop', (e) => {
        e.preventDefault();
        _setValue($c13, Number(e.dataTransfer.getData('idx').substring(2)), -1);
        var origin_target = _all_targets[e.dataTransfer.getData('originElId')];
        if (origin_target) {
            origin_target.setValue(-1);
            if (origin_target.change) {
                origin_target.change(origin_target);
            }
        }
        if (target_closure.change) {
            target_closure.change(target_closure);
        }
    });
    $c1.addEventListener('dragover', (e) => {
        e.preventDefault();
        return false;
    });
    $c13.draggable = "true";
    $c13.addEventListener('dragstart', (e) => {
        $c13.style.opacity = '0.4';
        e.dataTransfer.setData("idx", "c_" + value.index);
        e.dataTransfer.setData("originElId", elId);
    });
    $c13.addEventListener('dragend', (e) => {
        // _redraw($c13); // TODO handle situ where item wasnt dropped on a valid target
    });

    var target_closure = {
        container: $c1,
        setValue: (index, size) => {
            _setValue($c13, index, size)
        },
        getValue: () => {
            return value;
        }
    };
    _all_targets[elId] = target_closure;
    return target_closure;
}

function addDragger(left, right) {
    var clickx = 0, leftw = 0, rightw = 0;
    var $s = $$({ class: 'dragger' });
    left.after($s);
    function _dragging(e) {
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
        window.document.addEventListener('mousemove', _dragging)
    })

    window.document.addEventListener('mouseup', (e) => {
        window.document.removeEventListener('mousemove', _dragging);
    })
    return $s;
}

// characters = [0, 2];
// settings = [3];
// showTimeline();
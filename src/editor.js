import { $, $$, $$mi, div, bezierCurve, Component } from './utils.js';


export class Storyline extends Component {
    constructor(parent) {
        super({ parent: $('editor'), class: 'storyline' }, parent);
        this.sections = [];
        this.selectedSection = 0;
        this.framework = null;
        this.tone = null;
        this.draw();
    }

    draw() {
        var $top = div(this.el, 'editor-toolbar');
        // todo add selects to top bar
        this.canvasEl = $$({ parent: this.el, class: 'editor-canvas', el: 'canvas' });
        this.canvasEl.width = "900";
        this.canvasEl.height = "600";
        this.ctx = this.canvasEl.getContext('2d');

        this.midEl = div(this.el, 'editor-mid');
        // var labelsEl = div(this.midEl, 'editor-labels')
        // div(labelsEl, 'center-line')
        this.addSection(new StorylineSection(this));
        this.addSection(new StorylineSection(this));
        this.addSection(new StorylineSection(this));

        this.propsEl = div(this.el, 'editor-props');
    }

    addSection(section) {
        this.sections.push(section);
        section.addListener('change', (e) => {
            this.redraw(section);
        });
        this._addDragger(this.sections.length - 1);
    }

    redraw(section) {
        if (section) {
            section.redraw();
        } else {
            this.sections.forEach(section => {
                section.redraw();
            });
        }
        // curvey lines
        this.ctx.clearRect(0, 0, 1000, 1000);
        var uniqueTargets = [];
        this.sections.forEach(section => {
            Object.keys(section.targets).forEach(k => {
                if (uniqueTargets.indexOf(k) == -1) {
                    uniqueTargets.push(k);
                }
            })
        });
        uniqueTargets.forEach(id => {
            var points = [];
            var color;
            var xOffset = 20;
            this.sections.forEach((section, i) => {
                var t = section.targets[id];
                if (t) {
                    var w = section.getWidth();
                    var p = { x: t.p.x + xOffset, y: t.p.y + 50 };
                    points.push(p);
                    color = t.getData().color;
                }
                xOffset += section.getWidth() + 20;
            });
            this.ctx.setLineDash([3, 3]);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = color;
            bezierCurve(this.ctx, points);
        });
    }

    _addDragger(leftIdx) {
        var left = this.sections[leftIdx];
        var clickX = 0, leftW = 0;
        var $s = $$({ class: 'dragger' });
        left.el.after($s);
        function _dragging(e) {
            var d = (e.screenX - clickX);
            if (leftW + d < 70 || leftW + d > 470) {
                return;
            }
            left.setWidth((leftW + d))
        }
        $s.addEventListener('mousedown', (e) => {
            leftW = left.getWidth();
            clickX = e.screenX;
            window.document.addEventListener('mousemove', _dragging)
        });
        window.document.addEventListener('mouseup', (e) => {
            window.document.removeEventListener('mousemove', _dragging);
            this.redraw();
        });
    }

    setUpTarget(t) {
        t.setDataProvider(this.parent.picker.objects);
        t.addListener('click', t => {
            this.select(t);
        });
    }

    select(target) {
        if (this.lastSelect) {
            this.lastSelect.select(false);
        }
        target.select(true);
        if (this.props) {
            this.lastSelect.value.props = this.props.getValues();
        }
        this.lastSelect = target;

        this.propsEl.innerText = '';
        this.props = new TargetProps(this.propsEl);
        this.props.parent = this;
        this.props.setTarget(target);
        this.props.addListener('delete', target => {
            var section = target.parent;
            delete section.targets[target.value.id]
            target.el.innerHTML = '';
            this.propsEl.innerText = '';
            this.redraw();
        });
    }


}

class StorylineSection extends Component {
    constructor(parent, name) {
        super({ class: 'section', parent: parent.midEl }, parent);
        this.name = name;
        this.value = { index: -1 }; // the scrapbook index for the 'setting' of this section
        this.targets = {}; // the main & minor characters
        this.settings = {}; // the setting(s)
        this.writingInstruction = null; // the instruction for the llm
        this.draw();
    }

    draw() {
        var charactersEl = div(this.el, 'characters');
        var settingsEl = div(this.el, 'settings');
        var text1El = div(this.el, 'text1');
        this.labelEl = div(text1El, 'label', '');
        // var text2El = div(this.el, 'text2');
        // this.descriptionEl = div(text2El, 'description', '');

        // DnD setup
        charactersEl.addEventListener('drop', (e) => {
            e.preventDefault();
            var r = this.el.getBoundingClientRect();
            var p = { x: e.pageX - r.left - 15, y: e.pageY - r.top - 30 };
            this.dropCharacter(charactersEl, e.dataTransfer.getData('id'), p);
            this.emit('change', this);
        });
        charactersEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            return false;
        });
        settingsEl.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropSetting(settingsEl, e.dataTransfer.getData('id'));
            this.emit('change', this);
        });
        settingsEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            return false;
        });
    }

    redraw() {
        //        var txt = 'Write the ' + this.name + ' of a story in 2 sentences using this storytelling framework: ' + this.parent.framework + '. ';

        var frameNumber = this.parent.sections.indexOf(this) + 1;
        var totalFrames = this.parent.sections.length;
        var characters = this.getCharacters();
        var settings = this.getSettings();
        var instruction = ''
        instruction += 'Write scene ' + frameNumber + ' of ' + totalFrames + ' of a story. ';
        if (characters.length != 0) {
            instruction += 'These are the characters in this scene and their properties:\n';
            for (var p in this.targets) {
                var cdata = this.targets[p].getData();
                var cprops = this.targets[p].value.props;
                instruction += cdata.name + ' ';
                for (var q in cprops) {
                    instruction += '(' + q+': '+cprops[q].toFixed(1)+') ';
                }
                instruction += '\n'
            }    
        } else {
            instruction += 'There are no characters in this scene. '
        }
        if (settings.length != 0) {
            instruction += 'This scene has the following settings: ';
            instruction += settings.map(c => c.name).join(', ') + '. ';
        } else {
            instruction += 'There is no specified setting. '
        }

        this.writingInstruction = instruction;
        this.labelEl.innerText = this.writingInstruction;
    }

    getCharacters() {
        var c = [];
        for (var p in this.targets) {
            c.push(this.targets[p].getData());
        }
        return c;
    }

    getSettings() {
        var c = [];
        for (var p in this.settings) {
            c.push(this.settings[p].getData());
        }
        return c;
    }

    dropCharacter(el, id, p) {
        var t = this.targets[id];
        if (t == null) {
            t = new Target(el, id);
            t.parent = this;
            this.targets[id] = t;
            this.parent.setUpTarget(t);
        }
        t.position(p);
        this.parent.select(t);
    }

    dropSetting(el, id) {
        var t = this.settings[id];
        if (t == null) {
            t = new Target(el, id);
            t.parent = this;
            this.settings[id] = t;
            this.parent.setUpTarget(t);
        }
        this.parent.select(t);
    }

    getWidth() {
        return this.el.offsetWidth;
    }

    setWidth(w) {
        this.el.style.width = w + 'px';
    }

    select(b) {
        this.selected = b;
        if (b) {
            this.el.classList.add('selected');
        } else {
            this.el.classList.remove('selected');
        }
    }

}



class Target extends Component {
    constructor(el, id) {
        super({ parent: el });
        this.value = { id: id, size: 1, props: {} };
        this.draw();
    }

    draw() {
        this.dotEl = div(this.el, 'icon');
        // click
        this.dotEl.addEventListener('click', e => {
            this.emit('click', this);
        })
        // DnD handling
        // this.dotEl.addEventListener('drop', (e) => {
        //     e.preventDefault();
        //     // todo when dropped on, replace character
        // });
        // this.dotEl.addEventListener('dragover', (e) => {
        //     e.preventDefault();
        //     return false;
        // });
        // the dot is draggable
        this.dotEl.draggable = "true";
        this.dotEl.addEventListener('dragstart', (e) => {
            this.dotEl.style.opacity = '0.4';
            e.dataTransfer.setData('id', this.value.id);
        });
        this.dotEl.addEventListener('dragend', (e) => {
            this.redraw(); // TODO handle situ where item wasnt dropped on a valid target
        });
    }

    position(p) {
        this.p = p;
        this.dotEl.style.position = 'absolute';
        this.dotEl.style.left = p.x + 'px';
        this.dotEl.style.top = p.y + 'px';
    }

    select(b) {
        this.selected = b;
        if (b) {
            this.dotEl.classList.add('selected');
        } else {
            this.dotEl.classList.remove('selected');
        }
        this.parent.select(b);
    }

    redraw() {
        this.dotEl.style.backgroundColor = this.getData().color;
        this.dotEl.style.opacity = 1;
    }

    setDataProvider(dp) {
        this.dataProvider = dp;
        this.redraw();
    }

    getData() {
        if (this.dataProvider) {
            return this.dataProvider.getValueById(this.value.id);
        } else {
            return { color: '#333' };
        }
    }



}


class TargetProps extends Component {
    constructor(parentEl) {
        super({ parent: parentEl, class: 'target-props' });
        this.props = {};
        this.draw();
    }

    draw() {
        var charEl = div(this.el, 'character');
        this.icon = div(charEl, 'icon');
        this.title = div(charEl, 'name', '');
        this.delEl = $$mi({ parent: charEl, class: 'button-delete', text: 'delete' });
        this.addProp('Role Strength', ['Major', '', '', 'Minor']);
        this.addProp('Dynamism', ['Crazy', '', '', 'Nada']);
        this.addProp('Conflict', ['Auto', 'Internal', 'External'], true);
        //
        this.delEl.addEventListener('click', e => {
            this.emit('delete', this.target);
        });
    }

    redraw() {
        this.icon.style.backgroundColor = this.target.getData().color;
        this.title.innerText = this.target.getData().name;
    }

    addProp(name, values, snap = false) {
        var tp = new TargetProp(this, { title: name, values: values, snap: snap });
        this.props[name] = tp;
    }

    getValues() {
        var o = {};
        for (var p in this.props) {
            o[p] = this.props[p].value;
        }
        return o;
    }

    setTarget(t) {
        this.target = t;
        for (var p in this.props) {
            if (t.value.props[p]) {
                this.props[p].setValue(t.value.props[p]);
            } else {
                this.props[p].setValue(0);
            }
        }
        this.redraw();
    }

}

const rowH = 22;
const yOffset = 8;
class TargetProp extends Component {
    constructor(parent, props) {
        super({ parent: parent.el, class: 'target-prop' }, parent);
        this.props = props;
        this.draw();
    }

    draw() {
        if (this.titleEl) {
            console.log("??");
            return;
        }
        this.titleEl = div(this.el, 'prop-title');
        var labelsEl = div(this.el, 'labels');
        for (var i = 0; i < this.props.values.length; i++) {
            var rowEl = div(labelsEl, 'row');
            div(rowEl, 'label', this.props.values[i]);
            div(rowEl, 'line');
        }
        this.line1El = div(labelsEl, 'line1');
        this.line2El = div(labelsEl, 'line2');
        this.dotEl = div(labelsEl, 'dot');
        // click
        labelsEl.addEventListener('click', e => {
            var r = this.line1El.getBoundingClientRect();
            var y = (this.props.values.length - 1) - (e.pageY - r.top - yOffset) / rowH;
            this.setValue(y);
        });
        // dragging
        this.dotEl.addEventListener('mousedown', this._mousedown.bind(this));
        window.document.addEventListener('mouseup', this._mouseup.bind(this));
    }
    _mousedown(e) {
        this._clickY = e.screenY;
        this._clickV = this.value;
        this._clickF = this._dragging.bind(this);
        window.document.addEventListener('mousemove', this._clickF)
    }
    _mouseup(e) {
        window.document.removeEventListener('mousemove', this._clickF);
        this.redraw();
    }
    _dragging(e) {
        var d = (this._clickY - e.screenY) / rowH;
        this.setValue(this._clickV + d);
    }
    redraw() {
        this.titleEl.innerText = this.props.title;
        var totalH = (this.props.values.length - 1) * rowH;
        var valH = this.value * rowH;
        this.line1El.style.top = (yOffset) + 'px';
        this.line1El.style.height = totalH + 'px';
        this.line2El.style.top = (yOffset + totalH - valH) + 'px';
        this.line2El.style.height = valH + 'px';
        this.line2El.style.visibility = this.props.snap ? 'hidden' : 'visible';
        this.dotEl.style.top = (totalH - valH + 4) + 'px';
    }

    setValue(v) {
        if (v < 0) {
            this.value = 0;
        } else if (v > this.props.values.length - 1) {
            this.value = this.props.values.length - 1;
        } else {
            this.value = v;
        }
        if (this.props.snap) {
            this.value = Math.floor(this.value);
        }
        this.redraw();
    }

}

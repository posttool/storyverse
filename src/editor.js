import { $, $$, $$mi, $$sel, div, bezierCurve, Component } from './utils.js';
import { FRAMEWORKS, TONE, getPreamble, getInstructionForSection } from './prompts.js';


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
        this.frameworkSelect = $$sel({ parent: $top, options: FRAMEWORKS.map(c => c.name) });
        // this.frameworkSelect.addEventListener('change', this.rewrite.bind(this))
        this.toneSelect = $$sel({ parent: $top, options: TONE.map(c => c.name) });
        // this.toneSelect.addEventListener('change', this.rewrite.bind(this))
        this.refresh = $$mi({ parent: $top, text: 'refresh' });
        this.refresh.addEventListener('click', this.rewrite.bind(this));
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
        this.addDragger(this.sections.length - 1);
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
        var uniqueTargets = this.uniqueTargets();
        uniqueTargets.forEach(target => {
            var points = [];
            var color;
            var xOffset = 20;
            this.sections.forEach((section, i) => {
                var t = section.targets[target.value.id];
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

    uniqueTargets(group = 'targets') {
        var uniqueTargetIds = {};
        var uniqueTargets = [];
        this.sections.forEach(section => {
            Object.keys(section[group]).forEach(k => {
                if (!(k in uniqueTargetIds)) {
                    uniqueTargetIds[k] = true;
                    uniqueTargets.push(section[group][k]);
                }
            })
        });
        return uniqueTargets;
    }

    rewrite() {
        var framework = this.frameworkSelect.options[this.frameworkSelect.selectedIndex].text;
        var tone = this.toneSelect.options[this.toneSelect.selectedIndex].text;
        var characters = this.uniqueTargets().map(v => v.getData());
        var settings = this.uniqueTargets('settings').map(v => v.getData());
        var instructions = getPreamble(framework, tone, characters, settings);
        this.writing = true;
        this.sectionIndex = 0;
        this.messages = [];
        this.messages.push({ role: 'user', content: instructions });
        this.rewriteNext();

    }

    rewriteNext() {
        var instruction = this.sections[this.sectionIndex].writingInstruction;
        console.log('>' + instruction)
        this.messages.push({ role: 'user', content: instruction });
        this.parent.services.GPT.Test({ messages: this.messages })
            .then((result) => {
                // var finish_reason = result.data.response.choices[0].finish_reason;
                var message = result.data.response.choices[0].message;
                console.log(message.content)
                this.messages.push(message);
                this.sections[this.sectionIndex].setWriting(message.content);
                this.sectionIndex++;
                if (this.sectionIndex < this.sections.length) {
                    this.rewriteNext();
                } else {
                    this.writing = false;
                }
            });
    }

    addDragger(leftIdx) {
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
        this.lastSelect = target;

        this.propsEl.innerText = '';
        this.props = new TargetProps(this.propsEl, target);
        this.props.parent = this;
        this.props.redraw();
        this.props.addListener('delete', target => {
            var section = target.parent;
            if (target.value.type == 'character') {
                delete section.targets[target.value.id]
            } else {
                delete section.settings[target.value.id]
            }
            target.el.innerHTML = '';
            this.propsEl.innerText = '';
            this.redraw();
        });
        this.props.addListener('change', e => {
            this.props.target.value.props = this.props.getValues();
            this.props.target.parent.redraw();
        })
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
            this.drop('character', e.dataTransfer.getData('id'), charactersEl, p);
            this.emit('change', this);
        });
        charactersEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            return false;
        });
        settingsEl.addEventListener('drop', (e) => {
            e.preventDefault();
            this.drop('setting', e.dataTransfer.getData('id'), settingsEl);
            this.emit('change', this);
        });
        settingsEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            return false;
        });
    }

    redraw() {
        var characterData = [];
        for (let p in this.targets) {
            let cdata = Object.assign({}, this.targets[p].getData());
            let cprops = Object.assign({}, this.targets[p].value.props);
            cprops.Happiness = 1 - Math.max(0, this.targets[p].p.y / 180);
            cdata.properties = cprops;
            characterData.push(cdata);
        }
        var settingData = [];
        for (let p in this.settings) {
            let sdata = Object.assign({}, this.settings[p].getData());
            // let sprops = Object.assign({}, this.targets[p].value.props);
            // sdata.props = sprops;
            settingData.push(sdata);
        }
        this.writingInstruction = getInstructionForSection({
            frame: this.parent.sections.indexOf(this) + 1,
            frameTotal: this.parent.sections.length,
            width: (this.getWidth() / 200),
            characters: characterData,
            settings: settingData
        });

        this.labelEl.innerText = this.writingInstruction;
    }

    setWriting(w) {
        this.labelEl.innerText = w;
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

    drop(type, id, el, p) {
        var where = (type == 'character') ? this.targets : this.settings;
        var t = where[id];
        if (t == null) {
            t = new Target(type, id, el);
            t.parent = this;
            where[id] = t;
            this.parent.setUpTarget(t);
        }
        if (p != null) {
            t.position(p);
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
    constructor(type, id, el) {
        super({ parent: el });
        this.value = { type: type, id: id, size: 1, props: {} };
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
    constructor(parentEl, target) {
        super({ parent: parentEl, class: 'target-props' });
        this.props = {};
        this.target = target;
        this.draw();
        this.setValues(target.value.props);
    }

    draw() {
        var charEl = div(this.el, 'character');
        this.icon = div(charEl, 'icon');
        this.title = div(charEl, 'name', '');
        this.delEl = $$mi({ parent: charEl, class: 'button-delete', text: 'delete' });

        if (this.target.value.type == 'character') {
            this.addProp('Role Strength', ['Major', '', '', 'Minor']);
            this.addProp('Dynamism', ['Crazy', '', '', 'Nada']);
            this.addProp('Conflict', ['Auto', 'Internal', 'External'], true);
        }
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
        tp.addListener('change', e => {
            this.emit('change');
        })
        this.props[name] = tp;
    }

    getValues() {
        var o = {};
        for (var p in this.props) {
            o[p] = this.props[p].value;
        }
        return o;
    }

    setValues(tprops) {
        for (var p in this.props) {
            if (tprops[p]) {
                this.props[p].setValue(tprops[p]);
            } else {
                this.props[p].setValue(0);
            }
        }
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
        this.emit('change', this.value);
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

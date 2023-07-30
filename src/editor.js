import { $, $$, bzCurve, Component } from './utils.js';


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
        var $top = $$({ class: 'editor-toolbar', parent: this.el });
        // todo add selects to top bar
        this.canvasEl = $$({ class: 'editor-canvas', parent: this.el, el: 'canvas' });
        this.canvasEl.width = "900";
        this.canvasEl.height = "600";
        this.ctx = this.canvasEl.getContext('2d');

        this.midEl = $$({ class: 'editor-mid', parent: this.el });
        // var $labels = $$({ class: 'editor-labels', parent: this.midEl })
        // $$({ class: 'center-line', parent: $labels })
        this.addSection(new StorylineSection(this));
        this.addSection(new StorylineSection(this));
        this.addSection(new StorylineSection(this));
        this._addDragger(0, 1);
        this._addDragger(1, 2);

        this.propsEl = $$({ class: 'editor-props', parent: this.el});
    }

    addSection(section) {
        this.sections.push(section);
        section.addListener('change', (e) => {
            this.redraw(section);
        })
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
            bzCurve(this.ctx, points);
        });
    }

    _addDragger(leftIdx, rightIdx) {
        var left = this.sections[leftIdx];
        var right = this.sections[rightIdx];
        var clickX = 0, leftW = 0, rightW = 0;
        var $s = $$({ class: 'dragger' });
        left.el.after($s);
        function _dragging(e) {
            var d = (e.screenX - clickX);
            if (leftW + d < 70 || leftW + d > 270) {
                return;
            }
            left.setWidth((leftW + d))
            // rightEl.style.width = (rightW - d) + 'px'
        }
        $s.addEventListener('mousedown', (e) => {
            leftW = left.getWidth();
            rightW = right.getWidth();
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

    select(t) {
        t.select(true);
        if (this.lastSelect && t != this.lastSelect) {
            this.lastSelect.select(false);
        }
        this.lastSelect = t;

        this.propsEl.innerText = '';
        this.props = new TargetProps(this.propsEl, this, t);

    }


}

class StorylineSection extends Component {
    constructor(parent, name) {
        super({ class: 'section', parent: parent.midEl }, parent);
        this.name = name;
        this.value = { index: -1 }; // the scrapbook index for the 'setting' of this section
        this.targets = {}; // the main & minor characters
        this.settings = []; // the main & minor characters
        this.writingInstruction = null; // the instruction for the llm
        this.draw();
    }

    draw() {
        var charactersEl = $$({ parent: this.el, class: 'characters' });
        var settingsEl = $$({ parent: this.el, class: 'settings' });
        var text1El = $$({ parent: this.el, class: 'text1' });
        this.labelEl = $$({ class: 'label', parent: text1El, text: '' });
        var text2El = $$({ parent: this.el, class: 'text2' });
        this.descriptionEl = $$({ class: 'description', parent: text2El, text: '' });

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
        this.writingInstruction = 'hi';
        this.descriptionEl.innerHTML = '';
        // this.descriptionEl.appendChild($ft);
    }

    dropCharacter(el, id, p) {
        var t = this.targets[id];
        if (t == null) {
            t = new Target(el, id);
            this.targets[id] = t;
            this.parent.setUpTarget(t);
        }
        this.parent.select(t);
        t.position(p);
    }

    dropSetting(el, id) {
        var t = new Target(el, id);
        this.settings.push(t);
        this.parent.setUpTarget(t);
    }

    getWidth() {
        return this.el.offsetWidth;
    }

    setWidth(w) {
        this.el.style.width = w + 'px';
    }

}



class Target extends Component {
    constructor(el, id) {
        super({ parent: el });
        this.value = { id: id, size: 1 };
        this.draw();
    }

    draw() {
        this.dotEl = $$({ class: 'icon', parent: this.el });
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
        if (this.dataProvider)
            return this.dataProvider.getValueById(this.value.id);
        else   
            return {color: '#333'};
    }

}


class TargetProps extends Component {
    constructor(parentEl, parent, target) {
        super({parent: parentEl, class: 'target-props'}, parent);
        this.target = target;
        this.draw();
    }

    draw() {
        this.prop1 = new TargetProp(this, {title: 'Role Strength', values: ['Major', '', '', 'Minor']});
        this.prop2 = new TargetProp(this, {title: 'Dynamism', values: ['Crazy', '', '', 'Nada']});
        this.prop3 = new TargetProp(this, {title: 'Conflict', values: ['Auto', 'Internal', 'External']});
    }
}

class TargetProp extends Component {
    constructor(parent, props) {
        super({parent: parent.el, class: 'target-prop'}, parent);
        this.props = props;
        this.draw();
    }
    draw() {
        this.titleEl = $$({parent: this.el, class: 'title'});
        var labelsEl = $$({parent: this.el, class: 'labels'});
        for (var i=0; i<this.props.values.length; i++) {
            $$({parent: labelsEl, text: this.props.values[i], class: 'label'});
            $$({parent: labelsEl, class: 'line'});
        }
        var line1El = $$({parent: this.el, class: 'line1'});
        var line2El = $$({parent: this.el, class: 'line2'});
        var dotEl = $$({parent: this.el, class: 'dot'});
    }
    redraw() {
        this.titleEl.innerText = this.props.title;
    }

}

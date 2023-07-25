import { $, $$, format, Component } from './utils.js';


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
        this.midEl = $$({ class: 'timeline-mid', parent: this.el });
        var $labels = $$({ class: 'timeline-labels', parent: this.midEl })
        $$({ class: 'center-line', parent: $labels })
        this.addSection(new StorylineSection(this, 'Beginning'));
        this.addSection(new StorylineSection(this, 'Middle'));
        this.addSection(new StorylineSection(this, 'End'));
        this._addDragger(0, 1);
        this._addDragger(1, 2);
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
    }

    _addDragger(leftIdx, rightIdx) {
        var leftEl = this.sections[leftIdx].el;
        var rightEl = this.sections[rightIdx].el;
        var clickX = 0, leftW = 0, rightW = 0;
        var $s = $$({ class: 'dragger' });
        leftEl.after($s);
        function _dragging(e) {
            var d = (e.screenX - clickX);
            if (leftW + d < 70 || leftW + d > 270) {
                return;
            }
            leftEl.style.width = (leftW + d) + 'px'
            // rightEl.style.width = (rightW - d) + 'px'
        }
        $s.addEventListener('mousedown', (e) => {
            leftW = leftEl.offsetWidth;
            rightW = rightEl.offsetWidth;
            clickX = e.screenX;
            window.document.addEventListener('mousemove', _dragging)
        });
        window.document.addEventListener('mouseup', (e) => {
            window.document.removeEventListener('mousemove', _dragging);
        });
    }



}

class StorylineSection extends Component {
    constructor(parent, name) {
        super({ class: 'section', parent: parent.midEl }, parent);
        this.name = name;
        this.value = { index: -1 }; // the scrapbook index for the 'setting' of this section
        this.targets = []; // the main & minor characters
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
            this.dropCharacter(charactersEl, e.dataTransfer.getData('id'), { x: e.offsetX - 15, y: e.offsetY - 15 });
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
            t = new Target(el, this.parent.parent.picker.objects.getValueById(id));
            this.targets[id] = t;
        }
        t.position(p);
    }

    dropSetting(el, id) {
        var t = new Target(el, this.parent.parent.picker.objects.getValueById(id));
        this.settings.push(t);
    }



}



class Target extends Component {
    constructor(el, data) {
        super({ parent: el });
        this.value = { data: data, size: 1 };
        this.draw();
        this.redraw();
    }

    draw() {
        this.$c13 = $$({ class: 'icon', parent: this.el });
        // DnD handling
        // the largest dot can be dropped on
        this.$c13.addEventListener('drop', (e) => {
            e.preventDefault();
            // this.value = {
            //     index: Number(e.dataTransfer.getData('idx')),
            //     size: -1
            // };
            // var origin_target = this.parent.parent.getTarget(e.dataTransfer.getData('originTargetId'));
            // if (origin_target) {
            //     origin_target.value.index = -1;
            //     origin_target.emit('change', origin_target);
            // }
            // this.redraw();
            // this.emit('change', this);
        });
        this.$c13.addEventListener('dragover', (e) => {
            e.preventDefault();
            return false;
        });
        // the dot is draggable
        this.$c13.draggable = "true";
        this.$c13.addEventListener('dragstart', (e) => {
            this.$c13.style.opacity = '0.4';
            e.dataTransfer.setData('id', this.value.data.id);
        });
        this.$c13.addEventListener('dragend', (e) => {
            this.redraw(); // TODO handle situ where item wasnt dropped on a valid target
        });
    }

    position(p) {
        this.$c13.style.position = 'absolute';
        this.$c13.style.left = p.x + 'px';
        this.$c13.style.top = p.y + 'px';
    }

    redraw() {
        if (this.value.index == -1) {
            this.$c13.style.opacity = 0;
        } else {
            this.$c13.style.backgroundColor = this.value.data.color;
            this.$c13.style.opacity = 1;
        }
    }

}



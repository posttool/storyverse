import { $$, format, Component } from './utils.js';
import { SB } from './scrapbook.js';


// from https://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/

  
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
          var words = text.split(' ');
          var line = '';
  
          for(var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
              context.fillText(line, x, y);
              line = words[n] + ' ';
              y += lineHeight;
            }
            else {
              line = testLine;
            }
          }
          context.fillText(line, x, y);
        }
        
    



export class Storyline extends Component {
    constructor(rootEl) {
        super({ parent: rootEl, class: 'storyline' });
        this.sections = [];
        this.targets = {};
        this.framework = null;
        this.draw();
    }

    draw() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = "CursorLayer";
        this.canvas.width = 1224;
        this.canvas.height = 768;
        // this.canvas.style.zIndex = 8;
        // this.canvas.style.position = "absolute";
        // this.canvas.style.border = "1px solid";
        this.el.appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.context.fillStyle = "rgba(255, 0, 0, 0.2)";
        this.context.fillRect(100, 100, 200, 200);
        this.context.fillStyle = "rgba(0, 255, 0, 0.2)";
        this.context.fillRect(150, 150, 200, 200);
        var text = 'All the world\'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.';
  
        this.context.font = '15pt Inter';
        this.context.fillStyle = '#333';
  
        wrapText(this.context, text, 110, 110, 333, 23);
      
        this.context.font = '15pt Material Symbols Outlined';
        this.context.fillText('calendar_today',30,30)


        // PIXI.Assets.addBundle('fonts', {
        //     'material-icons': './css/material-design-icons-4.0.0/font/MaterialIcons-Regular.ttf',
        //     'inter': './css/Inter/Inter-VariableFont_slnt,wght.ttf'
        // });
        // PIXI.Assets.loadBundle('fonts').then(() =>
        // {
        // this.app = new PIXI.Application({ background: '#1099bb' });
        // this.el.appendChild(this.app.view);
        // // const container = new PIXI.Container();
        // // this.app.stage.addChild(container);
        // var style_icons = new PIXI.TextStyle({ fontFamily: 'material-icons', fontSize: 20 })
        // var style_inter_big = new PIXI.TextStyle({ fontFamily: 'inter', fontSize: 50 })
        // // this.app.stage.addChild(new PIXI.Text('1234567890', style_inter_big));
        // console.log(decodeURI('&#xE87C;'))
        // this.app.stage.addChild(new PIXI.Text(decode('&#xE87C;') , style_icons));





        // var $top = $$({ class: 'timeline-top', parent: this.el });
        // var $climax = $$({ class: 'timeline-climax', parent: this.el });
        // this.midEl = $$({ class: 'timeline-mid', parent: this.el });
        // var $labels = $$({ class: 'timeline-labels', parent: this.midEl })
        // $$({ class: 'major', parent: $labels, text: 'Main' })
        // $$({ class: 'minor', parent: $labels, text: 'Minor' })
        // $$({ class: 'major-line', parent: $labels })
        // $$({ class: 'minor-line', parent: $labels })
        // this.addSection(new StorylineSection(this, 'Beginning'));
        // this.addSection(new StorylineSection(this, 'Middle'));
        // this.addSection(new StorylineSection(this, 'End'));
        // this._addDragger(0, 1);
        // this._addDragger(1, 2);
        // });
    }

    addSection(section) {
        var self = this;
        self.sections.push(section);
        section.addListener('change', (e) => {
            self.redraw(section);
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
            rightEl.style.width = (rightW - d) + 'px'
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

    addTarget(t) {
        var self = this;
        self.targets[t.uuid] = t;
        t.addListener('change', (t) => {
            self.redraw(t.parent);
        })
    }

    getTarget(uuid) {
        return this.targets[uuid];
    }


}

class StorylineSection extends Component {
    constructor(parent, name) {
        super({ class: 'section', parent: parent.midEl });
        this.parent = parent;
        this.name = name;
        this.value = { index: -1 }; // the scrapbook index for the 'setting' of this section
        this.targets = []; // the main & minor characters
        this.writingInstruction = null; // the instruction for the llm
        this.draw();
    }

    addTarget(t) {
        var self = this;
        self.targets.push(t);
        self.parent.addTarget(t);
    }

    draw() {
        var $drop = $$({ parent: this.el });
        $$({ class: 'top', parent: $drop });
        $$({ class: 'right', parent: $drop });
        $$({ class: 'bottom', parent: $drop });
        $$({ class: 'left', parent: $drop });
        this.labelEl = $$({ class: 'label', parent: this.el, text: this.name });
        this.addTarget(new Target(this, 'major-container'));
        this.addTarget(new Target(this, 'minor-container'));
        this.descriptionEl = $$({ class: 'description', parent: this.el, text: '' });

        // DnD setup
        var self = this;
        $drop.addEventListener('drop', (e) => {
            e.preventDefault();
            self.value.index = Number(e.dataTransfer.getData('idx'));
            self.emit('change', this);
        });
        $drop.addEventListener('dragover', (e) => {
            e.preventDefault();
            return false;
        });
    }

    redraw() {
        var c00 = this.targets[0].value.index;
        var c01 = this.targets[1].value.index;

        var do1 = SB[c01];
        var do2 = SB[c00];
        var do3 = SB[this.value.index];
        this.labelEl.innerText = this.name;
        // build label (todo call service for results)

        var txt = 'Write the ' + this.name + ' of a story in 2 sentences using this storytelling framework: ' + this.parent.framework + '. ';
        var $ft = $$({ el: 'span' });
        if (c00 == -1 && c01 == -1) {
            format('No one ', null, $ft);
            txt += 'There are no characters.';
        } else if (c00 == -1 && c01 != -1) {
            format('Minor ', null, $ft);
            format(do1.name, do1.color, $ft);
            txt += 'There is a minor character named ' + do1.name + '. ';
        } else if (c00 != -1 && c01 == -1) {
            format('Main ', null, $ft);
            format(do2.name, do2.color, $ft);
            txt += 'The protagonist is named ' + do2.name + '. ';
        } else {
            format('Main ', null, $ft);
            format(do2.name, do2.color, $ft);
            format(' and minor ', null, $ft);
            format(do1.name, do1.color, $ft);
            txt += 'The protagonist is named ' + do2.name +
                ' and a support character is named ' + do1.name + '. ';
        }
        if (do3) {
            this.el.style.backgroundColor = do3.color + "33";
            format(' in setting ', null, $ft);
            format(do3.name, do3.color, $ft);
            txt += 'The scene is in this setting: ' + do3.name + '. ';
        }
        this.writingInstruction = txt;

        this.descriptionEl.innerHTML = '';
        this.descriptionEl.appendChild($ft);

        this.targets.forEach(target => {
            target.redraw();
        });

    }

    format(s) {
        // find and replace entities with colors
        this.descriptionEl.innerHTML = '';
        this.descriptionEl.appendChild($$({ el: 'span', text: s }));
    }


}




class Target extends Component {
    constructor(parent, name) {
        super({ parent: parent.el });
        this.parent = parent;
        this.name = name;
        this.value = { index: -1, size: 1 };
        this.uuid = Math.floor(Math.random() * Date.now()).toString(16);
        this.draw();
    }

    draw() {
        var self = this;
        var $c1 = $$({ class: this.name, parent: this.el });
        $$({ class: 'major', parent: $c1 });
        $$({ class: 'major1', parent: $c1 });
        $$({ class: 'major2', parent: $c1 });
        self.$c13 = $$({ class: 'char', parent: $c1 });
        // DnD handling
        // the largest dot can be dropped on
        $c1.addEventListener('drop', (e) => {
            e.preventDefault();
            self.value = {
                index: Number(e.dataTransfer.getData('idx')),
                size: -1
            };
            var origin_target = self.parent.parent.getTarget(e.dataTransfer.getData('originTargetId'));
            if (origin_target) {
                origin_target.value.index = -1;
                origin_target.emit('change', origin_target);
            }
            self.redraw();
            self.emit('change', this);
        });
        $c1.addEventListener('dragover', (e) => {
            e.preventDefault();
            return false;
        });
        // the dot is draggable
        self.$c13.draggable = "true";
        self.$c13.addEventListener('dragstart', (e) => {
            self.$c13.style.opacity = '0.4';
            e.dataTransfer.setData('idx', self.value.index);
            e.dataTransfer.setData("originTargetId", self.uuid);
        });
        self.$c13.addEventListener('dragend', (e) => {
            self.redraw(); // TODO handle situ where item wasnt dropped on a valid target
        });
    }

    redraw() {
        if (this.value.index == -1) {
            this.$c13.style.opacity = 0;
        } else {
            this.$c13.style.backgroundColor = SB[this.value.index].color;
            this.$c13.style.opacity = 1;
        }
    }

}



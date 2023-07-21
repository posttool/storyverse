import { $, Component } from './utils.js';
import { Storyline } from './editor.js';
import { Picker } from './picker.js';
import { Preview } from './preview.js';
import { Account } from './account.js';

export class Studio extends Component {
    constructor(rootEl) {
        super({ parent: null, class: 'studio' });
        var self = this;
        self.account = new Account(self);
        self.account.addListener('login', (e) => {
            self.picker = new Picker(self);
            self.picker.objects.value = [
                {type: 'character', name: 'Julian', color: '#FF5555', description: 'Loves to play basketball and read.'},
                {type: 'character', name: 'Lucas', color: '#55B8FF', description: 'Loves his brother Julian. Loves to swim and draw and cook.'},
                {type: 'place', name: 'Home', color: '#5566FF', description: 'There home in Los Gatos, which is much more magical than it seems.'}
            ]
            //#F1B732
            //#A055FF
            //#4BBB78
            self.picker.objects.draw();
            // self.editor = new Storyline(self);
            self.preview = new Preview(self);
        });
        self.account.addListener('logout', (e) => {
            $("picker").innerHTML = '';
            $("editor").innerHTML = '';
        });
    }

}
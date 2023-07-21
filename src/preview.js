import { $, Component } from './utils.js';

export class Preview extends Component {
    constructor(parent) {
        super({ parent: $('preview'), class: 'preview' });
        this.draw();
    }

}
import { $, $$, Component, Selected } from './utils.js';

export class CharacterAttributes extends Component {
    constructor(parent){
        super({ parent: $('picker'), class: 'picker' }, parent);
    }
}
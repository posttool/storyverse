import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from 'firebase/auth';

import { $, $$, $$mi, Component } from './utils.js';

export class Account extends Component {
    constructor(parent) {
        super({ parent: $('account'), class: 'account-root' }, parent);
        this.draw();
    }

    draw() {

        this.el.innerHTML = '';
        this.userEl = $$({ parent: this.el, class: 'user-container' });
        this.picEl = $$({ parent: this.userEl, class: 'user-pic' });
        this.nameEl = $$({ parent: this.userEl, class: 'user-name' });
        this.signoutEl = $$mi({ parent: this.userEl, text: 'logout' });
        this.signinEl = $$mi({ parent: this.userEl, text: 'login' });
        this.signoutEl.addEventListener('click', this.doSignOut.bind(this));
        this.signinEl.addEventListener('click', this.doSignIn.bind(this));
        $('not-logged-in-sign-in').addEventListener('click', this.doSignIn.bind(this));
        onAuthStateChanged(getAuth(), (user) => {
            this.value = user;
            this.redraw();
            if (user != null) {
                this.emit('login', user);
            } else {
                this.emit('logout');
            }
        });

    }

    redraw() {
        if (this.value != null) {
            this.signoutEl.style.display = 'block';
            this.signinEl.style.display = 'none';
            this.picEl.innerHTML = '<img src="' + this.value.photoURL + '" />';
        } else {
            this.signoutEl.style.display = 'none';
            this.signinEl.style.display = 'block';
            this.picEl.innerHTML = '';
        }

    }


    doSignIn() {
        var provider = new GoogleAuthProvider();
        signInWithPopup(getAuth(), provider);
    }

    doSignOut() {
        signOut(getAuth());
    }


}




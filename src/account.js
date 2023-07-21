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
        super({ parent: $('account'), class: 'account-root' });
        this.parent = parent;
        this.draw();
    }


    draw() {
        var self = this;

        self.el.innerHTML = '';
        self.userEl = $$({ parent: self.el, class: 'user-container' });
        self.picEl = $$({ parent: self.userEl, class: 'user-pic' });
        self.nameEl = $$({ parent: self.userEl, class: 'user-name' });
        self.signoutEl = $$mi({ parent: self.userEl, text: 'logout'});
        self.signinEl = $$mi({ parent: self.userEl, text:'login'});
        self.signoutEl.addEventListener('click', self.doSignOut.bind(self));
        self.signinEl.addEventListener('click', self.doSignIn.bind(self));

        onAuthStateChanged(getAuth(), (user) => {
            self.value = user;
            self.redraw();
            if (user != null) {
                self.emit('login', user);
            } else {
                self.emit('logout');
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




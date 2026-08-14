import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";


const firebaseConfig = {

    apiKey: "AIzaSyC8vP-qqNztuX55011fnR4iP-rJcWNILXU",

    authDomain: "busineisting-90d9f.firebaseapp.com",

    projectId: "busineisting-90d9f",

    storageBucket: "busineisting-90d9f.firebasestorage.app",

    messagingSenderId: "427713937042",

    appId: "1:427713937042:web:7e24b1c9014a5e5cd4b04b",

    measurementId: "G-TEKWKH0MCG"
};


// Initialize Firebase

const app = initializeApp(firebaseConfig);


// Firebase Authentication

const auth = getAuth(app);


// Firestore Database

const db = getFirestore(app);


// Firebase Storage

const storage = getStorage(app);


// Export

export {
    app,
    auth,
    db,
    storage
};

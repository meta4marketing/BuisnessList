/* =====================================================
   PART 4
   FIREBASE LOGIN SYSTEM - UPGRADED VERSION
===================================================== */


/* =====================================================
   FIREBASE IMPORTS
===================================================== */

import {
    auth
} from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    reload
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


/* =====================================================
   LOGIN ELEMENTS
===================================================== */

const loginBtn =
    document.getElementById("loginBtn");


const loginModalElement =
    document.getElementById("loginModal");


const loginForm =
    document.getElementById("loginForm");


const loginEmail =
    document.getElementById("loginEmail");


const loginPassword =
    document.getElementById("loginPassword");


const loginAlert =
    document.getElementById("loginAlert");


const loginSubmitBtn =
    document.getElementById("loginSubmitBtn");


const loginBtnText =
    document.getElementById("loginBtnText");


const loginSpinner =
    document.getElementById("loginSpinner");


const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");


/* =====================================================
   NAVBAR ELEMENTS
===================================================== */

const registerBtn =
    document.getElementById("registerBtn");


const dashboardBtn =
    document.getElementById("dashboardBtn");


const logoutBtn =
    document.getElementById("logoutBtn");


/* =====================================================
   BOOTSTRAP LOGIN MODAL
===================================================== */

let loginModal = null;


if (loginModalElement) {

    loginModal =
        new bootstrap.Modal(
            loginModalElement
        );

}


/* =====================================================
   OPEN LOGIN MODAL
===================================================== */

if (
    loginBtn &&
    loginModal
) {

    loginBtn.addEventListener(
        "click",
        function() {

            clearLoginAlert();


            if (loginForm) {

                loginForm.reset();

            }


            loginModal.show();

        }
    );

}


/* =====================================================
   LOGIN FORM SUBMIT
===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            /*
               Prevent double click
            */

            if (
                loginSubmitBtn &&
                loginSubmitBtn.disabled
            ) {

                return;

            }


            clearLoginAlert();


            /* ==========================================
               GET VALUES
            ========================================== */

            const email =
                loginEmail
                    ? loginEmail.value
                        .trim()
                        .toLowerCase()
                    : "";


            const password =
                loginPassword
                    ? loginPassword.value
                    : "";


            /* ==========================================
               VALIDATION
            ========================================== */

            if (!email) {

                showLoginAlert(
                    "Please enter your email.",
                    "danger"
                );

                return;

            }


            if (!password) {

                showLoginAlert(
                    "Please enter your password.",
                    "danger"
                );

                return;

            }


            /* ==========================================
               START LOADING
            ========================================== */

            setLoginLoading(true);


            try {

                console.log(
                    "Starting Firebase login..."
                );


                /* ======================================
                   FIREBASE LOGIN
                ====================================== */

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                console.log(
                    "Firebase Login Successful:",
                    user.uid
                );


                /* ======================================
                   REFRESH USER
                ====================================== */

                await reload(user);


                /* ======================================
                   EMAIL VERIFICATION CHECK
                ====================================== */

                if (!user.emailVerified) {

                    showLoginAlert(

                        "Your email is not verified. Please verify your email before logging in.",

                        "warning"

                    );


                    await signOut(auth);


                    return;

                }


                /* ======================================
                   LOGIN SUCCESS
                ====================================== */

                showLoginAlert(

                    "Login successful!",

                    "success"

                );


                /* ======================================
                   UPDATE NAVBAR
                ====================================== */

                updateNavbarLoggedIn();


                /* ======================================
                   CLOSE LOGIN MODAL
                ====================================== */

                if (loginModal) {

                    loginModal.hide();

                }


                /*
                   Bootstrap cleanup.

                   This prevents invisible modal
                   backdrop from blocking the page.
                */

                cleanupModal();


            }

            catch(error) {

                console.error(
                    "Firebase Login Error:",
                    error
                );


                showLoginAlert(

                    getLoginErrorMessage(error),

                    "danger"

                );

            }

            finally {

                setLoginLoading(false);

            }

        }
    );

}


/* =====================================================
   LOGIN LOADING
===================================================== */

function setLoginLoading(
    loading
) {

    if (!loginSubmitBtn) {

        return;

    }


    loginSubmitBtn.disabled =
        loading;


    if (loading) {

        if (loginBtnText) {

            loginBtnText.innerText =
                "Logging in...";

        }


        if (loginSpinner) {

            loginSpinner.classList.remove(
                "d-none"
            );

        }

    }

    else {

        if (loginBtnText) {

            loginBtnText.innerText =
                "Login";

        }


        if (loginSpinner) {

            loginSpinner.classList.add(
                "d-none"
            );

        }

    }

}


/* =====================================================
   LOGIN ALERT
===================================================== */

function showLoginAlert(
    message,
    type
) {

    if (!loginAlert) {

        return;

    }


    loginAlert.className =
        `alert alert-${type}`;


    loginAlert.innerText =
        message;


    loginAlert.classList.remove(
        "d-none"
    );

}


function clearLoginAlert() {

    if (!loginAlert) {

        return;

    }


    loginAlert.className =
        "alert d-none";


    loginAlert.innerText =
        "";

}


/* =====================================================
   FIREBASE LOGIN ERROR
===================================================== */

function getLoginErrorMessage(
    error
) {

    console.error(
        "Firebase Error Code:",
        error.code
    );


    console.error(
        "Firebase Error Message:",
        error.message
    );


    switch(error.code) {


        case "auth/invalid-credential":

            return "Invalid email or password.";


        case "auth/invalid-login-credentials":

            return "Invalid email or password.";


        case "auth/wrong-password":

            return "Incorrect password.";


        case "auth/user-not-found":

            return "No account found with this email.";


        case "auth/invalid-email":

            return "Please enter a valid email address.";


        case "auth/user-disabled":

            return "This account has been disabled.";


        case "auth/too-many-requests":

            return "Too many login attempts. Please try again later.";


        case "auth/network-request-failed":

            return "Network error. Please check your internet connection.";


        case "auth/operation-not-allowed":

            return "Email and Password login is not enabled in Firebase.";


        default:

            return "Login failed. Please check your email and password.";

    }

}


/* =====================================================
   NAVBAR - LOGGED IN
===================================================== */

function updateNavbarLoggedIn() {

    /* -----------------------------------------
       Hide Register
    ----------------------------------------- */

    if (registerBtn) {

        registerBtn.classList.add(
            "d-none"
        );

    }


    /* -----------------------------------------
       Hide Login
    ----------------------------------------- */

    if (loginBtn) {

        loginBtn.classList.add(
            "d-none"
        );

    }


    /* -----------------------------------------
       Show Dashboard
    ----------------------------------------- */

    if (dashboardBtn) {

        dashboardBtn.classList.remove(
            "d-none"
        );

    }


    /* -----------------------------------------
       Show Logout
    ----------------------------------------- */

    if (logoutBtn) {

        logoutBtn.classList.remove(
            "d-none"
        );

    }

}


/* =====================================================
   NAVBAR - LOGGED OUT
===================================================== */

function updateNavbarLoggedOut() {

    /* -----------------------------------------
       Show Register
    ----------------------------------------- */

    if (registerBtn) {

        registerBtn.classList.remove(
            "d-none"
        );

    }


    /* -----------------------------------------
       Show Login
    ----------------------------------------- */

    if (loginBtn) {

        loginBtn.classList.remove(
            "d-none"
        );

    }


    /* -----------------------------------------
       Hide Dashboard
    ----------------------------------------- */

    if (dashboardBtn) {

        dashboardBtn.classList.add(
            "d-none"
        );

    }


    /* -----------------------------------------
       Hide Logout
    ----------------------------------------- */

    if (logoutBtn) {

        logoutBtn.classList.add(
            "d-none"
        );

    }

}


/* =====================================================
   BOOTSTRAP MODAL CLEANUP
===================================================== */

function cleanupModal() {

    /*
       Wait a little so Bootstrap can
       finish its hide animation.
    */

    setTimeout(() => {


        /* -------------------------------------
           Remove modal-open
        ------------------------------------- */

        document.body.classList.remove(
            "modal-open"
        );


        /* -------------------------------------
           Restore body scrolling
        ------------------------------------- */

        document.body.style.removeProperty(
            "overflow"
        );


        document.body.style.removeProperty(
            "padding-right"
        );


        /* -------------------------------------
           Remove leftover backdrops
        ------------------------------------- */

        document
            .querySelectorAll(
                ".modal-backdrop"
            )
            .forEach(
                backdrop => {

                    backdrop.remove();

                }
            );


        /* -------------------------------------
           Remove accidental inline styles
        ------------------------------------- */

        document.body.style.removeProperty(
            "height"
        );


    }, 350);

}


/* =====================================================
   FORGOT PASSWORD
===================================================== */

if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener(
        "click",
        async function() {


            clearLoginAlert();


            const email =
                loginEmail
                    ? loginEmail.value
                        .trim()
                        .toLowerCase()
                    : "";


            if (!email) {

                showLoginAlert(

                    "Please enter your email address first.",

                    "warning"

                );

                if (loginEmail) {

                    loginEmail.focus();

                }

                return;

            }


            try {

                forgotPasswordBtn.disabled =
                    true;


                forgotPasswordBtn.innerText =
                    "Sending...";


                await sendPasswordResetEmail(
                    auth,
                    email
                );


                showLoginAlert(

                    "Password reset email sent. Please check your inbox and spam folder.",

                    "success"

                );


            }

            catch(error) {

                console.error(
                    "Password Reset Error:",
                    error
                );


                showLoginAlert(

                    getLoginErrorMessage(error),

                    "danger"

                );

            }

            finally {

                forgotPasswordBtn.disabled =
                    false;


                forgotPasswordBtn.innerText =
                    "Forgot Password?";

            }

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {


            /*
               Prevent multiple logout clicks
            */

            logoutBtn.disabled =
                true;


            try {

                await signOut(auth);


                console.log(
                    "User logged out."
                );


                updateNavbarLoggedOut();


                /*
                   Make sure any modal overlay
                   is removed.
                */

                cleanupModal();


                alert(
                    "You have been logged out successfully."
                );

            }

            catch(error) {

                console.error(
                    "Logout Error:",
                    error
                );


                alert(
                    "Logout failed. Please try again."
                );

            }

            finally {

                logoutBtn.disabled =
                    false;

            }

        }
    );

}


/* =====================================================
   AUTH STATE LISTENER
===================================================== */

onAuthStateChanged(
    auth,
    async function(user) {

        console.log(
            "Auth State:",
            user
        );


        if (!user) {

            updateNavbarLoggedOut();

            return;

        }


        try {

            /*
               Get latest Firebase user data.
            */

            await reload(user);


            if (user.emailVerified) {

                updateNavbarLoggedIn();

            }

            else {

                updateNavbarLoggedOut();

            }

        }

        catch(error) {

            console.error(
                "Auth State Error:",
                error
            );


            updateNavbarLoggedOut();

        }

    }
);


/* =====================================================
   PAGE LOAD
===================================================== */

console.log(
    "Part 4 Firebase Login - Upgraded Loaded"
);

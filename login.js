/* =====================================================
   PART 4
   FIREBASE LOGIN
===================================================== */

import {
    auth
} from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    signOut
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
   OPEN LOGIN POPUP
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
   LOGIN FORM
===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            clearLoginAlert();


            const email =
                loginEmail.value
                    .trim()
                    .toLowerCase();


            const password =
                loginPassword.value;


            /* =========================================
               VALIDATION
            ========================================= */

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


            /* =========================================
               LOADING
            ========================================= */

            setLoginLoading(true);


            try {

                /* =====================================
                   FIREBASE LOGIN
                ===================================== */

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


                /* =====================================
                   EMAIL VERIFICATION CHECK
                ===================================== */

                if (!user.emailVerified) {

                    showLoginAlert(

                        "Your email is not verified. Please verify your email before login.",

                        "warning"

                    );


                    await signOut(auth);


                    return;

                }


                /* =====================================
                   LOGIN SUCCESS
                ===================================== */

                showLoginAlert(

                    "Login successful!",

                    "success"

                );


                /* =====================================
                   UPDATE NAVBAR
                ===================================== */

                if (registerBtn) {

                    registerBtn.classList.add(
                        "d-none"
                    );

                }


                if (loginBtn) {

                    loginBtn.classList.add(
                        "d-none"
                    );

                }


                if (dashboardBtn) {

                    dashboardBtn.classList.remove(
                        "d-none"
                    );

                }


                if (logoutBtn) {

                    logoutBtn.classList.remove(
                        "d-none"
                    );

                }


                /* =====================================
                   CLOSE LOGIN MODAL
                ===================================== */

                setTimeout(() => {

                    if (loginModal) {

                        loginModal.hide();

                    }

                }, 800);


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
   FIREBASE ERROR MESSAGE
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


        default:

            return "Login failed. Please check your email and password.";

    }

}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {

            try {

                await signOut(auth);


                console.log(
                    "User logged out."
                );


                if (registerBtn) {

                    registerBtn.classList.remove(
                        "d-none"
                    );

                }


                if (loginBtn) {

                    loginBtn.classList.remove(
                        "d-none"
                    );

                }


                if (dashboardBtn) {

                    dashboardBtn.classList.add(
                        "d-none"
                    );

                }


                if (logoutBtn) {

                    logoutBtn.classList.add(
                        "d-none"
                    );

                }


                alert(
                    "You have been logged out successfully."
                );

            }

            catch(error) {

                console.error(
                    "Logout Error:",
                    error
                );

            }

        }
    );

}


console.log(
    "Part 4 Firebase Login Loaded"
);

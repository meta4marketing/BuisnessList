/* =====================================================
   FIREBASE IMPORTS
===================================================== */

import {
    auth,
    db
} from "./firebase-config.js";


import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    reload
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";



/* =====================================================
   DOM ELEMENTS
===================================================== */

// Search

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const productContainer =
    document.getElementById("productContainer");

const listingCount =
    document.getElementById("listingCount");


// Navbar

const registerBtn =
    document.getElementById("registerBtn");

const loginBtn =
    document.getElementById("loginBtn");

const dashboardBtn =
    document.getElementById("dashboardBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


// Registration

const registrationForm =
    document.getElementById("registrationForm");

const registerSubmitBtn =
    document.getElementById("registerSubmitBtn");

const registerBtnText =
    document.getElementById("registerBtnText");

const registerSpinner =
    document.getElementById("registerSpinner");

const registrationAlert =
    document.getElementById("registrationAlert");


// Verification

const verificationEmail =
    document.getElementById("verificationEmail");

const verificationAlert =
    document.getElementById("verificationAlert");

const checkVerificationBtn =
    document.getElementById("checkVerificationBtn");

const resendVerificationBtn =
    document.getElementById("resendVerificationBtn");



/* =====================================================
   BOOTSTRAP MODALS
===================================================== */

const registerModalElement =
    document.getElementById("registerModal");

const verificationModalElement =
    document.getElementById("verificationModal");


const registerModal =
    new bootstrap.Modal(registerModalElement);


const verificationModal =
    new bootstrap.Modal(verificationModalElement);



/* =====================================================
   TEMPORARY REGISTRATION EMAIL
===================================================== */

let registeredEmail = "";



/* =====================================================
   SEARCH SYSTEM
===================================================== */

function searchProducts() {

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();


    const cards =
        productContainer.querySelectorAll(
            ".product-card"
        );


    let visibleCount = 0;


    cards.forEach(card => {

        const cardText =
            card.innerText.toLowerCase();


        const parentColumn =
            card.closest(".col-12");


        if (
            searchValue === "" ||
            cardText.includes(searchValue)
        ) {

            parentColumn.style.display = "";

            visibleCount++;

        } else {

            parentColumn.style.display = "none";

        }

    });


    listingCount.innerText =
        visibleCount;

}


searchBtn.addEventListener(
    "click",
    searchProducts
);


searchInput.addEventListener(
    "input",
    searchProducts
);



/* =====================================================
   OPEN REGISTER MODAL
===================================================== */

registerBtn.addEventListener(
    "click",
    () => {

        clearRegistrationForm();

        registerModal.show();

    }
);



/* =====================================================
   REGISTRATION FORM SUBMIT
===================================================== */

registrationForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        clearRegistrationAlert();


        const name =
            document.getElementById(
                "registerName"
            ).value.trim();


        const mobile =
            document.getElementById(
                "registerMobile"
            ).value.trim();


        const email =
            document.getElementById(
                "registerEmail"
            ).value.trim();


        const businessLocation =
            document.getElementById(
                "businessLocation"
            ).value.trim();


        const area =
            document.getElementById(
                "businessArea"
            ).value.trim();


        const pincode =
            document.getElementById(
                "businessPincode"
            ).value.trim();


        const password =
            document.getElementById(
                "registerPassword"
            ).value;


        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value;



        /* ==========================================
           VALIDATION
        ========================================== */


        if (name.length < 2) {

            showRegistrationAlert(
                "Please enter a valid name.",
                "danger"
            );

            return;

        }


        if (!/^[0-9]{10}$/.test(mobile)) {

            showRegistrationAlert(
                "Please enter a valid 10 digit mobile number.",
                "danger"
            );

            return;

        }


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {

            showRegistrationAlert(
                "Please enter a valid email address.",
                "danger"
            );

            return;

        }


        if (businessLocation.length < 2) {

            showRegistrationAlert(
                "Please enter your business location.",
                "danger"
            );

            return;

        }


        if (area.length < 2) {

            showRegistrationAlert(
                "Please enter your area.",
                "danger"
            );

            return;

        }


        if (!/^[0-9]{6}$/.test(pincode)) {

            showRegistrationAlert(
                "Please enter a valid 6 digit pincode.",
                "danger"
            );

            return;

        }


        if (password.length < 6) {

            showRegistrationAlert(
                "Password must contain at least 6 characters.",
                "danger"
            );

            return;

        }


        if (password !== confirmPassword) {

            showRegistrationAlert(
                "Password and Confirm Password do not match.",
                "danger"
            );

            return;

        }



        /* ==========================================
           LOADING STATE
        ========================================== */

        setRegistrationLoading(true);



        try {


            /* ======================================
               CREATE FIREBASE AUTH ACCOUNT
            ====================================== */

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            console.log(
                "Firebase Auth User Created:",
                user.uid
            );


            /* ======================================
               SEND EMAIL VERIFICATION
            ====================================== */

            await sendEmailVerification(user);


            console.log(
                "Verification email sent."
            );


            registeredEmail =
                email;


            verificationEmail.innerText =
                email;


            /* ======================================
               CLOSE REGISTER MODAL
            ====================================== */

            registerModal.hide();


            /* ======================================
               OPEN VERIFICATION MODAL
            ====================================== */

            setTimeout(() => {

                verificationModal.show();

            }, 400);


        }

        catch(error) {

            console.error(
                "Registration Error:",
                error
            );


            showRegistrationAlert(
                getFirebaseErrorMessage(error),
                "danger"
            );

        }

        finally {

            setRegistrationLoading(false);

        }

    }
);



/* =====================================================
   CHECK EMAIL VERIFICATION
===================================================== */

checkVerificationBtn.addEventListener(
    "click",
    async function() {

        clearVerificationAlert();


        try {


            if (!auth.currentUser) {

                showVerificationAlert(
                    "Registration session expired. Please register again.",
                    "danger"
                );

                return;

            }


            checkVerificationBtn.disabled =
                true;


            checkVerificationBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm"></span>
                Checking...
            `;


            /* ======================================
               REFRESH USER DATA
            ====================================== */

            await reload(
                auth.currentUser
            );


            const user =
                auth.currentUser;


            console.log(
                "Email Verified:",
                user.emailVerified
            );


            if (!user.emailVerified) {

                showVerificationAlert(
                    "Your email is not verified yet. Please open the verification email and click the verification link.",
                    "warning"
                );

                return;

            }



            /* ======================================
               SAVE USER PROFILE TO FIRESTORE
            ====================================== */

            const name =
                document.getElementById(
                    "registerName"
                ).value.trim();


            const mobile =
                document.getElementById(
                    "registerMobile"
                ).value.trim();


            const businessLocation =
                document.getElementById(
                    "businessLocation"
                ).value.trim();


            const area =
                document.getElementById(
                    "businessArea"
                ).value.trim();


            const pincode =
                document.getElementById(
                    "businessPincode"
                ).value.trim();



            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {

                    uid: user.uid,

                    name: name,

                    mobile: mobile,

                    email: user.email,

                    businessLocation:
                        businessLocation,

                    area: area,

                    pincode: pincode,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


            console.log(
                "User profile saved to Firestore."
            );


            showVerificationAlert(
                "Email verified successfully! Your registration is complete.",
                "success"
            );


            /* ======================================
               WAIT THEN CLOSE
            ====================================== */

            setTimeout(() => {

                verificationModal.hide();

                alert(
                    "Registration completed successfully. You can now login."
                );

            }, 1500);


        }

        catch(error) {

            console.error(
                "Verification Error:",
                error
            );


            showVerificationAlert(
                getFirebaseErrorMessage(error),
                "danger"
            );

        }

        finally {

            checkVerificationBtn.disabled =
                false;


            checkVerificationBtn.innerHTML = `
                <i class="bi bi-check-circle"></i>
                Check Verification
            `;

        }

    }
);



/* =====================================================
   RESEND VERIFICATION EMAIL
===================================================== */

resendVerificationBtn.addEventListener(
    "click",
    async function() {

        clearVerificationAlert();


        try {


            if (!auth.currentUser) {

                showVerificationAlert(
                    "Registration session expired. Please register again.",
                    "danger"
                );

                return;

            }


            resendVerificationBtn.disabled =
                true;


            resendVerificationBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm"></span>
                Sending...
            `;


            await sendEmailVerification(
                auth.currentUser
            );


            showVerificationAlert(
                "A new verification email has been sent.",
                "success"
            );

        }

        catch(error) {

            console.error(
                "Resend Error:",
                error
            );


            showVerificationAlert(
                getFirebaseErrorMessage(error),
                "danger"
            );

        }

        finally {

            resendVerificationBtn.disabled =
                false;


            resendVerificationBtn.innerHTML = `
                <i class="bi bi-arrow-repeat"></i>
                Resend Email
            `;

        }

    }
);



/* =====================================================
   REGISTRATION LOADING
===================================================== */

function setRegistrationLoading(
    loading
) {

    registerSubmitBtn.disabled =
        loading;


    if (loading) {

        registerBtnText.innerText =
            "Creating Account...";

        registerSpinner.classList.remove(
            "d-none"
        );

    } else {

        registerBtnText.innerText =
            "Create Account";

        registerSpinner.classList.add(
            "d-none"
        );

    }

}



/* =====================================================
   REGISTRATION ALERT
===================================================== */

function showRegistrationAlert(
    message,
    type
) {

    registrationAlert.className =
        `alert alert-${type}`;

    registrationAlert.innerText =
        message;

    registrationAlert.classList.remove(
        "d-none"
    );

}


function clearRegistrationAlert() {

    registrationAlert.className =
        "alert d-none";

    registrationAlert.innerText = "";

}



/* =====================================================
   VERIFICATION ALERT
===================================================== */

function showVerificationAlert(
    message,
    type
) {

    verificationAlert.className =
        `alert alert-${type}`;

    verificationAlert.innerText =
        message;

    verificationAlert.classList.remove(
        "d-none"
    );

}


function clearVerificationAlert() {

    verificationAlert.className =
        "alert d-none";

    verificationAlert.innerText = "";

}



/* =====================================================
   CLEAR REGISTRATION FORM
===================================================== */

function clearRegistrationForm() {

    registrationForm.reset();

    clearRegistrationAlert();

}



/* =====================================================
   FIREBASE ERROR TRANSLATOR
===================================================== */

function getFirebaseErrorMessage(
    error
) {

    switch(error.code) {


        case "auth/email-already-in-use":

            return "This email is already registered. Please use another email or login.";


        case "auth/invalid-email":

            return "The email address is not valid.";


        case "auth/weak-password":

            return "Password is too weak. Please use at least 6 characters.";


        case "auth/network-request-failed":

            return "Network error. Please check your internet connection.";


        case "auth/too-many-requests":

            return "Too many attempts. Please wait for some time and try again.";


        case "auth/operation-not-allowed":

            return "Email and Password authentication is not enabled in Firebase.";


        case "auth/user-disabled":

            return "This account has been disabled.";


        default:

            return "Something went wrong. Please try again.";

    }

}



/* =====================================================
   INITIAL TEST
===================================================== */

console.log(
    "Part 3 Registration System Loaded"
);

console.log(
    "Firebase Authentication:",
    auth
);

console.log(
    "Firestore:",
    db
);

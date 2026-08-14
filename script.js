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

/* ---------- Search ---------- */

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const productContainer =
    document.getElementById("productContainer");

const listingCount =
    document.getElementById("listingCount");


/* ---------- Navbar ---------- */

const registerBtn =
    document.getElementById("registerBtn");

const loginBtn =
    document.getElementById("loginBtn");

const dashboardBtn =
    document.getElementById("dashboardBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


/* ---------- Registration ---------- */

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


/* ---------- Verification ---------- */

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

const loginModalElement =
    document.getElementById("loginModal");


const registerModal =
    registerModalElement
        ? new bootstrap.Modal(registerModalElement)
        : null;

const verificationModal =
    verificationModalElement
        ? new bootstrap.Modal(verificationModalElement)
        : null;

const loginModal =
    loginModalElement
        ? new bootstrap.Modal(loginModalElement)
        : null;


/* =====================================================
   TEMPORARY REGISTRATION DATA
===================================================== */

let registeredEmail = "";

let pendingRegistration = null;


/*
   We intentionally DO NOT store password.

   Password should never be stored in:
   localStorage
   sessionStorage
   Firestore
   JavaScript variables after registration
*/


const PENDING_REGISTRATION_KEY =
    "businessList_pending_registration";


/* =====================================================
   SEARCH SYSTEM
===================================================== */

function searchProducts() {

    if (!searchInput || !productContainer) {
        return;
    }

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


        if (!parentColumn) {
            return;
        }


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


    if (listingCount) {

        listingCount.innerText =
            visibleCount;

    }

}


if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchProducts
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );

}


/* =====================================================
   OPEN REGISTER MODAL
===================================================== */

if (registerBtn) {

    registerBtn.addEventListener(
        "click",
        () => {

            clearRegistrationForm();

            if (registerModal) {
                registerModal.show();
            }

        }
    );

}


/* =====================================================
   REGISTRATION FORM SUBMIT
===================================================== */

if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            /*
               Prevent double submission
            */

            if (
                registerSubmitBtn &&
                registerSubmitBtn.disabled
            ) {

                return;

            }


            clearRegistrationAlert();


            /* ==========================================
               GET FORM VALUES
            ========================================== */

            const name =
                document.getElementById(
                    "registerName"
                )?.value.trim() || "";


            const mobile =
                document.getElementById(
                    "registerMobile"
                )?.value.trim() || "";


            const email =
                document.getElementById(
                    "registerEmail"
                )?.value.trim().toLowerCase() || "";


            const businessLocation =
                document.getElementById(
                    "businessLocation"
                )?.value.trim() || "";


            const area =
                document.getElementById(
                    "businessArea"
                )?.value.trim() || "";


            const pincode =
                document.getElementById(
                    "businessPincode"
                )?.value.trim() || "";


            const password =
                document.getElementById(
                    "registerPassword"
                )?.value || "";


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                )?.value || "";


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
               LOADING
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
                   SAVE TEMPORARY REGISTRATION DATA

                   IMPORTANT:
                   Password is NOT stored.
                ====================================== */

                pendingRegistration = {

                    uid: user.uid,

                    name: name,

                    mobile: mobile,

                    email: email,

                    businessLocation:
                        businessLocation,

                    area: area,

                    pincode: pincode

                };


                sessionStorage.setItem(

                    PENDING_REGISTRATION_KEY,

                    JSON.stringify(
                        pendingRegistration
                    )

                );


                registeredEmail =
                    email;


                /* ======================================
                   SEND VERIFICATION EMAIL
                ====================================== */

                await sendEmailVerification(user);


                console.log(
                    "Verification email sent."
                );


                /* ======================================
                   SHOW EMAIL IN VERIFICATION POPUP
                ====================================== */

                if (verificationEmail) {

                    verificationEmail.innerText =
                        email;

                }


                /* ======================================
                   CLOSE REGISTER MODAL
                ====================================== */

                if (registerModal) {

                    registerModal.hide();

                }


                /* ======================================
                   OPEN VERIFICATION MODAL
                ====================================== */

                setTimeout(() => {

                    if (verificationModal) {

                        verificationModal.show();

                    }

                }, 400);


            }

            catch(error) {

                console.error(
                    "Registration Error:",
                    error
                );


                /*
                   If account creation failed,
                   remove temporary data.
                */

                pendingRegistration = null;

                sessionStorage.removeItem(
                    PENDING_REGISTRATION_KEY
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

}


/* =====================================================
   CHECK EMAIL VERIFICATION
===================================================== */

if (checkVerificationBtn) {

    checkVerificationBtn.addEventListener(
        "click",
        async function() {


            /*
               Prevent multiple clicks
            */

            if (
                checkVerificationBtn.disabled
            ) {

                return;

            }


            clearVerificationAlert();


            try {

                /* ======================================
                   CHECK CURRENT USER
                ====================================== */

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
                   RELOAD FIREBASE USER
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


                /* ======================================
                   EMAIL NOT VERIFIED
                ====================================== */

                if (!user.emailVerified) {

                    showVerificationAlert(

                        "Your email is not verified yet. Please open the verification email and click the verification link.",

                        "warning"

                    );

                    return;

                }


                /* ======================================
                   GET PENDING REGISTRATION DATA
                ====================================== */

                let savedData =
                    pendingRegistration;


                /*
                   If JavaScript variable is empty,
                   try sessionStorage.
                */

                if (!savedData) {

                    const storedData =
                        sessionStorage.getItem(
                            PENDING_REGISTRATION_KEY
                        );


                    if (storedData) {

                        try {

                            savedData =
                                JSON.parse(
                                    storedData
                                );

                        }

                        catch(parseError) {

                            console.error(
                                "Pending registration data parse error:",
                                parseError
                            );

                        }

                    }

                }


                /* ======================================
                   DATA SAFETY CHECK
                ====================================== */

                if (!savedData) {

                    showVerificationAlert(

                        "Email verified, but registration information could not be found. Please contact support before creating another account.",

                        "danger"

                    );

                    return;

                }


                /* ======================================
                   SAVE USER PROFILE TO FIRESTORE
                ====================================== */

                await setDoc(

                    doc(
                        db,
                        "users",
                        user.uid
                    ),

                    {

                        uid:
                            user.uid,

                        name:
                            savedData.name,

                        mobile:
                            savedData.mobile,

                        email:
                            user.email,

                        businessLocation:
                            savedData.businessLocation,

                        area:
                            savedData.area,

                        pincode:
                            savedData.pincode,

                        /*
                           Future use
                        */

                        productCount:
                            0,

                        leadCount:
                            0,

                        role:
                            "businessOwner",

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }

                );


                console.log(
                    "User profile saved to Firestore."
                );


                /* ======================================
                   REGISTRATION COMPLETE
                ====================================== */

                showVerificationAlert(

                    "Email verified successfully! Your registration is complete.",

                    "success"

                );


                /*
                   Remove temporary registration data
                   only AFTER Firestore save succeeds.
                */

                pendingRegistration =
                    null;


                sessionStorage.removeItem(
                    PENDING_REGISTRATION_KEY
                );


                /* ======================================
                   CLOSE VERIFICATION
                   AND OPEN LOGIN
                ====================================== */

                setTimeout(() => {


                    if (verificationModal) {

                        verificationModal.hide();

                    }


                    /*
                       Open Login Modal if available
                    */

                    setTimeout(() => {

                        if (loginModal) {

                            loginModal.show();

                        }
                        else {

                            alert(

                                "Registration completed successfully. You can now login."

                            );

                        }

                    }, 500);


                }, 1200);


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

}


/* =====================================================
   RESEND VERIFICATION EMAIL
===================================================== */

if (resendVerificationBtn) {

    resendVerificationBtn.addEventListener(
        "click",
        async function() {


            if (
                resendVerificationBtn.disabled
            ) {

                return;

            }


            clearVerificationAlert();


            try {

                /* ======================================
                   CHECK USER
                ====================================== */

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


                /* ======================================
                   SEND AGAIN
                ====================================== */

                await sendEmailVerification(
                    auth.currentUser
                );


                showVerificationAlert(

                    "A new verification email has been sent. Please check your Inbox and Spam folder.",

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

}


/* =====================================================
   REGISTRATION LOADING
===================================================== */

function setRegistrationLoading(
    loading
) {

    if (!registerSubmitBtn) {
        return;
    }


    registerSubmitBtn.disabled =
        loading;


    if (loading) {

        if (registerBtnText) {

            registerBtnText.innerText =
                "Creating Account...";

        }


        if (registerSpinner) {

            registerSpinner.classList.remove(
                "d-none"
            );

        }

    }

    else {

        if (registerBtnText) {

            registerBtnText.innerText =
                "Create Account";

        }


        if (registerSpinner) {

            registerSpinner.classList.add(
                "d-none"
            );

        }

    }

}


/* =====================================================
   REGISTRATION ALERT
===================================================== */

function showRegistrationAlert(
    message,
    type
) {

    if (!registrationAlert) {
        return;
    }


    registrationAlert.className =
        `alert alert-${type}`;


    registrationAlert.innerText =
        message;


    registrationAlert.classList.remove(
        "d-none"
    );

}


function clearRegistrationAlert() {

    if (!registrationAlert) {
        return;
    }


    registrationAlert.className =
        "alert d-none";


    registrationAlert.innerText =
        "";

}


/* =====================================================
   VERIFICATION ALERT
===================================================== */

function showVerificationAlert(
    message,
    type
) {

    if (!verificationAlert) {
        return;
    }


    verificationAlert.className =
        `alert alert-${type}`;


    verificationAlert.innerText =
        message;


    verificationAlert.classList.remove(
        "d-none"
    );

}


function clearVerificationAlert() {

    if (!verificationAlert) {
        return;
    }


    verificationAlert.className =
        "alert d-none";


    verificationAlert.innerText =
        "";

}


/* =====================================================
   CLEAR REGISTRATION FORM
===================================================== */

function clearRegistrationForm() {

    if (!registrationForm) {
        return;
    }


    registrationForm.reset();


    clearRegistrationAlert();

}


/* =====================================================
   RESTORE PENDING REGISTRATION
===================================================== */

function restorePendingRegistration() {

    /*
       Check sessionStorage
    */

    const storedData =
        sessionStorage.getItem(
            PENDING_REGISTRATION_KEY
        );


    if (!storedData) {

        return;

    }


    try {

        pendingRegistration =
            JSON.parse(
                storedData
            );


    }

    catch(error) {

        console.error(
            "Could not restore pending registration:",
            error
        );


        sessionStorage.removeItem(
            PENDING_REGISTRATION_KEY
        );


        return;

    }


    /*
       If Firebase still has the same user,
       restore verification screen.
    */

    if (
        auth.currentUser &&
        !auth.currentUser.emailVerified &&
        pendingRegistration
    ) {

        registeredEmail =
            pendingRegistration.email;


        if (verificationEmail) {

            verificationEmail.innerText =
                pendingRegistration.email;

        }


        /*
           Automatically show verification modal
           after page refresh.
        */

        setTimeout(() => {

            if (verificationModal) {

                verificationModal.show();

            }

        }, 700);

    }

}


/* =====================================================
   FIREBASE ERROR TRANSLATOR
===================================================== */

function getFirebaseErrorMessage(
    error
) {

    switch(error.code) {


        case "auth/email-already-in-use":

            return "This email is already registered. Please login instead of creating another account.";


        case "auth/invalid-email":

            return "The email address is not valid.";


        case "auth/weak-password":

            return "Password is too weak. Please use at least 6 characters.";


        case "auth/network-request-failed":

            return "Network error. Please check your internet connection.";


        case "auth/too-many-requests":

            return "Too many attempts. Please wait for some time before trying again.";


        case "auth/operation-not-allowed":

            return "Email and Password authentication is not enabled in Firebase.";


        case "auth/user-disabled":

            return "This account has been disabled.";


        case "auth/requires-recent-login":

            return "Please login again and try this operation.";


        default:

            console.error(
                "Unknown Firebase Error:",
                error
            );

            return "Something went wrong. Please try again.";

    }

}


/* =====================================================
   INITIAL TEST
===================================================== */

console.log(
    "Part 3 Final Registration System Loaded"
);


console.log(
    "Firebase Authentication:",
    auth
);


console.log(
    "Firestore:",
    db
);


/* =====================================================
   RESTORE PENDING VERIFICATION
===================================================== */

restorePendingRegistration();

const testLoginBtn =
    document.getElementById("loginBtn");

const testLoginModalElement =
    document.getElementById("loginModal");

if (testLoginBtn && testLoginModalElement) {

    const testLoginModal =
        new bootstrap.Modal(testLoginModalElement);

    testLoginBtn.addEventListener(
        "click",
        function() {

            console.log("LOGIN BUTTON CLICKED");

            testLoginModal.show();

        }
    );

}

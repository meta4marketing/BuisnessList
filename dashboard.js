/* =====================================================
   PART 5
   FIREBASE DASHBOARD AUTHENTICATION
===================================================== */

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* =====================================================
   DASHBOARD ELEMENTS
===================================================== */

const dashboardLogoutBtn =
    document.getElementById("dashboardLogoutBtn");

const dashboardUserName =
    document.getElementById("dashboardUserName");

const dashboardUserMobile =
    document.getElementById("dashboardUserMobile");

const dashboardUserEmail =
    document.getElementById("dashboardUserEmail");

const dashboardUserLocation =
    document.getElementById("businessLocation");

const dashboardUserArea =
    document.getElementById("dashboardUserArea");

const dashboardUserPincode =
    document.getElementById("dashboardUserPincode");

const totalProducts =
    document.getElementById("totalProducts");

const totalLeads =
    document.getElementById("totalLeads");

const productCountBadge =
    document.getElementById("productCountBadge");


/* =====================================================
   CHECK FIREBASE AUTHENTICATION
===================================================== */

onAuthStateChanged(
    auth,
    async function(user) {

        console.log(
            "Dashboard Auth State:",
            user
        );


        /* =============================================
           USER NOT LOGGED IN
        ============================================= */

        if (!user) {

            console.log(
                "No authenticated user."
            );


            alert(
                "Please login first to access the dashboard."
            );


            window.location.href =
                "index.html";


            return;

        }


        /* =============================================
           USER LOGGED IN
        ============================================= */

        console.log(
            "Dashboard User UID:",
            user.uid
        );


        console.log(
            "Dashboard User Email:",
            user.email
        );


        /* =============================================
           SHOW AUTH EMAIL
        ============================================= */

        if (dashboardUserEmail) {

            dashboardUserEmail.innerText =
                user.email || "Not available";

        }


        /* =============================================
           LOAD USER PROFILE
        ============================================= */

        await loadUserProfile(
            user.uid
        );


    }
);


/* =====================================================
   LOAD USER PROFILE FROM FIRESTORE
===================================================== */

async function loadUserProfile(
    uid
) {

    try {

        console.log(
            "Loading user profile..."
        );


        /*
           IMPORTANT:

           Registration system should save
           user information inside:

           users/{uid}

        */

        const userRef =
            doc(
                db,
                "users",
                uid
            );


        const userSnapshot =
            await getDoc(
                userRef
            );


        /* =============================================
           DOCUMENT NOT FOUND
        ============================================= */

        if (!userSnapshot.exists()) {

            console.warn(
                "User profile document not found."
            );


            /*
               Email is still available from
               Firebase Authentication.

               Other fields remain as
               "Not available".
            */

            setProfileValue(
                dashboardUserName,
                "Not available"
            );


            setProfileValue(
                dashboardUserMobile,
                "Not available"
            );


            setProfileValue(
                dashboardUserLocation,
                "Not available"
            );


            setProfileValue(
                dashboardUserArea,
                "Not available"
            );


            setProfileValue(
                dashboardUserPincode,
                "Not available"
            );


            return;

        }


        /* =============================================
           GET FIRESTORE DATA
        ============================================= */

        const userData =
            userSnapshot.data();


        console.log(
            "User Profile:",
            userData
        );


        /* =============================================
           DISPLAY PROFILE
        ============================================= */

        setProfileValue(
            dashboardUserName,
            userData.name
        );


        setProfileValue(
            dashboardUserMobile,
            userData.mobile
        );


        setProfileValue(
            dashboardUserLocation,
            userData.location
        );


        setProfileValue(
            dashboardUserArea,
            userData.area
        );


        setProfileValue(
            dashboardUserPincode,
            userData.pincode
        );


    }

    catch(error) {

        console.error(
            "Error loading user profile:",
            error
        );


        /*
           Do NOT redirect here.

           User is authenticated.
           Only profile loading failed.
        */

        showProfileError();

    }

}


/* =====================================================
   SET PROFILE VALUE
===================================================== */

function setProfileValue(
    element,
    value
) {

    if (!element) {

        return;

    }


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        element.innerText =
            "Not available";

        return;

    }


    element.innerText =
        value;

}


/* =====================================================
   PROFILE ERROR
===================================================== */

function showProfileError() {

    setProfileValue(
        dashboardUserName,
        "Unable to load"
    );


    setProfileValue(
        dashboardUserMobile,
        "Unable to load"
    );


    setProfileValue(
        dashboardUserLocation,
        "Unable to load"
    );


    setProfileValue(
        dashboardUserArea,
        "Unable to load"
    );


    setProfileValue(
        dashboardUserPincode,
        "Unable to load"
    );

}


/* =====================================================
   LOGOUT
===================================================== */

if (dashboardLogoutBtn) {

    dashboardLogoutBtn.addEventListener(
        "click",
        async function() {

            try {

                dashboardLogoutBtn.disabled =
                    true;


                dashboardLogoutBtn.innerHTML = `

                    <span
                        class="spinner-border spinner-border-sm me-1"
                    ></span>

                    Logging out...

                `;


                await signOut(
                    auth
                );


                console.log(
                    "Dashboard logout successful."
                );


                window.location.href =
                    "index.html";


            }

            catch(error) {

                console.error(
                    "Dashboard Logout Error:",
                    error
                );


                alert(
                    "Logout failed. Please try again."
                );


                dashboardLogoutBtn.disabled =
                    false;


                dashboardLogoutBtn.innerHTML = `

                    <i class="bi bi-box-arrow-right"></i>

                    Logout

                `;

            }

        }
    );

}


/* =====================================================
   INITIAL PRODUCT COUNTS
===================================================== */

/*
   For now these remain zero.

   Firestore product loading will be
   added in the next part.
*/

if (totalProducts) {

    totalProducts.innerText =
        "0";

}


if (totalLeads) {

    totalLeads.innerText =
        "0";

}


if (productCountBadge) {

    productCountBadge.innerText =
        "0 Products";

}


/* =====================================================
   DASHBOARD LOADED
===================================================== */

console.log(
    "Part 5 Dashboard Firebase Loaded"
);

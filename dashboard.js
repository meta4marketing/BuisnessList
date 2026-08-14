/* =====================================================
   PART 6
   FIREBASE DASHBOARD + CLOUDINARY ADD PRODUCT
===================================================== */


/* =====================================================
   FIREBASE IMPORT
===================================================== */

import {
    auth,
    db
} from "./firebase-config.js";


import {
    onAuthStateChanged,
    signOut,
    reload
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* =====================================================
   CLOUDINARY CONFIG
===================================================== */

const CLOUDINARY_CLOUD_NAME =
    "y6kr5fn";

const CLOUDINARY_UPLOAD_PRESET =
    "businessList";


/* =====================================================
   DASHBOARD ELEMENTS
===================================================== */

const dashboardLogoutBtn =
    document.getElementById(
        "dashboardLogoutBtn"
    );


const dashboardUserName =
    document.getElementById(
        "dashboardUserName"
    );


const dashboardUserMobile =
    document.getElementById(
        "dashboardUserMobile"
    );


const dashboardUserEmail =
    document.getElementById(
        "dashboardUserEmail"
    );


const dashboardUserLocation =
    document.getElementById(
        "dashboardUserLocation"
    );


const dashboardUserArea =
    document.getElementById(
        "dashboardUserArea"
    );


const dashboardUserPincode =
    document.getElementById(
        "dashboardUserPincode"
    );


/* =====================================================
   PRODUCT ELEMENTS
===================================================== */

const addProductForm =
    document.getElementById(
        "addProductForm"
    );


const productImage =
    document.getElementById(
        "productImage"
    );


const productName =
    document.getElementById(
        "productName"
    );


const modelNumber =
    document.getElementById(
        "modelNumber"
    );


const productPrice =
    document.getElementById(
        "productPrice"
    );


const productCategory =
    document.getElementById(
        "productCategory"
    );


const productDescription =
    document.getElementById(
        "productDescription"
    );


const addProductBtn =
    document.getElementById(
        "addProductBtn"
    );


const productImagePreview =
    document.getElementById(
        "productImagePreview"
    );


const totalProducts =
    document.getElementById(
        "totalProducts"
    );


const totalLeads =
    document.getElementById(
        "totalLeads"
    );


const productCountBadge =
    document.getElementById(
        "productCountBadge"
    );


/* =====================================================
   CURRENT USER
===================================================== */

let currentUser = null;


/* =====================================================
   IMAGE PREVIEW
===================================================== */

if (productImage) {

    productImage.addEventListener(
        "change",
        function() {

            const file =
                this.files[0];


            if (!file) {

                resetImagePreview();

                return;

            }


            /* ==========================================
               FILE TYPE CHECK
            ========================================== */

            if (!file.type.startsWith("image/")) {

                alert(
                    "Please select a valid image file."
                );

                this.value = "";

                resetImagePreview();

                return;

            }


            /* ==========================================
               FILE SIZE CHECK
            ========================================== */

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Image size must be less than 5 MB."
                );

                this.value = "";

                resetImagePreview();

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    if (
                        productImagePreview
                    ) {

                        productImagePreview.innerHTML = `

                            <img
                                src="${event.target.result}"
                                alt="Product Preview"
                                class="img-fluid rounded"
                            >

                        `;

                    }

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =====================================================
   RESET IMAGE PREVIEW
===================================================== */

function resetImagePreview() {

    if (!productImagePreview) {

        return;

    }


    productImagePreview.innerHTML = `

        <div class="image-placeholder">

            <i class="bi bi-image"></i>

            <div>
                Select product image
            </div>

        </div>

    `;

}


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
    auth,
    async function(user) {

        console.log(
            "Dashboard Auth State:",
            user
        );


        /* =============================================
           NOT LOGGED IN
        ============================================= */

        if (!user) {

            alert(
                "Please login first to access the dashboard."
            );


            window.location.href =
                "index.html";


            return;

        }


        /* =============================================
           SAVE CURRENT USER
        ============================================= */

        currentUser =
            user;


        console.log(
            "Current User UID:",
            user.uid
        );


        /* =============================================
           RELOAD USER
        ============================================= */

        try {

            await reload(
                user
            );

        }

        catch(error) {

            console.error(
                "User reload error:",
                error
            );

        }


        /* =============================================
           EMAIL VERIFICATION
        ============================================= */

        if (
            !user.emailVerified
        ) {

            alert(
                "Please verify your email before using the dashboard."
            );


            await signOut(
                auth
            );


            window.location.href =
                "index.html";


            return;

        }


        /* =============================================
           SHOW EMAIL
        ============================================= */

        if (
            dashboardUserEmail
        ) {

            dashboardUserEmail.innerText =
                user.email ||
                "Not available";

        }


        /* =============================================
           LOAD PROFILE
        ============================================= */

        await loadUserProfile(
            user.uid
        );

    }
);


/* =====================================================
   LOAD USER PROFILE
===================================================== */

async function loadUserProfile(
    uid
) {

    try {

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


        if (
            !userSnapshot.exists()
        ) {

            console.warn(
                "User profile not found."
            );


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


        const userData =
            userSnapshot.data();


        console.log(
            "Complete User Data:",
            userData
        );


        /* =============================================
           NAME
        ============================================= */

        setProfileValue(
            dashboardUserName,
            userData.name
        );


        /* =============================================
           MOBILE
        ============================================= */

        setProfileValue(
            dashboardUserMobile,
            userData.mobile
        );


        /* =============================================
           LOCATION
        ============================================= */

        const businessLocation =
            userData.businessLocation ||
            userData.location ||
            userData.business_location ||
            "";


        setProfileValue(
            dashboardUserLocation,
            businessLocation
        );


        /* =============================================
           AREA
        ============================================= */

        setProfileValue(
            dashboardUserArea,
            userData.area
        );


        /* =============================================
           PINCODE
        ============================================= */

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
   ADD PRODUCT FORM
===================================================== */

if (addProductForm) {

    addProductForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            /* ==========================================
               AUTH CHECK
            ========================================== */

            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            /* ==========================================
               GET FORM VALUES
            ========================================== */

            const name =
                productName.value.trim();


            const model =
                modelNumber.value.trim();


            const price =
                productPrice.value.trim();


            const category =
                productCategory.value;


            const description =
                productDescription.value.trim();


            const imageFile =
                productImage.files[0];


            /* ==========================================
               VALIDATION
            ========================================== */

            if (!imageFile) {

                alert(
                    "Please select a product image."
                );

                return;

            }


            if (!name) {

                alert(
                    "Please enter product name."
                );

                productName.focus();

                return;

            }


            if (!model) {

                alert(
                    "Please enter model number."
                );

                modelNumber.focus();

                return;

            }


            if (!price) {

                alert(
                    "Please enter product price."
                );

                productPrice.focus();

                return;

            }


            if (!category) {

                alert(
                    "Please select a category."
                );

                productCategory.focus();

                return;

            }


            if (!description) {

                alert(
                    "Please enter product description."
                );

                productDescription.focus();

                return;

            }


            /* ==========================================
               IMAGE TYPE CHECK
            ========================================== */

            if (
                !imageFile.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image file."
                );

                return;

            }


            /* ==========================================
               IMAGE SIZE CHECK
            ========================================== */

            if (
                imageFile.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Image size must be less than 5 MB."
                );

                return;

            }


            /* ==========================================
               START LOADING
            ========================================== */

            setAddProductLoading(
                true
            );


            try {

                console.log(
                    "Starting Cloudinary upload..."
                );


                /* ======================================
                   CLOUDINARY UPLOAD URL
                ====================================== */

                const cloudinaryURL =
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


                console.log(
                    "Cloudinary URL:",
                    cloudinaryURL
                );


                /* ======================================
                   CREATE FORM DATA
                ====================================== */

                const formData =
                    new FormData();


                formData.append(
                    "file",
                    imageFile
                );


                formData.append(
                    "upload_preset",
                    CLOUDINARY_UPLOAD_PRESET
                );


                /* ======================================
                   UPLOAD TO CLOUDINARY
                ====================================== */

                const cloudinaryResponse =
                    await fetch(
                        cloudinaryURL,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                console.log(
                    "Cloudinary Status:",
                    cloudinaryResponse.status
                );


                if (
                    !cloudinaryResponse.ok
                ) {

                    const errorText =
                        await cloudinaryResponse.text();


                    console.error(
                        "Cloudinary Error:",
                        errorText
                    );


                    throw new Error(
                        "Cloudinary image upload failed."
                    );

                }


                /* ======================================
                   CLOUDINARY RESPONSE
                ====================================== */

                const cloudinaryData =
                    await cloudinaryResponse.json();


                console.log(
                    "Cloudinary Response:",
                    cloudinaryData
                );


                const imageURL =
                    cloudinaryData.secure_url;


                if (!imageURL) {

                    throw new Error(
                        "Cloudinary image URL was not returned."
                    );

                }


                console.log(
                    "Image uploaded successfully."
                );


                console.log(
                    "Image URL:",
                    imageURL
                );


                /* ======================================
                   FIRESTORE PRODUCT DATA
                ====================================== */

                const productData = {

                    ownerId:
                        currentUser.uid,

                    ownerEmail:
                        currentUser.email,

                    name:
                        name,

                    modelNumber:
                        model,

                    price:
                        Number(price),

                    category:
                        category,

                    description:
                        description,

                    imageURL:
                        imageURL,

                    leads:
                        0,

                    status:
                        "active",

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                };


                console.log(
                    "Saving product to Firestore..."
                );


                /* ======================================
                   FIRESTORE
                ====================================== */

                const productReference =
                    await addDoc(
                        collection(
                            db,
                            "products"
                        ),
                        productData
                    );


                console.log(
                    "Product saved successfully:",
                    productReference.id
                );


                /* ======================================
                   SUCCESS
                ====================================== */

                alert(
                    "Product added successfully!"
                );


                /* ======================================
                   RESET FORM
                ====================================== */

                addProductForm.reset();


                resetImagePreview();


                /* ======================================
                   UPDATE COUNTER
                ====================================== */

                updateProductCounter();

            }

            catch(error) {

                console.error(
                    "Add Product Error:",
                    error
                );


                console.error(
                    "Error Code:",
                    error.code
                );


                console.error(
                    "Error Message:",
                    error.message
                );


                alert(
                    getProductErrorMessage(
                        error
                    )
                );

            }

            finally {

                setAddProductLoading(
                    false
                );

            }

        }
    );

}


/* =====================================================
   ADD PRODUCT LOADING
===================================================== */

function setAddProductLoading(
    loading
) {

    if (!addProductBtn) {

        return;

    }


    addProductBtn.disabled =
        loading;


    if (loading) {

        addProductBtn.innerHTML = `

            <span
                class="spinner-border spinner-border-sm me-2"
            ></span>

            Uploading Product...

        `;

    }

    else {

        addProductBtn.innerHTML = `

            <i class="bi bi-plus-lg"></i>

            Add Product

        `;

    }

}


/* =====================================================
   PRODUCT ERROR MESSAGE
===================================================== */

function getProductErrorMessage(
    error
) {

    if (
        error.message ===
        "Cloudinary image upload failed."
    ) {

        return (
            "Image upload failed. " +
            "Please check your Cloudinary Upload Preset."
        );

    }


    if (
        error.message ===
        "Cloudinary image URL was not returned."
    ) {

        return (
            "Cloudinary did not return the image URL."
        );

    }


    switch(error.code) {

        case "permission-denied":

            return (
                "Firestore permission denied. " +
                "Please check Firestore Rules."
            );


        case "unavailable":

            return (
                "Firebase service is temporarily unavailable."
            );


        case "unauthenticated":

            return (
                "Please login again."
            );


        default:

            return (
                "Product could not be added. " +
                "Please check the browser console."
            );

    }

}


/* =====================================================
   PRODUCT COUNTER
===================================================== */

function updateProductCounter() {

    if (!totalProducts) {

        return;

    }


    const currentCount =
        parseInt(
            totalProducts.innerText
        ) || 0;


    const newCount =
        currentCount + 1;


    totalProducts.innerText =
        newCount;


    if (productCountBadge) {

        productCountBadge.innerText =
            `${newCount} Products`;

    }

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
   INITIAL COUNTERS
===================================================== */

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
    "Part 6 Firebase + Cloudinary Dashboard Loaded"
);

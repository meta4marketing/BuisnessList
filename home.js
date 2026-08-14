/* =====================================================
   PART 8 — HOME PAGE PRODUCT LISTING
===================================================== */

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* =====================================================
   ELEMENTS
===================================================== */

const productsContainer =
    document.getElementById(
        "homeProductsContainer"
    );


const productsLoading =
    document.getElementById(
        "homeProductsLoading"
    );


const productsEmpty =
    document.getElementById(
        "homeProductsEmpty"
    );


/* =====================================================
   PRODUCT DETAILS MODAL
===================================================== */

const detailsModalElement =
    document.getElementById(
        "homeProductDetailsModal"
    );


let detailsModal = null;


if (detailsModalElement) {

    detailsModal =
        new bootstrap.Modal(
            detailsModalElement
        );

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadHomeProducts() {

    if (!productsContainer) {

        return;

    }


    try {

        console.log(
            "Loading public products..."
        );


        const productsRef =
            collection(
                db,
                "products"
            );


        const snapshot =
            await getDocs(
                productsRef
            );


        console.log(
            "Products found:",
            snapshot.size
        );


        const products = [];


        snapshot.forEach(
            (productDoc) => {

                products.push({

                    id: productDoc.id,

                    ...productDoc.data()

                });

            }
        );


        /* =========================================
           NEWEST FIRST
        ========================================= */

        products.sort(
            (a, b) => {

                const timeA =
                    a.createdAt?.seconds || 0;

                const timeB =
                    b.createdAt?.seconds || 0;

                return timeB - timeA;

            }
        );


        productsLoading.classList.add(
            "d-none"
        );


        if (
            products.length === 0
        ) {

            productsEmpty.classList.remove(
                "d-none"
            );

            return;

        }


        productsEmpty.classList.add(
            "d-none"
        );


        await renderHomeProducts(
            products
        );


    } catch (error) {

        console.error(
            "Home Product Loading Error:",
            error
        );


        productsLoading.classList.add(
            "d-none"
        );


        productsEmpty.classList.remove(
            "d-none"
        );


        productsEmpty.innerHTML = `

            <h5>
                Unable to load products
            </h5>

            <p class="text-muted">
                Please try refreshing the page.
            </p>

        `;

    }

}


/* =====================================================
   GET BUSINESS DATA
===================================================== */

async function getBusinessData(
    ownerId
) {

    if (!ownerId) {

        return null;

    }


    try {

        /*
         * User data is stored in:
         *
         * users/{UID}
         */

        const userRef =
            collection(
                db,
                "users"
            );


        const snapshot =
            await getDocs(
                userRef
            );


        let userData = null;


        snapshot.forEach(
            (userDoc) => {

                if (
                    userDoc.id === ownerId
                ) {

                    userData =
                        userDoc.data();

                }

            }
        );


        return userData;


    } catch (error) {

        console.error(
            "Business Data Error:",
            error
        );


        return null;

    }

}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

async function renderHomeProducts(
    products
) {

    productsContainer.innerHTML = "";


    /*
     * Cache user data.
     * This prevents repeatedly reading
     * the same user information.
     */

    const userCache = {};


    for (
        const product of products
    ) {


        let business = null;


        if (
            product.ownerId
        ) {

            if (
                userCache[
                    product.ownerId
                ]
            ) {

                business =
                    userCache[
                        product.ownerId
                    ];

            } else {

                business =
                    await getBusinessData(
                        product.ownerId
                    );


                userCache[
                    product.ownerId
                ] =
                    business;

            }

        }


        /* =========================================
           BUSINESS INFORMATION
        ========================================= */

        const businessName =
            business?.businessName ||
            business?.name ||
            product.ownerName ||
            "Business";


        const mobile =
            business?.mobile ||
            product.ownerMobile ||
            "Not available";


        /*
         * Product count
         *
         * We will calculate it from the loaded
         * products for the same owner.
         */

        const productCount =
            products.filter(
                item =>
                    item.ownerId ===
                    product.ownerId
            ).length;


        const leads =
            Number(
                product.leads || 0
            );


        /* =========================================
           CARD
        ========================================= */

        const col =
            document.createElement(
                "div"
            );


        col.className =
            "col-12 col-sm-6 col-lg-4 col-xl-3";


        col.innerHTML = `

            <div
                class="card h-100 shadow-sm border-0"
            >

                <!-- IMAGE -->

                <div
                    class="text-center p-2"
                >

                    <img
                        src="${escapeHTML(
                            product.imageURL || ""
                        )}"
                        alt="${escapeHTML(
                            product.name || "Product"
                        )}"
                        class="card-img-top rounded"
                        style="
                            height:220px;
                            object-fit:contain;
                        "
                        onerror="
                            this.src='https://via.placeholder.com/400x300?text=No+Image'
                        "
                    >

                </div>


                <div class="card-body d-flex flex-column">


                    <!-- PRODUCT NAME -->

                    <h5 class="card-title fw-bold">

                        ${escapeHTML(
                            product.name ||
                            "Unnamed Product"
                        )}

                    </h5>


                    <!-- MODEL -->

                    <p class="mb-1">

                        <strong>
                            Model:
                        </strong>

                        ${escapeHTML(
                            product.modelNumber ||
                            "-"
                        )}

                    </p>


                    <!-- PRICE -->

                    <h5 class="text-primary mb-2">

                        ₹${formatPrice(
                            product.price
                        )}

                    </h5>


                    <!-- DESCRIPTION -->

                    <p
                        class="card-text text-muted"
                        style="
                            display:-webkit-box;
                            -webkit-line-clamp:3;
                            -webkit-box-orient:vertical;
                            overflow:hidden;
                        "
                    >

                        ${escapeHTML(
                            product.description ||
                            "No description available."
                        )}

                    </p>


                    <hr>


                    <!-- BUSINESS -->

                    <div class="small">

                        <strong>
                            Business:
                        </strong>

                        ${escapeHTML(
                            businessName
                        )}

                    </div>


                    <!-- MOBILE -->

                    <div class="small">

                        <strong>
                            Mobile:
                        </strong>

                        ${escapeHTML(
                            mobile
                        )}

                    </div>


                    <!-- PRODUCT COUNT -->

                    <div class="small">

                        <strong>
                            Products:
                        </strong>

                        ${productCount}

                    </div>


                    <!-- LEADS -->

                    <div class="small text-success">

                        <strong>
                            Leads received:
                        </strong>

                        ${leads}

                    </div>


                    <!-- BUTTON -->

                    <button
                        type="button"
                        class="btn btn-primary mt-auto w-100 mt-3"
                        data-product-id="${product.id}"
                    >

                        View Details

                    </button>

                </div>

            </div>

        `;


        productsContainer.appendChild(
            col
        );

    }

}


/* =====================================================
   VIEW DETAILS
===================================================== */

if (productsContainer) {

    productsContainer.addEventListener(
        "click",
        async function(event) {

            const button =
                event.target.closest(
                    "button[data-product-id]"
                );


            if (!button) {

                return;

            }


            const productId =
                button.dataset.productId;


            await showProductDetails(
                productId
            );

        }
    );

}


/* =====================================================
   SHOW PRODUCT DETAILS
===================================================== */

async function showProductDetails(
    productId
) {

    try {

        const productsRef =
            collection(
                db,
                "products"
            );


        const snapshot =
            await getDocs(
                productsRef
            );


        let product = null;


        snapshot.forEach(
            (productDoc) => {

                if (
                    productDoc.id ===
                    productId
                ) {

                    product = {

                        id: productDoc.id,

                        ...productDoc.data()

                    };

                }

            }
        );


        if (!product) {

            alert(
                "Product not found."
            );

            return;

        }


        let business = null;


        if (
            product.ownerId
        ) {

            business =
                await getBusinessData(
                    product.ownerId
                );

        }


        const businessName =
            business?.businessName ||
            business?.name ||
            product.ownerName ||
            "Business";


        const mobile =
            business?.mobile ||
            product.ownerMobile ||
            "";


        const allProductsSnapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        let productCount = 0;


        allProductsSnapshot.forEach(
            (productDoc) => {

                const data =
                    productDoc.data();


                if (
                    data.ownerId ===
                    product.ownerId
                ) {

                    productCount++;

                }

            }
        );


        /* =========================================
           FILL MODAL
        ========================================= */

        document.getElementById(
            "homeDetailsImage"
        ).src =
            product.imageURL || "";


        document.getElementById(
            "homeDetailsName"
        ).innerText =
            product.name || "Unnamed Product";


        document.getElementById(
            "homeDetailsModel"
        ).innerText =
            product.modelNumber || "-";


        document.getElementById(
            "homeDetailsPrice"
        ).innerText =
            formatPrice(
                product.price
            );


        document.getElementById(
            "homeDetailsBusiness"
        ).innerText =
            businessName;


        const mobileElement =
            document.getElementById(
                "homeDetailsMobile"
            );


        mobileElement.innerText =
            mobile || "Not available";


        if (mobile) {

            mobileElement.href =
                `tel:${mobile}`;

        } else {

            mobileElement.removeAttribute(
                "href"
            );

        }


        document.getElementById(
            "homeDetailsProductCount"
        ).innerText =
            productCount;


        document.getElementById(
            "homeDetailsLeads"
        ).innerText =
            Number(
                product.leads || 0
            );


        document.getElementById(
            "homeDetailsDescription"
        ).innerText =
            product.description ||
            "No description available.";


        detailsModal.show();


    } catch (error) {

        console.error(
            "Product Details Error:",
            error
        );


        alert(
            "Unable to load product details."
        );

    }

}


/* =====================================================
   PRICE FORMAT
===================================================== */

function formatPrice(
    price
) {

    const number =
        Number(price) || 0;


    return number.toLocaleString(
        "en-IN"
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =====================================================
   START
===================================================== */

loadHomeProducts();


console.log(
    "Part 8 Home Product Listing Loaded"
);

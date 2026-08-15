/* =====================================================
   PART 8 — HOME PAGE PRODUCT LISTING + SEARCH
===================================================== */

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* =====================================================
   GLOBAL PRODUCTS
===================================================== */

let allHomeProducts = [];


/* =====================================================
   ELEMENTS
===================================================== */

const productsContainer =
    document.getElementById("homeProductsContainer");

const productsLoading =
    document.getElementById("homeProductsLoading");

const productsEmpty =
    document.getElementById("homeProductsEmpty");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");


/* =====================================================
   DETAILS MODAL
===================================================== */

const detailsModalElement =
    document.getElementById("homeProductDetailsModal");

let detailsModal = null;

if (detailsModalElement) {

    detailsModal =
        new bootstrap.Modal(detailsModalElement);

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadHomeProducts() {

    if (!productsContainer) {

        return;

    }


    try {

        console.log("Loading public products...");


        /* =========================================
           GET PRODUCTS
        ========================================= */

        const productsRef =
            collection(db, "products");

        const snapshot =
            await getDocs(productsRef);


        console.log(
            "Products found:",
            snapshot.size
        );


        const products = [];


        snapshot.forEach((productDoc) => {

            products.push({

                id: productDoc.id,

                ...productDoc.data()

            });

        });


        /* =========================================
           SORT NEWEST FIRST
        ========================================= */

        products.sort((a, b) => {

            const timeA =
                a.createdAt?.seconds || 0;

            const timeB =
                b.createdAt?.seconds || 0;

            return timeB - timeA;

        });


        /* =========================================
           GET USER/BUSINESS DATA
        ========================================= */

        const userCache = {};


        for (const product of products) {

            if (!product.ownerId) {

                continue;

            }


            if (
                userCache[product.ownerId]
            ) {

                product.businessData =
                    userCache[product.ownerId];

                continue;

            }


            const business =
                await getBusinessData(
                    product.ownerId
                );


            userCache[product.ownerId] =
                business;


            product.businessData =
                business;

        }


        /* =========================================
           SAVE GLOBAL PRODUCTS
        ========================================= */

        allHomeProducts = products;


        /* =========================================
           LOADING OFF
        ========================================= */

        if (productsLoading) {

            productsLoading.classList.add(
                "d-none"
            );

        }


        /* =========================================
           EMPTY
        ========================================= */

        if (products.length === 0) {

            if (productsEmpty) {

                productsEmpty.classList.remove(
                    "d-none"
                );

            }

            return;

        }


        if (productsEmpty) {

            productsEmpty.classList.add(
                "d-none"
            );

        }


        /* =========================================
           RENDER
        ========================================= */

        renderHomeProducts(
            allHomeProducts
        );


    } catch (error) {

        console.error(
            "Home Product Loading Error:",
            error
        );


        if (productsLoading) {

            productsLoading.classList.add(
                "d-none"
            );

        }


        if (productsEmpty) {

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

}


/* =====================================================
   GET BUSINESS DATA
===================================================== */

async function getBusinessData(ownerId) {

    if (!ownerId) {

        return null;

    }


    try {

        const usersRef =
            collection(db, "users");


        const snapshot =
            await getDocs(usersRef);


        let userData = null;


        snapshot.forEach((userDoc) => {

            if (
                userDoc.id === ownerId
            ) {

                userData =
                    userDoc.data();

            }

        });


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

function renderHomeProducts(products) {

    if (!productsContainer) {

        return;

    }


    productsContainer.innerHTML = "";


    if (products.length === 0) {

        productsContainer.innerHTML = `

            <div class="col-12">

                <div
                    class="alert alert-warning text-center"
                >

                    No matching business or product found.

                </div>

            </div>

        `;

        return;

    }


    for (const product of products) {


        /* =========================================
           BUSINESS DATA
        ========================================= */

        const business =
            product.businessData || null;


        const businessName =
            business?.businessName ||
            business?.name ||
            product.ownerName ||
            "Business";


        const mobile =
            business?.mobile ||
            business?.phone ||
            product.ownerMobile ||
            "Not available";


        /* =========================================
           PRODUCT COUNT
        ========================================= */

        const productCount =
            allHomeProducts.filter(
                item =>
                    item.ownerId ===
                    product.ownerId
            ).length;


        /* =========================================
           LEADS
        ========================================= */

        const leads =
            Number(
                product.leads || 0
            );


        /* =========================================
           CARD COLUMN
        ========================================= */

        const col =
            document.createElement("div");


        col.className =
            "col-12 col-sm-6 col-lg-4 col-xl-3";


        /* =========================================
           CARD
        ========================================= */

        col.innerHTML = `

            <div
                class="card h-100 shadow-sm border-0"
            >


                <!-- PRODUCT IMAGE -->

                <div
                    class="text-center p-2"
                >

                    <img

                        src="${escapeHTML(
                            product.imageURL || ""
                        )}"

                        alt="${escapeHTML(
                            product.name ||
                            "Product"
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


                <!-- CARD BODY -->

                <div
                    class="card-body d-flex flex-column"
                >


                    <!-- NAME -->

                    <h5
                        class="card-title fw-bold"
                    >

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

                    <h5
                        class="text-primary mb-2"
                    >

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

                    <div class="small mb-1">

                        <strong>
                            Business:
                        </strong>

                        ${escapeHTML(
                            businessName
                        )}

                    </div>


                    <!-- MOBILE -->

                    <div class="small mb-1">

                        <strong>
                            Mobile:
                        </strong>

                        ${
                            mobile !==
                            "Not available"

                            ? `

                                <a
                                    href="tel:${escapeHTML(
                                        mobile
                                    )}"
                                    class="text-decoration-none"
                                >

                                    ${escapeHTML(
                                        mobile
                                    )}

                                </a>

                            `

                            : "Not available"
                        }

                    </div>


                    <!-- PRODUCT COUNT -->

                    <div class="small mb-1">

                        <strong>
                            Products:
                        </strong>

                        ${productCount}

                    </div>


                    <!-- LEADS -->

                    <div
                        class="small text-success"
                    >

                        <strong>
                            Leads received:
                        </strong>

                        ${leads}

                    </div>


                    <!-- VIEW BUTTON -->

                    <button

                        type="button"

                        class="
                            btn
                            btn-primary
                            mt-auto
                            w-100
                            mt-3
                        "

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
   VIEW DETAILS BUTTON
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

async function showProductDetails(productId) {

    try {

        const product =
            allHomeProducts.find(
                item =>
                    item.id === productId
            );


        if (!product) {

            alert(
                "Product not found."
            );

            return;

        }


        const business =
            product.businessData || null;


        const businessName =
            business?.businessName ||
            business?.name ||
            product.ownerName ||
            "Business";


        const mobile =
            business?.mobile ||
            business?.phone ||
            product.ownerMobile ||
            "";


        const productCount =
            allHomeProducts.filter(
                item =>
                    item.ownerId ===
                    product.ownerId
            ).length;


        /* =========================================
           IMAGE
        ========================================= */

        const image =
            document.getElementById(
                "homeDetailsImage"
            );


        if (image) {

            image.src =
                product.imageURL || "";

        }


        /* =========================================
           NAME
        ========================================= */

        document.getElementById(
            "homeDetailsName"
        ).innerText =
            product.name ||
            "Unnamed Product";


        /* =========================================
           MODEL
        ========================================= */

        document.getElementById(
            "homeDetailsModel"
        ).innerText =
            product.modelNumber ||
            "-";


        /* =========================================
           PRICE
        ========================================= */

        document.getElementById(
            "homeDetailsPrice"
        ).innerText =
            formatPrice(
                product.price
            );


        /* =========================================
           BUSINESS
        ========================================= */

        document.getElementById(
            "homeDetailsBusiness"
        ).innerText =
            businessName;


        /* =========================================
           MOBILE
        ========================================= */

        const mobileElement =
            document.getElementById(
                "homeDetailsMobile"
            );


        if (mobileElement) {

            mobileElement.innerText =
                mobile ||
                "Not available";


            if (mobile) {

                mobileElement.href =
                    `tel:${mobile}`;

            } else {

                mobileElement.removeAttribute(
                    "href"
                );

            }

        }


        /* =========================================
           PRODUCT COUNT
        ========================================= */

        document.getElementById(
            "homeDetailsProductCount"
        ).innerText =
            productCount;


        /* =========================================
           LEADS
        ========================================= */

        document.getElementById(
            "homeDetailsLeads"
        ).innerText =
            Number(
                product.leads || 0
            );


        /* =========================================
           DESCRIPTION
        ========================================= */

        document.getElementById(
            "homeDetailsDescription"
        ).innerText =
            product.description ||
            "No description available.";


        /* =========================================
           SHOW MODAL
        ========================================= */

        if (detailsModal) {

            detailsModal.show();

        }

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
   SEARCH
===================================================== */

function searchProducts() {

    if (!searchInput) {

        return;

    }


    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    /* =========================================
       EMPTY SEARCH
       SHOW EVERYTHING
    ========================================= */

    if (!keyword) {

        renderHomeProducts(
            allHomeProducts
        );

        return;

    }


    /* =========================================
       FILTER
    ========================================= */

    const filteredProducts =
        allHomeProducts.filter(
            product => {


                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();


                const model =
                    String(
                        product.modelNumber || ""
                    ).toLowerCase();


                const description =
                    String(
                        product.description || ""
                    ).toLowerCase();


                const category =
                    String(
                        product.category || ""
                    ).toLowerCase();


                const business =
                    String(
                        product.businessData
                            ?.businessName ||
                        product.businessData
                            ?.name ||
                        product.ownerName ||
                        ""
                    ).toLowerCase();


                const mobile =
                    String(
                        product.businessData
                            ?.mobile ||
                        product.businessData
                            ?.phone ||
                        product.ownerMobile ||
                        ""
                    ).toLowerCase();


                return (

                    name.includes(keyword) ||

                    model.includes(keyword) ||

                    description.includes(keyword) ||

                    category.includes(keyword) ||

                    business.includes(keyword) ||

                    mobile.includes(keyword)

                );

            }
        );


    /* =========================================
       RENDER RESULT
    ========================================= */

    renderHomeProducts(
        filteredProducts
    );

}


/* =====================================================
   SEARCH BUTTON
===================================================== */

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchProducts
    );

}


/* =====================================================
   SEARCH WHILE TYPING
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchProducts
    );


    /* =========================================
       ENTER KEY
    ========================================= */

    searchInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                searchProducts();

            }

        }
    );

}


/* =====================================================
   PRICE FORMAT
===================================================== */

function formatPrice(price) {

    const number =
        Number(price) || 0;


    return number.toLocaleString(
        "en-IN"
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =====================================================
   START APPLICATION
===================================================== */

loadHomeProducts();


console.log(
    "Part 8 Home Product Listing + Search Loaded"
);

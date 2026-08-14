/* =====================================================
   PART 7 — MY PRODUCTS
   ===================================================== */

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* =====================================================
   CLOUDINARY
   ===================================================== */

const CLOUDINARY_CLOUD_NAME = "y6kr5fnv";

const CLOUDINARY_UPLOAD_PRESET = "businessList";


/* =====================================================
   ELEMENTS
   ===================================================== */

const myProductsCount =
    document.getElementById("myProductsCount");

const productsLoading =
    document.getElementById("productsLoading");

const productsEmpty =
    document.getElementById("productsEmpty");

const productsTableWrapper =
    document.getElementById("productsTableWrapper");

const myProductsTableBody =
    document.getElementById("myProductsTableBody");


/* =====================================================
   SHOW MODAL ELEMENTS
   ===================================================== */

const showProductImage =
    document.getElementById("showProductImage");

const showProductName =
    document.getElementById("showProductName");

const showProductModel =
    document.getElementById("showProductModel");

const showProductPrice =
    document.getElementById("showProductPrice");

const showProductCategory =
    document.getElementById("showProductCategory");

const showProductDescription =
    document.getElementById("showProductDescription");


/* =====================================================
   EDIT ELEMENTS
   ===================================================== */

const editProductForm =
    document.getElementById("editProductForm");

const editProductId =
    document.getElementById("editProductId");

const editOldImageURL =
    document.getElementById("editOldImageURL");

const editProductImage =
    document.getElementById("editProductImage");

const editProductImagePreview =
    document.getElementById("editProductImagePreview");

const editProductName =
    document.getElementById("editProductName");

const editProductModel =
    document.getElementById("editProductModel");

const editProductPrice =
    document.getElementById("editProductPrice");

const editProductCategory =
    document.getElementById("editProductCategory");

const editProductDescription =
    document.getElementById("editProductDescription");

const updateProductBtn =
    document.getElementById("updateProductBtn");

const updateProductBtnText =
    document.getElementById("updateProductBtnText");

const updateProductSpinner =
    document.getElementById("updateProductSpinner");


/* =====================================================
   BOOTSTRAP MODALS
   ===================================================== */

let showProductModal = null;

let editProductModal = null;


if (document.getElementById("showProductModal")) {

    showProductModal =
        new bootstrap.Modal(
            document.getElementById("showProductModal")
        );

}


if (document.getElementById("editProductModal")) {

    editProductModal =
        new bootstrap.Modal(
            document.getElementById("editProductModal")
        );

}


/* =====================================================
   CURRENT USER
   ===================================================== */

let currentUser = null;


/* =====================================================
   AUTH STATE
   ===================================================== */

onAuthStateChanged(auth, async (user) => {

    console.log(
        "Part 7 Auth State:",
        user
    );


    if (!user) {

        console.log(
            "No logged-in user."
        );

        return;

    }


    currentUser = user;


    try {

        await loadMyProducts();

    } catch (error) {

        console.error(
            "Initial Product Loading Error:",
            error
        );

    }

});


/* =====================================================
   LOAD MY PRODUCTS
   ===================================================== */

async function loadMyProducts() {

    if (!currentUser) {

        return;

    }


    showProductsLoading();


    try {

        const productsRef =
            collection(
                db,
                "products"
            );


        const productsQuery =
            query(
                productsRef,
                where(
                    "ownerId",
                    "==",
                    currentUser.uid
                )
            );


        const snapshot =
            await getDocs(
                productsQuery
            );


        console.log(
            "My Products:",
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


        updateProductCount(
            products.length
        );


        if (products.length === 0) {

            showProductsEmpty();

            return;

        }


        renderProducts(
            products
        );


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );


        alert(
            "Products could not be loaded. Please check Firestore Rules."
        );


        showProductsEmpty();

    }

}


/* =====================================================
   RENDER PRODUCTS
   ===================================================== */

function renderProducts(products) {

    if (!myProductsTableBody) {

        return;

    }


    myProductsTableBody.innerHTML = "";


    products.forEach((product) => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <img
                    src="${escapeHTML(product.imageURL || "")}"
                    alt="Product"
                    style="
                        width:70px;
                        height:60px;
                        object-fit:contain;
                    "
                    class="rounded border"
                    onerror="this.src='https://via.placeholder.com/70x60?text=No+Image'"
                >

            </td>


            <td>

                <strong>
                    ${escapeHTML(product.name || "No Name")}
                </strong>

            </td>


            <td>

                ${escapeHTML(
                    product.modelNumber || "-"
                )}

            </td>


            <td>

                ₹${formatPrice(
                    product.price
                )}

            </td>


            <td>

                ${escapeHTML(
                    product.category || "-"
                )}

            </td>


            <td>

                <div class="d-flex flex-wrap gap-1">

                    <button
                        class="btn btn-sm btn-info text-white"
                        data-action="show"
                        data-id="${product.id}"
                    >

                        <i class="bi bi-eye"></i>
                        Show

                    </button>


                    <button
                        class="btn btn-sm btn-warning"
                        data-action="edit"
                        data-id="${product.id}"
                    >

                        <i class="bi bi-pencil"></i>
                        Edit

                    </button>


                    <button
                        class="btn btn-sm btn-danger"
                        data-action="delete"
                        data-id="${product.id}"
                    >

                        <i class="bi bi-trash"></i>
                        Delete

                    </button>

                </div>

            </td>

        `;


        myProductsTableBody.appendChild(
            row
        );

    });


    hideProductsLoading();


    productsEmpty.classList.add(
        "d-none"
    );

    productsTableWrapper.classList.remove(
        "d-none"
    );

}


/* =====================================================
   TABLE ACTION
   ===================================================== */

if (myProductsTableBody) {

    myProductsTableBody.addEventListener(
        "click",
        async function(event) {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.action;


            const productId =
                button.dataset.id;


            if (action === "show") {

                await showProduct(
                    productId
                );

            }


            if (action === "edit") {

                await openEditProduct(
                    productId
                );

            }


            if (action === "delete") {

                await deleteProduct(
                    productId
                );

            }

        }
    );

}


/* =====================================================
   SHOW PRODUCT
   ===================================================== */

async function showProduct(productId) {

    try {

        const productRef =
            doc(
                db,
                "products",
                productId
            );


        const productSnapshot =
            await getDoc(
                productRef
            );


        if (!productSnapshot.exists()) {

            alert(
                "Product not found."
            );

            return;

        }


        const product =
            productSnapshot.data();


        /* =========================================
           SECURITY CHECK
        ========================================= */

        if (
            product.ownerId !==
            currentUser.uid
        ) {

            alert(
                "You are not allowed to view this product."
            );

            return;

        }


        showProductImage.src =
            product.imageURL || "";


        showProductName.innerText =
            product.name || "No Name";


        showProductModel.innerText =
            product.modelNumber || "-";


        showProductPrice.innerText =
            formatPrice(product.price);


        showProductCategory.innerText =
            product.category || "-";


        showProductDescription.innerText =
            product.description || "No description available.";


        showProductModal.show();


    } catch (error) {

        console.error(
            "Show Product Error:",
            error
        );


        alert(
            "Unable to load product."
        );

    }

}


/* =====================================================
   OPEN EDIT PRODUCT
   ===================================================== */

async function openEditProduct(productId) {

    try {

        const productRef =
            doc(
                db,
                "products",
                productId
            );


        const productSnapshot =
            await getDoc(
                productRef
            );


        if (!productSnapshot.exists()) {

            alert(
                "Product not found."
            );

            return;

        }


        const product =
            productSnapshot.data();


        /* =========================================
           SECURITY CHECK
        ========================================= */

        if (
            product.ownerId !==
            currentUser.uid
        ) {

            alert(
                "You are not allowed to edit this product."
            );

            return;

        }


        editProductId.value =
            productId;


        editOldImageURL.value =
            product.imageURL || "";


        editProductImagePreview.src =
            product.imageURL || "";


        editProductName.value =
            product.name || "";


        editProductModel.value =
            product.modelNumber || "";


        editProductPrice.value =
            product.price || "";


        editProductCategory.value =
            product.category || "";


        editProductDescription.value =
            product.description || "";


        editProductImage.value =
            "";


        editProductModal.show();


    } catch (error) {

        console.error(
            "Open Edit Error:",
            error
        );


        alert(
            "Unable to open edit window."
        );

    }

}


/* =====================================================
   EDIT IMAGE PREVIEW
===================================================== */

if (editProductImage) {

    editProductImage.addEventListener(
        "change",
        function() {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image."
                );

                this.value = "";

                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Image must be less than 5 MB."
                );

                this.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    editProductImagePreview.src =
                        event.target.result;

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =====================================================
   UPDATE PRODUCT
   ===================================================== */

if (editProductForm) {

    editProductForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            const productId =
                editProductId.value;


            const name =
                editProductName.value.trim();


            const model =
                editProductModel.value.trim();


            const price =
                editProductPrice.value.trim();


            const category =
                editProductCategory.value;


            const description =
                editProductDescription.value.trim();


            if (!name) {

                alert(
                    "Please enter product name."
                );

                return;

            }


            if (!model) {

                alert(
                    "Please enter model number."
                );

                return;

            }


            if (!price) {

                alert(
                    "Please enter price."
                );

                return;

            }


            if (!category) {

                alert(
                    "Please select category."
                );

                return;

            }


            if (!description) {

                alert(
                    "Please enter description."
                );

                return;

            }


            setUpdateLoading(
                true
            );


            try {

                const productRef =
                    doc(
                        db,
                        "products",
                        productId
                    );


                const existingSnapshot =
                    await getDoc(
                        productRef
                    );


                if (
                    !existingSnapshot.exists()
                ) {

                    throw new Error(
                        "Product not found."
                    );

                }


                const existingProduct =
                    existingSnapshot.data();


                if (
                    existingProduct.ownerId !==
                    currentUser.uid
                ) {

                    throw new Error(
                        "Unauthorized product update."
                    );

                }


                let imageURL =
                    existingProduct.imageURL || "";


                /* =====================================
                   NEW IMAGE
                ===================================== */

                const newImageFile =
                    editProductImage.files[0];


                if (newImageFile) {

                    console.log(
                        "Uploading new image to Cloudinary..."
                    );


                    imageURL =
                        await uploadImageToCloudinary(
                            newImageFile
                        );


                    console.log(
                        "New image uploaded:",
                        imageURL
                    );

                }


                /* =====================================
                   UPDATE FIRESTORE
                ===================================== */

                await updateDoc(
                    productRef,
                    {

                        name: name,

                        modelNumber: model,

                        price: Number(price),

                        category: category,

                        description: description,

                        imageURL: imageURL,

                        updatedAt:
                            serverTimestamp()

                    }
                );


                alert(
                    "Product updated successfully!"
                );


                editProductModal.hide();


                await loadMyProducts();


            } catch (error) {

                console.error(
                    "Update Product Error:",
                    error
                );


                alert(
                    error.message ||
                    "Product update failed."
                );

            } finally {

                setUpdateLoading(
                    false
                );

            }

        }
    );

}


/* =====================================================
   CLOUDINARY IMAGE UPLOAD
   ===================================================== */

async function uploadImageToCloudinary(
    imageFile
) {

    const uploadURL =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


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


    const response =
        await fetch(
            uploadURL,
            {

                method: "POST",

                body: formData

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "Cloudinary Error:",
            data
        );


        throw new Error(
            data.error?.message ||
            "Image upload failed."
        );

    }


    return data.secure_url;

}


/* =====================================================
   DELETE PRODUCT
   ===================================================== */

async function deleteProduct(
    productId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const productRef =
            doc(
                db,
                "products",
                productId
            );


        const productSnapshot =
            await getDoc(
                productRef
            );


        if (!productSnapshot.exists()) {

            alert(
                "Product not found."
            );

            return;

        }


        const product =
            productSnapshot.data();


        /* =========================================
           SECURITY CHECK
        ========================================= */

        if (
            product.ownerId !==
            currentUser.uid
        ) {

            alert(
                "You are not allowed to delete this product."
            );

            return;

        }


        await deleteDoc(
            productRef
        );


        alert(
            "Product deleted successfully!"
        );


        await loadMyProducts();


    } catch (error) {

        console.error(
            "Delete Product Error:",
            error
        );


        alert(
            "Product could not be deleted."
        );

    }

}


/* =====================================================
   UPDATE LOADING
   ===================================================== */

function setUpdateLoading(
    loading
) {

    if (!updateProductBtn) {

        return;

    }


    updateProductBtn.disabled =
        loading;


    if (loading) {

        updateProductBtnText.innerText =
            "Updating...";


        updateProductSpinner.classList.remove(
            "d-none"
        );

    } else {

        updateProductBtnText.innerText =
            "Update Product";


        updateProductSpinner.classList.add(
            "d-none"
        );

    }

}


/* =====================================================
   PRODUCT COUNT
   ===================================================== */

function updateProductCount(
    count
) {

    if (!myProductsCount) {

        return;

    }


    myProductsCount.innerText =
        `${count} ${
            count === 1
                ? "Product"
                : "Products"
        }`;

}


/* =====================================================
   LOADING
   ===================================================== */

function showProductsLoading() {

    productsLoading.classList.remove(
        "d-none"
    );

    productsEmpty.classList.add(
        "d-none"
    );

    productsTableWrapper.classList.add(
        "d-none"
    );

}


/* =====================================================
   EMPTY
   ===================================================== */

function showProductsEmpty() {

    productsLoading.classList.add(
        "d-none"
    );

    productsEmpty.classList.remove(
        "d-none"
    );

    productsTableWrapper.classList.add(
        "d-none"
    );

}


/* =====================================================
   HIDE LOADING
   ===================================================== */

function hideProductsLoading() {

    productsLoading.classList.add(
        "d-none"
    );

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
   PART 7 LOADED
   ===================================================== */

console.log(
    "Part 7 My Products Loaded"
);

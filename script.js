import {
    auth,
    db,
    storage
} from "./firebase-config.js";

console.log("Firebase connected successfully");

console.log("Auth:", auth);
console.log("Firestore:", db);
console.log("Storage:", storage);

/* =========================
   SEARCH SYSTEM
========================= */

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const productContainer = document.getElementById("productContainer");
const listingCount = document.getElementById("listingCount");


function searchProducts() {

    const searchValue = searchInput.value
        .trim()
        .toLowerCase();

    const cards = productContainer.querySelectorAll(
        ".product-card"
    );

    let visibleCount = 0;


    cards.forEach(card => {

        const cardText = card.innerText.toLowerCase();

        const parentColumn = card.closest(
            ".col-12"
        );


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


    listingCount.innerText = visibleCount;

}


/* Search button */

searchBtn.addEventListener(
    "click",
    searchProducts
);


/* Search while typing */

searchInput.addEventListener(
    "input",
    searchProducts
);

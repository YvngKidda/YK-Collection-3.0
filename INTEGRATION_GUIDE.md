# Frontend Integration Guide

This file shows how to integrate the Neon database API into your existing frontend.

## Step 1: Include the API Module

In your `index.html`, add this script BEFORE `script.js`:

```html
<script src="api.js"></script>
<script src="script.js"></script>
```

## Step 2: Update Admin Password Submission

Replace your `submitAdminPass()` function in `script.js` with:

```javascript
async function submitAdminPass() {
  const password = document.getElementById("adminPassInput").value;

  if (!password) {
    showToastError("Please enter a password");
    return;
  }

  const success = await loginAdmin(password);

  if (success) {
    closeAdminLogin();
    document.getElementById("adminOverlay").style.display = "none";
    go("admin");
    reloadAdminPanel();
    showToast("Admin login successful!", "success");
  } else {
    document.getElementById("adminPassErr").style.display = "block";
    document.getElementById("adminPassInput").value = "";
  }
}
```

## Step 3: Update Add Product Function

Replace `addAdminProduct()` with:

```javascript
async function addAdminProduct() {
  if (!isAdminLoggedIn()) {
    showToast("Please log in as admin", "error");
    return;
  }

  const name = document.getElementById("aName").value.trim();
  const category = document.getElementById("aCat").value;
  const price = parseFloat(document.getElementById("aPrice").value);
  const oldPrice =
    parseFloat(document.getElementById("aOldPrice").value) || null;
  const badge = document.getElementById("aBadge").value;
  const sizesStr = document.getElementById("aSizes").value.trim();
  const color = document.getElementById("aColor").value.trim();
  const material = document.getElementById("aMaterial").value.trim();
  const emoji = document.getElementById("aEmoji").value.trim();
  const imageUrl = document.getElementById("aImgUrl").value.trim();
  const gallery = document
    .getElementById("aImgGallery")
    .value.trim()
    .split("\n")
    .filter((u) => u);
  const description = document.getElementById("aDesc").value.trim();

  if (!name || !category || !price || !sizesStr) {
    showToast("Please fill in all required fields", "error");
    return;
  }

  const sizes = sizesStr
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s);

  const productData = {
    name,
    category,
    price,
    old_price: oldPrice,
    badge: badge || null,
    sizes: sizes.join(","),
    color,
    material,
    emoji,
    image_url: imageUrl,
    gallery_images: gallery,
    description,
  };

  const product = await addProductToDB(productData);

  if (product) {
    clearAdminForm();
    reloadAdminPanel();
  }
}
```

## Step 4: Update Product Editing

Replace `saveEditProduct()` with:

```javascript
async function saveEditProduct() {
  if (!isAdminLoggedIn()) {
    showToast("Please log in as admin", "error");
    return;
  }

  const id = currentEditingProduct;
  const name = document.getElementById("eName").value.trim();
  const category = document.getElementById("eCat").value;
  const price = parseFloat(document.getElementById("ePrice").value);
  const oldPrice =
    parseFloat(document.getElementById("eOldPrice").value) || null;
  const badge = document.getElementById("eBadge").value;
  const sizesStr = document.getElementById("eSizes").value.trim();
  const color = document.getElementById("eColor").value.trim();
  const material = document.getElementById("eMaterial").value.trim();
  const emoji = document.getElementById("eEmoji").value.trim();
  const imageUrl = document.getElementById("eImgUrl").value.trim();
  const gallery = document
    .getElementById("eImgGallery")
    .value.trim()
    .split("\n")
    .filter((u) => u);
  const description = document.getElementById("eDesc").value.trim();

  if (!name || !category || !price || !sizesStr) {
    showToast("Please fill in all required fields", "error");
    return;
  }

  const sizes = sizesStr
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s);

  const productData = {
    name,
    category,
    price,
    old_price: oldPrice,
    badge: badge || null,
    sizes: sizes.join(","),
    color,
    material,
    emoji,
    image_url: imageUrl,
    gallery_images: gallery,
    description,
  };

  await updateProductInDB(id, productData);
  closeEditModal();
  reloadAdminPanel();
}
```

## Step 5: Update Delete Product Function

Replace `deleteProduct()` with:

```javascript
async function deleteProduct(id) {
  if (!isAdminLoggedIn()) {
    showToast("Please log in as admin", "error");
    return;
  }

  if (confirm("Are you sure you want to delete this product?")) {
    const success = await deleteProductFromDB(id);
    if (success) {
      reloadAdminPanel();
    }
  }
}
```

## Step 6: Update Product Listing

Replace `loadAdminProducts()` with:

```javascript
async function loadAdminProducts() {
  if (!isAdminLoggedIn()) return;

  const products = await fetchProductsFromDB();
  const container = document.getElementById("adminProdList");

  if (!products || products.length === 0) {
    container.innerHTML =
      '<div class="admin-no-prod">No products yet. Add your first product above!</div>';
    return;
  }

  container.innerHTML = products
    .map(
      (p) => `
    <div class="admin-prod-item">
      <div class="admin-prod-info">
        <div class="admin-prod-name">${p.name}</div>
        <div class="admin-prod-meta">${p.category} • ₦${p.price.toLocaleString()}</div>
      </div>
      <div class="admin-prod-actions">
        <button class="admin-edit-btn" onclick="openEditModal(${p.id})">✎ Edit</button>
        <button class="admin-del-btn" onclick="deleteProduct(${p.id})">🗑 Delete</button>
      </div>
    </div>
  `,
    )
    .join("");
}
```

## Step 7: Update Shop Page Products Loading

Update your `go('shop')` or product loading function:

```javascript
async function loadShopProducts(category = null) {
  const products = await fetchProductsFromDB(category);
  const grid = document.getElementById("prodGrid");

  if (!products || products.length === 0) {
    grid.innerHTML = '<div class="no-products">No products found</div>';
    return;
  }

  grid.innerHTML = products
    .map(
      (p) => `
    <div class="prod-card" onclick="viewProduct(${p.id})">
      <div class="prod-img" style="background:url('${p.image_url}') center/cover">${p.emoji || "📦"}</div>
      ${p.badge ? `<div class="prod-badge">${p.badge}</div>` : ""}
      <div class="prod-info">
        <div class="prod-name">${p.name}</div>
        <div class="prod-price">
          ₦${p.price.toLocaleString()}
          ${p.old_price ? `<strike>₦${p.old_price.toLocaleString()}</strike>` : ""}
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}
```

## Step 8: Update Contact Form Submission

```javascript
async function submitForm() {
  const fn = document.getElementById("fn").value.trim();
  const ln = document.getElementById("ln").value.trim();
  const em = document.getElementById("em").value.trim();
  const ms = document.getElementById("ms").value.trim();

  if (!fn || !ln || !em || !ms) {
    showToast("Please fill in all fields", "error");
    return;
  }

  const success = await submitContactMessageToDB({
    first_name: fn,
    last_name: ln,
    email: em,
    message: ms,
  });

  if (success) {
    document.getElementById("cfWrap").style.display = "none";
    document.getElementById("fOk").style.display = "flex";
    setTimeout(() => {
      document.getElementById("cfWrap").style.display = "block";
      document.getElementById("fOk").style.display = "none";
      document.getElementById("fn").value = "";
      document.getElementById("ln").value = "";
      document.getElementById("em").value = "";
      document.getElementById("ms").value = "";
    }, 3000);
  }
}
```

## Step 9: Update Feedback Submission

```javascript
async function submitComplaint() {
  const name = document.getElementById("compName").value.trim();
  const message = document.getElementById("compMsg").value.trim();
  const type =
    document.querySelector(".comp-tab.active").dataset.type || "complaint";

  if (!name || !message) {
    showToast("Please fill in all fields", "error");
    return;
  }

  const success = await submitFeedbackToDB({
    name,
    message,
    type,
    email: null,
  });

  if (success) {
    document.getElementById("compFormWrap").style.display = "none";
    document.getElementById("compOk").style.display = "flex";
  }
}

function resetCompForm() {
  document.getElementById("compFormWrap").style.display = "block";
  document.getElementById("compOk").style.display = "none";
  document.getElementById("compName").value = "";
  document.getElementById("compMsg").value = "";
}
```

## Step 10: Update Review Submission

```javascript
async function submitReview() {
  const productId = currentViewingProduct;
  const name = document.getElementById("reviewName").value.trim();
  const rating =
    parseInt(document.querySelector(".star-pick.active")?.textContent) || 0;
  const text = document.getElementById("reviewText").value.trim();

  if (!name || rating === 0) {
    showToast("Please enter your name and rating", "error");
    return;
  }

  const review = await submitReviewToDB(productId, {
    customer_name: name,
    rating,
    comment: text,
  });

  if (review) {
    closeReviewForm();
    loadProductReviews(productId);
  }
}
```

## Step 11: Update Logout Function

```javascript
function logoutAdmin() {
  logoutAdmin(); // from api.js
  go("shop");
  showToast("Logged out", "success");
}
```

## Testing Locally

1. Start your server:

```bash
npm run dev
```

2. Open browser to `http://localhost:3000`

3. Test:
   - Add products in admin panel
   - View products on shop page
   - Submit reviews
   - Submit feedback
   - Submit contact messages

## Common Issues

**API calls failing?**

- Ensure server is running on port 3000
- Check browser console for network errors
- Verify CORS settings in server.js

**Database connection error?**

- Check DATABASE_URL in .env
- Verify Neon project is active
- Test connection in Neon dashboard

**Admin login not working?**

- Verify password in .env
- Check JWT_SECRET is set
- Look at server logs

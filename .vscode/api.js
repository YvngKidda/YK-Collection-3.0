// API Configuration
const API_URL = (typeof process === 'undefined' || process.env.NODE_ENV !== 'production')
  ? 'http://localhost:3000'
  : window.location.origin;

// Admin token storage
let adminToken = localStorage.getItem('adminToken') || null;

// ===== PRODUCT API CALLS =====

async function fetchProductsFromDB(category = null) {
  try {
    const url = category 
      ? `${API_URL}/api/products?category=${category}`
      : `${API_URL}/api/products`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    showToast('Error loading products', 'error');
    return [];
  }
}

async function addProductToDB(productData) {
  try {
    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) throw new Error('Failed to add product');
    const product = await response.json();
    showToast('Product added successfully!', 'success');
    return product;
  } catch (error) {
    console.error('Error adding product:', error);
    showToast('Error adding product', 'error');
    return null;
  }
}

async function updateProductInDB(id, productData) {
  try {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) throw new Error('Failed to update product');
    const product = await response.json();
    showToast('Product updated successfully!', 'success');
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    showToast('Error updating product', 'error');
    return null;
  }
}

async function deleteProductFromDB(id) {
  try {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete product');
    showToast('Product deleted successfully!', 'success');
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('Error deleting product', 'error');
    return false;
  }
}

// ===== ORDER API CALLS =====

async function submitOrderToDB(orderData) {
  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) throw new Error('Failed to submit order');
    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Error submitting order:', error);
    showToast('Error submitting order', 'error');
    return null;
  }
}

async function fetchOrdersFromDB() {
  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// ===== REVIEW API CALLS =====

async function fetchReviewsFromDB(productId) {
  try {
    const response = await fetch(`${API_URL}/api/products/${productId}/reviews`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

async function submitReviewToDB(productId, reviewData) {
  try {
    const response = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) throw new Error('Failed to submit review');
    const review = await response.json();
    showToast('Review submitted successfully!', 'success');
    return review;
  } catch (error) {
    console.error('Error submitting review:', error);
    showToast('Error submitting review', 'error');
    return null;
  }
}

// ===== FEEDBACK API CALLS =====

async function submitFeedbackToDB(feedbackData) {
  try {
    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedbackData)
    });
    
    if (!response.ok) throw new Error('Failed to submit feedback');
    return await response.json();
  } catch (error) {
    console.error('Error submitting feedback:', error);
    showToast('Error submitting feedback', 'error');
    return null;
  }
}

async function fetchFeedbackFromDB() {
  try {
    const response = await fetch(`${API_URL}/api/feedback`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return await response.json();
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }
}

// ===== CONTACT API CALLS =====

async function submitContactMessageToDB(contactData) {
  try {
    const response = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });
    
    if (!response.ok) throw new Error('Failed to submit message');
    return await response.json();
  } catch (error) {
    console.error('Error submitting contact message:', error);
    showToast('Error submitting message', 'error');
    return null;
  }
}

async function fetchContactMessagesFromDB() {
  try {
    const response = await fetch(`${API_URL}/api/contact`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return [];
  }
}

// ===== ADMIN AUTH =====

async function loginAdmin(password) {
  try {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) throw new Error('Invalid password');
    const data = await response.json();
    adminToken = data.token;
    localStorage.setItem('adminToken', adminToken);
    return true;
  } catch (error) {
    console.error('Error logging in:', error);
    return false;
  }
}

function logoutAdmin() {
  adminToken = null;
  localStorage.removeItem('adminToken');
}

function isAdminLoggedIn() {
  return adminToken !== null;
}

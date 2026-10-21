const configuredApiUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error('VITE_API_URL must be set for production builds.');
}

export const API_BASE_URL = (configuredApiUrl || 'http://localhost:3000/api').replace(/\/$/, '');

export const api = {
  // Fetch all products with optional query parameters
  async fetchProducts(params = {}) {
    try {
      const queryString = new URLSearchParams();
      
      // Handle search
      if (params.search) {
        queryString.append('search', params.search);
      }
      
      // Handle filter (categories, price range, rating)
      if (params.filter) {
        queryString.append('filter', JSON.stringify(params.filter));
      }
      
      // Handle sort
      if (params.sort) {
        queryString.append('sort', params.sort);
      }
      
      const url = `${API_BASE_URL}/product${queryString.toString() ? '?' + queryString.toString() : ''}`;
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Fetch a single product by ID
  async fetchProductById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/product/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Fetch reviews for a product
  async fetchReviews(productId) {
    const response = await fetch(`${API_BASE_URL}/review?product=${encodeURIComponent(productId)}`, {
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Unable to load reviews (${response.status})`);
    }
    return data;
  },

  // Add a review for a product
  async addReview(productId, review) {
    const response = await fetch(`${API_BASE_URL}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...review, product: productId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Unable to add review (${response.status})`);
    }
    return data;
  },

  // Authentication APIs
  
  // Signup - Create new user account
  async signup(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  // Login - Authenticate user
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Forgot Password - Request OTP for password reset
  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgotPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  // Reset Password - Reset password with OTP
  async resetPassword(userId, resetData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resetPassword/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Logout - End user session
  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
};

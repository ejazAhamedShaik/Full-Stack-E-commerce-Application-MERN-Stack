import { useState, useEffect } from 'react';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Furniture',
  'Stationery',
  'Accessories',
  'Travel',
  'Computers',
  'Entertainment',
  'Photography',
  "Men's Fashion",
  'Living Room',
  'Dining Room',
  'Bedroom',
  'Study Room',
];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters and search whenever they change
  useEffect(() => {
    applyFiltersAndSort();
  }, [products, searchQuery, selectedCategories, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchProducts();
      setProducts(data.data || data);
    } catch (err) {
      setError('Failed to load products. Please make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...products];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((product) =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        product.categories.some((cat) => selectedCategories.includes(cat))
      );
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => {
        const priceA = a.discount ? a.price - a.discount : a.price;
        const priceB = b.discount ? b.price - b.discount : b.price;
        return priceA - priceB;
      });
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => {
        const priceA = a.discount ? a.price - a.discount : a.price;
        const priceB = b.discount ? b.price - b.discount : b.price;
        return priceB - priceA;
      });
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.productName.localeCompare(b.productName));
    }

    setFilteredProducts(result);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSortBy('');
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Our Products</h1>
        <p className="subtitle">Discover amazing products at great prices</p>
      </div>

      <div className="controls-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="controls-right">
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span>Filters</span>
            {selectedCategories.length > 0 && (
              <span className="filter-count">{selectedCategories.length}</span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="">Sort By</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {(searchQuery || selectedCategories.length > 0 || sortBy) && (
        <div className="active-filters">
          <span>Active filters:</span>
          {searchQuery && <span className="filter-tag">Search: {searchQuery}</span>}
          {selectedCategories.map((cat) => (
            <span key={cat} className="filter-tag">
              {cat}
              <button onClick={() => handleCategoryToggle(cat)}>✕</button>
            </span>
          ))}
          {sortBy && <span className="filter-tag">Sort: {sortBy}</span>}
          <button className="clear-all" onClick={clearFilters}>
            Clear All
          </button>
        </div>
      )}

      <div className="content-wrapper">
        {showFilters && (
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3>Categories</h3>
              <div className="category-list">
                {CATEGORIES.map((category) => (
                  <label key={category} className="category-item">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        <main className="products-main">
          <div className="results-info">
            <p>{filteredProducts.length} products found</p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-results">
              <p>No products found matching your criteria.</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;

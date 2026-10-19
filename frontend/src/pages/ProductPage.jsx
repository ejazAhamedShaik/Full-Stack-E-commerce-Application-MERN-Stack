import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import './ProductPage.css';

const reviewListFrom = (data) => {
  if (Array.isArray(data)) return data;
  return data?.reviews || data?.data?.reviews || data?.data || [];
};

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [notice, setNotice] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    setReviewError('');
    try {
      const data = await api.fetchReviews(id);
      setReviews(reviewListFrom(data));
    } catch (loadError) {
      setReviewError(loadError.message || 'Unable to load reviews.');
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.fetchProductById(id)
      .then((data) => {
        if (active) setProduct(data.product || data.data || data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Unable to load product.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    loadReviews();
    return () => { active = false; };
  }, [id, loadReviews]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setReviewError('');
    setNotice('');
    try {
      await api.addReview(id, { rating: Number(rating), review: comment.trim() });
      setComment('');
      setNotice('Your review has been added.');
      await loadReviews();
    } catch (submitError) {
      setReviewError(submitError.message || 'Unable to add review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="product-detail-page"><p>Loading product…</p></div>;
  if (error) return <div className="product-detail-page"><p role="alert">{error}</p><Link to="/products">Back to products</Link></div>;
  if (!product) return <div className="product-detail-page"><p>Product not found.</p><Link to="/products">Back to products</Link></div>;

  const price = Number(product.discount ? product.price - product.discount : product.price);

  return (
    <div className="product-detail-page">
      <Link className="back-to-products" to="/products">← Back to products</Link>
      <section className="product-detail">
        <div className="product-detail-image">
          {product.images?.[0] ? <img src={product.images[0]} alt={product.productName} /> : <span>No image available</span>}
        </div>
        <div className="product-detail-info">
          {product.brand && <p className="product-detail-brand">{product.brand}</p>}
          <h1>{product.productName}</h1>
          <p className="product-detail-rating">{'★'.repeat(Math.round(product.averageRating || 0)) || '☆'} <span>{product.averageRating ? Number(product.averageRating).toFixed(1) : 'No rating yet'}</span></p>
          <p className="product-detail-price">₹{price.toLocaleString()}</p>
          <p>{product.description}</p>
          <p>{product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}</p>
          <button className="product-detail-add" onClick={() => addToCart(product)} disabled={!product.stock}>Add to cart</button>
        </div>
      </section>

      <section className="reviews-section">
        <h2>Customer reviews</h2>
        <form className="review-form" onSubmit={handleSubmit}>
          <label htmlFor="review-rating">Rating</label>
          <select id="review-rating" value={rating} onChange={(event) => setRating(event.target.value)}>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} {value === 1 ? 'star' : 'stars'}</option>)}
          </select>
          <label htmlFor="review-comment">Your review</label>
          <textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} required minLength={2} maxLength={1000} rows={4} placeholder="Share your experience with this product" />
          <button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Add review'}</button>
        </form>
        {notice && <p role="status" className="review-notice">{notice}</p>}
        {reviewError && <p role="alert" className="review-error">{reviewError}</p>}
        {reviewsLoading ? <p>Loading reviews…</p> : reviews.length === 0 ? <p>No reviews yet. Be the first to review this product.</p> : (
          <ul className="reviews-list">
            {reviews.map((review, index) => (
              <li className="review-card" key={review._id || review.id || index}>
                <p className="review-stars" aria-label={`${review.rating || 0} out of 5 stars`}>{'★'.repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))}{'☆'.repeat(5 - Math.max(0, Math.min(5, Number(review.rating) || 0)))}</p>
                <p>{review.comment || review.text || review.review}</p>
                <p className="review-author">{review.user?.name || review.userName || review.name || 'Customer'}{review.createdAt ? ` · ${new Date(review.createdAt).toLocaleDateString()}` : ''}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ProductPage;

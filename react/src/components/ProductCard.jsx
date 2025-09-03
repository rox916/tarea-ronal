import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, addToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, quantity);
    // Mostrar notificación
    alert(`${product.name} añadido al carrito`);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image-container">
          <img
            src={product.image}
            alt={product.name}
            className={`product-image ${isHovered ? 'hovered' : ''}`}
          />
          {/* Badge de categoría */}
          <div className="product-category-badge">
            {product.category === 'electronics' && 'Electrónica'}
            {product.category === 'clothing' && 'Ropa'}
            {product.category === 'home' && 'Hogar'}
            {product.category === 'beauty' && 'Belleza'}
          </div>
        </div>

        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <div>
            <span className="product-price">${product.price.toFixed(2)}</span>
          </div>

          {isHovered && (
            <div className="product-actions" onClick={(e) => e.stopPropagation()}>
              <div className="quantity-control">
                <button
                  className="quantity-button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (quantity > 1) setQuantity(quantity - 1);
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="quantity-input"
                />
                <button
                  className="quantity-button"
                  onClick={(e) => {
                    e.preventDefault();
                    setQuantity(quantity + 1);
                  }}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="add-to-cart-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                Añadir
              </button>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
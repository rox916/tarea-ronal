import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = ({ cart, removeFromCart, updateQuantity, cartTotal }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  if (isLoading) {
    return (
      <div className="cart-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">Tu carrito</h1>
        <div className="cart-empty">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="cart-empty-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="cart-empty-title">Tu carrito está vacío</h2>
          <p className="cart-empty-message">
            Parece que aún no has añadido ningún producto a tu carrito.
          </p>
          <Link
            to="/"
            className="cart-empty-button"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Tu carrito</h1>

      <div className="cart-layout">
        {/* Lista de productos */}
        <div className="cart-items-container">
          <div className="cart-items-card">
            <div className="cart-items-header">
              <h2 className="cart-items-title">Productos ({cart.length})</h2>
            </div>

            <ul className="cart-items-list">
              {cart.map((item) => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-image-container">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                    />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-info">
                      <div className="cart-item-header">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <p className="cart-item-category">
                          {item.category === 'electronics' && 'Electrónica'}
                          {item.category === 'clothing' && 'Ropa'}
                          {item.category === 'home' && 'Hogar'}
                          {item.category === 'beauty' && 'Belleza'}
                        </p>
                      </div>
                      <div className="cart-item-price-container">
                        <span className="cart-item-price">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <div className="cart-item-quantity">
                        <button
                          className="cart-quantity-btn cart-quantity-decrease"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="cart-quantity-icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <span className="cart-quantity-value">{item.quantity}</span>
                        <button
                          className="cart-quantity-btn cart-quantity-increase"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="cart-quantity-icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        <span className="cart-item-subtotal-text">
                          Subtotal: <span className="cart-item-subtotal-value">${(item.price * item.quantity).toFixed(2)}</span>
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="cart-item-remove-btn"
                          aria-label="Eliminar producto"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="cart-item-remove-icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-continue-shopping">
              <Link
                to="/"
                className="cart-continue-link"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="cart-continue-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="cart-summary-container">
          <div className="cart-summary-card">
            <h2 className="cart-summary-title">Resumen del pedido</h2>

            <div className="cart-summary-details">
              <div className="cart-summary-row">
                <span className="cart-summary-label">Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} productos)</span>
                <span className="cart-summary-value">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span className="cart-summary-label">Envío</span>
                <span className="cart-summary-value">{cartTotal >= 50 ? 'Gratis' : '$4.99'}</span>
              </div>
              <div className="cart-summary-row">
                <span className="cart-summary-label">Impuestos (10%)</span>
                <span className="cart-summary-value">${(cartTotal * 0.1).toFixed(2)}</span>
              </div>
              <div className="cart-summary-total-row">
                <div className="cart-summary-total">
                  <span className="cart-summary-total-label">Total</span>
                  <span className="cart-summary-total-value">
                    ${(cartTotal + (cartTotal < 50 ? 4.99 : 0) + cartTotal * 0.1).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="cart-checkout-button"
            >
              Proceder al pago
            </Link>

            <div className="cart-payment-methods">
              <p className="cart-payment-title">Métodos de pago aceptados:</p>
              <div className="cart-payment-icons">
                <div className="cart-payment-card">
                  <svg className="cart-payment-card-icon" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="24" rx="4" fill="#252525"/>
                    <path d="M14.5 8H25.5V16H14.5V8Z" fill="#FF5F00"/>
                    <path d="M15.5 12C15.5 10.3 16.4 8.8 17.8 8C16.3 6.7 14.2 6.3 12.3 6.9C10.4 7.5 9 9.2 9 11.1C9 13 10.4 14.7 12.3 15.3C14.2 15.9 16.3 15.4 17.8 14.1C16.4 13.2 15.5 11.7 15.5 12Z" fill="#EB001B"/>
                    <path d="M31 12C31 13.9 29.6 15.6 27.7 16.2C25.8 16.8 23.7 16.3 22.2 15C23.6 14.2 24.5 12.7 24.5 11C24.5 9.3 23.6 7.8 22.2 7C23.7 5.7 25.8 5.3 27.7 5.9C29.6 6.5 31 8.2 31 10.1V12Z" fill="#F79E1B"/>
                  </svg>
                </div>
                <div className="cart-payment-card">
                  <svg className="cart-payment-card-icon" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="24" rx="4" fill="#1434CB"/>
                    <path d="M15.4 14.8L16.3 9.5H18.1L17.2 14.8H15.4Z" fill="white"/>
                    <path d="M22.7 9.6C22.2 9.4 21.7 9.3 21.2 9.3C19.5 9.3 18.3 10.2 18.3 11.5C18.3 12.5 19.1 13 19.7 13.3C20.3 13.6 20.5 13.8 20.5 14.1C20.5 14.5 20 14.7 19.6 14.7C19 14.7 18.6 14.6 18 14.3L17.8 14.2L17.6 15.8C18.1 16 19 16.2 19.8 16.2C21.6 16.2 22.8 15.3 22.8 13.9C22.8 13.1 22.3 12.5 21.4 12.1C20.9 11.8 20.5 11.6 20.5 11.3C20.5 11 20.8 10.7 21.5 10.7C22 10.7 22.4 10.8 22.7 10.9L22.9 11L23.1 9.5C22.6 9.3 22 9.2 21.3 9.2C19.6 9.3 18.4 10.2 18.4 11.5H22.7V9.6Z" fill="white"/>
                    <path d="M26.4 9.5H25.1C24.7 9.5 24.4 9.6 24.2 10L22 14.8H23.8C23.8 14.8 24.1 14 24.2 13.7L24.9 13.7L25.3 14.8H27.3L26.4 9.5ZM24.6 12.5C24.7 12.2 25.2 10.9 25.2 10.9C25.2 10.9 25.3 10.6 25.4 10.4L25.5 10.8C25.5 10.8 25.8 12.2 25.9 12.5H24.6Z" fill="white"/>
                    <path d="M14.3 9.5L12.6 13.1L12.4 12.1C12 11.2 11 10.2 9.9 9.7L11.6 14.8H13.4L16.1 9.5H14.3Z" fill="white"/>
                    <path d="M11.2 9.5H8.5L8.4 9.7C10.2 10.1 11.5 11 12.2 12.1L11.6 9.8C11.5 9.6 11.4 9.5 11.2 9.5Z" fill="#EFC75E"/>
                  </svg>
                </div>
                <div className="cart-payment-card">
                  <svg className="cart-payment-card-icon" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="24" rx="4" fill="#016FD0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M20 18.5C23.5899 18.5 26.5 15.5899 26.5 12C26.5 8.41015 23.5899 5.5 20 5.5C16.4101 5.5 13.5 8.41015 13.5 12C13.5 15.5899 16.4101 18.5 20 18.5Z" fill="#016FD0"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M20 18.5C23.5899 18.5 26.5 15.5899 26.5 12C26.5 8.41015 23.5899 5.5 20 5.5C16.4101 5.5 13.5 8.41015 13.5 12C13.5 15.5899 16.4101 18.5 20 18.5Z" fill="white"/>
                    <path d="M18.5 9.5L16 14.5H17.5L18 13.5H20.5L21 14.5H22.5L20 9.5H18.5ZM18.5 12L19.25 10.5L20 12H18.5Z" fill="#016FD0"/>
                  </svg>
                </div>
                <div className="bg-gray-100 rounded p-1">
                  <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="24" rx="4" fill="#F3F3F3"/>
                    <path d="M17.5 8.5C16.1 8.5 15 9.6 15 11C15 12.4 16.1 13.5 17.5 13.5C18.9 13.5 20 12.4 20 11C20 9.6 18.9 8.5 17.5 8.5Z" fill="#0079BE"/>
                    <path d="M22.5 8.5C21.1 8.5 20 9.6 20 11C20 12.4 21.1 13.5 22.5 13.5C23.9 13.5 25 12.4 25 11C25 9.6 23.9 8.5 22.5 8.5Z" fill="#0079BE"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
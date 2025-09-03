import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import ContactModal from './components/ContactModal'
import { ThemeProvider } from './context/ThemeContext'
import './styles/theme.css'

function App() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [cart, setCart] = useState([])

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prevCart, { ...product, quantity }]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Navbar cartItemCount={cart.reduce((total, item) => total + item.quantity, 0)} />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home addToCart={addToCart} />} />
              <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
              <Route 
                path="/cart" 
                element={
                  <Cart 
                    cart={cart} 
                    removeFromCart={removeFromCart} 
                    updateQuantity={updateQuantity}
                    cartTotal={cartTotal}
                  />
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <Checkout 
                    cart={cart} 
                    cartTotal={cartTotal}
                    setCart={setCart}
                  />
                } 
              />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Botón flotante de contacto */}
          <button 
            className="contact-button"
            onClick={() => setIsContactModalOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="contact-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          
          {/* Modal de contacto */}
          <ContactModal isOpen={isContactModalOpen} setIsOpen={setIsContactModalOpen} />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App

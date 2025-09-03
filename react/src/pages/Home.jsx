import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './Home.css';

// Datos de ejemplo para productos
const sampleProducts = [
  {
    id: 1,
    name: 'Smartphone XYZ',
    price: 599.99,
    image: 'https://placehold.co/300x300/3498db/ffffff?text=Smartphone',
    category: 'electronics',
    description: 'Un smartphone de última generación con cámara de alta resolución y batería de larga duración.',
  },
  {
    id: 2,
    name: 'Laptop Pro',
    price: 1299.99,
    image: 'https://placehold.co/300x300/2ecc71/ffffff?text=Laptop',
    category: 'electronics',
    description: 'Laptop potente para profesionales con procesador de última generación y pantalla de alta resolución.',
  },
  {
    id: 3,
    name: 'Auriculares Inalámbricos',
    price: 149.99,
    image: 'https://placehold.co/300x300/9b59b6/ffffff?text=Auriculares',
    category: 'electronics',
    description: 'Auriculares con cancelación de ruido y calidad de sonido premium.',
  },
  {
    id: 4,
    name: 'Camiseta Premium',
    price: 29.99,
    image: 'https://placehold.co/300x300/e74c3c/ffffff?text=Camiseta',
    category: 'clothing',
    description: 'Camiseta de algodón 100% de alta calidad y diseño moderno.',
  },
  {
    id: 5,
    name: 'Jeans Clásicos',
    price: 59.99,
    image: 'https://placehold.co/300x300/34495e/ffffff?text=Jeans',
    category: 'clothing',
    description: 'Jeans duraderos con estilo clásico y ajuste cómodo.',
  },
  {
    id: 6,
    name: 'Zapatillas Deportivas',
    price: 89.99,
    image: 'https://placehold.co/300x300/f1c40f/ffffff?text=Zapatillas',
    category: 'clothing',
    description: 'Zapatillas deportivas con soporte para actividades físicas intensas.',
  },
  {
    id: 7,
    name: 'Sofá Moderno',
    price: 499.99,
    image: 'https://placehold.co/300x300/1abc9c/ffffff?text=Sofa',
    category: 'home',
    description: 'Sofá moderno y cómodo para tu sala de estar.',
  },
  {
    id: 8,
    name: 'Juego de Sábanas',
    price: 49.99,
    image: 'https://placehold.co/300x300/d35400/ffffff?text=Sabanas',
    category: 'home',
    description: 'Juego de sábanas suaves y duraderas para un descanso óptimo.',
  },
  {
    id: 9,
    name: 'Lámpara de Mesa',
    price: 39.99,
    image: 'https://placehold.co/300x300/8e44ad/ffffff?text=Lampara',
    category: 'home',
    description: 'Lámpara de mesa elegante con luz ajustable para tu hogar u oficina.',
  },
  {
    id: 10,
    name: 'Set de Maquillaje',
    price: 79.99,
    image: 'https://placehold.co/300x300/e84393/ffffff?text=Maquillaje',
    category: 'beauty',
    description: 'Set completo de maquillaje con productos de alta calidad.',
  },
  {
    id: 11,
    name: 'Perfume Elegance',
    price: 69.99,
    image: 'https://placehold.co/300x300/00cec9/ffffff?text=Perfume',
    category: 'beauty',
    description: 'Perfume con aroma duradero y elegante presentación.',
  },
  {
    id: 12,
    name: 'Crema Hidratante',
    price: 24.99,
    image: 'https://placehold.co/300x300/fdcb6e/ffffff?text=Crema',
    category: 'beauty',
    description: 'Crema hidratante para todo tipo de piel con ingredientes naturales.',
  },
];

const categories = [
  { id: 'electronics', name: 'Electrónica', image: 'https://placehold.co/400x200/3498db/ffffff?text=Electronica' },
  { id: 'clothing', name: 'Ropa', image: 'https://placehold.co/400x200/e74c3c/ffffff?text=Ropa' },
  { id: 'home', name: 'Hogar', image: 'https://placehold.co/400x200/1abc9c/ffffff?text=Hogar' },
  { id: 'beauty', name: 'Belleza', image: 'https://placehold.co/400x200/e84393/ffffff?text=Belleza' },
];

const Home = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  // Cargar productos
  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      setProducts(sampleProducts);
      setFilteredProducts(sampleProducts);
    }, 500);
  }, []);

  // Filtrar por categoría desde la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    
    if (category) {
      setSelectedCategory(category);
      setFilteredProducts(
        products.filter((product) => product.category === category)
      );
    } else {
      setSelectedCategory(null);
      setFilteredProducts(products);
    }
  }, [location.search, products]);

  // Manejar búsqueda
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }
    
    if (term) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredProducts(filtered);
  };

  return (
    <div className="home-container">
      {/* Banner principal */}
      <div className="main-banner">
        <img
          src="https://placehold.co/1200x400/3498db/ffffff?text="
          alt="Banner principal"
          className="banner-image"
        />
        <div className="banner-content">
          <h1 className="banner-title">Bienvenido a nuestra tienda</h1>
          <p className="banner-subtitle">Productos de alta calidad a tu alcance</p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-container">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Categorías */}
      {!selectedCategory && (
        <section className="categories-section">
          <h2 className="section-title">Categorías</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/?category=${category.id}`}
                className="category-link"
              >
                <div className="category-card">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-image"
                  />
                  <div className="category-overlay">
                    <h3 className="category-name">{category.name}</h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Productos */}
      <section>
        <div className="products-header">
          <h2 className="section-title">
            {selectedCategory
              ? `${categories.find(c => c.id === selectedCategory)?.name || 'Productos'}`
              : 'Todos los Productos'}
          </h2>
          {selectedCategory && (
            <a
              href="/"
              className="back-link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 back-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Ver todas las categorías
            </a>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-results">
            <svg xmlns="http://www.w3.org/2000/svg" className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="empty-title">No se encontraron productos</h3>
            <p className="empty-message">Intenta con otra búsqueda o categoría</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
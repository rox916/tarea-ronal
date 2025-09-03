import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Datos de ejemplo para productos (mismos que en Home.jsx)
const sampleProducts = [
  {
    id: 1,
    name: 'Smartphone XYZ',
    price: 599.99,
    image: 'https://tse4.mm.bing.net/th/id/OIP.VHmme0nJxAFm33HtQ11PIQHaEW?cb=thfc1&w=994&h=583&rs=1&pid=ImgDetMain&o=7&rm=3',
    category: 'electronics',
    description: 'Un smartphone de última generación con cámara de alta resolución y batería de larga duración.',
    features: [
      'Pantalla OLED de 6.5"',
      'Cámara de 48MP',
      'Batería de 5000mAh',
      'Procesador octa-core',
      '128GB de almacenamiento'
    ]
  },
  {
    id: 2,
    name: 'Laptop Pro',
    price: 1299.99,
    image: 'https://placehold.co/300x300/2ecc71/ffffff?text=Laptop',
    category: 'electronics',
    description: 'Laptop potente para profesionales con procesador de última generación y pantalla de alta resolución.',
    features: [
      'Procesador Intel i7',
      'Pantalla 15.6" 4K',
      '16GB RAM',
      '512GB SSD',
      'Tarjeta gráfica dedicada'
    ]
  },
  {
    id: 3,
    name: 'Auriculares Inalámbricos',
    price: 149.99,
    image: 'https://placehold.co/300x300/9b59b6/ffffff?text=Auriculares',
    category: 'electronics',
    description: 'Auriculares con cancelación de ruido y calidad de sonido premium.',
    features: [
      'Cancelación activa de ruido',
      'Bluetooth 5.0',
      'Batería de 30 horas',
      'Micrófono integrado',
      'Controles táctiles'
    ]
  },
  {
    id: 4,
    name: 'Camiseta Premium',
    price: 29.99,
    image: 'https://placehold.co/300x300/e74c3c/ffffff?text=Camiseta',
    category: 'clothing',
    description: 'Camiseta de algodón 100% de alta calidad y diseño moderno.',
    features: [
      'Algodón 100%',
      'Disponible en varios colores',
      'Tallas S, M, L, XL',
      'Lavable a máquina',
      'Diseño exclusivo'
    ]
  },
  {
    id: 5,
    name: 'Jeans Clásicos',
    price: 59.99,
    image: 'https://placehold.co/300x300/34495e/ffffff?text=Jeans',
    category: 'clothing',
    description: 'Jeans duraderos con estilo clásico y ajuste cómodo.',
    features: [
      'Denim premium',
      'Corte regular',
      'Disponible en varios lavados',
      'Tallas 28-40',
      'Bolsillos reforzados'
    ]
  },
  {
    id: 6,
    name: 'Zapatillas Deportivas',
    price: 89.99,
    image: 'https://placehold.co/300x300/f1c40f/ffffff?text=Zapatillas',
    category: 'clothing',
    description: 'Zapatillas deportivas con soporte para actividades físicas intensas.',
    features: [
      'Suela de goma antideslizante',
      'Amortiguación avanzada',
      'Material transpirable',
      'Disponible en varios colores',
      'Tallas 36-45'
    ]
  },
  {
    id: 7,
    name: 'Sofá Moderno',
    price: 499.99,
    image: 'https://placehold.co/300x300/1abc9c/ffffff?text=Sofa',
    category: 'home',
    description: 'Sofá moderno y cómodo para tu sala de estar.',
    features: [
      'Tapizado de alta calidad',
      'Estructura de madera sólida',
      'Cojines extraíbles',
      'Disponible en varios colores',
      'Fácil de limpiar'
    ]
  },
  {
    id: 8,
    name: 'Juego de Sábanas',
    price: 49.99,
    image: 'https://placehold.co/300x300/d35400/ffffff?text=Sabanas',
    category: 'home',
    description: 'Juego de sábanas suaves y duraderas para un descanso óptimo.',
    features: [
      'Algodón egipcio',
      'Hilos de alta densidad',
      'Incluye sábana ajustable, plana y fundas',
      'Disponible en varios colores',
      'Lavable a máquina'
    ]
  },
  {
    id: 9,
    name: 'Lámpara de Mesa',
    price: 39.99,
    image: 'https://placehold.co/300x300/8e44ad/ffffff?text=Lampara',
    category: 'home',
    description: 'Lámpara de mesa elegante con luz ajustable para tu hogar u oficina.',
    features: [
      'Base de metal resistente',
      'Pantalla de tela de calidad',
      'Luz LED incluida',
      'Intensidad ajustable',
      'Cable de 1.5m'
    ]
  },
  {
    id: 10,
    name: 'Set de Maquillaje',
    price: 79.99,
    image: 'https://placehold.co/300x300/e84393/ffffff?text=Maquillaje',
    category: 'beauty',
    description: 'Set completo de maquillaje con productos de alta calidad.',
    features: [
      '15 sombras de ojos',
      '3 rubores',
      '2 polvos compactos',
      '5 labiales',
      'Brochas incluidas'
    ]
  },
  {
    id: 11,
    name: 'Perfume Elegance',
    price: 69.99,
    image: 'https://placehold.co/300x300/00cec9/ffffff?text=Perfume',
    category: 'beauty',
    description: 'Perfume con aroma duradero y elegante presentación.',
    features: [
      'Notas cítricas y florales',
      'Duración de 24 horas',
      'Botella de cristal de 100ml',
      'Diseño elegante',
      'Aroma unisex'
    ]
  },
  {
    id: 12,
    name: 'Crema Hidratante',
    price: 24.99,
    image: 'https://placehold.co/300x300/fdcb6e/ffffff?text=Crema',
    category: 'beauty',
    description: 'Crema hidratante para todo tipo de piel con ingredientes naturales.',
    features: [
      'Ingredientes orgánicos',
      'Para todo tipo de piel',
      'Hidratación 24 horas',
      'Sin parabenos',
      'Frasco de 200ml'
    ]
  },
];

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    // Simulación de carga de datos
    setLoading(true);
    setTimeout(() => {
      const foundProduct = sampleProducts.find(p => p.id === parseInt(id));
      setProduct(foundProduct);
      
      // Productos relacionados (misma categoría)
      if (foundProduct) {
        const related = sampleProducts
          .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
          .slice(0, 4);
        setRelatedProducts(related);
      }
      
      setLoading(false);
    }, 500);
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${product.name} añadido al carrito`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <p className="mb-4">Lo sentimos, el producto que buscas no existe.</p>
        <Link to="/" className="text-primary-600 hover:text-primary-800 font-medium">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm">
        <Link to="/" className="text-gray-500 hover:text-primary-600">
          Inicio
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link 
          to={`/?category=${product.category}`} 
          className="text-gray-500 hover:text-primary-600"
        >
          {product.category === 'electronics' && 'Electrónica'}
          {product.category === 'clothing' && 'Ropa'}
          {product.category === 'home' && 'Hogar'}
          {product.category === 'beauty' && 'Belleza'}
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      {/* Detalle del producto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Imagen del producto */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Información del producto */}
        <div>
          <div className="mb-2">
            <span className="inline-block bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {product.category === 'electronics' && 'Electrónica'}
              {product.category === 'clothing' && 'Ropa'}
              {product.category === 'home' && 'Hogar'}
              {product.category === 'beauty' && 'Belleza'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="text-2xl font-bold text-primary-700 mb-4">
            ${product.price.toFixed(2)}
          </div>
          <p className="text-gray-700 mb-6">{product.description}</p>
          
          {/* Características */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Características:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="text-gray-700">{feature}</li>
              ))}
            </ul>
          </div>
          
          {/* Selector de cantidad y botón de añadir al carrito */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                className="px-3 py-1 text-gray-600 hover:text-primary-600"
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 text-center border-0 focus:ring-0"
              />
              <button
                className="px-3 py-1 text-gray-600 hover:text-primary-600"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Añadir al carrito
            </button>
          </div>
          
          {/* Envío y devoluciones */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-4a1 1 0 00-.293-.707l-2-2A1 1 0 0017 2h-3a1 1 0 00-1 1v1H6a1 1 0 00-.99.859L4.82 5H3a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-4a1 1 0 00-.293-.707l-2-2A1 1 0 0017 2h-3a1 1 0 00-1 1v1H6a1 1 0 00-.99.859L4.82 5H3a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-4a1 1 0 00-.293-.707l-2-2A1 1 0 0017 2h-3a1 1 0 00-1 1v1H6a1 1 0 00-.99.859L4.82 5H3a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-4a1 1 0 00-.293-.707l-2-2A1 1 0 0017 2h-3a1 1 0 00-1 1v1H6a1 1 0 00-.99.859L4.82 5H3a1 1 0 00-1 1z" />
              </svg>
              <span className="text-sm font-medium">Envío gratis en pedidos superiores a $50</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Devoluciones gratuitas durante 30 días</span>
            </div>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <Link to={`/product/${relatedProduct.id}`}>
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{relatedProduct.name}</h3>
                    <p className="text-primary-700 font-bold">${relatedProduct.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
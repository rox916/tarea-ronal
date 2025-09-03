import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Checkout.css';

const Checkout = ({ cart, cartTotal, setCart }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Calcular totales
  const shipping = cartTotal >= 50 ? 0 : 4.99;
  const tax = cartTotal * 0.1;
  const orderTotal = cartTotal + shipping + tax;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
    if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'El código postal es requerido';
    if (!formData.country.trim()) newErrors.country = 'El país es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.cardName.trim()) newErrors.cardName = 'El nombre en la tarjeta es requerido';
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'El número de tarjeta es requerido';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Número de tarjeta inválido (debe tener 16 dígitos)';
    }
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'La fecha de expiración es requerida';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Formato inválido (MM/YY)';
    }
    if (!formData.cvv.trim()) {
      newErrors.cvv = 'El CVV es requerido';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep2()) {
      setIsProcessing(true);
      // Simulación de procesamiento de pago
      setTimeout(() => {
        setIsProcessing(false);
        // Limpiar carrito y redirigir a confirmación
        setCart([]);
        navigate('/', { state: { orderCompleted: true } });
        alert('¡Compra realizada con éxito! Gracias por tu pedido.');
      }, 2000);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-card">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="empty-cart-icon"
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
          <h2 className="empty-cart-title">Tu carrito está vacío</h2>
          <p className="empty-cart-message">
            No puedes proceder al pago sin productos en tu carrito.
          </p>
          <Link
            to="/"
            className="return-to-shop"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Finalizar compra</h1>

      {/* Pasos del checkout */}
      <div className="checkout-steps">
        <div className="step-item">
          <div className={`step-number ${step >= 1 ? 'step-active' : 'step-inactive'}`}>
            1
          </div>
          <span className={`step-label ${step >= 1 ? 'label-active' : 'label-inactive'}`}>Envío</span>
        </div>
        <div className={`step-line ${step >= 2 ? 'line-active' : 'line-inactive'}`}></div>
        <div className="step-item">
          <div className={`step-number ${step >= 2 ? 'step-active' : 'step-inactive'}`}>
            2
          </div>
          <span className={`step-label ${step >= 2 ? 'label-active' : 'label-inactive'}`}>Pago</span>
        </div>
        <div className={`step-line ${step >= 3 ? 'line-active' : 'line-inactive'}`}></div>
        <div className="step-item">
          <div className={`step-number ${step >= 3 ? 'step-active' : 'step-inactive'}`}>
            3
          </div>
          <span className={`step-label ${step >= 3 ? 'label-active' : 'label-inactive'}`}>Confirmación</span>
        </div>
      </div>

      <div className="checkout-layout">
        {/* Formulario */}
        <div>
          <div className="checkout-form-container">
            <form onSubmit={handleSubmit}>
              {/* Paso 1: Información de envío */}
              {step === 1 && (
                <div className="form-section">
                  <h2 className="form-title">Información de envío</h2>
                  <div className="form-grid">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.postalCode && <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        País
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Selecciona un país</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Bolivia">Bolivia</option>
                        <option value="Chile">Chile</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Ecuador">Ecuador</option>
                        <option value="España">España</option>
                        <option value="México">México</option>
                        <option value="Perú">Perú</option>
                        <option value="Venezuela">Venezuela</option>
                      </select>
                      {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Información de pago */}
              {step === 2 && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Información de pago</h2>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                        Nombre en la tarjeta
                      </label>
                    </div>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      placeholder="Nombre completo como aparece en la tarjeta"
                      value={formData.cardName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.cardName && <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>}
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                        Número de tarjeta
                      </label>
                      <div className="flex space-x-2">
                        <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none">
                          <rect width="40" height="24" rx="4" fill="#252525"/>
                          <path d="M14.5 8H25.5V16H14.5V8Z" fill="#FF5F00"/>
                          <path d="M15.5 12C15.5 10.3 16.4 8.8 17.8 8C16.3 6.7 14.2 6.3 12.3 6.9C10.4 7.5 9 9.2 9 11.1C9 13 10.4 14.7 12.3 15.3C14.2 15.9 16.3 15.4 17.8 14.1C16.4 13.2 15.5 11.7 15.5 12Z" fill="#EB001B"/>
                          <path d="M31 12C31 13.9 29.6 15.6 27.7 16.2C25.8 16.8 23.7 16.3 22.2 15C23.6 14.2 24.5 12.7 24.5 11C24.5 9.3 23.6 7.8 22.2 7C23.7 5.7 25.8 5.3 27.7 5.9C29.6 6.5 31 8.2 31 10.1V12Z" fill="#F79E1B"/>
                        </svg>
                        <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none">
                          <rect width="40" height="24" rx="4" fill="#1434CB"/>
                          <path d="M15.4 14.8L16.3 9.5H18.1L17.2 14.8H15.4Z" fill="white"/>
                          <path d="M22.7 9.6C22.2 9.4 21.7 9.3 21.2 9.3C19.5 9.3 18.3 10.2 18.3 11.5C18.3 12.5 19.1 13 19.7 13.3C20.3 13.6 20.5 13.8 20.5 14.1C20.5 14.5 20 14.7 19.6 14.7C19 14.7 18.6 14.6 18 14.3L17.8 14.2L17.6 15.8C18.1 16 19 16.2 19.8 16.2C21.6 16.2 22.8 15.3 22.8 13.9C22.8 13.1 22.3 12.5 21.4 12.1C20.9 11.8 20.5 11.6 20.5 11.3C20.5 11 20.8 10.7 21.5 10.7C22 10.7 22.4 10.8 22.7 10.9L22.9 11L23.1 9.5C22.6 9.3 22 9.2 21.3 9.2C19.6 9.3 18.4 10.2 18.4 11.5H22.7V9.6Z" fill="white"/>
                          <path d="M26.4 9.5H25.1C24.7 9.5 24.4 9.6 24.2 10L22 14.8H23.8C23.8 14.8 24.1 14 24.2 13.7L24.9 13.7L25.3 14.8H27.3L26.4 9.5ZM24.6 12.5C24.7 12.2 25.2 10.9 25.2 10.9C25.2 10.9 25.3 10.6 25.4 10.4L25.5 10.8C25.5 10.8 25.8 12.2 25.9 12.5H24.6Z" fill="white"/>
                          <path d="M14.3 9.5L12.6 13.1L12.4 12.1C12 11.2 11 10.2 9.9 9.7L11.6 14.8H13.4L16.1 9.5H14.3Z" fill="white"/>
                          <path d="M11.2 9.5H8.5L8.4 9.7C10.2 10.1 11.5 11 12.2 12.1L11.6 9.8C11.5 9.6 11.4 9.5 11.2 9.5Z" fill="#EFC75E"/>
                        </svg>
                        <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none">
                          <rect width="40" height="24" rx="4" fill="#016FD0"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M20 18.5C23.5899 18.5 26.5 15.5899 26.5 12C26.5 8.41015 23.5899 5.5 20 5.5C16.4101 5.5 13.5 8.41015 13.5 12C13.5 15.5899 16.4101 18.5 20 18.5Z" fill="#016FD0"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M20 18.5C23.5899 18.5 26.5 15.5899 26.5 12C26.5 8.41015 23.5899 5.5 20 5.5C16.4101 5.5 13.5 8.41015 13.5 12C13.5 15.5899 16.4101 18.5 20 18.5Z" fill="white"/>
                          <path d="M18.5 9.5L16 14.5H17.5L18 13.5H20.5L21 14.5H22.5L20 9.5H18.5ZM18.5 12L19.25 10.5L20 12H18.5Z" fill="#016FD0"/>
                        </svg>
                      </div>
                    </div>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.cardNumber && <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de expiración
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.expiryDate && <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>}
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.cvv && <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 3: Confirmación */}
              {step === 3 && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Confirma tu pedido</h2>
                  
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">Resumen de productos</h3>
                    <ul className="divide-y divide-gray-200">
                      {cart.map((item) => (
                        <li key={item.id} className="py-3 flex justify-between">
                          <div className="flex items-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-md mr-3"
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">Información de envío</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.address}</p>
                      <p>{formData.city}, {formData.postalCode}</p>
                      <p>{formData.country}</p>
                      <p>{formData.email}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">Método de pago</h3>
                    <div className="bg-gray-50 p-3 rounded-md flex items-center">
                      <svg className="h-8 w-12 mr-3" viewBox="0 0 40 24" fill="none">
                        <rect width="40" height="24" rx="4" fill="#252525"/>
                        <path d="M14.5 8H25.5V16H14.5V8Z" fill="#FF5F00"/>
                        <path d="M15.5 12C15.5 10.3 16.4 8.8 17.8 8C16.3 6.7 14.2 6.3 12.3 6.9C10.4 7.5 9 9.2 9 11.1C9 13 10.4 14.7 12.3 15.3C14.2 15.9 16.3 15.4 17.8 14.1C16.4 13.2 15.5 11.7 15.5 12Z" fill="#EB001B"/>
                        <path d="M31 12C31 13.9 29.6 15.6 27.7 16.2C25.8 16.8 23.7 16.3 22.2 15C23.6 14.2 24.5 12.7 24.5 11C24.5 9.3 23.6 7.8 22.2 7C23.7 5.7 25.8 5.3 27.7 5.9C29.6 6.5 31 8.2 31 10.1V12Z" fill="#F79E1B"/>
                      </svg>
                      <div>
                        <p className="font-medium">Tarjeta terminada en {formData.cardNumber.slice(-4)}</p>
                        <p className="text-sm text-gray-500">Expira: {formData.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de navegación */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Atrás
                  </button>
                ) : (
                  <Link
                    to="/cart"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Volver al carrito
                  </Link>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      'Confirmar pedido'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="font-semibold text-lg mb-4">Resumen del pedido</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} productos)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impuestos (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary-700">
                    ${orderTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-sm mb-2">Productos en tu carrito</h3>
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li key={item.id} className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-md mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
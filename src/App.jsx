import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./helper/AuthWrapper.jsx";
import ROUTE from "./helper/Route.jsx";
import ProtectedRoute from "./helper/ProtectedRoute.jsx";
import Toaster from "./components/Toaster.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "./styles/theme.css";
import "./styles/global.css";
import "./styles/utilities.css";
import "./styles/components.css";
import "./styles/responsive.css";
import "./style/Dashboard.css";
import "./App.css";
import NotFound from './pages/errors/NotFound'
import Dashboard from './pages/dashboard'
import CustomerRegister from "./pages/auth/customer/Register.jsx";
import SellerRegister from "./pages/auth/seller/Register.jsx";
import AdminLogin from "./pages/auth/admin/login.jsx"
import Login from "./pages/auth/Login.jsx";
import MyRequirements from "./pages/requirement/Myrequirements.jsx";
import RequirementListing from "./pages/requirement/Requirementlisting.jsx";
import ProductDetailPage from "./pages/detail-page/ProductDetailPage.jsx";
import CreateProduct from "./pages/product/CreateProduct";
import SellerProducts from "./pages/seller-products/SellerDashboard.jsx";
import LandingPage from "./pages/landing-page/LandingDashboard.jsx";
import Cart from "./pages/cart";
import WishlistPage from "./pages/wishlist";
import CheckoutPage from "./pages/checkout/CheckoutPage.jsx";
import OrdersPage from "./pages/customer-order-list/OrdersPage.jsx";
import SettingsPage from "./pages/setting/Settings.jsx";
import ChatPage from "./pages/requirements/ChatPage";
import CustomizationChatPage from "./pages/chat/ChatPage";
import SellerProductDetail from "./pages/seller-detail-page/SellerProductDetail";
import SellerDashboardHome from "./pages/seller-dashboard/SellerDashboardHome";
import SellerOrders from "./pages/seller-orders/SellerOrders";
import InvoicePage from "./components/InvoicePage.jsx";
import SellerReviews from "./pages/SellerReviews/SellerReviews";
import SellerSettings from "./pages/seller-settings/Seller.jsx";
import CustomerReturns from "./pages/returns/CustomerReturns.jsx";
import SellerReturns from "./pages/returns/SellerReturns.jsx";
import SellerPayments from "./pages/seller-payments/SellerPayments.jsx";


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* <NavigationInitializer /> */}
        <Toaster />
        <Routes>
          <Route path={ROUTE.LOGIN} element={<Login />} />
          <Route path={ROUTE.CUSTOMER_REGISTER} element={<CustomerRegister />} />
          <Route path={ROUTE.SELLER_REGISTER} element={<SellerRegister />} />
          <Route path={ROUTE.ADMIN_LOGIN} element={<AdminLogin />} />
          <Route path={ROUTE.INVOICE} element={<InvoicePage />} />
          <Route path={ROUTE.CART} element={<ProtectedRoute moduleName="cart"><Cart /></ProtectedRoute>} />
          <Route path={ROUTE.ORDERS} element={<ProtectedRoute moduleName="orders"><OrdersPage /></ProtectedRoute>} />
          <Route path={ROUTE.WISHLIST} element={<ProtectedRoute moduleName="wishlist"><WishlistPage /></ProtectedRoute>} />
          <Route path={ROUTE.LANDING_PAGE} element={<Dashboard />} />
          {/* <Route path={ROUTE.DASHBOARD} element={<ProtectedRoute moduleName="dashboard"><Dashboard /></ProtectedRoute>} /> */}
          <Route path={ROUTE.PRODUCT_DETAIL_PAGE} element={<ProductDetailPage />} />
          <Route path={ROUTE.CREATE_PRODUCT} element={<ProtectedRoute moduleName="create_product"><CreateProduct /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_PRODUCTS} element={<ProtectedRoute moduleName="seller_products"><SellerProducts /></ProtectedRoute>} />
          <Route path={ROUTE.CUSTOMER_REQUIREMENTS} element={<ProtectedRoute moduleName="curstomer_requirements"><MyRequirements /></ProtectedRoute>} />
          <Route path={ROUTE.CHECKOUT} element={<ProtectedRoute moduleName="checkout"><CheckoutPage /></ProtectedRoute>} />
          <Route path={ROUTE.SETTINGS} element={<ProtectedRoute moduleName="settings"><SettingsPage /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_DASHBOARD} element={<ProtectedRoute moduleName="seller-dashboard"><SellerDashboardHome /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_ORDER} element={<ProtectedRoute moduleName="seller-orders"><SellerOrders /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_ORDER_BY_ID} element={<ProtectedRoute moduleName="seller-orders"><SellerOrders /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_REVIEWS} element={<ProtectedRoute moduleName="seller-reviews"><SellerReviews /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_PRODUCT_DETAIL_PAGE} element={<ProtectedRoute moduleName="seller-product-detail-page"><SellerProductDetail /></ProtectedRoute>} />
          <Route path={ROUTE.CHAT} element={<ProtectedRoute moduleName="requirement"><ChatPage /></ProtectedRoute>} />
          <Route path={ROUTE.CHAT_LIST} element={<ProtectedRoute moduleName="chat"><CustomizationChatPage /></ProtectedRoute>} />
          <Route path={ROUTE.CHAT_CONVERSATION} element={<ProtectedRoute moduleName="chat"><CustomizationChatPage /></ProtectedRoute>} />
          <Route path={ROUTE.CUSTOMER_REQUIREMENTS_LISTING} element={<ProtectedRoute moduleName="curstomer_requirements_list"><RequirementListing /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_SETTING} element={<ProtectedRoute moduleName="seller_setting"><SellerSettings /></ProtectedRoute>} />
          <Route path={ROUTE.CUSTOMER_RETURNS} element={<ProtectedRoute moduleName="returns"><CustomerReturns /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_RETURNS} element={<ProtectedRoute moduleName="returns"><SellerReturns /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_PAYMENTS} element={<ProtectedRoute moduleName="seller_payments"><SellerPayments /></ProtectedRoute>} />
          <Route element={<ProtectedRoute />}>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
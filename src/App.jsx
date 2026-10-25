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
import AdminLogin from "./pages/admin/login.jsx"
import Login from "./pages/auth/Login.jsx";
import ProductDetailPage from "./pages/detail-page/ProductDetailPage.jsx";
import CreateProduct from "./pages/product/CreateProduct";
import SellerProducts from "./pages/seller-products/SellerDashboard.jsx";
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
import InstallNotification from "./components/InstallNotification.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx"
import SellerDetails from "./components/SellerDetails.jsx";


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <InstallNotification />
        <Routes>
          <Route path={ROUTE.LOGIN} module="login" element={ <ProtectedRoute guestOnly> <Login /> </ProtectedRoute> } />
          <Route path={ROUTE.CUSTOMER_REGISTER} element={<CustomerRegister />} />
          <Route path={ROUTE.SELLER_REGISTER} element={<SellerRegister />} />
          <Route path={ROUTE.ADMIN_LOGIN} element={<AdminLogin />} />
          <Route path={ROUTE.INVOICE} element={<InvoicePage />} />

          <Route path={ROUTE.LANDING_PAGE} element={<ProtectedRoute denyRoles={["admin", "seller"]}> <Dashboard /> </ProtectedRoute>} />
          <Route path={ROUTE.PRODUCT_DETAIL_PAGE} element={<ProtectedRoute denyRoles={["admin", "seller"]}> <ProductDetailPage /> </ProtectedRoute>} />

          <Route path={ROUTE.ADMIN_DASHBOARD} element={<ProtectedRoute role="admin"> <AdminDashboard /> </ProtectedRoute>} />
          <Route path={ROUTE.SELLER_DETAIL} element={<ProtectedRoute role="admin"> <SellerDetails /> </ProtectedRoute>} />

          <Route path={ROUTE.CART} element={<ProtectedRoute role="customer"><Cart /></ProtectedRoute>} />
          <Route path={ROUTE.ORDERS} element={<ProtectedRoute role="customer"><OrdersPage /></ProtectedRoute>} />
          <Route path={ROUTE.WISHLIST} element={<ProtectedRoute role="customer"><WishlistPage /></ProtectedRoute>} />
          <Route path={ROUTE.CHECKOUT} element={<ProtectedRoute role="customer"><CheckoutPage /></ProtectedRoute>} />
          <Route path={ROUTE.SETTINGS} element={<ProtectedRoute role="customer"><SettingsPage /></ProtectedRoute>} />
          <Route path={ROUTE.CUSTOMER_RETURNS} element={<ProtectedRoute role="customer"><CustomerReturns /></ProtectedRoute>} />


          <Route path={ROUTE.CREATE_PRODUCT} element={<ProtectedRoute role="seller" ><CreateProduct /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_PRODUCTS} element={<ProtectedRoute role="seller" ><SellerProducts /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_DASHBOARD} element={<ProtectedRoute role="seller"  ><SellerDashboardHome /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_ORDER} element={<ProtectedRoute role="seller" ><SellerOrders /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_ORDER_BY_ID} element={<ProtectedRoute role="seller"  ><SellerOrders /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_REVIEWS} element={<ProtectedRoute role="seller"  ><SellerReviews /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_SETTING} element={<ProtectedRoute role="seller"  ><SellerSettings /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_PRODUCT_DETAIL_PAGE} element={<ProtectedRoute role="seller"  ><SellerProductDetail /></ProtectedRoute>} />
          <Route path={ROUTE.SELLER_PAYMENTS} element={<ProtectedRoute role="seller"  ><SellerPayments /></ProtectedRoute>} />


          <Route path={ROUTE.CHAT} element={<ProtectedRoute allowedRoles={["seller", "customer"]}> <ChatPage /> </ProtectedRoute>} />
          <Route path={ROUTE.CHAT_LIST} element={<ProtectedRoute allowedRoles={["seller", "customer"]}> <CustomizationChatPage /> </ProtectedRoute>} />
          <Route path={ROUTE.CHAT_CONVERSATION} element={<ProtectedRoute allowedRoles={["seller", "customer"]}> <CustomizationChatPage /> </ProtectedRoute>} />


          {/* <Route path={ROUTE.SELLER_RETURNS} element={<ProtectedRoute moduleName="returns"><SellerReturns /></ProtectedRoute>} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
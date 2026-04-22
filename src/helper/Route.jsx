const ROUTE = {
  LANDING_PAGE: "/",
  DASHBOARD: "/dashboard",
  CUSTOMER_REGISTER: "/customer/register",
  LOGIN: "auth/login",
  INVOICE: "order/invoice/:id/:id",
  PRODUCT_DETAIL_PAGE: "product/:id",
  SELLER_PRODUCT_DETAIL_PAGE: "seller/product/:id",
  CREATE_PRODUCT: "/seller/product/create",
  SELLER_PRODUCTS: "seller/products",
  SELLER_DASHBOARD: "seller/dashboard",
  SELLER_ORDER: "/seller/orders/:id",
  SELLER_ORDER_BY_ID: "/seller/orders/",
  SELLER_REGISTER: "/seller/register",
  ADMIN_LOGIN: "/admin/login",
  CUSTOMER_REQUIREMENTS: "/customer/requirement",
  CUSTOMER_REQUIREMENTS_LISTING: "/seller/requirement/listing",
  ORDERS: "dashboard/orders",
  CART: "dashboard/cart",
  CHECKOUT: "dashboard/checkout",
  WISHLIST: "dashboard/wishlist",
  SETTINGS: "dashboard/settings",
  CHAT: "product/:id/customization"

};

export default ROUTE;
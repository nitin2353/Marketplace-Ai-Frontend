import React, { useEffect, useMemo, useState } from "react";
import { BUSINESS_EMAIL } from "../helper/Constraints";
import GlobalLoader from "./GlobalLoader";

const TermsAndConditions = ({
    siteName = "FlashiBuy",
    userRole = "all",
    lastUpdated = "26 October 2026",
    contactEmail = BUSINESS_EMAIL,
}) => {
    const [activeView, setActiveView] = useState("all");
    const [expandedSections, setExpandedSections] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const normalizedRole = String(userRole || "all").toLowerCase();

    const isCustomer = normalizedRole === "customer";
    const isSeller = normalizedRole === "seller";

    setTimeout(() => {
        setLoading(false);
    },500)

    const sections = [
        {
            id: "introduction",
            title: "1. Introduction and Acceptance of Terms",
            category: "common",
            content: [
                {
                    heading: "1.1 About the Marketplace",
                    text: `${siteName} is an online marketplace that enables users to discover, list, purchase, and sell products through the services made available on the platform. Depending on the features enabled on the website, users may participate as customers, sellers, or both.`,
                },
                {
                    heading: "1.2 Agreement to These Terms",
                    text: `These Terms and Conditions govern your access to and use of ${siteName}, including its website, applications, product listings, account features, order management, communication tools, payment-related features, and other services made available through the platform.`,
                },
                {
                    heading: "1.3 Acceptance",
                    text: "By accessing the website, creating an account, placing an order, listing a product, or otherwise using the platform, you agree to comply with these Terms and Conditions and applicable laws. If you do not agree, you must stop using the relevant services.",
                },
                {
                    heading: "1.4 Additional Policies",
                    text: "Additional terms, product-specific conditions, shipping rules, return policies, refund conditions, payment terms, privacy notices, and other policies may apply to particular transactions or services. Where applicable, these documents should be read together with these Terms.",
                },
                {
                    heading: "1.5 Eligibility",
                    text: "You must have the legal capacity required to enter into a binding agreement under applicable law. If you are using the platform on behalf of a business or another organization, you represent that you are authorized to act on its behalf.",
                },
                {
                    heading: "1.6 Changes to These Terms",
                    text: "We may update these Terms when necessary because of changes to our services, business practices, technology, or legal requirements. Updated Terms will be published on the platform with a revised effective or last-updated date. Material changes should be communicated where required by law. Continued use after the effective date may constitute acceptance where legally permitted.",
                },
            ],
        },

        {
            id: "definitions",
            title: "2. Definitions",
            category: "common",
            content: [
                {
                    heading: "2.1 Platform",
                    text: `"Platform" means the ${siteName} website, applications, software, and related marketplace services.`,
                },
                {
                    heading: "2.2 Customer",
                    text: "A customer is a registered or permitted user who browses, selects, purchases, or attempts to purchase products through the platform.",
                },
                {
                    heading: "2.3 Seller",
                    text: "A seller is a person or business authorized to offer products for sale through the platform.",
                },
                {
                    heading: "2.4 Product",
                    text: "A product is any item offered, displayed, advertised, or sold through a seller listing.",
                },
                {
                    heading: "2.5 Order",
                    text: "An order is a purchase request submitted by a customer through the platform. An order may contain products from one or more sellers and may be divided into separate seller-specific orders or shipments.",
                },
                {
                    heading: "2.6 Transaction",
                    text: "A transaction refers to a purchase, payment, refund, cancellation, seller payout, or other commercial activity associated with the platform.",
                },
                {
                    heading: "2.7 We, Us, or Our",
                    text: `These words refer to the operator of ${siteName}. The legal name and registered business details of the platform operator should be provided in the final published version of these Terms.`,
                },
            ],
        },

        {
            id: "accounts",
            title: "3. Registration and Account Security",
            category: "common",
            content: [
                {
                    heading: "3.1 Account Information",
                    text: "You agree to provide accurate, complete, and current information when creating or maintaining an account. You must update information that becomes inaccurate or outdated.",
                },
                {
                    heading: "3.2 Account Credentials",
                    text: "You are responsible for protecting your password, authentication credentials, verification codes, and other account-access information. Do not share authentication codes or passwords with unauthorized persons.",
                },
                {
                    heading: "3.3 Email and OTP Verification",
                    text: "Where email verification, one-time passwords, password-reset links, or other authentication mechanisms are provided, you must use them only for their intended purpose. You must not attempt to intercept, manipulate, or misuse another person's authentication process.",
                },
                {
                    heading: "3.4 Unauthorized Activity",
                    text: "Notify the platform promptly if you suspect unauthorized account access, fraudulent activity, or misuse of your account. We may restrict access while investigating suspected security incidents.",
                },
                {
                    heading: "3.5 One Person, One Account",
                    text: "You must not create accounts to impersonate another person, evade restrictions, manipulate reviews, abuse promotions, or conduct fraudulent transactions. Any account restrictions must not be circumvented.",
                },
                {
                    heading: "3.6 Account Suspension",
                    text: "We may investigate and restrict, suspend, or terminate accounts where reasonably necessary to address suspected fraud, security risks, unlawful activity, violations of these Terms, or risks to customers, sellers, or the platform. Any action will be subject to applicable law and any required notice or process.",
                },
            ],
        },

        {
            id: "marketplace",
            title: "4. How the Marketplace Works",
            category: "common",
            content: [
                {
                    heading: "4.1 Marketplace Role",
                    text: `${siteName} provides marketplace functionality through which sellers may offer products and customers may purchase them. Unless expressly stated otherwise, the platform should not be understood to be the manufacturer or direct seller of every listed product.`,
                },
                {
                    heading: "4.2 Independent Sellers",
                    text: "Products may be offered by independent sellers. The relevant seller is responsible for its product listings, product accuracy, stock availability, packaging, and fulfillment obligations, subject to applicable law and any services expressly undertaken by the platform.",
                },
                {
                    heading: "4.3 Product Availability",
                    text: "Product availability, price, specifications, images, and delivery estimates may change. Adding a product to a cart does not necessarily reserve stock or guarantee the final price.",
                },
                {
                    heading: "4.4 Platform Services",
                    text: "The platform may provide account management, product discovery, cart and checkout functionality, order records, seller dashboards, payment integrations, communication tools, and other features. Availability of individual features may vary.",
                },
                {
                    heading: "4.5 No Guarantee of Every Listing",
                    text: "We may review, moderate, restrict, or remove listings and user-generated content. However, unless expressly stated, the existence of a listing does not mean that every claim made by the seller has been independently verified by the platform.",
                },
            ],
        },

        {
            id: "customer",
            title: "5. Customer Terms and Responsibilities",
            category: "customer",
            content: [
                {
                    heading: "5.1 Accurate Customer Details",
                    text: "Customers must provide accurate contact information, delivery addresses, and other information needed to process orders. Customers are responsible for reviewing their details before confirming a purchase.",
                },
                {
                    heading: "5.2 Product Selection",
                    text: "Before ordering, customers should carefully review product descriptions, specifications, size, quantity, variants, images, applicable taxes, shipping charges, delivery estimates, and any seller-specific conditions displayed on the platform.",
                },
                {
                    heading: "5.3 Placing an Order",
                    text: "Submitting an order constitutes a purchase request. Order acceptance, payment authorization, stock confirmation, and dispatch may occur at different stages. The order confirmation and checkout information should explain when an order is considered accepted.",
                },
                {
                    heading: "5.4 Multiple Sellers",
                    text: "A cart may contain products offered by different sellers. The platform may divide such a cart into separate seller-specific orders. Each seller may have different stock availability, fulfillment arrangements, shipping charges, dispatch times, and applicable policies.",
                },
                {
                    heading: "5.5 Customer Payment",
                    text: "Customers must pay the amount shown at checkout through the payment methods made available by the platform. The displayed total may include product prices, applicable taxes, delivery charges, discounts, and other clearly disclosed charges.",
                },
                {
                    heading: "5.6 Order Confirmation",
                    text: "Customers should retain their order number, confirmation message, payment reference, invoice, and relevant correspondence. These details may be needed when requesting support or disputing a transaction.",
                },
                {
                    heading: "5.7 Delivery Address",
                    text: "Customers are responsible for entering a complete and deliverable address and an accurate contact number. If delivery fails because the information provided is incorrect or incomplete, additional delivery attempts, delays, or costs may arise in accordance with the applicable shipping policy and law.",
                },
                {
                    heading: "5.8 Receipt and Inspection",
                    text: "Customers should inspect delivered products as reasonably possible and report damage, shortages, incorrect items, or other issues promptly through the designated support process. This does not limit statutory rights that cannot lawfully be excluded.",
                },
                {
                    heading: "5.9 Prohibited Customer Conduct",
                    text: "Customers must not submit fraudulent orders, misuse payment methods, falsely claim non-delivery, abuse refunds, manipulate reviews, threaten sellers, exploit platform vulnerabilities, or use the platform for unlawful activities.",
                },
                {
                    heading: "5.10 Customer Support",
                    text: "Customers should contact the platform through its designated support channels for order issues. Depending on the issue, support may require the order number, seller details, transaction reference, product photographs, or other relevant evidence.",
                },
            ],
        },

        {
            id: "seller",
            title: "6. Seller Terms and Responsibilities",
            category: "seller",
            content: [
                {
                    heading: "6.1 Seller Registration",
                    text: "Sellers must provide accurate business, identity, contact, bank, tax, and other information required by the platform and applicable law. Sellers must keep these details updated and provide supporting documents when lawfully requested.",
                },
                {
                    heading: "6.2 Seller Authorization",
                    text: "A seller must have the legal right and authority to sell its listed products. Sellers must obtain any registrations, licenses, permissions, or approvals required for their business and product category.",
                },
                {
                    heading: "6.3 Listing Accuracy",
                    text: "Sellers must ensure that titles, descriptions, specifications, images, variants, prices, taxes, warranties, stock information, and other listing details are accurate and not misleading. Images and descriptions should fairly represent the actual product.",
                },
                {
                    heading: "6.4 Ownership and Authenticity",
                    text: "Sellers must not list counterfeit, stolen, unlawfully imported, prohibited, unsafe, or unauthorized products. Sellers must have the necessary rights to use all product images, brand names, descriptions, and other listing materials.",
                },
                {
                    heading: "6.5 Pricing and Taxes",
                    text: "Sellers are responsible for setting accurate product prices and providing tax information required by applicable law and the platform. Any platform fees, commissions, payment-processing charges, or other seller charges must be governed by the applicable seller agreement or fee schedule disclosed to the seller.",
                },
                {
                    heading: "6.6 Inventory Management",
                    text: "Sellers must keep stock quantities accurate and promptly update unavailable products, variants, and quantities. Sellers should not accept orders for products they cannot reasonably fulfill.",
                },
                {
                    heading: "6.7 Order Processing",
                    text: "Sellers must monitor their seller dashboard and process accepted orders within the applicable processing or dispatch commitments shown on the platform or agreed with the platform.",
                },
                {
                    heading: "6.8 Packaging and Dispatch",
                    text: "Sellers must package products appropriately, comply with applicable shipping requirements, and provide accurate dispatch and tracking information when required. Products must be the items ordered and must not be knowingly substituted without appropriate customer consent.",
                },
                {
                    heading: "6.9 Shipping Labels",
                    text: "Where shipping labels or tracking tools are provided, sellers must use them accurately and only for authorized shipments. A label or tracking number must not be reused, falsified, or associated with a shipment that was not actually dispatched.",
                },
                {
                    heading: "6.10 Seller Communications",
                    text: "Sellers must communicate professionally with customers, respond to legitimate order-related queries, and avoid harassment, threats, discriminatory abuse, deceptive claims, and unauthorized requests for sensitive information.",
                },
                {
                    heading: "6.11 Seller Obligations After Sale",
                    text: "Sellers must honor applicable product warranties, delivery commitments, cancellation conditions, return obligations, refunds, and consumer rights as required by law and the policies applicable to the transaction.",
                },
                {
                    heading: "6.12 Seller Records",
                    text: "Sellers should maintain appropriate records of orders, invoices, dispatches, returns, refunds, product sourcing, taxes, and customer communications for the period required by applicable law.",
                },
                {
                    heading: "6.13 Seller Payouts",
                    text: "Where the platform facilitates seller payouts, payout eligibility, timing, deductions, verification requirements, reserves, and dispute adjustments will be governed by the applicable seller agreement and payment-provider terms. Sellers must provide accurate payout details.",
                },
                {
                    heading: "6.14 Seller Prohibited Conduct",
                    text: "Sellers must not manipulate orders, create fake sales, submit fraudulent tracking information, artificially inflate prices through deceptive practices, misuse customer data, manipulate reviews, evade platform fees, or move transactions off-platform in violation of applicable platform rules.",
                },
                {
                    heading: "6.15 Seller Responsibility",
                    text: "Subject to applicable law and the terms of any separate agreement, sellers remain responsible for their products, listing claims, legal compliance, fulfillment activities, and obligations arising from their sales.",
                },
            ],
        },

        {
            id: "products",
            title: "7. Product Listings and Prohibited Items",
            category: "common",
            content: [
                {
                    heading: "7.1 Legal Compliance",
                    text: "All products must comply with applicable laws, safety standards, labeling requirements, intellectual-property rights, consumer-protection requirements, and any category-specific restrictions.",
                },
                {
                    heading: "7.2 Prohibited Products",
                    text: "Users must not list, promote, purchase, or distribute products or services prohibited by law or by the platform's published rules. Restricted categories may include counterfeit goods, stolen property, unlawful substances, prohibited weapons, unsafe products, products that infringe intellectual property, and other legally restricted items.",
                },
                {
                    heading: "7.3 Misleading Listings",
                    text: "Listings must not contain false claims about origin, authenticity, ingredients, performance, certifications, warranties, discounts, availability, or delivery. Fabricated reviews and deceptive promotional claims are prohibited.",
                },
                {
                    heading: "7.4 Listing Moderation",
                    text: "The platform may request clarification, supporting documents, listing corrections, or proof of authorization. Listings may be restricted or removed where reasonably necessary to address legal, safety, fraud, consumer-protection, or policy concerns.",
                },
                {
                    heading: "7.5 Product Complaints",
                    text: "Product complaints may be investigated using available order information, listing details, communications, photographs, invoices, and other relevant evidence. Investigation procedures do not replace rights or remedies available under applicable law.",
                },
            ],
        },

        {
            id: "pricing",
            title: "8. Pricing, Taxes, Payments, and Transactions",
            category: "common",
            content: [
                {
                    heading: "8.1 Displayed Prices",
                    text: "Prices and charges will be displayed through the listing and checkout process. Customers should review the final order total before submitting payment. Any legally required tax or charge must be disclosed and handled as required by law.",
                },
                {
                    heading: "8.2 Pricing Errors",
                    text: "If a material pricing or calculation error is discovered, the platform or seller may take appropriate action permitted by law, including contacting the customer, correcting the error, or cancelling an affected order and arranging any required refund.",
                },
                {
                    heading: "8.3 Payment Providers",
                    text: "Payments may be processed through third-party payment providers, including Razorpay if enabled. Such transactions may also be subject to the provider's terms, security checks, verification requirements, and dispute procedures.",
                },
                {
                    heading: "8.4 Payment Security",
                    text: "Users must use payment methods lawfully and must not use stolen payment credentials, unauthorized accounts, fraudulent chargebacks, or payment-manipulation techniques.",
                },
                {
                    heading: "8.5 Payment Confirmation",
                    text: "An order's payment status may depend on confirmation received from the payment provider. A payment initiation screen or a pending transaction does not necessarily mean that payment has been successfully completed.",
                },
                {
                    heading: "8.6 Failed or Duplicate Payments",
                    text: "If a payment appears to have failed or been duplicated, customers should retain the transaction reference and contact support. Any reversal, settlement, or refund will be handled through the applicable payment-provider process and legal requirements.",
                },
                {
                    heading: "8.7 Seller Charges",
                    text: "Any seller commission, subscription, service fee, shipping charge, payment-processing fee, or other deduction must be disclosed in the applicable seller terms, fee schedule, or transaction statement before it applies, as required by law.",
                },
                {
                    heading: "8.8 Fraud and Verification",
                    text: "The platform or its payment providers may perform lawful verification and fraud-prevention checks. Transactions may be delayed, reviewed, declined, or restricted where reasonably necessary to address suspected fraud, legal obligations, or payment-provider requirements.",
                },
            ],
        },

        {
            id: "orders",
            title: "9. Orders, Cancellations, Returns, and Refunds",
            category: "common",
            content: [
                {
                    heading: "9.1 Order Acceptance",
                    text: "Order placement, payment authorization, seller acceptance, and dispatch may be separate events. The platform's order status and confirmation messages should identify the stage of a particular order.",
                },
                {
                    heading: "9.2 Order Cancellation",
                    text: "Cancellation availability may depend on order status, seller processing, dispatch, product type, applicable law, and the cancellation policy disclosed at checkout. Customers and sellers must follow the cancellation process made available on the platform.",
                },
                {
                    heading: "9.3 Seller Cancellation",
                    text: "If a seller cannot fulfill an order because of stock unavailability, an operational issue, or another valid reason, the seller must promptly follow the platform's cancellation process. Any refund due must be handled in accordance with applicable policy and law.",
                },
                {
                    heading: "9.4 Returns and Exchanges",
                    text: "Return or exchange eligibility, time limits, product condition requirements, exclusions, pickup arrangements, and supporting evidence requirements must be determined by the applicable published return policy, seller conditions, and mandatory consumer law. No term here removes a non-waivable statutory right.",
                },
                {
                    heading: "9.5 Refund Processing",
                    text: "Where a refund is approved or legally required, it will be processed through the applicable payment or refund mechanism. The time for funds to appear may depend on the payment provider and the customer's bank or payment method.",
                },
                {
                    heading: "9.6 Refund Amount",
                    text: "The refund amount, including the treatment of shipping charges, taxes, discounts, and partial returns, will be determined by the applicable policy, the transaction details, and legal requirements. Any permitted deductions or exclusions should be clearly disclosed in the applicable policy.",
                },
                {
                    heading: "9.7 Non-Delivery or Incorrect Products",
                    text: "Customers should report non-delivery, damaged items, missing items, or products materially different from the order through the designated support process. Relevant evidence may be requested where reasonably necessary to investigate the claim.",
                },
                {
                    heading: "9.8 Disputed Transactions",
                    text: "The platform may review order records, payment records, shipping information, tracking events, seller responses, customer communications, and other relevant evidence to help resolve a transaction dispute.",
                },
                {
                    heading: "9.9 Statutory Rights",
                    text: "Nothing in these Terms is intended to exclude, restrict, or override a consumer right or remedy that cannot lawfully be excluded or restricted.",
                },
            ],
        },

        {
            id: "shipping",
            title: "10. Shipping, Delivery, and Tracking",
            category: "common",
            content: [
                {
                    heading: "10.1 Delivery Estimates",
                    text: "Any displayed delivery date or time is an estimate unless explicitly stated as a binding commitment. Actual delivery may be affected by carrier operations, location, weather, public holidays, address accuracy, security checks, and other circumstances.",
                },
                {
                    heading: "10.2 Multiple Shipments",
                    text: "Where an order contains products from different sellers, the products may be dispatched separately and may have different tracking numbers, delivery estimates, and delivery outcomes.",
                },
                {
                    heading: "10.3 Tracking Information",
                    text: "Tracking details are provided where available. Tracking information may be delayed, incomplete, or temporarily unavailable because of carrier systems or data synchronization.",
                },
                {
                    heading: "10.4 Delivery Attempts",
                    text: "Customers should remain available at the delivery address or follow the carrier's instructions. Failed delivery attempts, address issues, or customer unavailability may result in additional delivery attempts or other outcomes under the applicable shipping policy.",
                },
                {
                    heading: "10.5 Delivery Confirmation",
                    text: "Delivery status may be determined using carrier records, delivery confirmation, tracking events, or other available evidence. A delivery status may be reviewed where a reasonable dispute is raised.",
                },
                {
                    heading: "10.6 Shipping Charges",
                    text: "Shipping charges, where applicable, should be displayed before order confirmation. The platform may calculate shipping separately for different sellers or shipments where its checkout system supports this arrangement.",
                },
            ],
        },

        {
            id: "communication",
            title: "11. Marketplace Chat and Communication",
            category: "common",
            content: [
                {
                    heading: "11.1 Permitted Use",
                    text: "Marketplace communication tools may be used for legitimate product enquiries, order coordination, delivery issues, returns, refunds, and other platform-related matters.",
                },
                {
                    heading: "11.2 Acceptable Communication",
                    text: "Users must communicate respectfully and must not send threats, harassment, discriminatory abuse, unsolicited spam, deceptive offers, unlawful content, or messages intended to defraud another user.",
                },
                {
                    heading: "11.3 Personal and Payment Information",
                    text: "Do not request or disclose passwords, OTPs, complete payment-card credentials, unnecessary identity documents, or other sensitive personal information through chat. Use the platform's designated secure processes where available.",
                },
                {
                    heading: "11.4 Moderation",
                    text: "Where automated or manual moderation features are enabled, messages may be checked to detect suspected spam, abuse, fraud, prohibited content, or policy violations. Moderation systems may make mistakes, and users may report issues through available support channels.",
                },
                {
                    heading: "11.5 Monitoring and Records",
                    text: "Communication records may be processed or retained for legitimate operational, safety, dispute-resolution, security, and legal purposes in accordance with the applicable privacy notice and law.",
                },
                {
                    heading: "11.6 No Off-Platform Fraud",
                    text: "Users must not use marketplace communication tools to coordinate fraud, evade lawful restrictions, impersonate platform staff, or deceive other users about payment or delivery status.",
                },
            ],
        },

        {
            id: "reviews",
            title: "12. Reviews, Ratings, and User Content",
            category: "common",
            content: [
                {
                    heading: "12.1 Honest Reviews",
                    text: "Reviews and ratings must reflect genuine experiences and must not contain fabricated claims, manipulated ratings, undisclosed paid endorsements where disclosure is required, or content posted to unfairly damage or promote a business.",
                },
                {
                    heading: "12.2 User Content",
                    text: "You are responsible for the content you submit, including reviews, product images, descriptions, messages, and other materials. You must have the rights and permissions needed to submit that content.",
                },
                {
                    heading: "12.3 Content License",
                    text: "To the extent necessary to operate and promote the marketplace, you grant the platform a non-exclusive, worldwide, royalty-free license to host, reproduce, display, format, and distribute the content you submit through the platform. This license is limited by applicable law and the relevant privacy and content policies.",
                },
                {
                    heading: "12.4 Content Moderation",
                    text: "The platform may remove, restrict, or decline content that violates these Terms, infringes rights, is unlawful, is misleading, or presents a reasonable safety or security concern, subject to applicable law.",
                },
            ],
        },

        {
            id: "privacy",
            title: "13. Privacy and Data Protection",
            category: "common",
            content: [
                {
                    heading: "13.1 Information We May Process",
                    text: "Depending on the features used, the platform may process account details, contact information, delivery addresses, order history, product listings, transaction references, support requests, communications, device or technical information, and security logs.",
                },
                {
                    heading: "13.2 Purposes of Processing",
                    text: "Information may be used to operate accounts, process orders, support payments, coordinate delivery, manage seller activity, provide customer support, prevent fraud, secure the platform, resolve disputes, comply with legal obligations, and improve services.",
                },
                {
                    heading: "13.3 Sharing Information",
                    text: "Information may be shared with relevant sellers, delivery providers, payment processors, technical service providers, support personnel, or authorities where necessary for the relevant transaction, platform operation, legal compliance, or another disclosed lawful purpose.",
                },
                {
                    heading: "13.4 Seller Use of Customer Data",
                    text: "Sellers may use customer information only to fulfill orders, provide required after-sales service, comply with law, and perform other authorized transaction-related activities. Sellers must not sell customer data, use it for unrelated marketing without a lawful basis, or retain it longer than permitted.",
                },
                {
                    heading: "13.5 Security",
                    text: "The platform should apply reasonable and appropriate safeguards to protect information. No internet transmission or storage system can be guaranteed completely secure, and users should also protect their own account credentials and devices.",
                },
                {
                    heading: "13.6 Retention",
                    text: "Information may be retained for as long as necessary for the purposes described in the applicable privacy notice, contractual obligations, dispute handling, security, accounting, and legal requirements.",
                },
                {
                    heading: "13.7 Privacy Notice",
                    text: "The platform's Privacy Policy should explain the actual data collected, purposes, legal grounds where applicable, retention practices, sharing arrangements, user rights, grievance channels, and contact details. These Terms should be published alongside that policy.",
                },
            ],
        },

        {
            id: "intellectual-property",
            title: "14. Intellectual Property",
            category: "common",
            content: [
                {
                    heading: "14.1 Platform Materials",
                    text: "Unless otherwise stated, the platform's software, design, branding, layout, logos, and original content are owned by or licensed to the relevant rights holders and are protected by applicable intellectual-property laws.",
                },
                {
                    heading: "14.2 Limited Use",
                    text: "You may use the platform for its intended lawful purposes. You must not copy, distribute, modify, reverse engineer, scrape, or commercially exploit protected platform materials except as permitted by law or with appropriate authorization.",
                },
                {
                    heading: "14.3 Seller Materials",
                    text: "Sellers retain the rights they own in their product images, descriptions, branding, and other materials, subject to the license required to operate the marketplace and any separate agreement.",
                },
                {
                    heading: "14.4 Infringement Reports",
                    text: "Rights holders may report suspected infringement through the platform's designated contact channel and should provide sufficient details to identify the relevant content and explain the claimed rights. The platform may restrict disputed content while reviewing a report.",
                },
            ],
        },

        {
            id: "prohibited-use",
            title: "15. Prohibited Activities and Platform Security",
            category: "common",
            content: [
                {
                    heading: "15.1 Unlawful Activity",
                    text: "You must not use the platform for fraud, money laundering, unlawful sales, deceptive advertising, unauthorized transactions, harassment, or any other prohibited activity.",
                },
                {
                    heading: "15.2 Technical Misuse",
                    text: "You must not attempt unauthorized access to accounts, APIs, databases, administrative tools, payment systems, or other protected resources. You must not introduce malware, disrupt services, bypass access controls, or exploit vulnerabilities.",
                },
                {
                    heading: "15.3 Automated Access",
                    text: "You must not scrape, crawl, harvest, or systematically collect platform data in a manner that violates these Terms, applicable law, privacy rights, or technical access restrictions.",
                },
                {
                    heading: "15.4 Manipulation",
                    text: "Fake accounts, fake reviews, artificial orders, fraudulent referrals, promotion abuse, price manipulation, and attempts to evade platform fees or restrictions are prohibited.",
                },
                {
                    heading: "15.5 Investigations",
                    text: "We may investigate credible reports of misconduct and take proportionate steps permitted by law, including requesting information, preserving relevant records, restricting features, removing listings, or suspending accounts.",
                },
            ],
        },

        {
            id: "third-party",
            title: "16. Third-Party Services and Links",
            category: "common",
            content: [
                {
                    heading: "16.1 Third-Party Providers",
                    text: "The platform may integrate with payment gateways, email providers, hosting providers, analytics services, delivery providers, and other third-party services. Their availability and processing may be governed by their own terms and policies.",
                },
                {
                    heading: "16.2 External Websites",
                    text: "Links to external websites are provided for convenience where available. Unless expressly stated, the platform does not control every external website's content, availability, security, or policies.",
                },
                {
                    heading: "16.3 Provider Outages",
                    text: "A third-party service interruption may affect payments, authentication, tracking, notifications, or other features. The platform will address relevant issues in accordance with its obligations and applicable law.",
                },
            ],
        },

        {
            id: "disclaimers",
            title: "17. Disclaimers and Limitation of Liability",
            category: "common",
            content: [
                {
                    heading: "17.1 Service Availability",
                    text: "The platform may occasionally be unavailable because of maintenance, technical faults, network issues, security incidents, or third-party service interruptions. We will take reasonable steps to maintain and restore service where appropriate.",
                },
                {
                    heading: "17.2 Product Information",
                    text: "Product descriptions and images are generally supplied by sellers or other relevant sources. Customers should review listing information carefully. The platform does not warrant every independent seller claim unless expressly stated or required by law.",
                },
                {
                    heading: "17.3 No Unlawful Exclusion",
                    text: "To the maximum extent permitted by applicable law, the platform is not responsible for indirect losses arising from matters outside its reasonable control. Nothing in these Terms excludes liability, guarantees, or remedies that cannot legally be excluded or restricted.",
                },
                {
                    heading: "17.4 Seller and Customer Obligations",
                    text: "Each user remains responsible for their own conduct, the accuracy of information they submit, compliance with applicable law, and obligations expressly assigned to them under these Terms.",
                },
                {
                    heading: "17.5 Legal Review",
                    text: "Any exclusion or limitation of liability must be interpreted consistently with applicable consumer-protection laws and other mandatory legal requirements. If a provision is unenforceable, the remaining provisions continue to apply to the extent permitted by law.",
                },
            ],
        },

        {
            id: "indemnity",
            title: "18. Indemnification",
            category: "common",
            content: [
                {
                    heading: "18.1 User Responsibility",
                    text: "To the extent permitted by law, a user may be responsible for reasonable losses, claims, liabilities, and costs arising from their unlawful conduct, material breach of these Terms, infringement of third-party rights, or misuse of the platform.",
                },
                {
                    heading: "18.2 Seller Claims",
                    text: "Where legally enforceable, a seller may be responsible for claims arising from its products, misleading listings, unauthorized product sales, intellectual-property infringement, or failure to meet its legal obligations.",
                },
                {
                    heading: "18.3 Fair Application",
                    text: "Any indemnification obligation is subject to applicable law and does not automatically eliminate the platform's own legal responsibilities or the rights of customers and other users.",
                },
            ],
        },

        {
            id: "termination",
            title: "19. Suspension, Termination, and Account Closure",
            category: "common",
            content: [
                {
                    heading: "19.1 Voluntary Closure",
                    text: "Users may request account closure through the available account settings or support process, subject to unresolved transactions, legal retention obligations, and other applicable requirements.",
                },
                {
                    heading: "19.2 Platform Restrictions",
                    text: "The platform may restrict, suspend, or terminate access for suspected fraud, serious or repeated violations, legal requirements, security threats, or other legitimate reasons, subject to applicable law and any required procedural protections.",
                },
                {
                    heading: "19.3 Pending Orders",
                    text: "Account closure does not automatically cancel existing orders, remove payment obligations, resolve open disputes, or eliminate refund and warranty obligations. Pending matters will be handled under the applicable policies and law.",
                },
                {
                    heading: "19.4 Continuing Provisions",
                    text: "Terms relating to outstanding payments, transaction records, intellectual property, privacy, dispute resolution, liability, and other provisions that reasonably need to continue may survive account closure to the extent permitted by law.",
                },
            ],
        },

        {
            id: "law",
            title: "20. Governing Law and Dispute Resolution",
            category: "common",
            content: [
                {
                    heading: "20.1 Applicable Law",
                    text: "These Terms must be interpreted under the laws applicable to the platform operator and the relevant transaction. Before publication, the platform operator's legal entity, registered address, and intended jurisdiction should be confirmed by a qualified legal professional.",
                },
                {
                    heading: "20.2 Contact and Resolution",
                    text: "Users should first contact the platform's designated support or grievance channel to attempt to resolve a complaint. This process does not prevent a user from exercising a statutory right or approaching a competent authority where permitted by law.",
                },
                {
                    heading: "20.3 Consumer Rights",
                    text: "Nothing in these Terms prevents consumers from exercising rights available under applicable consumer-protection legislation or approaching the appropriate consumer authority or dispute-resolution body.",
                },
                {
                    heading: "20.4 Severability",
                    text: "If a court or competent authority finds a provision invalid or unenforceable, the remaining provisions will continue to apply to the extent legally possible.",
                },
                {
                    heading: "20.5 No Waiver",
                    text: "Failure to enforce a provision immediately does not necessarily waive the right to enforce it later, subject to applicable law.",
                },
            ],
        },

        {
            id: "changes",
            title: "21. Changes to Marketplace Services",
            category: "common",
            content: [
                {
                    heading: "21.1 Service Updates",
                    text: "We may add, modify, suspend, or discontinue features, integrations, or parts of the marketplace for operational, security, legal, or business reasons.",
                },
                {
                    heading: "21.2 Existing Transactions",
                    text: "Changes to platform features will not remove rights or obligations associated with existing transactions where those rights or obligations must continue under applicable law or an existing agreement.",
                },
            ],
        },

        {
            id: "contact",
            title: "22. Contact and Grievances",
            category: "common",
            content: [
                {
                    heading: "22.1 Customer and Seller Support",
                    text: "For questions about these Terms, account access, product listings, payments, orders, delivery, returns, refunds, or seller activity, use the official support channels published on the platform.",
                },
                {
                    heading: "22.2 Contact Details",
                    text: `Email: ${contactEmail}`,
                },
                {
                    heading: "22.3 Legal Business Information",
                    text: "Before publication, add the platform operator's complete legal name, registered office address, business identification details where applicable, and any legally required grievance officer or consumer complaint contact details.",
                },
                {
                    heading: "22.4 Response Times",
                    text: "Any response or complaint-resolution timelines required by law must be followed. Do not publish a specific response-time commitment unless the business can consistently meet it.",
                },
            ],
        },
    ];

    const visibleSections = useMemo(() => {
        let result = sections;

        if (activeView === "customer") {
            result = result.filter(
                (section) =>
                    section.category === "common" ||
                    section.category === "customer"
            );
        } else if (activeView === "seller") {
            result = result.filter(
                (section) =>
                    section.category === "common" ||
                    section.category === "seller"
            );
        }

        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();

            result = result.filter((section) => {
                const titleMatches = section.title
                    .toLowerCase()
                    .includes(query);

                const contentMatches = section.content.some(
                    (item) =>
                        item.heading.toLowerCase().includes(query) ||
                        item.text.toLowerCase().includes(query)
                );

                return titleMatches || contentMatches;
            });
        }

        return result;
    }, [activeView, searchTerm, siteName, contactEmail]);

    const toggleSection = (id) => {
        setExpandedSections((previous) => ({
            ...previous,
            [id]: !previous[id],
        }));
    };

    const expandAll = () => {
        const allExpanded = {};

        visibleSections.forEach((section) => {
            allExpanded[section.id] = true;
        });

        setExpandedSections(allExpanded);
    };

    const collapseAll = () => {
        setExpandedSections({});
    };

 
    const initialView = isCustomer
        ? "customer"
        : isSeller
        ? "seller"
        : "all";

    // The role prop determines the initial audience.
    // Users can switch views unless the page is configured otherwise.
    const [initialized] = useState(true);

    React.useEffect(() => {
        if (initialized) {
            setActiveView(initialView);
        }
    }, [initialView, initialized]);

    return (
        <div className="tc-page">
            <style>{`
                .tc-page {
                    --tc-primary: #2563eb;
                    --tc-text: #1f2937;
                    --tc-muted: #64748b;
                    --tc-border: #e5e7eb;
                    --tc-soft: #f8fafc;
                    color: var(--tc-text);
                    background: #f8fafc;
                    min-height: 100vh;
                    padding: 36px 16px 60px;
                    font-family: Arial, Helvetica, sans-serif;
                }

                .tc-container {
                    width: 100%;
                    max-width: 1120px;
                    margin: 0 auto;
                }

                .tc-hero {
                    background: linear-gradient(135deg, #1e3a8a, #2563eb);
                    color: #fff;
                    padding: 38px 30px;
                    border-radius: 18px;
                    margin-bottom: 24px;
                    box-shadow: 0 12px 32px rgba(37, 99, 235, .14);
                }

                .tc-eyebrow {
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1.8px;
                    font-weight: 700;
                    opacity: .85;
                    margin-bottom: 12px;
                }

                .tc-hero h1 {
                    font-size: clamp(28px, 4vw, 42px);
                    font-weight: 800;
                    margin: 0 0 12px;
                    line-height: 1.2;
                }

                .tc-hero p {
                    max-width: 760px;
                    line-height: 1.8;
                    margin: 0;
                    color: rgba(255,255,255,.9);
                }

                .tc-updated {
                    margin-top: 20px;
                    font-size: 13px;
                    color: rgba(255,255,255,.82);
                }

                .tc-toolbar {
                    background: #fff;
                    border: 1px solid var(--tc-border);
                    border-radius: 14px;
                    padding: 18px;
                    margin-bottom: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .tc-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .tc-tab {
                    border: 1px solid var(--tc-border);
                    background: #fff;
                    padding: 10px 15px;
                    border-radius: 9px;
                    color: #475569;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: .2s ease;
                }

                .tc-tab:hover {
                    border-color: var(--tc-primary);
                    color: var(--tc-primary);
                }

                .tc-tab.active {
                    background: var(--tc-primary);
                    border-color: var(--tc-primary);
                    color: #fff;
                }

                .tc-search {
                    width: 100%;
                    max-width: 310px;
                    padding: 11px 13px;
                    border: 1px solid var(--tc-border);
                    border-radius: 9px;
                    font-size: 14px;
                    outline: none;
                }

                .tc-search:focus {
                    border-color: var(--tc-primary);
                    box-shadow: 0 0 0 3px rgba(37,99,235,.1);
                }

                .tc-layout {
                    display: grid;
                    grid-template-columns: 270px minmax(0, 1fr);
                    gap: 22px;
                    align-items: start;
                }

                .tc-sidebar,
                .tc-main-card {
                    background: #fff;
                    border: 1px solid var(--tc-border);
                    border-radius: 14px;
                }

                .tc-sidebar {
                    padding: 20px;
                    position: sticky;
                    top: 20px;
                }

                .tc-sidebar h3 {
                    font-size: 15px;
                    margin: 0 0 14px;
                    font-weight: 800;
                }

                .tc-toc {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .tc-toc li {
                    margin-bottom: 5px;
                }

                .tc-toc a {
                    display: block;
                    color: #475569;
                    text-decoration: none;
                    padding: 8px 9px;
                    border-radius: 7px;
                    font-size: 12px;
                    line-height: 1.5;
                }

                .tc-toc a:hover {
                    background: #eff6ff;
                    color: var(--tc-primary);
                }

                .tc-main-card {
                    padding: 24px;
                    min-width: 0;
                }

                .tc-intro {
                    background: #eff6ff;
                    border: 1px solid #dbeafe;
                    border-radius: 11px;
                    padding: 16px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    line-height: 1.8;
                }

                .tc-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 18px;
                }

                .tc-action-btn {
                    background: #fff;
                    border: 1px solid var(--tc-border);
                    border-radius: 8px;
                    padding: 9px 12px;
                    cursor: pointer;
                    color: #334155;
                    font-size: 12px;
                    font-weight: 700;
                }

                .tc-action-btn:hover {
                    background: var(--tc-soft);
                    border-color: #cbd5e1;
                }

                .tc-section {
                    border: 1px solid var(--tc-border);
                    border-radius: 11px;
                    margin-bottom: 12px;
                    overflow: hidden;
                    scroll-margin-top: 20px;
                }

                .tc-section-heading {
                    width: 100%;
                    border: 0;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                    text-align: left;
                    padding: 17px;
                    font-size: 15px;
                    font-weight: 800;
                    color: #1e293b;
                    cursor: pointer;
                }

                .tc-section-heading:hover {
                    background: #f8fafc;
                }

                .tc-chevron {
                    color: var(--tc-primary);
                    font-size: 19px;
                    flex-shrink: 0;
                }

                .tc-section-content {
                    border-top: 1px solid var(--tc-border);
                    padding: 8px 18px 18px;
                }

                .tc-article {
                    padding-top: 15px;
                }

                .tc-article h4 {
                    font-size: 14px;
                    font-weight: 800;
                    color: #334155;
                    margin: 0 0 7px;
                }

                .tc-article p {
                    color: #64748b;
                    font-size: 13px;
                    line-height: 1.9;
                    margin: 0;
                    overflow-wrap: anywhere;
                }

                .tc-empty {
                    text-align: center;
                    padding: 40px 12px;
                    color: var(--tc-muted);
                }

                .tc-contact {
                    background: #f8fafc;
                    border: 1px solid var(--tc-border);
                    padding: 20px;
                    margin-top: 20px;
                    border-radius: 11px;
                }

                .tc-contact h3 {
                    font-size: 16px;
                    font-weight: 800;
                    margin: 0 0 9px;
                }

                .tc-contact p {
                    font-size: 13px;
                    line-height: 1.8;
                    color: var(--tc-muted);
                    margin: 0;
                }

                .tc-contact a {
                    color: var(--tc-primary);
                    font-weight: 700;
                    overflow-wrap: anywhere;
                }

                .tc-footer {
                    text-align: center;
                    margin-top: 25px;
                    color: #94a3b8;
                    font-size: 12px;
                    line-height: 1.8;
                }

                @media (max-width: 850px) {
                    .tc-layout {
                        grid-template-columns: 1fr;
                    }

                    .tc-sidebar {
                        position: static;
                    }

                    .tc-toc {
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 2px 8px;
                    }

                    .tc-search {
                        max-width: none;
                    }
                }

                @media (max-width: 520px) {
                    .tc-page {
                        padding: 18px 10px 36px;
                    }

                    .tc-hero {
                        padding: 27px 20px;
                        border-radius: 13px;
                    }

                    .tc-toolbar,
                    .tc-main-card {
                        padding: 15px;
                    }

                    .tc-tabs {
                        width: 100%;
                    }

                    .tc-tab {
                        flex: 1;
                        padding: 10px 8px;
                        font-size: 12px;
                    }

                    .tc-toc {
                        grid-template-columns: 1fr;
                    }

                    .tc-section-heading {
                        padding: 14px;
                        font-size: 13px;
                    }

                    .tc-section-content {
                        padding: 7px 13px 15px;
                    }
                }

                @media print {
                    .tc-page {
                        background: #fff;
                        padding: 0;
                    }

                    .tc-hero {
                        background: #fff !important;
                        color: #111 !important;
                        border: 1px solid #ddd;
                        box-shadow: none;
                    }

                    .tc-hero p,
                    .tc-updated {
                        color: #333 !important;
                    }

                    .tc-toolbar,
                    .tc-sidebar,
                    .tc-actions {
                        display: none !important;
                    }

                    .tc-layout {
                        display: block;
                    }

                    .tc-main-card {
                        border: 0;
                        padding: 0;
                    }

                    .tc-section {
                        break-inside: avoid;
                    }

                    .tc-section-content {
                        display: block !important;
                    }

                    .tc-section-heading {
                        color: #111;
                    }
                }
            `}</style>

            <div className="tc-container">
                <header className="tc-hero">
                    <div className="tc-eyebrow">
                        Legal Information
                    </div>

                    <h1>Terms & Conditions</h1>

                    <p>
                        Welcome to {siteName}. These Terms and Conditions
                        explain the rules, responsibilities, and conditions
                        that apply when customers and sellers use our
                        marketplace. Please read them carefully before
                        placing an order or listing a product.
                    </p>

                    <div className="tc-updated">
                        Last updated: {lastUpdated}
                    </div>
                </header>

                <div className="tc-toolbar">
                    <div className="tc-tabs">
                        <button
                            type="button"
                            className={`tc-tab ${
                                activeView === "all" ? "active" : ""
                            }`}
                            onClick={() => setActiveView("all")}
                        >
                            All Terms
                        </button>

                        <button
                            type="button"
                            className={`tc-tab ${
                                activeView === "customer" ? "active" : ""
                            }`}
                            onClick={() => setActiveView("customer")}
                        >
                            Customer Terms
                        </button>

                        <button
                            type="button"
                            className={`tc-tab ${
                                activeView === "seller" ? "active" : ""
                            }`}
                            onClick={() => setActiveView("seller")}
                        >
                            Seller Terms
                        </button>
                    </div>

                    <input
                        type="search"
                        className="tc-search"
                        placeholder="Search terms and conditions..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        aria-label="Search terms and conditions"
                    />
                </div>

                <div className="tc-layout">
                    <aside className="tc-sidebar">
                        <h3>Table of Contents</h3>

                        {visibleSections.length > 0 ? (
                            <ul className="tc-toc">
                                {visibleSections.map((section) => (
                                    <li key={section.id}>
                                        <a href={`#${section.id}`}>
                                            {section.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="tc-article">
                                No matching sections.
                            </p>
                        )}
                    </aside>

                    <main className="tc-main-card">
                        <div className="tc-intro">
                            <strong>Important:</strong> These Terms are a
                            general marketplace policy draft. They should be
                            reviewed and customized to reflect your actual
                            business entity, payment arrangements, shipping
                            process, cancellation and refund policies, and
                            applicable laws before publication.
                        </div>

                        <div className="tc-actions">
                            <button
                                type="button"
                                className="tc-action-btn"
                                onClick={expandAll}
                            >
                                Expand All
                            </button>

                            <button
                                type="button"
                                className="tc-action-btn"
                                onClick={collapseAll}
                            >
                                Collapse All
                            </button>

                        </div>

                        {visibleSections.length > 0 ? (
                            visibleSections.map((section) => {
                                const isExpanded =
                                    Boolean(expandedSections[section.id]) ||
                                    Boolean(searchTerm.trim());

                                return (
                                    <section
                                        className="tc-section"
                                        id={section.id}
                                        key={section.id}
                                    >
                                        <button
                                            type="button"
                                            className="tc-section-heading"
                                            onClick={() =>
                                                toggleSection(section.id)
                                            }
                                            aria-expanded={isExpanded}
                                            aria-controls={`${section.id}-content`}
                                        >
                                            <span>{section.title}</span>

                                            <span className="tc-chevron">
                                                {isExpanded ? "−" : "+"}
                                            </span>
                                        </button>

                                        {isExpanded && (
                                            <div
                                                className="tc-section-content"
                                                id={`${section.id}-content`}
                                            >
                                                {section.content.map(
                                                    (item, index) => (
                                                        <article
                                                            className="tc-article"
                                                            key={`${section.id}-${index}`}
                                                        >
                                                            <h4>
                                                                {item.heading}
                                                            </h4>

                                                            <p>{item.text}</p>
                                                        </article>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </section>
                                );
                            })
                        ) : (
                            <div className="tc-empty">
                                <h3>No matching terms found</h3>

                                <p>
                                    Try searching with a different keyword.
                                </p>
                            </div>
                        )}

                        <div className="tc-contact">
                            <h3>Questions About These Terms?</h3>

                            <p>
                                For assistance with accounts, orders,
                                product listings, payments, delivery, or
                                other marketplace matters, contact our
                                support team through the official support
                                channels published on the website.
                                <br />
                                Email:{" "}
                                <a href={`mailto:${contactEmail}`}>
                                    {contactEmail}
                                </a>
                            </p>
                        </div>

                        <div className="tc-footer">
                            © {new Date().getFullYear()} {siteName}.
                            All rights reserved.
                            <br />
                            Please also review the Privacy Policy and any
                            applicable shipping, cancellation, return, and
                            refund policies.
                        </div>
                    </main>
                </div>
            </div>
            {loading && <GlobalLoader />}
        </div>
    );
};

export default TermsAndConditions;
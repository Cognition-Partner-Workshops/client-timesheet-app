# Macy's iOS Mobile App - Comprehensive Features Document

> **Purpose:** RAG context document capturing all features available in the Macy's iOS mobile application. This document serves as the domain knowledge base for building a Retrieval-Augmented Generation (RAG) system for a Macy's-like retail mobile application.

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [Home Screen / For You Page](#2-home-screen--for-you-page)
3. [Navigation & Information Architecture](#3-navigation--information-architecture)
4. [Product Browsing & Discovery](#4-product-browsing--discovery)
5. [Search](#5-search)
6. [Product Detail View](#6-product-detail-view)
7. [Shopping Bag & Checkout](#7-shopping-bag--checkout)
8. [Account & Profile](#8-account--profile)
9. [Star Rewards Loyalty Program](#9-star-rewards-loyalty-program)
10. [Macy's Pay (In-Store Payment)](#10-macys-pay-in-store-payment)
11. [In-Store Features](#11-in-store-features)
12. [Favorites & Wishlists](#12-favorites--wishlists)
13. [Gift Registry](#13-gift-registry)
14. [Order Management](#14-order-management)
15. [Store Locator & Services](#15-store-locator--services)
16. [Notifications & Alerts](#16-notifications--alerts)
17. [Deals, Sales & Promotions](#17-deals-sales--promotions)
18. [Macy's Credit Card Management](#18-macys-credit-card-management)
19. [Gift Cards](#19-gift-cards)
20. [Customer Service & Support](#20-customer-service--support)
21. [Privacy & Data](#21-privacy--data)
22. [Accessibility](#22-accessibility)
23. [Technical Specifications](#23-technical-specifications)
24. [Competitor Landscape](#24-competitor-landscape)

---

## 1. App Overview

### 1.1 App Identity
| Field | Value |
|---|---|
| **App Name** | Macy's: Online Shopping & Save |
| **Subtitle** | Shop: Clothing, Gifts & Sales |
| **Developer** | Macys Inc |
| **App Store ID** | 341036067 |
| **App Store URL** | https://apps.apple.com/us/app/macys/id341036067 |
| **Category** | Shopping |
| **Price** | Free |
| **Platform** | iPhone only (Designed for iPhone) |
| **Current Version** | 2602.2.0 |
| **Size** | 195.5 MB |
| **Language** | English |
| **Age Rating** | 4+ |
| **Minimum iOS** | Requires iOS 15.0 or later |
| **Copyright** | 2026 Macy's, Inc. |

### 1.2 App Store Ratings
| Metric | Value |
|---|---|
| **Overall Rating** | 4.9 out of 5 |
| **Total Ratings** | 2.2 Million |
| **Rating Breakdown** | Overwhelmingly 5-star |

### 1.3 App Store Tagline
"Discover the latest trends, inspo & more with the Macy's app"

### 1.4 Key Value Propositions
- **Exclusive Savings:** App-only offers, early access drops, and limited-time deals
- **Trend Discovery:** Newest trends and style inspiration with personalized "For You" page
- **Seamless Shopping:** Shop from anywhere with a mobile-optimized experience
- **Order Tracking:** Easy order tracking and management
- **In-Store Integration:** Barcode scanning, price checking, and Macy's Pay
- **Star Rewards:** Track points, status, and Star Money on the go

### 1.5 Other Apps by Macys Inc
| App | Description |
|---|---|
| **Wish Writer** | Games category app |
| **Parade Ready** | "It's the Best Thursday Ever" - Thanksgiving Parade themed app |

---

## 2. Home Screen / For You Page

### 2.1 Personalized "For You" Page
- **Features:**
  - Personalized product picks based on browsing and purchase history
  - Curated deals tailored to user preferences
  - Personalized collections and style recommendations
  - Dynamic content that updates based on user behavior
  - Greeting with user name (e.g., "Hi, Samantha")
  - Star Money balance display (e.g., "$70 Star Money")
  - Star Money expiration notice (e.g., "You have $40 expiring in 30 days")

### 2.2 Promotional Content
- **Features:**
  - Hero banners with current sales (e.g., "Our Biggest Fall Sale 40-60% OFF")
  - Category quick-access buttons (Women, Men, Kids & Toys)
  - Brand-specific promotions (e.g., "Receive 20% off select styles from COACH")
  - Promo code display (e.g., "Promo Code: APPONLY")
  - Sale countdown and end dates (e.g., "Ends Sunday")
  - Category-specific deal cards (Home, Bed & Bath, etc.)

### 2.3 Seasonal & Event Content
- **Features:**
  - Holiday Gift Guide integration
  - Valentine's Day Gift Guide (Live Events)
  - Seasonal trending collections
  - "14 Days of Gifting" curated lists
  - Festive decor and holiday-specific product highlights

---

## 3. Navigation & Information Architecture

### 3.1 Bottom Tab Bar Navigation
- **Primary Tabs (estimated from standard e-commerce app patterns):**
  - Home / For You
  - Shop / Browse
  - Search
  - Bag / Cart
  - Account / Profile

### 3.2 Department Categories
| Department | Products |
|---|---|
| Women | Apparel, streetwear, everyday basics, going-out looks |
| Men | Apparel, streetwear, everyday basics, going-out looks |
| Kids | Children's clothing and accessories |
| Beauty | Prestige, derm-trusted, and clean brands; skincare, makeup, fragrance |
| Shoes | Sneakers, casual shoes, boots, slippers (Nike, adidas, Converse, Birkenstock) |
| Handbags | Totes, crossbody, satchels, backpacks, small leather goods (Coach, Michael Kors, Kate Spade, Tory Burch) |
| Jewelry & Watches | Fine and fashion jewelry, watches, accessories |
| Home | Kitchen, dining, bedding, bath, holiday decor |
| Furniture & Mattresses | Furniture, mattresses, home furnishings |
| Toys"R"Us at Macy's | LEGO, Barbie, Hot Wheels, NERF, PAW Patrol |
| Electronics | Consumer electronics, tech accessories |
| Holiday Lane | Decor, ornaments, tree decorations, mantle accessories |

### 3.3 Quick Access Features
- **Features:**
  - Search bar with text input
  - Category browsing via department navigation
  - Brand browsing
  - Sale/deals section
  - Recently viewed items
  - Personalized recommendations

---

## 4. Product Browsing & Discovery

### 4.1 Category Browsing
- **Features:**
  - Hierarchical category navigation (Department > Category > Subcategory)
  - Visual category cards with images
  - Featured categories and trending collections
  - Brand-specific shops
  - New arrivals sections

### 4.2 Product Listing
- **Features:**
  - Product grid view with images
  - Product cards showing:
    - Product image
    - Heart/Wishlist icon
    - Brand name
    - Product title
    - Pricing (sale price, original price, discount percentage)
    - Star Money earning information
    - Star ratings with review count
    - Color swatches
    - Deal badges ("Limited-Time Special", "Clearance", "New")
  - Sorting options (Featured, Price, Ratings, Best Sellers, New Arrivals)
  - Filtering by department, brand, price, color, size
  - Pagination / infinite scroll

### 4.3 Style Inspiration
- **Features:**
  - Trend discovery feed
  - Curated style collections
  - Seasonal lookbooks
  - "Trending now" sections
  - Editor's picks and recommendations

---

## 5. Search

### 5.1 Search Functionality
- **Features:**
  - Text-based keyword search
  - Search bar with placeholder text ("What are you looking for today?")
  - Auto-suggest / autocomplete
  - Search by:
    - Product name
    - Brand name
    - Category keyword
    - SKU / product ID
  - Recent searches history
  - Trending searches
  - Search results with full filtering and sorting capabilities

### 5.2 Barcode Scanner (In-Store)
- **Features:**
  - Camera-based barcode scanning
  - Scan products in store to:
    - Check current prices
    - View available colors
    - View available sizes
    - Read customer reviews
    - Check online availability
  - Quick add-to-bag from scan results

---

## 6. Product Detail View

### 6.1 Product Images
- **Features:**
  - High-resolution product photography
  - Multiple image views (front, back, side, detail)
  - Swipeable image gallery
  - Pinch-to-zoom functionality
  - Model/lifestyle imagery

### 6.2 Product Information
- **Features:**
  - Brand name (linked to brand shop)
  - Product title
  - Star rating with total review count
  - Pricing display:
    - Current/sale price
    - Original price (strikethrough)
    - Discount percentage
    - Deal badge type
  - Star Money earning information
  - Product description
  - Size & Fit details
  - Material/fabric composition
  - Care instructions
  - Product specifications

### 6.3 Product Selection
- **Features:**
  - Color selection with visual swatches
  - Size selection
  - Size chart/guide
  - Quantity selector
  - "Add to Bag" primary action
  - "Add to Favorites" heart icon
  - Share product functionality

### 6.4 Availability & Fulfillment
- **Features:**
  - Store availability checker
  - Shipping availability and estimated delivery
  - Same-Day Delivery availability (select ZIP codes)
  - Next-Day Delivery availability (select ZIP codes)
  - In-store pickup availability
  - Curbside pickup availability
  - Free shipping threshold information

### 6.5 Payment Options Display
- **Features:**
  - Klarna "Pay in 4" installment information
  - Macy's Credit Card benefits information
  - Star Money earning preview

### 6.6 Customer Reviews
- **Features:**
  - Overall star rating
  - Total review count
  - Rating distribution
  - Individual reviews with:
    - Star rating
    - Review title and body
    - Reviewer name
    - Review date
    - Helpful/Not helpful voting
    - Verified Buyer badge
  - Review sorting and filtering
  - "Write a Review" option

### 6.7 Related & Recommended Products
- **Features:**
  - "Customers Also Shopped" carousel
  - "You Might Also Like" recommendations
  - "Complete the Look" suggestions
  - Recently viewed items
  - "Bundle & Save" promotions

---

## 7. Shopping Bag & Checkout

### 7.1 Shopping Bag
- **Features:**
  - Product line items with:
    - Product thumbnail image
    - Brand and product name
    - Selected color, size, quantity
    - Unit price and line total
    - Edit item details
    - Remove item
    - Move to Favorites
  - Quantity adjustment
  - Promo code / coupon input
  - Order summary:
    - Subtotal
    - Estimated shipping
    - Estimated tax
    - Discount/savings breakdown
    - Order total
  - Free shipping progress indicator
  - Star Money earning preview
  - Bonus offer items
  - "Continue Shopping" navigation
  - Product recommendations in empty bag state

### 7.2 Checkout Process
- **Features:**
  - Streamlined mobile checkout flow
  - Shipping address entry/selection
  - Shipping method selection:
    - Standard shipping
    - Express shipping
    - Same-Day Delivery (select areas, fees may apply)
    - Next-Day Delivery (select areas, fees may apply)
    - In-store pickup
    - Curbside pickup
  - Payment method selection:
    - Macy's Credit Card
    - Visa, Mastercard, American Express, Discover
    - PayPal
    - Klarna (pay in 4 installments)
    - Apple Pay
    - Gift cards
    - Star Money redemption
  - Order review and confirmation
  - Guest checkout option
  - Saved addresses for returning customers
  - Saved payment methods
  - Simplified checkout for cardholders

### 7.3 Post-Purchase
- **Features:**
  - Order confirmation screen
  - Order number and details
  - Estimated delivery date
  - Email confirmation
  - Link to order tracking

---

## 8. Account & Profile

### 8.1 Authentication
- **Features:**
  - Email and password sign-in
  - "Keep me signed in" option
  - Password show/hide toggle
  - Forgot password flow
  - Create account with Star Rewards enrollment
  - Biometric login (Face ID / Touch ID)

### 8.2 Account Dashboard
- **Features:**
  - Profile information management
  - Order history
  - Saved addresses
  - Saved payment methods
  - Star Rewards status and balance
  - Macy's Credit Card management
  - Communication preferences
  - Notification settings
  - App settings

### 8.3 Profile Management
- **Features:**
  - Name, email, phone number updates
  - Password change
  - Address book management (add/edit/delete)
  - Payment method management
  - Marketing preferences
  - Push notification preferences

---

## 9. Star Rewards Loyalty Program

### 9.1 Star Rewards Tracking
- **Features:**
  - Points balance display
  - Tier status (Bronze, Silver, Gold, Platinum)
  - Progress toward next tier
  - Available Star Money balance
  - Star Money expiration alerts (e.g., "$40 expiring in 30 days")
  - Star Money earning history
  - Earning rate: 1 point per $1 on qualifying purchases

### 9.2 Star Rewards Benefits
| Benefit | Description |
|---|---|
| Free Returns | Complimentary return shipping |
| Free Shipping | At $39 purchase threshold |
| Point Earning | 1 point per $1 spent |
| Star Money | $10 reward per earning threshold |
| Bonus Days | Accelerated earning periods |
| Birthday Surprise | Special birthday reward |
| Exclusive Offers | Member-only deals and early access |
| Cardholder Extras | Additional benefits for Macy's cardholders |

### 9.3 Star Money Redemption
- **Features:**
  - Star Money balance visible in app header
  - Redemption during special events
  - Apply Star Money at checkout
  - Bonus-point opportunities throughout seasons

---

## 10. Macy's Pay (In-Store Payment)

### 10.1 Macy's Pay Features
- **Features:**
  - Mobile payment system for use in select Macy's stores
  - Fast checkout at register
  - Links to Macy's Credit Card
  - QR code or NFC-based payment (store register integration)
  - Digital receipt generation
  - Star Rewards points automatically credited
  - Eliminates need to carry physical credit card

---

## 11. In-Store Features

### 11.1 Barcode Scanner
- **Features:**
  - Camera-based barcode scanning
  - Instant price check on any in-store product
  - View available colors not displayed in store
  - View available sizes not on floor
  - Read customer reviews while in store
  - Check online availability if out of stock in store
  - Quick add-to-bag for ship-to-home orders

### 11.2 Store Mode
- **Features:**
  - Store-specific inventory availability
  - In-store navigation assistance
  - Current store promotions and events
  - Store hours and contact information
  - Department locations

### 11.3 In-Store Pickup
- **Features:**
  - Buy Online, Pick Up In Store (BOPIS)
  - Curbside pickup option
  - Ready notifications when order is available
  - Pickup deadline information (e.g., "Order by 4PM local time")
  - Pickup location directions

---

## 12. Favorites & Wishlists

### 12.1 Favorites Functionality
- **Features:**
  - Save items with heart icon tap
  - Create custom categories/lists (e.g., Kitchen, Gym Clothes, Shoes, Winter Coats, Purses, Dresses)
  - Price-drop alerts on favorited items
  - Push notifications for price changes
  - Share lists with family and friends
  - Move items from favorites to bag
  - View favorites offline (cached)

### 12.2 List Management
- **Features:**
  - Multiple lists support
  - Custom list naming
  - Category organization within favorites
  - List sharing via link
  - Collaborative list editing

---

## 13. Gift Registry

### 13.1 Registry Features
- **Features:**
  - Create and manage gift registries
  - Registry types: Wedding, Baby, Birthday, Holiday
  - Add items to registry from product pages
  - Track gifts purchased from registry
  - Share registry with family and friends
  - Set desired quantity for each item
  - Registry completion discount
  - Registry search by name or event
  - In-app registry management
  - Sync with web-based registry

---

## 14. Order Management

### 14.1 Order Tracking
- **Features:**
  - Real-time order status updates
  - Shipping carrier tracking integration
  - Estimated delivery dates
  - Push notifications for order status changes:
    - Order confirmed
    - Order shipped
    - Out for delivery
    - Delivered
    - Ready for pickup (BOPIS)
  - Order history with full details
  - Order lookup by order number

### 14.2 Returns & Exchanges
- **Features:**
  - Initiate returns from app
  - Return label generation
  - Return shipping instructions
  - In-store return option
  - Return status tracking
  - Refund status updates
  - Free returns for Star Rewards members

---

## 15. Store Locator & Services

### 15.1 Store Finder
- **Features:**
  - GPS-based nearby store detection
  - Search by ZIP code, city, or state
  - Store details:
    - Address with map
    - Phone number
    - Store hours (regular and holiday)
    - Available services
    - Departments list
  - Directions integration (Apple Maps)
  - Set preferred/home store
  - Store-specific inventory checking

### 15.2 In-Store Services
| Service | Description |
|---|---|
| Curbside Pickup | Order online, pick up at curb |
| In-Store Pickup | Order online, pick up at counter |
| Personal Stylist | Book personal shopping appointments |
| Store Events | View upcoming in-store events |
| LensCrafters | Book eye exams at select locations |
| Macy's Backstage | Off-price shopping at select stores |

---

## 16. Notifications & Alerts

### 16.1 Push Notification Types
- **Features:**
  - App-only exclusive offers
  - Early access drops and limited-time deals
  - Star Money Bonus Days alerts
  - Price-drop alerts on favorited items
  - Order status updates (shipped, delivered, ready for pickup)
  - Star Money expiration reminders
  - Flash sale announcements
  - Personalized deal alerts
  - Seasonal event notifications
  - Birthday surprise notifications
  - Abandoned cart reminders
  - Back-in-stock alerts

### 16.2 Notification Settings
- **Features:**
  - Granular notification preference controls
  - Enable/disable by notification type
  - Quiet hours settings
  - Marketing vs. transactional notification management

---

## 17. Deals, Sales & Promotions

### 17.1 Deals Discovery
- **Features:**
  - Deals section/tab in app
  - Current sale banners and promotions
  - Category-specific deals
  - Limited-Time Specials with countdown
  - Clearance section
  - Flash sales
  - App-exclusive promotions

### 17.2 Wallet & Offers
- **Features:**
  - Digital wallet organizing all available offers
  - Automatic best-offer application at checkout
  - Promo code entry at checkout
  - Star Money redemption offers
  - Cardholder-exclusive deals
  - Coupon clipping/saving

### 17.3 Promotion Types
| Type | Description |
|---|---|
| App-Only Offers | Exclusive discounts for mobile app users |
| Early Access | First access to new products and sales |
| Limited-Time Special | Time-bound price reductions |
| Clearance | End-of-season markdowns |
| Flash Sales | Short-duration deep discounts |
| Promo Codes | Code-based discounts (e.g., "APPONLY") |
| Star Money Bonus Days | Accelerated rewards earning |
| Bundle & Save | Multi-buy discounts |
| Free Gift with Purchase | GWP promotions |
| New Customer Discount | First-order savings |
| Credit Card Opening | 30% off when opening Macy's card |

---

## 18. Macy's Credit Card Management

### 18.1 Card Management Features
- **Features:**
  - View Macy's Credit Card account details
  - Make credit card payments directly in app
  - View payment history
  - View statements
  - Check available credit
  - Set up autopay
  - Payment due date reminders
  - Apply for Macy's Credit Card
  - Pre-qualification check (no credit score impact)
  - Cardholder-exclusive offers and events

### 18.2 Cardholder Benefits in App
- **Features:**
  - Extra Star Money earning on purchases
  - Exclusive cardholder sales and events
  - Free shipping upgrades
  - Simplified checkout with saved card
  - Birthday surprise rewards
  - Star Money Bonus Days accelerated earning

---

## 19. Gift Cards

### 19.1 Gift Card Features
- **Features:**
  - Purchase physical gift cards
  - Purchase and send e-gift cards (digital delivery)
  - Gift card balance check
  - Multiple denomination options
  - Custom amount entry
  - Personalized messages
  - Gift card redemption at checkout
  - Gift card as payment method

---

## 20. Customer Service & Support

### 20.1 In-App Support
- **Features:**
  - FAQs and Help center
  - Chat with customer service agent
  - Order lookup and issue reporting
  - Returns initiation
  - Contact phone numbers
  - Email support
  - Feedback submission ("Tell Us What You Think")

### 20.2 Support Topics
- Order issues (missing, damaged, wrong items)
- Returns and exchanges
- Shipping inquiries
- Payment and billing questions
- Star Rewards program questions
- Gift card issues
- Store-related inquiries
- Technical app support

---

## 21. Privacy & Data

### 21.1 Data Used to Track You
The following data may be used to track users across apps and websites owned by other companies:
- Purchases
- Identifiers
- Usage Data

### 21.2 Data Linked to Your Identity
The following data may be collected and linked to user identity:
- Purchases
- Financial Info
- Location
- Contact Info
- User Content
- Search History
- Identifiers
- Usage Data

### 21.3 Data Not Linked to Identity
The following data may be collected but is not linked to user identity:
- User Content
- Diagnostics
- Other Data

### 21.4 Location Usage
- The app may use location even when it isn't open
- Used for: store locator, local inventory, delivery area check, in-store features
- Note: Can decrease device battery life

### 21.5 Privacy Policy
- **URL:** https://customerservice-macys.com/articles/privacy-policy
- Developer: Macys Inc
- Privacy practices may vary based on features used or user age

---

## 22. Accessibility

### 22.1 Current Status
- The developer has not yet indicated which specific accessibility features the app supports on the App Store listing
- Standard iOS accessibility features are supported through the platform:
  - VoiceOver screen reader compatibility
  - Dynamic Type support
  - High contrast mode
  - Reduce Motion
  - Switch Control

---

## 23. Technical Specifications

### 23.1 App Requirements
| Specification | Detail |
|---|---|
| **Minimum OS** | iOS 15.0 or later |
| **Device** | iPhone only |
| **App Size** | 195.5 MB |
| **Language** | English only |
| **Network** | Requires internet connection for most features |
| **Location Services** | Used for store locator, inventory, in-store features; may run in background |
| **Camera** | Required for barcode scanning |
| **Biometrics** | Face ID / Touch ID for login |
| **Push Notifications** | Supported for deals, orders, and alerts |

### 23.2 Version History
| Version | Date | Notes |
|---|---|---|
| 2602.2.0 | February 2026 | Bug fixes and miscellaneous improvements |

### 23.3 App Store Links
| Platform | URL |
|---|---|
| iOS (App Store) | https://apps.apple.com/us/app/macys/id341036067 |
| Android (Google Play) | https://play.google.com/store/apps/details?id=com.macys.android |

---

## 24. Competitor Landscape

### 24.1 Similar Apps (App Store "You Might Also Like")
| App | Tagline |
|---|---|
| Kohl's - Shopping & Discounts | Get rewards & access deals |
| JCPenney - Shopping & Coupons | Shop clothes, shoes & bedding |
| Target: Shop Deals & Trends | Style, decor, beauty & more |
| Old Navy: Shop for New Clothes | Clothing & Fashion at a Value |
| Nordstrom | Clothing, Shoes & Handbags |
| Victoria's Secret - Bras & More | Shop Lingerie, Clothes, Beauty |
| Ulta Beauty: Makeup & Skincare | Top brand haircare & fragrance |
| Sephora US: Makeup & Skincare | Shop Inclusive Beauty Brands |
| Gap: Apparel, denim and more | Shop Women, Men, Kids and Baby |
| Ralph Lauren: Luxury Shopping | Shop Designer Clothing & More |

---

## Appendix A: Key App-Exclusive Features vs. Website

| Feature | App | Website |
|---|---|---|
| Barcode Scanner | Yes | No |
| Macy's Pay (in-store) | Yes | No |
| Push Notifications | Yes | No (email/text only) |
| Price-Drop Alerts | Yes (push) | No (email only) |
| Face ID / Touch ID Login | Yes | No |
| App-Only Promo Codes | Yes | No |
| For You Personalized Page | Yes (enhanced) | Limited |
| Offline Favorites Access | Yes (cached) | No |
| Camera-based Search | Yes | No |
| In-Store Mode | Yes | No |
| Digital Wallet for Offers | Yes | No |
| Apple Pay Integration | Yes | Limited |

## Appendix B: Key Brands Available

### Fashion & Apparel
- Calvin Klein, Ralph Lauren / Polo, Tommy Hilfiger, DKNY / Donna Karan
- Michael Kors (MICHAEL Michael Kors), Karl Lagerfeld
- Nike, adidas, Converse, The North Face, Free People
- INC International Concepts (Macy's exclusive), On 34th (Macy's exclusive)
- Style & Co (Macy's exclusive), Charter Club (Macy's exclusive)

### Handbags & Accessories
- Coach, Kate Spade, Tory Burch, Michael Kors
- DKNY, Karl Lagerfeld, Steve Madden

### Shoes
- Nike, adidas, Converse, Birkenstock, UGG
- Clarks, Steve Madden, Sam Edelman

### Beauty & Fragrance
- Lancome, Clinique, Estee Lauder, MAC
- Good American, Ray-Ban, Oakley

### Toys (Toys"R"Us at Macy's)
- LEGO, Barbie, Hot Wheels, NERF, PAW Patrol

## Appendix C: User Review Insights (Feature Feedback)

### Highly Praised Features (from 5-star reviews)
- Star Rewards integration and point tracking
- Tier progress visibility
- Macy's card payment management
- Digital wallet with automatic offer application
- Seamless checkout experience
- VIP-like shopping experience

### Common User Pain Points (from 2-star reviews)
- Gift card redemption issues during checkout
- Inventory availability discrepancies (items show available but error on purchase)
- Favorites category organization (users want icon-based category navigation, not scroll-through)
- Registry item quantity management (items not adding with correct quantity)
- Registry color option changes require re-searching instead of in-place editing

---

*Document generated: February 2026*
*Source: Apple App Store listing, Macy's app enhancement page (macys.com/s/enhance-app/), and user review analysis*
*Purpose: RAG context for domain mobile application development*

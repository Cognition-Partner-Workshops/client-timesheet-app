# Macy's (www.macys.com) - Comprehensive Site Features Document

> **Purpose:** RAG context document capturing all features available on the Macy's e-commerce platform, organized by page/section. This document serves as the domain knowledge base for building a Retrieval-Augmented Generation (RAG) system for a Macy's-like retail application.

---

## Table of Contents

1. [Site Overview](#1-site-overview)
2. [Global Header & Navigation](#2-global-header--navigation)
3. [Homepage](#3-homepage)
4. [Category / Department Pages](#4-category--department-pages)
5. [Product Listing Page (PLP)](#5-product-listing-page-plp)
6. [Product Detail Page (PDP)](#6-product-detail-page-pdp)
7. [Shopping Bag / Cart](#7-shopping-bag--cart)
8. [Checkout Flow](#8-checkout-flow)
9. [Account & Authentication](#9-account--authentication)
10. [Search](#10-search)
11. [Deals, Sales & Promotions](#11-deals-sales--promotions)
12. [Gift Registry](#12-gift-registry)
13. [Store Locator & Services](#13-store-locator--services)
14. [Customer Service & Support](#14-customer-service--support)
15. [Macy's Credit Card](#15-macys-credit-card)
16. [Star Rewards Loyalty Program](#16-star-rewards-loyalty-program)
17. [Gift Cards](#17-gift-cards)
18. [Footer & Legal](#18-footer--legal)
19. [Social Media Integration](#19-social-media-integration)
20. [Mobile & App Features](#20-mobile--app-features)
21. [SEO & Content Pages](#21-seo--content-pages)
22. [Accessibility Features](#22-accessibility-features)
23. [Third-Party Integrations](#23-third-party-integrations)

---

## 1. Site Overview

**Domain:** www.macys.com
**Type:** Full-service omnichannel retail e-commerce platform
**Parent Company:** Macy's, Inc. (headquartered at 151 West 34th Street, New York, NY 10001)
**Primary Business:** Department store retail - clothing, accessories, beauty, home goods, furniture, jewelry, electronics, toys

### Key Business Capabilities
- Online shopping with home delivery
- Buy Online, Pick Up In Store (BOPIS) - ready in as little as 2 hours
- Curbside pickup
- In-store shopping
- Gift registry services
- Personal stylist services
- Macy's Credit Card and Star Rewards loyalty program
- Klarna buy-now-pay-later integration
- Gift card services (physical and e-gift cards)
- International wholesale and sourcing

### Major Product Departments
| Department | URL Path |
|---|---|
| Women | `/shop/womens?id=118` |
| Men | `/shop/mens?id=1` |
| Beauty | `/shop/makeup-and-perfume` |
| Shoes | `/shop/womens-shoes?id=13247` |
| Home | `/shop/home?id=173142` |
| Jewelry & Watches | `/shop/jewelry-watches?id=544` |
| Handbags | `/shop/womens/handbags-wallets-accessories` |
| Furniture & Mattresses | `/shop/home/furniture-mattresses` |
| Kids & Baby | `/shop/kids-clothes?id=5991` |
| Toys (Toys"R"Us) | `/shop/all-toys/all-toys` |
| Electronics | `/shop/electronics/all-electronics` |
| Gifts | `/shop/gift-guide` |
| New & Trending | `/shop/new-trending?id=342756` |
| Sale | `/shop/sale?id=3536` |

---

## 2. Global Header & Navigation

### 2.1 Top Deals Bar (Sticky Banner)
- **Location:** Topmost bar across all pages
- **Features:**
  - Scrolling promotional deals ticker
  - Multiple deal links displayed horizontally (e.g., "Up to 60% off Presidents' Day deals", "Up to 70% off jewelry sale")
  - "See All" link to full deals page
  - Each deal shows discount percentage and category

### 2.2 Main Header
- **Logo:** Macy's star logo (links to homepage)
- **Search Bar:**
  - Full-width search input field
  - Placeholder text: "What are you looking for?" / "What are you looking for today?"
  - Magnifying glass icon
  - Auto-suggest/autocomplete functionality
  - Keyword-based search
- **User Account Area:**
  - "Sign In" link (redirects to `/account/signin`)
  - "See more of what you love" personalization prompt
  - Personalized greeting for logged-in users
- **Store Selector:**
  - "Your store" button
  - Opens store location drawer/modal
  - Used for BOPIS availability checking
- **Gift Registry:**
  - Gift Registry button with icon
  - Opens registry drawer
- **Shopping Bag:**
  - Bag icon with item count badge (e.g., "0 item in bag")
  - Links to `/my/bag`

### 2.3 Primary Navigation Bar
- **Type:** Horizontal mega-menu navigation
- **Categories:**
  - Shop All (hamburger menu - opens full department list)
  - Women
  - Men
  - Beauty
  - Shoes
  - Home
  - Jewelry
  - Handbags
  - Furniture & Mattresses
  - Kids & Baby
  - Toys"R"Us (branded partnership with Toys"R"Us logo)
  - Electronics
  - Gifts
  - New & Trending
  - Sale (highlighted in red)
- **Behavior:**
  - Hover/click opens mega-menu dropdowns with subcategories
  - "Shop All" button opens full-screen department overlay
  - Sticky navigation on scroll

### 2.4 Promotional Banner Bar
- **Location:** Below main navigation
- **Content:**
  - "SHOP WITH CONFIDENCE" messaging
  - "Buy gifts online, pick up in store today" with deadline (e.g., "Order by 4PM local time")
  - "Send an e-gift card" option
  - Seasonal promotional imagery (hearts for Valentine's Day, etc.)

---

## 3. Homepage

### 3.1 Hero Section / Main Sale Banner
- **Features:**
  - Large promotional banner (e.g., "Presidents' Day Sale - Up to 60% OFF")
  - Sale description text with category highlights
  - "Shop by category" expandable dropdown button
  - Seasonal sale events prominently featured
  - Direct link to sale landing page

### 3.2 Hero Carousel / Slideshow
- **Features:**
  - Multi-slide rotating carousel (5+ slides)
  - Previous/Next navigation arrows
  - Pagination dots for direct slide selection
  - Each slide contains:
    - Promotional imagery (lifestyle/product photos)
    - Headline text (sale name, discount percentage)
    - Description text
    - One or more CTA buttons/links
  - Slide types include:
    - Valentine's Day gifts & BOPIS messaging
    - Semi-Annual Jewelry Sale
    - Underwear & Lingerie Sale
    - Denim Event
    - Date-night looks
  - Auto-rotation with pause capability

### 3.3 Star Rewards / Bonus Days Banner
- **Features:**
  - "Bonus Days" promotional banner
  - Star Money earning acceleration offers
  - Point earning details (e.g., "$10 in Star Money faster")
  - Qualifying purchase thresholds
  - "Star Rewards" branding and link

### 3.4 Top Deals Carousel
- **Section Title:** "Shop our top deals"
- **Features:**
  - Horizontal scrollable carousel of deal category cards
  - Each card shows:
    - Category image
    - Discount percentage (e.g., "20% off", "40-60% off")
    - Category description (e.g., "Transformative beauty & fragrance arrivals")
    - Price points (e.g., "$150 and under")
  - Next arrow button for scrolling
  - Deal categories include: Beauty, Boots, Dresses, Handbags, Men's Suits, Bedding, Activewear, Denim, Dyson products

### 3.5 Sponsored Content
- **Features:**
  - Branded advertisement placements (e.g., Chanel)
  - "Sponsored" label
  - Product/brand promotional imagery
  - "Shop Now" CTAs

### 3.6 Last-Minute Gifts Section
- **Section Title:** "Last-minute gifts in store"
- **Features:**
  - Tabbed navigation (Jewelry, Perfume, Cologne, Watches, Handbags, Boxed gifts)
  - Horizontal product carousel per tab
  - Each product card shows:
    - Product image
    - Wishlist button ("Add to default list" heart icon)
    - Deal badge (e.g., "Limited-Time Special")
    - Brand name
    - Product name/title
    - Pricing: Current price, discount percentage, original price
    - Star Money earning info (e.g., "$10 Star Money for $100" or "Earn $10 Star Money")
    - Star rating with review count
    - Color swatches (where applicable)
  - Next/Previous navigation arrows

### 3.7 Furniture & Home Section
- **Features:**
  - Three promotional cards:
    - Furniture (20-50% OFF)
    - Mattresses (20-65% OFF)
    - Rugs (55-65% OFF)
  - Category-specific CTAs

### 3.8 Valentine's Day / Seasonal Gift Section
- **Features:**
  - Gift guide promotional imagery
  - "Curated straight from the heart" messaging
  - "14 Days of Gifting" daily curated gift lists by tastemakers
  - Video content with play/pause controls
  - "Shop now" and "Check it out" CTAs

### 3.9 Personalized Recommendations
- **Section Title:** "Loved by us, picked for you"
- **Features:**
  - Tabbed categories: Deals for you, New Arrivals, Denim looks, Home refresh, Wear to work, Top 100 gifts
  - Personalized product recommendations per tab
  - Product cards with full pricing and review details

### 3.10 New at Macy's / Brand Spotlights
- **Features:**
  - Brand partnership highlights with imagery
  - Examples: Lancome, Anolon, 4F sportswear, Tikamoon furniture, Steve Madden, State of Day
  - Brand-specific promotional messaging
  - Direct links to brand shops

### 3.11 Clearance Section
- **Section Title:** "Shop clearance now"
- **Features:**
  - "View All" link to full clearance page (`/shop/sale/clearance-closeout?id=54698`)
  - Horizontal product carousel
  - Product cards with clearance pricing (showing original and clearance prices)
  - Wishlist functionality
  - Star Money information

### 3.12 Back to Top Button
- **Features:**
  - Floating "Back to top" button
  - Appears on scroll
  - Arrow icon

### 3.13 Pop-up / Modal Offers
- **Features:**
  - Welcome/first-visit discount modal (e.g., "25% off your first order")
  - Email capture for new visitors
  - "Click to Claim" CTA
  - "Decline Offer" option
  - Offer exclusions link

---

## 4. Category / Department Pages

### 4.1 Page Structure (Example: Women's Fashion)
- **URL Pattern:** `/shop/womens?id=118`
- **Breadcrumb Navigation:**
  - Home > Category Name (e.g., "Women's Fashion, Shoes & Accessories")
- **Page Title:**
  - Category name with item count (e.g., "Women's Fashion, Shoes & Accessories (500+)")

### 4.2 Category Hero Carousel
- **Features:**
  - Multi-slide promotional carousel
  - Seasonal/promotional messaging
  - Previous/Next navigation and pagination dots
  - Category-specific promotions (e.g., Denim Event, Jewelry Sale, Underwear Sale)
  - Lifestyle imagery with CTAs

### 4.3 Top Deals Row
- **Section Title:** "Our top deals"
- **Features:**
  - Horizontal scrollable deal tiles
  - Category-specific deal cards with discount percentages
  - Examples: Coats, Dresses, Sweaters, Underwear, Denim, Activewear, Workwear, Swimwear

### 4.4 Featured Categories
- **Section Title:** "Featured categories"
- **Features:**
  - Visual category links with icons/images
  - Quick navigation to subcategories
  - Examples: Dresses, Coats & Jackets, Sweaters, Pants & Jeans, Tops, Bras & Pajamas

### 4.5 Trending Now Section
- **Section Title:** "What's trending now"
- **Features:**
  - Horizontal carousel of trend categories
  - Visual trend cards with lifestyle imagery
  - Examples: Valentine's Day, Winter Trend Alert, Cold Weather Shop, Faux Fur, Wear to Work, Contemporary, Active

### 4.6 Brands We Love
- **Section Title:** "Brands we love"
- **Features:**
  - Horizontal carousel of brand logos/cards
  - Direct links to brand shops
  - Examples: Ralph Lauren, INC, Donna Karan, Calvin Klein, Style & Co, DKNY, On 34th, Levi's, Karl Lagerfeld, CeCe

### 4.7 Quick Links / Sub-navigation
- **Features:**
  - Tabbed quick links to subcategories
  - Examples: Women's Clothing, Plus Size Clothing, Petite Clothing, Contemporary Clothing, Juniors' Clothing, Shoes, Handbags, Shop by Occasion

### 4.8 SEO Content Block
- **Features:**
  - Rich text content about the category
  - Internal links to related categories
  - "Show Less" toggle for long content
  - Popular Searches section with links
  - Buying guides and style guides

---

## 5. Product Listing Page (PLP)

### 5.1 Filtering & Faceted Navigation
- **Filter Categories:**
  - Department
  - Item Type
  - Brand
  - Price
  - Color
  - Size
- **Filter Behavior:**
  - Expandable/collapsible filter sections
  - Multi-select capabilities
  - Filter pills for active filters
  - Clear all filters option

### 5.2 Sorting Options
- **Sort By dropdown:**
  - Featured Items (default)
  - Price: Low to High
  - Price: High to Low
  - Customers' Top Rated
  - Best Sellers
  - New Arrivals

### 5.3 Grid View Controls
- **Features:**
  - Toggle between 4 products per row and 6 products per row
  - Visual grid icons for each option

### 5.4 Product Cards
- **Each card displays:**
  - Product image (with hover image slideshow)
  - Wishlist heart icon ("Add to default list")
  - Deal badge: "Limited-Time Special", "Clearance", "New"
  - "Sponsored" badge for promoted products
  - Brand name
  - Product title (clickable link)
  - "Macy's Exclusive" badge where applicable
  - Pricing:
    - Current/sale price with discount percentage
    - Original/previous price (strikethrough)
    - Price ranges for multi-variant products
  - Star Rewards info (e.g., "$10 Star Money for $100", "Earn $10 Star Money")
  - Star rating (out of 5) with review count
  - Color swatches (clickable to change product image)
  - "New colors" badge
  - Social proof: "80 bought in the last 5 days"

### 5.5 Pagination
- **Features:**
  - Numbered page links (1, 2, 3... 1802)
  - Next page arrow
  - First and last page quick links
  - Large catalog support (1000+ pages)

---

## 6. Product Detail Page (PDP)

### 6.1 Product Images
- **Features:**
  - Main product image (large)
  - Image gallery/carousel with thumbnail navigation
  - Zoom on hover functionality
  - Multiple angles/views
  - Model/lifestyle imagery

### 6.2 Product Information
- **Features:**
  - Brand name with link to brand page
  - Product title
  - Star rating with review count (clickable to scroll to reviews)
  - Price display:
    - Current/sale price
    - Original price (strikethrough)
    - Discount percentage
    - "Limited-Time Special" or "Clearance" badges
  - Star Money earning information
  - Product description
  - Size & Fit information
  - Material/fabric details
  - Care instructions
  - Product details and specifications

### 6.3 Product Selection Options
- **Features:**
  - Color selection with swatches
  - Size selection dropdown/buttons
  - Size chart link
  - Quantity selector
  - "Add to Bag" button (primary CTA)
  - "Add to List" / Wishlist button
  - Store availability checker ("Check if available at your store")

### 6.4 Shipping & Pickup Options
- **Features:**
  - Free shipping threshold information
  - Estimated delivery date
  - "Buy Online, Pick Up In Store" availability
  - Same-day delivery options
  - Curbside pickup option

### 6.5 Klarna / Payment Options
- **Features:**
  - "Pay in 4 interest-free installments" via Klarna
  - Installment amount display

### 6.6 Product Reviews Section
- **Features:**
  - Overall star rating
  - Total review count
  - Rating distribution bar chart
  - Individual reviews with:
    - Reviewer name
    - Star rating
    - Review date
    - Review title and body text
    - Helpful/Not helpful voting
    - "Verified Buyer" badge
  - Review sorting and filtering
  - "Write a Review" CTA

### 6.7 Related Products & Recommendations
- **Features:**
  - "Customers Also Shopped" carousel
  - "You Might Also Like" recommendations
  - "Complete the Look" styling suggestions
  - Recently viewed items

### 6.8 Free Gift with Purchase
- **Features:**
  - "Free gift with purchase" badge on qualifying items
  - Gift details and qualifying purchase thresholds

### 6.9 Bundle & Save
- **Features:**
  - "Bundle & Save" promotions (e.g., "5/$35")
  - Multi-buy discount details

---

## 7. Shopping Bag / Cart

### 7.1 Empty Bag State
- **URL:** `/my/bag`
- **Features:**
  - Macy's star bag icon
  - "Your Shopping Bag is empty" message
  - "Have any saved items? Sign in to view them" prompt
  - "Sign In" button
  - "Continue Shopping" button
  - "See deals & promotions" link

### 7.2 Trending Now Carousel (Empty Bag)
- **Section Title:** "Trending now"
- **Features:**
  - Product recommendation carousel
  - Product cards with:
    - Product image
    - Wishlist heart icon
    - Brand and product name
    - Pricing with discount info
    - Star Money details
    - Color swatches
    - "Free gift with purchase" badges
    - "Bundle & Save" offers

### 7.3 Populated Bag Features
- **Features:**
  - Product line items with:
    - Product image thumbnail
    - Brand and product name
    - Selected color, size, quantity
    - Unit price and line total
    - "Edit" link for modifications
    - "Remove" link
    - "Move to List" link
  - Quantity adjustment (+/- buttons)
  - Promo code / coupon input field
  - Order summary:
    - Subtotal
    - Estimated shipping
    - Estimated tax
    - Discount/savings breakdown
    - Order total
  - "Checkout" primary CTA button
  - "PayPal" checkout option
  - Bonus offer items (e.g., "Diamond Heart Pendant with any $25 purchase")
  - Free shipping progress bar
  - Star Money earning preview

---

## 8. Checkout Flow

### 8.1 Checkout Steps
- **Features:**
  - Multi-step checkout process:
    1. Shipping address
    2. Shipping method selection
    3. Payment information
    4. Order review and confirmation
  - Guest checkout option
  - Sign-in option for returning customers
  - Progress indicator

### 8.2 Shipping Options
- **Features:**
  - Standard shipping
  - Express shipping
  - Premium/next-day shipping
  - Free shipping threshold ($39 with Star Rewards)
  - In-store pickup option
  - Address auto-complete

### 8.3 Payment Methods
- **Accepted methods:**
  - Macy's Credit Card
  - Visa, Mastercard, American Express, Discover
  - PayPal
  - Klarna (pay in 4 installments)
  - Gift cards
  - Macy's Money / Star Money

### 8.4 Order Confirmation
- **Features:**
  - Order number and confirmation details
  - Estimated delivery dates
  - Order tracking link
  - Email confirmation sent

---

## 9. Account & Authentication

### 9.1 Sign In Page
- **URL:** `/account/signin`
- **Features:**
  - Simplified header (logo + bag icon only)
  - Email input field
  - Password input field with "Show" toggle
  - "Case sensitive" password note
  - "Keep me signed in" checkbox with details
  - "Uncheck if on a public device" warning
  - "Sign In" button (red)
  - "Forgot your password?" link

### 9.2 Create Account Section
- **Features:**
  - "Create a Macy's account" heading
  - Star Rewards membership benefits listed:
    - Free returns, plus free shipping at $39
    - Earn points toward rewards (1 point per $1)
    - Special offers (Star Money Bonus Days, birthday surprise)
  - "Create Account" button
  - Redirects to `/account/createaccount`

### 9.3 Account Dashboard (Post-Login)
- **Features:**
  - Order history and tracking
  - Saved addresses
  - Payment methods management
  - Wishlist / saved items
  - Star Rewards balance and status
  - Profile settings
  - Communication preferences
  - Credit card management

### 9.4 Password Recovery
- **URL:** `/forgot-password`
- **Features:**
  - Email-based password reset
  - Security verification

---

## 10. Search

### 10.1 Search Functionality
- **Features:**
  - Global search bar in header
  - Autocomplete/type-ahead suggestions
  - Search by:
    - Product name
    - Brand name
    - Category
    - Keywords
    - SKU/product ID
  - Search results page with:
    - Result count
    - All PLP filtering and sorting capabilities
    - Sponsored results
    - Category suggestions
  - Recent searches
  - Trending searches

---

## 11. Deals, Sales & Promotions

### 11.1 Today's Deals Page
- **URL:** `/shop/sale?id=3536`
- **Features:**
  - Aggregated deals landing page
  - Category-specific deal sections
  - Limited-Time Specials
  - Deal countdown timers
  - "Shop by category" navigation

### 11.2 Promotion Types
| Promotion Type | Description |
|---|---|
| Limited-Time Special | Time-bound price reductions |
| Clearance | End-of-season/discontinued markdowns |
| Presidents' Day Sale | Holiday-specific sale event |
| Semi-Annual Sale | Bi-annual major sale events |
| Star Money Bonus Days | Extra rewards earning period |
| Buy One Get One | BOGO offers |
| Bundle & Save | Multi-buy discounts (e.g., 5/$35) |
| Free Gift with Purchase | GWP promotions |
| Percentage Off | Category/brand-wide discounts |
| Promo Code Discounts | Coupon code-based savings |
| New Customer Discount | First-order discount (e.g., 25% off) |
| Credit Card Opening Discount | 30% off when opening Macy's card |

### 11.3 Coupons & Deals Page
- **URL:** `/shop/coupons-deals`
- **Features:**
  - Active coupons and promo codes
  - Deal aggregation
  - Category filters for deals

---

## 12. Gift Registry

### 12.1 Registry Features
- **URL:** `/registry`
- **Features:**
  - Gift registry creation and management
  - Registry types: Wedding, Baby, Birthday, Holiday, etc.
  - Registry search by name or event
  - Shareable registry links
  - Registry checklist and suggestions
  - "Add to Registry" functionality on product pages
  - Registry completion discount
  - In-store and online registry management

---

## 13. Store Locator & Services

### 13.1 Store Locator
- **URL:** `/stores/`
- **Features:**
  - Search by zip code, city, or state
  - Interactive store map
  - Store details:
    - Address
    - Phone number
    - Store hours
    - Available services
    - Departments
  - "Your store" selector in header

### 13.2 In-Store Services
- **Features:**
  - Curbside & In Store Pickup (BOPIS)
  - Personal Stylist service (`/s/personal-stylist/`)
  - Store Events calendar (`/s/events/`)
  - LensCrafters eye exams (`/p/lenscrafters`)
  - Macy's Backstage (off-price section)
  - Store openings notifications

### 13.3 Macy's Backstage
- **URL:** `macysbackstage.com`
- **Features:**
  - Off-price shopping experience
  - Separate brand identity
  - Deep discounts on brand-name merchandise

---

## 14. Customer Service & Support

### 14.1 Customer Service Pages
- **URL:** `/customer-service/`
- **Features:**
  - FAQs and Help center
  - Order Lookup (`/purchases/lookup`)
  - Returns information (`/returns`)
  - Shipping & Delivery policies
  - "Para Ayuda" (Spanish language support)
  - "Tell Us What You Think" feedback

### 14.2 Policies
- **Features:**
  - Returns and exchange policy
  - Shipping and delivery timelines
  - Pricing policy
  - Privacy notice
  - Legal notice
  - Product recalls information
  - Customer Bill of Rights

---

## 15. Macy's Credit Card

### 15.1 Credit Card Features
- **Features:**
  - Apply for Macy's Credit Card (`/p/credit-service/learn-and-apply/`)
  - Cardholder benefits page (`/p/credit-service/benefits/`)
  - Credit card opening discount: 30% off (save up to $100)
  - Pre-qualification check (no credit score impact)
  - Macy's Card Services portal (`/my-credit/gateway/guest`)
  - Pay Your Credit Card Bill (links to account sign-in)
  - Exclusions & Details page
  - Citibank integration for card services

### 15.2 Cardholder Benefits
- **Benefits include:**
  - Extra Star Money earning on purchases
  - Exclusive cardholder sales and events
  - Free shipping upgrades
  - Birthday surprise rewards
  - Star Money Bonus Days accelerated earning

---

## 16. Star Rewards Loyalty Program

### 16.1 Program Features
- **Features:**
  - Free to join (automatic with account creation)
  - Tiered membership levels (Bronze, Silver, Gold, Platinum)
  - Earning: 1 point per $1 spent on qualified purchases
  - Star Money rewards ($10 reward per earning threshold)
  - Star Money Bonus Days (accelerated earning periods)
  - Birthday surprise
  - Free returns
  - Free shipping at $39 threshold
  - Exclusive member offers and early access
  - Star Money balance visible in account

### 16.2 Star Money Display
- **On product cards and pages:**
  - "$10 Star Money for $100" (for lower-priced items)
  - "Earn $10 Star Money" (for items meeting the threshold)
  - "Earn $40 Star Money" (for premium items)
  - "Earn $90 Star Money" (for high-value items)

---

## 17. Gift Cards

### 17.1 Gift Card Options
- **URL:** `/shop/gift-guide/gift-cards/`
- **Features:**
  - Physical gift cards
  - E-gift cards (digital delivery)
  - Gift card balance check (`/account/giftcardbalance`)
  - Multiple denomination options
  - Custom amount entry
  - Personalized messages
  - Gift card redemption at checkout

---

## 18. Footer & Legal

### 18.1 Primary Footer Sections

#### Customer Service
- FAQs and Help
- Klarna payment info
- Order Lookup
- Para Ayuda (Spanish support)
- Returns
- Shipping & Delivery

#### Macy's Credit Card
- Apply for Macy's Credit Card
- Cardholder Benefits
- Gift Cards
- Gift Card Balance
- Macy's Card Services
- Pay Your Credit Card Bill

#### Stores & Services
- Curbside & In Store Pickup
- Locations & Hours
- Macy's App
- Macy's Backstage
- Macy's Brands
- Macy's Wine Shop
- Personal Stylist
- Stay in Touch (email/text signup)
- Store Events
- Store Openings
- Book an Eye Exam (LensCrafters)
- Tell Us What You Think
- Gift Registry

#### Macy's Inc.
- Corporate Sales
- Corporate Site (macysinc.com)
- Investors
- International Wholesale & Sourcing
- Macy's Jobs (Oracle HCM integration)
- Mission Every One (CSR initiative)
- News Room
- Site Map
- Sustainability
- Styled and Storied (editorial content)

### 18.2 Email & Text Signup
- **Features:**
  - "Be the first to know with our emails" prompt
  - "Sign Me Up" CTA button
  - Text message subscription option

### 18.3 Credit Card Promotion
- **Features:**
  - "Get 30% off" card opening promotion
  - Card image/branding
  - Pre-qualification check link
  - Exclusions & Details link

### 18.4 Secondary Footer (Legal)
- Privacy Notice
- Cookie Preferences (consent management)
- Interest Based Ads
- CA Privacy Rights (California compliance)
- Do Not Sell or Share My Personal Information (CCPA)
- Legal Notice
- Customer Bill of Rights
- CA Transparency in Supply Chains
- Product Recalls
- Pricing Policy
- Accessibility

### 18.5 Copyright
- "2026 Macy's. All rights reserved."
- Macys.com, LLC entity information
- Corporate address request link

---

## 19. Social Media Integration

### 19.1 Social Media Links (Footer)
| Platform | URL |
|---|---|
| Facebook | facebook.com/Macys |
| Instagram | instagram.com/macys |
| X (Twitter) | x.com/macys |
| Pinterest | pinterest.com/macys |
| YouTube | youtube.com/user/macys |

### 19.2 Social Features
- External website links (open in new window)
- Share product functionality on product pages
- Social proof elements on product cards (e.g., "80 bought in the last 5 days")

---

## 20. Mobile & App Features

### 20.1 Macy's App
- **URL:** `/s/enhance-app/`
- **Features:**
  - Mobile shopping app for iOS and Android
  - In-store mode
  - Barcode scanning
  - Mobile wallet integration
  - Push notifications for deals and order updates
  - Mobile-optimized checkout

### 20.2 Responsive Web Design
- **Features:**
  - Mobile-responsive layout
  - Touch-optimized navigation
  - Mobile-specific promotional content
  - Adaptive image loading

---

## 21. SEO & Content Pages

### 21.1 Editorial Content
- **URL:** `/s/guides/` (Styled and Storied)
- **Features:**
  - Style guides and buying guides
  - "Best Women's Coats" guide
  - "Maternity Buying Guide"
  - "Best Outfits for a Night Out"
  - Seasonal styling advice

### 21.2 Category SEO Content
- **Features:**
  - Rich text descriptions on category pages
  - Internal linking to related categories
  - "Popular Searches" section
  - Schema.org structured data
  - Breadcrumb navigation

### 21.3 Site Map
- **URL:** `/shop/sitemap-index?id=199462`
- **Features:**
  - Full site navigation map
  - Category hierarchy
  - SEO-optimized URL structure

### 21.4 Promotional Landing Pages
- **Features:**
  - "14 Days of Gifting" (`/s/fourteen-days-of-gifting`)
  - Free shipping details (`/s/free-shipping/`)
  - Star Money Days (`/p/star-money-days/`)
  - New store openings (`/p/macys-new-stores/`)
  - Purpose/CSR page (`/s/purpose/`)

---

## 22. Accessibility Features

### 22.1 WCAG Compliance
- **URL:** `macysinc.com/legal-notices/Accessibility`
- **Features:**
  - ARIA labels on interactive elements
  - Alt text on images
  - Keyboard navigation support
  - Screen reader compatibility
  - Skip navigation links
  - Focus management
  - Color contrast compliance
  - Form field labels and error messages
  - Carousel keyboard controls

---

## 23. Third-Party Integrations

### 23.1 Payment Integrations
| Provider | Integration Type |
|---|---|
| Klarna | Buy Now, Pay Later (4 installments) |
| PayPal | Alternative checkout payment |
| Citibank | Macy's Credit Card servicing |
| Apple Pay / Google Pay | Mobile wallet payments |

### 23.2 Brand Partnerships
- **Toys"R"Us** - Branded toy department
- **LensCrafters** - In-store eye care services
- **Macy's Wine Shop** (macyswineshop.com) - Wine retail

### 23.3 Technology Integrations
| Integration | Purpose |
|---|---|
| BounceExchange | Pop-up/modal offer management |
| Google Syndication | Sponsored advertising |
| Oracle HCM | Jobs/recruitment portal |
| Email Marketing Platform | Newsletter signup and management |

---

## Appendix A: URL Structure Reference

| Page Type | URL Pattern | Example |
|---|---|---|
| Homepage | `/` | `www.macys.com` |
| Department | `/shop/{department}?id={id}` | `/shop/womens?id=118` |
| Category | `/shop/{department}/{category}?id={id}` | `/shop/womens/clothing/dresses?id=5449` |
| Product | `/shop/product/{slug}?ID={id}` | `/shop/product/calvin-klein-womens-hooded-puffer-coat?ID=19537627` |
| Brand | `/shop/brands/{brand}?id={id}` | `/shop/brands/calvin-klein?id=28688` |
| Sale | `/shop/sale?id=3536` | N/A |
| Search | `/shop/featured/{keyword}` | N/A |
| Account | `/account/{action}` | `/account/signin`, `/account/createaccount` |
| Cart | `/my/bag` | N/A |
| Registry | `/registry` | N/A |
| Store Locator | `/stores/` | N/A |
| Customer Service | `/customer-service/` | N/A |

## Appendix B: Key UI Component Patterns

### Product Card Component
```
+----------------------------+
| [Product Image]        [Heart] |
| [Deal Badge]                    |
| Brand Name                      |
| Product Title                   |
| [Macy's Exclusive]             |
| $XX.XX (XX% off)               |
| ~~$XXX.XX~~                    |
| $10 Star Money for $100        |
| [Stars] (XXX reviews)          |
| [Color Swatches]                |
+----------------------------+
```

### Carousel Component
```
+--[<]--[Item 1][Item 2][Item 3]...[Item N]--[>]--+
|                 [. . . . .]                        |
+----------------------------------------------------+
- Previous/Next arrow navigation
- Dot pagination
- Horizontal scrolling
- Touch/swipe support
```

### Price Display Patterns
| Pattern | Example | Context |
|---|---|---|
| Sale price + percentage | `$69.99 (75% off)` | Active sale |
| Now price | `Now $154.00 (30% off)` | Clearance |
| Price range | `$39.75 - $47.70 (40-50% off)` | Multi-variant |
| Regular price | `$160.00` | No discount |

## Appendix C: Brand List (Sample)

Major brands available on Macy's:
- Calvin Klein
- Michael Kors (MICHAEL Michael Kors)
- DKNY / Donna Karan
- Ralph Lauren / Polo Ralph Lauren
- Nike
- adidas
- UGG
- The North Face
- Free People
- Lancome
- Clarks
- Steve Madden
- Coach
- Tommy Hilfiger
- Levi's
- INC International Concepts (Macy's exclusive)
- Charter Club (Macy's exclusive)
- Style & Co (Macy's exclusive)
- On 34th (Macy's exclusive)
- ID Ideology (Macy's exclusive)
- Alfani (Macy's exclusive)

---

*Document generated: February 2026*
*Source: www.macys.com live site crawl*
*Purpose: RAG context for domain application development*

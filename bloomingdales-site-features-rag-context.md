# Bloomingdale's (www.bloomingdales.com) - Comprehensive Site Features Document

> **Purpose:** RAG context document capturing all features available on www.bloomingdales.com, organized by page/section. This document serves as domain knowledge for building a Retrieval-Augmented Generation (RAG) system.

> **Date Captured:** February 2026

> **Parent Company:** Macy's, Inc. (shared corporate policies with macys.com)

---

## Table of Contents

1. [Global Header & Navigation](#1-global-header--navigation)
2. [Homepage](#2-homepage)
3. [Category Pages (Women, Men, Kids, Home, etc.)](#3-category-pages)
4. [Product Listing Pages](#4-product-listing-pages)
5. [Product Detail Pages](#5-product-detail-pages)
6. [Search](#6-search)
7. [Shopping Bag](#7-shopping-bag)
8. [Checkout](#8-checkout)
9. [Account & Authentication](#9-account--authentication)
10. [Sale & Clearance](#10-sale--clearance)
11. [Gifts](#11-gifts)
12. [Registry (bRegistry)](#12-registry-bregistry)
13. [Designers Page](#13-designers-page)
14. [Beauty Section](#14-beauty-section)
15. [Customer Service](#15-customer-service)
16. [Loyallist Rewards Program](#16-loyallist-rewards-program)
17. [Bloomingdale's Credit Card](#17-bloomingdales-credit-card)
18. [Store Locator & Events](#18-store-locator--events)
19. [Pickup & Same-Day Delivery](#19-pickup--same-day-delivery)
20. [Footer](#20-footer)
21. [Email & SMS Signup](#21-email--sms-signup)
22. [Social Media Integration](#22-social-media-integration)
23. [Promotional Banners & Seasonal Content](#23-promotional-banners--seasonal-content)
24. [SEO & Accessibility](#24-seo--accessibility)
25. [Mobile App](#25-mobile-app)

---

## 1. Global Header & Navigation

**URL:** All pages (persistent header)

### Top Banner (Rotating Slideshow)
- Rotating promotional banner with auto-play and pause controls
- Previous/Next slide navigation buttons
- Promotional messages include sale events, diamond deals, and seasonal offers
- Each slide contains a "SHOP NOW" CTA linking to relevant sale/product pages

### Header Bar
- **Logo:** Bloomingdale's wordmark linking to homepage
- **Search Bar:** Text input with placeholder "Search", icon-triggered
- **Sign In:** Link to `/account/signin`
- **Personalization Prompt:** "For the best experience: Sign In" message
- **Your Store:** Button to select/view local store
- **bRegistry:** Button to open registry drawer
- **Shopping Bag:** Link to `/my/bag` with item count badge (e.g., "0 item in bag")

### Primary Navigation (Horizontal Menu)
| Category | URL Pattern |
|---|---|
| Shop All | Hamburger/mega menu (button-triggered) |
| NEW & NOW | `/shop/fashion-lookbooks-videos-style-guide/...` |
| WOMEN | `/shop/womens-apparel?id=2910` |
| SHOES | `/shop/womens-designer-shoes?id=...` |
| HANDBAGS | `/shop/handbags?id=...` |
| JEWELRY & ACCESSORIES | `/shop/jewelry-accessories?id=...` |
| BEAUTY | `/shop/makeup-perfume-beauty?id=...` |
| MEN | `/shop/mens?id=3864` |
| KIDS | `/shop/kids?id=3866` |
| HOME | `/shop/home?id=3865` |
| SALE | `/shop/sale?id=3977` |
| GIFTS | `/shop/gifts?id=3948` |
| DESIGNERS | `/shop/all-designers?id=...` |
| REGISTRY | `/registry` |

### Sub-Banner
- Secondary promotional banner below main nav (e.g., "$10 SAME-DAY DELIVERY" with conditions and "SHOP NOW" CTA)

---

## 2. Homepage

**URL:** `https://www.bloomingdales.com/`

### Hero Section
- Large hero banner with seasonal campaign imagery
- Campaign text: "Your destination for new spring arrivals"
- Description: "Just in! The latest collections from Alice + Olivia, Cinq a Sept, FRAME, and so much more."
- CTA: "SHOP NEW ARRIVALS"

### Sale Banner
- "UP TO 65% OFF" prominent banner
- Quick links by category: WOMEN, SHOES, HANDBAGS, JEWELRY & ACCESSORIES, FINE JEWELRY, MEN, KIDS, HOME, SALE & CLEARANCE

### Featured Designer Brands (Carousel)
- Brand spotlight cards with imagery:
  - CINQ A SEPT
  - RAG & BONE
  - FRAME
  - SLVRLAKE
  - AGOLDE

### Recommended For You (Product Carousel)
- Personalized product recommendations carousel
- Products include: Gift Cards ($10-$1,000), Samsonite luggage (Sale $99.99), David Yurman jewelry ($250+), Bric's luggage, Tumi bags, Bloomingdale's Fine Collection jewelry
- Each product card shows: image, brand name, product name, price (with sale price if applicable)
- Carousel navigation: Next button, scrollable

### Designer Spotlights
- **S/S 2026 Collections:**
  - MAJE: "Airy fabrics and effortless silhouettes nod to the ease of summer" + SHOP NOW
  - SANDRO: "The spring collection balances structure and fluidity" + SHOP NOW

### New Fragrances Section
- LE LABO
- SOLFERINO PARIS
- PARFUMS DE MARLY

### Beauty Best Sellers (Product Carousel)
- DIOR Addict Lip Glow Balm ($42)
- Armani Luminous Silk Foundation ($69)
- Clinique Almost Lipstick Black Honey (Sale $19)
- DIOR Addict Lip Glow Oil ($42)
- DIOR Addict Lip Maximizer Gloss ($42)
- Touchland Power Mist Hand Sanitizer ($10)
- Dyson Airstrait Hair Straightener (Sale $399.99)
- YSL Make Me Blush Powder Blush ($46)
- Maison Francis Kurkdjian Baccarat Rouge 540 ($115-$975)
- CHANEL LE ROUGE DUO ($50-$53)
- Charlotte Tilbury Lip Cheat Liner ($28)
- Decorte Facial Pure Cotton ($9)
- YSL Loveshine Lip Oil Stick ($45)
- Cle de Peau Beaute Concealer ($77)
- CHANEL La Creme Main ($62)
- Armani Eye Tint Liquid Eyeshadow ($39)
- Bobbi Brown Long-Wear Eyeshadow Stick ($34)
- CHANEL LES BEIGES Eyeshadow Palette ($75-$77)
- CREED Men's Fragrance Kit ($70)

### SEO Content Block
- "Shop Bloomingdale's Online - Like No Other Store in the World"
- Long-form brand description about Bloomingdale's heritage, curation, and luxury positioning
- "Show More" expandable button

---

## 3. Category Pages

**URL Pattern:** `/shop/{category}?id={id}`

### Women's Category Page (`/shop/womens-apparel?id=2910`)

#### Breadcrumb Navigation
- Home > Women

#### Left Sidebar Navigation
- **Presidents' Day Sale: 40-65% Off** (link to sale)
- **Top Brands On Sale:** A.L.C., AQUA, Cinq a Sept, L'AGENCE, PAIGE, Ramy Brook, rag & bone, STAUD, Theory, Vince
- **Clothing Subcategories:**
  - Shop All, Active & Workout, Blazers, Cashmere, Coats & Jackets, Dresses, Jeans & Denim, Jumpsuits & Rompers, Intimates & Hosiery, Loungewear, Shorts, Skirts, Matching Sets, Maternity, Pants & Leggings, Sleepwear & Robes, Suits & Separates, Sweaters, Swimsuits & Cover-Ups, Tops & Tees
- **New & Now:** New Arrivals, Most Wanted Styles Under $200, NEW: AQUA x "Wuthering Heights", NEW: Aya Muse, Polo Ralph Lauren Team USA Collection
- **Spring Trends** link
- **What To Wear For:** Bride to Be, Going Out, Ski Trips, Out & About, The Office, Vacation, Weddings, Weekend
- **The Contemporary Edit** link
- **Best Sellers** link
- **Coats & Jackets:** Shop All, Canada Goose, Moncler, Down & Puffers, Winter Coats & Jackets, Wool Coats
- **Dresses:** Shop All, Cocktail & Party, Evening & Formal Gowns, Wedding Guest
- **Sweaters:** Shop All, Cardigans, Cashmere, Crewnecks, V-Necks
- **The Designer Boutique** link
- **Plus Size Clothing** link
- **Lookbooks & Guides:** The Cashmere Guide, The Denim Guide, The Bridal Guide, The Winter Coat Guide, The Resort Lookbook

#### Main Content Area
- Hero banner: "SWEPT AWAY" vacation campaign
- CTAs: "THE VACATION SHOP", "EXPLORE THE LOOKBOOK"

#### Shop By Category (Visual Grid)
- Dresses, Evening & Formal, Jeans & Denim, Coats & Jackets, Sweaters, Tops & Tees, Lingerie & Shapewear, Skirts, Sleepwear & Robes, Pants & Leggings, Swimsuits & Coverups, Loungewear

#### Happening Now Section
- SKI SHOP, OUT & ABOUT, THE RESORT SHOP, THE WINTER SHOP, NEW ARRIVALS, THE CASHMERE SHOP, THE DENIM GUIDE, THE CONTEMPORARY EDIT

#### New Arrivals (Product Carousel)
- rag & bone Chappell Stripe Poplin Pants ($398)
- FRAME The Sheer Silk Balloon Blouse ($558)
- AGOLDE Peplum High Rise Straight Jeans ($298)
- rag & bone Maxine Button Down Shirt ($228)
- rag & bone Gayle Stripe Poplin Coat ($498)
- Alice and Olivia Nevada Trench ($1,295)
- SLVRLAKE Cassidy Denim Shirt ($469)
- FARM Rio Floral Arabesque Printed Maxi Dress ($220)

#### SEO Content
- Detailed descriptions for: Women's Activewear, Jeans & Denim, Dresses, Coats & Jackets, Sweaters & Cardigans, Pants, Lingerie & Shapewear, Swimsuits, Tops & Tees, Designer Clothes
- Mentions brands: Theory, AQUA, Ralph Lauren, Eileen Fisher, Canada Goose, Moncler, SAM.
- "Show Less" toggle

### Other Category Pages (Structure)
Categories follow the same pattern:
- **MEN** (`/shop/mens?id=3864`): Men's clothing, shoes, accessories
- **KIDS** (`/shop/kids?id=3866`): Children's clothing and accessories
- **HOME** (`/shop/home?id=3865`): Home furnishings, decor, bedding
- **SHOES** (`/shop/womens-designer-shoes?id=...`): Designer footwear
- **HANDBAGS** (`/shop/handbags?id=...`): Designer handbags
- **JEWELRY & ACCESSORIES** (`/shop/jewelry-accessories?id=...`): Fine jewelry, fashion jewelry, watches, accessories

---

## 4. Product Listing Pages

**URL Pattern:** `/shop/{category}/{subcategory}?id={id}`

### Features
- Grid layout of product cards
- Filtering and sorting capabilities
- Product cards display: product image, brand name, product name, price (regular/sale)
- "NEW!" badge on new arrivals
- Quick view functionality
- Pagination or infinite scroll

---

## 5. Product Detail Pages

**URL Pattern:** `/shop/product/{product-slug}?ID={id}`

### Features
- Multiple product images (gallery view)
- Brand name and product title
- Price display (regular price, sale price, "Now" price)
- Size selection
- Color selection
- "Add to Bag" CTA
- Product description
- Product details and materials
- Shipping and returns information
- "Recommended For You" related products
- Gift card products: $10.00 - $1,000.00 range (E-Gift Cards)

---

## 6. Search

**URL:** Header search bar (persistent on all pages)

### Features
- Text input with "Search" placeholder
- Autocomplete/suggestions (aria-expanded attribute)
- Search by keyword
- Results page with filtering and sorting

---

## 7. Shopping Bag

**URL:** `https://www.bloomingdales.com/my/bag`

### Features
- Bag icon in header with item count
- Bag summary with product details
- Quantity adjustment
- Remove items
- Price summary (subtotal, estimated shipping, estimated tax, total)
- Promo code input
- "Checkout" CTA
- "Continue Shopping" link

---

## 8. Checkout

### Features
- Shipping address entry
- Shipping method selection
- Payment method selection
- Order review
- Place Order CTA
- Guest checkout option
- Sign in during checkout

---

## 9. Account & Authentication

**URL:** `https://www.bloomingdales.com/account/signin`

### Features
- Sign In form (email/password)
- Create Account option
- "For the best experience: Sign In" prompt in header
- Password reset
- Order history
- Address book management
- Payment methods
- Wishlist/Favorites
- Loyallist rewards tracking
- Bill payment: `/account/signin` (redirects for credit card payment)

---

## 10. Sale & Clearance

**URL:** `https://www.bloomingdales.com/shop/sale?id=3977`

### Features
- Presidents' Day Sale: 40-65% Off (seasonal, ends 2/16)
- Sale subcategories: Women's, Shoes, Handbags, Jewelry & Accessories, Fine Jewelry, Men, Kids, Home
- "SALE & CLEARANCE" dedicated section
- Sale price display with original price strikethrough
- Filter by discount percentage

---

## 11. Gifts

**URL:** `https://www.bloomingdales.com/shop/gifts?id=3948`

### Features
- Gift card options: E-Gift Cards ($10 - $1,000)
- Gift card designs: XOXO, Happy Birthday, It's Your Birthday, Celebrate!, Love, Classic 59th Street, generic
- Gift guides by recipient
- Gift registry link

---

## 12. Registry (bRegistry)

**URL:** `https://www.bloomingdales.com/registry`

### Features
- "bRegistry" branding (Bloomingdale's registry)
- Registry drawer accessible from header
- Wedding registry
- Gift registry
- Create/manage registry
- Search registries

---

## 13. Designers Page

**URL:** `https://www.bloomingdales.com/shop/all-designers?id=...`

### Features
- A-Z designer listing
- Designer brand pages with curated collections
- Notable brands carried:
  - **Premium/Luxury:** Canada Goose, Moncler, David Yurman, CHANEL, DIOR, Maison Francis Kurkdjian, CREED, Yves Saint Laurent, Armani
  - **Contemporary:** Alice + Olivia, Cinq a Sept, rag & bone, FRAME, AGOLDE, SLVRLAKE, Theory, Vince, STAUD, L'AGENCE, PAIGE, Ramy Brook, AQUA, Sandro, Maje
  - **Beauty:** Clinique, Charlotte Tilbury, Bobbi Brown, Decorte, Cle de Peau Beaute, Le Labo, Solferino Paris, Parfums de Marly, Touchland, Dyson
  - **Accessories:** Tumi, Samsonite, Bric's

---

## 14. Beauty Section

**URL:** `https://www.bloomingdales.com/shop/makeup-perfume-beauty?id=...`

### Features
- Beauty Best Sellers carousel (homepage featured)
- Categories: Makeup, Fragrance, Skincare, Hair Care, Bath & Body
- Best Sellers page: `/shop/makeup-perfume-beauty/best-sellers?id=...`
- New Fragrances section (homepage featured)
- Brand-specific pages
- Price range: $9 (Decorte cotton) to $975 (MFK Baccarat Rouge 540 Extrait)

---

## 15. Customer Service

### Features
- **Chat:** Live chat with customer service (webchat integration)
- **Contact Us:** `/customer-service/contact-us`
- **FAQs & Help:** `/customer-service/`
- **Returns & Exchanges:** `/returns`
- **Shipping Policy:** `/customer-service/shipping`
- **Tell Us What You Think:** `/customer-service/feedback`

---

## 16. Loyallist Rewards Program

**URL:** `https://www.bloomingdales.com/creditservice/marketing/loyallist`

### Features
- Loyallist rewards program
- Points earning on purchases
- Rewards tracking
- Exclusive member benefits
- Free shipping for Loyallists (no minimum)
- Linked to Bloomingdale's credit card

---

## 17. Bloomingdale's Credit Card

**URL:** `https://www.bloomingdales.com/my-credit/gateway`

### Features
- 20% off today & tomorrow (up to $250 in savings) for new cardholders
- Pre-qualification check with no credit score impact ("Check now" CTA)
- Managed through Citi Retail Services
- Info/Exclusions popup
- Subject to credit approval
- Bill payment through account portal

---

## 18. Store Locator & Events

**URL:** `https://www.bloomingdales.com/stores/browse/`

### Features
- "Your store" selector in header
- Store browsing by location
- In-store events
- Store-specific information
- Flagship: 1000 Third Avenue, New York, NY 10022
- **Appointments:** Book in-store or virtual appointments
- **In-Store Shopping Services:** Personal styling, etc.

---

## 19. Pickup & Same-Day Delivery

**URL:** `https://www.bloomingdales.com/c/curbside-pickup-same-day-delivery`

### Features
- Same-day delivery: $10 (promotional, usually higher)
- Order by noon local time for same-day
- Curbside pickup available
- "SHOP NOW" CTA for eligible products
- Seasonal promotions (e.g., Valentine's Day rush delivery)

---

## 20. Footer

### Primary Footer Sections

#### Customer Service
- Chat with us (live webchat)
- Contact us
- FAQs & help
- Returns & exchanges
- Shipping policy
- Tell us what you think

#### My Account
- Bloomingdale's credit card
- Loyallist rewards
- Order status (`/purchases/lookup`)
- Pay my bill

#### About Bloomingdale's
- About us (`/b/about-us/directory`)
- b the change (`/c/b-the-change/`)
- Careers (bloomingdalesjobs.com)
- Sustainability (`/c/commitment-to-sustainability`)

#### Ways to Shop
- Book an in-store or virtual appointment
- In-store shopping services
- Pickup & same-day delivery
- Stores & events

### Shipping Banner
- "FREE SHIPPING EVERY DAY! PLUS, FREE RETURNS"
- Loyallists: no minimum; everyone else: $150+
- Info/Exclusions link

### Credit Card Promotion
- 20% off promotion for new card applicants
- Credit card image
- "Check now" CTA to Citi Retail Services

### Secondary Footer (Legal)
- Terms of Use
- Privacy
- Cookie Preferences
- Do Not Sell or Share My Personal Information
- CA Privacy Rights
- CA Transparency in Supply Chains Act (macysinc.com)
- Interest Based Ads
- Customer Bill of Rights (macysinc.com)
- Product Recalls
- Pricing Policy
- Accessibility (macysinc.com)
- Corporate info: "2026 Bloomingdale's. 1000 Third Avenue New York, NY 10022"
- "Request our corporate name and address" link (macysinc.com)

---

## 21. Email & SMS Signup

### Features
- "SAVE 15%: SIGN UP FOR EMAIL OR TEXTS" banner in footer
- Email capture popup/modal:
  - "GET 15% OFF and insider access to new arrivals when you sign up for emails"
  - Email input field
  - "SUBSCRIBE NOW" button
  - Privacy practices link
  - Age confirmation (18+)
  - Valid for new email subscribers only
  - Dismissible with close (x) button

---

## 22. Social Media Integration

### Platforms
| Platform | URL |
|---|---|
| Instagram | https://www.instagram.com/bloomingdales/ |
| Pinterest | https://www.pinterest.com/bloomingdales/ |
| Facebook | https://www.facebook.com/Bloomingdales |
| Twitter/X | https://x.com/BLOOMINGDALES |
| Mobile App | bloomingdales.com/b/about-us/mobile |

### Footer Social Section
- "Follow Us" heading
- Icons linking to each platform
- Opens in new window (external websites)

---

## 23. Promotional Banners & Seasonal Content

### Active Promotions (February 2026)
- **Presidents' Day Sale:** Save 40-65% on a large selection of items (ends 2/16)
- **Diamond Deal:** Bloomingdale's Fine Collection certified 10-carat diamond tennis bracelet in 14K white gold, sale $9,999 (reg. $29,000) - ends 2/16
- **Same-Day Delivery:** $10 (50% off usual fee) for Valentine's Day - order by noon, ends 2/14
- **New Email Subscriber:** 15% off first order
- **New Credit Card:** 20% off today & tomorrow (up to $250)
- **Free Shipping:** Every day, free returns (Loyallists no minimum, others $150+)

### Seasonal Content
- Valentine's Day delivery promotions
- Spring 2026 new arrivals
- S/S 2026 designer collections (Maje, Sandro)
- Resort/Vacation shop
- Ski shop
- Winter shop
- New Fragrances launch

---

## 24. SEO & Accessibility

### SEO Features
- Semantic HTML structure (header, main, nav, footer, section, article)
- Breadcrumb navigation on category pages
- Descriptive page titles
- Detailed SEO content blocks on category pages (expandable with "Show More"/"Show Less")
- Structured URL patterns with category IDs
- Internal linking through navigation and content
- Schema markup for products

### Accessibility Features
- ARIA labels on interactive elements (buttons, links, carousels)
- ARIA-expanded attributes on dropdowns
- ARIA-label for search input
- Tab navigation support (tabindex attributes)
- Screen reader text for social media links
- Slideshow pause button
- Alt text on images
- Semantic landmarks (nav, main, header, footer)
- Accessibility policy link (macysinc.com)

---

## 25. Mobile App

### Features
- Mobile app page linked from footer social section
- App download promotion
- Mobile-optimized website (responsive design)
- Same-day delivery support through app

---

## Appendix A: URL Structure Patterns

| Page Type | Pattern |
|---|---|
| Homepage | `https://www.bloomingdales.com/` |
| Category | `/shop/{category}?id={id}` |
| Subcategory | `/shop/{category}/{subcategory}?id={id}` |
| Product | `/shop/product/{product-slug}?ID={id}` |
| Brand | `/shop/{brand-name}?id={id}` or `/buy/{brand-name}` |
| Sale | `/shop/sale/{subcategory}?id={id}` |
| Editorial/Lookbook | `/c/editorial/{category}/{guide-name}/` |
| Fashion Guides | `/shop/fashion-lookbooks-videos-style-guide/{guide}` |
| Account | `/account/signin` |
| Registry | `/registry` |
| Shopping Bag | `/my/bag` |
| Customer Service | `/customer-service/` |
| Returns | `/returns` |
| Store Locator | `/stores/browse/` |
| Credit Card | `/my-credit/gateway` |
| Loyallist | `/creditservice/marketing/loyallist` |
| Order Status | `/purchases/lookup` |
| Pickup/Delivery | `/c/curbside-pickup-same-day-delivery` |

## Appendix B: Key Interactive UI Patterns

| Component | Description |
|---|---|
| Rotating Banner | Auto-playing slideshow with prev/next/pause controls |
| Product Carousel | Horizontal scrollable product list with Next button |
| Mega Menu | "Shop All" hamburger menu for all categories |
| Email Capture Modal | Overlay popup for newsletter signup (dismissible) |
| Category Sidebar | Left-nav with expandable subcategory lists |
| Visual Category Grid | Image-based category browsing cards |
| Search Autocomplete | Expandable search suggestions (aria-expanded) |
| Store Selector | "Your store" button for local store selection |
| Registry Drawer | Side drawer for bRegistry access |
| Credit Pre-qualification | Popup with Citi integration for instant check |

## Appendix C: Featured Designer Brands (February 2026)

### Women's Fashion
A.L.C., AGOLDE, Alice and Olivia, AQUA, Cinq a Sept, Eileen Fisher, FARM Rio, FRAME, L'AGENCE, Maje, Moncler, PAIGE, Polo Ralph Lauren, rag & bone, Ramy Brook, Sandro, SLVRLAKE, STAUD, Theory, Vince

### Beauty & Fragrance
Armani Beauty, Bobbi Brown, CHANEL, Charlotte Tilbury, Clinique, Cle de Peau Beaute, CREED, Decorte, DIOR, Dyson, Le Labo, Maison Francis Kurkdjian, Parfums de Marly, Solferino Paris, Touchland, Yves Saint Laurent Beauty

### Jewelry & Accessories
Bloomingdale's Fine Collection, David Yurman

### Travel & Luggage
Bric's, Samsonite, Tumi

### Outerwear
Canada Goose, Moncler, SAM.

---

*Document generated by RAG Context Generator*
*Source: https://www.bloomingdales.com*
*Purpose: RAG context for domain application development*
*Note: Content reflects the site as of February 2026. Some promotions (Presidents' Day Sale, Valentine's Day delivery) are seasonal.*

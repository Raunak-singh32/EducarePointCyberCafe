# 📌 EDUCARE POINT CYBER CAFE — Complete Project Context
> Paste this entire file into a new chat to give Claude full context.
> Last updated: July 2026

---

## 🏪 Project Overview

Real-world full-stack MERN application for **Educare Point Cyber Cafe**
- Location: 782 S.K. Nagar, Rishra, Hooghly, Naya Basti, Jhaji More — 712249
- Owner: **Ajay Kumar Ram**
- WhatsApp: `919331443939`
- UPI ID: `pointeducare@ybl`
- Business Hours: 9 AM–2:30 PM, 5 PM–10 PM
- Developer: Raunak (3rd Year B.Tech IT, MCKV Institute of Engineering, 2023–2027)

---

## 🌐 Deployment

| Service | URL |
|---------|-----|
| Frontend | https://educare-point-cyber-cafe.vercel.app |
| Backend | https://educarepointcybercafe-1.onrender.com |
| Database | MongoDB Atlas M0 (free, 512MB) |
| Images | Cloudinary (free tier) |
| Uptime | UptimeRobot pings `/health` every 5 min to prevent Render sleep |

---

## 🗂️ Folder Structure

```
EducarePoint/
├── client/                          # React Frontend → Vercel
│   ├── public/
│   │   ├── index.html               # Page title: "Educare Point Cyber Cafe - Rishra, Hooghly"
│   │   ├── manifest.json            # PWA manifest (installable on mobile)
│   │   ├── wheel-rotating.gif       # Logo in navbar
│   │   └── phonepe-qr.png          # PhonePe QR code for UPI payment
│   └── src/
│       ├── App.js                   # Root: Router, AuthProvider, navbar, Printout badge, A→D→M secret
│       ├── App.css                  # ALL styling (4900+ lines, dark glassmorphism theme)
│       ├── index.js                 # Entry: wraps CartProvider, CompareProvider, BrowserRouter
│       ├── useScrollEffects.js      # useStickyNav, useScrollTint hooks
│       │
│       ├── context/
│       │   ├── AuthContext.js       # Google OAuth + JWT user state, localStorage persistence
│       │   ├── CartContext.js       # Global cart state (add, remove, update qty, clear)
│       │   └── CompareContext.js    # Product comparison state (max 3 products)
│       │
│       ├── pages/
│       │   ├── ProductList.js       # Home: product grid, search, filter, sort, categories,
│       │   │                        # featured, popular, new badges, testimonials, services
│       │   │                        # preview, contact section, Ken Burns hero, quick view
│       │   │
│       │   ├── ProductDetail.js     # Single product: image, details, share, WhatsApp order,
│       │   │                        # add to cart, buy now, related products
│       │   │
│       │   ├── Cart.js              # Cart flow (4 steps):
│       │   │                        # Step 1: Cart view (items, qty, subtotal)
│       │   │                        # Step 2: Order details (name, phone, delivery type)
│       │   │                        # Step 3: Payment method (UPI / COD)
│       │   │                        # Step 4: UPI (QR + screenshot upload) or COD confirm
│       │   │                        # Success: order summary + WhatsApp notify owner button
│       │   │                        # Uses SAME CSS classes as Services.js for consistent UI
│       │   │
│       │   ├── Services.js          # Service ordering flow (5 steps):
│       │   │                        # Step 1: Order form (service type, file upload, page range,
│       │   │                        #          stationery items, customer details, delivery)
│       │   │                        # Step 2: Payment method (UPI / COD)
│       │   │                        # Step 3: UPI (QR + screenshot upload)
│       │   │                        # Success: order summary + WhatsApp notify owner button
│       │   │                        # Has PDF page count detection, auto price calculator
│       │   │
│       │   ├── OrderHistory.js      # Customer order lookup by phone number (secure — 
│       │   │                        # only fetches that customer's orders, NOT all orders)
│       │   │                        # Shows status, payment, delivery, WhatsApp contact button
│       │   │
│       │   ├── AdminLogin.js        # JWT login for admin (hidden from navbar)
│       │   │                        # Access: press A→D→M on keyboard (secret shortcut)
│       │   │
│       │   ├── AdminDashboard.js    # Admin panel:
│       │   │                        # Stats: products, pending orders, total orders, revenue
│       │   │                        # Products tab: CRUD with search by name, image upload,
│       │   │                        #   Popular/New badge toggle
│       │   │                        # Orders tab: status update, payment verify/reject,
│       │   │                        #   screenshot viewer, WhatsApp customer contact,
│       │   │                        #   file download, auto-refresh
│       │   │
│       │   ├── Compare.js           # Side-by-side product comparison (max 3)
│       │   └── Login.js             # Customer login/signup (Google OAuth + email/password)
│       │
│       ├── components/
│       │   ├── ScrollToTop.js       # Scroll to top button (appears after scroll)
│       │   └── Loading.js           # Loading spinner component
│       │
│       └── services/
│           └── api.js               # All Axios API calls:
│                                    # productAPI: getAll, getById, create, update, delete
│                                    # orderAPI: create, getAll, getByPhone, updateStatus,
│                                    #   uploadPaymentScreenshot, verifyPayment
│                                    # uploadAPI: uploadFile
│                                    # authAPI: register, login, getMe, updateProfile
│
│
├── server/                          # Node.js/Express Backend → Render
│   ├── index.js                     # Express server setup:
│   │                                # CORS (allows Vercel + localhost:3000/5173)
│   │                                # MongoDB connection (exits on failure)
│   │                                # Routes: products, orders, upload, download, auth
│   │                                # Health endpoint: GET /health
│   │                                # Session + Passport for Google OAuth
│   │
│   ├── models/
│   │   ├── Product.js               # Product schema:
│   │   │                            # name, price, category, image (Cloudinary URL),
│   │   │                            # description, popular (bool), isNew (bool),
│   │   │                            # stockStatus (in-stock/low-stock/out-of-stock),
│   │   │                            # displayQuantity, createdAt
│   │   │
│   │   ├── Order.js                 # Order schema:
│   │   │                            # serviceType, items[], totalPrice,
│   │   │                            # customerName, customerPhone,
│   │   │                            # deliveryType (pickup/delivery), address, pickupTime,
│   │   │                            # paymentMethod (upi/cod), paymentStatus (pending/paid/failed/refunded),
│   │   │                            # paymentScreenshot (Cloudinary URL),
│   │   │                            # fileUrl, fileName, notes, pageRange,
│   │   │                            # status (pending/processing/ready/delivered/cancelled),
│   │   │                            # printType, paperSize, pages, copies,
│   │   │                            # deliveredAt (TTL field — auto-deletes 30 days after delivery)
│   │   │
│   │   └── User.js                  # Customer user schema:
│   │                                # name, email, password (hashed), whatsapp, address,
│   │                                # googleId (for OAuth), createdAt
│   │
│   ├── routes/
│   │   ├── products.js              # GET /api/products (with 5-min memory cache)
│   │   │                            # GET /api/products/:id
│   │   │                            # POST /api/products (admin JWT required)
│   │   │                            # PUT /api/products/:id (admin JWT required)
│   │   │                            # DELETE /api/products/:id (admin JWT required)
│   │   │                            # Cache cleared on any write operation
│   │   │
│   │   ├── orders.js                # POST /api/orders (create order)
│   │   │                            # GET /api/orders (all orders — admin only)
│   │   │                            # GET /api/orders/by-phone/:phone (customer lookup — secure)
│   │   │                            # PUT /api/orders/:id (update status)
│   │   │                            # POST /api/orders/:id/payment-screenshot
│   │   │                            # PUT /api/orders/:id/verify-payment
│   │   │                            # GET /api/orders/stats/today
│   │   │
│   │   ├── upload.js                # POST /api/upload (Cloudinary upload)
│   │   │                            # Uses multer memoryStorage + streamifier
│   │   │                            # Supports: PDF, DOC, DOCX, JPG, PNG, JPEG
│   │   │                            # resource_type: 'raw' for PDFs, 'image' for images
│   │   │                            # GET /api/upload/health (check Cloudinary connection)
│   │   │
│   │   ├── auth.js                  # POST /api/auth/register
│   │   │                            # POST /api/auth/login
│   │   │                            # GET /api/auth/me (get current user)
│   │   │                            # PUT /api/auth/update (update profile)
│   │   │                            # Google OAuth routes
│   │   │
│   │   └── download.js              # GET /api/download (PDF download proxy)
│   │
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware for admin routes
│   │
│   ├── config/
│   │   └── cloudinary.js            # Cloudinary v2 config from env vars
│   │                                # IMPORTANT: exports { cloudinary } (destructured)
│   │                                # upload.js uses: const { cloudinary } = require(...)
│   │
│   ├── passport.js                  # Google OAuth passport strategy
│   └── package.json                 # Dependencies: express, mongoose, cors, multer,
│                                    # cloudinary, streamifier, jsonwebtoken, bcryptjs,
│                                    # passport, passport-google-oauth20, express-session,
│                                    # express-rate-limit, dotenv
│
├── README.md
└── .gitignore
```

---

## ⚙️ Environment Variables

### Server (.env in /server)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
PORT=5000
NODE_ENV=production
```

### Client (.env in /client)
```
REACT_APP_GEMINI_KEY=...  (for future AI chatbot)
```

---

## ✅ Features Currently Working

### Customer Side
- Browse products (search, filter by category, sort by price/name)
- Featured, Popular, New badge products
- Product quick view modal
- Product detail page with share + WhatsApp order
- Compare up to 3 products side-by-side
- Cart: add, remove, update quantity
- Cart checkout flow (matches Services UI): details → payment → UPI/COD → success
- Service ordering: Print (B&W ₹2, Color ₹5), Xerox (₹1), Scan (₹5), Lamination (₹30), Binding (₹50)
- PDF file upload with auto page count detection
- Stationery item add-on during service order
- Delivery type: Pickup or Home Delivery (+₹15)
- Payment: UPI (QR + screenshot) or Cash on Delivery
- WhatsApp owner notification button on success screen
- Google Sign-In + email/password login
- Auto-fill checkout form from user profile
- Order history lookup by phone number (secure)
- PWA installable on mobile (manifest.json)

### Admin Side (Access: press A→D→M on keyboard)
- Dashboard stats: products, pending, total orders, today's revenue
- Products: add/edit/delete with Cloudinary image upload
- Product search by name
- Popular/New badge toggle
- Orders: view all, update status (pending→processing→ready→delivered→cancelled)
- Payment verification: view UPI screenshot, verify or reject
- Customer file download
- WhatsApp quick-contact customer
- Auto-refresh orders
- Orders auto-delete 30 days after marked delivered (MongoDB TTL)

### UI/Design
- Dark glassmorphism theme
- Auto-changing background slideshow (Ken Burns effect, 8 images)
- Floating glassmorphism navbar pill (hides on scroll down)
- Trade Licence badge (glowing green, top-left)
- Printout badge (glowing orange, below Trade Licence — click → Services page)
- Animated hero with gold shimmer title
- 3D card tilt effects on hover
- Scroll-triggered reveal animations
- Floating WhatsApp button
- Mobile responsive (360px to 1400px)
- Navbar collapses to scrollable row on mobile

---

## 🔧 Key Technical Decisions & Bugs Fixed

| Issue | Fix |
|-------|-----|
| Cloudinary import bug | `const { cloudinary } = require(...)` not `const cloudinary = require(...)` |
| Double order creation | Removed duplicate `orderAPI.create()` call in Services.js |
| `orderId.slice` crash | `res.data.order._id` was correct path; fixed undefined state |
| UPI screenshot wrong ID | `createOrder()` now returns `newOrderId`; used directly in `handleUPIOrderSubmit` |
| All orders exposed to customers | Added `/api/orders/by-phone/:phone` endpoint (secure, server-side filter) |
| WhatsApp blocked by browser | Moved from auto `window.open()` after async to manual tap button |
| Cart page ugly/stretched | Rewrote Cart.js to use same CSS classes as Services.js |
| CSS duplicates | Merged and deduped App.css (duplicate @keyframes spin, .spinner, .badge, etc.) |
| Product cache | 5-min in-memory cache on `GET /api/products` (reduces DB calls for concurrent users) |
| Rate limiting | `express-rate-limit`: 60 requests/min per IP on all `/api/` routes |
| MongoDB auto-delete | TTL index on `deliveredAt` field → auto-deletes orders 30 days after delivery |

---

## 💰 Service Pricing

| Service | Price |
|---------|-------|
| Print Black & White | ₹2/page |
| Print Color | ₹5/page |
| A3 paper | 2× base price |
| Legal paper | 1.5× base price |
| Xerox | ₹1/page |
| Scan | ₹5/document |
| Lamination | ₹30/document |
| Spiral Binding | ₹50/report |
| Home Delivery charge | +₹15 |

---

## 🗺️ Future Roadmap

### Phase 1 — Foundation (2–3 weeks)
- [ ] OTP Login via SMS (Twilio or MSG91 free tier)
- [ ] Forgot Password (email reset)
- [ ] Customer Dashboard (profile, past orders, saved address)
- [ ] Wishlist (save products)
- [ ] Order Cancellation (customer can cancel pending orders)
- [ ] Reviews & Ratings on products
- [ ] PDF Invoice generation (jsPDF or react-pdf)
- [ ] Inventory alerts (low stock warning to admin WhatsApp)
- [ ] Coupon/discount codes

### Phase 2 — Monetization (3–4 weeks)
- [ ] Razorpay payment gateway (real UPI + card)
- [ ] Cash on Delivery confirmation flow improvement
- [ ] Delivery charge calculator (by distance/area)
- [ ] Email notifications (order confirmation, status update)
- [ ] SMS notifications (Twilio/Fast2SMS free tier)
- [ ] Admin analytics dashboard (Chart.js — daily/weekly revenue, top products)
- [ ] Sales reports (PDF export)

### Phase 3 — AI Integration (4–6 weeks)
- [ ] AI Customer Support Chatbot (Gemini 1.5 Flash — FREE: 15 req/min, 1M tokens/day)
  - Answer service questions, pricing, hours
  - Already planned: `REACT_APP_GEMINI_KEY` in client .env
- [ ] AI Product Recommendations (based on browsing/cart)
- [ ] Voice Search (Web Speech API — free, browser built-in)
- [ ] OCR Document Reading (for print jobs — Google Vision API)
- [ ] Automatic price suggestions for new products

### Phase 4 — Mobile App (2–3 weeks)
- [ ] PWA already done ✅ (installable from browser)
- [ ] Push Notifications (Firebase Cloud Messaging — free tier)
- [ ] Offline mode (service worker caching products)
- [ ] Native Android APK (Capacitor wrapping the PWA)

### Phase 5 — ERP (5–7 weeks)
- [ ] Employee panel (separate login)
- [ ] Attendance tracking
- [ ] Expense tracking
- [ ] Supplier management
- [ ] Barcode scanner (product inventory)
- [ ] QR-based billing at counter
- [ ] GST billing + Invoice generator
- [ ] Loyalty points system
- [ ] Customer referral rewards
- [ ] Stock prediction (based on order history)

---

## 📅 Immediate Next Steps (Before Public Launch)

1. **Clean MongoDB** — Delete test/duplicate orders from Atlas dashboard
2. **Train owner** — Show admin dashboard: order status flow, UPI verify, file download
3. **Complete product catalog** — Add all real products with photos
4. **End-to-end test** on deployed site from real phone:
   - COD order from product page
   - UPI order from services page  
   - Order history lookup
   - WhatsApp notify button
5. **Share link** with trusted local customers (soft launch)
6. **Domain** — Get `.in` domain (~₹200/yr) → connect Cloudflare free (CDN + DDoS)

---

## 🛠️ Git Workflow

```bash
# Push server changes
cd server
git add .
git commit -m "feat/fix: description"
git push origin main
# Then: Render dashboard → Manual Deploy → Deploy Latest Commit

# Push client changes
cd client
git add .
git commit -m "feat/fix: description"
git push origin main
# Vercel auto-deploys on push
```

---

## 📊 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router DOM, Axios, Context API, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (mongoose) |
| Auth | Google OAuth 2.0 (Passport.js) + JWT (admin) + bcrypt |
| File Storage | Cloudinary (multer memoryStorage + streamifier stream) |
| Deployment | Vercel (frontend), Render free tier (backend) |
| Uptime | UptimeRobot (hits /health every 5 min) |
| Rate Limiting | express-rate-limit (60 req/min/IP) |
| Caching | In-memory product cache (5 min TTL) |

---

## 🔐 Secret Access Points

- **Admin panel**: Press `A` then `D` then `M` on keyboard (within 2 sec) → goes to `/admin-login`
- **Admin credentials**: Set in JWT_SECRET env var (owner has these)
- **No admin button visible** in navbar to customers

---

## 📁 Key File Notes for New Chat

When asking for help, mention which file you're working on:
- UI/design issue → `App.css`
- Product page → `ProductList.js`
- Cart checkout → `Cart.js`
- Service orders → `Services.js`
- Order tracking → `OrderHistory.js`
- Admin panel → `AdminDashboard.js`
- API calls → `services/api.js`
- Backend routes → `server/routes/*.js`
- Database models → `server/models/*.js`
- Main layout/navbar → `App.js`

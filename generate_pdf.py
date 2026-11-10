import os
import sys
from fpdf import FPDF
from fpdf.fonts import FontFace

class EducareDocPDF(FPDF):
    def __init__(self):
        super().__init__(orientation='P', unit='mm', format='A4')
        self.set_auto_page_break(auto=True, margin=20)
        
        # Load Windows fonts for clean typography
        font_dir = r"C:\Windows\Fonts"
        self.add_font("ArialCustom", "", os.path.join(font_dir, "arial.ttf"))
        self.add_font("ArialCustom", "B", os.path.join(font_dir, "arialbd.ttf"))
        self.add_font("ArialCustom", "I", os.path.join(font_dir, "ariali.ttf"))
        self.add_font("ConsolasCustom", "", os.path.join(font_dir, "consola.ttf"))
        self.add_font("ConsolasCustom", "B", os.path.join(font_dir, "consolab.ttf"))
        
        self.current_section = "Educare Point Cyber Cafe -- System Specification"

    def header(self):
        if self.page_no() == 1:
            return  # Suppress header on cover page
        
        self.set_font("ArialCustom", "B", 8)
        self.set_text_color(100, 116, 139) # slate-500
        self.cell(0, 6, "EDUCARE POINT CYBER CAFE  |  SYSTEM DESIGN & ARCHITECTURE SPECIFICATION", align="L")
        self.ln(4)
        self.set_font("ArialCustom", "I", 7)
        self.cell(0, 4, self.current_section, align="L")
        self.ln(4)
        self.set_draw_color(226, 232, 240)
        self.set_line_width(0.4)
        self.line(15, self.get_y(), 195, self.get_y())
        self.ln(6)

    def footer(self):
        if self.page_no() == 1:
            return  # Suppress footer on cover page
            
        self.set_y(-15)
        self.set_draw_color(226, 232, 240)
        self.set_line_width(0.3)
        self.line(15, self.get_y(), 195, self.get_y())
        self.ln(2)
        
        self.set_font("ArialCustom", "", 8)
        self.set_text_color(148, 163, 184)
        self.cell(90, 6, "Educare Point Cyber Cafe - System Design & Project Report", align="L")
        self.cell(90, 6, f"Page {self.page_no()} of {{nb}}", align="R")

    def cover_page(self):
        self.add_page()
        self.ln(10)
        
        # Top banner pill
        self.set_fill_color(30, 58, 138) # Dark Navy / Indigo
        self.set_draw_color(30, 58, 138)
        self.rect(15, 20, 180, 5, style='F')
        
        self.ln(15)
        self.set_font("ArialCustom", "B", 11)
        self.set_text_color(37, 99, 235) # Blue accent
        self.cell(0, 8, "ACADEMIC & PRODUCTION SYSTEM DESIGN DOCUMENTATION", align="C")
        self.ln(10)
        
        self.set_font("ArialCustom", "B", 24)
        self.set_text_color(15, 23, 42) # Slate-900
        self.multi_cell(0, 11, "EDUCARE POINT CYBER CAFE", align="C")
        self.ln(2)
        
        self.set_font("ArialCustom", "", 13)
        self.set_text_color(71, 85, 105) # Slate-600
        self.multi_cell(0, 7, "Next-Generation MERN Full-Stack E-Commerce Platform &\nCloud-Integrated Digital Cyber Cafe Operating System", align="C")
        self.ln(6)
        
        # Decorative divider
        self.set_draw_color(59, 130, 246)
        self.set_line_width(1.0)
        self.line(65, self.get_y(), 145, self.get_y())
        self.ln(10)
        
        # Meta info box
        self.set_fill_color(248, 250, 252) # Slate-50
        self.set_draw_color(226, 232, 240)
        self.rect(20, self.get_y(), 170, 68, style='DF')
        
        box_y = self.get_y() + 4
        self.set_xy(25, box_y)
        self.set_font("ArialCustom", "B", 10)
        self.set_text_color(30, 58, 138)
        self.cell(0, 6, "PROJECT METADATA & STAKEHOLDER DIRECTORY")
        self.ln(7)
        
        meta_items = [
            ("Lead Developer & Architect", "Raunak Kumar (B.Tech IT, 3rd Year, 2023-2027)"),
            ("Institution", "MCKV Institute of Engineering, West Bengal, India"),
            ("Business Enterprise", "Educare Point Cyber Cafe (Trade Licenced Enterprise)"),
            ("Physical Location", "782 S.K. Nagar, Rishra, Hooghly, Naya Basti, Jhaji More - 712249"),
            ("Business Hours", "9:00 AM - 2:30 PM, 5:00 PM - 10:00 PM IST"),
            ("Production Frontend URL", "https://educare-point-cyber-cafe.vercel.app"),
            ("Production API Endpoint", "https://educarepointcybercafe-1.onrender.com"),
            ("Document Scope", "Complete System Architecture, Data Models, Implemented Workflows & Future Roadmap")
        ]
        
        for label, val in meta_items:
            self.set_x(25)
            self.set_font("ArialCustom", "B", 8.5)
            self.set_text_color(15, 23, 42)
            self.cell(50, 5, label + ":")
            self.set_font("ArialCustom", "", 8.5)
            self.set_text_color(51, 65, 85)
            self.cell(110, 5, val)
            self.ln(5)
            
        self.set_y(box_y + 72)
        
        # Executive Abstract
        self.set_font("ArialCustom", "B", 11)
        self.set_text_color(15, 23, 42)
        self.cell(0, 6, "DOCUMENT ABSTRACT")
        self.ln(6)
        
        self.set_font("ArialCustom", "", 9)
        self.set_text_color(51, 65, 85)
        abstract_text = (
            "This document provides the exhaustive, end-to-end technical specification, system design, architectural "
            "blueprints, database schemas, and current implementation audit for the Educare Point Cyber Cafe digital platform. "
            "Designed and deployed as a real-world production system, the platform solves chronic inefficiencies in local "
            "cyber cafe operations--such as physical queueing, virus transmission via USB thumb-drives, manual print calculation, "
            "and untracked cash collections--by providing an automated, cloud-connected self-service portal. "
            "This report covers the full technological stack (React 19, Node/Express 5, MongoDB Atlas, Redis, Cloudinary), "
            "detailed REST API topologies, security mitigations, resolved production challenges, and a prioritized 5-phase "
            "engineering roadmap toward a comprehensive Cyber Cafe Enterprise Resource Planning (ERP) suite."
        )
        self.multi_cell(0, 4.8, abstract_text)
        
        self.ln(6)
        # Status Badge
        self.set_fill_color(220, 252, 231) # Green-100
        self.set_draw_color(34, 197, 94)
        self.rect(15, self.get_y(), 180, 10, style='DF')
        self.set_xy(15, self.get_y() + 2)
        self.set_font("ArialCustom", "B", 8.5)
        self.set_text_color(21, 128, 61)
        self.cell(180, 6, "STATUS: PRODUCTION LIVE & CONTINUOUSLY MONITORED VIA UPTIMEROBOT", align="C")
        
        self.add_page()

    def chapter_title(self, num_str, title_str):
        self.current_section = f"Section {num_str}: {title_str}"
        self.ln(4)
        self.set_fill_color(241, 245, 249) # slate-100
        self.set_draw_color(59, 130, 246)  # blue-500
        self.set_line_width(0.8)
        
        # Pill badge
        self.set_font("ArialCustom", "B", 8.5)
        self.set_text_color(37, 99, 235)
        self.cell(26, 6, f" SECTION {num_str} ", border=1, fill=True, align="C")
        self.ln(7)
        
        # Heading
        self.set_font("ArialCustom", "B", 14)
        self.set_text_color(15, 23, 42) # slate-900
        self.cell(0, 8, title_str, align="L")
        self.ln(7)
        self.set_draw_color(203, 213, 225)
        self.set_line_width(0.3)
        self.line(15, self.get_y(), 195, self.get_y())
        self.ln(4)

    def section_heading(self, title):
        self.ln(2)
        self.set_font("ArialCustom", "B", 11)
        self.set_text_color(30, 58, 138) # blue-900
        self.cell(0, 6, title, align="L")
        self.ln(6)

    def sub_section_heading(self, title):
        self.ln(1)
        self.set_font("ArialCustom", "B", 9.5)
        self.set_text_color(51, 65, 85) # slate-700
        self.cell(0, 5, title, align="L")
        self.ln(5)

    def body_p(self, text):
        self.set_font("ArialCustom", "", 9)
        self.set_text_color(51, 65, 85)
        self.multi_cell(0, 4.8, text)
        self.ln(2)

    def bullet_point(self, bold_prefix, text):
        self.set_font("ArialCustom", "B", 9)
        self.set_text_color(15, 23, 42)
        prefix_str = f"  * {bold_prefix}: "
        self.write(4.8, prefix_str)
        self.set_font("ArialCustom", "", 9)
        self.set_text_color(51, 65, 85)
        self.write(4.8, text + "\n")
        self.ln(1.5)

    def callout_box(self, title, content, box_type="info"):
        self.ln(2)
        if box_type == "info":
            bg_col = (239, 246, 255)
            border_col = (59, 130, 246)
            title_col = (29, 78, 216)
        elif box_type == "success":
            bg_col = (240, 253, 244)
            border_col = (34, 197, 94)
            title_col = (21, 128, 61)
        elif box_type == "warning":
            bg_col = (255, 251, 235)
            border_col = (245, 158, 11)
            title_col = (180, 83, 9)
        else:
            bg_col = (248, 250, 252)
            border_col = (148, 163, 184)
            title_col = (51, 65, 85)

        start_x = 15
        start_y = self.get_y()
        self.set_font("ArialCustom", "B", 9)
        
        self.set_fill_color(*bg_col)
        self.set_draw_color(*border_col)
        self.set_line_width(0.5)
        
        self.set_x(start_x + 3)
        self.set_text_color(*title_col)
        self.cell(0, 5, title)
        self.ln(5)
        
        self.set_font("ArialCustom", "", 8.5)
        self.set_text_color(51, 65, 85)
        self.set_x(start_x + 3)
        self.multi_cell(174, 4.3, content)
        end_y = self.get_y()
        
        h = end_y - start_y + 3
        self.rect(start_x, start_y - 1, 180, h, style='D')
        self.set_fill_color(*border_col)
        self.rect(start_x, start_y - 1, 2.5, h, style='F')
        self.set_y(end_y + 3)

    def code_snippet(self, code_text):
        self.ln(1)
        start_x = 15
        self.set_fill_color(30, 41, 59) # slate-800
        self.set_font("ConsolasCustom", "", 8)
        self.set_text_color(241, 245, 249)
        
        lines = code_text.strip().split('\n')
        line_h = 4.0
        block_h = len(lines) * line_h + 4
        
        if self.get_y() + block_h > 275:
            self.add_page()
            
        cur_y = self.get_y()
        self.rect(start_x, cur_y, 180, block_h, style='F')
        self.set_xy(start_x + 3, cur_y + 2)
        
        for line in lines:
            self.cell(174, line_h, line)
            self.ln(line_h)
            self.set_x(start_x + 3)
            
        self.set_y(cur_y + block_h + 3)
        self.set_text_color(51, 65, 85)

def build_pdf():
    pdf = EducareDocPDF()
    pdf.alias_nb_pages()
    
    header_style = FontFace(emphasis="BOLD", color=(30, 58, 138), fill_color=(241, 245, 249))
    
    # Page 1: Cover Page
    pdf.cover_page()
    
    # ----------------------------------------------------
    # SECTION 1: BUSINESS OVERVIEW & PROBLEM STATEMENT
    # ----------------------------------------------------
    pdf.chapter_title("01", "EXECUTIVE SUMMARY & BUSINESS PROBLEM STATEMENT")
    
    pdf.section_heading("1.1 Background & Real-World Context")
    pdf.body_p(
        "Educare Point Cyber Cafe is an established trade-licensed digital services and stationery enterprise located in "
        "Rishra, Hooghly, West Bengal. Like tens of thousands of suburban and regional cyber cafes across India, Educare Point "
        "functions as an essential civic lifeline for students, job applicants, local businesses, and households. The center "
        "provides high-volume printing, document scanning, official certificate lamination, spiral report binding, and academic stationery sales."
    )
    pdf.body_p(
        "Historically, cyber cafes have operated via pure walk-in, manual workflows. This paradigm introduces compounding bottlenecks "
        "during peak hours (such as college project submission weeks and government examination application windows)."
    )
    
    pdf.section_heading("1.2 The Traditional Operational Bottlenecks")
    pdf.bullet_point("Pen-Drive & Virus Infection Risks", "Customers traditionally bring personal documents on USB thumb-drives, introducing severe malware and ransomware vulnerabilities to counter workstations.")
    pdf.bullet_point("Friction in Document Inspection & Price Quoting", "Staff must manually open multiple PDFs, count page quantities across mixed color/black-and-white page ranges, compute multipliers for paper sizes (A4 vs. Legal vs. A3), and calculate binding charges manually.")
    pdf.bullet_point("Severe Physical Queuing", "Customers queue for 20 to 45 minutes simply to print a single document, leading to customer churn and staff exhaustion.")
    pdf.bullet_point("Untracked Offline & Cash Payments", "Discrepancies in cash collection, missing UPI screenshot records, and lack of customer-identifiable payment ledgers lead to revenue leakage.")
    pdf.bullet_point("Siloed Retail Inventory", "Stationery products (pens, registers, art supplies, notebooks) are sold across the counter with no digital catalog, preventing remote discovery or cross-selling during print orders.")

    pdf.section_heading("1.3 The Educare Point Solution")
    pdf.body_p(
        "Educare Point solves this by transforming the local cyber cafe into a modern digital platform. Customers can upload documents "
        "directly from mobile or desktop, select page ranges, choose color or B&W modes, paper sizes, and binding styles, inspect real-time "
        "price calculations, add stationery items, pay securely via QR/UPI or Cash on Delivery, track order status live via phone lookup, "
        "and select counter pickup or local home delivery (Rs. 15 flat rate)."
    )
    
    pdf.callout_box(
        "Core Value Proposition",
        "Zero-waiting-time document printing + On-demand academic stationery delivery + Automated UPI payment reconciliation + WhatsApp direct integration = Complete digital transformation of suburban cyber cafe operations.",
        "success"
    )
    
    # ----------------------------------------------------
    # SECTION 2: COMPLETE TECHNOLOGY STACK
    # ----------------------------------------------------
    pdf.chapter_title("02", "COMPREHENSIVE TECHNOLOGY STACK & INFRASTRUCTURE")
    
    pdf.body_p(
        "The application is engineered on the industry-standard MERN (MongoDB, Express.js, React, Node.js) architecture, enhanced with "
        "high-performance cloud infrastructure and caching layers to guarantee low latency, robust data persistence, and zero operational downtime."
    )
    
    with pdf.table(col_widths=(32, 42, 106), headings_style=header_style) as table:
        table.row(["Stack Layer", "Technology Selected", "Technical Justification & Purpose in Architecture"])
        table.row(["Frontend Library", "React.js (v19.2.7)", "Declarative component-driven UI with optimized virtual DOM reconciliation, hooks, and responsive lifecycle."])
        table.row(["Client Routing", "React Router DOM (v7.17)", "Single Page Application (SPA) client-side routing, URL state synchronization, and dynamic path navigation."])
        table.row(["Client State", "Context API (Modular)", "Three independent domain contexts: AuthContext (session), CartContext (cart persistence), CompareContext (side-by-side)."])
        table.row(["Styling System", "CSS3 Glassmorphism", "Custom design system (4,900+ lines in App.css) with Ken Burns dynamic background, 3D card tilts, and CSS variables."])
        table.row(["Mobile Capabilities", "PWA Manifest", "Web app manifest with standalone display, home screen installation on Android/iOS, and mobile viewport optimizations."])
        table.row(["Backend Runtime", "Node.js (v20+ LTS)", "Non-blocking asynchronous event-loop architecture optimal for high-concurrency I/O and document streaming."])
        table.row(["Web Framework", "Express.js (v5.2.1)", "Robust middleware pipeline, RESTful API routing, centralized error propagation, and HTTP lifecycle control."])
        table.row(["Database Tier", "MongoDB Atlas M0", "Managed multi-tenant document database with flexible JSON-like schemas, compound indexing, and TTL auto-purge."])
        table.row(["Object Modeling", "Mongoose (v9.7.0)", "Schema definition, field-level validations, virtual properties (stockStatus, displayQuantity), and compound indexes."])
        table.row(["In-Memory Caching", "Redis Cloud (ioredis v6)", "High-speed distributed key-value store for JWT token blacklisting and rapid session state invalidation."])
        table.row(["Cloud Media Storage", "Cloudinary v2 API", "Direct memory streaming via Multer + Streamifier for customer PDFs, Word documents, and UPI payment screenshots."])
        table.row(["Authentication", "Google OAuth 2.0 + JWT", "Dual auth model: Passwordless Google OAuth via Passport.js for customers; cryptographic JWT for admin access."])
        table.row(["Traffic & Security", "express-rate-limit & Joi", "IP-based brute force protection (20 attempts/15 min on auth, 60 req/min API) and strict schema input validation."])
        table.row(["Logging Pipeline", "Winston v3 + Morgan", "Structured multi-transport logging (console and rotating logs) piped through Morgan HTTP access streams."])
        table.row(["Cloud Hosting", "Vercel + Render + Uptime", "Edge CDN distribution for React client on Vercel; containerized backend on Render with 5-minute keep-alive pingers."])

    # ----------------------------------------------------
    # SECTION 3: SYSTEM ARCHITECTURE & HIGH-LEVEL DESIGN
    # ----------------------------------------------------
    pdf.chapter_title("03", "SYSTEM ARCHITECTURE & HIGH-LEVEL DESIGN")
    
    pdf.section_heading("3.1 Tiered Architectural Topology")
    pdf.body_p(
        "Educare Point employs a clean decoupled 4-tier cloud architecture designed for fault isolation, high availability, "
        "and seamless horizontal scaling:"
    )
    
    pdf.bullet_point("Presentation Tier (Vercel Edge CDN)", "Pre-rendered static client assets served with HTTP/2 and Brotli compression across global edge POPs. Features automatic HTTPS termination and instant cache invalidation on deployment.")
    pdf.bullet_point("Application Tier (Render Containerized Service)", "Express.js REST API operating behind reverse proxies. Handles business logic, PDF parsing, pricing rules, rate-limiting, and authentication validation.")
    pdf.bullet_point("Data & Caching Tier (MongoDB Atlas & Redis Cloud)", "Primary state stored in MongoDB Atlas with replica sets. Hot cache and security revocation lists maintained in Redis Cloud for sub-millisecond lookups.")
    pdf.bullet_point("External Integration Tier (Cloudinary, Google, WhatsApp)", "Cloudinary handles media ingestion and thumbnailing; Google Identity handles OAuth authorization; WhatsApp Web/API handles real-time dispatch.")
    
    pdf.section_heading("3.2 Architectural Flow & Data Transmission Blueprint")
    
    arch_ascii = (
        "+-------------------------------------------------------------------------+\n"
        "|                         CLIENT TIER (React SPA / PWA)                   |\n"
        "|   - Browsing & Compare    - PDF Page Counting Engine    - Cart & Checkout   |\n"
        "|   - Phone Order Tracking  - Secret [A-D-M] Admin Portal - Google Auth / JWT |\n"
        "+------------------------------------+------------------------------------+\n"
        "                                     | HTTPS / JSON / multipart-form\n"
        "                                     v\n"
        "+-------------------------------------------------------------------------+\n"
        "|                APPLICATION GATEWAY & MIDDLEWARE (Express.js)            |\n"
        "|   [CORS Filter] -> [Winston/Morgan Logger] -> [Rate Limiter (IP Shield)] |\n"
        "|   [Passport.js OAuth] -> [Joi Validator] -> [Admin Auth & Redis Check]  |\n"
        "+---------+--------------------------+--------------------------+---------+\n"
        "          |                          |                          |\n"
        "          v (Stream Upload)          v (Data Operations)        v (Auth Revocation)\n"
        "   +--------------+          +---------------+          +---------------+\n"
        "   |  Cloudinary  |          | MongoDB Atlas |          |  Redis Cloud  |\n"
        "   | Raw PDFs &   |          | Products,     |          | JWT Token     |\n"
        "   | Screenshots  |          | Orders, Users |          | Blacklist     |\n"
        "   +--------------+          +---------------+          +---------------+\n"
        "                                     |\n"
        "                                     v\n"
        "+-------------------------------------------------------------------------+\n"
        "|                   EXTERNAL COMMUNICATIONS & NOTIFICATIONS               |\n"
        "|   - WhatsApp Web API (Instant Owner Ping & Order Tracking Deep-Links)    |\n"
        "|   - UptimeRobot (5-Minute Keep-Alive Cron hitting /health endpoint)     |\n"
        "+-------------------------------------------------------------------------+"
    )
    pdf.code_snippet(arch_ascii)
    
    pdf.section_heading("3.3 State Management Architecture")
    pdf.body_p(
        "To avoid the boilerplate and overhead of external libraries like Redux or MobX, the application utilizes three cleanly separated "
        "React Context providers that manage localized domain state while preserving seamless cross-component synchronicity:"
    )
    pdf.bullet_point("AuthContext", "Manages user authentication state (customer profile, Google OAuth tokens, admin session, login/logout actions) backed by localStorage synchronization.")
    pdf.bullet_point("CartContext", "Maintains real-time e-commerce shopping cart items, quantities, pricing recalculation, local storage persistence, and checkout handoff.")
    pdf.bullet_point("CompareContext", "Controls an interactive side-by-side product comparison tray (up to 3 products) allowing customers to evaluate specs, pricing, and category features.")

    # ----------------------------------------------------
    # SECTION 4: DATABASE DESIGN & SCHEMA SPECIFICATIONS
    # ----------------------------------------------------
    pdf.chapter_title("04", "DATABASE MODELS & DATA ARCHITECTURE")
    
    pdf.body_p(
        "The database is designed around MongoDB Atlas document modeling principles, using Mongoose 9 to enforce strict schema definitions, "
        "type checking, virtual getters, and optimized compound indexes based on the Equality-Sort-Range (ESR) rule."
    )
    
    pdf.section_heading("4.1 Product Schema (Stationery & Retail Catalog)")
    pdf.body_p(
        "Stores all physical retail items with inventory counts, pricing, categories, and dynamic stock badges."
    )
    
    with pdf.table(col_widths=(35, 30, 115), headings_style=header_style) as table:
        table.row(["Field Name", "Type & Constraints", "Description & Business Rules"])
        table.row(["name", "String, Required", "Commercial product title (trimmed)."])
        table.row(["category", "String, Enum", "Allowed: pens, copies, art-supplies, stationery, craft, sports, utility, furniture, paper."])
        table.row(["subcategory", "String, Optional", "Fine-grained categorization (e.g. Gel Pens, Spiral Registers, Acrylic Paints)."])
        table.row(["price", "String/Number, Req", "Customer-facing retail price in INR (Rs.)."])
        table.row(["costPrice", "String/Number", "Wholesale procurement cost (used for merchant profit analytics)."])
        table.row(["quantity", "Number, Min: 0", "Live physical stock count available in the shop."])
        table.row(["image", "String (URL)", "Secure HTTPS URL hosted on Cloudinary CDN."])
        table.row(["sku", "String, Unique, Sparse", "Stock Keeping Unit identifier for counter barcode alignment."])
        table.row(["isActive", "Boolean, Default: true", "Soft-delete toggle to unlist products without destroying historical order links."])
        table.row(["showQuantity", "Boolean, Default: false", "Controls whether exact numeric inventory is exposed to retail customers."])
        table.row(["isPopular", "Boolean, Default: false", "Featured flag for homepage 'Popular' badge."])
        table.row(["isNew", "Boolean, Default: false", "Highlight flag for 'New Arrival' badge."])
        table.row(["lowStockAlert", "Number, Default: 5", "Threshold to automatically trigger merchant restocking notifications."])
        table.row(["stockStatus", "Virtual Getter", "Computed: 'out-of-stock' (qty<=0), 'low-stock' (qty<=alert), 'in-stock'."])
        table.row(["displayQuantity", "Virtual Getter", "Computed: Exact number if showQuantity=true, else 'Available'/'Out of Stock'."])

    pdf.sub_section_heading("Product Indexing Strategy (ESR Optimized):")
    pdf.bullet_point("Index 1: { category: 1 }", "Supports instant category filtering on the catalog page.")
    pdf.bullet_point("Index 2: { isPopular: 1, isNew: 1 }", "Optimizes landing page queries fetching featured and newly arrived items.")
    pdf.bullet_point("Index 3: { isActive: 1, category: 1 }", "Compound index ensuring that disabled products are excluded before category scanning.")

    pdf.section_heading("4.2 Order Schema (Printing Services & Retail Orders)")
    pdf.body_p(
        "Unified order schema encapsulating both cyber cafe service jobs (print, xerox, scan, lamination, binding) and physical stationery items."
    )
    
    with pdf.table(col_widths=(35, 30, 115), headings_style=header_style) as table:
        table.row(["Field Name", "Type & Constraints", "Description & Business Rules"])
        table.row(["serviceType", "String, Required", "Service identifier: print, xerox, scan, lamination, binding, or retail_cart."])
        table.row(["printType", "String", "B&W (Rs. 2/page) or Color (Rs. 5/page)."])
        table.row(["paperSize", "String, Default: A4", "Paper format: A4, A3 (2x multiplier), or Legal (1.5x multiplier)."])
        table.row(["pages / pageRange", "Number / String", "Total page count and specific range requested (e.g. '1-15, 22')."])
        table.row(["copies", "Number, Default: 1", "Number of identical print copies requested."])
        table.row(["items", "Array of Objects", "Stationery items: [{ itemId, name, price, quantity }]."])
        table.row(["totalPrice", "Number, Required", "Final calculated order total including delivery surcharge if applicable."])
        table.row(["customerName", "String, Required", "Full name of the purchasing customer."])
        table.row(["customerPhone", "String, Required", "10-digit mobile number used as the primary tracking key."])
        table.row(["deliveryType", "Enum: pickup, delivery", "Self-pickup at shop counter or local doorstep delivery (+Rs. 15)."])
        table.row(["address", "String", "Physical delivery address (mandatory when deliveryType is 'delivery')."])
        table.row(["pickupTime", "String, Optional", "Customer's estimated pickup timeframe."])
        table.row(["paymentMethod", "Enum: upi, cod", "Online UPI transfer (with QR screenshot) or Cash on Delivery."])
        table.row(["paymentStatus", "Enum", "pending, paid, failed, refunded (verified by merchant)."])
        table.row(["paymentScreenshot", "String (URL)", "Cloudinary image URL of the customer's UPI transaction confirmation."])
        table.row(["fileUrl / fileName", "String (URL) / String", "Cloudinary raw asset URL for customer uploaded PDF/DOC/image."])
        table.row(["status", "Enum", "Lifecycle state: pending -> processing -> ready -> completed -> cancelled."])
        table.row(["createdAt / updatedAt", "Date, Default: now", "Timestamps for audit tracking and daily revenue aggregation."])

    pdf.sub_section_heading("Order Indexing Strategy (ESR Optimized):")
    pdf.bullet_point("Index 1: { customerPhone: 1, createdAt: -1 }", "Enables sub-millisecond retrieval of order history by customer mobile number.")
    pdf.bullet_point("Index 2: { status: 1, createdAt: -1 }", "Powers the admin operational queue, sorting pending/processing jobs by urgency.")
    pdf.bullet_point("Index 3: { createdAt: -1 }", "General order timeline index for daily merchant revenue calculations.")

    pdf.section_heading("4.3 User Schema (Customer Identity)")
    pdf.body_p(
        "Stores registered customer credentials, supporting both traditional email/password authentication and passwordless Google OAuth."
    )
    pdf.bullet_point("name & email", "Customer identification; email is unique, lowercase, and trimmed.")
    pdf.bullet_point("password", "One-way salt-hashed string using bcryptjs (suppressed when registered via Google OAuth).")
    pdf.bullet_point("googleId", "Sparse unique index mapping Google Identity OAuth 2.0 user tokens.")
    pdf.bullet_point("whatsapp & address", "Pre-filled default checkout values to eliminate user typing friction on subsequent orders.")

    # ----------------------------------------------------
    # SECTION 5: CORE WORKFLOWS & USER JOURNEYS
    # ----------------------------------------------------
    pdf.chapter_title("05", "DETAILED SYSTEM WORKFLOWS & USER JOURNEYS")
    
    pdf.section_heading("5.1 Workflow 1: Document Printing & Cyber Cafe Services (Services.js)")
    pdf.body_p(
        "The digital printing engine is the cornerstone of Educare Point. It replaces walk-in friction with a guided 5-step workflow:"
    )
    
    pdf.bullet_point("Step 1: Document Upload & Client-Side Page Parsing", 
                     "Customer selects a file (PDF, DOC, DOCX, JPG, PNG). If a PDF is uploaded, a client-side reader parses the document structure to automatically detect the exact total page count, eliminating manual guesswork.")
    pdf.bullet_point("Step 2: Service & Print Configuration", 
                     "Customer chooses service type (Print, Xerox, Scan, Lamination, Spiral Binding), color preference (B&W at Rs. 2/page, Color at Rs. 5/page), paper format (A4 base, Legal 1.5x, A3 2x), page range, and number of copies.")
    pdf.bullet_point("Step 3: Stationery Cross-Selling Add-Ons", 
                     "Customer can seamlessly append stationery essentials (pens, exam files, sticky notes) to their print order without navigating to a separate storefront.")
    pdf.bullet_point("Step 4: Fulfillment & Payment Method", 
                     "Customer selects Pickup (Counter) or Home Delivery (+Rs. 15). Payment options: Cash on Delivery (COD) or Online UPI. If UPI is chosen, the screen renders the PhonePe QR code with merchant VPA (raunakkumar5203@nyes) and prompts for a payment screenshot upload.")
    pdf.bullet_point("Step 5: Order Confirmation & WhatsApp Dispatch", 
                     "The order is submitted to Express API, files are streamed to Cloudinary, and the user receives a confirmation screen with a pre-formatted WhatsApp button that pings the owner with complete job specifications.")

    pdf.section_heading("5.2 Official Service Rate Matrix")
    with pdf.table(col_widths=(45, 35, 100), headings_style=header_style) as table:
        table.row(["Service Offering", "Unit Rate (INR)", "Calculation Multipliers & Notes"])
        table.row(["Print Black & White", "Rs. 2.00 / page", "Standard A4 75 GSM paper. Base multiplier 1.0x."])
        table.row(["Print Color", "Rs. 5.00 / page", "High-resolution inkjet/laser color on standard A4."])
        table.row(["Paper: Legal Format", "1.5x Base Price", "Official legal/court petition format (B&W: Rs. 3, Color: Rs. 7.5)."])
        table.row(["Paper: A3 Large Sheet", "2.0x Base Price", "Double-sized engineering & architectural drawings (B&W: Rs. 4, Color: Rs. 10)."])
        table.row(["Xerox (Photocopy)", "Rs. 1.00 / page", "Single-sided high-speed B&W document replication."])
        table.row(["Document Scanning", "Rs. 5.00 / document", "High-DPI color scan delivered via Cloudinary cloud link."])
        table.row(["Heat Seal Lamination", "Rs. 30.00 / doc", "Heavy-duty waterproof protective film for certificates and ID cards."])
        table.row(["Spiral Report Binding", "Rs. 50.00 / report", "Plastic spiral coil with transparent front cover and card backing."])
        table.row(["Doorstep Delivery", "+Rs. 15.00 flat", "Local delivery across Rishra, Naya Basti, and Jhaji More."])

    pdf.section_heading("5.3 Workflow 2: E-Commerce Stationery Storefront (ProductList & Cart)")
    pdf.body_p(
        "The retail storefront provides full e-commerce capabilities optimized for desktop and mobile browsers:"
    )
    pdf.bullet_point("Catalog Discovery & Filtering", "Real-time search by product name, category pills (9 categories), and sorting (price low-high, high-low, alphabetical).")
    pdf.bullet_point("Product Comparison Engine", "Interactive tray allowing side-by-side spec and price comparison of up to 3 products simultaneously.")
    pdf.bullet_point("Quick View Modal & Product Details", "Instant modal overlay for rapid inspection with full detail page, social sharing, and direct WhatsApp order links.")
    pdf.bullet_point("Synchronized Checkout Flow", "Cart checkout follows the identical 4-step wizard UI as Services.js, maintaining cognitive consistency across customer journeys.")

    pdf.section_heading("5.4 Workflow 3: Secure Order Tracking (OrderHistory.js)")
    pdf.body_p(
        "To minimize customer friction, order tracking requires no password login. Customers enter their 10-digit mobile number. "
        "The backend queries solely through the indexed `/api/orders/by-phone/:phone` endpoint. It returns live status pills "
        "(Pending, Processing, Ready for Pickup, Delivered), payment verification status, and direct WhatsApp support links."
    )

    pdf.section_heading("5.5 Workflow 4: Administrative Backoffice (AdminDashboard.js)")
    pdf.body_p(
        "Admin operations are guarded by a stealth access pattern. No visible 'Admin' button exists on the customer website. "
        "The shop owner accesses the portal by pressing 'A' then 'D' then 'M' sequentially on the keyboard (within 2 seconds), "
        "navigating to `/admin-login`. Upon entering the cryptographic admin secret, a JWT is issued."
    )
    pdf.bullet_point("Live KPI Dashboard", "Instant counter metrics displaying Active Products, Pending Print Orders, Total Orders Completed, and Today's Gross Revenue.")
    pdf.bullet_point("Product Inventory Management", "Full CRUD operations: add items, upload product photos to Cloudinary, toggle Popular and New Arrival badges, update prices, and edit stock counts.")
    pdf.bullet_point("Order Fulfillment Pipeline", "Filter orders by status, inspect customer-uploaded print documents via a secure download proxy, review high-res UPI payment screenshots, verify or reject payments, and update lifecycle statuses.")
    pdf.bullet_point("One-Click Customer WhatsApp", "Directly opens WhatsApp Web with the customer's phone and a pre-composed status update (e.g., 'Your printout is ready for pickup!').")

    # ----------------------------------------------------
    # SECTION 6: API ARCHITECTURE & SPECIFICATIONS
    # ----------------------------------------------------
    pdf.chapter_title("06", "API SPECIFICATIONS & ROUTE ARCHITECTURE")
    
    pdf.body_p(
        "All backend communication is standardized around RESTful JSON endpoints prefixed with `/api`. File uploads utilize "
        "`multipart/form-data` with in-memory buffering."
    )
    
    with pdf.table(col_widths=(22, 50, 32, 76), headings_style=header_style) as table:
        table.row(["Method", "Endpoint", "Auth Required", "Function & Payload Description"])
        table.row(["GET", "/api/products", "Public", "Fetch product catalog (served via 5-min in-memory cache)."])
        table.row(["GET", "/api/products/:id", "Public", "Retrieve single product details by MongoDB ObjectId."])
        table.row(["POST", "/api/products", "Admin JWT", "Create new product with Cloudinary image URL."])
        table.row(["PUT", "/api/products/:id", "Admin JWT", "Update product attributes, prices, stock, or badges."])
        table.row(["DELETE", "/api/products/:id", "Admin JWT", "Soft or hard delete product from database."])
        table.row(["POST", "/api/orders", "Public", "Place new order (service print job or retail cart items)."])
        table.row(["GET", "/api/orders", "Admin JWT", "Retrieve all orders across the business for admin dashboard."])
        table.row(["GET", "/api/orders/by-phone/:p", "Public (Secure)", "Retrieve orders matching customer 10-digit mobile."])
        table.row(["PUT", "/api/orders/:id", "Admin JWT", "Update lifecycle status (pending, processing, ready, completed)."])
        table.row(["POST", "/api/orders/:id/screenshot", "Public", "Upload UPI payment screenshot image to order record."])
        table.row(["PUT", "/api/orders/:id/verify-pay", "Admin JWT", "Verify or reject customer payment (updates paymentStatus)."])
        table.row(["POST", "/api/upload", "Admin/User", "Stream file (PDF/Image) to Cloudinary; returns secure URL."])
        table.row(["GET", "/api/download", "Admin JWT", "Secure proxy streaming customer print PDFs for counter printing."])
        table.row(["POST", "/api/auth/register", "Public", "Register customer account with bcrypt password hashing."])
        table.row(["POST", "/api/auth/login", "Rate-Limited", "Customer authentication; returns JWT token."])
        table.row(["POST", "/api/auth/admin/login", "Rate-Limited", "Admin credentials verification; returns high-privilege JWT."])
        table.row(["GET", "/health", "Public (Uptime)", "Service health probe returning DB state and server uptime."])

    # ----------------------------------------------------
    # SECTION 7: SECURITY & RELIABILITY ENGINEERING
    # ----------------------------------------------------
    pdf.chapter_title("07", "SECURITY, PERFORMANCE & RELIABILITY ENGINEERING")
    
    pdf.section_heading("7.1 Security Architecture & Mitigations")
    pdf.bullet_point("Redis JWT Token Blacklisting", "Unlike standard stateless JWT architectures where tokens remain valid until expiration, Educare Point integrates Redis. When an admin logs out or a token is revoked, the token hash is pushed to a Redis blacklist with a TTL matching token expiry. Every protected route checks Redis prior to execution.")
    pdf.bullet_point("Strict CORS Whitelist", "API access is strictly locked to approved production domains (Vercel production URL, Cloudflare pages fallback, and local development ports 3000/5173). Arbitrary origins are rejected immediately with security warnings logged.")
    pdf.bullet_point("Rate Limiting & Anti-Brute-Force", "All authentication endpoints are shielded by `express-rate-limit`. IP addresses attempting more than 20 failed logins within a 15-minute window are blocked with HTTP 429. General API routes are throttled at 60 requests/min per IP.")
    pdf.bullet_point("Joi Schema Validation & Sanitization", "All inbound payloads are validated against strict Joi schemas before touching database queries, preventing NoSQL injection and malformed parameters.")
    pdf.bullet_point("Cloudinary Memory Streaming", "Customer documents are never written to the local server disk. Multer memoryStorage ingests files into RAM buffers and streams directly to Cloudinary using `streamifier`, eliminating local disk fill attacks and multi-tenant file leaks.")

    pdf.section_heading("7.2 Performance Engineering & High Availability")
    pdf.bullet_point("5-Minute In-Memory Product Cache", "Product listings are read thousands of times more frequently than they are updated. An in-memory cache intercepts `GET /api/products`, serving responses instantly and bypassing MongoDB Atlas query costs. Any product create/update/delete automatically purges the cache.")
    pdf.bullet_point("UptimeRobot Cold-Start Prevention", "Render's free tier spins down idle instances after 15 minutes of inactivity, causing 30-to-50 second cold-start delays. Educare Point resolves this via UptimeRobot, which issues an automated HTTP GET to `/health` every 5 minutes, keeping the backend warm 24/7.")
    pdf.bullet_point("MongoDB Compound ESR Indexing", "Indexes are carefully constructed following the Equality, Sort, Range (ESR) rule, reducing query execution times from linear collection scans (COLLSCAN) to indexed lookups (IXSCAN) under 3 milliseconds.")

    pdf.section_heading("7.3 Production Bug Fixes & Architectural Lessons Learned")
    with pdf.table(col_widths=(45, 55, 80), headings_style=header_style) as table:
        table.row(["Observed Bug / Bottleneck", "Root Cause Analysis", "Engineered Production Fix"])
        table.row(["Cloudinary Stream Crash", "Object export mismatch in config (`const cloudinary` vs `{ cloudinary }`).", "Standardized config export to `{ cloudinary }` and imported with destructuring across all routes."])
        table.row(["Duplicate Order Creation", "Async race condition firing `orderAPI.create()` twice in Services.js.", "Refactored submit handlers into single-flight stateful promises with disabled submit buttons."])
        table.row(["Order ID Undefined Crash", "Frontend attempted `orderId.slice()` before API response populated state.", "Harmonized response structure to `res.data.order._id` and added defensive fallback checks."])
        table.row(["WhatsApp Window Blocked", "Browser popup blocker suppressing `window.open()` inside async callback.", "Replaced automatic window popup with an explicit, high-contrast user action button on the success screen."])
        table.row(["Customer Order Exposure", "Initial endpoint returned all orders to any query.", "Implemented isolated `/api/orders/by-phone/:phone` route with server-side validation and phone projection."])
        table.row(["UI Style Fragmentation", "Cart.js and Services.js used disparate styling and layout systems.", "Unified Cart checkout into identical 4-step wizard using shared CSS classes, reducing code by 600 lines."])

    # ----------------------------------------------------
    # SECTION 8: CURRENT IMPLEMENTATION AUDIT
    # ----------------------------------------------------
    pdf.chapter_title("08", "CURRENT IMPLEMENTATION AUDIT (WHAT IS FULLY DONE)")
    
    pdf.body_p(
        "As of November 2026, the Educare Point platform has completed comprehensive end-to-end development, integration, "
        "and production deployment. The table below provides an exhaustive audit of completed modules:"
    )
    
    with pdf.table(col_widths=(35, 45, 30, 70), headings_style=header_style) as table:
        table.row(["Module / Feature", "Specific Capability Delivered", "Status", "Verification & Location"])
        table.row(["Catalog & Shop", "Product browsing, search, category filter, sorting", "DONE (100%)", "Verified live at / (ProductList.js)"])
        table.row(["Product Details", "Quick-view modal, detail page, WhatsApp order", "DONE (100%)", "Verified live at /product/:id"])
        table.row(["Product Compare", "Side-by-side comparison tray (max 3 items)", "DONE (100%)", "Verified live at /compare"])
        table.row(["Cart System", "Add, remove, quantity update, local persistence", "DONE (100%)", "Verified live at /cart (CartContext.js)"])
        table.row(["Print Services", "Print, Xerox, Scan, Lamination, Binding", "DONE (100%)", "Verified live at /services (Services.js)"])
        table.row(["PDF Engine", "Automatic client-side PDF page count calculation", "DONE (100%)", "FileReader structure parser in Services.js"])
        table.row(["Pricing Engine", "Dynamic multi-parameter service price calculation", "DONE (100%)", "Real-time reactive calculation in Services.js"])
        table.row(["Cloud File Upload", "Streaming PDF, DOC, images to Cloudinary", "DONE (100%)", "Verified via /api/upload endpoint"])
        table.row(["Payment: UPI", "PhonePe QR code display + screenshot upload", "DONE (100%)", "Verified on Cart.js & Services.js"])
        table.row(["Payment: COD", "Cash on Delivery ordering with address capture", "DONE (100%)", "Verified on Cart.js & Services.js"])
        table.row(["Order Tracking", "Customer order lookup by 10-digit mobile", "DONE (100%)", "Verified live at /my-orders (OrderHistory.js)"])
        table.row(["Secret Admin Gateway", "Stealth A->D->M keyboard shortcut access", "DONE (100%)", "App.js keyboard event listener"])
        table.row(["Admin Auth", "Secure JWT authentication with Redis token check", "DONE (100%)", "Verified at /admin-login (AdminLogin.js)"])
        table.row(["Admin Dashboard", "KPI stats (revenue, pending, total orders)", "DONE (100%)", "Verified live at /admin (AdminDashboard.js)"])
        table.row(["Admin Inventory", "Product CRUD with Cloudinary image upload", "DONE (100%)", "Verified in AdminDashboard Products Tab"])
        table.row(["Order Management", "Status transitions (pending to completed)", "DONE (100%)", "Verified in AdminDashboard Orders Tab"])
        table.row(["Payment Verify", "UPI screenshot modal viewer & accept/reject", "DONE (100%)", "Verified in AdminDashboard Orders Tab"])
        table.row(["File Proxy", "Secure proxy to stream customer PDFs to printer", "DONE (100%)", "Verified via /api/download endpoint"])
        table.row(["Customer Auth", "Google OAuth 2.0 + email/password login", "DONE (100%)", "Verified at /login (Login.js)"])
        table.row(["Security Layer", "Redis token blacklist + IP rate limiting + Joi", "DONE (100%)", "Verified in server middleware pipeline"])
        table.row(["PWA Capability", "Installable Progressive Web App on mobile", "DONE (100%)", "Verified via manifest.json & service worker"])

    # ----------------------------------------------------
    # SECTION 9: FUTURE IMPROVEMENTS ROADMAP
    # ----------------------------------------------------
    pdf.chapter_title("09", "FUTURE ROADMAP & PENDING ENHANCEMENTS")
    
    pdf.body_p(
        "While the core operational and e-commerce layers are complete and serving real-world users, a comprehensive engineering "
        "roadmap has been established to evolve Educare Point into a fully autonomous Cyber Cafe ERP ecosystem:"
    )
    
    pdf.section_heading("Phase 1 -- Foundation & Self-Service Hardening (Target: Q1 2027)")
    pdf.bullet_point("SMS-Based OTP Authentication", "Replace email/password friction with instant 4-digit OTP login using Twilio or MSG91 (Fast2SMS for regional India).")
    pdf.bullet_point("Customer Self-Service Dashboard", "Dedicated user profile portal showing lifetime orders, downloadable PDF receipts, and saved addresses.")
    pdf.bullet_point("Automated PDF Invoice Generation", "Integration of client-side PDF generation (`jsPDF` / `react-pdf`) providing GST-compliant digital tax invoices.")
    pdf.bullet_point("Customer Order Cancellation", "Allow customers to cancel orders within a 5-minute grace window prior to merchant print processing.")
    pdf.bullet_point("Automated Low-Stock WhatsApp Alerts", "Trigger automated WhatsApp messages to the merchant when any stationery item falls below `lowStockAlert` threshold.")

    pdf.section_heading("Phase 2 -- Monetization, Automated Gateway & Analytics (Target: Q2 2027)")
    pdf.bullet_point("Razorpay Payment Gateway Integration", "Automate UPI payment capture, Net Banking, and Debit/Credit cards with webhook-driven auto-confirmation, eliminating manual screenshot verification.")
    pdf.bullet_point("Dynamic Geospatial Delivery Pricing", "Google Maps Distance Matrix integration to dynamically calculate home delivery surcharges based on exact customer kilometer distance from the shop.")
    pdf.bullet_point("Automated SMS & Email Notifications", "Automated transactional SMS dispatches informing customers when prints are queued, printed, and out for delivery.")
    pdf.bullet_point("Executive Business Intelligence Dashboard", "Chart.js/Recharts integration inside the admin portal displaying daily/weekly revenue trends, high-margin categories, and peak printing hours.")

    pdf.section_heading("Phase 3 -- AI Integration & Machine Vision (Target: Q3 2027)")
    pdf.bullet_point("Gemini 1.5 Flash Cyber Cafe Assistant", "AI chatbot embedded on the storefront to instantly answer service questions, pricing inquiries, opening hours, and application deadlines. (`REACT_APP_GEMINI_KEY` already provisioned in client environment).")
    pdf.bullet_point("Google Cloud Vision OCR for Application Forms", "Machine learning OCR to automatically read scanned government application forms, auto-detect photo/signature dimensions, and crop them to exact official exam specifications.")
    pdf.bullet_point("Smart AI Product Recommendations", "Association rule mining to suggest related stationery items based on the user's uploaded print document (e.g. suggesting spiral report binding and plastic project files when an uploaded PDF exceeds 30 pages).")

    pdf.section_heading("Phase 4 -- Mobile Native & Offline Synchronization (Target: Q4 2027)")
    pdf.bullet_point("Capacitor Native Android Packaging", "Wrap the existing React PWA into a native Android APK deployable to the Google Play Store.")
    pdf.bullet_point("Firebase Cloud Messaging (FCM) Push Alerts", "Push notifications alerting mobile users of order status updates even when the browser is closed.")
    pdf.bullet_point("Offline-First Catalog Caching", "Enhanced service worker caching storing the stationery catalog locally in IndexedDB for instantaneous loading in low-connectivity mobile networks.")

    pdf.section_heading("Phase 5 -- Enterprise Resource Planning (ERP) & POS (Target: 2028)")
    pdf.bullet_point("Multi-Role Staff Access", "Role-Based Access Control (RBAC) supporting separate credentials for counter operators, printing technicians, and delivery personnel.")
    pdf.bullet_point("Counter Point-of-Sale (POS) & Barcode Scanner", "USB barcode scanner integration allowing counter staff to scan stationery items directly into the system for instant billing.")
    pdf.bullet_point("Daily Expense & Utility Tracking", "Accounting ledger tracking paper ream purchases, toner cartridge replacements, electricity expenses, and net profit margins.")

    # ----------------------------------------------------
    # SECTION 10: PRE-LAUNCH CHECKLIST & DEPLOYMENT GUIDE
    # ----------------------------------------------------
    pdf.chapter_title("10", "PRE-LAUNCH CHECKLIST & DEPLOYMENT GUIDE")
    
    pdf.section_heading("10.1 Pre-Launch Verification Checklist")
    pdf.bullet_point("Database Sanitation", "Purge all development test orders and fake customer records from MongoDB Atlas production cluster.")
    pdf.bullet_point("Cloudinary Storage Audit", "Clear orphaned test PDFs and obsolete mock payment screenshots from Cloudinary root folder.")
    pdf.bullet_point("Merchant Operational Training", "Walk through admin dashboard workflows on owner's smartphone: order state transitions, UPI screenshot validation, file downloading, and WhatsApp customer pinging.")
    pdf.bullet_point("Custom Domain Cutover", "Register `educarepoint.in` domain and route through Cloudflare CDN for edge caching, SSL, and DDoS mitigation.")
    pdf.bullet_point("Physical QR Collateral", "Print and laminate high-visibility table tents and counter posters featuring QR codes linking directly to the web application.")

    pdf.section_heading("10.2 Continuous Deployment & Git Workflow")
    git_workflow = (
        "# 1. Deploying Backend API Changes:\n"
        "cd server\n"
        "git add .\n"
        "git commit -m \"feat(api): description of updates\"\n"
        "git push origin main\n"
        "# Render automatically detects main branch commit and executes build pipeline\n\n"
        "# 2. Deploying Frontend Client Changes:\n"
        "cd client\n"
        "git add .\n"
        "git commit -m \"feat(ui): description of updates\"\n"
        "git push origin main\n"
        "# Vercel CI/CD automatically compiles React production bundle and deploys to Edge CDN"
    )
    pdf.code_snippet(git_workflow)
    
    pdf.ln(4)
    pdf.callout_box(
        "Academic & Professional Certification",
        "This project documentation serves as an exhaustive reference of the Educare Point Cyber Cafe system architecture, "
        "validating the complete engineering lifecycle from problem discovery through implementation, security hardening, "
        "and production operations. Authored by Raunak Kumar (MCKV Institute of Engineering).",
        "info"
    )

    output_path = r"c:\MyBTechProject\EducarePoint\EducarePoint_Complete_System_Design_and_Documentation.pdf"
    total_pages = pdf.page_no()
    pdf.output(output_path)
    print(f"SUCCESS: PDF generated successfully at: {output_path} (Total Pages: {total_pages})")

if __name__ == "__main__":
    build_pdf()

import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.products.models import Category, Product, Brand

SEED_CATEGORIES = [
    {"name": "Paper Products", "icon": "file-text"},
    {"name": "Writing & Markers", "icon": "pen"},
    {"name": "Office Electronics", "icon": "printer"},
    {"name": "Staplers & Organization", "icon": "box"},
    {"name": "Filing & Storage", "icon": "folder"},
    {"name": "Desk Accessories", "icon": "briefcase"},
    {"name": "Packaging & Shipping", "icon": "package"},
    {"name": "Ink & Toner", "icon": "droplet"},
    {"name": "Cleaning & Janitorial", "icon": "spray-can"},
    {"name": "Breakroom & Pantry", "icon": "coffee"},
]

PRODUCTS_DATA = [
    # ── Paper Products ──────────────────────────────────────────────
    {
        "category": "Paper Products",
        "name": "Copy & Printing Paper A4 (80 GSM)",
        "sku": "PAP-A4-80GSM",
        "unit": "ream",
        "description": "High white multi-purpose copy paper 500 sheets per ream suitable for laser, inkjet, and copy machines.",
        "brands": [
            {"name": "Double A", "regular": 850, "merkato": 780, "direct": 720, "stock": 500},
            {"name": "Chamex", "regular": 820, "merkato": 750, "direct": 690, "stock": 350},
            {"name": "Paper One", "regular": 840, "merkato": 770, "direct": 710, "stock": 420},
            {"name": "IK Plus", "regular": 800, "merkato": 730, "direct": 670, "stock": 250},
        ],
    },
    {
        "category": "Paper Products",
        "name": "Copy Paper A3 (80 GSM)",
        "sku": "PAP-A3-80GSM",
        "unit": "ream",
        "description": "Premium A3 size copy paper for architectural drawings, posters, and wide-format printing.",
        "brands": [
            {"name": "Double A", "regular": 1700, "merkato": 1580, "direct": 1450, "stock": 180},
            {"name": "Paper One", "regular": 1650, "merkato": 1520, "direct": 1400, "stock": 140},
        ],
    },
    {
        "category": "Paper Products",
        "name": "Thermal Receipt Roll 80mm x 80mm",
        "sku": "PAP-THM-8080",
        "unit": "carton",
        "description": "BPA-free thermal paper rolls for POS printers, cash registers, and ticketing systems (50 rolls per carton).",
        "brands": [
            {"name": "Babi Thermal", "regular": 2400, "merkato": 2150, "direct": 1980, "stock": 90},
            {"name": "Hansol", "regular": 2600, "merkato": 2300, "direct": 2100, "stock": 110},
        ],
    },
    {
        "category": "Paper Products",
        "name": "Sticky Notes 3x3 Yellow",
        "sku": "PAP-STK-3X3",
        "unit": "pack",
        "description": "Self-adhesive repositionable note pads, 100 sheets per pad, 12 pads per pack.",
        "brands": [
            {"name": "Post-it", "regular": 450, "merkato": 400, "direct": 360, "stock": 300},
            {"name": "Deli Sticky", "regular": 320, "merkato": 280, "direct": 250, "stock": 450},
        ],
    },
    {
        "category": "Paper Products",
        "name": "Legal Pad Yellow Ruled A4",
        "sku": "PAP-LGL-A4YW",
        "unit": "pack",
        "description": "Yellow legal notepad, 50 sheets wide-ruled, pack of 6 pads.",
        "brands": [
            {"name": "TOPS", "regular": 380, "merkato": 330, "direct": 290, "stock": 200},
            {"name": "Deli Legal", "regular": 280, "merkato": 240, "direct": 210, "stock": 320},
        ],
    },
    {
        "category": "Paper Products",
        "name": "Carbon Copy Paper A4 Blue",
        "sku": "PAP-CRB-A4BL",
        "unit": "pack",
        "description": "Blue carbon copy paper for handwritten duplicates, 100 sheets per pack.",
        "brands": [
            {"name": "Kores", "regular": 320, "merkato": 270, "direct": 240, "stock": 180},
        ],
    },
    {
        "category": "Paper Products",
        "name": "Tracing Paper A4 (90 GSM)",
        "sku": "PAP-TRC-A490",
        "unit": "pack",
        "description": "Transparent tracing paper for technical drawing, 50 sheets per pack.",
        "brands": [
            {"name": "Canson", "regular": 550, "merkato": 480, "direct": 420, "stock": 120},
            {"name": "Goldline", "regular": 480, "merkato": 410, "direct": 370, "stock": 90},
        ],
    },

    # ── Writing & Markers ──────────────────────────────────────────
    {
        "category": "Writing & Markers",
        "name": "Ballpoint Pen 0.7mm Blue",
        "sku": "WRI-PEN-07BLU",
        "unit": "box",
        "description": "Smooth writing ballpoint pens with rubber grip, box of 50 pieces.",
        "brands": [
            {"name": "Bic Cristal", "regular": 650, "merkato": 580, "direct": 520, "stock": 600},
            {"name": "Deli Arrow", "regular": 480, "merkato": 420, "direct": 380, "stock": 800},
            {"name": "Schneider", "regular": 800, "merkato": 720, "direct": 650, "stock": 220},
        ],
    },
    {
        "category": "Writing & Markers",
        "name": "Dry Erase Whiteboard Marker Set",
        "sku": "WRI-MRK-WB4",
        "unit": "pack",
        "description": "Low odor non-toxic whiteboard markers in black, blue, red, and green (4 colors pack).",
        "brands": [
            {"name": "Expo", "regular": 550, "merkato": 490, "direct": 440, "stock": 180},
            {"name": "Deli E2811", "regular": 380, "merkato": 330, "direct": 290, "stock": 310},
            {"name": "Faber-Castell", "regular": 620, "merkato": 550, "direct": 490, "stock": 150},
        ],
    },
    {
        "category": "Writing & Markers",
        "name": "Permanent Marker Chisel Tip Black",
        "sku": "WRI-MRK-PRM",
        "unit": "box",
        "description": "Waterproof quick-drying permanent marker for cardboard, metal, and plastic. Box of 12.",
        "brands": [
            {"name": "Sharpie", "regular": 950, "merkato": 850, "direct": 780, "stock": 140},
            {"name": "Deli Permanent", "regular": 520, "merkato": 460, "direct": 410, "stock": 280},
        ],
    },
    {
        "category": "Writing & Markers",
        "name": "Text Highlighter Assorted Colors",
        "sku": "WRI-HLT-AST4",
        "unit": "pack",
        "description": "Fluorescent chisel tip text highlighters 4-pack (yellow, green, pink, orange).",
        "brands": [
            {"name": "Stabilo Boss", "regular": 780, "merkato": 700, "direct": 630, "stock": 160},
            {"name": "Deli Macaron", "regular": 420, "merkato": 370, "direct": 320, "stock": 390},
        ],
    },
    {
        "category": "Writing & Markers",
        "name": "Gel Pen 0.5mm Black",
        "sku": "WRI-GEL-05BK",
        "unit": "box",
        "description": "Fine tip gel ink pen for precision writing, box of 12.",
        "brands": [
            {"name": "Pilot G-2", "regular": 780, "merkato": 690, "direct": 620, "stock": 300},
            {"name": "Uni-ball Signo", "regular": 850, "merkato": 760, "direct": 680, "stock": 200},
            {"name": "Deli Q33", "regular": 380, "merkato": 330, "direct": 290, "stock": 500},
        ],
    },
    {
        "category": "Writing & Markers",
        "name": "Mechanical Pencil 0.5mm",
        "sku": "WRI-MPC-05",
        "unit": "box",
        "description": "Retractable tip mechanical pencil with eraser cap, box of 12.",
        "brands": [
            {"name": "Pentel P205", "regular": 650, "merkato": 570, "direct": 510, "stock": 180},
            {"name": "Deli 6492", "regular": 320, "merkato": 270, "direct": 240, "stock": 400},
        ],
    },
    {
        "category": "Writing & Markers",
        "name": "Correction Fluid 20ml",
        "sku": "WRI-COR-20ML",
        "unit": "piece",
        "description": "Quick-drying white correction fluid with brush applicator.",
        "brands": [
            {"name": "Tipp-Ex", "regular": 180, "merkato": 150, "direct": 130, "stock": 350},
            {"name": "Deli 7899", "regular": 120, "merkato": 100, "direct": 85, "stock": 600},
        ],
    },

    # ── Office Electronics ─────────────────────────────────────────
    {
        "category": "Office Electronics",
        "name": "LaserJet Toner Cartridge 85A (CE285A)",
        "sku": "ELC-TNR-85A",
        "unit": "piece",
        "description": "High yield black laser toner cartridge compatible with HP LaserJet P1102 / M1212 / M1132.",
        "brands": [
            {"name": "HP Original", "regular": 4500, "merkato": 4100, "direct": 3800, "stock": 45},
            {"name": "ProPrint Compatible", "regular": 1800, "merkato": 1550, "direct": 1400, "stock": 120},
        ],
    },
    {
        "category": "Office Electronics",
        "name": "Scientific Calculator 240 Functions",
        "sku": "ELC-CAL-240F",
        "unit": "piece",
        "description": "2-line display scientific calculator with 240 built-in math and statistical functions.",
        "brands": [
            {"name": "Casio fx-82MS", "regular": 1200, "merkato": 1050, "direct": 950, "stock": 85},
            {"name": "Deli Desk", "regular": 750, "merkato": 650, "direct": 580, "stock": 160},
        ],
    },
    {
        "category": "Office Electronics",
        "name": "Heavy Duty Extension Power Strip 5-Socket",
        "sku": "ELC-PWR-5SKT",
        "unit": "piece",
        "description": "Surge protected 5-outlet extension socket with 3-meter copper cable and master switch.",
        "brands": [
            {"name": "Huntkey", "regular": 1850, "merkato": 1650, "direct": 1480, "stock": 65},
            {"name": "BULL", "regular": 2100, "merkato": 1900, "direct": 1720, "stock": 50},
        ],
    },
    {
        "category": "Office Electronics",
        "name": "Desktop Laminator A4",
        "sku": "ELC-LAM-A4",
        "unit": "piece",
        "description": "Compact A4 laminating machine with fast warm-up, supports 80-125 micron pouches.",
        "brands": [
            {"name": "Fellowes Saturn", "regular": 5800, "merkato": 5200, "direct": 4700, "stock": 25},
            {"name": "GBC Inspire+", "regular": 4500, "merkato": 4000, "direct": 3600, "stock": 30},
        ],
    },
    {
        "category": "Office Electronics",
        "name": "USB Flash Drive 64GB",
        "sku": "ELC-USB-64GB",
        "unit": "piece",
        "description": "USB 3.0 high-speed flash drive 64GB with cap and keyring loop.",
        "brands": [
            {"name": "SanDisk Ultra", "regular": 650, "merkato": 570, "direct": 500, "stock": 200},
            {"name": "HP v250w", "regular": 550, "merkato": 480, "direct": 420, "stock": 180},
            {"name": "Kingston DT50", "regular": 600, "merkato": 520, "direct": 460, "stock": 150},
        ],
    },
    {
        "category": "Office Electronics",
        "name": "Desktop Paper Shredder (10 Sheet)",
        "sku": "ELC-SHR-10S",
        "unit": "piece",
        "description": "Cross-cut paper shredder, 10-sheet capacity, 12-liter bin.",
        "brands": [
            {"name": "Fellowes 8C", "regular": 8500, "merkato": 7600, "direct": 6900, "stock": 15},
            {"name": "Deli 9935", "regular": 4200, "merkato": 3700, "direct": 3300, "stock": 25},
        ],
    },

    # ── Staplers & Organization ────────────────────────────────────
    {
        "category": "Staplers & Organization",
        "name": "Heavy Duty Desktop Stapler 24/6",
        "sku": "ORG-STP-246",
        "unit": "piece",
        "description": "Full-strip metal desktop stapler, 25-sheet capacity with integrated staple remover.",
        "brands": [
            {"name": "Deli E0305", "regular": 850, "merkato": 750, "direct": 680, "stock": 120},
            {"name": "Kangaro 24/6", "regular": 1100, "merkato": 980, "direct": 890, "stock": 95},
        ],
    },
    {
        "category": "Staplers & Organization",
        "name": "Staple Pins 24/6 (Box of 1000)",
        "sku": "ORG-PIN-246",
        "unit": "box",
        "description": "Chisel point standard metal staple pins 24/6 for desktop staplers, 1000 pins per box.",
        "brands": [
            {"name": "Kangaro", "regular": 150, "merkato": 120, "direct": 95, "stock": 800},
            {"name": "Deli", "regular": 120, "merkato": 95, "direct": 75, "stock": 1200},
        ],
    },
    {
        "category": "Staplers & Organization",
        "name": "Adjustable 2-Hole Paper Punch 30-Sheet",
        "sku": "ORG-PNC-2H30",
        "unit": "piece",
        "description": "Metal construction paper hole puncher with centering guide and removable waste tray.",
        "brands": [
            {"name": "Deli E0102", "regular": 1400, "merkato": 1250, "direct": 1120, "stock": 70},
            {"name": "Kangaro DP-600", "regular": 1750, "merkato": 1550, "direct": 1390, "stock": 55},
        ],
    },
    {
        "category": "Staplers & Organization",
        "name": "Binder Clips 32mm (Box of 12)",
        "sku": "ORG-BND-32MM",
        "unit": "box",
        "description": "Heavy-duty metal binder clips, 32mm width, box of 12.",
        "brands": [
            {"name": "Deli 9545", "regular": 120, "merkato": 95, "direct": 80, "stock": 500},
            {"name": "Eagle", "regular": 150, "merkato": 120, "direct": 100, "stock": 350},
        ],
    },
    {
        "category": "Staplers & Organization",
        "name": "Paper Clips 33mm Silver (Box of 100)",
        "sku": "ORG-PPC-33MM",
        "unit": "box",
        "description": "Standard silver wire paper clips, 33mm, box of 100.",
        "brands": [
            {"name": "Deli 0024", "regular": 60, "merkato": 45, "direct": 35, "stock": 800},
            {"name": "Kangaro", "regular": 80, "merkato": 60, "direct": 50, "stock": 600},
        ],
    },
    {
        "category": "Staplers & Organization",
        "name": "Scissors 210mm Stainless Steel",
        "sku": "ORG-SCS-210",
        "unit": "piece",
        "description": "Ergonomic handle stainless steel scissors, 210mm blade length.",
        "brands": [
            {"name": "Deli 6009", "regular": 220, "merkato": 180, "direct": 150, "stock": 250},
            {"name": "Maped Expert", "regular": 380, "merkato": 330, "direct": 290, "stock": 120},
        ],
    },

    # ── Filing & Storage ───────────────────────────────────────────
    {
        "category": "Filing & Storage",
        "name": "Lever Arch File Folder A4 75mm",
        "sku": "FLG-LAF-A475",
        "unit": "piece",
        "description": "Durable polypropylene covered lever arch binder folder with spine label pocket.",
        "brands": [
            {"name": "Bantex", "regular": 450, "merkato": 390, "direct": 340, "stock": 350},
            {"name": "Deli E5302", "regular": 350, "merkato": 300, "direct": 260, "stock": 500},
        ],
    },
    {
        "category": "Filing & Storage",
        "name": "Clear Document Sheet Protector A4",
        "sku": "FLG-CLR-A4100",
        "unit": "pack",
        "description": "Transparent plastic sheet protector sleeves 11-hole punched, pack of 100 sheets.",
        "brands": [
            {"name": "Deli E5501", "regular": 480, "merkato": 410, "direct": 360, "stock": 280},
            {"name": "Eagle", "regular": 520, "merkato": 450, "direct": 390, "stock": 210},
        ],
    },
    {
        "category": "Filing & Storage",
        "name": "Expanding Wallet File Folder 13-Pockets",
        "sku": "FLG-EXP-13PKT",
        "unit": "piece",
        "description": "Accordion style expanding file folder with colored tab indexes and buckle closure.",
        "brands": [
            {"name": "Deli E5556", "regular": 650, "merkato": 570, "direct": 500, "stock": 140},
            {"name": "Eagle Accordion", "regular": 720, "merkato": 630, "direct": 550, "stock": 110},
        ],
    },
    {
        "category": "Filing & Storage",
        "name": "Manila Envelope A4 Brown (Pack of 50)",
        "sku": "FLG-ENV-A4BR",
        "unit": "pack",
        "description": "Gummed flap manila brown envelopes, A4 size, 50 per pack.",
        "brands": [
            {"name": "Local Standard", "regular": 280, "merkato": 240, "direct": 200, "stock": 400},
            {"name": "Deli Kraft", "regular": 320, "merkato": 270, "direct": 230, "stock": 300},
        ],
    },
    {
        "category": "Filing & Storage",
        "name": "Document Box File A4",
        "sku": "FLG-BOX-A4",
        "unit": "piece",
        "description": "Collapsible cardboard box file for A4 documents with spring clip.",
        "brands": [
            {"name": "Bantex Box", "regular": 350, "merkato": 300, "direct": 260, "stock": 180},
            {"name": "Deli 5603", "regular": 280, "merkato": 240, "direct": 210, "stock": 250},
        ],
    },

    # ── Desk Accessories ───────────────────────────────────────────
    {
        "category": "Desk Accessories",
        "name": "Desk Organizer Metal Mesh 5-Compartment",
        "sku": "DSK-ORG-5CMP",
        "unit": "piece",
        "description": "Black metal mesh desktop organizer with 5 compartments for pens, cards, and accessories.",
        "brands": [
            {"name": "Deli 9175", "regular": 650, "merkato": 570, "direct": 500, "stock": 80},
            {"name": "ErichKrause", "regular": 780, "merkato": 680, "direct": 610, "stock": 60},
        ],
    },
    {
        "category": "Desk Accessories",
        "name": "Desktop Tape Dispenser (Heavy)",
        "sku": "DSK-TPD-HVY",
        "unit": "piece",
        "description": "Weighted non-slip desktop tape dispenser for standard 19mm tape rolls.",
        "brands": [
            {"name": "3M Scotch C38", "regular": 550, "merkato": 480, "direct": 420, "stock": 90},
            {"name": "Deli 810", "regular": 280, "merkato": 240, "direct": 200, "stock": 150},
        ],
    },
    {
        "category": "Desk Accessories",
        "name": "Clear Adhesive Tape 18mm x 33m",
        "sku": "DSK-TPR-18X33",
        "unit": "pack",
        "description": "Transparent office tape, 18mm wide, 33m roll, 8 rolls per pack.",
        "brands": [
            {"name": "3M Scotch", "regular": 420, "merkato": 360, "direct": 310, "stock": 300},
            {"name": "Deli 30200", "regular": 250, "merkato": 210, "direct": 180, "stock": 500},
        ],
    },
    {
        "category": "Desk Accessories",
        "name": "Desk Calendar Stand 2026",
        "sku": "DSK-CAL-2026",
        "unit": "piece",
        "description": "Flip-style desk calendar with Ethiopian and Gregorian dates, spiral bound.",
        "brands": [
            {"name": "Babi Calendar", "regular": 350, "merkato": 300, "direct": 260, "stock": 200},
            {"name": "Local Print", "regular": 220, "merkato": 180, "direct": 150, "stock": 400},
        ],
    },
    {
        "category": "Desk Accessories",
        "name": "Rubber Stamp Pad Blue",
        "sku": "DSK-STP-BLU",
        "unit": "piece",
        "description": "Felt ink pad for rubber stamps, blue ink, standard size.",
        "brands": [
            {"name": "Trodat", "regular": 180, "merkato": 150, "direct": 120, "stock": 300},
            {"name": "Deli 9864", "regular": 120, "merkato": 95, "direct": 80, "stock": 500},
        ],
    },
    {
        "category": "Desk Accessories",
        "name": "Glue Stick 21g (Pack of 12)",
        "sku": "DSK-GLU-21G",
        "unit": "pack",
        "description": "Non-toxic washable glue sticks, 21g each, pack of 12.",
        "brands": [
            {"name": "Pritt", "regular": 480, "merkato": 420, "direct": 370, "stock": 220},
            {"name": "Deli 7101", "regular": 280, "merkato": 240, "direct": 200, "stock": 380},
        ],
    },

    # ── Packaging & Shipping ───────────────────────────────────────
    {
        "category": "Packaging & Shipping",
        "name": "Packing Tape Brown 48mm x 100m",
        "sku": "PKG-TPE-48BRN",
        "unit": "roll",
        "description": "Heavy-duty brown BOPP packing tape, 48mm width, 100m length.",
        "brands": [
            {"name": "3M Scotch", "regular": 180, "merkato": 150, "direct": 120, "stock": 500},
            {"name": "Local Heavy", "regular": 120, "merkato": 95, "direct": 75, "stock": 800},
        ],
    },
    {
        "category": "Packaging & Shipping",
        "name": "Bubble Wrap Roll 50cm x 50m",
        "sku": "PKG-BWR-5050",
        "unit": "roll",
        "description": "Standard 10mm bubble cushioning wrap for fragile item protection.",
        "brands": [
            {"name": "PackRight", "regular": 650, "merkato": 570, "direct": 500, "stock": 100},
            {"name": "SafeShip", "regular": 580, "merkato": 500, "direct": 440, "stock": 120},
        ],
    },
    {
        "category": "Packaging & Shipping",
        "name": "Stretch Wrap Film 50cm x 300m",
        "sku": "PKG-STR-50300",
        "unit": "roll",
        "description": "Clear stretch wrap for pallet wrapping and securing shipments.",
        "brands": [
            {"name": "PackWrap", "regular": 420, "merkato": 360, "direct": 310, "stock": 200},
        ],
    },
    {
        "category": "Packaging & Shipping",
        "name": "Corrugated Shipping Box (Small)",
        "sku": "PKG-BOX-SM",
        "unit": "bundle",
        "description": "Single-wall corrugated cardboard box 25x20x15cm, bundle of 25.",
        "brands": [
            {"name": "BoxCraft", "regular": 350, "merkato": 300, "direct": 260, "stock": 150},
            {"name": "Local Carton", "regular": 280, "merkato": 240, "direct": 200, "stock": 250},
        ],
    },

    # ── Ink & Toner ────────────────────────────────────────────────
    {
        "category": "Ink & Toner",
        "name": "Inkjet Refill Ink Black 100ml",
        "sku": "INK-REF-BK100",
        "unit": "bottle",
        "description": "Universal black dye ink for inkjet printer CISS refill, 100ml bottle.",
        "brands": [
            {"name": "InkTec", "regular": 350, "merkato": 300, "direct": 260, "stock": 300},
            {"name": "PrintRite", "regular": 280, "merkato": 240, "direct": 200, "stock": 400},
        ],
    },
    {
        "category": "Ink & Toner",
        "name": "Inkjet Refill Ink Color Set (C/M/Y)",
        "sku": "INK-REF-CMY",
        "unit": "set",
        "description": "Cyan, Magenta, Yellow dye ink set for inkjet printer refill, 100ml each.",
        "brands": [
            {"name": "InkTec Color", "regular": 950, "merkato": 840, "direct": 750, "stock": 150},
            {"name": "PrintRite Color", "regular": 780, "merkato": 680, "direct": 600, "stock": 200},
        ],
    },
    {
        "category": "Ink & Toner",
        "name": "Toner Cartridge 12A (Q2612A)",
        "sku": "INK-TNR-12A",
        "unit": "piece",
        "description": "Compatible toner cartridge for HP LaserJet 1010/1018/1020/3015.",
        "brands": [
            {"name": "HP Original 12A", "regular": 3800, "merkato": 3400, "direct": 3100, "stock": 40},
            {"name": "ProPrint 12A", "regular": 1400, "merkato": 1200, "direct": 1050, "stock": 100},
        ],
    },
    {
        "category": "Ink & Toner",
        "name": "Toner Cartridge 83A (CF283A)",
        "sku": "INK-TNR-83A",
        "unit": "piece",
        "description": "Compatible toner for HP LaserJet Pro M125/M127/M201/M225.",
        "brands": [
            {"name": "HP Original 83A", "regular": 4200, "merkato": 3800, "direct": 3500, "stock": 35},
            {"name": "ProPrint 83A", "regular": 1600, "merkato": 1400, "direct": 1250, "stock": 90},
        ],
    },
    {
        "category": "Ink & Toner",
        "name": "Epson EcoTank Ink Bottle T664 Black",
        "sku": "INK-EPS-T664B",
        "unit": "bottle",
        "description": "Original Epson T664 black pigment ink bottle for EcoTank printers, 70ml.",
        "brands": [
            {"name": "Epson Original", "regular": 750, "merkato": 660, "direct": 590, "stock": 80},
            {"name": "Compatible T664", "regular": 280, "merkato": 240, "direct": 200, "stock": 250},
        ],
    },

    # ── Cleaning & Janitorial ──────────────────────────────────────
    {
        "category": "Cleaning & Janitorial",
        "name": "Hand Sanitizer 500ml Pump",
        "sku": "CLN-HND-500P",
        "unit": "bottle",
        "description": "70% alcohol-based hand sanitizer with pump dispenser, 500ml.",
        "brands": [
            {"name": "LifeBuoy", "regular": 280, "merkato": 240, "direct": 200, "stock": 300},
            {"name": "Babi Clean", "regular": 220, "merkato": 180, "direct": 150, "stock": 500},
        ],
    },
    {
        "category": "Cleaning & Janitorial",
        "name": "Tissue Paper Box (150 Sheets)",
        "sku": "CLN-TSS-150",
        "unit": "box",
        "description": "2-ply facial tissue, 150 sheets per box.",
        "brands": [
            {"name": "Fine", "regular": 120, "merkato": 95, "direct": 80, "stock": 600},
            {"name": "SoftPack", "regular": 100, "merkato": 80, "direct": 65, "stock": 800},
        ],
    },
    {
        "category": "Cleaning & Janitorial",
        "name": "Trash Bags Heavy Duty 80L (Roll of 20)",
        "sku": "CLN-TRB-80L",
        "unit": "roll",
        "description": "Extra-strong black garbage bags, 80 liters, 20 bags per roll.",
        "brands": [
            {"name": "Glad", "regular": 250, "merkato": 210, "direct": 180, "stock": 350},
            {"name": "Local Heavy Duty", "regular": 150, "merkato": 120, "direct": 95, "stock": 600},
        ],
    },
    {
        "category": "Cleaning & Janitorial",
        "name": "Multi-Surface Disinfectant Spray 750ml",
        "sku": "CLN-DSF-750",
        "unit": "bottle",
        "description": "Antibacterial multi-surface cleaner and disinfectant spray.",
        "brands": [
            {"name": "Dettol", "regular": 380, "merkato": 330, "direct": 290, "stock": 200},
            {"name": "Babi Fresh", "regular": 250, "merkato": 210, "direct": 180, "stock": 350},
        ],
    },

    # ── Breakroom & Pantry ─────────────────────────────────────────
    {
        "category": "Breakroom & Pantry",
        "name": "Disposable Paper Cups 200ml (Pack of 50)",
        "sku": "BRK-CUP-200",
        "unit": "pack",
        "description": "Single-use paper drinking cups, 200ml capacity, 50 per pack.",
        "brands": [
            {"name": "Solo", "regular": 180, "merkato": 150, "direct": 120, "stock": 400},
            {"name": "Local Cups", "regular": 120, "merkato": 95, "direct": 75, "stock": 700},
        ],
    },
    {
        "category": "Breakroom & Pantry",
        "name": "Instant Coffee Sachet 2g (Box of 100)",
        "sku": "BRK-CFE-2G100",
        "unit": "box",
        "description": "Individual 2g instant coffee sachets, box of 100.",
        "brands": [
            {"name": "Nescafe", "regular": 850, "merkato": 750, "direct": 680, "stock": 120},
            {"name": "Tomoca", "regular": 650, "merkato": 570, "direct": 500, "stock": 200},
        ],
    },
    {
        "category": "Breakroom & Pantry",
        "name": "Sugar Sachet 5g (Box of 200)",
        "sku": "BRK-SGR-5G200",
        "unit": "box",
        "description": "Pre-portioned 5g sugar sachets for tea and coffee service, 200 per box.",
        "brands": [
            {"name": "Wonji Sugar", "regular": 380, "merkato": 330, "direct": 290, "stock": 250},
            {"name": "Metehara Sugar", "regular": 350, "merkato": 300, "direct": 260, "stock": 300},
        ],
    },
    {
        "category": "Breakroom & Pantry",
        "name": "Bottled Drinking Water 500ml (Pack of 24)",
        "sku": "BRK-WTR-500PK",
        "unit": "pack",
        "description": "Natural spring water 500ml bottles, shrink-wrapped pack of 24.",
        "brands": [
            {"name": "Aquaddis", "regular": 280, "merkato": 240, "direct": 200, "stock": 350},
            {"name": "Highland", "regular": 300, "merkato": 260, "direct": 220, "stock": 280},
            {"name": "Abyssinia Spring", "regular": 260, "merkato": 220, "direct": 190, "stock": 400},
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the database with 50+ products and 100+ brands for pagination & search testing."

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear', action='store_true',
            help='Delete ALL existing products and brands before seeding.',
        )

    def handle(self, *args, **options):
        if options['clear']:
            deleted_brands = Brand.objects.all().delete()[0]
            deleted_products = Product.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(
                f"Cleared {deleted_products} products and {deleted_brands} brands."
            ))

        self.stdout.write("Starting database seeding for Products & Brands...")

        cat_map = {}
        for cdata in SEED_CATEGORIES:
            cat, _ = Category.objects.get_or_create(
                name=cdata["name"],
                defaults={
                    "slug": slugify(cdata["name"]),
                    "icon": cdata["icon"],
                    "is_active": True,
                },
            )
            cat_map[cdata["name"]] = cat

        p_created = 0
        b_created = 0

        for pdata in PRODUCTS_DATA:
            category = cat_map[pdata["category"]]
            product, created = Product.objects.get_or_create(
                sku=pdata["sku"],
                defaults={
                    "name": pdata["name"],
                    "slug": slugify(pdata["name"]),
                    "description": pdata["description"],
                    "category": category,
                    "unit_of_measure": pdata["unit"],
                    "is_available": True,
                },
            )
            if created:
                p_created += 1

            for bdata in pdata["brands"]:
                brand, b_created_flag = Brand.objects.get_or_create(
                    product=product,
                    name=bdata["name"],
                    defaults={
                        "regular_market_price": Decimal(str(bdata["regular"])),
                        "merkato_retailer_price": Decimal(str(bdata["merkato"])),
                        "direct_purchase_price": Decimal(str(bdata["direct"])),
                        "stock_quantity": bdata["stock"],
                        "is_in_stock": True,
                        "is_active": True,
                    },
                )
                if b_created_flag:
                    b_created += 1

        total_products = Product.objects.count()
        total_brands = Brand.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"Done! Added {p_created} new products and {b_created} new brands.\n"
                f"  Total in database: {total_products} products, {total_brands} brands.\n"
                f"  Categories: {', '.join(cat_map.keys())}"
            )
        )

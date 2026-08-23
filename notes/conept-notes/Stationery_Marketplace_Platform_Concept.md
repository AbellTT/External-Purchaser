# **Stationery Supply Marketplace Platform**
## **Concept Document & Requirements Clarification**

**Document Purpose:** This document outlines the proposed stationery procurement platform, defines the Minimum Viable Product (MVP), identifies areas requiring clarification, and highlights potential challenges that need to be addressed before development begins.

---

## **1. Platform Overview**

### **What Problem Are We Solving?**

Currently, organizations such as schools, universities, banks, and government institutions face several challenges when procuring stationery supplies in bulk:

- **Limited supplier access** - Organizations typically know only a few brokers or suppliers
- **Lack of price transparency** - Buyers don't know if they're getting fair market prices
- **Time-consuming process** - Finding suppliers, requesting quotes, and comparing offers happens manually
- **No market intelligence** - Buyers have no visibility into price trends or optimal purchasing timing
- **Unpredictable quality** - No systematic way to verify supplier reliability

Suppliers face complementary problems:
- **Limited customer reach** - Difficult to access institutional buyers
- **High customer acquisition costs** - Significant effort needed to build trust with organizations
- **Inconsistent business** - No reliable pipeline of bulk orders

### **What Is the Platform?**

The platform is a **B2B stationery procurement marketplace** that connects:

- **Customers** (schools, universities, banks, offices, NGOs) who need stationery products in bulk
- **Suppliers** (Merkato suppliers, wholesalers, manufacturers, distributors) who can fulfill these needs
- **Brokers/Platform Operators** (marketplace owners) who facilitate connections and provide market intelligence

### **How Does It Work?**

**📌 CLARIFICATION NEEDED:** The exact request flow is not yet finalized. Below are two possible models:

#### **Model A: Open Marketplace (Reverse Auction)**

1. Customer creates a purchase request listing needed products
2. All registered suppliers can view the request
3. Multiple suppliers submit competing offers
4. Customer compares offers and selects preferred supplier
5. Platform facilitates the connection

#### **Model B: Broker-Mediated Model**

1. Customer submits request to the broker/platform
2. Broker reviews request and selects suitable suppliers from their network
3. Broker requests quotes from chosen suppliers
4. Broker presents curated options to customer with recommendations
5. Customer makes final selection with broker guidance

**❓ QUESTION FOR CLIENT:** Which model aligns better with your vision? Or is it a hybrid approach where customers can choose between open marketplace or broker-assisted procurement?

---

## **2. Core Users & Their Capabilities**

### **Customers (Buyers)**

**Who they are:** Schools, universities, banks, companies, NGOs, government institutions

**What they can do:**
- Register and create an organization profile
- Submit purchase requests specifying:
  - Product names and descriptions
  - Required quantities
  - Quality/specification requirements
  - Delivery deadline
- View and compare supplier offers
- Select preferred supplier
- **[Future]** Rate suppliers after transaction completion

**Example Request:**
> "Need 10,000 A4 paper reams, 5,000 blue ballpoint pens, and 2,000 notebooks. Required delivery by August 15, 2024."

### **Suppliers**

**Who they are:** Merkato suppliers, wholesalers, manufacturers, stationery shops

**What they can do:**
- Register with company information
- **[Assumption: Requires broker approval before active]**
- View customer purchase requests
- Submit offers including:
  - Unit prices
  - Total price
  - Available quantity
  - Product brand/quality details
  - Delivery timeframe
- Manage company profile and product catalog

### **Brokers/Platform Administrators**

**Who they are:** The marketplace operators with existing networks and market knowledge

**What they can do:**
- Approve or reject supplier registrations
- Manage customer accounts
- View all transactions
- Track and manage commission payments
- Provide market intelligence and recommendations to customers
- Resolve disputes **[details needed]**

---

## **3. Minimum Viable Product (MVP) Scope**

To launch quickly and validate the concept, the first version will include:

### **Customer Features**
- ✅ Register/Login
- ✅ Create purchase request
- ✅ View received offers from suppliers
- ✅ Select preferred supplier
- ✅ View transaction history

### **Supplier Features**
- ✅ Register/Login
- ✅ View purchase requests
- ✅ Submit offers on requests
- ✅ Manage company profile
- ✅ View offer history

### **Broker/Admin Features**
- ✅ Approve/reject supplier registrations
- ✅ Manage customer accounts
- ✅ View all transactions
- ✅ Track commission amounts
- ✅ Access dashboard with platform statistics

### **Market Intelligence Features**
- ✅ Store historical price data for products
- ✅ Display price history to customers (charts/trends)
- ✅ **[Assumption: Only show aggregated/anonymized price trends, not individual supplier prices]**

### **What Is NOT Included in MVP**
- ❌ Integrated payment processing (payments happen offline)
- ❌ Delivery tracking
- ❌ Automated dispute resolution
- ❌ Supplier ratings/reviews system
- ❌ Advanced analytics and AI-powered recommendations

**❓ PLATFORM TYPE QUESTION:** Should the MVP be:
- **Web application** (accessible via browser on any device)
- **Mobile app** (native Android/iOS applications)
- **Both** (web + mobile apps)
- **Mobile-first web** (web application optimized for mobile browsers)

**Consideration:** Many Merkato suppliers may primarily use mobile phones. A mobile-first approach or native mobile app might increase supplier participation, while web applications are typically faster and cheaper to develop initially.

---

## **4. Business Model**

### **Revenue Generation**

**Primary Model:** Commission from supplier transactions

**📌 Assumption:** The platform charges suppliers a commission of **2-5% of transaction value** when they successfully complete a sale through the platform.

**Example:**
- Supplier wins a 100,000 ETB order
- Platform commission at 5% = 5,000 ETB
- Supplier receives 95,000 ETB (or customer pays 100k, supplier reports transaction)

**❓ CRITICAL QUESTION:** How will commission be collected if payments happen outside the platform?

**Possible approaches:**
- **Option A:** Honor system - Suppliers self-report completed transactions
- **Option B:** Both parties must confirm transaction completion before it's marked closed
- **Option C:** Require proof of payment (bank statement, receipt) to verify transaction value
- **Option D:** Future phase includes integrated payment, making commission automatic

**Please clarify preferred approach.**

### **Geographic Scope**

**Initial Launch:** Addis Ababa only

**Rationale:**
- Concentrated supplier network in Merkato area
- Easier logistics and delivery management
- Ability to provide hands-on support during early phase
- Faster dispute resolution with local presence

**Future Expansion:** Other major cities after MVP validation

---

## **5. Key Assumptions & Questions**

This section outlines areas where we need client clarification or where we've made assumptions to move forward.

### **Request Flow & Visibility**

**❓ QUESTION:** Who can see customer purchase requests?

**Options:**
- **Public:** All approved suppliers see all requests
- **Private/Invited:** Only suppliers selected by broker see specific requests
- **Hybrid:** Customer chooses visibility level when creating request

**Current Assumption:** All approved suppliers can view all requests, but brokers can also manually invite specific suppliers to particular requests.

---

### **Product Standardization**

**❓ QUESTION:** How detailed should product descriptions be?

**Challenge:** "5000 pens" is vague. Different types exist:
- Ballpoint vs gel pens
- Colors (blue, black, red)
- Brands (Pilot, Bic, local brands)
- Quality tiers (economy, standard, premium)

**Assumption:** Customers provide detailed specifications in their request, including:
- Product type and category
- Preferred brands (if any)
- Quality level expectations
- Any specific requirements

**If this assumption holds, then:** The platform needs a structured product categorization system, not just free-text descriptions.

---

### **Offer Flexibility**

**❓ QUESTION:** Can suppliers bid on partial orders?

**Scenario:** Customer requests:
- 10,000 notebooks
- 5,000 pens  
- 2,000 erasers
- 1,000 rulers

Can a supplier submit an offer for only notebooks and pens but not the others?

**Assumption:** Yes, suppliers can bid on partial orders. Customers can then select multiple suppliers to fulfill different parts of their request.

**If this assumption holds, then:** The system needs to handle multi-supplier selection and partial fulfillment tracking.

---

### **Price Visibility**

**❓ QUESTION:** Can suppliers see each other's offers?

**Options:**
- **Open/Transparent:** All offers are visible to everyone (true reverse auction)
- **Blind Bidding:** Suppliers cannot see competitor offers
- **Visible to Customer Only:** Only the customer sees all offers

**Assumption:** Blind bidding initially - suppliers cannot see competitor offers. This prevents price manipulation and encourages suppliers to submit their genuinely competitive pricing.

---

### **Delivery Responsibility**

**❓ QUESTION:** Who handles delivery logistics?

**Options:**
- **Supplier responsibility:** Each supplier must arrange and cover delivery
- **Customer pickup:** Customers collect from supplier location
- **Platform logistics partner:** Third-party delivery service (future phase)
- **Negotiable:** Decided case-by-case between customer and supplier

**Assumption:** Delivery terms are negotiable between customer and supplier. Suppliers include delivery details (cost, timeline, method) in their offer.

**If this assumption holds, then:** The platform only facilitates the connection; actual logistics are handled bilaterally.

---

### **Payment Process**

**❓ QUESTION:** How does payment flow work?

**Critical clarification needed on:**

1. **Payment method:** Bank transfer? Cash? Mobile money? Cheque?
2. **Payment timing:** Upfront? On delivery? Net-30 terms?
3. **Platform involvement:** Does money ever touch the platform, or always directly between parties?
4. **Commission collection:** When and how does the platform collect its commission?

**Current Assumption for MVP:** 
- Payments happen directly between customer and supplier (offline)
- Payment terms are negotiated between parties
- Platform does NOT handle money in MVP phase
- Commission collection method needs to be defined (see Business Model section)

---

### **Quality Assurance & Disputes**

**❓ QUESTION:** What happens when there's a dispute?

**Common scenarios:**
- Supplier delivers different quality than offered
- Delivery is significantly delayed
- Quantity doesn't match order
- Customer refuses to pay after receiving goods

**Assumption:** Broker/platform admin acts as mediator in disputes, but final resolution may require legal action between parties. The platform is a facilitator, not a guarantor.

**If this assumption holds, then:** Clear terms of service and dispute resolution procedures must be documented and agreed to by all users during registration.

---

### **Supplier Verification**

**❓ QUESTION:** What criteria must suppliers meet to be approved?

**Possible requirements:**
- Valid business license
- Physical business location
- Minimum years in operation
- Reference from existing customer
- Initial deposit or guarantee
- Product samples

**Assumption:** Brokers manually review and approve each supplier based on their existing knowledge of the market and supplier reputation. Formal criteria will be defined before launch.

---

## **6. Identified Gaps & Challenges**

These are business and operational challenges that need to be addressed, regardless of technical implementation.

### **Legal & Compliance**

**Tax Implications**
- How is VAT handled? Does the platform need to issue tax invoices?
- Withholding tax obligations for B2B transactions
- Who is the seller of record for tax purposes?

**Contract Enforcement**
- What legal standing does an "accepted offer" on the platform have?
- Is there a binding contract when customer selects a supplier?
- What recourse exists if either party backs out?

**Business Licensing**
- Does operating a B2B marketplace require specific licenses in Ethiopia?
- Are there regulations around broker/intermediary services?

**Data Protection**
- Customer procurement data is commercially sensitive
- What privacy guarantees are provided?
- Who owns the price and transaction data?

### **Trust & Verification**

**Fake or Unreliable Suppliers**
- What prevents someone from registering with false information?
- How do you verify supplier legitimacy and capability?
- What happens if a supplier wins offers but cannot fulfill?

**Product Quality Disputes**
- Supplier offers "premium A4 paper" but delivers lower quality
- No objective standard to verify quality claims
- Who arbitrates what constitutes acceptable quality?

**Delivery Verification**
- How do you prove delivery occurred?
- What if customer claims non-delivery but supplier has delivered?
- Need for: signatures, photos, third-party confirmation?


### **Payment & Financial Risk**

**Commission Collection Challenge**
- If payments are offline, how do you ensure suppliers pay commission?
- Suppliers might underreport transaction values
- Verification requires access to sensitive financial records

**Bad Debt Risk**
- Customer accepts offer but never pays supplier
- Supplier demands platform compensation
- Platform reputation suffers

**Currency & Price Validity**
- Ethiopian Birr exchange rates can fluctuate
- Inflation affects prices quickly
- How long is a supplier offer valid? 24 hours? 7 days?

**Working Capital for Suppliers**
- Large orders may require suppliers to procure inventory first
- If customer backs out, supplier is stuck with stock
- Risk discourages participation

### **Operational Complexity**

**Partial Fulfillment**
- Supplier can only provide 60% of requested quantity
- Does customer accept partial, or require full fulfillment?
- Can multiple small suppliers combine to fulfill one order?

**Request Ambiguity**
- "5000 notebooks" - too vague for accurate pricing
- Mismatches between customer expectation and supplier delivery
- Need for detailed specifications but balancing ease of use

**Multi-Item Orders**
- Customer requests 50 different products
- Very few suppliers can fulfill everything
- Complex comparison when suppliers bid on different subsets

**Seasonal Demand**
- School supplies surge before academic year
- Suppliers may be overwhelmed or inflate prices
- Platform capacity and user experience during peak times

### **Market Dynamics**

**Disintermediation Risk (Free Rider Problem)**
- Customer uses platform to discover suppliers and prices
- Then contacts supplier directly to avoid platform involvement
- Supplier agrees to bypass platform and avoid commission
- Platform loses revenue despite providing value

**Price Transparency Concerns**
- Some suppliers may not want their pricing visible to competitors
- Fear of race-to-bottom pricing
- May limit supplier participation

**Broker Conflict of Interest**
- If brokers also supply products directly, they may:
  - Favor their own offers
  - Steer customers away from better deals
  - Use platform data for competitive advantage
- Need clear policies on broker participation as suppliers

**Customer Gaming**
- Posting fake high-volume requests to discover market prices
- No intention to actually purchase
- Wastes supplier time, reduces trust

### **Scope & Scalability**

**Product Category Boundaries**
- Starting with stationery - but where's the line?
- Does "stationery" include: printers? furniture? software?
- Clear category definitions needed

**Request Visibility Rules**
- Who should see what requests?
- Balance between:
  - Maximum supplier competition (open to all)
  - Customer privacy (limited visibility)
  - Broker value-add (curated supplier selection)

**Pricing Information Access**
- Should suppliers see historical prices too?
- Transparency vs competitive advantage
- Aggregated vs granular data

---

## **7. Platform Strengths & Potential**

Despite the challenges, this platform addresses real market needs and has significant advantages:

### **Existing Network Effect**
- You already have relationships with hundreds of schools
- Access to established supplier network in Merkato
- Don't need to build marketplace from scratch - you're connecting existing relationships digitally
- **This is your strongest advantage**

### **Genuine Problem-Solution Fit**
- Price transparency is a real pain point for institutional buyers
- Suppliers genuinely need access to bulk buyers
- Current process is inefficient and manual
- Digital solution provides clear value to both sides

### **Market Intelligence Differentiation**
- Historical price data is valuable and rare
- Timing recommendations (when to buy) are actionable insights
- This creates defensible value beyond just being a marketplace
- Buyers would pay attention to "paper prices typically increase 20% in August"

### **Low Initial Complexity**
- MVP can be relatively simple
- Don't need complex payment integration initially
- Can start with curated suppliers (quality control)
- Room to learn and iterate

### **B2B Relationship Advantages**
- B2B transactions have higher trust and repeat business
- Organizations procure regularly (recurring revenue potential)
- Larger transaction sizes mean commission model is viable
- Professional users more forgiving of rough edges in MVP

### **Expansion Potential**
Beyond MVP, the platform could evolve to include:
- **Quality verification programs** - platform-certified suppliers
- **Bulk purchasing groups** - small organizations combine orders for better prices
- **Inventory financing** - help suppliers with working capital
- **Integrated logistics** - delivery tracking and management
- **Contract management** - automated purchase orders and invoices
- **Predictive analytics** - AI-powered buying recommendations
- **Category expansion** - office supplies, furniture, electronics

---

## **8.Recommendations**

### **Before Development Begins**

**Critical decisions needed:**

1. **Clarify the request flow model** (open marketplace vs broker-mediated)
2. **Define commission collection mechanism** (essential for business viability)
3. **Establish supplier verification criteria** (protects platform reputation)
4. **Document dispute resolution process** (risk management)
5. **Legal review** (business licensing, contracts, tax obligations)
6. **Finalize MVP feature scope** (what's truly essential vs nice-to-have)

---

## **9. Open Questions for Client**

Please review and provide feedback on:

1. **Platform Type:** Web application, mobile app, or both? (Mobile-first consideration for Merkato suppliers)
2. **Request Flow:** Open marketplace, broker-mediated, or hybrid model?
3. **Commission Collection:** How will this realistically work for offline payments?
4. **Supplier Approval:** What criteria must suppliers meet?
5. **Request Visibility:** Can all suppliers see all requests?
6. **Price Data:** Should historical prices be visible to suppliers too?
7. **Delivery:** Who is responsible for logistics?
8. **Disputes:** What is the platform's role in resolving conflicts?
9. **Payment Terms:** What payment methods and timelines are standard?
10. **Product Categories:** Stationery only, or broader scope?
11. **Legal Structure:** Have you consulted with legal counsel on licensing and contracts?

---

## **10. Conclusion**

This platform has strong potential to solve real inefficiencies in institutional stationery procurement. Your existing network provides a significant head start, and the market intelligence component offers unique value.

However, success depends on:
- **Clear business model** - especially commission collection
- **Trust mechanisms** - verification, quality assurance, dispute resolution
- **Realistic MVP scope** - start simple, learn fast, iterate
- **Legal foundations** - proper contracts, licensing, tax compliance

The gaps identified in this document are not insurmountable, but they need explicit decisions before development begins. Many can be addressed through clear policies, terms of service, and manual processes in the early phases, then automated as the platform matures.


---

**Document Version:** 1.0  

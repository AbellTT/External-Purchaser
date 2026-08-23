[8/4/2026 12:11 PM] ᗩβ乇ﾚ: I think this is the perfect time to define the scope before writing code. Since your goal is to get a usable MVP quickly, I'd organize the features into phases. This also makes it much easier to explain the project to your stakeholders.
Phase 1 – Core MVP (Must Have)
1. Authentication & Organization Management
Login
Logout
Forgot password
Organization registration (admin approval)
Organization profile
Contact information
Delivery address(es)
Procurement officer information
Organization verification status
2. Dashboard
The first thing users see.
Current basket status
Current estimated savings
Active orders
Delivery status
Recent announcements
Price trend highlights
Basket countdown timer
Recommended items
3. Product Catalog
Categories
Search
Filters
Product details
Images
Specifications
Packaging information
Unit (box, ream, carton...)
Current estimated price
Historical price graph
Availability
4. Basket System ⭐
This is the core of the platform.
Basket Types
Weekly
Monthly
Six-month
Each basket contains
Products
Total quantity
Participants
Estimated discount
Progress
5. Basket Progress
Instead of just showing %
Display
Total quantity
Estimated truck utilization
Estimated discount
Price changes
Remaining amount to next discount milestone
Number of participating organizations
6. Dynamic Pricing
Each product displays
Current estimated price
Lowest expected price
Highest expected price
Previous basket price
Savings estimate
7. Ordering
Users can
Add products
Select basket
Edit quantity
Remove products
Review order
Submit
Order status
Pending
Confirmed
Basket Closed
Purchased
Packed
Out for Delivery
Delivered
8. Direct Purchase
For urgent purchases
No waiting
Still discounted
Delivery estimation
9. Price Intelligence ⭐
Probably your second biggest selling point.
Every product shows
2-year price history
Weekly average
Monthly average
Seasonal trend
Highest recorded price
Lowest recorded price
Price volatility
Example insights:
Prices usually rise before the school year.
Prices are currently below the yearly average.
Last month's basket achieved the lowest price in six months.
10. Notifications
Basket opened
Basket closing soon
New discount unlocked
Order confirmed
Delivery updates
Price alerts
New announcements
11. Order History
Organizations can see
Previous orders
Total spending
Total savings
Download invoices
Reorder previous purchases
Admin System
Not Django Admin.
Your own dashboard.
Dashboard
Revenue
Active baskets
Organizations
Orders
Deliveries
Supplier statistics
Procurement statistics
Product Management
Add product
Edit
Archive
Categories
Images
Units
Price history
Minimum wholesale quantity
Supplier Management
Suppliers
Contact persons
Product mapping
Negotiated prices
Supplier performance
Notes
Basket Management
Open basket
Close basket
Extend basket
View participants
Estimated truck utilization
Procurement summary
Organization Management
Approve organizations
Suspend accounts
View purchase history
Spending analytics
Contact information
Order Management
View orders
Edit status
Assign delivery
Generate invoices
Procurement list
Delivery Management
Delivery routes
Delivery status
Driver assignment (future)
Delivery confirmation
Price Management
Very important.
Daily updates
Supplier price
Retail price
Historical prices
Seasonal adjustments
Reports
Generate
Weekly report
Monthly report
Product demand
Best selling items
Savings generated
Procurement summary
Future AI Features
Don't build now.
Demand prediction
"Next month schools will likely need..."
Price prediction
"Paper prices are expected to rise."
Smart recommendations
"Buying this week could save approximately 8%."
Supplier recommendation
Choose the cheapest supplier automatically.
Automatic basket optimization
Suggest merging baskets.
Future Procurement Features
RFQ (Request for Quotation)
[8/4/2026 12:11 PM] ᗩβ乇ﾚ: Supplier bidding
Tender management
Approval workflow
Purchase requisitions
Future Finance
Online payment
Credit purchases
Installments
Payment tracking
Refunds
Future Mobile App
Flutter
Procurement officers
Delivery staff
Management dashboard
Analytics
Organization
Monthly spending
Savings
Most purchased products
Purchase frequency
Platform
Total savings
Basket efficiency
Procurement volume
Most active organizations
One Feature I Think Will Differentiate You
Procurement Calendar
This idea came to me while reading your explanation.
Imagine every organization has an annual procurement plan.
The platform could show:
📅 September
Printer paper
Pens
📅 November
Exercise books
📅 January
Cleaning materials
The platform then says:
"Based on your previous purchases and historical market prices, the November basket is expected to provide the best pricing for exercise books."
This transforms your platform from a marketplace into a procurement planning system, which is much harder for competitors to copy.
My recommendation for the MVP
If I had to choose just 10 features for version 1, I'd build:
Organization authentication
Product catalog
Basket system (weekly/monthly/6-month)
Dynamic pricing
Order placement
Direct purchase
Basket progress visualization
Price history & trends
Admin dashboard (custom React)
Notifications
Everything else can be added incrementally once you've validated the idea with your first group of organizations. Based on everything you've shared, the basket system and procurement intelligence are what make this platform unique, so I'd focus development effort there first.
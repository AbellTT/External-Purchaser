Here is a complete step-by-step breakdown of how multi-year range data is aggregated, followed by a worked example using the sample dataset and an explanation of the formula's structure.

Part 1: Handling Multi-Year Records and Min/Max Ranges
When dealing with historical data spanning multiple years (e.g., 2024–2026), each bi-month contains min/max ranges. To feed this into the ranking formula, aggregate the data in two steps:

Step 1: Calculate the Midpoint for Each Year
For a single bi-monthly record in a specific year, convert each range into a single representative midpoint:

Price mid:
​$$\text{Price}_{\text{mid}} = \frac{\text{MinPrice} + \text{MaxPrice}}{2}$$

Increase mid:
$$\text{Increase}_{\text{mid}} = \frac{\text{MinIncrease} + \text{MaxIncrease}}{2}$$
​
Discount mid:
$$\text{Discount}_{\text{mid}} = \frac{\text{MinDiscount} + \text{MaxDiscount}}{2}$$

Step 2: Average Across All Available Years
Combine records across multiple years by taking the arithmetic mean of those midpoints for each bi-month:

avgPrice:
$$\text{AvgPrice} = \frac{1}{N} \sum_{y=1}^{N} \text{Price}_{\text{mid}, y}$$
​

avgWeeklyIncrease:
$$\text{AvgWeeklyIncrease} = \frac{1}{N} \sum_{y=1}^{N} \text{Increase}_{\text{mid}, y}$$

AvgWeeklyDiscount:
$$\text{AvgWeeklyDiscount} = \frac{1}{N} \sum_{y=1}^{N} \text{Discount}_{\text{mid}, y}$$
​

Part 2: Why the Formula is Structured This Way
The formula is designed around three core principles:

$$\text{ProcurementScore} = \text{AvgPrice} \times \left(1 + 0.6 \cdot \frac{\text{AvgWeeklyIncrease}}{\text{AvgPrice}} - 0.3 \cdot \frac{\text{AvgWeeklyDiscount}}{\text{AvgPrice}}\right)$$

1. The Multiplier Framework: AvgPrice × (…)

- Instead of adding or subtracting flat Birr amounts, the expression inside the parentheses acts as a Risk Adjustment Factor centered at 1.0:

- If market risks and discounts balance out, the factor is 1.0, and ProcurementScore = AvgPrice.

- If upward surge risk dominates, the factor becomes >1.0 (e.g., 1.05), artificially raising the score to reflect a 5% risk penalty.

- If discount opportunities dominate, the factor becomes <1.0 (e.g., 0.98), lowering the score to reflect a 2% value bonus.

2. Percentage Normalization:  
   AvgPrice / Increase and AvgPrice / Discount

- Dividing weekly fluctuations by the base price converts absolute Birr values into percentage swings. This ensures that high-priced items (like printer toner) and low-priced items (like box files) are evaluated on a fair, relative scale.

3. Asymmetric Weighting (0.6 vs 0.3)

- In real-world procurement, budget overruns are far more damaging than missed savings:

- 0.6 Weight on Increases: Price spikes happen automatically when buying during peak periods. High penalization accounts for this guaranteed risk.

- 0.3 Weight on Discounts: Capturing a discount requires purchasing on the exact right week. Lower credit accounts for the fact that buyers will not always catch peak discount days.

Part 3: Step-by-Step Worked Example
Using the sample data from Option 1 (where prices remain below 290 ETB), here is how the algorithm evaluates each season.

1. Data Aggregation (Midpoints)

| Period     | Price Range | Price Midpoint (Avg Price) | Weekly Increase Range | Increase Midpoint | Weekly Discount Range | Discount Midpoint |
| ---------- | ----------- | -------------------------: | --------------------- | ----------------: | --------------------- | ----------------: |
| Sept – Oct | $190 → $200 |                    $195.00 | $5 → $15              |            $10.00 | $0 → $5               |             $2.50 |
| Nov – Dec  | $145 → $170 |                    $157.50 | $10 → $25             |            $17.50 | $5 → $15              |            $10.00 |
| Jan – Feb  | $210 → $240 |                    $225.00 | $10 → $30             |            $20.00 | $5 → $10              |             $7.50 |
| Mar – Apr  | $220 → $250 |                    $235.00 | $5 → $15              |            $10.00 | $10 → $20             |            $15.00 |
| May – Jun  | $165 → $195 |                    $180.00 | $5 → $10              |             $7.50 | $15 → $30             |            $22.50 |
| Jul – Aug  | $240 → $280 |                    $260.00 | $15 → $35             |            $25.00 | $5 → $10              |             $7.50 |

2. Formula Calculations

Sept – Oct
$$\text{Surge Ratio} = \frac{10.00}{195.00} = 0.0513 \quad \vert{} \quad \text{Discount Ratio} = \frac{2.50}{195.00} = 0.0128$$
$$\text{Score} = 195.00 \times \left(1 + 0.6(0.0513) - 0.3(0.0128)\right) = 195.00 \times 1.0269 = \mathbf{200.25}$$

Nov – Dec
$$\text{Surge Ratio} = \frac{17.50}{157.50} = 0.1111 \quad \vert{} \quad \text{Discount Ratio} = \frac{10.00}{157.50} = 0.0635$$
$$\text{Score} = 157.50 \times \left(1 + 0.6(0.1111) - 0.3(0.0635)\right) = 157.50 \times 1.0476 = \mathbf{165.00}$$
Jan – Feb
$$\text{Surge Ratio} = \frac{20.00}{225.00} = 0.0889 \quad \vert{} \quad \text{Discount Ratio} = \frac{7.50}{225.00} = 0.0333$$
$$\text{Score} = 225.00 \times \left(1 + 0.6(0.0889) - 0.3(0.0333)\right) = 225.00 \times 1.0433 = \mathbf{234.75}$$
Mar – Apr$$\text{Surge Ratio} = \frac{10.00}{235.00} = 0.0426 \quad \vert{} \quad \text{Discount Ratio} = \frac{15.00}{235.00} = 0.0638$$
$$\text{Score} = 235.00 \times \left(1 + 0.6(0.0426) - 0.3(0.0638)\right) = 235.00 \times 1.0064 = \mathbf{236.50}$$
May – Jun
$$\text{Surge Ratio} = \frac{7.50}{180.00} = 0.0417 \quad \vert{} \quad \text{Discount Ratio} = \frac{22.50}{180.00} = 0.1250$$
$$\text{Score} = 180.00 \times \left(1 + 0.6(0.0417) - 0.3(0.1250)\right) = 180.00 \times 0.9875 = \mathbf{177.75}$$
Jul – Aug
$$\text{Surge Ratio} = \frac{25.00}{260.00} = 0.0962 \quad \vert{} \quad \text{Discount Ratio} = \frac{7.50}{260.00} = 0.0288$$

$$
\text{Score} = 260.00 \times \left(1 + 0.6(0.0962) - 0.3(0.0288)\right)
= 260.00 \times 1.0490
= 272.75
$$

### 3. Final Ranking & Platform Output

Sorting the scores from lowest (best) to highest (worst):

| Rank | Period | Score | Status Badge | Reason |
|---:|---|---:|---|---|
| 1st | Nov – Dec | 165.00 ETB | 🟢 1st Best Season | Lowest baseline cost (157.50 ETB) despite moderate weekly volatility. |
| 2nd | May – Jun | 177.75 ETB | 🔵 2nd Best Season | Strong discount potential (12.5% avg discount) lowers the effective procurement score below its sticker price. |
| 3rd | Sept – Oct | 200.25 ETB | ⚪ Normal | Moderate base price with minimal discount opportunities. |
| 4th | Jan – Feb | 234.75 ETB | ⚪ Normal | Higher baseline cost with standard upward volatility. |
| 5th | Mar – Apr | 236.50 ETB | ⚪ Normal | High baseline price offset slightly by good discount windows. |
| 6th | Jul – Aug | 272.75 ETB | 🔴 Worst Season | Highest baseline price (260 ETB) combined with steep upward surge risk (25 ETB avg surge). |
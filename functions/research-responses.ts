/**
 * RESEARCH-POWERED RESPONSES
 * 
 * These responses are YOUR domain knowledge about packaging industry.
 * They're pre-written, intelligent, and feel like AI.
 * 
 * When PAID_TIER_ENABLED = false: Return these responses (costs $0)
 * When PAID_TIER_ENABLED = true: Call Vertex AI instead
 */

interface ResearchResponse {
  response: string;
  reasoning: string;
  nextQuestionHint: string;
  successMetrics?: string[];
}

// ============================================
// QUESTION-SPECIFIC RESPONSES
// ============================================

export function getQ1Response(answer: string): ResearchResponse {
  const responses: Record<string, ResearchResponse> = {
    boxes: {
      response: `We see you're in corrugated or folding box manufacturing. This is a highly fragmented market with consolidation happening at regional level. Most box manufacturers have 3-5 primary buyer relationships that account for 60%+ of revenue.

Our platform helps you identify new buyer segments in your geographic zone that haven't been approached yet, using real-time permit data and expansion signals. Box buyers typically show growth signals 30-45 days before they're ready to increase volume.`,
      reasoning: 'Box manufacturing is labor-intensive with geographic constraints. Consolidation means new buyers are your growth path.',
      nextQuestionHint: 'Next, we understand your business maturity and customer base size.',
      successMetrics: [
        'Average box manufacturers increase buyer count by 3-5 per month',
        'Geographic zones typically have 200-400 untapped buyers',
        'Expansion signals predict 3x higher close rates',
      ],
    },
    film: {
      response: `Film and flexible packaging is a high-margin, fast-moving category. You likely serve both CPG converters and contract manufacturers. The barrier to entry for new customers is usually technical compatibility (machine specifications) and minimum order volumes.

Our platform identifies buyers in your region who are expanding production capacity or adding new SKUs (both require more film). These buyers are in "buying mode" and more receptive to new suppliers.`,
      reasoning: 'Film buyers are efficiency-focused. They switch suppliers when expanding capacity or hitting quality issues.',
      nextQuestionHint: 'Understanding your business age helps us model your buyer capacity.',
      successMetrics: [
        'Film manufacturers average 2-3 new buyer relationships per quarter',
        'Capacity expansion signals correlate with 5-7x higher engagement',
      ],
    },
    laminates: {
      response: `Laminate manufacturing serves highly specialized markets (beverage, pharmaceutical, food safety). Buyers are concentrated but sticky once contracted. Most of your business is likely with 10-20 anchor customers.

Growth comes from: (1) geographic expansion of existing customers, (2) new market segments you haven't served, (3) replacing competitors. Our platform tracks all three signals in your region.`,
      reasoning: 'Laminates require quality certifications and relationship depth. Growth = geographic reach + new verticals.',
      nextQuestionHint: 'Next we understand your business stage and annual capacity.',
      successMetrics: [
        'Laminate suppliers with geographic focus grow 4-6 new customers/year',
        'Certification changes drive buyer switching 8-10x more often',
      ],
    },
    labels: {
      response: `Label manufacturing is high-volume, low-margin, and highly competitive. Differentiation comes from: (1) quick turnaround, (2) custom printing capabilities, (3) being geographically close. You win on convenience and speed, not price.

New customer acquisition in labels happens through: (1) contract manufacturers adding new products, (2) brands expanding distribution (new SKUs = new labels), (3) replacing underperforming vendors. We identify all three signals in real-time.`,
      reasoning: 'Label buyers care about speed and consistency. New customer segments = expansion or new production lines.',
      nextQuestionHint: 'Understanding your operation scale helps model your buyer capacity.',
      successMetrics: [
        'Top label suppliers maintain 40-60 active buyer relationships',
        'New SKU launches by existing buyers = 60% repeat purchase rate',
      ],
    },
    other: {
      response: `Interesting - there are several other secondary packaging segments (bags, pouches, rigid containers, etc.). Whatever your segment, the buying pattern is similar: businesses buy more packaging when they're expanding production, entering new markets, or replacing a current supplier due to service issues.

Our platform helps you identify which buyers in your region are in "expansion mode" right now, using real-time signals like permit filings, hiring, and online activity.`,
      reasoning: 'All packaging buying is driven by business growth or dissatisfaction.',
      nextQuestionHint: 'Next, we understand your business maturity.',
      successMetrics: [
        'Growth signals predict 3-5x higher buyer receptiveness',
        'Permit data is 30 days ahead of actual purchasing',
      ],
    },
  };

  return (
    responses[answer] || {
      response: 'Packaging manufacturing is a growth industry. We help you find buyers in expansion mode.',
      reasoning: 'Standard packaging market analysis.',
      nextQuestionHint: 'Let me learn more about your specific situation.',
    }
  );
}

export function getQ2Response(answer: string | number): ResearchResponse {
  const yearFounded = typeof answer === 'string' ? parseInt(answer) : answer;
  const yearEstablished = new Date().getFullYear() - yearFounded;

  if (yearEstablished < 2) {
    return {
      response: `You're a startup - this is actually a strength. You have no legacy processes or supplier relationships holding you back. You can move fast and be nimble in your sales process.

Most startups in packaging take 6-12 months to find their first 3-5 anchor customers. After that, growth accelerates because you have proof points and references. Where are you in that journey?`,
      reasoning: 'Early-stage manufacturers have speed advantage, need to build credibility.',
      nextQuestionHint: 'Understanding your customer volume helps us model realistic growth.',
      successMetrics: [
        'Startups that reach 3 anchor customers in year 1 typically scale to 20+ in year 2-3',
        'Geographic focus is critical for early-stage success',
      ],
    };
  }

  if (yearEstablished >= 2 && yearEstablished < 10) {
    return {
      response: `You're in the growth stage. You likely have some established customer relationships but are still building market presence. This is the critical inflection point - the difference between staying at $1-2M revenue vs scaling to $5-10M is your ability to systematically add new buyers.

Most growth-stage manufacturers struggle with predictable customer acquisition. This is exactly where our platform adds the most value.`,
      reasoning: 'Growth-stage companies need systematic customer acquisition to scale.',
      nextQuestionHint: 'Next, understanding your current customer base helps us model opportunity.',
      successMetrics: [
        'Growth-stage suppliers who systematize customer acquisition grow 2-3x faster',
        'Average CAC is $2,500-5,000 per new buyer relationship',
      ],
    };
  }

  return {
    response: `You're established - you have operational credibility and likely strong existing customer relationships. Your challenge shifts from "finding buyers" to "replacing customers" as they consolidate with competitors or go out of business, and "expanding wallet share" with existing customers.

New customer acquisition at your stage often targets similar buyer profiles to your best customers. We identify those lookalikes in your region.`,
    reasoning: 'Mature manufacturers need customer retention + strategic expansion.',
    nextQuestionHint: 'Understanding your current customer volume helps us model realistic growth.',
    successMetrics: [
      'Established suppliers typically add 2-4 new customers per year sustainably',
      'Customer lookalike modeling increases close rates by 3-5x',
    ],
  };
}

export function getQ3Response(answer: string | number): ResearchResponse {
  const volumeMap: Record<string, ResearchResponse> = {
    high_volume: {
      response: `High-volume customer base (150+) is unusual and valuable. It suggests: (1) you've achieved product-market fit, (2) you have operational excellence, (3) you likely serve a concentrated vertical (like labels to small brands, or boxes to regional distributors).

With this volume, your growth typically comes from: (1) deepening relationships (expanding order sizes), (2) replacing competitors in key accounts, or (3) geographic expansion. New customer acquisition at this scale is less about "finding anyone" and more about "finding the right someone" in your sweet spot.`,
      reasoning: 'High customer count = market validation + need for quality targeting.',
      nextQuestionHint: 'Understanding your pain helps us identify your biggest opportunity.',
      successMetrics: [
        'High-volume suppliers focus 60% of effort on top 10-20 customers',
        'Replacements happen when competitor fails - our platform tracks that',
      ],
    },
    medium_volume: {
      response: `Medium customer base (50-150 customers) is optimal for manufacturing growth. You have enough volume to be operationally efficient, but still growing. Your next 25-50 customers will take you from sustainable to high-growth.

The bottleneck is usually: (1) sales process is not predictable, (2) you don't have systematic way to identify next customer, (3) your existing customers are your only source of referrals. This is where data-driven targeting helps most.`,
      reasoning: 'Medium-volume is sweet spot for systematic growth.',
      nextQuestionHint: 'Understanding your current pain helps prioritize growth lever.',
      successMetrics: [
        'Medium-volume suppliers typically add 5-10 new customers/quarter',
        'Systematic targeting increases close rate by 4-6x vs cold outreach',
      ],
    },
    low_volume: {
      response: `If you have fewer than 50 customers, that's actually typical for early-stage manufacturers. The challenge is clear: you need to find your first 50-100 customers to build stability and credibility.

The good news: this is the easiest stage to grow through. You don't have operational constraints yet. You just need: (1) clear buyer profile, (2) list of those buyers, (3) systematic outreach. That's 100% of what our platform does.`,
      reasoning: 'Low customer count = highest upside from systematic prospecting.',
      nextQuestionHint: 'Understanding your biggest pain helps us target the right buyers.',
      successMetrics: [
        'Early-stage suppliers grow from 10 to 50 customers in 6-12 months with right targeting',
        'Targeting expansion signals increases engagement by 5-10x',
      ],
    },
  };

  return (
    volumeMap[answer as string] || {
      response: 'Understanding your customer volume helps us model realistic growth expectations.',
      reasoning: 'Customer count is key metric for manufacturing scalability.',
      nextQuestionHint: 'Let me learn more about your business.',
    }
  );
}

export function getQ6Response(answer: string): ResearchResponse {
  const painMap: Record<string, ResearchResponse> = {
    finding_buyers: {
      response: `Finding buyers is the #1 pain for packaging manufacturers. This is exactly what we solve. Most manufacturers rely on: (1) inbound referrals, (2) cold calling without targeting, (3) industry events, (4) sales reps with personal networks. All of these are slow and expensive.

Our platform systematizes buyer discovery using real-time signals. We identify buyers in expansion mode (most likely to buy), which gives you a 3-5x better close rate than random cold outreach.`,
      reasoning: 'Buyer discovery bottleneck is most common and most addressable.',
      nextQuestionHint: 'Understanding what you\'ve already tried helps us avoid repeating failed approaches.',
      successMetrics: [
        'Manufacturers shift from 30% of time prospecting to 5% with right targeting',
        'Average sales cycle compresses from 4-6 months to 2-3 months',
      ],
    },
    margins: {
      response: `Margins are tight in packaging - that's the industry reality. But there are levers: (1) customer segmentation (some buyers are more profitable), (2) product mix optimization (sell higher-margin products to right buyers), (3) efficiency improvements, (4) serving a less price-sensitive market segment.

Our platform helps with #1 and #2: identifying which buyer segments are most profitable for you, then targeting aggressively there.`,
      reasoning: 'Margin pressure requires buyer segmentation and efficiency focus.',
      nextQuestionHint: 'Understanding your past sales methods helps us identify gaps.',
      successMetrics: [
        'Margin-focused suppliers improve profitability by 15-20% through customer segmentation',
      ],
    },
    operational: {
      response: `Operational pain (production delays, quality issues, supply chain) impacts your ability to win and keep customers. In the short term, we recommend stabilizing operations. But there's a relationship lens: are you losing customers because of operations, or are your best customers operationally demanding?

Understanding this helps you segment: some customers might be better served by competitors, and some might be willing to pay premium for reliability. Our platform helps identify which type of buyer appreciates what you're good at.`,
      reasoning: 'Operational excellence is baseline; then align buyer mix to strengths.',
      nextQuestionHint: 'Understanding your sales history helps position your strengths.',
      successMetrics: [
        'Operationally-strong suppliers can target premium buyers and increase margins 20-30%',
      ],
    },
    retention: {
      response: `Customer retention is the silent killer in manufacturing. If you're losing customers, the question is: (1) price (they found someone cheaper), (2) service (you disappointed them), or (3) they went out of business / consolidated with competitors.

For (1) and (2), we can't fix retention directly. But (3) is addressable: if you're losing customers to consolidation, we help you identify replacement opportunities proactively. For (1) and (2), new customer acquisition at scale gives you more control over your revenue.`,
      reasoning: 'Retention issues require root cause analysis + new growth to stabilize.',
      nextQuestionHint: 'Understanding your outreach history helps us position new approach.',
      successMetrics: [
        'Retention-challenged suppliers typically improve by 15-20% with diversified customer base',
      ],
    },
  };

  return (
    painMap[answer] || {
      response: 'Understanding your specific pain helps us position the right solution.',
      reasoning: 'Each pain point requires different approach.',
      nextQuestionHint: 'Let me learn about what you\'ve already tried.',
    }
  );
}

export function getQ7Response(answers: string[]): ResearchResponse {
  const hasTriedColdCalling = answers.includes('cold_calling');
  const hasTriedEmail = answers.includes('email');
  const hasTriedLinkedIn = answers.includes('linkedin');
  const hasTriedEvents = answers.includes('events');

  let response = '';
  let successMetrics: string[] = [];

  if (hasTriedColdCalling && hasTriedEmail) {
    response = `You've tried the classic approach (cold calling + email). Most manufacturers hit a wall with this method around 15-20 customers because: (1) you run out of relevant contacts, (2) same pitch to everyone doesn't work, (3) you're reaching buyers who aren't in growth mode.

The insight: outreach success varies 5-10x depending on buyer context. Calling a buyer mid-expansion is 10x more effective than calling a random one. This is where data changes the game.`;
    successMetrics = [
      'Outreach to expansion-signal buyers: 15-20% response rate',
      'Random outreach: 2-3% response rate',
    ];
  } else if (hasTriedLinkedIn) {
    response = `LinkedIn is your highest-leverage channel for manufacturing B2B. You've discovered this. Most manufacturers underestimate LinkedIn effectiveness because they're doing it wrong (generic outreach). Personalized LinkedIn outreach to decision makers at target companies can achieve 10-15% response rates.

The next level: combine LinkedIn with firmographic data (company growth, expansion signals) to identify who to message. This multiplies effectiveness.`;
    successMetrics = [
      'Generic LinkedIn outreach: 3-5% response rate',
      'Targeted LinkedIn to growth-signal buyers: 12-15% response rate',
    ];
  } else {
    response = `You've identified some sales channels but haven't fully optimized any yet. That's actually good news - it means you have leverage to improve. The common pattern: most manufacturers are inconsistent in their approach, or trying too many channels without depth.

Recommendation: pick ONE channel, optimize for expansion-signal buyers, measure obsessively. Then add second channel once you've mastered the first.`;
    successMetrics = [
      'Focused outreach beats scattered approach by 3-5x',
      'Consistency matters more than channel choice',
    ];
  }

  return {
    response,
    reasoning: 'Outreach effectiveness is multiplicative: method × buyer context × persistence.',
    nextQuestionHint: 'Understanding your sales results helps us model realistic projections.',
    successMetrics,
  };
}

export function getQ9Response(answer: string | number): ResearchResponse {
  const closes = typeof answer === 'string' ? parseInt(answer) : answer;

  if (closes < 2) {
    return {
      response: `Close rate below 2/month suggests either: (1) you're not prospecting enough (need more conversations), (2) your targeting is off (talking to wrong buyers), or (3) your offering doesn't fit the market.

Given you're established, I'd bet on (1) or (2). Most manufacturers who "think" they're doing sales are actually doing 5-10 outreach touches per month. To close 2-3, you typically need 40-60 touches (due diligence + multiple touches per buyer). This is purely a volume + targeting problem - and fixable.`,
      reasoning: 'Low closes usually = low prospecting volume + weak targeting.',
      nextQuestionHint: 'Understanding your conversion math helps model growth.',
      successMetrics: [
        'Most manufacturers need 10-15 conversations to close 1',
        'Expansion-signal targeting reduces this to 5-8 conversations per close',
      ],
    };
  }

  if (closes >= 2 && closes < 5) {
    return {
      response: `2-4 closes per month is a healthy baseline, especially for established manufacturers. This suggests: (1) you have repeatable sales process, (2) your product-market fit is solid, (3) you're profitable.

Growth from here comes from: (1) increasing prospecting volume (more pipeline = more closes), (2) improving close rate (better targeting = same effort, higher ROI), or (3) focusing on higher-value customers (improve deal size). All three are achievable.`,
      reasoning: 'Healthy close rate = strong foundation for scaling.',
      nextQuestionHint: 'Understanding your sales costs helps model growth ROI.',
      successMetrics: [
        'Top quartile manufacturers average 2-3x your close rate through targeting',
        'Volume increases usually come first, then rate improvement',
      ],
    };
  }

  return {
    response: `5+ closes per month is excellent. You've built a scalable sales machine. At this level, your challenge isn't "how do I close more" but rather: (1) can your operations keep up?, (2) are you capturing all addressable demand in your region?, (3) can you maintain quality while scaling?.

Data-driven targeting helps with (2): identifying untapped segments or geographies where your formula works but you haven't focused yet.`,
    reasoning: 'High close volume = operational excellence + market demand.',
    nextQuestionHint: 'Understanding your geographic focus helps model expansion.',
    successMetrics: [
      'Best-in-class manufacturers hit 10-15 closes/month by geographic replication',
    ],
  };
}

export function getQ10Response(answer: string | number): ResearchResponse {
  const rateStr = String(answer).includes('.') ? String(answer) : `${answer / 100}`;
  const closeRate = parseFloat(rateStr);

  if (closeRate < 0.1) {
    return {
      response: `Close rate below 10% suggests your targeting or offer might be off-market. Most packaging manufacturers sit 15-25% (close rate = closes / outreach conversations, not opportunities).

Diagnostic questions: (1) Are you measuring this correctly? (closes / how many conversations?), (2) Are the people you're talking to actually decision makers?, (3) Are you reaching them at the right time in their buying cycle?

Our platform helps with all three by identifying decision makers at companies in growth/expansion mode.`,
      reasoning: 'Low close rate = wrong targeting or wrong buyer maturity.',
      nextQuestionHint: 'Understanding what you\'ve tried helps us improve targeting.',
    };
  }

  if (closeRate >= 0.1 && closeRate < 0.25) {
    return {
      response: `Close rate of 10-25% is solid and typical for manufacturing. This suggests you have product-market fit and your sales process is reasonable. Improvement comes from: (1) better targeting (talk to fewer people, but better ones), (2) improvement in sales messaging, or (3) improving buyer experience.

Most manufacturers focus on (1): if you can increase close rate from 15% to 25% through targeting, that's 66% more closes with same effort.`,
      reasoning: 'Solid close rate = opportunity to improve targeting quality.',
      nextQuestionHint: 'Understanding your sales approaches helps us model improvements.',
      successMetrics: [
        'Targeting improvements often lift close rates 5-10 percentage points',
        'This translates to 30-50% more revenue from same sales effort',
      ],
    };
  }

  return {
    response: `Close rate above 25% is excellent. You've clearly nailed product-market fit and sales process. Your opportunity isn't rate improvement but volume: how many qualified conversations can you have per month?

At 25%+ close rate, your challenge is: can you identify and reach all the buyers you qualify for? This is pure prospecting volume and targeting efficiency.`,
    reasoning: 'High close rate = focus on prospecting scale.',
    nextQuestionHint: 'Understanding your market potential helps model growth ceiling.',
    successMetrics: [
      'Best-in-class manufacturers with 25%+ rates focus 80% of effort on prospecting',
      'Volume increases of 2-3x are achievable with right targeting platform',
    ],
  };
}

// Default responses for other questions
export function getDefaultResponse(questionId: string, answer: string): ResearchResponse {
  return {
    response: `Thank you for that answer. We're gathering insights about your business to personalize recommendations.`,
    reasoning: 'Building supplier profile.',
    nextQuestionHint: 'Moving to next question.',
  };
}

export default {
  getQ1Response,
  getQ2Response,
  getQ3Response,
  getQ6Response,
  getQ7Response,
  getQ9Response,
  getQ10Response,
  getDefaultResponse,
};
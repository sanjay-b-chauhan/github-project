/* Ron Robinson, Business Analyst. Every word comes from the live v2 portfolio (portfolio-v2-five-blue-71.vercel.app, window.DATA), cleaned of dashes. Faces are Zero's generated cast. */
window.RON={
 "person": {
  "name": "Ron Robinson",
  "track": "Business Analyst",
  "city": "Toronto, Canada",
  "level": 4,
  "mastery": "Proficient",
  "tagline": "Completed 7 scenarios on the Zero Business Analyst track.",
  "intro": "I work best on a framed problem with data in hand. I build the model, isolate one driver, size the opportunity, and open the write-up with the recommendation. On a loose brief I still lean on a manager to help scope the question first.",
  "portrait": "Ron works most effectively on a framed problem with data in hand. Across seven scenarios he built funnel, cohort, decomposition, and cost models, isolated a single driver backed by segmentation, sized the opportunity, and opened the write-up with the recommendation. His models state assumptions inline and carry a sensitivity range on the larger ones. Two limits are consistent. On a loose brief his structure follows a manager scoping the question rather than precedes it, and on most projects one side, the diagnosis or the recommendation-and-cost work, is further along than the other. The work was done in spreadsheets with an AI assistant; SQL and BI tooling were not part of this block. He has not reached measurement design, open-ended strategy, or AI-workflow building, which begin later in the track. On the foundational, most scaffolded scenarios his output meets the senior-practitioner bar; the harder, less scaffolded work is untested.",
  "signals": [
   "Opens written work with the recommendation and the number.",
   "States model assumptions inline.",
   "Confirms a driver against qualitative evidence before committing to it.",
   "Stronger on a framed brief than on an open one."
  ]
 },
 "role": {
  "company": "Ramp",
  "domain": "ramp.com",
  "title": "Business Analyst",
  "team": "Strategy & Operations",
  "verdict": {
   "demonstrated": 6,
   "total": 9,
   "atHighPerformer": 2,
   "atThreshold": 4,
   "notYet": 3
  },
  "reqs": [
   {
    "label": "Quantify a business problem in dollars or a target metric before proposing a solution",
    "status": "high-performer",
    "evidence": "Sized the opportunity before recommending in 6 of 7 projects, with the assumption stated each time.",
    "from": [
     "Netflix",
     "Spotify",
     "Amazon"
    ]
   },
   {
    "label": "Diagnose root cause from segmented data, not the surface reason",
    "status": "high-performer",
    "evidence": "Isolated one named driver backed by segmentation in 6 of 7 diagnoses: playlist adoption at Spotify, the quality-check step at Amazon, calendar-sync conflicts at Airbnb.",
    "from": [
     "Spotify",
     "Amazon",
     "Airbnb"
    ]
   },
   {
    "label": "Build and defend a quantitative model (cohort, decomposition, cost, sensitivity)",
    "status": "threshold",
    "evidence": "Built cohort, decomposition, and cost models with assumptions stated. A multi-point sensitivity range appeared only on the Amazon model.",
    "from": [
     "Spotify",
     "Netflix",
     "Amazon"
    ]
   },
   {
    "label": "Translate analysis into a recommendation tied to expected KPI impact",
    "status": "threshold",
    "evidence": "Each project closed with one recommendation and a target metric. Several recommendations were less specific or lower-yield than the diagnosis behind them.",
    "from": [
     "Netflix",
     "Shopify",
     "Airbnb"
    ]
   },
   {
    "label": "Communicate to senior stakeholders in writing",
    "status": "threshold",
    "evidence": "Wrote proposals and a decision memo to the single named decision-maker in each brief, opening with the recommendation in 6 of 7.",
    "from": [
     "Spotify",
     "Netflix",
     "Amazon"
    ]
   },
   {
    "label": "Interpret an experiment and decide under uncertainty",
    "status": "threshold",
    "evidence": "On the Slack test he confirmed the primary lift was significant, segmented it, and treated a non-significant underpowered guardrail as unresolved rather than clear.",
    "from": [
     "Slack"
    ]
   },
   {
    "label": "Design a measurement system or KPI architecture",
    "status": "not-yet",
    "evidence": "Not observed. The first measurement-design scenario unlocks at project 8; he has reached project 7.",
    "from": []
   },
   {
    "label": "Structure open-ended strategy without a supplied dataset or framing",
    "status": "not-yet",
    "evidence": "Not observed. His structure was strongest when the brief named the metric and supplied the data. Defining the question cold is untested.",
    "from": []
   },
   {
    "label": "Build or evaluate an AI-enabled workflow",
    "status": "not-yet",
    "evidence": "Not observed as a deliverable. He used an AI assistant for hypotheses and drafting throughout but built no AI workflow; those scenarios begin at project 12.",
    "from": []
   }
  ],
  "why": [
   {
    "label": "Quantifies before recommending",
    "body": "On the Netflix slowdown he split year-over-year growth from 14% to 6% into a subscriber component and an ARPU component, attributed most of it to slowing regional subscriber adds, and sized the recovery path before naming a fix.",
    "tag": "Structured thinking"
   },
   {
    "label": "Goes past the surface reason",
    "body": "On Airbnb he cut from raw reason codes to calendar-sync conflicts among multi-listing hosts. On Spotify he isolated low early playlist adoption rather than price, with cohort and exit-survey evidence.",
    "tag": "Root-cause analysis"
   },
   {
    "label": "Leaves a number a reviewer can check",
    "body": "His models state assumptions inline and carry a sensitivity range on the larger ones. On Amazon he reconciled cycle-time data against floor notes before naming the bottleneck.",
    "tag": "Defensible modeling"
   }
  ],
  "probes": [
   {
    "label": "Give him a one-line problem with no dataset attached and watch whether he scopes it before asking for data.",
    "pattern": "His structured work appeared on briefs that already named the metric and supplied the data. On the two looser briefs the structure was thinner and the recommendation stayed general.",
    "why": "A Strategy and Operations analyst, and any analyst at a small company, usually gets an ambiguous ask and no clean dataset. The track has not tested him defining the question cold.",
    "from": [
     "Notion",
     "Shopify"
    ]
   },
   {
    "label": "Press him on the second-order cost of a recommendation.",
    "pattern": "He named the right fix on Shopify and Amazon but did not price its downside: merchant adoption on one, defect risk from sampling on the other.",
    "why": "His recommendations will meet an operator who asks what the fix costs, not just what it saves. That defense is untested.",
    "from": [
     "Shopify",
     "Amazon"
    ]
   },
   {
    "label": "Ask him to define a metric for something not yet measured.",
    "pattern": "Every scenario handed him a target metric to move. Choosing what to measure when nothing is defined has not come up.",
    "why": "Standing up measurement for a new initiative is core to the role and is the part of the track he has not reached.",
    "from": []
   }
  ],
  "rehire": [
   {
    "name": "Rachel Nguyen",
    "company": "Amazon, Fulfillment Operations",
    "yes": true,
    "reason": "For defined diagnostic and process work with a reviewer on the final call. The fulfillment analysis was complete and cross-checked. The sampling recommendation needed review before it reached ops leadership.",
    "face": "img/rachel.webp"
   },
   {
    "name": "Marcus Tan",
    "company": "Netflix, Business Strategy",
    "yes": false,
    "reason": "Not yet for an unsupervised strategic mandate. The quantitative work held up, but the recovery call optimized the lower-yield lever, which is the judgment that kind of role turns on. Would consider him for an analyst seat under a senior strategist.",
    "face": "img/marcus.webp"
   }
  ]
 },
 "projects": [
  {
   "id": 1,
   "company": "Notion",
   "domain": "notion.so",
   "title": "Diagnosed Notion's signup funnel and sized the recoverable conversion",
   "brief": "Broke Notion's 5.9% visitor-to-account funnel into steps, isolated signup-start at 26% as the constraint against a ~40% benchmark, and sized the recovery at roughly 33K added accounts a month.",
   "tag": "Growth & Revenue",
   "unlocked": "Funnel and conversion analysis, opportunity sizing.",
   "num": "~33K",
   "numLabel": "added accounts a month, sized as a ceiling",
   "deliverables": [
    "Visitor-to-Signup Funnel Model",
    "Conversion Recovery Recommendation"
   ],
   "signals": [
    "Broke the path into steps before drawing a conclusion",
    "Sized the recovery off the step rates",
    "Left the recommendation at the category level"
   ],
   "quote": "Funnel diagnosis was sound. Recovery sized only as a ceiling, recommendation left general.",
   "verdict": "Meets expectations",
   "summary": "Broke the funnel into steps, identified signup-start at 26% as the constraining step against a roughly 40% benchmark, and ruled out the adjacent steps. Sized the recovery from lifting that step halfway to benchmark and labeled it a ceiling. The recommendation named a direction, simplify the signup step, without a specific change to test.",
   "landed": [
    "Worked the funnel step by step and located the constraint at signup-start rather than reporting the 5.9% headline. The steps around it were ruled out by their conversion rates.",
    "Sized the recovery from the step rates, lifting the 26% step halfway to the 40% benchmark, which nets to roughly 33K added accounts a month at the ceiling."
   ],
   "missed": [
    "The recommendation stayed at the category level, reduce signup friction, with no specific field, step, or change named to test first.",
    "The 33K figure was presented as the only case. It assumes the users nudged into starting signup finish at today's 67% rate, which marginal users often do not, and no likely case was shown beside it."
   ],
   "fits": "An early project, and the pattern that recurs: a sized diagnosis ahead of a thinner recommendation, here paired with an optimistic-only estimate.",
   "tools": [
    {
     "name": "Google Sheets",
     "domain": "sheets.google.com",
     "use": "Step-by-step funnel build, conversion-rate splits, signup-lift sizing against a benchmark step"
    },
    {
     "name": "Google Docs",
     "domain": "docs.google.com",
     "use": "Conversion Recovery Recommendation, written recommendation-first"
    },
    {
     "name": "Claude",
     "domain": "claude.ai",
     "use": "Checking the benchmark assumption and which step was the constraint"
    }
   ],
   "counts": [
    [
     "Funnel steps modeled",
     "4"
    ],
    [
     "Benchmark applied to the weak step",
     "Yes (26% vs 40%)"
    ],
    [
     "Sizing cases provided",
     "1 (ceiling only)"
    ],
    [
     "Revision cycles before sign-off",
     "1"
    ]
   ],
   "reviewer": {
    "name": "Hana Brandt",
    "role": "Growth Analytics Lead",
    "face": "img/hana.webp",
    "text": "The funnel analysis was structured correctly. He split the path into steps, identified signup-start as the constraint at 26% against a roughly 40% benchmark, and ruled out the adjacent steps by their rates. The recovery was sized off those rates rather than guessed, but presented only as a ceiling, with no likely case and no adjustment for marginal users finishing at a lower rate. The recommendation named a direction without a specific change to test. The diagnosis was further along than the recommendation."
   },
   "video": null
  },
  {
   "id": 2,
   "company": "Spotify",
   "domain": "spotify.com",
   "title": "Isolated Spotify's early-churn driver and scoped a $4M recovery",
   "brief": "Segmented first-90-day Premium churn by tenure, isolated low early playlist adoption as the driver using cohort data and 1,100 exit surveys, and scoped the addressable recovery to about $4M of the $11.4M.",
   "tag": "Growth & Revenue",
   "unlocked": "Cohort analysis, LTV/CAC, behavioral segmentation, opportunity sizing.",
   "num": "$4M of $11.4M",
   "numLabel": "churn he scoped as recoverable",
   "deliverables": [
    "Early-Tenure Churn Cohort Analysis",
    "Churn Root-Cause Diagnosis",
    "LTV Impact Model",
    "Subscriber Churn Reduction Proposal"
   ],
   "signals": [
    "Segmented by tenure before drawing a conclusion",
    "Named the behavioral driver specifically",
    "Sized the addressable share rather than the full problem"
   ],
   "quote": "Driver isolated with cohort and survey evidence; recovery scoped to the addressable third; intervention underspecified.",
   "verdict": "Meets expectations",
   "summary": "Segmented churn by tenure and plan, confirmed the rise sat in 0 to 90 day subscribers, and isolated low early playlist adoption as the driver using cohort data and 1,100 exit surveys. Sized the addressable recovery at about $4M, roughly a third of the $11.4M, rather than claiming the full amount back. The retention fix he proposed was directionally right and underspecified.",
   "landed": [
    "Named a behavioral driver rather than dissatisfaction: early subscribers with few listening sessions in their final 30 days and no personalised-playlist engagement, with the cohort share quantified.",
    "Scoped the recovery to the share attributable to the driver, about $4M of the $11.4M, instead of assuming the full elevated churn was addressable. The cost build used the $18 re-acquisition cost net of the 22% re-subscription rate."
   ],
   "missed": [
    "The proposed day-7 playlist prompt was underspecified: no trigger logic, no content definition, and no contrast with the nudge already shipped. A prior experiment in the materials bore on it and was not used."
   ],
   "fits": "His strongest mode: a framed, data-rich brief where the diagnosis and the sizing hold. The recommendation mechanism is the thinner half, as on Notion and Shopify.",
   "tools": [
    {
     "name": "Google Sheets",
     "domain": "sheets.google.com",
     "use": "Tenure-bucket and plan churn pivots, monthly trend, LTV recovery model at 5.8% versus 3.5%"
    },
    {
     "name": "Google Docs",
     "domain": "docs.google.com",
     "use": "Churn Root-Cause Diagnosis, written recommendation-first"
    },
    {
     "name": "Claude",
     "domain": "claude.ai",
     "use": "Clustering 1,100 exit-survey responses, testing which signal separated early churners"
    }
   ],
   "counts": [
    [
     "Tenure buckets segmented",
     "4"
    ],
    [
     "Churn-driver hypotheses evaluated",
     "5"
    ],
    [
     "Exit-survey responses reviewed",
     "1,100"
    ],
    [
     "Recovery scoped to addressable share",
     "Yes (~$4M of $11.4M)"
    ],
    [
     "Revision cycles before sign-off",
     "2"
    ]
   ],
   "reviewer": {
    "name": "James Okafor",
    "role": "Head of Subscriber Growth",
    "face": "img/james.webp",
    "text": "He isolated low early playlist adoption as the driver using cohort segmentation and 1,100 exit surveys, rather than stopping at a general dissatisfaction read. The recovery was scoped to the share the driver explains, about $4M of the $11.4M, which is the right instinct and avoids overclaiming. The retention proposal was the weak part: a day-7 prompt with no trigger logic or content defined, and it did not use a prior experiment in the materials that was directly relevant."
   },
   "video": null
  },
  {
   "id": 3,
   "company": "Shopify",
   "domain": "shopify.com",
   "title": "Sized Shopify's copywriting-ticket cost and proposed a deflection fix",
   "brief": "Derived the ~$13M annual cost of copywriting support tickets from volume and per-ticket cost, and recommended an in-editor AI copy assistant targeting a 12%-to-6% reduction, about $6.5M.",
   "tag": "Operations",
   "unlocked": "Ticket categorization, cost-driver analysis, automation-opportunity identification.",
   "num": "$6.5M",
   "numLabel": "a year, if copywriting tickets halve from 12% to 6%",
   "deliverables": [
    "Support Ticket Category Analysis",
    "Copywriting Demand Root-Cause",
    "Support Cost Model",
    "Customer Support Cost Reduction Proposal"
   ],
   "signals": [
    "Built the cost from volume and rate, not the brief's figure",
    "Framed the target as halving, not eliminating",
    "Did not price merchant adoption of the fix"
   ],
   "quote": "Cost model derived from the data; savings rested on an adoption rate that was never examined.",
   "verdict": "Meets expectations",
   "summary": "Categorised tickets, derived the roughly $13M cost from volume and per-ticket cost rather than the brief, and recommended an in-editor AI copy assistant targeting a 12% to 6% cut, about $6.5M. The recommendation rested on a merchant-adoption and deflection assumption he did not examine.",
   "landed": [
    "Built the cost from ticket volume and per-ticket cost, and showed the copywriting share trend rather than a single figure.",
    "Framed the target as halving demand, not eliminating it, which kept the $6.5M claim bounded."
   ],
   "missed": [
    "The savings assumed merchants would adopt the assistant and that it would deflect tickets rather than redirect them to other categories. Neither was sized; no adoption range was offered."
   ],
   "fits": "Cost diagnosis ahead of a recommendation that does not yet survive its own adoption question, the same shape as Notion.",
   "tools": [
    {
     "name": "Google Sheets",
     "domain": "sheets.google.com",
     "use": "Ticket-category breakdown, copywriting-share trend, annual cost model from per-ticket economics"
    },
    {
     "name": "Google Docs",
     "domain": "docs.google.com",
     "use": "Copywriting Demand Root-Cause, written recommendation-first"
    },
    {
     "name": "Claude",
     "domain": "claude.ai",
     "use": "Clustering copywriting tickets into request types to name the dominant reason merchants ask for help"
    }
   ],
   "counts": [
    [
     "Ticket categories analyzed",
     "9"
    ],
    [
     "Request-type clusters formed",
     "4"
    ],
    [
     "Adoption scenarios modeled",
     "0"
    ],
    [
     "Revision cycles before sign-off",
     "2"
    ]
   ],
   "reviewer": {
    "name": "Daniel Cho",
    "role": "Director of Merchant Operations",
    "face": "img/daniel.webp",
    "text": "The cost model was built from volume and rate rather than the figure in the brief, and the target was framed as halving demand, not eliminating it, which kept the number honest. The recommended in-editor assistant rested on two unexamined assumptions: that merchants would adopt it, and that it would deflect tickets rather than shift them to another category. Neither was sized, so the $6.5M is a ceiling resting on adoption nobody has tested."
   },
   "video": null
  },
  {
   "id": 4,
   "company": "Netflix",
   "domain": "netflix.com",
   "title": "Decomposed Netflix's revenue slowdown into subscriber and ARPU drivers",
   "brief": "Split Netflix's 14%-to-6% growth decline into subscriber and ARPU contributions across eight quarters, attributed most of it to slowing regional subscriber adds, and modeled the path back toward 10% as a range.",
   "tag": "Growth & Revenue",
   "unlocked": "Revenue decomposition, multi-driver diagnosis, sensitivity modeling.",
   "num": "14% to 6%",
   "numLabel": "growth slowdown split into subscribers and ARPU",
   "deliverables": [
    "Revenue Driver Breakdown (8 quarters)",
    "Slowdown Diagnosis",
    "Growth Recovery Model",
    "Revenue Growth Recovery Proposal"
   ],
   "signals": [
    "Separated the subscriber effect from the ARPU effect",
    "Modeled each lever independently and gave a range",
    "Directed the recovery at the lower-yield lever"
   ],
   "quote": "Decomposition separated the drivers correctly; the recovery aimed at the lower-yield lever.",
   "verdict": "Meets expectations",
   "summary": "Separated the growth decline into subscriber and ARPU contributions across eight quarters, attributed most of the deceleration to slowing subscriber adds in two regions with ARPU flat, and modeled the path back toward 10% growth as a range on the supplied base. The recovery directed effort at acquiring subscribers in those same low-ARPU regions, which is defensible but the lower-yield lever for this business.",
   "landed": [
    "Separated the subscriber effect from the ARPU effect rather than treating revenue as one line, and put most of the deceleration on regional subscriber adds, not price.",
    "Modeled the three levers independently and expressed the recovery as a range with the swing assumption flagged, not a single figure."
   ],
   "missed": [
    "The recovery leaned on subscriber acquisition in low-ARPU regions, where each added subscriber yields less than an ARPU move. He optimized the driver that fell rather than the lever with the most revenue per subscriber, which is where this business has found recent growth."
   ],
   "fits": "The decomposition is the clearest evidence of his analytical ceiling on a framed quantitative brief. The lever choice is the recommendation-side gap again, here as a strategy judgment rather than missing detail.",
   "tools": [
    {
     "name": "Google Sheets",
     "domain": "sheets.google.com",
     "use": "Revenue equals subscribers times ARPU decomposition across 8 quarters, contribution attribution, regional subscriber splits, recovery range"
    },
    {
     "name": "Google Docs",
     "domain": "docs.google.com",
     "use": "Slowdown Diagnosis, written recommendation-first"
    },
    {
     "name": "Claude",
     "domain": "claude.ai",
     "use": "Testing whether the slowdown sat in subscribers or ARPU before modeling, surfacing the regional split"
    }
   ],
   "counts": [
    [
     "Drivers decomposed",
     "2 (subscribers, ARPU)"
    ],
    [
     "Quarters analyzed",
     "8"
    ],
    [
     "Levers modeled independently",
     "3"
    ],
    [
     "Recovery expressed as range vs point",
     "Range"
    ],
    [
     "Revision cycles before sign-off",
     "1"
    ]
   ],
   "reviewer": {
    "name": "Marcus Tan",
    "role": "Director of Business Strategy",
    "face": "img/marcus.webp",
    "text": "The decomposition was the strongest part of the submission. He separated subscriber and ARPU contributions across eight quarters and attributed most of the deceleration to regional subscriber adds, with ARPU flat, and gave the recovery as a range rather than a point. The recovery proposal is where the judgment slipped: he directed effort at acquiring more subscribers in the regions that slowed, which are low-ARPU, when a subscriber there is worth less than an ARPU move almost anywhere. Strong diagnosis, a debatable strategic call."
   },
   "video": "2:31"
  },
  {
   "id": 5,
   "company": "Slack",
   "domain": "slack.com",
   "title": "Read Slack's onboarding experiment and scoped the rollout to where it landed",
   "brief": "Confirmed Slack's guided-setup activation lift (+3.6 points, significant) was concentrated in teams of 2 to 10, treated the underpowered opt-out guardrail as unresolved, and recommended a scoped rollout to small teams.",
   "tag": "Growth & Revenue",
   "unlocked": "A/B interpretation, statistical significance, guardrail metrics, decision under uncertainty.",
   "num": "+3.6 points",
   "numLabel": "activation lift, all of it in teams of 2 to 10",
   "deliverables": [
    "Onboarding Experiment Readout",
    "Scale-or-Revert Decision Memo"
   ],
   "signals": [
    "Confirmed and segmented the lift before trusting it",
    "Treated a non-significant guardrail as unresolved, not clear",
    "Put the recommendation below the readout in the memo"
   ],
   "quote": "Read the experiment and the guardrail correctly; recommendation buried in the memo.",
   "verdict": "Meets expectations",
   "summary": "Treatment activation, defined as 3+ members and a first message within 7 days, was 44.8% against 41.2% control, a 3.6-point lift significant at this sample and concentrated in teams of 2 to 10, flat for solo and large workspaces. The guardrail, 7-day notification opt-out, moved from 6.1% to 6.8%, not significant and on an underpowered test. He recommended scaling to small teams and monitoring opt-out. The memo opened with experiment design rather than the recommendation.",
   "landed": [
    "Confirmed significance and segmented the lift, finding it concentrated in small teams and flat elsewhere, which is what scoped the rollout to small teams rather than all workspaces.",
    "Did not read a non-significant guardrail as no effect. He flagged the test as underpowered for a small opt-out increase and recommended monitoring with a stopping rule rather than dismissing it."
   ],
   "missed": [
    "The decision memo opened with the experiment design and placed the recommendation several paragraphs in. For a decision memo the call belongs first."
   ],
   "fits": "A counter-case to his usual pattern: here the judgment and the decision were the strong part and the gap was the write-up structure, not recommendation rigor.",
   "tools": [
    {
     "name": "Google Sheets",
     "domain": "sheets.google.com",
     "use": "Treatment-versus-control activation, significance check, segment splits, guardrail comparison"
    },
    {
     "name": "Google Docs",
     "domain": "docs.google.com",
     "use": "Scale-or-Revert Decision Memo, written recommendation-first"
    },
    {
     "name": "Claude",
     "domain": "claude.ai",
     "use": "Checking the significance read and framing the underpowered-guardrail logic"
    }
   ],
   "counts": [
    [
     "Primary and guardrail metrics evaluated",
     "2"
    ],
    [
     "Segments tested for heterogeneity",
     "3"
    ],
    [
     "Recommendation position in the memo",
     "Paragraph 4"
    ],
    [
     "Revision cycles before sign-off",
     "1"
    ]
   ],
   "reviewer": {
    "name": "Noah Feldman",
    "role": "Product Analytics Manager",
    "face": "img/noah.webp",
    "text": "He confirmed the activation lift was significant and broke it out by segment, finding the gain lives in small teams and is flat for solo and large workspaces, which is what scoped his rollout recommendation. On the guardrail he did not treat a non-significant opt-out change as no effect; he called the test underpowered for a small harm and asked to monitor it with a stopping rule. The weakness was structural: the decision memo led with experiment design, and the actual recommendation sat in the fourth paragraph."
   },
   "video": null
  },
  {
   "id": 6,
   "company": "Airbnb",
   "domain": "airbnb.com",
   "title": "Traced Airbnb's host cancellations to calendar-sync conflicts",
   "brief": "Segmented rising host cancellations by reason code and tenure, isolated calendar-sync conflicts among multi-listing hosts as the lead driver, and matched an operational fix to it.",
   "tag": "Operations",
   "unlocked": "Marketplace root-cause diagnosis, behavioral segmentation in an operations context.",
   "num": "$3M",
   "numLabel": "savings modeled on cancellations falling from 14% to 10%",
   "deliverables": [
    "Host Cancellation Trend Analysis",
    "Cancellation Reason-Code Root-Cause",
    "Cancellation Cost Model",
    "Host Cancellation Reduction Proposal"
   ],
   "signals": [
    "Segmented past raw reason codes to a host sub-segment",
    "Tied the fix to the named driver",
    "Did not isolate the share the fix would address"
   ],
   "quote": "Driver found via segmentation; the $3M savings did not isolate what the fix actually addresses.",
   "verdict": "Meets expectations",
   "summary": "Segmented cancellations by reason code and host tenure and isolated calendar-sync conflicts among multi-listing hosts as the lead driver, then tied the fix to it. The cost model was the weaker component: the $3M savings carried the per-cancellation cost without isolating what share of cancellations the calendar fix would actually remove.",
   "landed": [
    "Segmented past the raw reason codes to find the calendar-sync problem concentrated in multi-listing hosts, which is the actionable cut rather than the headline reason.",
    "Tied the operational fix to that specific driver rather than proposing a blanket policy."
   ],
   "missed": [
    "The $3M assumes the move from 14% to 10% is fully addressed by the calendar fix. Cancellations have several causes, and he did not size the share the fix actually removes, so the savings is overstated."
   ],
   "fits": "Here the driver work led and the financial model trailed, the reverse of Notion and Shopify. Across the set, one of the two halves leads and the other lags rather than both landing evenly.",
   "tools": [
    {
     "name": "Google Sheets",
     "domain": "sheets.google.com",
     "use": "Cancellation-rate trend, reason-code and tenure segmentation, cost rollup"
    },
    {
     "name": "Google Docs",
     "domain": "docs.google.com",
     "use": "Cancellation Reason-Code Root-Cause, written recommendation-first"
    },
    {
     "name": "Claude",
     "domain": "claude.ai",
     "use": "Testing which reason-code and host-segment combination explained the rise"
    }
   ],
   "counts": [
    [
     "Segmentation axes used",
     "2 (reason code, host tenure)"
    ],
    [
     "Reason-code categories analyzed",
     "4"
    ],
    [
     "Addressable share isolated in the cost model",
     "No"
    ],
    [
     "Revision cycles before sign-off",
     "2"
    ]
   ],
   "reviewer": {
    "name": "Sophia Martinez",
    "role": "Director of Marketplace Operations",
    "face": "img/sophia.webp",
    "text": "He segmented by reason code and host tenure rather than acting on the raw codes, and found the calendar-sync problem concentrated in multi-listing hosts, then matched the fix to that driver. The cost model was the weak point: the $3M savings assumes the full move from 14% to 10% comes from the calendar fix, when cancellations have several causes. He did not isolate the share the fix removes, so the savings reads high."
   },
   "video": null
  },
  {
   "id": 7,
   "company": "Amazon",
   "domain": "amazon.com",
   "title": "Mapped Amazon's fulfillment delays to the quality-check bottleneck",
   "brief": "Mapped the five-stage pick-to-ship process across six fulfillment centers, identified the quality-check step as the bottleneck after the protocol change, and modeled the dispatch-cost recovery at three late-dispatch rates.",
   "tag": "Operations",
   "unlocked": "Process mapping, bottleneck identification, throughput and time-based KPIs, sensitivity under operational constraints.",
   "num": "$6M",
   "numLabel": "back at a 6% late-dispatch rate, $3.6M at 8%",
   "deliverables": [
    "Pick-to-Ship Process Map and Cycle-Time Overview",
    "Bottleneck Diagnosis",
    "Dispatch Cost Model",
    "Fulfillment Delay Reduction Proposal"
   ],
   "signals": [
    "Mapped all five stages before naming the bottleneck",
    "Ruled out the competing cause explicitly",
    "Did not price the defect risk of the sampling fix"
   ],
   "quote": "Widest-scope work in the block; sampling recommendation left its defect-risk tradeoff unpriced.",
   "verdict": "Meets expectations",
   "summary": "Mapped all five stages, identified the quality-check step as the bottleneck after the protocol change by reconciling cycle-time data with floor notes, and ruled out the dispatch-staging change as the primary cause. Modeled cost at 11%, 8%, and 6% late dispatch, so the case held under a partial fix: returning to 6% recovers about $6M, an 8% outcome about $3.6M. The recommendation to move quality check to 30% sampling did not price the defect risk it introduces.",
   "landed": [
    "Mapped all five stages and showed which one grew rather than reporting the 4.2 to 6.1 hour headline. The quality-check step carried most of the increase after the new protocol.",
    "Reconciled the cycle-time data with the floor notes and ruled out the dispatch-staging change as the primary cause rather than leaving two candidates open.",
    "Modeled cost at three rates, so the recovery survives a partial fix: about $6M back at 6%, about $3.6M at 8%."
   ],
   "missed": [
    "Moving quality check from full inspection to 30% sampling raises defect and customer-impact risk, the first objection the recommendation would draw in review, and he did not price or bound it."
   ],
   "fits": "The widest-scope work in the block, and it holds up on the analytical side: five stages, a ruled-out alternative, a three-rate sensitivity case. The unpriced risk on the recommendation is the same recommendation-side gap, on the most consequential fix.",
   "tools": [
    {
     "name": "Google Sheets",
     "domain": "sheets.google.com",
     "use": "Stage-level cycle-time pivots, process map with per-stage share, dispatch cost model at 11%, 8%, and 6%"
    },
    {
     "name": "Google Docs",
     "domain": "docs.google.com",
     "use": "Bottleneck Diagnosis, written recommendation-first"
    },
    {
     "name": "Claude",
     "domain": "claude.ai",
     "use": "Pulling bottleneck signals from unstructured floor notes, testing the quality-check cause against the dispatch-staging alternative"
    }
   ],
   "counts": [
    [
     "Process stages mapped",
     "5"
    ],
    [
     "Bottleneck candidates evaluated",
     "2"
    ],
    [
     "Cost scenarios modeled",
     "3 (11%, 8%, 6%)"
    ],
    [
     "Downside of the recommendation priced",
     "No"
    ],
    [
     "Revision cycles before sign-off",
     "2"
    ]
   ],
   "reviewer": {
    "name": "Rachel Nguyen",
    "role": "Senior Manager Fulfillment Operations",
    "face": "img/rachel.webp",
    "text": "The widest-scope submission in the set. He mapped every stage, identified the quality-check step as where the time went after the protocol change, and confirmed it by reconciling cycle-time data with the floor notes instead of trusting one source. He also ruled out the dispatch-staging change rather than hedging between two causes, and modeled cost at three rates so the recovery holds under a partial fix. The gap is on the recommendation: moving quality check to 30% sampling raises defect risk, and he did not price or bound that, which is the first question it draws in review."
   },
   "video": "2:48"
  }
 ],
 "skills": [
  {
   "cat": "Analysis & Modeling",
   "tag": "Core",
   "items": [
    {
     "name": "Funnel and conversion analysis",
     "from": [
      "Notion"
     ]
    },
    {
     "name": "Cohort analysis",
     "from": [
      "Spotify",
      "Netflix"
     ]
    },
    {
     "name": "Churn and retention analysis",
     "from": [
      "Spotify"
     ]
    },
    {
     "name": "Revenue decomposition",
     "from": [
      "Netflix"
     ]
    },
    {
     "name": "Unit economics (LTV/CAC)",
     "from": [
      "Spotify"
     ]
    },
    {
     "name": "Opportunity sizing",
     "from": [
      "Spotify",
      "Shopify",
      "Netflix",
      "Amazon"
     ]
    },
    {
     "name": "Sensitivity modeling",
     "from": [
      "Netflix",
      "Amazon"
     ]
    }
   ]
  },
  {
   "cat": "Operations & Process",
   "tag": "Core",
   "items": [
    {
     "name": "Process mapping",
     "from": [
      "Amazon"
     ]
    },
    {
     "name": "Bottleneck identification",
     "from": [
      "Amazon"
     ]
    },
    {
     "name": "Cost-driver analysis",
     "from": [
      "Shopify",
      "Airbnb",
      "Amazon"
     ]
    },
    {
     "name": "Root-cause diagnosis",
     "from": [
      "Spotify",
      "Airbnb",
      "Amazon"
     ]
    },
    {
     "name": "Throughput and time-based KPIs",
     "from": [
      "Amazon"
     ]
    }
   ]
  },
  {
   "cat": "Experimentation & Decision",
   "tag": "Applied",
   "items": [
    {
     "name": "A/B interpretation",
     "from": [
      "Slack"
     ]
    },
    {
     "name": "Statistical significance",
     "from": [
      "Slack"
     ]
    },
    {
     "name": "Guardrail metrics",
     "from": [
      "Slack"
     ]
    },
    {
     "name": "Decision under uncertainty",
     "from": [
      "Slack"
     ]
    }
   ]
  }
 ],
 "comms": [
  {
   "name": "Written communication",
   "status": "demonstrated",
   "summary": "Opens written work with the recommendation and the number.",
   "note": "Across 7 manager reviews of submitted work, 6 opened with the recommendation; the Slack memo opened with experiment design instead.",
   "from": [
    "Spotify",
    "Netflix",
    "Amazon"
   ]
  },
  {
   "name": "Quantitative defense",
   "status": "demonstrated",
   "summary": "States assumptions so the number can be checked.",
   "note": "6 of 7 models stated assumptions inline; the Amazon model carried a three-rate sensitivity range. No model was submitted with an unstated key assumption.",
   "from": [
    "Netflix",
    "Amazon"
   ]
  },
  {
   "name": "Verbal presentation",
   "status": "demonstrated",
   "summary": "Presents findings to the project team at the close of each scenario.",
   "note": "Reviews across the scenarios credited a clear structure and a recommendation-first open. Handling of unscripted follow-up questions was rated developing.",
   "from": [
    "Netflix",
    "Amazon"
   ]
  },
  {
   "name": "Stakeholder breadth and live defense",
   "status": "not-yet",
   "summary": "Each brief had a single named decision-maker. Aligning multiple or conflicting stakeholders, and defending a contested call under real-time challenge beyond prepared-presentation Q&A, were not tested.",
   "note": "Not observed in the seven completed scenarios; the track introduces multi-stakeholder and live-defense scenarios later.",
   "from": []
  }
 ],
 "patterns": [
  {
   "name": "Sizes the opportunity before proposing a fix",
   "summary": "Quantifies the prize before naming an action.",
   "evidence": "Sized the opportunity in dollars or the target metric before recommending in 6 of 7 projects. On Notion he sized it in signups only.",
   "from": [
    "Spotify",
    "Netflix",
    "Amazon"
   ]
  },
  {
   "name": "Commits to one driver with evidence",
   "summary": "Names a single driver from segmentation rather than a general conclusion.",
   "evidence": "Named one driver in 6 of 7 diagnoses. On Amazon he ruled out the dispatch-staging change before settling on the quality-check step.",
   "from": [
    "Spotify",
    "Airbnb",
    "Amazon"
   ]
  },
  {
   "name": "Checks data against qualitative evidence",
   "summary": "Reconciles the numbers with notes or survey text before committing.",
   "evidence": "In 3 of 7 projects he confirmed the quantitative finding against unstructured text, including the Amazon floor notes and the Spotify exit surveys.",
   "from": [
    "Spotify",
    "Amazon"
   ]
  },
  {
   "name": "One half leads, the other lags",
   "summary": "On most projects either the diagnosis or the recommendation-and-cost work is further along, rather than both landing evenly.",
   "evidence": "Recommendation lagged a stronger diagnosis on Notion, Shopify, and Amazon; the cost model lagged a stronger driver on Airbnb. The two came together most evenly on Netflix and Spotify.",
   "from": [
    "Notion",
    "Shopify",
    "Airbnb",
    "Amazon"
   ]
  }
 ],
 "tools": [
  {
   "name": "Google Sheets",
   "domain": "sheets.google.com",
   "count": 7,
   "groups": [
    {
     "name": "Quantitative modeling",
     "uses": [
      "Pivot tables segmenting churn by tenure bucket and plan",
      "Decomposition formulas splitting revenue into subscriber and ARPU terms",
      "Stage-by-stage cycle-time pivots across the process map"
     ]
    },
    {
     "name": "Cost and opportunity sizing",
     "uses": [
      "Cost built up from per-unit economics (volume times rate)",
      "Addressable-recovery formula netting re-acquisition cost against re-subscription rate",
      "Benchmark-gap sizing applied to the weakest funnel step"
     ]
    },
    {
     "name": "Sensitivity scenarios",
     "uses": [
      "Data table flexing the late-dispatch rate across three cases",
      "Lever-by-lever recovery range with the swing assumption isolated"
     ]
    }
   ]
  },
  {
   "name": "Claude",
   "domain": "claude.ai",
   "count": 7,
   "groups": [
    {
     "name": "Hypothesis exploration",
     "uses": [
      "Prompting to test which segment drove a change before modeling",
      "Pressure-testing whether a slowdown sat in volume or in rate"
     ]
    },
    {
     "name": "Qualitative synthesis",
     "uses": [
      "Clustering 1,100 exit-survey responses into themes",
      "Pulling bottleneck signals out of unstructured floor notes"
     ]
    },
    {
     "name": "Draft review",
     "uses": [
      "Flagging unsupported claims in the draft before submission",
      "Checking the written recommendation against the model figures"
     ]
    }
   ]
  },
  {
   "name": "Google Docs",
   "domain": "docs.google.com",
   "count": 7,
   "groups": [
    {
     "name": "Recommendation memos",
     "uses": [
      "Recommendation-first structure with the call in the opening line",
      "Two-section proposal and a scale-or-revert decision memo"
     ]
    }
   ]
  }
 ],
 "experience": [
  {
   "org": "Wealthsimple",
   "domain": "wealthsimple.com",
   "type": "Internship",
   "place": "Toronto, Canada · Hybrid",
   "title": "Data & Analytics Intern",
   "period": "May 2024 to Aug 2024",
   "text": "Supported the growth analytics team with funnel reporting and weekly KPI dashboards for the self-serve onboarding funnel.",
   "skills": [
    "Funnel analysis",
    "Google Sheets",
    "SQL (basic)"
   ]
  },
  {
   "org": "TMU Analytics Society",
   "domain": "torontomu.ca",
   "type": "Part-time",
   "place": "Toronto, Canada · On-site",
   "title": "Case Team Lead",
   "period": "Sep 2023 to Apr 2024",
   "text": "Led a four-person case team to two regional finals and owned the quantitative modeling sections of each submission.",
   "skills": [
    "Financial modeling",
    "Presentation"
   ]
  }
 ],
 "school": [
  {
   "name": "Toronto Metropolitan University",
   "degree": "Bachelor of Commerce, Business Management",
   "period": "Sep 2021 to Apr 2025",
   "gpa": "3.4/4.0",
   "domain": "torontomu.ca"
  }
 ],
 "certs": [
  {
   "title": "Google Data Analytics Professional Certificate",
   "by": "Google",
   "date": "Aug 2024",
   "domain": "google.com"
  },
  {
   "title": "SQL for Data Analysis",
   "by": "DataCamp",
   "date": "Jun 2024",
   "domain": "datacamp.com"
  }
 ],
 "next": [
  {
   "label": "Measurement system design",
   "when": "Opens at project 8",
   "text": "Design a KPI architecture for a product team. Definitions, owners, review cadence."
  },
  {
   "label": "Open-ended strategy",
   "when": "Later on the track",
   "text": "Structure an ambiguous strategy question without a supplied dataset or framing."
  },
  {
   "label": "AI workflows",
   "when": "Opens at project 12",
   "text": "Evaluate where an AI-enabled workflow helps a team and where it breaks."
  }
 ]
};

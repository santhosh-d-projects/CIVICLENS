/**
 * CivicLens — Government Yojanas & Schemes Dataset.
 * Accurate, verified information from official portals (myScheme, Central Ministries, Seva Sindhu Karnataka).
 */

export const SCHEME_CATEGORIES = [
  { id: 'ALL', label: 'All Categories', icon: 'Sparkles' },
  { id: 'Agriculture & Farmers', label: 'Agriculture & Farmers', icon: 'Wheat' },
  { id: 'Jobs & Employment', label: 'Jobs & Employment', icon: 'Briefcase' },
  { id: 'Education & Scholarships', label: 'Education & Scholarships', icon: 'GraduationCap' },
  { id: 'Loans & Financial Support', label: 'Loans & Financial Support', icon: 'Landmark' },
  { id: 'Housing', label: 'Housing', icon: 'Home' },
  { id: 'Health', label: 'Health', icon: 'HeartPulse' },
  { id: 'Women & Child', label: 'Women & Child', icon: 'UserCheck' },
  { id: 'Food & Nutrition', label: 'Food & Nutrition', icon: 'Utensils' },
  { id: 'Electricity & Utilities', label: 'Electricity & Utilities', icon: 'Zap' },
  { id: 'Transport', label: 'Transport', icon: 'Bus' },
  { id: 'Social Security', label: 'Social Security', icon: 'Shield' },
];

export const CITIZEN_PERSONAS = [
  { id: 'farmer', label: '🌾 Farmer / Agriculture', category: 'Agriculture & Farmers', hint: 'Income support & farm credit' },
  { id: 'woman', label: '👩 Woman / Homemaker', category: 'Women & Child', hint: 'Financial aid & free transport' },
  { id: 'jobseeker', label: '💼 Job Seeker / Youth', category: 'Jobs & Employment', hint: 'Stipends & skill training' },
  { id: 'student', label: '🎓 Student', category: 'Education & Scholarships', hint: 'Scholarships & nutrition' },
  { id: 'entrepreneur', label: '🧑‍💻 Small Business / Vendor', category: 'Loans & Financial Support', hint: 'Collateral-free loans' },
  { id: 'senior', label: '👴 Senior Citizen', category: 'Social Security', hint: 'Pensions & free healthcare' },
];

export const SCHEMES_DATA = [
  // ── Central Government Schemes ──
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    shortName: 'PM-KISAN',
    governmentLevel: 'CENTRAL',
    state: 'All India',
    department: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Agriculture & Farmers',
    targetGroup: 'Small & Marginal Farmers, Landholding Farmer Families',
    summary: 'Direct income support of ₹6,000 per year in three equal instalments of ₹2,000 to all eligible landholding farmer families.',
    featured: true,
    badgeText: 'Central Direct Benefit Transfer',
    benefits: [
      '₹6,000 per year financial benefit transferred directly into beneficiary bank accounts',
      'Disbursed in 3 equal instalments of ₹2,000 every four months',
      '100% centrally funded Direct Benefit Transfer (DBT) via Aadhaar-linked NPCI gateway',
      'Direct credit without middlemen, accessible to over 11 Crore farmer families across India'
    ],
    eligibility: [
      'All landholding farmer families who own cultivable agricultural land in their names',
      'Both husband, wife, and minor children constitute a farmer family unit',
      'Excluded: Institutional landholders, former/present constitutional post holders, serving/retired government employees, and income tax payers'
    ],
    documents: [
      'Aadhaar Card of the applicant farmer',
      'Proof of land ownership (Khata / RoR / Patta / Land Registry records)',
      'Aadhaar-linked active Bank Account with DBT enabled',
      'Active mobile number linked to Aadhaar for OTP verification'
    ],
    howToApply: [
      'Visit the official PM-KISAN portal (pmkisan.gov.in) or visit your nearest Common Service Centre (CSC).',
      'Click on "New Farmer Registration" under the Farmers Corner section.',
      'Enter your Aadhaar number, select your State, and submit the OTP sent to your registered mobile.',
      'Fill in land details (Survey number, Khasra, Area in Hectare) and bank details.',
      'Submit the application. State Nodal Officers verify land records and initiate disbursement.'
    ],
    officialUrl: 'https://pmkisan.gov.in/',
    source: 'Ministry of Agriculture & Farmers Welfare, Government of India',
    lastVerified: 'August 2026'
  },
  {
    id: 'pm-mudra-yojana',
    name: 'Pradhan Mantri Mudra Yojana (PMMY)',
    shortName: 'PM MUDRA Yojana',
    governmentLevel: 'CENTRAL',
    state: 'All India',
    department: 'Department of Financial Services, Ministry of Finance',
    category: 'Loans & Financial Support',
    targetGroup: 'Micro & Small Business Owners, Artisans, Traders, Entrepreneurs',
    summary: 'Collateral-free institutional micro-credit loans up to ₹10 Lakh to non-corporate, non-farm small/micro enterprises.',
    featured: true,
    badgeText: 'Collateral-Free Business Credit',
    benefits: [
      'Shishu Category: Loans up to ₹50,000 for budding micro-entrepreneurs',
      'Kishore Category: Loans from ₹50,000 up to ₹5,00,000 for expanding businesses',
      'Tarun Category: Loans from ₹5,00,000 up to ₹10,00,000 (extended up to ₹20 Lakh in Budget 2024)',
      'Zero collateral or third-party guarantee required; nominal processing fees'
    ],
    eligibility: [
      'Any Indian citizen with a feasible business plan for a non-farm income-generating activity',
      'Applicable for manufacturing, processing, trading, allied agriculture activities, and service sector units',
      'Borrower should not be a defaulter to any bank or financial institution'
    ],
    documents: [
      'Identity Proof (Aadhaar Card / Voter ID / PAN Card)',
      'Residence Proof (Electricity Bill / Aadhaar / Voter ID)',
      'Proof of Business (Business registration, licenses, Udyam registration if existing)',
      'Bank Account Statement for past 6 months',
      'Quotation / Price list for machinery or items to be purchased'
    ],
    howToApply: [
      'Apply online through the official JanSamarth portal (jansamarth.in) or Udyamimitra portal (udyamimitra.in).',
      'Alternatively, approach any Commercial Bank, Regional Rural Bank (RRB), Small Finance Bank (SFB), or MFI.',
      'Submit the Mudra Loan Application Form along with project quotation and KYC documents.',
      'Bank assesses the proposal and sanctions the loan with Mudra Debit Card.'
    ],
    officialUrl: 'https://www.mudra.org.in/',
    source: 'Department of Financial Services, Ministry of Finance, Govt of India',
    lastVerified: 'August 2026'
  },
  {
    id: 'ayushman-bharat-pmjay',
    name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    shortName: 'Ayushman Bharat (PM-JAY)',
    governmentLevel: 'CENTRAL',
    state: 'All India',
    department: 'National Health Authority, Ministry of Health and Family Welfare',
    category: 'Health',
    targetGroup: 'Low-income families, BPL households, Senior Citizens aged 70+',
    summary: 'World’s largest government health assurance scheme providing ₹5 Lakh per family per year for secondary and tertiary care hospitalization.',
    featured: false,
    badgeText: '₹5 Lakh Health Assurance',
    benefits: [
      'Health insurance cover of ₹5,00,000 per family per year on a family floater basis',
      'Cashless and paperless treatment at over 29,000 empaneled public and private hospitals across India',
      'Covers 3 days of pre-hospitalization and 15 days of post-hospitalization expenses, medicines, and diagnostics',
      'All senior citizens aged 70 and above eligible for Ayushman Vay Vandana card with distinct top-up cover'
    ],
    eligibility: [
      'Households identified based on SECC 2011 deprivation criteria & active RSBY records',
      'All Indian citizens aged 70 years and older irrespective of income status',
      'No restriction on family size, age, or gender'
    ],
    documents: [
      'Aadhaar Card / Government Photo ID',
      'Ration Card / Family ID proof',
      'Active mobile number'
    ],
    howToApply: [
      'Check your eligibility on beneficiary.nha.gov.in or mera.pmjay.gov.in portal or via Ayushman App.',
      'Visit any Empaneled Health Care Provider (EHCP) hospital or Common Service Centre (CSC).',
      'Present Aadhaar and complete biometric / OTP e-KYC with the Ayushman Mitra desk.',
      'Download and print your personalized Ayushman Golden Card.'
    ],
    officialUrl: 'https://pmjay.gov.in/',
    source: 'National Health Authority (NHA), Govt of India',
    lastVerified: 'August 2026'
  },
  {
    id: 'pm-awas-yojana',
    name: 'Pradhan Mantri Awas Yojana (PMAY - Urban & Gramin)',
    shortName: 'PM Awas Yojana',
    governmentLevel: 'CENTRAL',
    state: 'All India',
    department: 'Ministry of Housing and Urban Affairs / Ministry of Rural Development',
    category: 'Housing',
    targetGroup: 'EWS, LIG households, Rural homeless & kutcha house dwellers',
    summary: 'Housing for All mission providing financial subsidies and grants to construct permanent, all-weather pucca houses.',
    featured: false,
    badgeText: 'Pucca Housing Assistance',
    benefits: [
      'PMAY-Gramin: Direct financial assistance of ₹1.20 Lakh (plain areas) to ₹1.30 Lakh (hilly/difficult areas) directly into bank account',
      'PMAY-Urban: Interest subsidy up to 6.5% under Credit Linked Subsidy Scheme (CLSS) on home loans',
      'Mandatory basic amenities integrated: toilet construction, Jal Jeevan tap water, Saubhagya power, and Ujjwala LPG'
    ],
    eligibility: [
      'Beneficiary family must not own a pucca house in their name or in the name of any family member across India',
      'Urban: EWS (annual income up to ₹3L) and LIG (income ₹3L-₹6L)',
      'Rural: Households verified under SECC 2011 housing deprivation and Awas+ list'
    ],
    documents: [
      'Aadhaar Card of all family members',
      'Income Certificate / BPL Card',
      'Land ownership documents or title deed',
      'Aadhaar-linked Bank Account details'
    ],
    howToApply: [
      'For PMAY-Urban: Apply online via pmaymis.gov.in under Citizen Assessment or visit a CSC.',
      'For PMAY-Gramin: Registration is coordinated directly via Gram Panchayat and verified using AwasApp mobile portal.',
      'Geo-tagging of construction stages triggers milestone-based instalment payments directly to bank.'
    ],
    officialUrl: 'https://pmaymis.gov.in/',
    source: 'Ministry of Housing and Urban Affairs, Govt of India',
    lastVerified: 'August 2026'
  },
  {
    id: 'pm-svanidhi',
    name: 'PM SVANidhi (PM Street Vendor’s AtmaNirbhar Nidhi)',
    shortName: 'PM SVANidhi',
    governmentLevel: 'CENTRAL',
    state: 'All India',
    department: 'Ministry of Housing and Urban Affairs',
    category: 'Loans & Financial Support',
    targetGroup: 'Street Vendors, Hawkers, Urban Micro-Artisans',
    summary: 'Affordable working capital collateral-free micro-loans for street vendors with interest subsidy and digital transaction cashback incentives.',
    featured: false,
    badgeText: 'Street Vendor Working Capital',
    benefits: [
      'First Loan: Collateral-free working capital loan up to ₹10,000 (1 year tenure)',
      'Second Loan: Enhanced credit up to ₹20,000 on timely repayment of 1st tranche',
      'Third Loan: Enhanced credit up to ₹50,000 on timely repayment of 2nd tranche',
      '7% interest subsidy per annum credited directly to bank account quarterly',
      'Cashback of up to ₹100/month (₹1,200/year) on receiving digital UPI payments'
    ],
    eligibility: [
      'Street vendors engaged in vending in urban and peri-urban areas holding a Vending Certificate / ID card issued by Urban Local Body (ULB)',
      'Vendors identified in the survey or possessing a Letter of Recommendation (LoR) from local town vending committee'
    ],
    documents: [
      'Aadhaar Card / Voter ID',
      'Certificate of Vending / Vendor Identity Card / Letter of Recommendation (LoR)',
      'Bank Account Passbook / Statement'
    ],
    howToApply: [
      'Visit the official PM SVANidhi portal (pmsvanidhi.mohua.gov.in) or use PM SVANidhi mobile app.',
      'Search for vendor identification / LoR and choose preferred lending partner (Bank/MFI).',
      'Submit Aadhaar-based application. Sanction and disbursement are completed digitally.'
    ],
    officialUrl: 'https://pmsvanidhi.mohua.gov.in/',
    source: 'Ministry of Housing and Urban Affairs (MoHUA), Govt of India',
    lastVerified: 'August 2026'
  },
  {
    id: 'pm-surya-ghar',
    name: 'PM Surya Ghar: Muft Bijli Yojana',
    shortName: 'PM Surya Ghar',
    governmentLevel: 'CENTRAL',
    state: 'All India',
    department: 'Ministry of New and Renewable Energy',
    category: 'Electricity & Utilities',
    targetGroup: 'Residential Households, Domestic electricity consumers',
    summary: 'Central financial subsidy scheme for installing rooftop solar panels to provide up to 300 units of free electricity every month.',
    featured: false,
    badgeText: 'Free Solar Electricity',
    benefits: [
      'Subsidy of ₹30,000 for 1 kW rooftop solar system',
      'Subsidy of ₹60,000 for 2 kW rooftop solar system',
      'Maximum subsidy of ₹78,000 for 3 kW and higher rooftop solar systems',
      'Free electricity generation saving households ₹15,000–₹25,000 annually with net-metering grid export'
    ],
    eligibility: [
      'Residential electricity consumers with domestic tariff connection in own name',
      'Applicant must possess adequate rooftop area suitable for solar PV installation',
      'One subsidy sanction per domestic consumer connection'
    ],
    documents: [
      'Recent Electricity Bill (last 6 months)',
      'Aadhaar Card of electricity connection holder',
      'Proof of house ownership or roof authorization',
      'Bank Passbook for direct central subsidy deposit'
    ],
    howToApply: [
      'Register on National Portal for Rooftop Solar (pmsuryaghar.gov.in) with State & DISCOM consumer number.',
      'Submit application and await technical feasibility approval from your DISCOM.',
      'Install system through registered empaneled vendor, inspect meter, and get Net Metering commission.',
      'Direct subsidy is credited to bank account within 30 days of commissioning.'
    ],
    officialUrl: 'https://pmsuryaghar.gov.in/',
    source: 'Ministry of New and Renewable Energy (MNRE), Govt of India',
    lastVerified: 'August 2026'
  },
  {
    id: 'atal-pension-yojana',
    name: 'Atal Pension Yojana (APY)',
    shortName: 'Atal Pension Yojana',
    governmentLevel: 'CENTRAL',
    state: 'All India',
    department: 'Pension Fund Regulatory and Development Authority (PFRDA)',
    category: 'Social Security',
    targetGroup: 'Unorganized Sector Workers, Self-employed Citizens',
    summary: 'Guaranteed minimum monthly pension scheme offering ₹1,000 to ₹5,000 per month starting at age 60 for unorganized sector workers.',
    featured: false,
    badgeText: 'Guaranteed Monthly Pension',
    benefits: [
      'Guaranteed lifelong monthly pension of ₹1,000 / ₹2,000 / ₹3,000 / ₹4,000 / ₹5,000 after 60 years of age',
      'Same pension continues to spouse upon the subscriber’s demise',
      'Full accumulated pension corpus returned to the nominee after demise of both subscriber & spouse'
    ],
    eligibility: [
      'All Indian citizens aged 18 to 40 years holding an active savings bank account',
      'Applicant must not be an income tax payer as per latest guidelines'
    ],
    documents: [
      'Aadhaar Card',
      'Savings Bank Account with Auto-Debit facility enabled',
      'Mobile Number'
    ],
    howToApply: [
      'Visit your bank branch where you hold a savings account or apply online via Internet Banking.',
      'Fill APY registration form, choose desired monthly pension slab, and authorize monthly auto-debit.',
      'PRAN (Permanent Retirement Account Number) is generated immediately.'
    ],
    officialUrl: 'https://www.npscra.nsdl.co.in/',
    source: 'PFRDA / Department of Financial Services, Govt of India',
    lastVerified: 'August 2026'
  },

  // ── Karnataka Government Schemes ──
  {
    id: 'gruha-lakshmi',
    name: 'Gruha Lakshmi Scheme (ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ)',
    shortName: 'Gruha Lakshmi',
    governmentLevel: 'STATE',
    state: 'Karnataka',
    department: 'Department of Women & Child Development, Govt of Karnataka',
    category: 'Women & Child',
    targetGroup: 'Women Heads of Households in Karnataka',
    summary: 'Karnataka Government flagship guarantee scheme providing ₹2,000 per month financial assistance directly to the woman head of every eligible family.',
    featured: true,
    badgeText: 'Karnataka Guarantee • ₹2,000/Month',
    benefits: [
      'Direct benefit transfer of ₹2,000 per month (₹24,000 per year) directly to the woman head of the family',
      'Credited on a monthly basis via DBT into Aadhaar-seeded bank accounts',
      'Empowers over 1.2 Crore women across rural and urban Karnataka with financial independence'
    ],
    eligibility: [
      'Woman must be registered as the "Head of the Family" on Antyodaya (AAY), BPL, or APL Ration Cards issued by Karnataka Govt',
      'Woman or her husband must not be an Income Tax payer or GST filer',
      'Only one woman per eligible family / ration card is entitled to benefits'
    ],
    documents: [
      'Karnataka Ration Card (AAY / BPL / APL) with applicant designated as family head',
      'Aadhaar Card of the woman applicant and Aadhaar Card of her husband',
      'Aadhaar-linked active Bank Account with NPCI mapping enabled for DBT',
      'Mobile number linked with Aadhaar'
    ],
    howToApply: [
      'Apply online through Karnataka Seva Sindhu portal (sevasindhuservices.karnataka.gov.in).',
      'In-person registration available at Grama One, Karnataka One, Bangalore One, or Bapuji Seva Kendras.',
      'Submit Ration card and Aadhaar details; OTP or biometric authentication verifies details instantly.',
      'SMS acknowledgment is sent with application tracking ID.'
    ],
    officialUrl: 'https://sevasindhuservices.karnataka.gov.in/',
    source: 'Department of Women and Child Development, Government of Karnataka',
    lastVerified: 'August 2026'
  },
  {
    id: 'gruha-jyothi',
    name: 'Gruha Jyothi Scheme (ಗೃಹ ಜ್ಯೋತಿ ಯೋಜನೆ)',
    shortName: 'Gruha Jyothi',
    governmentLevel: 'STATE',
    state: 'Karnataka',
    department: 'Energy Department, Government of Karnataka',
    category: 'Electricity & Utilities',
    targetGroup: 'All Residential Electricity Consumers in Karnataka',
    summary: 'Provides up to 200 units of free domestic electricity every month to all residential households in Karnataka.',
    featured: true,
    badgeText: 'Karnataka Guarantee • 200 Units Free Power',
    benefits: [
      'Zero electricity bills for domestic households whose monthly consumption is within their entitled limit (average usage + 10% allowance up to 200 units)',
      'Covers domestic electricity connections under BESCOM, MESCOM, HESCOM, GESCOM, and CHESCOM',
      'Substantial cost savings of ₹1,000–₹1,800 monthly for over 1.5 Crore households'
    ],
    eligibility: [
      'Applicable strictly to domestic/residential electrical meter connections in Karnataka (commercial connections excluded)',
      'Both homeowners and tenants residing in Karnataka are eligible',
      'One connection per Aadhaar / household'
    ],
    documents: [
      'Aadhaar Card of the domestic electricity consumer / tenant',
      'Electricity Account ID / Consumer Connection ID (printed on previous electricity bills)',
      'Rental / Tenancy Agreement (for tenants residing in rented accommodations)'
    ],
    howToApply: [
      'Visit the official Seva Sindhu Gruha Jyothi portal (sevasindhugs.karnataka.gov.in).',
      'Select your respective electricity supply company (ESCOM) and enter consumer Account ID.',
      'Enter your Aadhaar number, verify OTP, and submit the application.',
      'Zero billing applies automatically on the next billing cycle upon verification.'
    ],
    officialUrl: 'https://sevasindhugs.karnataka.gov.in/',
    source: 'Energy Department, Government of Karnataka',
    lastVerified: 'August 2026'
  },
  {
    id: 'shakti-scheme',
    name: 'Shakti Scheme (ಶಕ್ತಿ ಯೋಜನೆ)',
    shortName: 'Shakti Scheme',
    governmentLevel: 'STATE',
    state: 'Karnataka',
    department: 'Transport Department, Government of Karnataka',
    category: 'Transport',
    targetGroup: 'All Women & Transgender Persons residing in Karnataka',
    summary: 'Free public bus transportation across Karnataka state-run road transport corporations for all women and transgender residents.',
    featured: false,
    badgeText: 'Karnataka Guarantee • Free Bus Travel',
    benefits: [
      '100% free travel in ordinary, express, and city bus services operated by KSRTC, BMTC, NWKRTC, and KKRTC',
      'Valid across all intra-state bus routes within Karnataka state borders',
      'Over 300 Crore free passenger trips recorded, significantly improving women’s workforce participation'
    ],
    eligibility: [
      'All women and transgender persons who are permanent residents of Karnataka state',
      'Applicable in city, ordinary, and express bus services (excludes luxury AC/Sleeper buses such as Airavat, Flybus, Rajahamsa)'
    ],
    documents: [
      'Any valid Government Photo ID with Karnataka residential address (Aadhaar Card, Voter ID, Driving License, or Shakti Smart Card)'
    ],
    howToApply: [
      'Board any eligible KSRTC, BMTC, NWKRTC, or KKRTC non-luxury bus service within Karnataka.',
      'Show your Government Photo ID card showing Karnataka address to the conductor.',
      'A zero-fare ticket is issued immediately. No prior paperwork required for daily travel.'
    ],
    officialUrl: 'https://sevasindhu.karnataka.gov.in/',
    source: 'Transport Department, Government of Karnataka',
    lastVerified: 'August 2026'
  },
  {
    id: 'anna-bhagya',
    name: 'Anna Bhagya Scheme (ಅನ್ನ ಭಾಗ್ಯ ಯೋಜನೆ)',
    shortName: 'Anna Bhagya',
    governmentLevel: 'STATE',
    state: 'Karnataka',
    department: 'Food, Civil Supplies & Consumer Affairs Department, Govt of Karnataka',
    category: 'Food & Nutrition',
    targetGroup: 'BPL and Antyodaya (AAY) Ration Cardholders in Karnataka',
    summary: 'Guaranteed 10 kg free food grains per person per month (including direct DBT cash transfer for grain shortfall) for BPL families.',
    featured: false,
    badgeText: 'Karnataka Guarantee • 10kg Free Food Grain',
    benefits: [
      '5 kg free rice provided per person/month under central PMGKAY plus 5 kg additional rice allocation from Karnataka Government',
      'Direct benefit transfer of ₹170 per person per month (at ₹34/kg for 5 kg) directly to family head’s bank account during grain procurement shortfall',
      'Comprehensive food security guaranteeing zero hunger for over 4 Crore beneficiaries in Karnataka'
    ],
    eligibility: [
      'Holders of valid Karnataka Below Poverty Line (BPL) and Antyodaya Anna Yojana (AAY) Priority Household Ration Cards'
    ],
    documents: [
      'Valid Karnataka BPL / Antyodaya (AAY) Ration Card',
      'Aadhaar-linked active Bank Account of the family head with NPCI mapping enabled'
    ],
    howToApply: [
      'No separate registration required for existing active BPL/AAY cardholders in Karnataka.',
      'Verify that all family members’ Aadhaar cards are seeded to the ration card on ahara.kar.nic.in.',
      'Food grains are distributed through Fair Price Shops and DBT amount is credited automatically.'
    ],
    officialUrl: 'https://ahara.kar.nic.in/',
    source: 'Food, Civil Supplies and Consumer Affairs Department, Karnataka',
    lastVerified: 'August 2026'
  },
  {
    id: 'yuva-nidhi',
    name: 'Yuva Nidhi Scheme (ಯುವ ನಿಧಿ ಯೋಜನೆ)',
    shortName: 'Yuva Nidhi',
    governmentLevel: 'STATE',
    state: 'Karnataka',
    department: 'Department of Skill Development, Entrepreneurship and Livelihood, Govt of Karnataka',
    category: 'Jobs & Employment',
    targetGroup: 'Unemployed Graduates & Diploma Holders residing in Karnataka',
    summary: 'Monthly unemployment financial assistance for up to 2 years for educated youth in Karnataka while they seek employment or skill training.',
    featured: true,
    badgeText: 'Karnataka Guarantee • Youth Allowance',
    benefits: [
      '₹3,000 per month financial allowance for degree graduates',
      '₹1,500 per month financial allowance for diploma holders',
      'Disbursed for a period of up to 2 years or until the youth secures employment/self-employment',
      'Complimentary skill development training, certifications, and job fair placements through Karnataka Skill Development Corporation (KSDC)'
    ],
    eligibility: [
      'Karnataka domicile students who passed their Degree or Diploma in academic year 2022-23 onwards',
      'Must have remained unemployed for at least 6 months after graduation/passing date',
      'Not currently enrolled in higher education or receiving other state/central stipends'
    ],
    documents: [
      'Aadhaar Card of the applicant',
      'Degree / Diploma Convocation or Provisional Marks Card',
      'Karnataka Domicile / Study Certificate (minimum 7 years of schooling in Karnataka)',
      'Aadhaar-seeded active Bank Account'
    ],
    howToApply: [
      'Visit the Seva Sindhu Yuva Nidhi registration portal (sevasindhugs.karnataka.gov.in).',
      'Enter Aadhaar number and University/Board registration number to auto-fetch graduation credentials.',
      'Submit bank details and complete self-declaration of unemployment.',
      'Submit monthly self-declaration online to continue receiving timely direct transfers.'
    ],
    officialUrl: 'https://sevasindhugs.karnataka.gov.in/',
    source: 'Skill Development Department, Government of Karnataka',
    lastVerified: 'August 2026'
  },
  {
    id: 'ksheera-bhagya',
    name: 'Ksheera Bhagya Scheme (ಕ್ಷೀರ ಭಾಗ್ಯ ಯೋಜನೆ)',
    shortName: 'Ksheera Bhagya',
    governmentLevel: 'STATE',
    state: 'Karnataka',
    department: 'Department of School Education and Literacy, Govt of Karnataka',
    category: 'Education & Scholarships',
    targetGroup: 'School Students (Classes 1–10) & Anganwadi Children in Karnataka',
    summary: 'Provides 150ml of free nutritious milk 5 days a week to school children and Anganwadi students across Karnataka to fight childhood malnutrition.',
    featured: false,
    badgeText: 'Karnataka Nutritional Welfare',
    benefits: [
      '150 ml of freshly boiled milk fortified with essential micronutrients provided 5 days a week',
      'Covers over 65 Lakh students studying in Government and Government-aided schools and 35 Lakh Anganwadi toddlers',
      'Significantly combats malnutrition, improves cognitive focus, and boosts daily school attendance'
    ],
    eligibility: [
      'Children enrolled in Karnataka Government and Government-aided schools (Class 1 to 10) or registered in Anganwadis'
    ],
    documents: [
      'School admission / enrollment record (handled by school administration)'
    ],
    howToApply: [
      'No individual citizen application required.',
      'Benefit is administered directly on school working days through the school mid-day meal system in partnership with KMF Nandini.'
    ],
    officialUrl: 'https://schooleducation.karnataka.gov.in/',
    source: 'Department of School Education and Literacy, Government of Karnataka',
    lastVerified: 'August 2026'
  }
];

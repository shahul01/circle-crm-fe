import type { Customer, Lead, Task } from '@/types';

const EMPLOYEE_IDS = ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5'];

export const CUSTOMER_COUNT = 50;
const LEAD_COUNT = 50;
const TASK_COUNT = 50;

const CUSTOMER_NAMES = [
  'Acme Corporation',
  'TechStart Inc',
  'Global Solutions',
  'BlueSky Logistics',
  'Pinnacle Consulting',
  'NovaTech Solutions',
  'Evergreen Enterprises',
  'Silverline Finance',
  'Crestview Media',
  'Atlas Industries',
  'Summit Healthcare',
  'Rivera & Associates',
  'ClearView Analytics',
  'Iron Peak Construction',
  'Lighthouse Education',
  'Horizon Foods',
  'Vertex Sports',
  'Cobalt Energy',
  'Maple Ridge Realty',
  'Quantum Devices',
  'Stellar Brands',
  'Pioneer Shipping',
  'Falcon Aerospace',
  'Titan Robotics',
  'Aura Beauty',
  'Nimbus Cloud',
  'Cedar Grove Farms',
  'Orbit Travel',
  'Saffron Retail',
  'Drake Consulting',
  'Willow Interiors',
  'Sterling Motors',
  'Prairie Bank',
  'Vega Insurance',
  'Crimson Studios',
  'Arbor Legal',
  'Pulse Fitness',
  'Golden State Hotels',
  'Metro Transit',
  'Blue River Data',
  'Cypress Pharma',
  'Summit Brewing',
  'Ironidge Security',
  'Crown Jewelry',
  'North Peak Apparel',
  'Lakeside Gaming',
  'Echo Marketing',
  'Fenway Biotech',
  'Harbor Freight Co',
  'Aspen Ventures',
  'Zephyr Airlines',
  'Granite Mining',
  'Oasis Energy',
  'Red Fox Logistics',
  'Silver Oak Dental',
  'Canyon Construct',
  'Lumen Lighting',
  'Vortex Imaging',
  'Marigold Flowers',
  'Cypress Point Bank',
  'Atlas Freight',
  'Blue Wave Surf',
  'Ignite Software',
  'Summit Realty',
  'Nova Health',
  'Peak Performance',
  'Quartz Analytics',
  'Ruby Telecom',
  'Sapphire Travel',
  'Topaz Gaming',
  'Azure Cloud',
  'Crimson Code',
  'Emerald Energy',
  'Golden Gate Capital',
  'Ivory Retail',
  'Jade Wellness',
  'Onyx Media',
  'Pearl Hospitality',
  'Platinum Motors',
  'Silverline Tech',
  'Violet Design',
  'Amber Consulting',
  'Bronze Works',
  'Copper Crates',
  'Diamond Finance',
  'Frost Foods',
  'Galaxy Logistics',
  'Halo Beauty',
  'Ironworks',
  'Juniper Networks',
  'Kestone Realty',
  'Lunar Labs',
  'Magna Motors',
  'Nexus Systems',
  'Oakwood Law',
  'Palmer Pharma',
  'Quill Press',
];

const LOCATIONS = [
  'New York, NY',
  'San Francisco, CA',
  'Chicago, IL',
  'Dallas, TX',
  'Boston, MA',
  'Seattle, WA',
  'Portland, OR',
  'Austin, TX',
  'Los Angeles, CA',
  'Detroit, MI',
  'Denver, CO',
  'Miami, FL',
  'Atlanta, GA',
  'Phoenix, AZ',
  'Nashville, TN',
  'San Diego, CA',
  'Houston, TX',
  'Philadelphia, PA',
  'Charlotte, NC',
  'Columbus, OH',
];

const FIRST_NAMES = [
  'James',
  'Mary',
  'Robert',
  'Patricia',
  'John',
  'Jennifer',
  'Michael',
  'Linda',
  'David',
  'Elizabeth',
  'William',
  'Susan',
  'Richard',
  'Jessica',
  'Joseph',
  'Sarah',
  'Thomas',
  'Karen',
  'Charles',
  'Lisa',
  'Daniel',
  'Nancy',
  'Matthew',
  'Betty',
  'Anthony',
  'Margaret',
  'Mark',
  'Sandra',
  'Steven',
  'Ashley',
  'Andrew',
  'Kimberly',
  'Joshua',
  'Emily',
  'Kevin',
  'Donna',
  'Brian',
  'Michelle',
  'George',
  'Carol',
  'Edward',
  'Amanda',
  'Ronald',
  'Melissa',
  'Timothy',
  'Deborah',
  'Jason',
  'Stephanie',
  'Jeffrey',
  'Rebecca',
];

const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
  'Allen',
  'King',
  'Wright',
  'Scott',
  'Torres',
  'Nguyen',
  'Hill',
  'Flores',
  'Green',
  'Adams',
  'Nelson',
  'Baker',
  'Hall',
  'Rivera',
  'Campbell',
  'Mitchell',
  'Carter',
  'Roberts',
];

const DOMAINS = [
  'company.com',
  'business.io',
  'enterprises.net',
  'corp.org',
  'group.co',
  'solutions.com',
  'ventures.io',
  'partners.net',
  'systems.org',
];

const CUSTOMER_NOTE_TEMPLATES = [
  'Initial contact made. Interested in our enterprise plan.',
  'Referred by an existing customer. Looking for integration support.',
  'Compliance requirements discussed during the kickoff call.',
  'Requested a detailed pricing breakdown before procurement.',
  'Scheduled a follow-up demo for the entire leadership team.',
  'Renewal discussion pending. Contract cycle ends at the quarter close.',
  'Asked for additional training sessions for their support staff.',
  'Provided feedback on new feature requests for the roadmap.',
];

const LEAD_STATUSES: Lead['status'][] = [
  'New',
  'Contacted',
  'Follow-up',
  'Qualified',
  'Converted',
  'Lost',
];

const TASK_TITLES = [
  'Follow up with {company}',
  'Send revised proposal to {company}',
  'Schedule demo call with {company}',
  'Prepare onboarding deck for {company}',
  'Review quarterly pipeline',
  'Update CRM documentation',
  'Conduct product demo',
  'Follow up on proposal',
  'Prepare monthly sales report',
  'Update integration plan',
  'Complete onboarding checklist',
  'Schedule training session',
  'Audit inactive accounts',
  'Finalize quarterly targets',
  'Review NPS survey results',
  'Renewal discussion with {company}',
  'Collect feedback from {company}',
  'Draft service agreement',
  'Send contract to {company}',
  'Prepare discovery questions',
  'Update contact records',
  'Clean up duplicate entries',
  'Plan outreach campaign',
  'Write case study',
];

const TASK_DESCRIPTIONS = [
  'Send the revised proposal and schedule a follow-up chat.',
  'Prepare the onboarding slide deck ahead of the kickoff meeting.',
  'Refresh the user guide with the latest feature documentation.',
  'Analyze conversion metrics for the upcoming quarterly review.',
  'Reach out to the account to discuss renewal terms.',
  'Draft and send the service agreement for signature.',
  'Walk stakeholders through the platform capabilities.',
  'Check whether the pricing proposal has been reviewed.',
  'Compile monthly sales data and conversion metrics for management.',
  'Revise the integration roadmap based on client feedback.',
  'Complete every item on the onboarding checklist before go-live.',
  'Arrange a hands-on training session for the team.',
  'Review all inactive accounts and prepare re-engagement emails.',
  'Set quarterly targets based on the current pipeline analysis.',
  'Analyze customer satisfaction scores and prepare action items.',
  'Confirm renewal dates and prepare the contract addendum.',
  'Gather structured feedback and log it into the account.',
  'Create the service agreement with updated compliance terms.',
  'Send the signed contract and confirm receipt.',
  'Prepare tailored discovery questions for the first call.',
  'Verify contact details and update central records.',
  'Merge duplicate entries found during the data audit.',
  'Plan the outbound campaign for the next quarter.',
  'Write up a customer success case study for marketing.',
];

const STATUS_COUNTS: Record<Customer['status'], number> = {
  Active: 70,
  Inactive: 30,
};

const TASK_STATUSES: Task['status'][] = ['Todo', 'In Progress', 'Completed'];
const TASK_PRIORITIES: Task['priority'][] = ['Low', 'Medium', 'High'];

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCustomerSeeds(): Customer[] {
  const rand = mulberry32(20250101);
  const customers: Customer[] = [];
  let namePool = [...CUSTOMER_NAMES];
  let locationPool = [...LOCATIONS];

  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    if (namePool.length === 0) {
      namePool = [...CUSTOMER_NAMES];
    }
    if (locationPool.length === 0) {
      locationPool = [...LOCATIONS];
    }

    const nameIndex = Math.floor(rand() * namePool.length);
    const name = namePool.splice(nameIndex, 1)[0];

    const status: Customer['status'] =
      i < STATUS_COUNTS.Active ? 'Active' : 'Inactive';

    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    const year = rand() > 0.3 ? 2025 : 2024;
    const createdAt = new Date(
      Date.UTC(year, month - 1, day, 8 + Math.floor(rand() * 10), 0, 0)
    ).toISOString();

    const locationIndex = Math.floor(rand() * locationPool.length);
    const location = locationPool.splice(locationIndex, 1)[0];

    const hasNotes = i % 3 === 0;
    const notes = hasNotes
      ? [
          {
            id: `n-${i + 1}`,
            content:
              CUSTOMER_NOTE_TEMPLATES[
                Math.floor(rand() * CUSTOMER_NOTE_TEMPLATES.length)
              ],
            createdAt,
          },
        ]
      : [];

    customers.push({
      id: `cust-${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}@${
        DOMAINS[i % DOMAINS.length]
      }`,
      phone: `(${555}) ${String(100 + Math.floor(rand() * 890))}-${String(
        1000 + Math.floor(rand() * 8900)
      )}`,
      company: name,
      location,
      status,
      assignedEmployeeId: EMPLOYEE_IDS[i % EMPLOYEE_IDS.length],
      createdAt,
      notes,
    });
  }

  return customers;
}

function buildLeadSeeds(): Lead[] {
  const rand = mulberry32(20250202);
  const leads: Lead[] = [];

  for (let i = 0; i < LEAD_COUNT; i++) {
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const company = `${CUSTOMER_NAMES[i % CUSTOMER_NAMES.length]} Partners`;

    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    const createdAt = new Date(
      Date.UTC(2025, month - 1, day, 8 + Math.floor(rand() * 10), 0, 0)
    ).toISOString();

    leads.push({
      id: `lead-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${
        DOMAINS[i % DOMAINS.length]
      }`,
      phone: `(${555}) ${String(100 + Math.floor(rand() * 890))}-${String(
        1000 + Math.floor(rand() * 8900)
      )}`,
      company,
      status: LEAD_STATUSES[i % LEAD_STATUSES.length],
      assignedEmployeeId: EMPLOYEE_IDS[i % EMPLOYEE_IDS.length],
      createdAt,
    });
  }

  return leads;
}

function buildTaskSeeds(customers: Customer[]): Task[] {
  const rand = mulberry32(20250303);
  const tasks: Task[] = [];

  for (let i = 0; i < TASK_COUNT; i++) {
    const customer = customers[i % customers.length];
    const titleTemplate = TASK_TITLES[i % TASK_TITLES.length];
    const title = titleTemplate.includes('{company}')
      ? titleTemplate.replace('{company}', customer.name)
      : titleTemplate;

    const dueMonth = 1 + Math.floor(rand() * 12);
    const dueDay = 1 + Math.floor(rand() * 28);
    const dueDate = new Date(Date.UTC(2025, dueMonth - 1, dueDay, 0, 0, 0))
      .toISOString()
      .slice(0, 10);

    const created = new Date(
      Date.UTC(2025, 1 + Math.floor(rand() * 5), 1 + Math.floor(rand() * 28))
    ).toISOString();

    tasks.push({
      id: `task-${i + 1}`,
      title,
      description: TASK_DESCRIPTIONS[i % TASK_DESCRIPTIONS.length],
      assignedEmployeeId: EMPLOYEE_IDS[i % EMPLOYEE_IDS.length],
      priority: TASK_PRIORITIES[i % TASK_PRIORITIES.length],
      dueDate,
      status: TASK_STATUSES[i % TASK_STATUSES.length],
      relatedCustomerId: customer.id,
      createdAt: created,
    });
  }

  return tasks;
}

const CUSTOMER_SEED: Customer[] = buildCustomerSeeds();
const LEAD_SEED: Lead[] = buildLeadSeeds();
const TASK_SEED: Task[] = buildTaskSeeds(CUSTOMER_SEED);

export function getSeedState() {
  return {
    customers: {
      ids: CUSTOMER_SEED.map((c) => c.id),
      entities: Object.fromEntries(CUSTOMER_SEED.map((c) => [c.id, c])),
    },
    leads: {
      ids: LEAD_SEED.map((l) => l.id),
      entities: Object.fromEntries(LEAD_SEED.map((l) => [l.id, l])),
    },
    tasks: {
      ids: TASK_SEED.map((t) => t.id),
      entities: Object.fromEntries(TASK_SEED.map((t) => [t.id, t])),
    },
  };
}

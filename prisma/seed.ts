// TRD Admin Dashboard - Comprehensive Database Seed Script
// Migrates ALL static data from main website into the admin database
// Run: npx tsx prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Load blur placeholders from website source data
const blurPlaceholdersPath = path.resolve(__dirname, '../trd-site/src/data/blurPlaceholders.json');
let blurPlaceholders: Record<string, Record<string, string>> = {};
try {
  const blurData = JSON.parse(fs.readFileSync(blurPlaceholdersPath, 'utf-8'));
  blurPlaceholders = blurData.projects || {};
} catch {
  console.warn('Could not load blurPlaceholders.json - blur data will not be seeded');
}

// Map project image directory slugs to database slugs
const BLUR_SLUG_MAP: Record<string, string> = {
  'caringbah-pavilion': 'caringbah-pavilion-carbon-fibre',
  'enfield-curtain-wall': 'enfield-curtain-wall',
  'florence-capri-complex': 'one-the-waterfront',
  'jacaranda-construction-joints': 'jacaranda-construction-joints',
  'marsden-park-development': 'marsden-park-suspended-slab',
  'northbridge-structural-wall': 'northbridge-structural-wall',
  'pelican-road-schofields': 'pelican-road-schofields',
  'pemulwuy-suspended-slab': 'pemulwuy-suspended-slab',
  'rousehill-slab-scanning': 'rouse-hill-slab-scanning',
  'schofields-54-advanced': 'schofields-54-advanced',
  'waitara-multi-service': 'waitara-multi-service',
  'zetland-surelock': 'zetland-surelock',
};

// Build reverse map: db slug -> blur data
const dbSlugToBlur: Record<string, Record<string, string>> = {};
for (const [blurSlug, dbSlug] of Object.entries(BLUR_SLUG_MAP)) {
  if (blurPlaceholders[blurSlug]) {
    dbSlugToBlur[dbSlug] = blurPlaceholders[blurSlug];
  }
}

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data (in correct order for FK constraints)
  console.log('Clearing existing data...');
  await prisma.contentHistory.deleteMany();
  await prisma.pageContent.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.companyValue.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.service.deleteMany();
  await prisma.caseStudy.deleteMany();
  await prisma.media.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================
  // 2. SEED SERVICES (9 services)
  // ============================================================
  console.log('Seeding services...');
  const services = await Promise.all([
    prisma.service.create({ data: {
      slug: 'structural-strengthening', title: 'Structural Strengthening', tagline: 'Enhancing load capacity',
      description: 'Expert structural strengthening using carbon fibre (CFRP) and steel plate bonding in Sydney. Our structural remediation specialists increase the load-bearing capacity of existing concrete structures across NSW, ensuring building compliance and long-term stability.',
      features: ['Carbon fibre wrapping','Steel plate bonding','Column jacketing','Beam strengthening'],
      benefits: ['Increased capacity','Minimal weight add','Corrosion resistance','Versatile application'],
      icon: '/images/services/structural-strengthening/feature.jpg', visual: '/images/services/structural-strengthening/hero.jpg',
      heroImage: '/images/services/structural-strengthening/hero.jpg', featureImage: '/images/services/structural-strengthening/feature.jpg', processImage: '/images/services/structural-strengthening/process.jpg',
      stats: [{value:'200%',label:'Strength Gain'},{value:'Light',label:'Weight'},{value:'Fast',label:'Installation'}],
      process: [{step:1,title:'Prep',description:'Grind and clean surface'},{step:2,title:'Adhesive',description:'Apply structural epoxy'},{step:3,title:'Install',description:'Apply CFRP or steel plates'},{step:4,title:'Cure',description:'Allow adhesive to cure fully'}],
      commonApplications: 'Structural strengthening is critical for increasing load capacity of existing structures to accommodate additional floors in residential and commercial buildings, upgrading carpark slabs to support heavier electric vehicles, and retrofitting earthquake resistance into heritage buildings across Sydney. Carbon fibre reinforced polymer (CFRP) wrapping is used for columns in high-rise buildings requiring strength upgrades without increasing dimensions, beams supporting increased loads from mezzanine installations, and slabs requiring flexural strengthening for equipment loads. Steel plate bonding applications include strengthening bridge beams for increased traffic loads, reinforcing tunnel lining segments, and upgrading industrial facility structures for heavy machinery. We specialize in confined space strengthening work including basement columns, underground carparks, and utility tunnels.',
      whyChooseTRD: 'TRD Remedial uses premium CFRP systems from Sika CarboDur and BASF MBrace providing 50-200% load capacity increases with minimal weight addition and zero dimensional increase. Our structural engineers (CPEng certified) design strengthening systems using finite element analysis (FEA) to optimize fibre placement and bonding patterns. We provide 10-year structural warranties backed by engineer certification and $20 million structural alteration insurance. Our portfolio includes 200+ strengthening projects with zero structural failures.',
      serviceArea: 'Sydney-wide structural strengthening services: CBD high-rises, Eastern Suburbs heritage buildings, North Shore commercial structures, Inner West industrial facilities, Western Sydney residential developments, and infrastructure across NSW.',
      relatedServiceSlugs: ['structural-alterations','crack-injection','concrete-repairs'],
      faqs: [
        {question:'How long does structural strengthening take?',answer:'CFRP carbon fibre strengthening typically requires 1-2 weeks depending on element size and adhesive cure time. Surface preparation takes 2-3 days, fibre application takes 1-2 days, and full cure time is 7 days before loading.'},
        {question:'How much strength does CFRP strengthening add?',answer:'CFRP strengthening typically increases load-bearing capacity by 50-200% depending on fibre layup design and bonding pattern.'},
        {question:'Is structural strengthening permanent?',answer:'Yes, CFRP and steel plate bonding provide permanent structural upgrades with design life matching the concrete structure. We provide 10-year structural warranties backed by engineer certification.'},
        {question:'How much does structural strengthening cost?',answer:'CFRP strengthening typically costs $400-800 per square meter of application depending on system complexity and access. Steel plate bonding costs $500-1,200 per square meter.'},
        {question:'Can buildings remain occupied during strengthening?',answer:'Yes, structural strengthening is minimally disruptive. Surface preparation creates dust managed with containment barriers, and CFRP application uses low-odor epoxies.'},
        {question:'Do I need engineer approval for strengthening?',answer:'Yes, all structural strengthening work requires design calculations from a certified structural engineer and Building Commissioner approval before commencement.'},
      ],
      testimonials: [
        {quote:"Our 1960s office tower needed column strengthening to accommodate additional mechanical loads on upper floors. TRD's CFRP strengthening solution was non-invasive and completed in 2 weeks without relocating occupants.",role:'Facility Manager',company:'North Sydney Business Centre',projectType:'High-Rise Column Strengthening - 40 Columns'},
        {quote:"We wanted to convert our warehouse to add a second level mezzanine, but the existing slab wasn't rated for the additional load. TRD strengthened our main support beams with carbon fibre, and now we have the capacity we need.",role:'Operations Director',company:'Holroyd Industrial Logistics',projectType:'Industrial Slab & Beam Strengthening'},
      ],
      order: 0,
    }}),
    prisma.service.create({ data: {
      slug: 'structural-alterations', title: 'Structural Alterations', tagline: 'Modifying structures safely',
      description: 'Expert structural alteration services including opening creation, wall removal, and structural support modification. We ensure stability during all alteration works.',
      features: ['Load-bearing wall removals and structural demolition','New opening formations and penetrations','Steel and concrete beam installations','Temporary propping and permanent support systems','Structural reconfiguration of internal layouts','Mid-construction structural modifications','Engineering coordination through to completion'],
      benefits: ['Space optimization','Structural safety','Code compliance','Seamless integration'],
      icon: '/images/services/structural-alterations/feature.jpg', visual: '/images/services/structural-alterations/hero.jpg',
      heroImage: '/images/services/structural-alterations/hero.jpg', featureImage: '/images/services/structural-alterations/feature.jpg', processImage: '/images/services/structural-alterations/process.jpg',
      stats: [{value:'500+',label:'Projects'},{value:'0',label:'Incidents'},{value:'Certified',label:'Engineers'}],
      process: [{step:1,title:'Engineering',description:'Review structural drawings and plans'},{step:2,title:'Propping',description:'Install temporary supports'},{step:3,title:'Demolition',description:'Remove targeted structural elements'},{step:4,title:'Installation',description:'Install new beams or supports'}],
      commonApplications: 'Structural alterations are critical for residential renovations including removing load-bearing walls to create open-plan living, installing steel beams for loft conversions, and creating new openings for staircases or lifts. Commercial applications include opening up retail spaces for tenancy fitouts, creating access points in office buildings for HVAC systems, and modifying warehouse structures for mezzanine installations.',
      whyChooseTRD: 'TRD Remedial holds Building Commissioner approval and works exclusively with certified structural engineers (CPEng). Every alteration project includes full engineering documentation, building approval coordination, and compliance certification. With 500+ structural alteration projects completed with zero structural failures.',
      serviceArea: 'Sydney-wide structural alteration services: CBD high-rises, Eastern Suburbs heritage homes, North Shore commercial buildings, Inner West industrial conversions, Western Sydney residential developments.',
      relatedServiceSlugs: ['concrete-cutting','structural-strengthening','curtain-wall-injection'],
      faqs: [
        {question:'How long do structural alterations take?',answer:'Timeline depends on project complexity. Simple wall removals in residential homes typically take 2-4 weeks including engineering approvals. Major commercial projects may take 6-12 weeks.'},
        {question:'Do structural alterations require building approval?',answer:'Yes, all structural alterations require Development Application (DA) and Construction Certificate (CC) from your local council.'},
        {question:'How much do structural alterations cost?',answer:'Costs vary significantly based on scope. Residential wall removals typically range $8,000-15,000 including temporary propping and structural frame installation.'},
        {question:'Can occupants remain in the building during structural work?',answer:'This depends on the project scope and council requirements. Small residential alterations may allow occupancy with noise and dust management.'},
        {question:'What temporary support systems are used?',answer:'We use engineered temporary support systems including acrow props, steel needling beams, and hydraulic jacking systems designed by structural engineers for each specific project.'},
      ],
      testimonials: [
        {quote:"We wanted to remove the wall between our kitchen and lounge room. TRD handled all the engineering, permits, and installation of the steel beam with absolute professionalism.",role:'Homeowner',company:'Mosman Heritage Home',projectType:'Residential Open-Plan Renovation'},
        {quote:"TRD managed our Westfield retail tenancy expansion requiring a major structural wall removal. Despite tight timelines and complex engineering, they delivered on schedule with zero safety incidents.",role:'Project Manager',company:'Westfield Property Group',projectType:'Commercial Retail Space Expansion'},
      ],
      order: 1,
    }}),
    prisma.service.create({ data: {
      slug: 'crack-injection', title: 'Crack Injection', tagline: 'Precision sealing and structural repair',
      description: 'Professional crack injection and concrete repair services in Sydney. Our expert team delivers structural remediation solutions for residential and commercial properties across NSW, using high-quality resins and grouts to restore structural integrity and prevent water ingress.',
      features: ['Epoxy injection','Polyurethane injection','Structural bonding','Leak sealing'],
      benefits: ['Restores structural strength','Waterproofs cracks','Prevents corrosion','Cost-effective repair'],
      icon: '/images/services/crack-injection/feature.jpg', visual: '/images/services/crack-injection/feature.jpg',
      heroImage: '/images/services/crack-injection/feature.jpg', featureImage: '/images/services/crack-injection/hero.jpg', processImage: '/images/services/crack-injection/process.jpg',
      stats: [{value:'5,000+',label:'Meters Injected'},{value:'100%',label:'Seal Success'},{value:'15+',label:'Years Experience'}],
      process: [{step:1,title:'Inspection',description:'Assess crack width, depth, and cause'},{step:2,title:'Preparation',description:'Clean crack and install injection ports'},{step:3,title:'Injection',description:'Inject resin or grout at controlled pressure'},{step:4,title:'Finishing',description:'Remove ports and seal surface'}],
      commonApplications: 'Crack injection is essential for basement waterproofing, concrete carpark repairs, structural remediation in high-rise buildings, and residential foundation repairs across Sydney. We use epoxy injection for structural cracks to restore 100% load-bearing capacity in beams, columns, and slabs.',
      whyChooseTRD: 'TRD Remedial brings 15+ years of crack injection expertise to Sydney, with Building Commissioner approval and $20 million public liability insurance. Our crack repairs carry 5-10 year warranties on structural epoxy injection and 3-5 years on waterproofing polyurethane injection.',
      serviceArea: 'We service all Sydney metropolitan areas including CBD, Eastern Suburbs, Northern Beaches, North Shore, Inner West, Western Sydney, South Sydney, Hills District, and Sutherland Shire. Available 24/7 for emergency structural crack repairs across NSW.',
      relatedServiceSlugs: ['structural-strengthening','structural-alterations','slab-scanning'],
      faqs: [
        {question:'How long does crack injection take?',answer:'Most residential crack injection projects are completed in 1-2 days, depending on the extent of cracking and cure times.'},
        {question:'Is crack injection a permanent solution?',answer:'Yes, when performed correctly with quality epoxy resins, crack injection provides a permanent structural repair with a design life matching the concrete structure.'},
        {question:'What types of cracks can be injected?',answer:'We can inject cracks ranging from hairline (0.1mm) to structural (10mm+) widths.'},
        {question:'How much does crack injection cost?',answer:'Crack injection costs typically range from $150-300 per linear meter for residential work.'},
        {question:'Will the injected cracks be visible after repair?',answer:'Injection ports and surface sealing may leave minor surface marks, but these can be ground flush and painted over for an invisible repair.'},
        {question:'Can you inject cracks in occupied buildings?',answer:'Yes, crack injection is minimally disruptive and safe for occupied buildings.'},
      ],
      testimonials: [
        {quote:"TRD's crack injection work exceeded our expectations. They completed 47 units in our development with zero callbacks and minimal disruption to residents.",role:'Development Manager',company:'Pelican Properties Group',projectType:'Residential Estate - 47 Units'},
        {quote:"We had active water leaks through basement cracks that three other contractors couldn't fix. TRD's polyurethane injection stopped the leaks completely within one day.",role:'Facility Manager',company:'Waitara Commercial Complex',projectType:'Basement Waterproofing'},
      ],
      order: 2,
    }}),
    prisma.service.create({ data: {
      slug: 'concrete-cutting', title: 'Concrete Cutting', tagline: 'Precision cutting and coring',
      description: 'Precision concrete cutting and coring services throughout Sydney. Specialized in structural remediation and building compliance for major infrastructure projects, delivering precise cuts with minimal dust and disruption across NSW.',
      features: ['Wall sawing','Floor sawing','Core drilling','Expansion joints'],
      benefits: ['Precise dimensions','Dust control','Structural safety','Efficient execution'],
      icon: '/images/services/concrete-cutting/feature.jpg', visual: '/images/services/concrete-cutting/hero.jpg',
      heroImage: '/images/services/concrete-cutting/hero.jpg', featureImage: '/images/services/concrete-cutting/feature.jpg', processImage: '/images/services/concrete-cutting/process.jpg',
      stats: [{value:'10,000+',label:'Cuts Made'},{value:'\u00b11mm',label:'Precision'},{value:'24/7',label:'Availability'}],
      process: [{step:1,title:'Marking',description:'Layout cut lines according to plans'},{step:2,title:'Setup',description:'Position saws and safety equipment'},{step:3,title:'Cutting',description:'Execute cuts with water control'},{step:4,title:'Removal',description:'Remove concrete blocks and slurry'}],
      commonApplications: 'Concrete cutting is vital for structural alterations in commercial buildings, creating openings for doors, windows, and ventilation ducts in residential properties, and precision core drilling for plumbing, electrical, and HVAC installations across Sydney.',
      whyChooseTRD: "TRD Remedial operates Sydney's most advanced concrete cutting fleet, including Hilti wall saws capable of 800mm depth cuts, hydraulic floor saws for precision accuracy, and diamond core drilling up to 600mm diameter. With 10,000+ cuts executed across residential, commercial, and infrastructure projects.",
      serviceArea: 'Servicing all Sydney metro areas 24/7: CBD, Eastern Suburbs, Northern Beaches, North Shore, Inner West, Western Sydney, Hills District, and Sutherland Shire. Emergency cutting services available with 2-4 hour response time across NSW.',
      relatedServiceSlugs: ['slab-scanning','structural-alterations','temporary-moving-joints'],
      faqs: [
        {question:'How precise is concrete cutting?',answer:'Our diamond sawing equipment achieves tolerances of \u00b12mm on typical cuts.'},
        {question:'Is concrete cutting dusty and noisy?',answer:'We use water-cooled diamond blades that eliminate 95%+ of dust through wet cutting.'},
        {question:'Can you cut through reinforced concrete?',answer:'Yes, diamond sawing cuts through both concrete and steel reinforcement without issue.'},
        {question:'What size openings can you create?',answer:'We can create openings from small core holes (20mm diameter) to large doorways and vehicle access openings (4m+ wide).'},
        {question:'How much does concrete cutting cost?',answer:'Floor sawing typically ranges from $8-15 per linear meter. Wall sawing costs $25-50 per square meter. Core drilling is $5-15 per core.'},
      ],
      testimonials: [
        {quote:"TRD completed our Coles supermarket concrete cutting project on time despite challenging night work restrictions. Their dust control was exceptional.",role:'Project Manager',company:'Coles Group - Property Development',projectType:'Retail Supermarket Modification'},
      ],
      order: 3,
    }}),
    prisma.service.create({ data: {
      slug: 'concrete-repairs', title: 'Concrete Repairs', tagline: 'Comprehensive surface restoration',
      description: 'General concrete repair and surface patching. We address spalling, surface cracks, and cosmetic defects to improve aesthetics and durability.',
      features: ['Concrete patching','Spall repair','Surface rendering','Cosmetic restoration'],
      benefits: ['Improved appearance','Surface protection','Safety hazard removal','Extended durability'],
      icon: '/images/services/concrete-repairs/feature.jpg', visual: '/images/services/concrete-repairs/hero.jpg',
      heroImage: '/images/services/concrete-repairs/hero.jpg', featureImage: '/images/services/concrete-repairs/feature.jpg', processImage: '/images/services/concrete-repairs/process.jpg',
      stats: [{value:'2,000+',label:'Repairs'},{value:'10yr',label:'Warranty'},{value:'100%',label:'Client Satisfaction'}],
      process: [{step:1,title:'Clean',description:'Remove loose concrete and debris'},{step:2,title:'Prime',description:'Apply bonding agent'},{step:3,title:'Patch',description:'Apply repair mortar'},{step:4,title:'Finish',description:'Texture and match existing surface'}],
      commonApplications: 'Concrete repairs are essential for cosmetic restoration of driveways, patios, and footpaths in residential properties, spalling concrete repair in carparks and commercial building facades, and surface defect treatment in industrial warehouses across Sydney.',
      whyChooseTRD: 'TRD Remedial specializes in invisible concrete repairs that perfectly match existing concrete finishes. Our technicians use color-matched polymer-modified repair mortars from Sika and BASF. All repairs are backed by 2-5 year warranties.',
      serviceArea: 'Covering all Sydney regions: CBD, Eastern Suburbs, Northern Beaches, North Shore, Inner West, Western Sydney, Hills District, and Sutherland Shire.',
      relatedServiceSlugs: ['crack-injection','structural-strengthening','structural-alterations'],
      faqs: [
        {question:'How long does concrete repair take?',answer:'Most concrete repair projects are completed in 1-3 days depending on the extent of damage and surface area.'},
        {question:'Is concrete repair a permanent solution?',answer:'Yes, when completed with quality polymer-modified repair mortars and proper surface preparation, concrete repairs are permanent.'},
        {question:'What types of damage can be repaired?',answer:'We repair hairline surface cracks, cosmetic cracks from minor settling, thermal movement cracks, weathering damage, spalling concrete, and edge damage.'},
        {question:'How much does concrete repair cost?',answer:'Concrete repair costs typically range from $50-150 per linear meter for residential work.'},
        {question:'Will the repaired area match the existing concrete finish?',answer:'Yes, we use color-matched repair mortars and specialized finishing techniques to blend seamlessly with existing concrete.'},
      ],
      testimonials: [
        {quote:"Our 25-year-old driveway was looking terrible with multiple spalling patches and cracks. TRD's concrete repair team completely transformed it in just 2 days.",role:'Homeowner',company:'Double Bay Residential',projectType:'Driveway & Patio Restoration - 150 sqm'},
        {quote:"We needed cosmetic concrete repairs on our commercial building facade before a major client event. TRD delivered perfect color matching and invisible repairs on schedule.",role:'Building Manager',company:'Parramatta Plaza Shopping Centre',projectType:'Commercial Facade Restoration'},
      ],
      order: 4,
    }}),
    prisma.service.create({ data: {
      slug: 'slab-scanning', title: 'Slab Scanning', tagline: 'Non-destructive testing',
      description: 'Advanced GPR slab scanning to locate rebar, post-tension cables, and services before cutting. Ensure safety and prevent costly damage.',
      features: ['GPR scanning','Rebar location','Service detection','Void detection'],
      benefits: ['Risk mitigation','Accurate mapping','Immediate results','Non-destructive'],
      icon: '/images/services/slab-scanning/feature.jpg', visual: '/images/services/slab-scanning/hero.jpg',
      heroImage: '/images/services/slab-scanning/hero.jpg', featureImage: '/images/services/slab-scanning/feature.jpg', processImage: '/images/services/slab-scanning/process.jpg',
      stats: [{value:'99.9%',label:'Accuracy'},{value:'1,000+',label:'Scans'},{value:'400mm',label:'Depth'}],
      process: [{step:1,title:'Grid Setup',description:'Mark out scanning grid'},{step:2,title:'Scan',description:'Perform GPR scan passes'},{step:3,title:'Analyze',description:'Interpret data on-site'},{step:4,title:'Mark',description:'Mark findings directly on slab'}],
      commonApplications: 'GPR slab scanning is mandatory before any concrete cutting or coring to locate post-tension cables, rebar, and embedded services in slabs, walls, and beams across Sydney.',
      whyChooseTRD: 'TRD Remedial uses state-of-the-art Hilti PS 1000 X-Scan Ground Penetrating Radar systems capable of detecting objects up to 400mm depth with 99.9% accuracy. Emergency scanning available 24/7.',
      serviceArea: 'Comprehensive GPR scanning services across all Sydney suburbs. Mobile scanning units enable rapid response within 2-4 hours for emergency projects across NSW.',
      relatedServiceSlugs: ['concrete-cutting','structural-alterations','crack-injection'],
      faqs: [
        {question:'How long does GPR slab scanning take?',answer:'Most slab scanning projects take 1-2 days depending on area size and complexity.'},
        {question:'How accurate is GPR slab scanning?',answer:'Our Hilti PS 1000 X-Scan system detects objects with \u00b15mm precision to depths of 400mm.'},
        {question:'Why is GPR scanning mandatory before cutting?',answer:'GPR scanning identifies hidden hazards including post-tension cables (damage repair costs $50,000+), electrical conduits, and structural rebar.'},
        {question:'How much does GPR scanning cost?',answer:'Standard residential slab scanning costs $400-800. Commercial projects range $1,500-5,000 for full floor scanning.'},
        {question:'What can GPR detect?',answer:'GPR detects post-tension cables, reinforcing steel, embedded electrical conduits, water pipes, voids, and delamination.'},
      ],
      testimonials: [
        {quote:"Before cutting our office slab for new mechanical penetrations, TRD's GPR scanning discovered active electrical conduits and post-tension cables we didn't know existed.",role:'Facilities Manager',company:'Barangaroo CBD Office Tower',projectType:'Commercial Slab Scanning - 5,000 sqm'},
        {quote:"TRD provided fast, accurate scanning before our carpark renovation. They delivered on-site marked results within hours.",role:'Project Manager',company:'Neutral Bay Carpark Development',projectType:'Carpark Scanning & Engineering'},
      ],
      order: 5,
    }}),
    prisma.service.create({ data: {
      slug: 'curtain-wall-injection', title: 'Curtain Wall Injection', tagline: 'Waterproofing below ground',
      description: 'Curtain injection grouting to waterproof below-grade structures. Create a waterproof barrier behind walls without excavation.',
      features: ['Gel injection','Soil stabilization','Basement waterproofing','Leak stopping'],
      benefits: ['No excavation needed','Total waterproofing','Quick application','Permanent solution'],
      icon: '/images/services/curtain-wall-injection/feature.jpg', visual: '/images/services/curtain-wall-injection/hero.jpg',
      heroImage: '/images/services/curtain-wall-injection/hero.jpg', featureImage: '/images/services/curtain-wall-injection/feature.jpg', processImage: '/images/services/curtain-wall-injection/process.jpg',
      stats: [{value:'100%',label:'Waterproof'},{value:'3yr',label:'Guarantee'},{value:'Deep',label:'Penetration'}],
      process: [{step:1,title:'Drill',description:'Drill grid of injection holes'},{step:2,title:'Inject',description:'Inject gel behind the wall'},{step:3,title:'Barrier',description:'Gel forms waterproof curtain'},{step:4,title:'Seal',description:'Plug holes and finish'}],
      commonApplications: 'Curtain injection grouting is the preferred waterproofing method for below-ground structures including basement walls with active leaks, underground carparks with groundwater infiltration, and tunnels experiencing water ingress across Sydney.',
      whyChooseTRD: 'TRD Remedial uses acrylamide and polyurethane gel systems specifically formulated for soil stabilization and curtain grouting, providing permanent waterproof barriers. We provide 5-year waterproofing warranties on curtain injection work.',
      serviceArea: 'Specialized curtain injection services across Sydney metro: CBD basement complexes, Eastern Suburbs heritage buildings, North Shore residential basements, Inner West industrial facilities.',
      relatedServiceSlugs: ['crack-injection','structural-alterations','concrete-repairs'],
      faqs: [
        {question:'How long does curtain wall injection take?',answer:'Most curtain injection projects complete in 2-5 days depending on wall area and water pressure conditions.'},
        {question:'Is curtain wall injection a permanent waterproofing solution?',answer:'Yes, when performed correctly with quality gel systems, curtain injection provides permanent waterproofing with a 5-year guarantee.'},
        {question:'Why curtain injection instead of external excavation?',answer:'Curtain injection avoids expensive excavation, protects existing landscaping and structures, and costs 40-60% less than full excavation and membrane installation.'},
        {question:'How much does curtain wall injection cost?',answer:'Curtain wall injection typically costs $200-500 per linear meter depending on wall height and groundwater pressure.'},
      ],
      testimonials: [
        {quote:"Our heritage terrace basement had been flooding every winter for 20 years. TRD's curtain injection fixed it without excavation. Three years later, the basement is still completely dry.",role:'Heritage Property Owner',company:'Paddington Terrace Residence',projectType:'Heritage Basement Waterproofing'},
        {quote:"We had an active groundwater infiltration problem in our underground carpark. TRD's curtain injection team sealed 150 linear meters of basement wall. The water stopped completely.",role:'Building Manager',company:'Chatswood Corporate Plaza',projectType:'Commercial Carpark Waterproofing - 3 Levels'},
      ],
      order: 6,
    }}),
    prisma.service.create({ data: {
      slug: 'temporary-moving-joints', title: 'Temporary Moving Joints', tagline: 'Flexible joint solutions',
      description: 'Installation and maintenance of temporary movement joints for construction phases. Allow for thermal expansion and contraction during building works.',
      features: ['Joint installation','Movement monitoring','Sealant application','Temporary bridging'],
      benefits: ['Prevents cracking','Accommodates movement','Protects structure','Construction flexibility'],
      icon: '/images/services/temporary-moving-joints/feature.jpg', visual: '/images/services/temporary-moving-joints/hero.jpg',
      heroImage: '/images/services/temporary-moving-joints/hero.jpg', featureImage: '/images/services/temporary-moving-joints/feature.jpg', processImage: '/images/services/temporary-moving-joints/process.jpg',
      stats: [{value:'100+',label:'Joints Installed'},{value:'50mm+',label:'Movement Capacity'},{value:'Custom',label:'Solutions'}],
      process: [{step:1,title:'Design',description:'Calculate movement requirements'},{step:2,title:'Install',description:'Place temporary joint systems'},{step:3,title:'Monitor',description:'Check performance during works'},{step:4,title:'Remove',description:'Remove or finalize joints'}],
      commonApplications: 'Temporary moving joints are essential during staged construction of large commercial buildings, allowing independent movement between construction phases before permanent joints are installed.',
      whyChooseTRD: 'TRD Remedial designs bespoke temporary joint solutions based on structural engineering calculations. Our temporary joint solutions have successfully accommodated movements exceeding 50mm in major infrastructure projects.',
      serviceArea: 'Servicing major construction projects across Sydney metro: CBD commercial developments, Eastern Suburbs residential expansions, Western Sydney industrial facilities.',
      relatedServiceSlugs: ['structural-alterations','concrete-cutting','crack-injection'],
      faqs: [
        {question:'How long does temporary joint installation take?',answer:'Most temporary joint installations complete in 1-3 days depending on joint length and complexity.'},
        {question:'How much movement can temporary joints accommodate?',answer:'Our engineered temporary joint systems accommodate movements up to 50-75mm depending on design.'},
        {question:'Why are temporary joints needed during construction?',answer:'Concrete experiences movement from thermal expansion, shrinkage, and differential settlement. Temporary joints accommodate these movements safely.'},
        {question:'How much do temporary moving joints cost?',answer:'Temporary joint costs typically range $150-300 per linear meter including design, installation, and monitoring.'},
      ],
      testimonials: [
        {quote:"TRD designed and installed temporary moving joints for our staged apartment complex construction. Their engineering calculations were precise, and the joints accommodated all expected movements.",role:'Project Manager',company:'Renaissance Development Group',projectType:'Multi-Stage Residential Complex - 12 Stages'},
        {quote:"During our shopping center expansion, TRD's temporary joint system successfully bridged the connection between our existing slab and new construction. Zero cracking despite thermal cycling.",role:'Construction Director',company:'Westpoint Shopping Centre',projectType:'Commercial Expansion - Phased Construction'},
      ],
      order: 7,
    }}),
    prisma.service.create({ data: {
      slug: 'post-tension-truncation', title: 'Post Tension Truncation', tagline: 'Precision cable identification and safe truncation',
      description: 'Professional post-tension truncation services in Sydney. Our expert team uses GPR scanning technology to precisely locate post-tension cables before performing safe truncation for structural modifications, renovations, and compliance requirements across residential and commercial properties in NSW.',
      features: ['GPR cable detection','Precision truncation','Structural assessment','Safe cable de-tensioning','Concrete restoration','Compliance documentation'],
      benefits: ['Non-destructive cable detection','Zero structural compromise','Full compliance documentation','Minimal site disruption'],
      icon: '/images/services/post-tension-truncation/feature.jpg', visual: '/images/services/post-tension-truncation/hero.jpg',
      heroImage: '/images/services/post-tension-truncation/hero.jpg', featureImage: '/images/services/post-tension-truncation/feature.jpg', processImage: '/images/services/post-tension-truncation/process.jpg',
      stats: [{value:'100+',label:'Cables Truncated'},{value:'0',label:'Structural Incidents'},{value:'100%',label:'Compliance Rate'}],
      process: [{step:1,title:'GPR Scanning',description:'Advanced ground-penetrating radar survey to map all post-tension cables, rebar, and conduits within the slab.'},{step:2,title:'Cable Identification',description:'Precise marking and documentation of cable locations, stress levels, and truncation points.'},{step:3,title:'Safe De-tensioning',description:'Controlled release of cable tension using specialized equipment to prevent structural shock.'},{step:4,title:'Precision Truncation',description:'Clean cable cutting at designated points with minimal concrete disturbance.'},{step:5,title:'Concrete Restoration',description:'Professional grouting and restoration of truncation pockets to restore slab integrity.'}],
      commonApplications: 'Post-tension truncation is essential for residential renovations, commercial fit-outs, structural modifications, and compliance rectification in post-tensioned buildings.',
      whyChooseTRD: 'TRD Remedial combines advanced GPR scanning technology with decades of structural engineering expertise to deliver safe, precise post-tension truncation. Our zero-incident track record and full compliance documentation give confidence in every project.',
      serviceArea: 'We provide post-tension truncation services across Greater Sydney, including Rouse Hill, Marsden Park, Schofields, and the broader Western Sydney region, as well as the CBD, North Shore, and Eastern Suburbs.',
      relatedServiceSlugs: ['slab-scanning','concrete-cutting','structural-alterations'],
      faqs: [
        {question:'What is post-tension truncation?',answer:'Post-tension truncation is the controlled process of identifying, de-tensioning, and cutting post-tension cables within concrete slabs.'},
        {question:'Is post-tension truncation safe?',answer:'When performed by experienced professionals using GPR scanning and controlled de-tensioning procedures, post-tension truncation is completely safe. TRD Remedial has a zero-incident track record.'},
        {question:'How long does post-tension truncation take?',answer:'A typical residential truncation project takes 2-5 days, including scanning, truncation, and concrete restoration.'},
      ],
      testimonials: [
        {quote:"TRD identified and safely truncated multiple post-tension cables for our renovation project. Their GPR scanning technology and expertise gave us complete confidence.",role:'Project Manager',company:'Western Sydney Development',projectType:'Residential Renovation'},
      ],
      order: 8,
    }}),
  ]);
  console.log(`Created ${services.length} services`);

  // 3. Build service slug-to-ID map
  const serviceMap = new Map(services.map(s => [s.slug, s.id]));

  // ============================================================
  // 4. SEED PROJECTS (12 projects)
  // ============================================================
  console.log('Seeding projects...');
  const projectsRaw = [
    {slug:'caringbah-pavilion-carbon-fibre',name:'Carbon Fibre Structural Strengthening \u2013 Caringbah Pavilion',location:'41\u201351 President Avenue, Caringbah NSW',date:'2026',serviceType:'Carbon Fibre Design, Supply & Installation',svcSlug:'structural-strengthening',categories:['Commercial','Structural','Construction'],featuredImage:'/images/projects/caringbah-pavilion/featured.jpg',thumbnailImage:'/images/projects/caringbah-pavilion/thumbnail.jpg',heroImage:'/images/projects/caringbah-pavilion/hero.jpg',tagline:'Carbon fibre strengthening enabling major mid-construction design changes without steel beams, demolition, or delays',challenge:'During construction, the developer approved a ~40% increase in unit yield and the addition of a large communal pool and amenities zone at ground level. These changes introduced significant new structural loads not included in the original design, particularly at slab, beam, and column\u2013slab connection zones. The project structural engineer required a strengthening system capable of delivering high stiffness and load capacity within very limited head-height clearances. Conventional steel strengthening was ruled out due to clearance, constructability, and aesthetic limitations.',solution:'TRD Remedial proposed, engineered, supplied, and installed a bespoke Carbon Fibre Reinforced Polymer (CFRP) strengthening system tailored to the revised load demands. The scope included strengthening of suspended slabs, carbon fibre reinforcement to beams, and localised strengthening of drop panels at column\u2013slab connections. Carbon fibre was selected due to its high strength-to-weight ratio, minimal impact on head height, rapid installation timeframe, and compatibility with fire-rated and architectural finishes.',results:'From concept to completion, the entire carbon fibre strengthening scope was delivered in approximately two weeks. The solution required minimal surface preparation, caused no disruption to parallel trades, had no impact to the overall construction program, and eliminated the need for steel fabrication or heavy lifting. The carbon fibre strengthening works enabled the developer to increase residential unit numbers, add a pool and communal amenities area, achieve full structural compliance, avoid steel strengthening systems, and maintain architectural intent and clearance requirements.',stats:[{value:'~40%',label:'Unit Yield Increase'},{value:'2wk',label:'Concept to Completion'},{value:'0',label:'Steel Beams Required'}],galleryImages:[{url:'/images/projects/caringbah-pavilion/gallery-01.jpg',alt:'Carbon fibre reinforcement applied to suspended slab'},{url:'/images/projects/caringbah-pavilion/gallery-02.jpg',alt:'CFRP installation at slab and beam zones'},{url:'/images/projects/caringbah-pavilion/gallery-03.jpg',alt:'Carbon fibre strengthening at column-slab connection'},{url:'/images/projects/caringbah-pavilion/gallery-04.jpg',alt:'Low-profile carbon fibre solution beneath fire-rated construction'},{url:'/images/projects/caringbah-pavilion/gallery-05.jpg',alt:'In-progress CFRP installation within a live construction environment'},{url:'/images/projects/caringbah-pavilion/gallery-06.jpg',alt:'Completed carbon fibre structural strengthening system'},{url:'/images/projects/caringbah-pavilion/before-01.jpg',alt:'Bespoke CFRP strengthening solution enabling mid-construction design changes'}],timeline:'Approximately 2 weeks (concept to completion)',metaTitle:'Carbon Fibre Structural Strengthening \u2013 Caringbah Pavilion NSW | TRD Remedial',metaDescription:'TRD Remedial delivered CFRP structural strengthening at Caringbah Pavilion, enabling a ~40% unit yield increase and ground-floor pool addition during live construction.',order:0},
    {slug:'schofields-54-advanced',name:'Structural Remediation - 54 Advanced Street Schofields',location:'Schofields, NSW',date:'June 23, 2025',serviceType:'Structural Remediation',svcSlug:'structural-alterations',categories:['Residential','Structural'],featuredImage:'/images/projects/schofields-54-advanced/featured.jpg',thumbnailImage:'/images/projects/schofields-54-advanced/thumbnail.jpg',heroImage:'/images/projects/schofields-54-advanced/hero.jpg',tagline:'Comprehensive structural remediation for residential property',challenge:'Extensive structural cracking from foundation settlement and reactive soil movement threatened this occupied family home. Investigation revealed 40mm differential settlement affecting walls, slabs, and columns. Traditional underpinning would cost $180,000 and require 3-month family evacuation.',solution:'We implemented a three-phase strategy: hydraulic pier installation correcting 40mm settlement, epoxy injection for slab cracks, carbon fibre mesh for wall repairs, and structural grout for column stabilization. All work was phased room-by-room over 2 years, allowing continuous occupancy.',results:'The remediation stabilized the property with zero settlement in 12 months post-completion. Foundation leveling restored the building to within 2mm of design tolerance. The family avoided $60,000+ in temporary accommodation costs by remaining in residence throughout. Property valuation increased 15% following structural certification.',stats:[{value:'2yr',label:'Phased Project Timeline'},{value:'100%',label:'Structural Integrity Restored'},{value:'0',label:'Occupant Disruptions'}],galleryImages:[{url:'/images/projects/schofields-54-advanced/gallery-01.jpg',alt:'Initial structural assessment documenting crack patterns'},{url:'/images/projects/schofields-54-advanced/gallery-02.jpg',alt:'Hydraulic pier installation beneath foundation'},{url:'/images/projects/schofields-54-advanced/gallery-03.jpg',alt:'Deep-penetrating resin injection to stabilize foundation piers'},{url:'/images/projects/schofields-54-advanced/gallery-04.jpg',alt:'Epoxy injection process for slab crack repair'},{url:'/images/projects/schofields-54-advanced/gallery-05.jpg',alt:'Carbon fibre mesh reinforcement application'},{url:'/images/projects/schofields-54-advanced/gallery-06.jpg',alt:'Specialized structural grout injection for column stabilization'},{url:'/images/projects/schofields-54-advanced/gallery-08.jpg',alt:'Final structural inspection and completion certification'}],timeline:'2 years (phased 2023-2025)',order:1},
    {slug:'enfield-curtain-wall',name:'Curtain Wall Waterproofing & Defect Rectification \u2014 Enfield',location:'Enfield, NSW',date:'2025',serviceType:'Curtain Wall Waterproofing Injection',svcSlug:'curtain-wall-injection',categories:['Commercial','Waterproofing','Defect Rectification'],featuredImage:'/images/projects/enfield-curtain-wall/featured.jpg',thumbnailImage:'/images/projects/enfield-curtain-wall/thumbnail.jpg',heroImage:'/images/projects/enfield-curtain-wall/hero.jpg',tagline:'Curtain wall injection eliminating persistent basement water ingress through brick masonry in an occupied strata commercial building',challenge:'The basement level carpark of a commercial development at 194 Liverpool Road, Enfield, was experiencing persistent water ingress through its perimeter brick walls. Moisture was penetrating the brick masonry and entering the underground carpark, with concrete cracking contributing further to the water problem.',solution:'TRD Remedial began with a thorough site inspection and condition assessment of the affected basement walls. Detailed crack mapping was carried out across the perimeter. Hydrophobic epoxy resin was injected under controlled pressure into and behind the brick wall, creating a flexible, water-repelling barrier.',results:'Water ingress was fully arrested upon completion of the curtain wall injection system. The developer\'s warranty defect was formally closed within four weeks of TRD Remedial\'s initial engagement. The treatment protects the building\'s structural concrete elements from ongoing moisture damage.',stats:[{value:'4wk',label:'Investigation to Completion'},{value:'100%',label:'Water Ingress Stopped'},{value:'1',label:'Mobilisation Required'}],galleryImages:[{url:'/images/projects/enfield-curtain-wall/gallery-01.jpg',alt:'Thermal imaging moisture mapping'},{url:'/images/projects/enfield-curtain-wall/gallery-02.jpg',alt:'Precision drill entry points preparation'},{url:'/images/projects/enfield-curtain-wall/gallery-03.jpg',alt:'Hydrophilic polyurethane resin injection process'},{url:'/images/projects/enfield-curtain-wall/gallery-04.jpg',alt:'Controlled pressure resin injection'},{url:'/images/projects/enfield-curtain-wall/gallery-05.jpg',alt:'Injection points finished flush'},{url:'/images/projects/enfield-curtain-wall/gallery-06.jpg',alt:'Water spray testing confirming 100% effectiveness'},{url:'/images/projects/enfield-curtain-wall/before-01.jpg',alt:'Completed curtain wall with invisible repairs'}],timeline:'4 Weeks (investigation, reporting & remediation)',metaTitle:'Curtain Wall Waterproofing Injection \u2014 Enfield Commercial Building NSW | TRD Remedial',metaDescription:'TRD Remedial eliminated persistent basement water ingress through brick masonry at an Enfield commercial building using curtain wall hydrophobic epoxy injection.',order:2},
    {slug:'waitara-multi-service',name:'Waitara Multi-Service Remediation',location:'Waitara, NSW',date:'December 3, 2024',serviceType:'Multi-Service Remediation',svcSlug:'crack-injection',categories:['Residential','Structural'],featuredImage:'/images/projects/waitara-multi-service/featured.jpg',thumbnailImage:'/images/projects/waitara-multi-service/thumbnail.jpg',heroImage:'/images/projects/waitara-multi-service/hero.jpg',tagline:'Multi-service remediation combining crack injection and steel reinforcing',challenge:'This Waitara residential property required comprehensive structural remediation across two distinct but related issues discovered during a pre-purchase building inspection. Initial assessment revealed extensive slab-on-ground cracking throughout the ground floor. Subsequent investigation uncovered additional concerns with undersized structural steel supports in the basement level.',solution:'We developed an integrated remediation strategy coordinating both service types within a single 5-week phased timeline. Phase one addressed slab-on-ground crack injection. Phase two involved designing and installing custom structural steel reinforcement in the basement level.',results:'The multi-service remediation successfully addressed both structural concerns within the 5-week timeline. All slab cracks were permanently sealed. The supplementary steel reinforcing increased basement structural capacity by 40%. The integrated approach delivered $45,000 in cost savings (30% reduction).',stats:[{value:'2',label:'Services Combined'},{value:'5wk',label:'Integrated Timeline'},{value:'30%',label:'Cost Savings'}],galleryImages:[{url:'/images/projects/waitara-multi-service/gallery-01.jpg',alt:'Initial structural assessment documenting slab crack patterns'},{url:'/images/projects/waitara-multi-service/gallery-02.jpg',alt:'Epoxy resin injection process for slab crack repair'},{url:'/images/projects/waitara-multi-service/gallery-03.jpg',alt:'High-strength epoxy injection creating structural bond'},{url:'/images/projects/waitara-multi-service/gallery-04.jpg',alt:'Completed slab crack injection showing permanent sealing'},{url:'/images/projects/waitara-multi-service/gallery-05.jpg',alt:'Custom structural steel reinforcement fabrication'},{url:'/images/projects/waitara-multi-service/gallery-06.jpg',alt:'Structural steel member installation with certified welding'},{url:'/images/projects/waitara-multi-service/gallery-07.jpg',alt:'Completed steel reinforcing with corrosion protection coating'}],timeline:'5 weeks (phased October-December 2024)',order:3},
    {slug:'northbridge-structural-wall',name:'Structural Wall Repairs & Building Commissioner Compliance \u2014 Northbridge',location:'Northbridge, NSW',date:'2025',serviceType:'Structural Crack Repair & Compliance',svcSlug:'structural-alterations',categories:['Residential','Structural','Compliance'],featuredImage:'/images/projects/northbridge-structural-wall/featured.jpg',thumbnailImage:'/images/projects/northbridge-structural-wall/thumbnail.jpg',heroImage:'/images/projects/northbridge-structural-wall/hero.jpg',tagline:'Fire stair wall repair across four levels with full NSW Building Commissioner compliance achieved in five days',challenge:'A reinforced concrete fire stair wall across four levels of an occupied residential building in Northbridge was displaying structural defects: visible cracking, localised wall movement and bowing, and concrete spalling with delamination. The NSW Building Commissioner\'s office had issued a formal rectification order.',solution:'TRD Remedial was engaged to develop and deliver the repair methodology across all four levels. The full repair program was executed in five days and included epoxy crack injection, concrete spalling repairs, reprofiling and rendering, and concrete cutting with localised demolition and reinstatement.',results:'The full repair scope was completed within five days. Structural cracking was stabilised, all affected wall sections reinstated, and the building returned to compliance. The rectification order issued by the NSW Building Commissioner\'s office was formally closed.',stats:[{value:'4',label:'Levels Repaired'},{value:'5',label:'Days to Complete'},{value:'Closed',label:'Commissioner Order'}],galleryImages:[{url:'/images/projects/northbridge-structural-wall/gallery-01.jpg',alt:'Initial heritage assessment and structural crack documentation'},{url:'/images/projects/northbridge-structural-wall/gallery-02.jpg',alt:'Low-pressure epoxy injection technique'},{url:'/images/projects/northbridge-structural-wall/gallery-03.jpg',alt:'Stainless steel helical bar preparation'},{url:'/images/projects/northbridge-structural-wall/gallery-04.jpg',alt:'Helical bar installation within existing mortar joints'},{url:'/images/projects/northbridge-structural-wall/gallery-05.jpg',alt:'Custom lime mortar mixing matching original composition'},{url:'/images/projects/northbridge-structural-wall/gallery-06.jpg',alt:'Heritage-trained mason applying color-matched mortar repairs'},{url:'/images/projects/northbridge-structural-wall/gallery-08.jpg',alt:'Completed structural repairs with invisible reinforcement'}],timeline:'5 Days',metaTitle:'Structural Wall Repairs & Building Commissioner Compliance \u2014 Northbridge NSW | TRD Remedial',metaDescription:'TRD Remedial repaired a reinforced concrete fire stair wall across four levels in five days, closing a NSW Building Commissioner rectification order.',order:4},
    {slug:'rouse-hill-slab-scanning',name:'Post-Tensioned Slab Scanning & Controlled Penetration \u2014 Rouse Hill',location:'Rouse Hill, NSW',date:'2025',serviceType:'Slab Scanning & Post-Tensioned Concrete',svcSlug:'slab-scanning',categories:['Commercial','Diagnostic','Construction'],featuredImage:'/images/projects/rouse-hill-slab-scanning/featured.jpg',thumbnailImage:'/images/projects/rouse-hill-slab-scanning/thumbnail.jpg',heroImage:'/images/projects/rouse-hill-slab-scanning/hero.jpg',tagline:'GPRS scanning and controlled tendon truncation enabling safe penetrations through 500mm post-tensioned slabs across three levels',challenge:'During fitout of a multi-level construction project at 25 Macquarie Road, Rouse Hill, a critical oversight was identified: a 2m x 1.5m penetration required for essential building services had been missed across three levels of a 500mm thick post-tensioned slab.',solution:'TRD Remedial mobilised with GPRS scanning technology to precisely map the post-tension tendons and reinforcement within the slab across all three levels. Where tendons intersected with proposed openings, the team carried out a controlled, engineer-directed truncation process.',results:'All three penetrations were successfully introduced within one week, on time and without incident. Critical services were installed as per the original approved design. The work preserved the structural integrity of the post-tensioned slab system across all three levels.',stats:[{value:'3',label:'Levels Scanned & Cut'},{value:'500mm',label:'PT Slab Thickness'},{value:'1wk',label:'Completed In'}],galleryImages:[{url:'/images/projects/rouse-hill-slab-scanning/gallery-01.jpg',alt:'Advanced GPR equipment setup'},{url:'/images/projects/rouse-hill-slab-scanning/gallery-02.jpg',alt:'Systematic grid scanning across proposed floor opening'},{url:'/images/projects/rouse-hill-slab-scanning/gallery-03.jpg',alt:'Real-time GPR display showing cable position and depth'},{url:'/images/projects/rouse-hill-slab-scanning/gallery-04.jpg',alt:'3D structural mapping visualization'},{url:'/images/projects/rouse-hill-slab-scanning/gallery-05.jpg',alt:'Surface marking of verified safe-cutting zones'},{url:'/images/projects/rouse-hill-slab-scanning/gallery-06.jpg',alt:'On-site handheld GPR verification during cutting'},{url:'/images/projects/rouse-hill-slab-scanning/gallery-07.jpg',alt:'Completed cable truncation with zero incidents'}],timeline:'1 Week',metaTitle:'Post-Tensioned Slab Scanning & Controlled Penetration \u2014 Rouse Hill NSW | TRD Remedial',metaDescription:'TRD Remedial delivered GPRS scanning and controlled tendon truncation across three levels of 500mm post-tensioned slab at Rouse Hill.',order:5},
    {slug:'pelican-road-schofields',name:'Large-Scale Defect Rectification \u2014 Pelican Road, Schofields',location:'Schofields, NSW',date:'2025',serviceType:'Crack Injection, Waterproofing & Building Commissioner Compliance',svcSlug:'crack-injection',categories:['Residential','Structural','Compliance'],featuredImage:'/images/projects/pelican-road-schofields/featured.jpg',thumbnailImage:'/images/projects/pelican-road-schofields/thumbnail.jpg',heroImage:'/images/projects/pelican-road-schofields/hero.jpg',tagline:'Five buildings, three basements, 3,000+ linear metres of cracking rectified under NSW Building Commissioner order',challenge:'Following handover of five residential buildings at Pelican Road, Schofields, a significant range of defects were identified across the development. Over 3,000 linear metres of cracking were identified. The NSW Building Commissioner\'s office had issued a formal rectification order.',solution:'TRD Remedial developed a comprehensive repair methodology reviewed and approved by the structural engineer of record. The scope addressed every defect category across all five buildings and three basement levels, delivered sequentially across two months.',results:'All defects were successfully rectified across all five buildings within the two-month staged program. The formal rectification order was fully answered and closed. Car parks remained accessible throughout, and residents experienced minimal disruption.',stats:[{value:'3,000+',label:'Linear Metres Repaired'},{value:'5',label:'Buildings Rectified'},{value:'2mo',label:'Staged Program'}],galleryImages:[{url:'/images/projects/pelican-road-schofields/gallery-01.jpg',alt:'Initial geotechnical assessment'},{url:'/images/projects/pelican-road-schofields/gallery-02.jpg',alt:'Deep resin injection for soil stabilization'},{url:'/images/projects/pelican-road-schofields/gallery-03.jpg',alt:'Flexible epoxy crack injection using pressure-monitored equipment'},{url:'/images/projects/pelican-road-schofields/gallery-04.jpg',alt:'Coordinated remediation work across multiple properties'},{url:'/images/projects/pelican-road-schofields/gallery-05.jpg',alt:'Integrated stormwater drainage system installation'},{url:'/images/projects/pelican-road-schofields/gallery-06.jpg',alt:'Final structural inspection and certification'},{url:'/images/projects/pelican-road-schofields/before-01.jpg',alt:'Estate-wide solution completed'}],timeline:'2 Months (staged, sequential)',metaTitle:'Large-Scale Defect Rectification \u2014 Pelican Road, Schofields NSW | TRD Remedial',metaDescription:'TRD Remedial rectified 3,000+ linear metres of cracking across five residential buildings, closing a NSW Building Commissioner rectification order within two months.',order:6},
    {slug:'marsden-park-suspended-slab',name:'Marsden Park Development - Structural Wall Works',location:'Marsden Park, NSW',date:'February 18, 2025',serviceType:'Structural Wall Works',svcSlug:'structural-alterations',categories:['Residential','Structural','Urban'],featuredImage:'/images/projects/marsden-park-suspended-slab/featured.jpg',thumbnailImage:'/images/projects/marsden-park-suspended-slab/thumbnail.jpg',heroImage:'/images/projects/marsden-park-suspended-slab/hero.jpg',tagline:'Development-wide structural wall works across multiple residential lots',challenge:'Systematic structural wall defects across three lots from inadequate expansion joint detailing and temperature fluctuations. The developer faced mounting pressure from three homeowners threatening legal action.',solution:'We treated all three lots as an integrated project while customizing repair methodologies to each property\'s conditions. Comprehensive crack assessment led to engineered epoxy injection combined with helical stainless steel bar stitching where appropriate.',results:'The development-wide remediation addressed all defects within the $120,000 budget and completed in 12 weeks. All homeowners remained in residence. Structural testing confirmed 100% wall integrity restoration. All three homeowners withdrew legal action.',stats:[{value:'3',label:'Lots Completed'},{value:'12wk',label:'Development Timeline'},{value:'33%',label:'Cost Savings vs Traditional'}],galleryImages:[{url:'/images/projects/marsden-park-suspended-slab/gallery-01.jpg',alt:'Comprehensive crack assessment across three lots'},{url:'/images/projects/marsden-park-suspended-slab/gallery-02.jpg',alt:'High-performance epoxy injection for dynamic crack repair'},{url:'/images/projects/marsden-park-suspended-slab/gallery-03.jpg',alt:'Helical stainless steel bar installation'},{url:'/images/projects/marsden-park-suspended-slab/gallery-04.jpg',alt:'Modern expansion joint reconstruction'},{url:'/images/projects/marsden-park-suspended-slab/before-01.jpg',alt:'Original defects from temperature movement'},{url:'/images/projects/marsden-park-suspended-slab/after-01.jpg',alt:'Restored structural wall with upgraded expansion joints'},{url:'/images/projects/marsden-park-suspended-slab/featured.jpg',alt:'Completed multi-lot remediation'}],timeline:'12 months (February 2024 - February 2025, phased)',order:7},
    {slug:'jacaranda-construction-joints',name:'Jacaranda Construction Joints Repairs',location:'Jacaranda (Sydney), NSW',date:'January 29, 2024',serviceType:'Construction Joints Repairs',svcSlug:'concrete-repairs',categories:['Residential','Structural','Precision'],featuredImage:'/images/projects/jacaranda-construction-joints/featured.jpg',thumbnailImage:'/images/projects/jacaranda-construction-joints/thumbnail.jpg',heroImage:'/images/projects/jacaranda-construction-joints/hero.jpg',tagline:'Specialized construction joint repairs for residential property',challenge:'Systematic failure of construction joints throughout the concrete slab from inadequate sealant specification caused joint separation and water infiltration. Visible moisture staining affected $25,000+ in finished timber flooring and internal walls.',solution:'We deployed specialized construction joint repair using advanced polyurethane sealant systems engineered for high-movement joints. Complete removal of failed sealant, thorough industrial vacuum cleaning, and precise application of premium-grade flexible polyurethane designed for \u00b112mm joint movement tolerance.',results:'The specialized repairs eliminated all water infiltration with zero ongoing ingress confirmed by moisture testing 30 days post-completion. The single-day completion allowed minimal family disruption. The $18,000 solution saved 85% versus the $120,000 slab reconstruction alternative.',stats:[{value:'1-day',label:'Completion Timeline'},{value:'85%',label:'Cost Savings vs Reconstruction'},{value:'100%',label:'Joint Integrity Restored'}],galleryImages:[{url:'/images/projects/jacaranda-construction-joints/gallery-01.jpg',alt:'Complete removal of failed original sealant'},{url:'/images/projects/jacaranda-construction-joints/gallery-02.jpg',alt:'Premium polyurethane sealant application'},{url:'/images/projects/jacaranda-construction-joints/gallery-03.jpg',alt:'Tooled concave joint profiles'},{url:'/images/projects/jacaranda-construction-joints/before-01.jpg',alt:'Failed construction joints showing separation'},{url:'/images/projects/jacaranda-construction-joints/after-01.jpg',alt:'Premium polyurethane joint sealing system completed'},{url:'/images/projects/jacaranda-construction-joints/featured.jpg',alt:'Upgraded joint system'},{url:'/images/projects/jacaranda-construction-joints/thumbnail.jpg',alt:'High-end finish quality maintained'}],timeline:'Single day (January 29, 2024)',order:8},
    {slug:'pemulwuy-suspended-slab',name:'Pemulwuy Suspended Slab Crack Injection',location:'Pemulwuy, NSW',date:'November 27, 2025',serviceType:'Suspended Slab Crack Injection',svcSlug:'crack-injection',categories:['Residential','Structural'],featuredImage:'/images/projects/pemulwuy-suspended-slab/featured.jpg',thumbnailImage:'/images/projects/pemulwuy-suspended-slab/thumbnail.jpg',heroImage:'/images/projects/pemulwuy-suspended-slab/hero.jpg',tagline:'Overhead suspended slab crack injection with minimal occupant disruption',challenge:'Extensive cracking in the suspended concrete slab system from reinforcement placement deficiencies and concrete shrinkage required immediate stabilization. Overhead crack injection on the underside of the first-floor slab presented gravity-defying technical challenges.',solution:'We deployed specialized overhead crack injection using low-viscosity epoxy resin engineered for upward penetration. Innovative portable injection platforms eliminated traditional scaffolding requirements, allowing elderly residents to remain comfortably in their home.',results:'The overhead injection stabilized all 40+ cracks with 100% penetration confirmed through structural testing. The portable platform approach eliminated scaffolding costs and enabled elderly residents to remain in their home throughout the 2-day timeline.',stats:[{value:'Overhead',label:'Technical Challenge'},{value:'2-day',label:'Completion Timeline'},{value:'0',label:'Days Evacuation Required'}],galleryImages:[{url:'/images/projects/pemulwuy-suspended-slab/gallery-01.jpg',alt:'Portable injection platform setup for overhead slab crack access'},{url:'/images/projects/pemulwuy-suspended-slab/gallery-02.jpg',alt:'Low-viscosity epoxy resin injection into overhead slab cracks'},{url:'/images/projects/pemulwuy-suspended-slab/gallery-03.jpg',alt:'Pressure-monitored injection ensuring complete void filling'},{url:'/images/projects/pemulwuy-suspended-slab/before-01.jpg',alt:'Suspended slab cracking visible from ground-floor ceiling'},{url:'/images/projects/pemulwuy-suspended-slab/after-01.jpg',alt:'Stabilized overhead slab with complete epoxy penetration'},{url:'/images/projects/pemulwuy-suspended-slab/featured.jpg',alt:'Completed overhead injection without occupant displacement'},{url:'/images/projects/pemulwuy-suspended-slab/thumbnail.jpg',alt:'Innovative portable platform technology'}],timeline:'2 days (November 26-27, 2025)',order:9},
    {slug:'one-the-waterfront',name:'One The Waterfront \u2014 Structural Alterations & Multi-Service Works',location:'Wentworth Point, NSW',date:'2025',serviceType:'Structural Alterations & Multi-Service',svcSlug:'structural-alterations',categories:['Commercial','Structural','Construction'],featuredImage:'/images/projects/florence-capri-complex/featured.jpg',thumbnailImage:'/images/projects/florence-capri-complex/thumbnail.jpg',heroImage:'/images/projects/florence-capri-complex/hero.jpg',tagline:'Expert structural reconfiguration of an abandoned development \u2014 40 columns removed, 5,000 linear metres of cutting, 2,000 core holes in five weeks',challenge:'When Masscon acquired the existing One The Waterfront development \u2014 a partially completed complex previously abandoned by another developer \u2014 they inherited a structural challenge of significant scale. TRD Remedial was tasked with column removal, large slab penetrations for new stair cores and lift shafts, stormwater relining, and structural reinforcement.',solution:'TRD Remedial delivered an exceptional scope: 2,000 core holes drilled for shoring, 5,000 linear metres of concrete cutting through four suspended basement slabs and one slab-on-ground. 40 columns were removed with full propping and temporary works. Full stormwater pipe relining was completed.',results:'Despite the enormous scope, TRD Remedial completed the entire project in just five weeks, with no incidents, no delays, and no disruption to neighbouring occupied buildings. One The Waterfront stands as a testament to what is possible when expert planning and structural precision come together.',stats:[{value:'2,000',label:'Core Holes Drilled'},{value:'5,000',label:'Linear Metres Cut'},{value:'40',label:'Columns Removed'}],galleryImages:[{url:'/images/projects/florence-capri-complex/gallery-01.jpg',alt:'Column removal with full propping'},{url:'/images/projects/florence-capri-complex/gallery-02.jpg',alt:'Precision core drilling for shoring'},{url:'/images/projects/florence-capri-complex/gallery-03.jpg',alt:'Concrete cutting through suspended basement slab'},{url:'/images/projects/florence-capri-complex/before-01.jpg',alt:'Formwork catch decks for safety'},{url:'/images/projects/florence-capri-complex/after-01.jpg',alt:'New stair core penetration from Basement 4 to Ground Floor'},{url:'/images/projects/florence-capri-complex/featured.jpg',alt:'Completed structural reconfiguration'},{url:'/images/projects/florence-capri-complex/thumbnail.jpg',alt:'Aerial view of development'}],timeline:'5 Weeks',metaTitle:'One The Waterfront \u2014 Structural Alterations & Multi-Service Works | TRD Remedial',metaDescription:'TRD Remedial delivered 2,000 core holes, 5,000 linear metres of concrete cutting, and 40 column removals at One The Waterfront \u2014 completed in five weeks with zero incidents.',order:10},
    {slug:'zetland-surelock',name:'SureLok\u2122 Temporary Movement Joints \u2014 Zetland',location:'Zetland, NSW',date:'2025',serviceType:'Post-Tensioning & SureLok\u2122 TMJ',svcSlug:'temporary-moving-joints',categories:['Commercial','Construction','Post-Tensioning'],featuredImage:'/images/projects/zetland-surelock/featured.jpg',thumbnailImage:'/images/projects/zetland-surelock/thumbnail.jpg',heroImage:'/images/projects/zetland-surelock/hero.jpg',tagline:'World-first SureLok\u2122 temporary movement joint system delivered as part of TRD Group\'s integrated post-tensioning scope',challenge:'On a live construction site in Zetland, TRD Group was engaged as the post-tensioning contractor. As part of the broader scope, TRD managed the supply and installation of SureLok\u2122 Temporary Movement Joints (TMJs), eliminating the need for traditional pour strips and corbels.',solution:'SureLok\u2122 is a patented, purpose-engineered temporary movement joint system \u2014 the first of its kind to provide bi-directional temporary movement and two-axis load transfer within a single, fully sealed component, a world-first in construction joint technology.',results:'The SureLok\u2122 installation eliminated pour strips entirely, reduced construction complexity, and accelerated the program. No corbels were required. Earlier back-prop removal improved construction sequencing. All works were delivered as part of TRD Group\'s integrated post-tensioning scope.',stats:[{value:'World-First',label:'TMJ Technology'},{value:'0',label:'Pour Strips Required'},{value:'32MPa',label:'Early Back-Prop Removal'}],galleryImages:[{url:'/images/projects/zetland-surelock/gallery-01.jpg',alt:'Precision survey and joint location establishment'},{url:'/images/projects/zetland-surelock/gallery-02.jpg',alt:'Diamond core drilling creating aligned anchorage points'},{url:'/images/projects/zetland-surelock/gallery-03.jpg',alt:'Custom Surelock assembly installation'},{url:'/images/projects/zetland-surelock/before-01.jpg',alt:'Structural joints requiring temporary movement'},{url:'/images/projects/zetland-surelock/after-01.jpg',alt:'Completed Surelock temporary moving joint system'},{url:'/images/projects/zetland-surelock/featured.jpg',alt:'Precision-installed system protecting structure'},{url:'/images/projects/zetland-surelock/thumbnail.jpg',alt:'Innovative Surelock technology'}],timeline:'Part of broader post-tensioning scope',metaTitle:'SureLok\u2122 Temporary Movement Joints \u2014 Zetland NSW | TRD Remedial',metaDescription:'TRD Group delivered SureLok\u2122 TMJ installation at Zetland as part of an integrated post-tensioning scope, eliminating pour strips with world-first bi-directional movement joint technology.',order:11},
  ];

  const projects = [];
  for (const p of projectsRaw) {
    const svcId = serviceMap.get(p.svcSlug);
    if (!svcId) throw new Error(`Service not found for slug: ${p.svcSlug}`);
    const { svcSlug, ...rest } = p;
    const blur = dbSlugToBlur[p.slug] || undefined;
    projects.push(await prisma.project.create({ data: { ...rest, serviceId: svcId, blurPlaceholders: blur } }));
  }
  console.log(`Created ${projects.length} projects`);

  // ============================================================
  // 5. SEED TEAM MEMBERS (3)
  // ============================================================
  console.log('Seeding team members...');
  await Promise.all([
    prisma.teamMember.create({ data: { name: 'Fahed Nassif', title: 'Lead Structural Engineer', roles: ['Lead Structural Engineer'], expertise: ['Technical command','Structural insight','Precision engineering','Problem-solving reputation','Innovative structural solutions'], bio: "Fahed's technical command and deep structural insight make him the cornerstone of TRD's engineering excellence. Known for precision and innovative problem-solving, he tackles the most complex structural challenges with confidence and expertise.", image: 'https://ik.imagekit.io/1fovck7sy4/trd-website/images/team/fahed-nassif.webp', blurDataURL: 'data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAAAQAgCdASoKAA0ABUB8JaQAD4xwNgBM9PaAAP7ooLOTlwTjlGlfJSaJw4eMpQ5pTXLPDXaCnsdeK4degx1hCkCFTYRVo4vAAAA=', expertiseLevels: {'Technical command':99,'Structural insight':96,'Precision engineering':98,'Problem-solving reputation':94,'Innovative structural solutions':92}, order: 0, linkedIn: '#', joinedYear: '2018' }}),
    prisma.teamMember.create({ data: { name: 'Christopher Nassif', title: 'Director | Architect | Division Manager', roles: ['Director','Architect','Division Manager'], expertise: ['Future-focused vision','Architectural integration expertise','Combined design and site execution experience','Strategic project planning'], bio: "Christopher brings a unique combination of architectural design expertise and on-site execution experience. His future-focused vision drives TRD's innovative approach to structural remediation, ensuring every project meets both aesthetic and structural requirements.", image: 'https://ik.imagekit.io/1fovck7sy4/trd-website/images/team/christopher-nassif.webp', blurDataURL: 'data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADQAQCdASoKAA0ABUB8JaQAAtz+n6IegAD+6I/rCVXNH2aEKVs+t1c6xQplqQWAf5RBTsjv0Zz2gXKwFuRAjHKU4AA', expertiseLevels: {'Future-focused vision':98,'Architectural integration expertise':91,'Combined design and site execution experience':95,'Strategic project planning':94}, order: 1, linkedIn: '#', joinedYear: '2018' }}),
    prisma.teamMember.create({ data: { name: 'Charly Nassif', title: 'Builder & Director', roles: ['Licensed Builder','Director'], expertise: ['Licensed builder credentials','Construction leadership background','Results-driven approach','Safety-focused management','Game-changing outcomes'], bio: "As a licensed builder with extensive construction leadership experience, Charly ensures every TRD project is executed with precision and safety. His results-driven approach has consistently delivered game-changing outcomes for complex structural challenges.", image: 'https://ik.imagekit.io/1fovck7sy4/trd-website/images/team/charly-nassif.webp', blurDataURL: 'data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADQAQCdASoKAA0ABUB8JaQAAtz4P/TEAAD+6KC00GkgBiRdnInc1/oI5aJgeCK7X2OVjGO/Vn6VM24rFVrWHCt5dswTG4AA', expertiseLevels: {'Licensed builder credentials':96,'Construction leadership background':93,'Results-driven approach':97,'Safety-focused management':95,'Game-changing outcomes':90}, order: 2, linkedIn: '#', joinedYear: '2018' }}),
  ]);
  console.log('Created 3 team members');

  // ============================================================
  // 6. SEED COMPANY VALUES (8)
  // ============================================================
  console.log('Seeding company values...');
  await Promise.all([
    prisma.companyValue.create({ data: { title: 'PRECISION', description: 'Every measurement, every cut, every repair executed with meticulous attention to detail.', isText: true, order: 0 }}),
    prisma.companyValue.create({ data: { title: '', description: '', image: '/images/projects/pelican-road-schofields/featured.jpg', isText: false, order: 1 }}),
    prisma.companyValue.create({ data: { title: 'SAFETY', description: 'Zero-compromise approach to worker and occupant safety on every project.', isText: true, order: 2 }}),
    prisma.companyValue.create({ data: { title: '', description: '', image: '/images/projects/waitara-multi-service/featured.jpg', isText: false, order: 3 }}),
    prisma.companyValue.create({ data: { title: 'INNOVATION', description: 'Leveraging cutting-edge technology and methods for superior structural solutions.', isText: true, order: 4 }}),
    prisma.companyValue.create({ data: { title: '', description: '', image: '/images/projects/rouse-hill-slab-scanning/featured.jpg', isText: false, order: 5 }}),
    prisma.companyValue.create({ data: { title: 'INTEGRITY', description: 'Honest assessments, transparent communication, and ethical practices always.', isText: true, order: 6 }}),
    prisma.companyValue.create({ data: { title: '', description: '', image: '/images/projects/enfield-curtain-wall/featured.jpg', isText: false, order: 7 }}),
  ]);
  console.log('Created 8 company values');

  // ============================================================
  // 7. SEED FAQs (12 global)
  // ============================================================
  console.log('Seeding FAQs...');
  await Promise.all([
    prisma.fAQ.create({ data: { question: 'How long does structural remediation take?', answer: 'Project duration depends on scope: crack injection 1-2 days, concrete cutting 1-3 days, structural alterations 5-10 days, and full building remediation 2-8 weeks. We provide detailed timelines in our quotes and maintain strict project schedules to minimize disruption. Most residential repairs complete within 1 week.', category: 'process', keywords: ['remediation timeframe','how long concrete repair','structural work duration Sydney'], order: 0 }}),
    prisma.fAQ.create({ data: { question: 'Will work disrupt my business or residence?', answer: 'We minimize disruption through careful planning, dust control systems, noise reduction, and flexible scheduling including after-hours work. For commercial projects, we coordinate around business hours. Concrete cutting uses water suppression for dust-free operation. Most crack injection and scanning work causes minimal disruption.', category: 'process', keywords: ['minimal disruption concrete work','business-friendly remediation','quiet concrete services'], order: 1 }}),
    prisma.fAQ.create({ data: { question: 'What equipment and materials do you use?', answer: 'We utilise professional-grade, industry-leading equipment across all aspects of our work \u2014 from precision diamond cutting and high-pressure injection systems to ground-penetrating radar for slab scanning. All materials and resins are sourced from trusted, top-tier manufacturers and fully comply with Australian Standards, including AS 3600 and AS 3958 for structural concrete repair.', category: 'process', keywords: ['concrete repair equipment','epoxy brands used','GPR slab scanning'], order: 2 }}),
    prisma.fAQ.create({ data: { question: 'What warranty do you offer on repairs?', answer: "We stand behind every project we deliver. All work is carried out in accordance with Australian Standards and backed by our workmanship and materials guarantee. Warranty periods vary depending on the scope and nature of the repair \u2014 whether it's structural crack injection, waterproofing, or concrete cutting and patching \u2014 and are tailored to each project to ensure long-term performance and durability.", category: 'process', keywords: ['crack repair warranty','structural repair guarantee','concrete work warranty Sydney'], order: 3 }}),
    prisma.fAQ.create({ data: { question: 'When do you use epoxy vs polyurethane injection?', answer: 'Epoxy injection is used for structural crack repair where strength restoration is critical - it bonds concrete together and can restore 100% structural capacity. Polyurethane injection is used for waterproofing active leaks as it expands and forms flexible seals. We assess each crack and recommend the appropriate material based on structural requirements.', category: 'technical', keywords: ['epoxy injection','polyurethane injection','structural crack repair','waterproofing injection'], order: 4 }}),
    prisma.fAQ.create({ data: { question: 'What causes concrete cracks?', answer: 'Common causes include: structural overload, settlement/foundation movement, shrinkage during curing, thermal expansion/contraction, corrosion of reinforcement steel, freeze-thaw cycles, and poor initial construction. We identify root causes during inspection to prevent recurrence and recommend appropriate remediation methods.', category: 'technical', keywords: ['why concrete cracks','crack causes','structural damage reasons'], order: 5 }}),
    prisma.fAQ.create({ data: { question: 'How deep can slab scanning detect?', answer: 'Our GPR (Ground Penetrating Radar) scanning equipment can detect rebar, post-tension cables, conduits, and voids up to 400mm depth in concrete slabs with 99.9% accuracy. We provide on-site marking of findings and detailed scan reports. Essential before any cutting or coring to prevent costly damage to embedded services.', category: 'technical', keywords: ['GPR scanning depth','slab scanning accuracy','concrete scanning Sydney'], order: 6 }}),
    prisma.fAQ.create({ data: { question: 'How does carbon fibre strengthening work?', answer: 'Carbon Fibre Reinforced Polymer (CFRP) wrapping/plating bonds high-strength carbon fibres to concrete using structural epoxy adhesive. It increases load capacity by 50-200% while adding minimal weight. Ideal for columns, beams, and slabs requiring strength upgrades without increasing dimensions. Provides superior corrosion resistance compared to steel plate bonding.', category: 'technical', keywords: ['carbon fibre concrete','CFRP strengthening','structural strengthening Sydney'], order: 7 }}),
    prisma.fAQ.create({ data: { question: 'Do you offer emergency services?', answer: 'Yes, TRD Remedial provides 24/7 emergency response for critical structural issues, active water leaks, dangerous spalling, and urgent concrete cutting requirements. Call 0414 727 167 for immediate dispatch. Our emergency team can respond within 2-4 hours across Sydney metro and provide temporary stabilization before permanent repairs.', category: 'services', keywords: ['emergency concrete repair','24/7 remedial services','urgent structural repair Sydney'], order: 8 }}),
    prisma.fAQ.create({ data: { question: 'What areas do you service?', answer: 'We service all Sydney metropolitan areas: CBD, Eastern Suburbs, Northern Beaches, North Shore, Inner West, Western Sydney, South Sydney, Hills District, and Sutherland Shire. We also travel to Central Coast, Newcastle, Wollongong, and regional NSW for large commercial projects. Contact us for availability in your area.', category: 'services', keywords: ['Sydney remedial services','concrete repair areas','structural repair coverage'], order: 9 }}),
    prisma.fAQ.create({ data: { question: 'Do you handle both commercial and residential projects?', answer: 'Yes, we service residential homes, commercial buildings, high-rise towers, warehouses, carparks, and infrastructure projects. Our team scales from small crack repairs to multi-million dollar structural remediation projects. Recent projects include Barangaroo towers, Sydney Metro, and 500+ residential repairs.', category: 'services', keywords: ['commercial concrete repair','residential remediation','high-rise structural work'], order: 10 }}),
    prisma.fAQ.create({ data: { question: 'Do you offer ongoing maintenance contracts?', answer: 'Yes, we provide annual/bi-annual maintenance contracts for commercial buildings, strata complexes, and industrial facilities. Services include crack monitoring, sealant replacement, concrete patching, and preventative inspections. Maintenance contracts include priority scheduling, discounted rates, and detailed reporting for building managers.', category: 'services', keywords: ['concrete maintenance contract','building remediation maintenance','preventative concrete care'], order: 11 }}),
  ]);
  console.log('Created 12 FAQs');

  // ============================================================
  // 8. SEED TESTIMONIALS (3 global from CustomerFeedback)
  // ============================================================
  console.log('Seeding testimonials...');
  await Promise.all([
    prisma.testimonial.create({ data: { quote: "TRD's carbon fibre reinforcement solution saved our heritage bridge from demolition. Their technical precision and minimal disruption approach exceeded all expectations.", author: 'David Martinez', role: 'Infrastructure Director', order: 0 }}),
    prisma.testimonial.create({ data: { quote: "The GPR scanning work revealed critical structural issues we never knew existed. TRD's detailed reporting and proactive solutions prevented what could have been a catastrophic failure.", author: 'Sarah Chen', role: 'Facility Manager', order: 1 }}),
    prisma.testimonial.create({ data: { quote: "Professional, methodical, and completely reliable. TRD handled our multi-level car park crack injection with zero downtime to our operations. Exceptional project management.", author: 'Michael Thompson', role: 'Property Operations', order: 2 }}),
  ]);
  console.log('Created 3 testimonials');

  // ============================================================
  // 9. SEED SITE SETTINGS (singleton)
  // ============================================================
  console.log('Seeding site settings...');
  await prisma.siteSettings.create({ data: {
    id: 'main',
    contactEmail: 'contact@trdremedial.com.au', contactPhone: '0414 727 167', contactAddress: '2 Beryl Place Greenacre NSW 2190',
    businessHours: 'Mon-Fri 7am-5pm, 24/7 Emergency', siteTitle: 'TRD Remedial - The Remedial Experts', siteDescription: 'Expert structural strengthening, concrete repair, crack injection, and remediation services across Sydney NSW. 24/7 emergency response.',
    companyName: 'TRD Remedial', companyFullName: 'TRD Remedial - The Remedial Experts', tagline: 'THE REMEDIAL EXPERTS', subTagline: 'When structural problems demand real answers', valueProposition: "We solve challenges others can't handle",
    emergencyPhone1: '0414 727 167', emergencyPhone2: '0404 404 422', parentCompanyName: 'Tension Reinforced Developments', parentCompanyYear: '2017',
    socialLinkedIn: 'https://www.linkedin.com/company/trd-remedial', socialFacebook: 'https://www.facebook.com/trdremedial', socialInstagram: '',
    geoLatitude: -33.9000, geoLongitude: 151.0500,
    footerCta: "Let's Build Together", footerDescription: "From structural remediation to emergency repairs \u2014 we're always ready to collaborate. Reach out anytime for expert solutions.",
    bannerText: 'TRD REMEDIAL \u2022 THE REMEDIAL EXPERTS \u2022', copyrightText: '\u00a9 TRD Remedial 2025',
    navigationLinks: [{label:'Home',href:'/'},{label:'Services',href:'/services'},{label:'Projects',href:'/projects'},{label:'About',href:'/about'},{label:'Contact',href:'/contact'}],
    featuredProjectIds: ['project-001','project-011','project-006','project-007','project-003','project-012'],
  }});
  console.log('Created site settings');

  // ============================================================
  // 10. SEED PAGE CONTENT
  // ============================================================
  console.log('Seeding page content...');
  const pc = [
    {key:'home.intro.heading',value:'Why TRD Remedial?',page:'homepage',section:'intro',label:'Intro Heading',type:'text',order:0},
    {key:'home.intro.body',value:"We solve structural challenges others can't handle. As Sydney's leading structural remediation experts, we deliver precision concrete repair solutions with 8 years of proven expertise, 24/7 emergency response, and unwavering commitment to building compliance. From structural remediation Sydney projects to complex concrete repair Sydney jobs, TRD delivers solutions that last.",page:'homepage',section:'intro',label:'Intro Body',type:'text',order:1},
    {key:'home.backed.mission',value:"At TRD, we approach every project with precision and discipline. Through proven methods and technical expertise, we deliver structural solutions that reflect both our clients' needs and our commitment to excellence.",page:'homepage',section:'backed',label:'Mission Statement',type:'text',order:2},
    {key:'home.backed.description',value:"We are the remedial experts. TRD Remedial are the specialist contractors builders and developers across NSW trust when the scope is complex, the timeline is tight, and the margin for error is zero. Structural alterations, carbon fibre reinforcement, crack injection, waterproofing, concrete cutting \u2014 we deliver it all, on time and to standard. Our work spans occupied buildings, live construction sites, and Building Commissioner rectification orders. Whatever the challenge, we bring the expertise, the methodology, and the accountability to see it through. That's not a promise \u2014 it's how we operate.",page:'homepage',section:'backed',label:'Company Description',type:'text',order:3},
    {key:'home.backed.recognition',value:'Our work has been recognized by industry bodies and regulatory authorities for its safety, consistency, and attention to detail. We focus on building structural solutions that go beyond code compliance\u2014we engineer lasting performance.',page:'homepage',section:'backed',label:'Recognition Statement',type:'text',order:4},
    {key:'about.meta.documentType',value:'COMPANY PROFILE',page:'about',section:'meta',label:'Document Type',type:'text',order:0},
    {key:'about.meta.subject',value:'TRD REMEDIAL PTY LTD',page:'about',section:'meta',label:'Subject',type:'text',order:1},
    {key:'about.meta.location',value:'SYDNEY, NSW, AUSTRALIA',page:'about',section:'meta',label:'Location',type:'text',order:2},
    {key:'about.meta.established',value:'2018',page:'about',section:'meta',label:'Established',type:'text',order:3},
    {key:'about.meta.status',value:'ACTIVE',page:'about',section:'meta',label:'Status',type:'text',order:4},
    {key:'about.meta.clearance',value:'STRUCTURAL EXPERTS',page:'about',section:'meta',label:'Clearance',type:'text',order:5},
    {key:'about.evidence.image1',value:JSON.stringify({src:'/images/projects/caringbah-pavilion/featured.jpg',alt:'Caringbah Pavilion structural remediation'}),page:'about',section:'evidence',label:'Evidence Image 1',type:'json',order:0},
    {key:'about.evidence.image2',value:JSON.stringify({src:'/images/projects/pelican-road-schofields/featured.jpg',alt:'Pelican Road Schofields carbon fibre reinforcement'}),page:'about',section:'evidence',label:'Evidence Image 2',type:'json',order:1},
    {key:'about.evidence.image3',value:JSON.stringify({src:'/images/projects/northbridge-structural-wall/featured.jpg',alt:'Northbridge structural wall repair works'}),page:'about',section:'evidence',label:'Evidence Image 3',type:'json',order:2},
    {key:'about.company.description',value:"TRD Remedial is Sydney's trusted partner for structural remediation and concrete repair. With decades of combined experience, we specialize in post-tension repairs, carbon fibre reinforcement, and advanced diagnostic services that keep buildings safe and structurally sound.",page:'about',section:'mission',label:'Company Description',type:'text',order:0},
    {key:'about.company.quote',value:'When the scope is complex, the timeline is tight, and the margin for error is zero \u2014 we deliver.',page:'about',section:'mission',label:'Company Quote',type:'text',order:1},
    {key:'stats.company',value:JSON.stringify([{value:8,suffix:'+',label:'YRS',sublabel:'EXPERIENCE'},{value:3000,suffix:'+',label:'LM',sublabel:'REPAIRED'},{value:24,suffix:'/7',label:'ERT',sublabel:'RESPONSE'},{value:0,suffix:'',label:'SAFETY',sublabel:'INCIDENTS'}]),page:'global',section:'stats',label:'Company Stats',type:'json',order:0},
    {key:'stats.dataStream',value:JSON.stringify([{key:'projects.completed',value:'150+'},{key:'client.satisfaction.rate',value:'99.2%'},{key:'avg.response.time.hrs',value:'< 4'},{key:'buildings.serviced',value:'200+'},{key:'concrete.repaired.sqm',value:'50,000+'},{key:'carbon.fibre.installed.m',value:'2,500+'}]),page:'global',section:'stats',label:'Data Stream Stats',type:'json',order:1},
    {key:'footer.cta.heading',value:"Let's Build Together",page:'global',section:'footer',label:'Footer CTA Heading',type:'text',order:0},
    {key:'footer.cta.description',value:"From structural remediation to emergency repairs \u2014 we're always ready to collaborate. Reach out anytime for expert solutions.",page:'global',section:'footer',label:'Footer CTA Description',type:'text',order:1},

    // ------------------------------------------------------------------
    // ABOUT PAGE — StatsReadout individual entries
    // ------------------------------------------------------------------
    {key:'about.stats.1.value',value:'8',page:'about',section:'stats-readout',label:'Stat 1 Value',type:'text',order:0},
    {key:'about.stats.1.suffix',value:'+',page:'about',section:'stats-readout',label:'Stat 1 Suffix',type:'text',order:1},
    {key:'about.stats.1.label',value:'YRS',page:'about',section:'stats-readout',label:'Stat 1 Label',type:'text',order:2},
    {key:'about.stats.1.sublabel',value:'EXPERIENCE',page:'about',section:'stats-readout',label:'Stat 1 Sublabel',type:'text',order:3},
    {key:'about.stats.2.value',value:'3000',page:'about',section:'stats-readout',label:'Stat 2 Value',type:'text',order:4},
    {key:'about.stats.2.suffix',value:'+',page:'about',section:'stats-readout',label:'Stat 2 Suffix',type:'text',order:5},
    {key:'about.stats.2.label',value:'LM',page:'about',section:'stats-readout',label:'Stat 2 Label',type:'text',order:6},
    {key:'about.stats.2.sublabel',value:'REPAIRED',page:'about',section:'stats-readout',label:'Stat 2 Sublabel',type:'text',order:7},
    {key:'about.stats.3.value',value:'24',page:'about',section:'stats-readout',label:'Stat 3 Value',type:'text',order:8},
    {key:'about.stats.3.suffix',value:'/7',page:'about',section:'stats-readout',label:'Stat 3 Suffix',type:'text',order:9},
    {key:'about.stats.3.label',value:'ERT',page:'about',section:'stats-readout',label:'Stat 3 Label',type:'text',order:10},
    {key:'about.stats.3.sublabel',value:'RESPONSE',page:'about',section:'stats-readout',label:'Stat 3 Sublabel',type:'text',order:11},
    {key:'about.stats.4.value',value:'0',page:'about',section:'stats-readout',label:'Stat 4 Value',type:'text',order:12},
    {key:'about.stats.4.suffix',value:'',page:'about',section:'stats-readout',label:'Stat 4 Suffix',type:'text',order:13},
    {key:'about.stats.4.label',value:'SAFETY',page:'about',section:'stats-readout',label:'Stat 4 Label',type:'text',order:14},
    {key:'about.stats.4.sublabel',value:'INCIDENTS',page:'about',section:'stats-readout',label:'Stat 4 Sublabel',type:'text',order:15},
    {key:'about.datastream.1.key',value:'projects.completed',page:'about',section:'stats-readout',label:'Data Stream 1 Key',type:'text',order:16},
    {key:'about.datastream.1.value',value:'150+',page:'about',section:'stats-readout',label:'Data Stream 1 Value',type:'text',order:17},
    {key:'about.datastream.2.key',value:'client.satisfaction.rate',page:'about',section:'stats-readout',label:'Data Stream 2 Key',type:'text',order:18},
    {key:'about.datastream.2.value',value:'99.2%',page:'about',section:'stats-readout',label:'Data Stream 2 Value',type:'text',order:19},
    {key:'about.datastream.3.key',value:'avg.response.time.hrs',page:'about',section:'stats-readout',label:'Data Stream 3 Key',type:'text',order:20},
    {key:'about.datastream.3.value',value:'< 4',page:'about',section:'stats-readout',label:'Data Stream 3 Value',type:'text',order:21},
    {key:'about.datastream.4.key',value:'buildings.serviced',page:'about',section:'stats-readout',label:'Data Stream 4 Key',type:'text',order:22},
    {key:'about.datastream.4.value',value:'200+',page:'about',section:'stats-readout',label:'Data Stream 4 Value',type:'text',order:23},
    {key:'about.datastream.5.key',value:'concrete.repaired.sqm',page:'about',section:'stats-readout',label:'Data Stream 5 Key',type:'text',order:24},
    {key:'about.datastream.5.value',value:'50,000+',page:'about',section:'stats-readout',label:'Data Stream 5 Value',type:'text',order:25},
    {key:'about.datastream.6.key',value:'carbon.fibre.installed.m',page:'about',section:'stats-readout',label:'Data Stream 6 Key',type:'text',order:26},
    {key:'about.datastream.6.value',value:'2,500+',page:'about',section:'stats-readout',label:'Data Stream 6 Value',type:'text',order:27},

    // ------------------------------------------------------------------
    // ABOUT PAGE — DOC_META_LINES (typewriter lines in hero section)
    // ------------------------------------------------------------------
    {key:'about.doc-meta.1',value:'DOCUMENT TYPE:   COMPANY PROFILE',page:'about',section:'doc-meta',label:'Doc Meta Line 1 \u2014 Document Type',type:'text',order:1},
    {key:'about.doc-meta.2',value:'SUBJECT:         TRD REMEDIAL PTY LTD',page:'about',section:'doc-meta',label:'Doc Meta Line 2 \u2014 Subject',type:'text',order:2},
    {key:'about.doc-meta.3',value:'LOCATION:        SYDNEY, NSW, AUSTRALIA',page:'about',section:'doc-meta',label:'Doc Meta Line 3 \u2014 Location',type:'text',order:3},
    {key:'about.doc-meta.4',value:'ESTABLISHED:     2018',page:'about',section:'doc-meta',label:'Doc Meta Line 4 \u2014 Established',type:'text',order:4},
    {key:'about.doc-meta.5',value:'STATUS:          ACTIVE',page:'about',section:'doc-meta',label:'Doc Meta Line 5 \u2014 Status',type:'text',order:5},
    {key:'about.doc-meta.6',value:'CLEARANCE:       STRUCTURAL EXPERTS',page:'about',section:'doc-meta',label:'Doc Meta Line 6 \u2014 Clearance',type:'text',order:6},

    // ------------------------------------------------------------------
    // ABOUT PAGE — EVIDENCE_IMAGES (plain image paths)
    // ------------------------------------------------------------------
    {key:'about.evidence-image.1',value:'/images/projects/caringbah-pavilion/featured.jpg',page:'about',section:'evidence',label:'Evidence Image 1 \u2014 Caringbah Pavilion',type:'image',order:1},
    {key:'about.evidence-image.2',value:'/images/projects/pelican-road-schofields/featured.jpg',page:'about',section:'evidence',label:'Evidence Image 2 \u2014 Pelican Road Schofields',type:'image',order:2},
    {key:'about.evidence-image.3',value:'/images/projects/northbridge-structural-wall/featured.jpg',page:'about',section:'evidence',label:'Evidence Image 3 \u2014 Northbridge Structural Wall',type:'image',order:3},

    // ------------------------------------------------------------------
    // ABOUT PAGE — FILE_IDS (personnel dossier badges)
    // ------------------------------------------------------------------
    {key:'about.file-id.1',value:'CN-001',page:'about',section:'file-ids',label:'Personnel File ID 1',type:'text',order:1},
    {key:'about.file-id.2',value:'CN-002',page:'about',section:'file-ids',label:'Personnel File ID 2',type:'text',order:2},
    {key:'about.file-id.3',value:'FN-001',page:'about',section:'file-ids',label:'Personnel File ID 3',type:'text',order:3},

    // ------------------------------------------------------------------
    // HOMEPAGE — IntroStats section
    // ------------------------------------------------------------------
    {key:'home.intro.link-text',value:'Learn more about our approach \u2192',page:'home',section:'intro',label:'Intro Link Text',type:'text',order:2},

    // ------------------------------------------------------------------
    // HOMEPAGE — Hero (tagline words + CTA + media)
    // ------------------------------------------------------------------
    {key:'home.hero.tagline.1',value:'THE',page:'home',section:'hero',label:'Hero Tagline Word 1',type:'text',order:1},
    {key:'home.hero.tagline.2',value:'REMEDIAL',page:'home',section:'hero',label:'Hero Tagline Word 2',type:'text',order:2},
    {key:'home.hero.tagline.3',value:'EXPERTS',page:'home',section:'hero',label:'Hero Tagline Word 3',type:'text',order:3},
    {key:'home.hero.cta',value:'EXPLORE OUR SERVICES',page:'home',section:'hero',label:'Hero CTA Text',type:'text',order:4},
    {key:'home.hero.video',value:'/videos/hero-video',page:'home',section:'hero',label:'Hero Video Path',type:'video',order:5},
    {key:'home.hero.poster',value:'/videos/hero-poster.webp',page:'home',section:'hero',label:'Hero Video Poster',type:'image',order:6},

    // ------------------------------------------------------------------
    // HOMEPAGE — ServicesSpotlight (intro words)
    // ------------------------------------------------------------------
    {key:'home.services.intro-word-1',value:'Innovative',page:'home',section:'services',label:'Services Intro Word 1',type:'text',order:1},
    {key:'home.services.intro-word-2',value:'Solutions',page:'home',section:'services',label:'Services Intro Word 2',type:'text',order:2},

    // ------------------------------------------------------------------
    // HOMEPAGE — CaseStudiesOtisValen (header text)
    // ------------------------------------------------------------------
    {key:'home.case-studies.eyebrow',value:'Proven Results, Real Projects',page:'home',section:'case-studies',label:'Case Studies Eyebrow',type:'text',order:2},
    {key:'home.case-studies.title',value:'Case Studies',page:'home',section:'case-studies',label:'Case Studies Title',type:'text',order:3},
    {key:'home.case-studies.subtitle',value:'Our Work In Action',page:'home',section:'case-studies',label:'Case Studies Subtitle',type:'text',order:4},
    {key:'home.case-studies.cta',value:'SEE MORE WORK',page:'home',section:'case-studies',label:'Case Studies CTA Button',type:'text',order:5},

    // ------------------------------------------------------------------
    // HOMEPAGE — CustomerFeedback (top bar text)
    // ------------------------------------------------------------------
    {key:'home.testimonials.label',value:'Client Testimonials',page:'home',section:'testimonials',label:'Testimonials Section Label',type:'text',order:1},
    {key:'home.testimonials.subtitle',value:'Trust & Reliability',page:'home',section:'testimonials',label:'Testimonials Subtitle',type:'text',order:2},

    // ------------------------------------------------------------------
    // HOMEPAGE — BackedByStrengthStudio (mission section paragraphs + image)
    // ------------------------------------------------------------------
    {key:'home.mission.title',value:'Backed by Strength',page:'home',section:'mission',label:'Mission Section Title',type:'text',order:0},
    {key:'home.mission.paragraph.1',value:"At TRD, we approach every project with precision and discipline. Through proven methods and technical expertise, we deliver structural solutions that reflect both our clients\u2019 needs and our commitment to excellence.",page:'home',section:'mission',label:'Mission Paragraph 1 \u2014 Strength Header',type:'textarea',order:1},
    {key:'home.mission.paragraph.2',value:"We are the remedial experts. TRD Remedial are the specialist contractors builders and developers across NSW trust when the scope is complex, the timeline is tight, and the margin for error is zero. Structural alterations, carbon fibre reinforcement, crack injection, waterproofing, concrete cutting \u2014 we deliver it all, on time and to standard.",page:'home',section:'mission',label:'Mission Paragraph 2 \u2014 Mission Intro (first h3)',type:'textarea',order:2},
    {key:'home.mission.paragraph.3',value:"Our work spans occupied buildings, live construction sites, and Building Commissioner rectification orders. Whatever the challenge, we bring the expertise, the methodology, and the accountability to see it through. That\u2019s not a promise \u2014 it\u2019s how we operate.",page:'home',section:'mission',label:'Mission Paragraph 3 \u2014 Mission Intro (second h3)',type:'textarea',order:3},
    {key:'home.mission.image',value:'/images/projects/florence-capri-complex/hero.jpg',page:'home',section:'mission',label:'Mission Section Image',type:'image',order:4},
    {key:'home.mission.recognition-label',value:'(Recognition)',page:'home',section:'mission',label:'Recognition Label',type:'text',order:5},
    {key:'home.mission.recognition',value:'TRD Remedial is recognised across the industry for delivering structural solutions that stand the test of time. Our commitment to precision, safety, and innovation has earned us the trust of leading construction firms, property developers, and building owners throughout Sydney and NSW.',page:'home',section:'mission',label:'Recognition Paragraph',type:'textarea',order:6},
    {key:'home.mission.cta',value:'View Our Projects',page:'home',section:'mission',label:'Mission CTA Link Text',type:'text',order:7},

    // ------------------------------------------------------------------
    // HOMEPAGE — TeamScrollReveal (section text)
    // ------------------------------------------------------------------
    {key:'home.team.heading',value:'Meet The Team',page:'home',section:'team',label:'Team Section Heading',type:'text',order:1},
    {key:'home.team.outro',value:"Building Tomorrow's Structures",page:'home',section:'team',label:'Team Section Outro',type:'text',order:2},

    // ------------------------------------------------------------------
    // HOMEPAGE — FAQ (section text)
    // ------------------------------------------------------------------
    {key:'home.faq.title',value:'Frequently Asked Questions',page:'home',section:'faq',label:'FAQ Section Title',type:'text',order:1},
    {key:'home.faq.subtitle',value:'Get answers to common questions about our structural remediation services across Sydney',page:'home',section:'faq',label:'FAQ Section Subtitle',type:'text',order:2},
    {key:'home.faq.cta-text',value:"Can't find your answer?",page:'home',section:'faq',label:'FAQ CTA Text',type:'text',order:3},

    // ------------------------------------------------------------------
    // HOMEPAGE — EmergencyCTA (section text)
    // ------------------------------------------------------------------
    {key:'home.emergency.heading',value:'24/7 Emergency Response',page:'home',section:'emergency',label:'Emergency Section Heading',type:'text',order:1},
    {key:'home.emergency.body',value:"Our dedicated emergency response team is on standby around the clock. When structural integrity is compromised, every minute counts. We provide rapid assessment and immediate stabilization for critical structural issues.",page:'home',section:'emergency',label:'Emergency Section Body',type:'textarea',order:2},
    {key:'home.emergency.cta',value:'Request Emergency Assessment',page:'home',section:'emergency',label:'Emergency CTA Button Text',type:'text',order:3},
    {key:'home.emergency.subtitle',value:'Critical Repairs',page:'home',section:'emergency',label:'Emergency Subtitle',type:'text',order:4},
    {key:'home.emergency.badge',value:'Emergency \u2014 24/7',page:'home',section:'emergency',label:'Emergency Badge Text',type:'text',order:5},

    // ------------------------------------------------------------------
    // HOMEPAGE — Featured Projects (CaseStudiesOtisValen IDs)
    // ------------------------------------------------------------------
    {key:'home.featured-projects',value:JSON.stringify(['project-001','project-011','project-006','project-007','project-003','project-012']),page:'home',section:'case-studies',label:'Featured Project IDs',type:'json',order:1},

    // ------------------------------------------------------------------
    // CONTACT PAGE — Business hours (combined single string)
    // ------------------------------------------------------------------
    {key:'contact.business-hours',value:'Mon-Fri: 7:00 AM - 6:00 PM, Sat: 8:00 AM - 2:00 PM, 24/7 Emergency Service',page:'contact',section:'info',label:'Business Hours (combined)',type:'text',order:1},
  ];
  await Promise.all(pc.map(p => prisma.pageContent.create({data:p})));
  console.log(`Created ${pc.length} page content entries`);

  // ============================================================
  // 11. CREATE ADMIN USER
  // ============================================================
  console.log('Creating admin user...');
  const passwordHash = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'TRDAdmin2026!', 12);
  await prisma.user.create({ data: { email: 'admin@trdremedial.com.au', name: 'TRD Admin', passwordHash, role: 'admin' }});
  console.log('Created admin user (admin@trdremedial.com.au)');

  console.log('\nSeed complete!');
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

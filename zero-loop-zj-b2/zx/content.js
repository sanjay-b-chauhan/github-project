/* Scenario one, "Lead Rush": every word here comes from the zero-loop b30 data (scenario router). */
window.ZC = {
  me: { name: 'Sanjay Chauhan', first: 'Sanjay', photo: 'zx/img/sanjay.jpg' },
  coach: { name: 'Navid', role: 'Your coach', photo: 'zx/coach/navid.jpg', video: 'zx/coach/navi.mp4' },
  jay: { name: 'Jay Shah', first: 'Jay', title: 'Director of Revenue Operations', photo: 'zx/img/nadeem.jpg', wide: 'zx/img/nadeem-wide.webp' },
  avery: { name: 'Avery Lin', first: 'Avery', title: 'Data Analyst', photo: 'zx/img/avery.jpg', wide: 'zx/img/avery-wide.webp' },
  xp0: 470, rankAt: 1000,
  sc: {
    art: 'Lead Rush', full: 'Inbound lead router at HubSpot', co: 'HubSpot', logo: 'zx/logo/hubspot.svg', color: '#FF7A59',
    blurb: 'New leads wait three hours for a rep. Get every lead to the right rep in under two minutes.',
    pays: '3,000', time: '~1 hr', diff: 'Beginner', kickMins: 12,
    kickTitle: 'Understand the scope and what comes next.',
    kick: [
      'Inbound leads wait three hours and ten minutes for a first reply. Six months ago it was forty seven minutes.',
      'Every hour a lead waits, our chance of booking a meeting drops by about eight percent.',
      'That is about two point four million dollars of pipeline a quarter, from leads we already paid for.',
      'I want every new lead to get a reply from the right rep in under two minutes.'
    ],
    big: [
      { n: '3 h 10 m', l: 'first reply today, up from 47 min six months ago' },
      { n: '8%', l: 'of the chance to book a meeting, lost every hour a lead waits' },
      { n: '$2.4M', l: 'of pipeline a quarter, from leads we already paid for' },
      { n: 'Under 2 min', l: 'from form fill to a reply from the right rep' }
    ],
    notes: {
      problem: ['Inbound leads wait 3 h 10 m for a first reply, up from 47 min', 'Each hour of wait cuts meeting rates by about 8%', 'About $2.4M of pipeline lost a quarter'],
      outcome: ['Every new lead gets a reply in under 2 minutes', 'Routed to the right rep by region and deal size', 'Tested on last month of leads before it goes live']
    },
    pop: [
      { q: 'What is the one number we are trying to move?', good: 'Reply time. Three hours ten today, under two minutes when we are done.', weak: 'Leads, I guess.' },
      { q: 'Why route by deal size, and not just region?', good: 'Because the right rep for a fifty seat deal is not the right rep for a five seat one. Region alone sends big deals to whoever is free.', weak: 'Not sure.' },
      { q: 'How will you know it works before it goes live?', good: 'I will run it on the twelve hundred leads from September and show the median reply time before anything goes live.', weak: 'I will check it.' }
    ],
    reqs: [
      { t: 'Reply to every lead in under 2 minutes', sub: ['Trigger on form submit, not a nightly sync', 'Name the rep, not just the team', 'Send the first reply from that rep'] },
      { t: 'Back it with last month of leads', sub: ['Run it on the 1,200 leads from September', 'Show the median reply time'] },
      { t: 'Say what breaks, and what happens then', sub: ['No rep matches', 'The rep is away'] }
    ],
    resources: ['Meeting notes', 'Lead export, last 30 days', 'Example router, Ramp', 'HubSpot workflow guide', 'Rep territory map'],
    guide: {
      say: 'Start with the trigger. Open the form in HubSpot and add a workflow that runs on submit, not a nightly sync.',
      callout: ['One trigger, not a nightly sync', 'A nightly sync is why leads arrive the next day. A workflow on form submit runs the moment the lead arrives.'],
      code: '// route by region, then deal size\nIF region = "NA" AND seats >= 50 THEN rep = "Enterprise NA"',
      steps: ['Open the form workflow', 'Add the submit trigger', 'Map regions to reps', 'Add the deal size rule', 'Test on last month of leads']
    },
    feedback: {
      say: 'Much better shape. Two things before it is ready: there is no test behind it yet, and deal size is missing from the rules.',
      items: [
        { t: 'There is no test behind it', why: 'Nothing shows the router works on real leads.', how: 'Run it on the 1,200 September leads and show the median reply time.' },
        { t: 'Deal size is missing from the rules', why: 'Big deals go to whoever is free.', how: 'Add the seats rule after region.' }
      ],
      pass: 'Better. Deal size is in and there is a test. 4 minutes is not 2, but this works for now.'
    },
    deckTitle: 'Reply to every lead in under 2 minutes',
    deck: [
      { kind: 'big', eyebrow: 'Where we are', title: 'Leads wait', num: '3 h 10 m', sub: 'Median time to first reply, last 30 days' },
      { kind: 'bars', eyebrow: 'Why leads wait', title: 'Manual triage causes 52% of the wait', sub: 'Share of total wait time, by cause',
        rows: [['Manual triage', 'A person picks the rep', 52], ['Wrong rep first', 'Lead is passed on', 23], ['Rep out of office', 'No cover set', 14], ['Nightly sync', 'Leads arrive next day', 11]],
        callout: ['52%', 'Half the wait is a person deciding who gets the lead. That is the part a router removes.'] },
      { kind: 'steps', eyebrow: 'The router', title: '88 seconds, to the right rep', rows: [['Form submit', 'Triggers the workflow'], ['Region, then deal size', 'Picks the rep'], ['First reply from that rep', 'Sent in 88 seconds'], ['No match or away', 'Goes to the team lead']] }
    ],
    said: ['So, um, leads take a while.', 'Um, I built a router.', 'It is, um, about four minutes now.'],
    qa: { q: 'The 88 seconds is from last month. What happens at the end of the quarter, when inbound volume doubles?', a: 'I am not sure. I did not test that.' },
    report: {
      overview: 'The router works, at four minutes, and the plan shows the problem, the cause and the fix. You did not open with the number, and there is no test behind it yet. Lead with the one number, and test before you send.',
      liked: [['Every message to me was clear, and the plan had all three parts.', '1:10', 'Communication'], ['You fixed both high priority items before the meeting.', '2:40', 'Quality']],
      work: [['You did not open with the number you were moving.', '0:00', 'Delivery'], ['You had not tested volume.', '6:50', 'Understanding']]
    },
    review: {
      band: 'Meets expectations', points: '1,000',
      note: 'The router works, and every message I got from you was clear. What is missing is a test: nothing shows it works on real leads. Test before you send, and the next one is Exceeding.',
      skills: [['Workflow automation', 'Proficient'], ['Lead routing', 'Proficient'], ['Testing on real data', 'Competent'], ['Stakeholder communication', 'Competent']],
      tools: ['HubSpot', 'n8n', 'Claude', 'Google Sheets']
    },
    next: [{ t: 'Enrichment waterfall', co: 'Notion', logo: 'zx/logo/notion.svg' }, { t: 'Outbound agent with evals', co: 'Shopify', logo: 'zx/logo/shopify.svg' }]
  }
};

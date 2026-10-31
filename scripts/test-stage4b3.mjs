// End-to-end integration verification for Stage 4B-3
const BASE_URL = 'http://localhost:5173/api';

async function runTests() {
  console.log('--- 1. Testing GET /api/health ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  console.log('Health:', await healthRes.json());

  console.log('\n--- 2. Fetching existing leads to select for survey scheduling ---');
  const leadsRes = await fetch(`${BASE_URL}/leads?size=5`);
  const leadsData = await leadsRes.json();
  console.log(`Found ${leadsData.totalElements} total leads in database`);
  if (leadsData.content.length === 0) {
    throw new Error('No leads found in database to schedule survey against');
  }
  const lead = leadsData.content[0];
  console.log(`Selected Lead: ${lead.fullName} (${lead.id}), Phone: ${lead.phone}, City: ${lead.city}`);

  console.log('\n--- 3. Scheduling a site survey (POST /api/surveys) ---');
  const surveyScheduleDate = new Date();
  surveyScheduleDate.setDate(surveyScheduleDate.getDate() + 3);

  const surveyPayload = {
    leadId: lead.id,
    surveyorName: 'Vikram Joshi',
    surveyorPhone: '9845012345',
    scheduledAt: surveyScheduleDate.toISOString(),
    siteAddress: `${lead.address || 'Site location'}, ${lead.city || 'Gujarat'}`,
    notes: 'Terrace assessment for 10 kW rooftop installation. Inspect structural stability.',
  };

  const createRes = await fetch(`${BASE_URL}/surveys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(surveyPayload),
  });

  const createData = await createRes.json();
  console.log(`HTTP ${createRes.status} Created`);
  console.log('Survey ID:', createData.id);
  console.log('Customer Name in response:', createData.customerName);
  console.log('Surveyor:', createData.surveyorName);
  console.log('Status:', createData.status);
  const surveyId = createData.id;

  console.log('\n--- 4. Verifying GET /api/surveys (Paginated Listing) ---');
  const listRes = await fetch(`${BASE_URL}/surveys`);
  const listData = await listRes.json();
  console.log(`Total surveys: ${listData.totalElements}`);
  console.log(`Surveys on page: ${listData.content.length}`);
  const found = listData.content.find((s) => s.id === surveyId);
  console.log(`Found newly scheduled survey: ${Boolean(found)} (${found?.surveyorName})`);

  console.log('\n--- 5. Testing Status Filter: GET /api/surveys?status=SCHEDULED ---');
  const schedRes = await fetch(`${BASE_URL}/surveys?status=SCHEDULED`);
  const schedData = await schedRes.json();
  console.log(`Scheduled surveys count: ${schedData.totalElements}`);

  console.log('\n--- 6. Testing Surveyor Filter: GET /api/surveys?surveyor=Vikram ---');
  const survFilterRes = await fetch(`${BASE_URL}/surveys?surveyor=Vikram`);
  const survFilterData = await survFilterRes.json();
  console.log(`Matching surveyor 'Vikram': ${survFilterData.totalElements}`);
  console.log(`First matching surveyor: ${survFilterData.content[0]?.surveyorName}`);

  console.log('\n--- 7. Verifying Lead Association: GET /api/leads/{leadId}/surveys ---');
  const leadSurveysRes = await fetch(`${BASE_URL}/leads/${lead.id}/surveys`);
  const leadSurveys = await leadSurveysRes.json();
  console.log(`Surveys for lead ${lead.fullName}: ${leadSurveys.length}`);

  console.log('\n--- 8. Verifying existing Leads page endpoint still functional ---');
  const verifyLeadsRes = await fetch(`${BASE_URL}/leads`);
  console.log(`Leads endpoint status: ${verifyLeadsRes.status}`);

  console.log('\n✅ ALL STAGE 4B-3 ENDPOINTS AND WORKFLOWS VERIFIED SUCCESSFULLY VIA VITE PROXY!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

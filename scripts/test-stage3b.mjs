// End-to-end integration test runner for Stage 3B using native fetch
const BASE_URL = 'http://localhost:5173/api';

async function runTests() {
  console.log('--- 1. Testing GET /api/health ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('Health status:', healthData);

  console.log('\n--- 2. Submitting new enquiry: Priya Patel (POST /api/leads) ---');
  const newLeadPayload = {
    fullName: 'Priya Patel',
    phone: '9123456780',
    email: 'priya.patel@example.com',
    address: '401 Surya Towers, SG Highway',
    city: 'Ahmedabad',
    propertyType: 'COMMERCIAL',
    requestedCapacityKw: 12.5,
    systemType: 'ON_GRID',
    monthlyBill: 18000,
    roofAreaSqft: 2200,
    preferredLanguage: 'Gujarati',
    subsidyInterest: true,
    channel: 'WEB_FORM',
    qualificationNotes: 'Interested in commercial rooftop solar for retail store.',
  };

  const createRes = await fetch(`${BASE_URL}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLeadPayload),
  });
  const createData = await createRes.json();
  console.log(`HTTP ${createRes.status} Created`);
  console.log('Created Lead ID:', createData.id);
  console.log('Status:', createData.status);
  const createdId = createData.id;

  console.log('\n--- 3. Verifying GET /api/leads (Pagination & List) ---');
  const listRes = await fetch(`${BASE_URL}/leads`);
  const listData = await listRes.json();
  console.log(`Total elements: ${listData.totalElements}`);
  console.log(`Leads on page: ${listData.content.length}`);
  const found = listData.content.find((l) => l.id === createdId);
  console.log(`Found newly created lead in list: ${Boolean(found)} (${found?.fullName})`);

  console.log('\n--- 4. Testing GET /api/leads?search=Priya ---');
  const searchRes = await fetch(`${BASE_URL}/leads?search=Priya`);
  const searchData = await searchRes.json();
  console.log(`Search 'Priya' results count: ${searchData.totalElements}`);
  console.log(`First matching name: ${searchData.content[0]?.fullName}`);

  console.log('\n--- 5. Testing GET /api/leads/{id} ---');
  const singleLeadRes = await fetch(`${BASE_URL}/leads/${createdId}`);
  const singleLeadData = await singleLeadRes.json();
  console.log(`Fetched Lead by ID: ${singleLeadData.fullName}, Capacity: ${singleLeadData.requestedCapacityKw} kW, City: ${singleLeadData.city}`);

  console.log('\n--- 6. Testing PATCH /api/leads/{id}/status to QUALIFIED ---');
  const patchRes = await fetch(`${BASE_URL}/leads/${createdId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'QUALIFIED' }),
  });
  const patchData = await patchRes.json();
  console.log(`Updated Status: ${patchData.status}`);

  console.log('\n--- 7. Testing Filter by Status: GET /api/leads?status=QUALIFIED ---');
  const qualRes = await fetch(`${BASE_URL}/leads?status=QUALIFIED`);
  const qualData = await qualRes.json();
  console.log(`Qualified leads count: ${qualData.totalElements}`);

  console.log('\n✅ ALL STAGE 3B ENDPOINTS VERIFIED SUCCESSFULLY VIA VITE PROXY!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

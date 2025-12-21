// Test script for PYQBUDDY APIs
// Run after server is started: node test-apis.js

const BASE_URL = 'http://localhost:9235/api/v1';

async function testAPI(name, method, endpoint, body = null) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log(`${method} ${BASE_URL}${endpoint}`);
    console.log('='.repeat(60));
    
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        return data;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function runTests() {
    console.log('\n🚀 PYQBUDDY API TESTING');
    console.log('='.repeat(60));
    
    // Test 1: Search - Empty (get all)
    await testAPI(
        'Search - Get All Questions',
        'GET',
        '/questions/search'
    );
    
    // Test 2: Search - With keyword
    await testAPI(
        'Search - Keyword: constitution',
        'GET',
        '/questions/search?keyword=constitution'
    );
    
    // Test 3: Search - With filters
    await testAPI(
        'Search - Year 2021 + Prelims + Polity',
        'GET',
        '/questions/search?year=2021&examType=prelims&subject=Polity'
    );
    
    // Test 4: Get filter options
    await testAPI(
        'Get Filter Options',
        'GET',
        '/questions/filters/options'
    );
    
    // Test 5: Get statistics
    await testAPI(
        'Get Question Statistics',
        'GET',
        '/questions/statistics'
    );
    
    // Test 6: Random question
    await testAPI(
        'Get Random Question - Prelims',
        'GET',
        '/questions/random?examType=prelims'
    );
    
    // Test 7: Get all subjects
    await testAPI(
        'Get All Subjects',
        'GET',
        '/questions/subjects/all'
    );
    
    // Test 8: Search - Multiple years
    await testAPI(
        'Search - Multiple Years (2021, 2022)',
        'GET',
        '/questions/search?year=2021&year=2022'
    );
    
    // Test 9: Search - With pagination
    await testAPI(
        'Search - Pagination (page 1, limit 5)',
        'GET',
        '/questions/search?page=1&limit=5'
    );
    
    // Test 10: Search - Questions with answers
    await testAPI(
        'Search - Questions with hasAnswer=true',
        'GET',
        '/questions/search?hasAnswer=true'
    );
    
    // Test 11: Search - By difficulty
    await testAPI(
        'Search - Easy difficulty',
        'GET',
        '/questions/search?difficulty=easy'
    );
    
    // Test 12: Search - Sorting
    await testAPI(
        'Search - Sort by year ascending',
        'GET',
        '/questions/search?sortBy=year&sortOrder=asc'
    );
    
    console.log('\n✅ All tests completed!');
    console.log('='.repeat(60));
}

// Run the tests
runTests().catch(console.error);

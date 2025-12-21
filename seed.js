const mongoose = require('mongoose');
const colors = require('colors');
require('dotenv').config();

const Subject = require('./Models/Subject');
const Question = require('./Models/Question');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'.green))
    .catch(err => console.log('Error:', err.message.red));

// Sample questions data
const sampleQuestions = [
    {
        year: 2021,
        examType: 'prelims',
        subject: 'Polity',
        topic: 'Constitution',
        subTopic: 'Fundamental Rights',
        questionText: 'Which Article of the Constitution of India deals with the Right to Equality?',
        answerText: 'Articles 14 to 18 of the Indian Constitution deal with the Right to Equality. Article 14 provides equality before law and equal protection of laws. Article 15 prohibits discrimination on grounds of religion, race, caste, sex, or place of birth. Article 16 provides equality of opportunity in matters of public employment. Article 17 abolishes untouchability. Article 18 abolishes titles except military and academic distinctions.',
        explanation: 'The Right to Equality is one of the six fundamental rights guaranteed by the Constitution.',
        difficulty: 'medium',
        marks: 2,
        keywords: ['fundamental rights', 'equality', 'article 14', 'article 15', 'discrimination']
    },
    {
        year: 2021,
        examType: 'prelims',
        subject: 'Polity',
        topic: 'Constitution',
        subTopic: 'Federalism',
        questionText: 'Which constitutional amendment introduced GST in India?',
        answerText: 'The 101st Constitutional Amendment Act, 2016 introduced the Goods and Services Tax (GST) in India. It came into effect from July 1, 2017. This amendment added Article 246A which gives concurrent power to Parliament and State Legislatures to make laws with respect to GST.',
        explanation: 'GST is a comprehensive indirect tax levy on manufacture, sale, and consumption of goods and services.',
        difficulty: 'easy',
        marks: 2,
        keywords: ['GST', 'constitutional amendment', '101st amendment', 'indirect tax']
    },
    {
        year: 2022,
        examType: 'mains',
        subject: 'Economy',
        topic: 'GDP',
        subTopic: 'Economic Growth',
        questionText: 'Discuss the impact of GDP growth on poverty alleviation in India. How can inclusive growth be achieved?',
        answerText: 'GDP growth contributes to poverty reduction through employment generation, increased income levels, and improved standard of living. However, the impact depends on the inclusiveness of growth. Key points: 1) Direct Impact - Higher GDP leads to more job opportunities and higher wages. 2) Indirect Impact - Increased government revenue allows for better social welfare programs. 3) Challenges - Growth may not reach all sections equally, leading to inequality. 4) Solutions for Inclusive Growth - Focus on agriculture and rural development, skill development programs, investment in education and healthcare, progressive taxation, and targeted welfare schemes like MGNREGA. Conclusion: While GDP growth is necessary for poverty alleviation, it must be accompanied by redistributive policies to ensure benefits reach the poor.',
        explanation: 'This tests understanding of economic development, poverty, and inclusive growth policies.',
        difficulty: 'hard',
        marks: 15,
        paperNumber: 'GS3',
        keywords: ['GDP', 'poverty', 'economic growth', 'inclusive development', 'MGNREGA']
    },
    {
        year: 2022,
        examType: 'prelims',
        subject: 'Geography',
        topic: 'Climate',
        subTopic: 'Monsoon',
        questionText: 'What is the primary cause of the Indian monsoon?',
        answerText: 'The Indian monsoon is primarily caused by the differential heating of land and sea. During summer, the landmass of India heats up faster than the Indian Ocean, creating a low-pressure area over land. This draws moisture-laden winds from the high-pressure area over the ocean, bringing rainfall. The process is also influenced by the Inter-Tropical Convergence Zone (ITCZ), Tibetan Plateau heating, and the Coriolis effect.',
        explanation: 'Understanding monsoon mechanism is crucial for Indian agriculture and economy.',
        difficulty: 'easy',
        marks: 2,
        keywords: ['monsoon', 'climate', 'differential heating', 'ITCZ', 'Indian Ocean']
    },
    {
        year: 2023,
        examType: 'prelims',
        subject: 'History',
        topic: 'Modern History',
        subTopic: 'Freedom Struggle',
        questionText: 'When did Mahatma Gandhi launch the Non-Cooperation Movement?',
        answerText: 'Mahatma Gandhi launched the Non-Cooperation Movement in 1920. It was launched in response to the Jallianwala Bagh massacre and to protest against the oppressive Rowlatt Act. The movement involved boycott of British goods, institutions, and honors. It was called off in 1922 after the Chauri Chaura incident where protesters set fire to a police station, killing 22 policemen.',
        explanation: 'The Non-Cooperation Movement was one of the major movements in India\'s freedom struggle.',
        difficulty: 'easy',
        marks: 2,
        keywords: ['non-cooperation movement', 'gandhi', '1920', 'freedom struggle', 'chauri chaura']
    },
    {
        year: 2023,
        examType: 'prelims',
        subject: 'Environment',
        topic: 'Climate Change',
        subTopic: 'Global Warming',
        questionText: 'Which gas is primarily responsible for global warming?',
        answerText: 'Carbon Dioxide (CO2) is primarily responsible for global warming. It accounts for about 75% of global greenhouse gas emissions. CO2 is released through burning of fossil fuels (coal, oil, natural gas), deforestation, and industrial processes. Other greenhouse gases include Methane (CH4), Nitrous Oxide (N2O), and Fluorinated gases, but CO2 has the largest contribution due to its abundance and long atmospheric lifetime.',
        explanation: 'Understanding greenhouse gases is essential for climate change mitigation.',
        difficulty: 'easy',
        marks: 2,
        keywords: ['carbon dioxide', 'global warming', 'greenhouse gases', 'climate change', 'CO2']
    },
    {
        year: 2023,
        examType: 'mains',
        subject: 'Science & Technology',
        topic: 'Information Technology',
        subTopic: 'Artificial Intelligence',
        questionText: 'Discuss the potential applications and ethical concerns of Artificial Intelligence in governance.',
        answerText: 'Applications of AI in Governance: 1) Service Delivery - Chatbots for citizen services, automated grievance redressal. 2) Decision Making - Data analysis for policy formulation, predictive analytics. 3) Security - Surveillance, fraud detection, cybersecurity. 4) Healthcare - Disease prediction, telemedicine. 5) Agriculture - Crop monitoring, precision farming. Ethical Concerns: 1) Privacy - Data collection and surveillance issues. 2) Bias - Algorithmic bias leading to discrimination. 3) Accountability - Who is responsible for AI decisions? 4) Transparency - Black box problem in AI systems. 5) Job Displacement - Automation replacing human workers. Way Forward: Need for robust regulatory framework, ethical guidelines, public participation, and focus on explainable AI.',
        explanation: 'AI is transforming governance but raises important ethical questions.',
        difficulty: 'hard',
        marks: 15,
        paperNumber: 'GS3',
        keywords: ['artificial intelligence', 'AI', 'governance', 'ethics', 'technology', 'automation']
    },
    {
        year: 2024,
        examType: 'prelims',
        subject: 'Economy',
        topic: 'Basic Concepts',
        subTopic: 'Inflation',
        questionText: 'What is the difference between WPI and CPI?',
        answerText: 'WPI (Wholesale Price Index) and CPI (Consumer Price Index) are both measures of inflation but differ in their scope and composition. WPI: 1) Measures price changes at wholesale level. 2) Includes only goods, no services. 3) Used by businesses and policymakers. 4) Base year 2011-12. CPI: 1) Measures retail price changes faced by consumers. 2) Includes both goods and services. 3) Used for policy decisions like DA calculation. 4) More relevant for common people. 5) Three variants - CPI-IW, CPI-AL, CPI-RL. CPI is considered more accurate for measuring actual inflation impact on households.',
        explanation: 'Understanding price indices is crucial for economic analysis.',
        difficulty: 'medium',
        marks: 2,
        keywords: ['WPI', 'CPI', 'inflation', 'price index', 'wholesale', 'retail']
    },
    {
        year: 2024,
        examType: 'prelims',
        subject: 'International Relations',
        topic: 'India & Neighbors',
        subTopic: 'China',
        questionText: 'What is the Line of Actual Control (LAC)?',
        answerText: 'The Line of Actual Control (LAC) is the effective border between India and China. It is approximately 3,488 km long and passes through three sectors: Western (Ladakh), Middle (Uttarakhand, Himachal Pradesh), and Eastern (Sikkim, Arunachal Pradesh). Key points: 1) Not a legally recognized international boundary. 2) Came into existence after the 1962 India-China war. 3) Different perceptions exist - India and China have different interpretations of the LAC. 4) No clear demarcation on ground. 5) Patrolling overlaps lead to frequent standoffs. Recent tensions include the 2020 Galwan Valley clash.',
        explanation: 'LAC is crucial for understanding India-China border issues.',
        difficulty: 'medium',
        marks: 2,
        keywords: ['LAC', 'Line of Actual Control', 'India China border', 'Galwan', 'border dispute']
    },
    {
        year: 2024,
        examType: 'prelims',
        subject: 'Polity',
        topic: 'Parliament',
        subTopic: 'Parliamentary Committees',
        questionText: 'What is the role of Public Accounts Committee (PAC)?',
        answerText: 'The Public Accounts Committee (PAC) is a parliamentary standing committee that examines the accounts of government expenditure. Key features: 1) Composition - 22 members (15 Lok Sabha, 7 Rajya Sabha). 2) Chairman - Usually from the Opposition. 3) Functions - Examines Appropriation Accounts and Finance Accounts, scrutinizes CAG reports, ensures public money is spent as per Parliament\'s approval. 4) Powers - Can summon officials, examine witnesses, seek expert advice. 5) Reports - Submits reports to Parliament with recommendations. It acts as a watchdog over government expenditure and ensures financial accountability.',
        explanation: 'PAC is an important accountability mechanism in parliamentary democracy.',
        difficulty: 'medium',
        marks: 2,
        keywords: ['PAC', 'Public Accounts Committee', 'parliament', 'CAG', 'accountability', 'expenditure']
    }
];

// Seed function
async function seedDatabase() {
    try {
        console.log('Starting database seeding...'.yellow);

        // 1. Seed Subjects
        console.log('\n1. Seeding subjects...'.cyan);
        const subjectResult = await Subject.seedSubjects();
        console.log(`✓ ${subjectResult.message}`.green);

        // 2. Check if questions already exist
        const existingQuestions = await Question.countDocuments();
        if (existingQuestions > 0) {
            console.log(`\n⚠ Database already has ${existingQuestions} questions.`.yellow);
            const answer = 'y'; // Auto yes for script
            
            if (answer.toLowerCase() !== 'y') {
                console.log('Seeding cancelled.'.red);
                process.exit(0);
            }
        }

        // 3. Insert sample questions
        console.log('\n2. Inserting sample questions...'.cyan);
        const insertedQuestions = await Question.insertMany(sampleQuestions);
        console.log(`✓ Successfully inserted ${insertedQuestions.length} questions`.green);

        // 4. Display statistics
        console.log('\n3. Database Statistics:'.cyan);
        const stats = await Question.getStatistics();
        console.log(`   Total Questions: ${stats.total}`.white);
        console.log(`   With Answers: ${stats.withAnswers}`.white);
        console.log(`   By Exam Type:`.white);
        stats.byExamType.forEach(item => {
            console.log(`      - ${item._id}: ${item.count}`.gray);
        });
        console.log(`   By Subject:`.white);
        stats.bySubject.forEach(item => {
            console.log(`      - ${item._id}: ${item.count}`.gray);
        });

        console.log('\n✓ Database seeding completed successfully!'.green.bold);
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:'.red, error.message);
        process.exit(1);
    }
}

// Run the seeder
seedDatabase();

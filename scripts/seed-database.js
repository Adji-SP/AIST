// scripts/seed-database.js - Initialize database with sample data for front-end
const DatabaseManager = require('../modules/database/databaseManager');

class DatabaseSeeder {
    constructor() {
        this.dbManager = new DatabaseManager();
    }

    async initialize() {
        await this.dbManager.initialize();
        this.db = this.dbManager.getDatabase();
    }

    async seedAll() {
        try {
            console.log('🌱 Starting database seeding...');
            
            await this.seedSites();
            await this.seedTeamMembers();
            await this.seedProgramGoals();
            await this.seedDOSMStats();
            await this.seedSensorData();
            await this.seedTasks();
            await this.seedFinancialData();
            await this.seedSystemMetrics();
            
            console.log('✅ Database seeding completed successfully!');
        } catch (error) {
            console.error('❌ Database seeding failed:', error);
            throw error;
        }
    }

    async seedSites() {
        console.log('📍 Seeding sites...');
        
        const sites = [
            {
                name: 'Primary Key Lime Orchard',
                crop_type: 'Key Lime',
                area_hectares: 3,
                location: JSON.stringify({ latitude: 1.2345, longitude: 103.6789 }),
                description: 'The Key Lime (*Citrus aurantiifolia*) is a small, highly aromatic citrus fruit prized for its distinctively tart and flavorful juice. Unlike other limes, it has a higher acidity, a stronger aroma, and a thinner rind. Thriving in well-drained soil and sunny conditions, this crop is sensitive to fluctuations in soil pH, moisture, and nutrient balance.',
                image_url: '/images/keylime.jpg',
                ideal_conditions: JSON.stringify({
                    ph_range: { min: 6.0, max: 7.0 },
                    moisture_range: { min: 60, max: 75 },
                    nitrogen_range: { min: 18, max: 25 },
                    phosphorus_range: { min: 15, max: 20 },
                    potassium_range: { min: 20, max: 30 }
                }),
                active: true,
                created_at: new Date().toISOString()
            },
            {
                name: 'Nipis Citrus Farm',
                crop_type: 'Nipis',
                area_hectares: 2.5,
                location: JSON.stringify({ latitude: 1.3456, longitude: 103.7890 }),
                description: 'Nipis citrus cultivation focusing on sustainable farming practices.',
                image_url: '/images/nipis.jpg',
                ideal_conditions: JSON.stringify({
                    ph_range: { min: 6.2, max: 7.2 },
                    moisture_range: { min: 65, max: 80 },
                    nitrogen_range: { min: 20, max: 28 },
                    phosphorus_range: { min: 16, max: 22 },
                    potassium_range: { min: 22, max: 32 }
                }),
                active: true,
                created_at: new Date().toISOString()
            }
        ];

        for (const site of sites) {
            await this.db.postData('sites', site);
        }
    }

    async seedTeamMembers() {
        console.log('👥 Seeding team members...');
        
        const supervisor = {
            name: 'Ir. Safira Firdaus',
            role: 'Project Supervisor',
            type: 'supervisor',
            student_id: '',
            email: 'safira.firdaus@its.ac.id',
            linkedin: 'https://linkedin.com/in/safira-firdaus',
            instagram: '',
            image_url: 'https://avatar.iran.liara.run/public/job/teacher/male',
            responsibilities: JSON.stringify([
                'Oversee project direction',
                'Provide technical guidance', 
                'Ensure academic alignment'
            ]),
            active: true,
            created_at: new Date().toISOString()
        };

        const students = [
            {
                name: 'Ndyy',
                role: 'Team Leader',
                type: 'student',
                student_id: 'NIM: 2021001',
                email: 'ndyy@example.com',
                linkedin: 'https://linkedin.com/in/ndyy',
                instagram: 'https://instagram.com/ndyy',
                image_url: 'https://avatar.iran.liara.run/public/girl',
                responsibilities: JSON.stringify([
                    'Lead frontend development',
                    'Implement UI/UX design',
                    'Coordinate team tasks'
                ]),
                active: true,
                created_at: new Date().toISOString()
            },
            {
                name: 'Jii',
                role: 'Backend & Data Acquisition',
                type: 'student',
                student_id: 'NIM: 2021002',
                email: 'jii@example.com',
                linkedin: 'https://linkedin.com/in/jii',
                instagram: 'https://instagram.com/jii',
                image_url: 'https://avatar.iran.liara.run/public/boy',
                responsibilities: JSON.stringify([
                    'Develop and maintain APIs',
                    'Optimize database',
                    'Implement data processing'
                ]),
                active: true,
                created_at: new Date().toISOString()
            },
            {
                name: 'Jonathan',
                role: 'Frontend & Hardware',
                type: 'student',
                student_id: 'NIM: 2021003',
                email: 'jonathan@example.com',
                linkedin: 'https://linkedin.com/in/jonathan',
                instagram: 'https://instagram.com/jonathan',
                image_url: 'https://avatar.iran.liara.run/public/boy',
                responsibilities: JSON.stringify([
                    'Configure IoT devices',
                    'Implement serial communication',
                    'Frontend integration'
                ]),
                active: true,
                created_at: new Date().toISOString()
            },
            {
                name: 'Yuuuuss',
                role: 'Data Analyst',
                type: 'student',
                student_id: 'NIM: 2021004',
                email: 'yuuuss@example.com',
                linkedin: 'https://linkedin.com/in/yuuuss',
                instagram: 'https://instagram.com/yuuuss',
                image_url: 'https://avatar.iran.liara.run/public/girl',
                responsibilities: JSON.stringify([
                    'Analyze sensor data',
                    'Develop predictive models',
                    'Generate reports'
                ]),
                active: true,
                created_at: new Date().toISOString()
            }
        ];

        await this.db.postData('team_members', supervisor);
        for (const student of students) {
            await this.db.postData('team_members', student);
        }
    }

    async seedProgramGoals() {
        console.log('🎯 Seeding program goals...');
        
        const goals = [
            {
                id: 'farmers',
                value: '10K',
                label: 'FARMERS',
                description: 'Support and collaborate with 10,000 farmers globally, equipping them with sustainable practices to transform agriculture into a regenerative, climate-positive industry.',
                target_value: 10000,
                current_value: 1250,
                unit: 'farmers'
            },
            {
                id: 'hectares',
                value: '100K',
                label: 'HECTARES',
                description: 'Regenerate 100,000 hectares of farmland using zero-carbon techniques, creating fertile, carbon-rich soils that enhance productivity and sustainability.',
                target_value: 100000,
                current_value: 12500,
                unit: 'hectares'
            },
            {
                id: 'food_tons',
                value: '1M',
                label: 'TONS OF FOOD',
                description: 'Produce 1,000,000 tons of zero-carbon food, showcasing how sustainable agriculture can meet global food demands while minimizing environmental impact.',
                target_value: 1000000,
                current_value: 125000,
                unit: 'tons'
            },
            {
                id: 'co2_tons',
                value: '10M',
                label: 'TONS OF CO2',
                description: 'Sequester 10,000,000 tons of CO2, contributing significantly to global climate action through advanced carbon farming and innovative methods.',
                target_value: 10000000,
                current_value: 1250000,
                unit: 'tons'
            }
        ];

        for (const goal of goals) {
            await this.db.postData('program_goals', goal);
        }
    }

    async seedDOSMStats() {
        console.log('📊 Seeding DOSM stats...');
        
        const stats = {
            id: 'latest',
            gdp_growth: 2.9,
            agri_employment: '1.4M',
            food_security_index: '81.3',
            quarter: 'Q4 2024',
            last_updated: new Date().toISOString()
        };

        await this.db.postData('dosm_stats', stats);
    }

    async seedSensorData() {
        console.log('🌡️ Seeding sensor data...');
        
        const siteId = 'site_a_3_acres';
        const now = new Date();
        
        // Generate 30 days of sensor data
        for (let i = 29; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            
            const sensorData = {
                site_id: siteId,
                timestamp: timestamp.toISOString(),
                temperature: parseFloat((22 + Math.random() * 5).toFixed(1)),
                soil_moisture: parseFloat((65 + Math.random() * 10).toFixed(1)),
                ph_level: parseFloat((6.7 + Math.random() * 0.4).toFixed(1)),
                nitrogen: parseFloat((20 + Math.random() * 5).toFixed(1)),
                phosphorus: parseFloat((15 + Math.random() * 5).toFixed(1)),
                potassium: parseFloat((25 + Math.random() * 5).toFixed(1)),
                soil_health: parseFloat((92 + Math.random() * 8).toFixed(1)),
                organic_matter: parseFloat((3.8 + Math.random() * 1).toFixed(1)),
                created_at: timestamp.toISOString()
            };
            
            await this.db.postData('sensor_data', sensorData);
        }
    }

    async seedTasks() {
        console.log('📋 Seeding tasks...');
        
        const siteId = 'site_a_3_acres';
        const now = new Date();
        
        // Generate tasks for next 3 months
        const tasks = [];
        for (let i = 0; i < 90; i++) {
            const date = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
            const day = date.getDate();
            
            // Regenerative farming schedule
            if ([1, 15].includes(day)) {
                tasks.push({
                    site_id: siteId,
                    title: 'Apply Pesticide',
                    description: 'Dilute solution 1000ml water(3 types of Pesticide (mix and matched from list) - Total 2L)',
                    type: 'regenerative',
                    category: 'Pesticides',
                    date: date.toISOString(),
                    is_completed: date < now,
                    created_at: new Date().toISOString()
                });
            }
            
            if (day === 24) {
                tasks.push({
                    site_id: siteId,
                    title: 'Inject Microalgae',
                    description: '6000L of Microalgae water',
                    type: 'regenerative',
                    category: 'Soil Agent',
                    date: date.toISOString(),
                    is_completed: date < now,
                    created_at: new Date().toISOString()
                });
            }
        }

        for (const task of tasks) {
            await this.db.postData('tasks', task);
        }
    }

    async seedFinancialData() {
        console.log('💰 Seeding financial data...');
        
        const siteId = 'site_a_3_acres';
        const now = new Date();
        
        // Generate 30 days of financial data
        for (let i = 29; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            
            const regenerativeProfit = 6700 + Math.random() * 800 - 400;
            const regenerativeCost = 2750 + Math.random() * 300 - 150;
            
            const financialData = {
                site_id: siteId,
                timestamp: timestamp.toISOString(),
                regenerative_profit: parseFloat(regenerativeProfit.toFixed(0)),
                regenerative_cost: parseFloat(regenerativeCost.toFixed(0)),
                conventional_cost: 5330,
                revenue: 15500,
                microalgae_applied_liters: 6000,
                land_area_hectares: 3,
                projected_harvest_kg: 14500,
                cost_benefit_ratio: parseFloat((regenerativeProfit / regenerativeCost).toFixed(2)),
                yield_per_hectare: parseFloat((14500 / 3).toFixed(0)),
                created_at: timestamp.toISOString()
            };
            
            await this.db.postData('financial_data', financialData);
        }
    }

    async seedSystemMetrics() {
        console.log('⚙️ Seeding system metrics...');
        
        const metrics = {
            cache_performance: JSON.stringify({
                html_hit: 85,
                css_hit: 92,
                javascript_hit: 78,
                images_hit: 95,
                fonts_hit: 88,
                api_hit: 72
            }),
            performance_metrics: JSON.stringify({
                cpu_usage: 73,
                memory_usage: 63,
                system_health: 75
            }),
            daily_visits: JSON.stringify({
                monday: 1234,
                tuesday: 2234,
                wednesday: 3234,
                thursday: 4234
            }),
            created_at: new Date().toISOString()
        };

        await this.db.postData('system_metrics', metrics);
    }

    async close() {
        if (this.dbManager) {
            await this.dbManager.close();
        }
    }
}

// CLI execution
if (require.main === module) {
    const seeder = new DatabaseSeeder();
    
    seeder.initialize()
        .then(() => seeder.seedAll())
        .then(() => {
            console.log('🎉 Database seeding completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        })
        .finally(() => {
            seeder.close();
        });
}

module.exports = DatabaseSeeder;
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { generateDemoOpportunities } from './src/data/demoData.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Generating demo data...');
  const opportunities = generateDemoOpportunities('demo-biz-1', 20); // Generate 20 records

  // Strip local specific fields not in DB
  const dbOpps = opportunities.map(opp => {
    const { id, scenarios, ...rest } = opp;
    return rest;
  });

  console.log('Inserting into Supabase...');
  const { data, error } = await supabase.from('opportunities').insert(dbOpps).select();

  if (error) {
    console.error('Error seeding data:', error);
  } else {
    console.log(`Successfully seeded ${data.length} opportunities!`);
  }
}

seed();

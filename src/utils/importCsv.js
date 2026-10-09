import Papa from 'papaparse';
import { supabase } from './supabase';

export async function importLostSales(file, businessId) {
    if (!file || !businessId) {
        throw new Error('Select a file and business first.');
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please upload a CSV file.');
    }

    const { data: rows, errors } = await new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: (result) => resolve(result),
        });
    });

    if (errors.length) {
        throw new Error('Could not parse the CSV file.');
    }

    const required = [
        'product_name',
        'cost',
        'quoted_price',
        'loss_reason',
        'customer_notes',
    ];

    const headers = Object.keys(rows[0] || {});

    const missing = required.filter((key) => !headers.includes(key));

    if (missing.length) {
        throw new Error(`Missing columns: ${missing.join(', ')}`);
    }

    const validReasons = [
        'Price',
        'Availability',
        'Delivery',
        'Confusion',
        'Competitor',
        'Timing',
        'Other',
    ];

    const records = rows.map((row, index) => {
        const cost = Number(row.cost);
        const price = Number(row.quoted_price);
        const reason = row.loss_reason.trim();

        if (
            !row.product_name.trim() ||
            !Number.isFinite(cost) ||
            !Number.isFinite(price) ||
            cost < 0 ||
            price < 0 ||
            !validReasons.includes(reason)
        ) {
            throw new Error(`Invalid data on CSV row ${index + 2}.`);
        }

        return {
            business_id: businessId,
            product_name: row.product_name.trim(),
            original_price: price,
            fulfillment_cost: cost,
            quoted_value: price,
            loss_reason: reason,
            customer_notes: row.customer_notes.trim(),
            status: 'open',
            priority: 'medium',
        };
    });

    return records;
}
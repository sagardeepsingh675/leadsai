import { type ClassValue, clsx } from 'clsx';

// Simple clsx implementation for combining class names
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}

// Format currency
export function formatCurrency(amount: number, currency = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format date
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-IN', options || {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(d);
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

// Capitalize first letter
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Generate initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Validate email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate URL
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Get website score color
export function getScoreColor(score: 'good' | 'average' | 'poor' | 'no_website' | null): string {
    switch (score) {
        case 'good': return 'text-green-400';
        case 'average': return 'text-yellow-400';
        case 'poor': return 'text-red-400';
        default: return 'text-dark-500';
    }
}

// Get website score badge
export function getScoreBadgeClass(score: 'good' | 'average' | 'poor' | 'no_website' | null): string {
    switch (score) {
        case 'good': return 'badge-success';
        case 'average': return 'badge-warning';
        case 'poor': return 'badge-danger';
        default: return 'badge-primary';
    }
}

// Get status badge class
export function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'new': return 'badge-primary';
        case 'contacted': return 'badge-warning';
        case 'responded': return 'badge-success';
        case 'converted': return 'badge-accent';
        case 'rejected': return 'badge-danger';
        default: return 'badge-primary';
    }
}

// Parse template variables
export function parseTemplateVariables(template: string, data: Record<string, string>): string {
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
        result = result.replace(regex, value);
    });
    return result;
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Sleep function
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate random ID
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

// Download as CSV
export function downloadCSV(data: Record<string, unknown>[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return String(value);
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
}

// Business type options for search
export const BUSINESS_TYPES = [
    { value: 'restaurant', label: 'Restaurant / Cafe' },
    { value: 'retail', label: 'Retail Store' },
    { value: 'salon', label: 'Salon / Spa' },
    { value: 'gym', label: 'Gym / Fitness Center' },
    { value: 'hotel', label: 'Hotel / Accommodation' },
    { value: 'healthcare', label: 'Healthcare / Clinic' },
    { value: 'automotive', label: 'Automotive / Car Service' },
    { value: 'education', label: 'Education / Tutoring' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'legal', label: 'Legal Services' },
    { value: 'accounting', label: 'Accounting / Finance' },
    { value: 'construction', label: 'Construction / Contractor' },
    { value: 'photography', label: 'Photography / Videography' },
    { value: 'event', label: 'Event Planning' },
    { value: 'pet', label: 'Pet Services' },
    { value: 'other', label: 'Other' },
];

// Client need options
export const CLIENT_NEEDS = [
    { value: 'needs_website', label: 'No Website' },
    { value: 'bad_website', label: 'Poor/Outdated Website' },
    { value: 'not_mobile', label: 'Not Mobile Friendly' },
    { value: 'no_ssl', label: 'No SSL Certificate' },
    { value: 'slow_website', label: 'Slow Loading Website' },
];

// Countries list (comprehensive)
export const COUNTRIES = [
    // Popular countries first
    { value: 'IN', label: 'India' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'SG', label: 'Singapore' },
    // All countries alphabetically
    { value: 'AF', label: 'Afghanistan' },
    { value: 'AL', label: 'Albania' },
    { value: 'DZ', label: 'Algeria' },
    { value: 'AR', label: 'Argentina' },
    { value: 'AT', label: 'Austria' },
    { value: 'BD', label: 'Bangladesh' },
    { value: 'BE', label: 'Belgium' },
    { value: 'BR', label: 'Brazil' },
    { value: 'BG', label: 'Bulgaria' },
    { value: 'KH', label: 'Cambodia' },
    { value: 'CL', label: 'Chile' },
    { value: 'CN', label: 'China' },
    { value: 'CO', label: 'Colombia' },
    { value: 'HR', label: 'Croatia' },
    { value: 'CZ', label: 'Czech Republic' },
    { value: 'DK', label: 'Denmark' },
    { value: 'EG', label: 'Egypt' },
    { value: 'EE', label: 'Estonia' },
    { value: 'ET', label: 'Ethiopia' },
    { value: 'FI', label: 'Finland' },
    { value: 'GH', label: 'Ghana' },
    { value: 'GR', label: 'Greece' },
    { value: 'HK', label: 'Hong Kong' },
    { value: 'HU', label: 'Hungary' },
    { value: 'IS', label: 'Iceland' },
    { value: 'ID', label: 'Indonesia' },
    { value: 'IR', label: 'Iran' },
    { value: 'IQ', label: 'Iraq' },
    { value: 'IE', label: 'Ireland' },
    { value: 'IL', label: 'Israel' },
    { value: 'IT', label: 'Italy' },
    { value: 'JP', label: 'Japan' },
    { value: 'JO', label: 'Jordan' },
    { value: 'KZ', label: 'Kazakhstan' },
    { value: 'KE', label: 'Kenya' },
    { value: 'KW', label: 'Kuwait' },
    { value: 'LV', label: 'Latvia' },
    { value: 'LB', label: 'Lebanon' },
    { value: 'LT', label: 'Lithuania' },
    { value: 'LU', label: 'Luxembourg' },
    { value: 'MY', label: 'Malaysia' },
    { value: 'MV', label: 'Maldives' },
    { value: 'MX', label: 'Mexico' },
    { value: 'MA', label: 'Morocco' },
    { value: 'MM', label: 'Myanmar' },
    { value: 'NP', label: 'Nepal' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'NZ', label: 'New Zealand' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'NO', label: 'Norway' },
    { value: 'OM', label: 'Oman' },
    { value: 'PK', label: 'Pakistan' },
    { value: 'PA', label: 'Panama' },
    { value: 'PE', label: 'Peru' },
    { value: 'PH', label: 'Philippines' },
    { value: 'PL', label: 'Poland' },
    { value: 'PT', label: 'Portugal' },
    { value: 'QA', label: 'Qatar' },
    { value: 'RO', label: 'Romania' },
    { value: 'RU', label: 'Russia' },
    { value: 'SA', label: 'Saudi Arabia' },
    { value: 'RS', label: 'Serbia' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'KR', label: 'South Korea' },
    { value: 'ES', label: 'Spain' },
    { value: 'LK', label: 'Sri Lanka' },
    { value: 'SE', label: 'Sweden' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'TW', label: 'Taiwan' },
    { value: 'TH', label: 'Thailand' },
    { value: 'TR', label: 'Turkey' },
    { value: 'UA', label: 'Ukraine' },
    { value: 'VN', label: 'Vietnam' },
    { value: 'ZW', label: 'Zimbabwe' },
];

// Indian states
export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

// US States
export const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
    'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming', 'Washington DC',
];

// UK Regions
export const UK_REGIONS = [
    'England', 'Scotland', 'Wales', 'Northern Ireland',
    'London', 'South East', 'South West', 'East of England', 'West Midlands',
    'East Midlands', 'Yorkshire', 'North West', 'North East',
];

// Canadian Provinces
export const CANADA_PROVINCES = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island',
    'Quebec', 'Saskatchewan', 'Northwest Territories', 'Nunavut', 'Yukon',
];

// Australian States
export const AUSTRALIA_STATES = [
    'New South Wales', 'Victoria', 'Queensland', 'Western Australia',
    'South Australia', 'Tasmania', 'Northern Territory', 'Australian Capital Territory',
];

// UAE Emirates
export const UAE_EMIRATES = [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah',
];

// Germany States
export const GERMANY_STATES = [
    'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
    'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia',
    'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia',
];

// France Regions
export const FRANCE_REGIONS = [
    'Île-de-France', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie',
    'Hauts-de-France', 'Grand Est', 'Provence-Alpes-Côte d\'Azur', 'Pays de la Loire',
    'Brittany', 'Normandy', 'Burgundy-Franche-Comté', 'Centre-Val de Loire', 'Corsica',
];

// Get states by country code
export function getStatesByCountry(countryCode: string): string[] {
    switch (countryCode) {
        case 'IN': return INDIAN_STATES;
        case 'US': return US_STATES;
        case 'GB': return UK_REGIONS;
        case 'CA': return CANADA_PROVINCES;
        case 'AU': return AUSTRALIA_STATES;
        case 'AE': return UAE_EMIRATES;
        case 'DE': return GERMANY_STATES;
        case 'FR': return FRANCE_REGIONS;
        default: return [];
    }
}

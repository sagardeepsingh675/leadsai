import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

const defaultMeta = {
    title: 'Stachbit - AI Lead Generator | Find Clients Who Need Websites',
    description: 'Find businesses that need websites automatically. AI-powered lead generation, website analysis, contact extraction, and personalized email outreach.',
    keywords: 'lead generation, business leads, website analysis, email outreach, client finder, web developer leads',
    image: 'https://ai.stachbit.in/og-image.png',
    url: 'https://ai.stachbit.in',
    type: 'website',
};

export function useSEO({
    title,
    description,
    keywords,
    image,
    url,
    type,
}: SEOProps = {}) {
    useEffect(() => {
        const finalTitle = title
            ? `${title} | Stachbit`
            : defaultMeta.title;

        const finalDescription = description || defaultMeta.description;
        const finalKeywords = keywords || defaultMeta.keywords;
        const finalImage = image || defaultMeta.image;
        const finalUrl = url || defaultMeta.url;
        const finalType = type || defaultMeta.type;

        // Update document title
        document.title = finalTitle;

        // Update meta tags
        updateMetaTag('description', finalDescription);
        updateMetaTag('keywords', finalKeywords);

        // Update Open Graph tags
        updateMetaTag('og:title', finalTitle, 'property');
        updateMetaTag('og:description', finalDescription, 'property');
        updateMetaTag('og:image', finalImage, 'property');
        updateMetaTag('og:url', finalUrl, 'property');
        updateMetaTag('og:type', finalType, 'property');

        // Update Twitter tags
        updateMetaTag('twitter:title', finalTitle, 'property');
        updateMetaTag('twitter:description', finalDescription, 'property');
        updateMetaTag('twitter:image', finalImage, 'property');

        // Update canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = finalUrl;
    }, [title, description, keywords, image, url, type]);
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
    }
    meta.content = content;
}

// Pre-defined SEO configs for each page
export const pageSEO = {
    landing: {
        title: undefined, // Uses default
        description: 'Find businesses that need websites automatically. AI-powered lead generation for web developers and agencies. Start your free trial today.',
        url: 'https://ai.stachbit.in/',
    },
    about: {
        title: 'About Us',
        description: 'Learn about Stachbit - the AI-powered lead generation platform built by developers for developers. Our mission, values, and team.',
        url: 'https://ai.stachbit.in/about',
    },
    pricing: {
        title: 'Pricing',
        description: 'Simple, transparent pricing for Stachbit lead generation. Free trial with 25 leads. Choose from Basic, Pro, or Ultra Pro plans.',
        url: 'https://ai.stachbit.in/pricing',
    },
    contact: {
        title: 'Contact Us',
        description: 'Get in touch with the Stachbit team. Questions about our lead generation platform? We typically respond within 24 hours.',
        url: 'https://ai.stachbit.in/contact',
    },
    login: {
        title: 'Login',
        description: 'Sign in to your Stachbit account to access your leads, email campaigns, and analytics dashboard.',
        url: 'https://ai.stachbit.in/login',
    },
    register: {
        title: 'Sign Up Free',
        description: 'Create your free Stachbit account. Get 25 leads and 10 emails free. No credit card required.',
        url: 'https://ai.stachbit.in/register',
    },
};

export default useSEO;

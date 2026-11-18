export interface SiteSettings {
  brand_name: string;
  slogan: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  about_title: string;
  about_story: string;
  about_mission: string;
  about_commitment: string;
  about_image: string;
  whatsapp_number: string;
  whatsapp_display: string;
  instagram_handle: string;
  instagram_url: string;
  email: string;
  location: string;
  business_hours: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  image_url: string;
  sort_order: number;
  active: number;
}

export interface PricingPlan {
  id: number;
  title: string;
  subtitle: string;
  price_text: string;
  billing_note: string;
  features: string[];
  highlighted: number;
  active: number;
  sort_order: number;
}

export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  description: string;
  client_name: string;
  duration: string;
  audio_url: string;
  image_url: string;
  media_type: 'audio' | 'art';
  featured: number;
  created_at: string;
}

export interface DemoTrack {
  id: number;
  title: string;
  category: string;
  description: string;
  duration: string;
  audio_url: string;
  cover_url: string;
  plays_count: number;
  created_at: string;
}

export interface Testimonial {
  id: number;
  client_name: string;
  client_role: string;
  company: string;
  quote: string;
  rating: number;
  active: number;
  created_at: string;
}

export interface StudioPhoto {
  id: number;
  title: string;
  caption: string;
  image_url: string;
  category: string;
  created_at: string;
}

export interface QuoteRequest {
  id: number;
  name: string;
  phone: string;
  email: string;
  service_name: string;
  plan_name: string;
  message: string;
  status: string;
  created_at: string;
}

export interface StudioDataPayload {
  settings: SiteSettings;
  services: ServiceItem[];
  plans: PricingPlan[];
  portfolio: PortfolioItem[];
  demos: DemoTrack[];
  testimonials: Testimonial[];
  photos: StudioPhoto[];
}

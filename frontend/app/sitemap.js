export default async function sitemap() {
  const baseUrl = 'https://www.tuytantana.uz';

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    const res = await fetch('https://api.tuytantana.uz/api/services');
    if (!res.ok) throw new Error('Failed to fetch services');
    
    const data = await res.json();
    
    // Some APIs return paginated objects like { data: [...] } or { results: [...] } or just an array
    const services = Array.isArray(data) ? data : (data.data || data.results || []);
    
    const dynamicPages = services.map((service) => ({
      url: `${baseUrl}/services/${service.id}`,
      lastModified: new Date(service.updated_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...dynamicPages];
  } catch (error) {
    console.error('Sitemap fetch error:', error);
    return staticPages;
  }
}

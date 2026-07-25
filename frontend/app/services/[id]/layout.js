export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const id = params?.id;
  try {
    const res = await fetch(`https://api.tuytantana.uz/api/services/${id}`, { next: { revalidate: 3600 } });
    const json = await res.json();
    if (json.success && json.data) {
      const service = json.data;
      const title = `${service.name} | To'y Tantana - O'zbekiston`;
      const description = `${service.name} (${service.location_name || 'Toshkent'}) - Narxi: ${service.price ? Number(service.price).toLocaleString('uz-UZ') + " so'm" : 'kelishuv asosida'}. To'y Tantana platformasi orqali online bron qiling va batafsil ma'lumot oling.`;
      const image = service.images && service.images.length > 0 ? `https://api.tuytantana.uz${service.images[0].image_path}` : 'https://www.tuytantana.uz/icon-512.png';

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `https://www.tuytantana.uz/services/${id}`,
          siteName: "To'y Tantana",
          images: [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: service.name,
            },
          ],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [image],
        },
      };
    }
  } catch (err) {
    console.error('Error generating metadata for service:', err);
  }

  return {
    title: "Xizmat haqida batafsil | To'y Tantana",
    description: "To'y va marosim xizmatlarini izlash, topish va bron qilish platformasi.",
  };
}

export default async function ServiceLayout({ children, params: paramsPromise }) {
  const params = await paramsPromise;
  const id = params?.id;
  let schemaData = null;

  try {
    const res = await fetch(`https://api.tuytantana.uz/api/services/${id}`, { next: { revalidate: 3600 } });
    const json = await res.json();
    if (json.success && json.data) {
      const service = json.data;
      const image = service.images && service.images.length > 0 ? `https://api.tuytantana.uz${service.images[0].image_path}` : 'https://www.tuytantana.uz/icon-512.png';
      
      schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": service.name,
        "image": [image],
        "description": service.description || `${service.name} - ${service.location_name || 'O\'zbekiston'}`,
        "offers": {
          "@type": "Offer",
          "url": `https://www.tuytantana.uz/services/${id}`,
          "priceCurrency": "UZS",
          "price": service.price || "0",
          "availability": "https://schema.org/InStock"
        },
        ...(service.rating && Number(service.rating) > 0 ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": service.rating,
            "reviewCount": service.reviews_count || 1
          }
        } : {})
      };
    }
  } catch (e) {
    // ignore error
  }

  return (
    <>
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      {children}
    </>
  );
}

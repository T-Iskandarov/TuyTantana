export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/my-bookings/'],
      },
    ],
    sitemap: 'https://www.tuytantana.uz/sitemap.xml',
  }
}

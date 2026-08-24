import { Helmet } from 'react-helmet-async'

interface PageMetaProps {
  title: string
  description?: string
  path?: string
}

const SITE_NAME = 'MBE Extra Purchaser'
const BASE_URL = 'https://extrapurchaser.pro.et'

export function PageMeta({ title, description, path }: PageMetaProps) {
  const fullTitle = `${title} — ${SITE_NAME}`
  const url = path ? `${BASE_URL}${path}` : BASE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <link rel="canonical" href={url} />
    </Helmet>
  )
}

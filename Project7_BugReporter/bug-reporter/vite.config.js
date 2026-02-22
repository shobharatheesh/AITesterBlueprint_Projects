import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createProxyMiddleware } from 'http-proxy-middleware'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Dynamic JIRA proxy plugin
    {
      name: 'jira-dynamic-proxy',
      configureServer(server) {
        // Route: /jira-proxy/<domain>/rest/api/...
        server.middlewares.use('/jira-proxy', (req, res) => {
          // URL pattern: /company.atlassian.net/rest/api/3/issue
          const urlPath = req.url || '/'
          const match = urlPath.match(/^\/([^/]+)(\/.*)?$/)
          if (!match) {
            res.writeHead(400)
            res.end(JSON.stringify({ error: 'Invalid proxy path' }))
            return
          }

          const domain = match[1]
          const restPath = match[2] || '/'
          const target = `https://${domain}`

          // Rewrite the URL to remove the domain prefix
          req.url = restPath

          // Create a one-time proxy for this request
          const proxy = createProxyMiddleware({
            target,
            changeOrigin: true,
            secure: true,
            logLevel: 'silent',
            on: {
              error: (err, _req, res) => {
                console.error('[JIRA Proxy Error]', err.message)
                if (!res.headersSent) {
                  res.writeHead(502, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ error: 'Proxy connection failed', message: err.message }))
                }
              },
            },
          })

          proxy(req, res, () => { })
        })
      },
    },
  ],
})

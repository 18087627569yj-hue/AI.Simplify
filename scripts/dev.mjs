import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const publicRoot = resolve(projectRoot, 'public')
const sourceRoot = resolve(projectRoot, 'src')
const port = Number(process.env.PORTFOLIO_DEV_PORT || 4173)

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

const isInside = (filePath, root) => filePath === root || filePath.startsWith(`${root}${sep}`)

const existingFile = async (filePath, root) => {
  if (!isInside(filePath, root)) return null
  try {
    const info = await stat(filePath)
    if (info.isFile()) return filePath
    if (info.isDirectory()) {
      const indexPath = resolve(filePath, 'index.html')
      if (isInside(indexPath, root) && (await stat(indexPath)).isFile()) return indexPath
    }
  } catch {
    return null
  }
  return null
}

const resolveRequest = async (pathname) => {
  const decodedPath = decodeURIComponent(pathname)
  const relativePath = decodedPath.replace(/^\/+/, '')

  if (relativePath.split('/').some(segment => segment.startsWith('.'))) return null

  if (decodedPath === '/') return resolve(projectRoot, 'index.html')

  if (decodedPath.startsWith('/src/')) {
    const sourcePath = decodedPath.slice('/src/'.length)
    return existingFile(resolve(sourceRoot, sourcePath), sourceRoot)
  }

  const publicMatch = await existingFile(resolve(publicRoot, relativePath), publicRoot)
  if (publicMatch) return publicMatch

  if (!extname(decodedPath)) return resolve(projectRoot, 'index.html')
  return null
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://localhost')
    const filePath = await resolveRequest(url.pathname)

    if (!filePath) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }

    const body = await readFile(filePath)
    response.writeHead(200, {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Pragma': 'no-cache',
    })
    if (request.method === 'HEAD') response.end()
    else response.end(body)
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end(`Preview server error: ${error.message}`)
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Live source preview: http://localhost:${port}`)
  console.log('Edit index.html, src/, or public/, then refresh the browser.')
})

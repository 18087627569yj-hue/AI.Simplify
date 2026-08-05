import { cp, mkdir, rm } from 'node:fs/promises'

await rm('dist', { recursive: true, force: true })
await mkdir('dist/client/src', { recursive: true })
await mkdir('dist/server', { recursive: true })
await cp('index.html', 'dist/client/index.html')
await cp('src/styles.css', 'dist/client/src/styles.css')
await cp('src/app.js', 'dist/client/src/app.js')
await cp('public', 'dist/client', { recursive: true })
await cp('worker/index.js', 'dist/server/index.js')
console.log('Static site built to dist/')

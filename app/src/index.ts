import liveServer from 'live-server'
import { dirname } from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

liveServer.start({
  open: false,
  host: '127.0.0.1',
  port: 3000,
  root: 'public',
  mount: [
    ['/web_modules/lib', dirname(require.resolve('@birchlabs-rxplay/lib'))]
  ]
})
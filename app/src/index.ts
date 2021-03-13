import liveServer from 'live-server'

liveServer.start({
  open: false,
  host: '127.0.0.1',
  port: 3000,
  root: 'public',
  mount: [
    ['/web_modules/lib', '../node_modules/@birchlabs-rxplay/lib/dist']
  ]
})
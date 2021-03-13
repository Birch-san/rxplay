import liveServer, { LiveServerParams } from 'live-server'

// declare module 'live-server' {
//   interface LiveServerParams {
//     watch: string[]
//   }
// }

const libDist = '../node_modules/@birchlabs-rxplay/lib/dist'

const liveServerParams: LiveServerParams = {
  // Opens the local server on start.
  open: false,
  host: '127.0.0.1',
  port: 3000,
  // Uses `public` as the local server folder.
  root: 'public',
  // watch: [libDist, 'public'],
  mount: [
    ['/web_modules/lib', libDist]
  ]
}

liveServer.start(liveServerParams)
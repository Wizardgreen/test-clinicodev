import { http, HttpResponse, delay } from 'msw'
import { setupWorker } from 'msw/browser'
import { findNodeWithDepth, findParentNodeWithDepth } from './helper';

const handlers = [
  http.all('*', async () => {
    await delay(1000)
  }),
  http.get('/api/policyholders', ({ request }) => {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const result = findNodeWithDepth(code, 4)

    return HttpResponse.json({ result })
  }),
  http.get('/api/policyholders/:code/top', ({ request }) => {
    const url = new URL(request.url)
    const code = url.pathname.split('/')[3]
    const result = findParentNodeWithDepth(code, 4)

    return HttpResponse.json({ result })
  }),
]



const worker = setupWorker(...handlers)

export { worker }
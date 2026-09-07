const bc = new BroadcastChannel('medvita_queue_channel')

export function broadcastQueueUpdate(payload) {
  bc.postMessage(payload)
}

export function subscribeQueueUpdate(callback) {
  bc.onmessage = (event) => callback(event.data)
  return () => bc.close()
}

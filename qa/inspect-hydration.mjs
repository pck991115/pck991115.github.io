const chromeBase = "http://127.0.0.1:9222";
const appBase = "http://127.0.0.1:4321";

const targets = await fetch(`${chromeBase}/json`).then((r) => r.json());
const target = targets.find((item) => item.url.startsWith(appBase)) || targets[0];
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});
let id = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.id && pending.has(data.id)) {
    const { resolve, reject } = pending.get(data.id);
    pending.delete(data.id);
    data.error ? reject(new Error(JSON.stringify(data.error))) : resolve(data.result);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const message = { id: ++id, method, params };
    pending.set(message.id, { resolve, reject });
    ws.send(JSON.stringify(message));
  });
await send("Runtime.enable");
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return result.result.value;
};
const info = await evaluate(`(() => ({
  href: location.href,
  ready: document.readyState,
  astroLoad: !!window.Astro?.load,
  refreshReg: typeof window.$RefreshReg$,
  islands: Array.from(document.querySelectorAll('astro-island')).map((el) => ({
    component: el.getAttribute('component-url'),
    ssr: el.hasAttribute('ssr'),
    client: el.getAttribute('client'),
    error: el.getAttribute('data-astro-error') || null,
    renderTime: el.getAttribute('client-render-time') || null
  })),
  overlay: !!document.querySelector('.search-overlay')
}))()`);
console.log(JSON.stringify(info, null, 2));
ws.close();

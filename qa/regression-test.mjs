const chromeBase = "http://127.0.0.1:9222";
const appBase = "http://127.0.0.1:4321";

async function json(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${url} -> ${response.status}`);
  }
  return response.json();
}

async function connect() {
  const target = await json(`${chromeBase}/json/new?${encodeURIComponent(appBase + "/")}`, {
    method: "PUT",
  });
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const events = [];

  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      data.error ? reject(new Error(JSON.stringify(data.error))) : resolve(data.result);
      return;
    }
    events.push(data);
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const message = { id: ++id, method, params };
      pending.set(message.id, { resolve, reject });
      ws.send(JSON.stringify(message));
    });

  return { ws, send, events };
}

async function delay(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { ws, send, events } = await connect();
  const results = [];

  const pass = (name, detail = "") => results.push({ name, status: "pass", detail });
  const fail = (name, detail = "") => results.push({ name, status: "fail", detail });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      window.__regressionErrors = [];
      window.addEventListener('error', event => window.__regressionErrors.push(String(event.message || event.error)));
      window.addEventListener('unhandledrejection', event => window.__regressionErrors.push(String(event.reason)));
    `,
  });

  async function evalValue(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "Runtime exception");
    }
    return result.result.value;
  }

  async function navigate(path, width = 1440, height = 1000) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await send("Page.navigate", { url: `${appBase}${path}` });
    await delay(900);
    await evalValue(`new Promise(resolve => {
      const done = () => resolve(true);
      if (document.readyState === 'complete') done();
      else window.addEventListener('load', done, { once: true });
    })`);
    await delay(900);
  }

  async function hydrated() {
    return evalValue(`Array.from(document.querySelectorAll('astro-island')).every(el => !el.hasAttribute('ssr'))`);
  }

  async function click(selector) {
    return evalValue(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      el.click();
      return true;
    })()`);
  }

  async function setInput(selector, value) {
    return evalValue(`(() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ${JSON.stringify(value)} }));
      return input.value;
    })()`);
  }

  await navigate("/");
  (await hydrated()) ? pass("首页 React 组件已水合") : fail("首页 React 组件未水合");

  if (await click(".sidebar__search")) {
    await delay(300);
    const opened = await evalValue(`!!document.querySelector('.search-overlay [role="dialog"]')`);
    opened ? pass("桌面搜索按钮可打开弹窗") : fail("桌面搜索按钮点击后未打开弹窗");
    await setInput(".search-dialog input", "理财");
    await delay(300);
    const hint = await evalValue(`document.querySelector('.search-dialog__hint')?.textContent || ''`);
    hint.includes("找到") ? pass("搜索输入可筛选结果", hint.trim()) : fail("搜索输入后提示未变化", hint.trim());
    await click(".search-dialog button[aria-label='关闭搜索']");
    await delay(200);
    const closed = await evalValue(`!document.querySelector('.search-overlay')`);
    closed ? pass("搜索关闭按钮可关闭弹窗") : fail("搜索关闭按钮无效");
  } else {
    fail("找不到桌面搜索按钮");
  }

  await evalValue(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))`);
  await delay(300);
  (await evalValue(`!!document.querySelector('.search-overlay')`))
    ? pass("⌘K 快捷键可打开搜索")
    : fail("⌘K 快捷键无效");

  await navigate("/notes/?theme=%E7%90%86%E8%B4%A2%E5%AD%A6%E4%B9%A0");
  (await hydrated()) ? pass("笔记页 React 组件已水合") : fail("笔记页 React 组件未水合");
  const initialTheme = await evalValue(`document.querySelector('.notes-filters .is-active')?.textContent?.trim()`);
  initialTheme === "理财学习" ? pass("URL theme 参数可初始化筛选") : fail("URL theme 参数未生效", String(initialTheme));

  const careerClicked = await evalValue(`(() => {
    const btn = Array.from(document.querySelectorAll('.notes-filters button')).find(b => b.textContent.trim() === '职业成长');
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
  await delay(300);
  const careerTheme = await evalValue(`document.querySelector('.notes-filters .is-active')?.textContent?.trim()`);
  careerClicked && careerTheme === "职业成长"
    ? pass("笔记主题按钮可切换")
    : fail("笔记主题按钮点击后未切换", String(careerTheme));

  await setInput(".notes-query input", "不存在的关键词");
  await delay(300);
  const emptyShown = await evalValue(`!!document.querySelector('.empty-state')`);
  emptyShown ? pass("笔记列表搜索可显示空状态") : fail("笔记列表搜索输入后未变化");

  await navigate("/resume/");
  await evalValue(`window.__printed = false; window.print = () => { window.__printed = true; };`);
  await click(".secondary-button");
  await delay(200);
  (await evalValue(`window.__printed === true`))
    ? pass("简历打印按钮触发 window.print")
    : fail("简历打印按钮未触发打印");

  await navigate("/", 390, 900);
  (await click(".mobile-actions button[aria-label='打开菜单']")) ? pass("找到移动端菜单按钮") : fail("找不到移动端菜单按钮");
  await delay(300);
  (await evalValue(`document.querySelector('.sidebar')?.classList.contains('sidebar--open')`))
    ? pass("移动端菜单按钮可展开侧栏")
    : fail("移动端菜单按钮点击后未展开侧栏");

  await click(".menu-backdrop");
  await delay(200);
  (await evalValue(`!document.querySelector('.sidebar')?.classList.contains('sidebar--open')`))
    ? pass("移动端遮罩可关闭侧栏")
    : fail("移动端遮罩关闭无效");

  await click(".mobile-actions button[aria-label='搜索文章']");
  await delay(300);
  (await evalValue(`!!document.querySelector('.search-overlay')`))
    ? pass("移动端搜索按钮可打开弹窗")
    : fail("移动端搜索按钮无效");

  const navPaths = ["/", "/notes/", "/projects/", "/about/", "/resume/", "/now/"];
  for (const path of navPaths) {
    await navigate(path);
    const title = await evalValue(`document.title`);
    title ? pass(`路由可访问 ${path}`, title) : fail(`路由无标题 ${path}`);
  }

  const runtimeErrors = await evalValue(`window.__regressionErrors || []`);
  const logErrors = events.filter((event) =>
    (event.method === "Runtime.exceptionThrown") ||
    (event.method === "Log.entryAdded" && ["error", "warning"].includes(event.params?.entry?.level))
  );
  runtimeErrors.length === 0 && logErrors.length === 0
    ? pass("未捕获前端运行时错误")
    : fail("存在前端运行时错误", JSON.stringify({ runtimeErrors, logErrors: logErrors.slice(0, 5) }));

  const failed = results.filter((item) => item.status === "fail");
  console.log(JSON.stringify({ failed: failed.length, results }, null, 2));
  ws.close();
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export const navigation = [
  { label: "首页", href: "/" },
  { label: "学习笔记", href: "/notes/" },
  { label: "工作与项目", href: "/projects/" },
  { label: "关于我", href: "/about/" },
  { label: "简历", href: "/resume/" },
  { label: "最近动态", href: "/now/" },
];

export const themes = [
  {
    index: "01",
    name: "知识管理",
    count: 12,
    description: "把零散的信息整理成可复用的知识。",
  },
  {
    index: "02",
    name: "理财学习",
    count: 8,
    description: "记录长期主义下的财务认知与实践。",
  },
  {
    index: "03",
    name: "职业成长",
    count: 5,
    description: "复盘项目、能力与职业选择。",
  },
];

export const projects = [
  {
    title: "个人知识主页",
    description: "用于沉淀学习笔记、项目复盘与职业成长记录的内容型个人站。",
    role: "产品规划 · 设计 · 开发",
    stack: "Astro · React · TypeScript",
    href: "/projects/#knowledge-home",
  },
  {
    title: "笔记工具集",
    description: "整理常用的记录方法与模板，降低开始写作和持续复盘的成本。",
    role: "需求梳理 · 内容设计",
    stack: "Markdown · GitHub",
    href: "/projects/#note-tools",
  },
  {
    title: "可视化组件库",
    description: "积累工作中常用的数据表达模式，帮助指标被更准确地理解。",
    role: "前端开发 · 数据表达",
    stack: "React · ECharts",
    href: "/projects/#visual-kit",
  },
];

export const currentWork = {
  title: "个人知识主页迭代",
  description: "优化内容组织与搜索体验，沉淀可复用的写作结构。",
  progress: 60,
};

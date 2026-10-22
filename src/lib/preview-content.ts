export type PreviewRow = {
  name: string;
  detail: string;
  value: string;
  status: string;
};

export type PreviewContent = {
  title: string;
  description: string;
  context: string;
  status: string;
  metrics: { label: string; value: string; note: string }[];
  fields: { label: string; value: string }[];
  rows: PreviewRow[];
  process: string[];
};

const makeContent = (
  title: string,
  description: string,
  context: string,
  metrics: PreviewContent["metrics"],
  fields: PreviewContent["fields"],
  rows: PreviewRow[],
  process: string[],
  status = "运行正常",
): PreviewContent => ({ title, description, context, status, metrics, fields, rows, process });

export function buildPreviewContent(title: string, caption?: string): PreviewContent {
  const cleanTitle = title.trim() || "工作概览";
  const description = caption?.trim() || "关键数据、处理状态与下一步操作集中呈现。";

  if (/(调价|价格|定价|报价|成本|费用|折扣|促销)/.test(cleanTitle)) {
    return makeContent(
      cleanTitle,
      description,
      "价格规则 · 即时测算",
      [
        { label: "基准价格", value: "¥ 128.00", note: "当前值" },
        { label: "调整幅度", value: "−8.0%", note: "规则已应用" },
        { label: "调整后价格", value: "¥ 117.76", note: "预估结果" },
      ],
      [
        { label: "基准价格", value: "¥ 128.00" },
        { label: "调整幅度", value: "−8.0%" },
        { label: "价格下限", value: "¥ 99.00" },
      ],
      [
        { name: "标准方案", detail: "¥ 128.00  →  ¥ 117.76", value: "−8.0%", status: "已计算" },
        { name: "进阶方案", detail: "¥ 198.00  →  ¥ 182.16", value: "−8.0%", status: "已计算" },
        { name: "专业方案", detail: "¥ 328.00  →  ¥ 301.76", value: "−8.0%", status: "待确认" },
      ],
      ["选择价格范围", "设置调整规则", "核对预估结果"],
      "测算完成",
    );
  }

  if (/(导入|导出|上传|下载|批量)/.test(cleanTitle)) {
    return makeContent(
      cleanTitle,
      description,
      "文件任务 · 处理队列",
      [
        { label: "待处理", value: "24 项", note: "本次任务" },
        { label: "已完成", value: "18 项", note: "处理成功" },
        { label: "成功率", value: "98.6%", note: "运行状态良好" },
      ],
      [
        { label: "数据来源", value: "本地文件" },
        { label: "字段映射", value: "自动匹配" },
        { label: "重复记录", value: "跳过重复项" },
      ],
      [
        { name: "数据文件 A", detail: "已校验 · 128 条记录", value: "完成", status: "成功" },
        { name: "数据文件 B", detail: "处理中 · 64 条记录", value: "72%", status: "进行中" },
        { name: "数据文件 C", detail: "等待处理 · 32 条记录", value: "排队中", status: "待处理" },
      ],
      ["选择数据", "检查字段", "执行任务"],
      "队列运行中",
    );
  }

  if (/(匹配|查找|搜索|检索|识别)/.test(cleanTitle)) {
    return makeContent(
      cleanTitle,
      description,
      "匹配任务 · 结果预览",
      [
        { label: "匹配成功", value: "1,248 条", note: "本次结果" },
        { label: "匹配准确率", value: "98.6%", note: "高于预期" },
        { label: "待复核", value: "18 条", note: "建议检查" },
      ],
      [
        { label: "匹配字段", value: "名称 + 编码" },
        { label: "匹配规则", value: "相似度优先" },
        { label: "最低阈值", value: "85%" },
      ],
      [
        { name: "记录 #00128", detail: "名称、编码均匹配", value: "99.2%", status: "精确" },
        { name: "记录 #00129", detail: "名称相似，编码一致", value: "92.8%", status: "建议复核" },
        { name: "记录 #00130", detail: "找到 3 条候选结果", value: "87.4%", status: "待确认" },
      ],
      ["选择条件", "运行匹配", "确认结果"],
      "匹配完成",
    );
  }

  if (/(设置|配置|参数|规则|权限)/.test(cleanTitle)) {
    return makeContent(
      cleanTitle,
      description,
      "参数管理 · 当前版本",
      [
        { label: "配置项", value: "12 项", note: "当前模块" },
        { label: "运行状态", value: "已生效", note: "检查通过" },
        { label: "最近更新", value: "09:41", note: "刚刚同步" },
      ],
      [
        { label: "执行模式", value: "自动运行" },
        { label: "结果通知", value: "任务完成时提醒" },
        { label: "数据范围", value: "全部可用数据" },
      ],
      [
        { name: "基础参数", detail: "6 项 · 最近更新 09:41", value: "已保存", status: "正常" },
        { name: "执行规则", detail: "4 项 · 自动校验已开启", value: "已启用", status: "正常" },
        { name: "访问范围", detail: "2 项 · 权限范围明确", value: "已同步", status: "正常" },
      ],
      ["编辑参数", "检查变更", "保存生效"],
      "配置已生效",
    );
  }

  if (/(统计|分析|报表|趋势|数据|概览|监控|业绩)/.test(cleanTitle)) {
    return makeContent(
      cleanTitle,
      description,
      "数据汇总 · 近 30 天",
      [
        { label: "数据总量", value: "1,284", note: "条有效记录" },
        { label: "较上周期", value: "+12.8%", note: "持续增长" },
        { label: "完成率", value: "96.4%", note: "整体表现" },
      ],
      [
        { label: "统计周期", value: "最近 30 天" },
        { label: "对比方式", value: "与上周期比较" },
        { label: "数据范围", value: "全部有效记录" },
      ],
      [
        { name: "本周", detail: "处理量较上周提升", value: "+12.8%", status: "上升" },
        { name: "完成率", detail: "目标值 95% · 实际 96.4%", value: "96.4%", status: "达标" },
        { name: "待处理", detail: "较昨日减少 8 项", value: "18 项", status: "改善" },
      ],
      ["汇总数据", "分析变化", "查看明细"],
      "数据已更新",
    );
  }

  return makeContent(
    cleanTitle,
    description,
    "模块工作区 · 实时状态",
    [
      { label: "处理条目", value: "128 项", note: "本次工作区" },
      { label: "完成率", value: "96.8%", note: "运行状态良好" },
      { label: "待处理", value: "04 项", note: "可继续处理" },
    ],
    [
      { label: "处理范围", value: "当前选中数据" },
      { label: "执行方式", value: "按规则自动处理" },
      { label: "结果状态", value: "完成后即时更新" },
    ],
    [
      { name: "工作项 #00128", detail: "主要信息已校验", value: "已完成", status: "正常" },
      { name: "工作项 #00129", detail: "等待下一步操作", value: "处理中", status: "进行中" },
      { name: "工作项 #00130", detail: "所有字段符合规则", value: "待确认", status: "待处理" },
    ],
    ["选择处理项", "应用操作规则", "查看完成结果"],
  );
}


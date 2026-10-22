import Image from "next/image";
import { ArrowUpRight, Check, Circle, Filter, Plus, Search, Sparkles } from "lucide-react";
import type { Software } from "@/data/software";
import { buildPreviewContent } from "@/lib/preview-content";
import type { PreviewContent } from "@/lib/preview-content";
import { withSiteBasePath } from "@/lib/site-path";

type ProductVisualProps = {
  visual: Software["visual"];
  name: string;
  compact?: boolean;
  imageUrl?: string;
  featured?: boolean;
  title?: string;
  caption?: string;
};

export function ProductVisual({ visual, name, compact = false, imageUrl, featured = false, title, caption }: ProductVisualProps) {
  const moduleTitle = title?.trim() || "工作概览";
  const preview = buildPreviewContent(moduleTitle, caption);

  return (
    <div className={`product-visual art-${visual} ${compact ? "is-compact" : ""} ${featured ? "is-featured" : ""}`} aria-label={`${name} · ${moduleTitle} 界面示意图`} role="img">
      {imageUrl ? featured ? <div className="featured-image-frame">
        <div className="featured-image-toolbar">
          <div className="featured-window-dots"><i /><i /><i /></div>
          <span className="featured-app-mark">{name.slice(0, 1)}</span>
          <span className="featured-app-name">{name}</span>
          <span className="featured-preview-label">界面预览</span>
        </div>
        <div className="featured-image-stage">
          <div className="custom-product-image"><Image src={withSiteBasePath(imageUrl)} alt={`${name} 软件操作界面截图`} fill unoptimized sizes="(max-width: 700px) 92vw, (max-width: 1100px) 50vw, 42vw" /></div>
        </div>
        <div className="featured-image-caption"><span><i />真实操作界面</span><span>DESKTOP WORKSPACE</span></div>
      </div> : <div className="custom-product-image"><Image src={withSiteBasePath(imageUrl)} alt={`${name} 产品展示图`} fill unoptimized sizes="(max-width: 700px) 92vw, (max-width: 1100px) 50vw, 42vw" /></div> : <div className="app-window preview-window">
        <div className="window-bar">
          <div className="window-dots"><i /><i /><i /></div>
          <span className="window-title">{name}</span>
          <span className="window-action"><ArrowUpRight size={12} /></span>
        </div>
        <div className="app-content preview-content">
          {visual === "notes" && <WorkspacePreview preview={preview} compact={compact} />}
          {visual === "dashboard" && <TablePreview preview={preview} compact={compact} />}
          {visual === "calendar" && <WorkflowPreview preview={preview} compact={compact} />}
          {visual === "studio" && <FormPreview preview={preview} compact={compact} />}
          {visual === "library" && <QueuePreview preview={preview} compact={compact} />}
          {visual === "insights" && <ReportPreview preview={preview} compact={compact} />}
        </div>
      </div>}
      <div className="visual-orbit orbit-one" />
      <div className="visual-orbit orbit-two" />
    </div>
  );
}

function PreviewHeading({ preview, compact = false }: { preview: PreviewContent; compact?: boolean }) {
  return (
    <div className="preview-heading">
      <div className="preview-context"><Sparkles size={10} />{preview.context}</div>
      <div className="preview-title-row"><h2>{preview.title}</h2><span className="preview-status"><i />{preview.status}</span></div>
      {!compact && <p>{preview.description}</p>}
    </div>
  );
}

function PreviewMetrics({ preview, compact = false }: { preview: PreviewContent; compact?: boolean }) {
  return (
    <div className="preview-metrics">
      {preview.metrics.slice(0, compact ? 2 : 3).map((metric) => (
        <div className="preview-metric" key={metric.label}>
          <span>{metric.label}</span><b>{metric.value}</b><small>{metric.note}</small>
        </div>
      ))}
    </div>
  );
}

function PreviewRows({ preview, compact = false }: { preview: PreviewContent; compact?: boolean }) {
  return (
    <div className="preview-records">
      <div className="preview-record-head"><span>项目</span><span>处理详情</span><span>结果</span></div>
      {preview.rows.slice(0, compact ? 2 : 3).map((row) => (
        <div className="preview-record" key={row.name}>
          <b>{row.name}</b><span>{row.detail}</span><strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}

function WorkspacePreview({ preview, compact }: { preview: PreviewContent; compact: boolean }) {
  return (
    <div className="preview-screen preview-workspace">
      <aside className="preview-sidebar"><span className="preview-logo"><i /></span><i className="active" /><i /><i /><i /><span className="preview-sidebar-bottom" /></aside>
      <section className="preview-main">
        <div className="preview-toolbar"><span>工作台 <b>/</b> 当前模块</span><span>更新于刚刚</span></div>
        <PreviewHeading preview={preview} compact={compact} />
        <PreviewMetrics preview={preview} compact={compact} />
        <PreviewRows preview={preview} compact={compact} />
      </section>
    </div>
  );
}

function PreviewMetricStrip({ preview }: { preview: PreviewContent }) {
  return <div className="preview-metric-strip">{preview.metrics.map((metric) => <span key={metric.label}>{metric.label}<b>{metric.value}</b></span>)}</div>;
}
function TablePreview({ preview, compact }: { preview: PreviewContent; compact: boolean }) {
  return (
    <div className="preview-screen preview-table-screen">
      <div className="preview-toolbar"><span>数据中心 <b>/</b> 模块记录</span><button type="button"><Filter size={9} />筛选</button></div>
      <PreviewHeading preview={preview} compact={compact} />
      {compact ? <PreviewMetricStrip preview={preview} /> : <div className="preview-table-tools"><span><Search size={9} />搜索记录</span><button type="button"><Plus size={9} />新建记录</button></div>}
      <PreviewRows preview={preview} compact={compact} />
      {!compact && <div className="preview-pagination"><span>显示 1–3 项，共 128 项</span><span>‹　1　2　3　›</span></div>}
    </div>
  );
}

function WorkflowPreview({ preview, compact }: { preview: PreviewContent; compact: boolean }) {
  return (
    <div className="preview-screen preview-flow-screen">
      <div className="preview-toolbar"><span>任务流程 <b>/</b> 预览</span><span className="preview-step-count">01 — 03</span></div>
      <PreviewHeading preview={preview} compact={compact} />
      <div className="preview-process">
        {preview.process.map((step, index) => <div className={`preview-process-step ${index === 1 ? "current" : ""}`} key={step}><span>{index < 1 ? <Check size={10} /> : `0${index + 1}`}</span><b>{step}</b><i /></div>)}
      </div>
      <div className="preview-flow-result"><div><small>{preview.metrics[2].label}</small><b>{preview.metrics[2].value}</b><span>{preview.metrics[2].note}</span></div><div className="preview-flow-details">{preview.metrics.slice(0, 2).map((metric) => <p key={metric.label}><span>{metric.label}</span><b>{metric.value}</b></p>)}</div></div>
    </div>
  );
}

function FormPreview({ preview, compact }: { preview: PreviewContent; compact: boolean }) {
  return (
    <div className="preview-screen preview-form-screen">
      <div className="preview-toolbar"><span>模块配置 <b>/</b> 编辑参数</span><button type="button"><Check size={9} />已保存</button></div>
      <PreviewHeading preview={preview} compact={compact} />
      <div className="preview-form-layout"><div className="preview-fields">{preview.fields.map((field, index) => <label className="preview-field" key={field.label}><span>{field.label}</span><b>{field.value}</b>{index === 0 && <i>⌄</i>}</label>)}<button type="button" className="preview-submit">应用设置 <ArrowUpRight size={10} /></button></div><aside className="preview-result-card"><span><Circle size={7} />实时预览</span><small>{preview.metrics[2].label}</small><b>{preview.metrics[2].value}</b><em>{preview.metrics[2].note}</em></aside></div>
    </div>
  );
}

function QueuePreview({ preview, compact }: { preview: PreviewContent; compact: boolean }) {
  return (
    <div className="preview-screen preview-queue-screen">
      <div className="preview-toolbar"><span>任务中心 <b>/</b> 当前批次</span><button type="button"><Plus size={9} />添加</button></div>
      <PreviewHeading preview={preview} compact={compact} />
      <div className="preview-queue-summary"><span>{preview.metrics[0].label}<b>{preview.metrics[0].value}</b></span><span>{preview.metrics[1].label}<b>{preview.metrics[1].value}</b></span><span className="preview-queue-link">查看全部 <ArrowUpRight size={9} /></span></div>
      <div className="preview-queue-list">{preview.rows.slice(0, compact ? 2 : 3).map((row, index) => <div className="preview-queue-item" key={row.name}><span className={`preview-queue-icon queue-${index + 1}`}>{index === 0 ? <Check size={9} /> : <Circle size={8} />}</span><span className="preview-queue-copy"><b>{row.name}</b><small>{row.detail}</small></span><strong>{row.value}</strong><i>{row.status}</i></div>)}</div>
    </div>
  );
}

function ReportPreview({ preview, compact }: { preview: PreviewContent; compact: boolean }) {
  return (
    <div className="preview-screen preview-report-screen">
      <div className="preview-toolbar"><span>数据报告 <b>/</b> 近期表现</span><span className="preview-period">近 30 天　⌄</span></div>
      <PreviewHeading preview={preview} compact={compact} />
      <PreviewMetrics preview={preview} compact={compact} />
      <div className="preview-chart-area"><div className="preview-chart-labels"><i>100</i><i>50</i><i>0</i></div><div className="preview-chart-bars">{[32, 44, 38, 57, 49, 66, 58, 75, 62, 83, 71, 96].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="preview-chart-months"><span>第 1 周</span><span>第 2 周</span><span>第 3 周</span><span>第 4 周</span></div></div>
      {compact && <div className="preview-report-highlight"><span>{preview.metrics[2].label}</span><b>{preview.metrics[2].value}</b></div>}
      {!compact && <div className="preview-report-foot"><span><i />{preview.metrics[0].label}</span><b>{preview.metrics[0].value}</b><em>↗ {preview.metrics[1].value}</em></div>}
    </div>
  );
}

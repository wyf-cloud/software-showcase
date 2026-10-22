import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return <main className="not-found page-shell"><span className="not-found-mark"><Search size={24} /></span><span className="eyebrow">404 / NOT HERE</span><h1>这页暂时<br /><em>还没被做出来。</em></h1><p>也许它正在路上，也许我们可以从首页重新开始。</p><Link href="/" className="button button-dark"><ArrowLeft size={15} /> 回到首页</Link></main>;
}

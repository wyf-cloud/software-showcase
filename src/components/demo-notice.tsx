export function DemoNotice({ announcement }: { announcement: string }) {
  return (
    <div className="demo-notice" role="note">
      <span className="demo-notice-dot" />
      <span><strong>站点公告</strong> {announcement}</span>
    </div>
  );
}

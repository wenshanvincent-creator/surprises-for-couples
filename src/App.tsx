import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Project, ProjectBundle } from './domain/types';
import { createBlankProject, createDemoProject } from './domain/project';
import { loadProject, saveProject } from './storage';
import { exportBackup, exportMarkdown, exportMuseum, importBackup } from './export';
import Recipient from './recipient/Recipient';
import Editor, { chapters } from './editor/Editor';
import type { Chapter } from './editor/Editor';

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="app-dialog" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div className="dialog-heading"><h2>{title}</h2><button className="icon-button" aria-label="关闭弹窗" onClick={onClose}>×</button></div>{children}</dialog>;
}

const getError = (error: unknown) => error instanceof Error ? error.message : '操作未完成，请重试。';

export default function App() {
  const [bundle, setBundle] = useState<ProjectBundle | null>(null);
  const [chapter, setChapter] = useState<Chapter>('cover');
  const [revision, setRevision] = useState(0);
  const latestRevision = useRef(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const [saveStatus, setSaveStatus] = useState('正在打开…');
  const [saveError, setSaveError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState(false);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'mobile'>('desktop');
  const [exportOpen, setExportOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const [confirmation, setConfirmation] = useState<{ title: string; description: string; action: () => void } | null>(null);
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => { let active = true; loadProject().then(saved => { if (active) { setBundle(saved || createDemoProject()); setSaveStatus(saved ? '已保存在此浏览器' : '示例已就绪'); } }).catch(cause => { if (active) { setBundle(createDemoProject()); setSaveStatus('尚未保存'); setSaveError(`无法读取本地项目：${getError(cause)}`); } }); return () => { active = false; }; }, []);
  useEffect(() => {
    if (!bundle || revision === 0) return;
    const timer = window.setTimeout(() => {
      setSaveStatus('正在保存…');
      const snapshot = bundle;
      saveQueue.current = saveQueue.current.catch(() => undefined).then(() => saveProject(snapshot)).then(() => { if (latestRevision.current === revision) { setSaveStatus('已保存在此浏览器'); setSaveError(''); } }).catch(cause => { if (latestRevision.current === revision) { setSaveStatus('保存失败'); setSaveError(`未能保存：${getError(cause)} 你可以先导出可编辑备份。`); } });
    }, 550);
    return () => clearTimeout(timer);
  }, [bundle, revision]);
  useEffect(() => { if (revision === 0) return; const warn = (event: BeforeUnloadEvent) => { if (saveStatus !== '已保存在此浏览器') event.preventDefault(); }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [revision, saveStatus]);

  const assetUrls = useMemo(() => Object.fromEntries(Object.entries(bundle?.blobs || {}).map(([id, blob]) => [id, URL.createObjectURL(blob)])), [bundle?.blobs]);
  useEffect(() => () => Object.values(assetUrls).forEach(url => URL.revokeObjectURL(url)), [assetUrls]);
  const change = (next: ProjectBundle) => { latestRevision.current += 1; setRevision(latestRevision.current); setBundle(next); setSaveStatus('有更改，等待保存'); setNotice(''); };
  const updateProject = (partial: Partial<Project>) => { if (bundle) change({ ...bundle, project: { ...bundle.project, ...partial } }); };
  const replace = (next: ProjectBundle, label: string) => { setConfirmation({ title: label, description: '这会替换当前浏览器中的整份项目。建议先导出可编辑备份，保留现在的内容。', action: () => { change(next); setChapter('cover'); setConfirmation(null); setNotice('项目已打开，接下来可以慢慢写。'); } }); };
  const importFile = async (file?: File) => { if (!file) return; setBusy('正在检查备份…'); setError(''); try { const imported = await importBackup(file); setConfirmation({ title: '用备份替换当前项目？', description: `已检查「${imported.project.title}」，包含 ${imported.project.memories.length} 段回忆和 ${imported.project.assets.length} 个附件。替换前可先取消并导出当前备份。`, action: () => { change(imported); setChapter('cover'); setConfirmation(null); setNotice('备份已导入。'); } }); } catch (cause) { setError(`导入失败：${getError(cause)}`); } finally { setBusy(''); if (importInput.current) importInput.current.value = ''; } };
  const download = async (kind: 'museum' | 'backup' | 'markdown') => {
    if (!bundle) return;
    setError(''); setBusy('正在打包，请稍等…');
    try { const blob = await ({ museum: exportMuseum, backup: exportBackup, markdown: exportMarkdown })[kind](bundle); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${bundle.project.title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').slice(0, 60) || '我们的故事'}-${kind}.zip`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 60_000); setNotice('下载已交给浏览器。请在下载目录检查压缩包。'); setExportOpen(false); } catch (cause) { setError(`导出失败：${getError(cause)}`); } finally { setBusy(''); }
  };

  if (!bundle) return <main className="loading-screen"><span className="brand-mark" aria-hidden="true">两</span><p>正在打开回忆工坊…</p></main>;
  const project = bundle.project;
  return <div className={`app ${preview ? 'is-preview' : ''}`} style={{ '--accent': project.accent } as CSSProperties} data-ui>
    <header className="app-header"><a className="app-brand" href="#" onClick={event => { event.preventDefault(); setPreview(false); }}><span className="brand-mark" aria-hidden="true">两</span><span>两人之间<small>回忆礼物工坊</small></span></a><div className="save-indicator" role="status"><span className={saveError ? 'save-dot error-dot' : 'save-dot'} />{saveStatus}</div><div className="header-actions">{preview ? <button className="button secondary" onClick={() => setPreview(false)}>返回编辑</button> : <button className="button secondary" onClick={() => setPreview(true)}>预览礼物</button>}<button className="button primary" onClick={() => setExportOpen(true)} disabled={!!busy}>导出礼物 <span aria-hidden="true">↗</span></button></div></header>
    <input ref={importInput} className="visually-hidden" type="file" accept=".zip,application/zip" aria-label="选择可编辑备份" onChange={event => void importFile(event.target.files?.[0])} />
    {(error || saveError || notice || busy) && <div className={`app-message ${error || saveError ? 'message-error' : ''}`} role={error || saveError ? 'alert' : 'status'}>{error || saveError || busy || notice}{error && <button aria-label="关闭错误提示" onClick={() => setError('')}>×</button>}</div>}
    {preview ? <main className="full-preview"><div className="preview-toolbar"><p>这是对方打开礼物时看到的样子</p><div className="segmented" aria-label="预览尺寸"><button aria-pressed={previewSize === 'desktop'} onClick={() => setPreviewSize('desktop')}>桌面</button><button aria-pressed={previewSize === 'mobile'} onClick={() => setPreviewSize('mobile')}>手机</button></div></div><div className={`full-preview-page ${previewSize === 'mobile' ? 'phone-preview' : ''}`}><Recipient project={project} assetUrls={assetUrls} /></div></main> : <>
      <aside className="editor-sidebar"><div className="sidebar-intro"><h1>把日子，<br />写成礼物。</h1><p>为一个特别的人，<br />收藏你们的普通日常。</p></div><nav aria-label="编辑章节">{chapters.map(item => <button key={item.id} className={chapter === item.id ? 'chapter-button active' : 'chapter-button'} aria-current={chapter === item.id ? 'page' : undefined} onClick={() => setChapter(item.id)}><span aria-hidden="true">{item.symbol}</span>{item.label}{item.id === 'memories' && <small>{project.memories.length}</small>}</button>)}</nav><div className="sidebar-bottom"><button onClick={() => replace(createBlankProject(), '从空白开始？')}>从空白开始</button><button onClick={() => replace(createDemoProject(), '打开虚构示例？')}>打开示例</button><button disabled={!!busy} onClick={() => importInput.current?.click()}>导入备份</button><p>无需账号 · 内容保存在此浏览器<br />记得定期导出可编辑备份。</p></div></aside>
      <main className="editor-main"><Editor bundle={bundle} chapter={chapter} updateProject={updateProject} change={change} assetUrls={assetUrls} onError={setError} confirm={(title, description, action) => setConfirmation({ title, description, action: () => { action(); setConfirmation(null); } })} /></main>
      <aside className="live-preview" aria-label="实时礼物预览"><div className="live-preview-heading"><span><span className="preview-dot" /> 实时预览</span><button onClick={() => setPreview(true)}>展开预览 <span aria-hidden="true">↗</span></button></div><div className="preview-scroll"><Recipient project={project} assetUrls={assetUrls} /></div><p className="preview-caption">每一次修改，都在慢慢成为礼物。</p></aside>
    </>}
    {confirmation && <Modal title={confirmation.title} onClose={() => setConfirmation(null)}><p className="dialog-description">{confirmation.description}</p><div className="dialog-actions"><button className="button secondary" onClick={() => setConfirmation(null)}>取消</button><button className="button primary" onClick={confirmation.action}>{confirmation.title.startsWith('删除') ? '确认删除' : '确认替换'}</button></div></Modal>}
    {exportOpen && <Modal title="把这份心意带走" onClose={() => { if (!busy) setExportOpen(false); }}><p className="dialog-description">三个压缩包，对应三种保存方式。</p><div className="export-options"><button onClick={() => void download('museum')} disabled={!!busy}><span className="export-symbol" aria-hidden="true">↗</span><span><strong>离线回忆馆</strong><small>解压后打开 index.html，可离线观看与分享。</small></span><span aria-hidden="true">↓</span></button><button onClick={() => void download('backup')} disabled={!!busy}><span className="export-symbol" aria-hidden="true">□</span><span><strong>可编辑备份</strong><small>保留内容与原始附件，以后可导入继续编辑。</small></span><span aria-hidden="true">↓</span></button><button onClick={() => void download('markdown')} disabled={!!busy}><span className="export-symbol" aria-hidden="true">≡</span><span><strong>Markdown 记忆库</strong><small>以文本和独立媒体文件保存，方便阅读整理。</small></span><span aria-hidden="true">↓</span></button></div><p className="export-footnote">只发送给你想分享的人。上传到公开网站后，任何有链接的人都可能看到内容。</p>{busy && <p role="status">{busy}</p>}</Modal>}
  </div>;
}

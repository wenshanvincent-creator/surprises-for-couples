import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Asset, RecipientProps } from '../domain/types';
import { daysTogether, daysUntil } from '../domain/project';
import '../styles/recipient.css';

export function Media({ asset, url }: { asset: Asset; url?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (!url) return <p className="media-unavailable">附件暂时无法显示：{asset.name}</p>;
  if (failed) return <p className="media-unavailable" role="status">无法预览「{asset.name}」。文件可能损坏，或当前浏览器不支持此编码。原始附件仍会保留在备份中。</p>;
  if (asset.mimeType.startsWith('image/')) return <img src={url} alt={asset.name} loading="lazy" onError={() => setFailed(true)} />;
  if (asset.mimeType.startsWith('audio/')) return <div className="audio-keepsake"><span>{asset.name}</span><audio controls preload="metadata" src={url} onError={() => setFailed(true)} /></div>;
  return <video controls preload="metadata" src={url} aria-label={asset.name} onError={() => setFailed(true)} />;
}

export default function Recipient({ project, assetUrls }: RecipientProps) {
  const [surprise, setSurprise] = useState<number | null>(null);
  const [openedImage, setOpenedImage] = useState<Asset | null>(null);
  const imageDialog = useRef<HTMLDialogElement>(null);
  const surpriseNotes = project.surprises.filter(note => note.trim());
  const images = project.memories.flatMap(memory => memory.assetIds.map(id => project.assets.find(asset => asset.id === id)).filter((asset): asset is Asset => !!asset && asset.mimeType.startsWith('image/')));
  const uniqueImages = images.filter((asset, index) => images.findIndex(other => other.id === asset.id) === index);
  const cover = uniqueImages[0];
  const names = project.names.filter(Boolean).join(' & ') || '你和我';
  const style = { '--gift-accent': project.accent } as CSSProperties;
  const drawSurprise = () => setSurprise(previous => surpriseNotes.length < 2 ? 0 : previous === null ? Math.floor(Math.random() * surpriseNotes.length) : (previous + 1 + Math.floor(Math.random() * (surpriseNotes.length - 1))) % surpriseNotes.length);

  return <article className="recipient" style={style}>
    <header className="gift-nav"><a className="gift-wordmark" href="#gift-cover">{names}</a><nav aria-label="礼物导航"><a href="#our-story">故事</a><a href="#our-album">相册</a><a href="#our-letter">信件</a></nav></header>
    <section className="gift-cover" id="gift-cover">
      <div className="cover-art">{cover ? <Media asset={cover} url={assetUrls[cover.id]} /> : <div className="cover-empty"><span>{project.names[0] || '你'}</span><span>&</span><span>{project.names[1] || '我'}</span><p>属于我们的日子</p></div>}</div>
      <div className="cover-copy"><p className="cover-date">{project.startDate.replaceAll('-', '.')} — 一直</p><h1>{project.title || '把日子，写成礼物'}</h1><p className="gift-dedication">{project.dedication || '那些普通的日子，因为身边是你，变得值得记住。'}</p><a className="gift-button" href="#our-story">翻开我们的故事 <span aria-hidden="true">↗</span></a><div className="cover-counter"><strong>{daysTogether(project.startDate).toLocaleString('zh-CN')}</strong><span>天，和你在一起</span></div></div>
    </section>
    {project.occasion && <aside className="gift-occasion"><span>{project.occasion.title}</span><p>{daysUntil(project.occasion.date) < 0 ? '又多了一段值得珍藏的时光' : daysUntil(project.occasion.date) === 0 ? '就是今天，想和你一起过' : <>还有 <strong>{daysUntil(project.occasion.date)}</strong> 天</>}</p><time dateTime={project.occasion.date}>{project.occasion.date.replaceAll('-', '.')}</time></aside>}
    <section className="gift-story" id="our-story"><div className="gift-section-intro"><h2>一起走过</h2><p>有些瞬间很小，<br />我们却记了很久。</p><span>{project.memories.length} 段回忆</span></div><div className="story-entries">{project.memories.length ? project.memories.map(memory => <section className="story-entry" key={memory.id}><time dateTime={memory.date}>{memory.date.replaceAll('-', '.')}</time><h3>{memory.title || '未命名的回忆'}</h3><p className="preserve-lines">{memory.body}</p><div className="story-media">{memory.assetIds.map(id => { const asset = project.assets.find(item => item.id === id); return asset ? <Media key={id} asset={asset} url={assetUrls[id]} /> : null; })}</div></section>) : <p className="gift-empty">故事从这里开始。留下一张照片，或写下第一次见面的那天。</p>}</div></section>
    <section className="gift-album" id="our-album"><div className="album-heading"><h2>留住这一刻</h2><p>把目光停一停，再看一遍。</p></div>{uniqueImages.length ? <div className="album-grid">{uniqueImages.map((asset, index) => <button key={asset.id} className="album-print" onClick={() => { setOpenedImage(asset); imageDialog.current?.showModal(); }} aria-label={`查看照片：${asset.name}`}><Media asset={asset} url={assetUrls[asset.id]} /><span>{project.memories.find(memory => memory.assetIds.includes(asset.id))?.title || `我们的照片 ${index + 1}`}</span></button>)}</div> : <p className="gift-empty">照片会在这里慢慢多起来。</p>}</section>
    <section className="gift-letter" id="our-letter"><div><h2>写给你</h2><p className="letter-body preserve-lines">{project.letter || '有些话，想慢慢写给你。'}</p></div></section>
    {!!surpriseNotes.length && <section className="gift-surprise"><div><h2>下一次，和你</h2><p>留一点期待，给下一个普通的周末。</p></div><div className="surprise-action"><p aria-live="polite" className="surprise-note">{surprise === null ? '这里藏着一个小小的约定。' : surpriseNotes[surprise % surpriseNotes.length]}</p><button className="gift-button" onClick={drawSurprise}>{surprise === null ? '打开一个小惊喜' : '再抽一个约定'}</button></div></section>}
    <footer className="gift-footer"><span>{names}</span><p>从 {project.startDate.replaceAll('-', '.')} 开始，未完待续。</p>{project.id === 'demo-project' ? <small>示例插画由本项目原创；示例人物与故事均为虚构。</small> : null}</footer>
    <dialog ref={imageDialog} className="image-dialog" onClick={event => { if (event.target === event.currentTarget) imageDialog.current?.close(); }}><button className="image-close" aria-label="关闭照片" onClick={() => imageDialog.current?.close()}>×</button>{openedImage && <><Media asset={openedImage} url={assetUrls[openedImage.id]} /><p>{openedImage.name}</p></>}</dialog>
  </article>;
}

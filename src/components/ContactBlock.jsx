import { LuPhone, LuMapPin, LuMail } from 'react-icons/lu';
import { useStore } from '../store.jsx';
import { socialLinks, tel } from './Layout.jsx';

export default function ContactBlock() {
  const { settings: s } = useStore();
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="panel space-y-3">
        <p className="flex gap-3"><LuMapPin aria-hidden className="mt-1 shrink-0 text-bronze" /><span>{s.company.address}</span></p>
        {s.contact.phones.map((p) => <p key={p}><a className="flex items-center gap-3 font-semibold" href={tel(p)}><LuPhone aria-hidden className="text-bronze" />{p}</a></p>)}
        {s.contact.email && <p><a className="flex items-center gap-3 font-semibold" href={`mailto:${s.contact.email}`}><LuMail aria-hidden className="text-bronze" />{s.contact.email}</a></p>}
      </div>
      <ul className="panel grid content-start gap-2 sm:grid-cols-2">
        {socialLinks(s).map(([name, Icon, url]) => (
          <li key={name}><a className={`btn w-full ${name === 'WhatsApp' ? 'btn-wa' : 'btn-secondary'}`} href={url} target="_blank" rel="noopener noreferrer"><Icon aria-hidden />{name}</a></li>
        ))}
      </ul>
    </div>
  );
}

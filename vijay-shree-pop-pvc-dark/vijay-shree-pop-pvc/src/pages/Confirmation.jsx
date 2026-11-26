import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Empty } from '../components/ui.jsx';
import { tel } from '../components/Layout.jsx';

export default function Confirmation() {
  const { lastOrder, setCart, cart, settings } = useStore();
  const [cleared, setCleared] = useState(false);
  const [copied, setCopied] = useState('');
  if (!lastOrder)
    return <div className="wrap py-10"><Empty title="No order is waiting"><p>Your cart is kept on this device until you clear it.</p><a className="btn btn-primary mt-4" href="#/cart">Go to cart</a></Empty></div>;
  const copy = async () => {
    try { await navigator.clipboard.writeText(lastOrder.message); setCopied('Message copied.'); }
    catch { setCopied('Copying is blocked in this browser. Open "See the message" and select the text.'); }
  };
  return (
    <div className="wrap max-w-2xl py-10">
      <div className="panel space-y-5 border-t-4 border-t-gold">
        <h1 className="text-3xl">One step left: press SEND in WhatsApp</h1>
        <p className="text-lg">Your order details are ready in WhatsApp. Please press SEND in WhatsApp to submit your order to {settings.company.name}. Our team will contact you to confirm pricing, availability, payment and delivery.</p>
        {!lastOrder.opened && <p role="alert" className="border-l-4 border-amber-500 bg-surface p-3">Your browser did not open WhatsApp. Use the button below.</p>}
        <div className="flex flex-wrap gap-3">
          <a className="btn btn-wa" href={lastOrder.url} target="_blank" rel="noopener noreferrer">{lastOrder.opened ? 'Open WhatsApp again' : 'Open WhatsApp'}</a>
          <button className="btn btn-secondary" onClick={copy}>Copy message</button>
        </div>
        <p role="status" className="text-sm">{copied}</p>
        <p className="text-sm">If the message appears empty or cut off, copy it and paste it into a chat with +{settings.contact.whatsappNumber}. You can also call <a className="link" href={tel(settings.contact.phones[0] || '')}>{settings.contact.phones[0]}</a>.</p>
        <details><summary className="font-semibold">See the message</summary><pre className="mt-2 overflow-x-auto bg-surface-2 p-3 font-sans text-sm whitespace-pre-wrap">{lastOrder.message}</pre></details>
        {lastOrder.fromCart && (
          <div className="border-t border-line pt-4">
            {cleared || !cart.length ? <p role="status">Your cart is empty. <a className="link" href="#/products">Continue shopping</a></p> : (
              <>
                <p>Your cart is still saved. Clear it only after you have pressed SEND.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button className="btn btn-primary btn-sm" onClick={() => { setCart([]); setCleared(true); }}>I have sent it, clear my cart</button>
                  <a className="btn btn-secondary btn-sm" href="#/cart">Keep cart and go back</a>
                </div>
              </>
            )}
          </div>
        )}
        {!lastOrder.fromCart && <a className="link" href="#/products">Continue shopping</a>}
      </div>
    </div>
  );
}

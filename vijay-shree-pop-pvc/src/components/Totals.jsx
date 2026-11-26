import { money } from '../lib/pricing.js';

export default function Totals({ order, totalLabel = 'Estimated total' }) {
  const row = (k, v) => <div className="flex justify-between gap-3"><dt>{k}</dt><dd>{v}</dd></div>;
  return (
    <>
      <dl className="space-y-1">
        {row('Total items', order.count)}
        {row('Subtotal', money(order.subtotal))}
        {row('Discount', order.discount > 0 ? `− ${money(order.discount)}` : money(0))}
        <div className="flex justify-between gap-3 border-t border-silver pt-2 text-xl font-semibold"><dt>{totalLabel}</dt><dd>{money(order.total)}</dd></div>
      </dl>
      <p className="text-sm text-gray-600">Taxes and delivery charges are not included. We confirm the final amount with you.</p>
    </>
  );
}

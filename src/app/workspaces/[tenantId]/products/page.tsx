import Link from 'next/link';
import { canManageCustomers } from '@/lib/contracts';
import { getWorkspace } from '@/lib/server/queries';
import {
  availabilityLabel,
  cevantaProducts,
  readinessLabel,
  type ProductReadiness,
} from '@/lib/product-catalog';

const productGroups: Array<{
  readiness: ProductReadiness;
  heading: string;
  description: string;
}> = [
  {
    readiness: 'available_now',
    heading: 'Available now',
    description: 'These workflows can be delivered today using Cevanta records and office review. They do not require automatic messages, booking, payments, or dispatch.',
  },
  {
    readiness: 'setup_required',
    heading: 'Available with setup and approval',
    description: 'The guarded Cevanta workflow exists. Any external message or calendar step stays off until the client approves it, a fictional test passes, and a rollback plan is recorded.',
  },
  {
    readiness: 'planned',
    heading: 'Planned products',
    description: 'These offers are product designs, not working automation. They can be scoped with a client, but should not be sold as live until their data source and provider workflow are built and tested.',
  },
];

export default async function ProductsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant, role } = await getWorkspace(tenantId);
  const officeUser = canManageCustomers(role);

  return <>
    <div className="page-heading products-heading">
      <span className="eyebrow">CEVANTA PRODUCTS</span>
      <h1>Choose what the business is ready to use.</h1>
      <p>Start with a small office-review workflow, then add more only when the client data, provider connection, approval, test, and rollback plan are ready.</p>
    </div>

    <section className="front-office-alert products-safe-banner" role="status">
      <div><span className="eyebrow">SAFE BY DEFAULT</span><h2>Every product starts with review.</h2><p>Messages, calendar writes, file processing, booking, payments, and dispatch remain off until a client has approved the scope, completed a test, and recorded a rollback plan.</p></div>
      <strong aria-hidden="true">OFF</strong>
    </section>

    {productGroups.map(group => {
      const products = cevantaProducts.filter(product => product.readiness === group.readiness);
      const headingId = `products-${group.readiness}`;

      return <section className="panel product-packaging-panel" aria-labelledby={headingId} key={group.readiness}>
        <div className="section-heading">
          <div><span className="eyebrow">{readinessLabel(group.readiness)}</span><h2 id={headingId}>{group.heading}</h2><p>{group.description}</p></div>
          <span className="pill">{products.length} {products.length === 1 ? 'offer' : 'offers'}</span>
        </div>
        <div className="product-catalog-grid">
          {products.map(product => <article className="product-catalog-card" aria-labelledby={`${product.slug}-title`} key={product.slug}>
            <div className="product-catalog-card-top"><span className="eyebrow">{product.eyebrow}</span><span className="pill">{availabilityLabel(product.availability)}</span></div>
            <h2 id={`${product.slug}-title`}>{product.name}</h2>
            <p className="product-one-line">{product.oneLine}</p>
            <p className="product-pricing"><strong>{product.pricing}</strong><span>Use as a starting point; confirm scope and usage before quoting.</span></p>
            <p>{product.outcome}</p>
            <div className="product-catalog-section"><strong>How it works</strong><ol>{product.workflow.map(step => <li key={step}>{step}</li>)}</ol></div>
            <div className="product-catalog-section"><strong>What the client provides</strong><ul>{product.needs.map(item => <li key={item}>{item}</li>)}</ul></div>
            <p className="product-ready-state"><strong>{readinessLabel(product.readiness)}:</strong> {product.readyState}</p>
            <p className="product-ready-state"><strong>Next step:</strong> {product.nextStep}</p>
            <Link className="button" href={product.href(tenantId)}>{product.cta} ↗</Link>
          </article>)}
        </div>
      </section>;
    })}

    <section className="panel product-packaging-panel" aria-labelledby="packaging-title">
      <div className="section-heading"><div><span className="eyebrow">PACKAGING</span><h2 id="packaging-title">Keep the offer simple to sell.</h2></div><span className="pill">{tenant.trade}</span></div>
      <div className="product-packaging-grid">
        <div><strong>Start small</strong><p>Use Lead Rescue Starter to prove the office-review process with a limited list and no automatic outreach.</p></div>
        <div><strong>Add one working system</strong><p>Move to the managed receptionist or guarded Reactivator only after the client data and office owner are ready.</p></div>
        <div><strong>Expand after proof</strong><p>Add messaging, calendar, or another product one at a time after approval, a fictional test, and a rollback plan.</p></div>
      </div>
      {officeUser ? <div className="button-row"><Link className="button secondary" href={`/workspaces/${tenantId}/integrations`}>Review client integrations ↗</Link><Link className="button secondary" href={`/workspaces/${tenantId}/go-live`}>Open release gates ↗</Link></div> : <p className="notice">Your {role} role can review the catalog. An office owner, admin, or dispatcher manages product readiness.</p>}
    </section>
  </>;
}

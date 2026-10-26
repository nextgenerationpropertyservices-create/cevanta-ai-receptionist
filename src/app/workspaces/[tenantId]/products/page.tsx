import Link from 'next/link';
import { canManageCustomers } from '@/lib/contracts';
import { getWorkspace } from '@/lib/server/queries';
import { availabilityLabel, cevantaProducts } from '@/lib/product-catalog';

export default async function ProductsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { tenant, role } = await getWorkspace(tenantId);
  const officeUser = canManageCustomers(role);

  return <>
    <div className="page-heading products-heading">
      <span className="eyebrow">CEVANTA PRODUCTS</span>
      <h1>Choose the growth system that fits the business.</h1>
      <p>Package these products on their own or add them to the receptionist service. Each one is designed to create a clear office workflow before any customer-facing automation is switched on.</p>
    </div>

    <section className="front-office-alert products-safe-banner" role="status">
      <div><span className="eyebrow">SAFE BY DEFAULT</span><h2>Every product starts with review.</h2><p>Messages, calendar writes, file processing, booking, payments, and dispatch remain off until a client has approved the scope, completed a test, and recorded a rollback plan.</p></div>
      <strong aria-hidden="true">OFF</strong>
    </section>

    <section className="product-catalog-grid" aria-label="Cevanta product catalog">
      {cevantaProducts.map(product => <article className="product-catalog-card" key={product.slug}>
        <div className="product-catalog-card-top"><span className="eyebrow">{product.eyebrow}</span><span className="pill">{availabilityLabel(product.availability)}</span></div>
        <h2>{product.name}</h2>
        <p className="product-one-line">{product.oneLine}</p>
        <p className="product-pricing"><strong>{product.pricing}</strong><span>Use as a starting point; confirm scope and usage before quoting.</span></p>
        <p>{product.outcome}</p>
        <div className="product-catalog-section"><strong>How it works</strong><ol>{product.workflow.map(step => <li key={step}>{step}</li>)}</ol></div>
        <div className="product-catalog-section"><strong>What the client provides</strong><ul>{product.needs.map(item => <li key={item}>{item}</li>)}</ul></div>
        <p className="product-ready-state"><strong>Readiness:</strong> {product.readyState}</p>
        <Link className="button" href={product.href(tenantId)}>{product.cta} ↗</Link>
      </article>)}
    </section>

    <section className="panel product-packaging-panel" aria-labelledby="packaging-title">
      <div className="section-heading"><div><span className="eyebrow">PACKAGING</span><h2 id="packaging-title">Keep the offer simple to sell.</h2></div><span className="pill">{tenant.trade}</span></div>
      <div className="product-packaging-grid">
        <div><strong>Stand-alone</strong><p>Sell one focused outcome, such as quote recovery or commercial maintenance reactivation, with its own setup and monthly scope.</p></div>
        <div><strong>Receptionist add-on</strong><p>Start with missed-call capture, then add one growth product after the office workflow and data source are ready.</p></div>
        <div><strong>Managed bundle</strong><p>Combine receptionist coverage with a growth product, while keeping each provider connection and approval gate visible.</p></div>
      </div>
      {officeUser ? <div className="button-row"><Link className="button secondary" href={`/workspaces/${tenantId}/integrations`}>Review client integrations ↗</Link><Link className="button secondary" href={`/workspaces/${tenantId}/go-live`}>Open release gates ↗</Link></div> : <p className="notice">Your {role} role can review the catalog. An office owner, admin, or dispatcher manages product readiness.</p>}
    </section>
  </>;
}

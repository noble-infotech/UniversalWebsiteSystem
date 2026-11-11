import { getSite } from "@/core/config/loader";
import { getStore } from "@/server/store";
import { EnquiryList } from "@/components/admin/EnquiryList";

export default async function EnquiriesPage() {
  const site = await getSite();
  const store = getStore(site.id);
  const enquiries = await store.listEnquiries(site.id, 500);
  return (
    <div>
      <h1 className="text-2xl font-bold">Enquiries</h1>
      <p className="mb-6 text-sm text-neutral-600">Contact, quote, careers, newsletter and callback submissions from the website.</p>
      {!store.writable && <p className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">No storage connected – submissions are not being saved. Connect Firebase (see docs/ADMIN.md) to collect them here.</p>}
      <EnquiryList initial={enquiries} />
    </div>
  );
}

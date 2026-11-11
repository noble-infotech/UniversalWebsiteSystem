import { getSite } from "@/core/config/loader";
import { getMediaStore } from "@/server/media";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

const WHERE: Record<string, string> = {
  firestore: "Firebase Firestore (served through Vercel’s CDN)",
  file: "local files (development)",
  none: "not set up",
};

export default async function MediaPage() {
  const site = await getSite();
  const kind = getMediaStore(site.id).kind;
  return (
    <div>
      <h1 className="text-2xl font-bold">Media library</h1>
      <p className="mb-2 text-sm text-neutral-600">Upload logos, banners, product photos and gallery images. Every image field in the editor also has <strong>Upload</strong> and <strong>Library</strong> buttons.</p>
      <p className="mb-6 text-xs text-neutral-500">Stored in: {WHERE[kind]}</p>
      {kind === "none" && (
        <p className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          Uploads are not set up for this website. Connect Firebase: add the <code>FIREBASE_SERVICE_ACCOUNT</code> environment variable in Vercel (see docs/ADMIN.md), then redeploy.
        </p>
      )}
      <MediaLibrary kind={kind} />
    </div>
  );
}

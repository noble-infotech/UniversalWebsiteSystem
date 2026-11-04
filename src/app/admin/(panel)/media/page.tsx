import { getSite } from "@/core/config/loader";
import { getMediaStore } from "@/server/media";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

const WHERE: Record<string, string> = {
  blob: "Vercel Blob (fast global CDN)",
  postgres: "this website’s database",
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
          Uploads are not set up for this website. In Vercel open <strong>Storage → Create → Blob</strong> and connect it to this project (recommended), or connect a database – then redeploy.
        </p>
      )}
      {kind === "postgres" && (
        <p className="mb-6 rounded-lg bg-indigo-50 p-4 text-sm text-indigo-900">
          Images are stored in this website’s database. For faster loading and more space, connect <strong>Vercel Blob</strong> (Storage → Create → Blob) – new uploads will go there automatically.
        </p>
      )}
      <MediaLibrary kind={kind} />
    </div>
  );
}

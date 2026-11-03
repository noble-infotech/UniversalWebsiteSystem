import Script from "next/script";
import type { IntegrationsConfig } from "@/core/config/schema";

/** Analytics + live chat loaders. Each renders nothing unless configured. */
export function AnalyticsScripts({ analytics }: { analytics: IntegrationsConfig["analytics"] }) {
  const { googleAnalyticsId: ga, googleTagManagerId: gtm, metaPixelId: px } = analytics;
  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}');`}</Script>
        </>
      )}
      {gtm && <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>}
      {px && <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${px}');fbq('track','PageView');`}</Script>}
    </>
  );
}

export function LiveChat({ chat }: { chat?: IntegrationsConfig["liveChat"] }) {
  if (!chat || chat.provider === "none") return null;
  if (chat.provider === "tawk" && chat.id) return <Script id="tawk" strategy="lazyOnload" src={`https://embed.tawk.to/${chat.id}`} />;
  if (chat.provider === "crisp" && chat.id) return <Script id="crisp" strategy="lazyOnload">{`window.$crisp=[];window.CRISP_WEBSITE_ID="${chat.id}";(function(){var d=document,s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.head.appendChild(s);})();`}</Script>;
  if (chat.provider === "intercom" && chat.id) return <Script id="intercom" strategy="lazyOnload">{`window.intercomSettings={app_id:"${chat.id}"};(function(){var w=window,d=document,s=d.createElement('script');s.async=true;s.src='https://widget.intercom.io/widget/${chat.id}';d.head.appendChild(s);})();`}</Script>;
  if (chat.provider === "custom" && chat.scriptUrl) return <Script id="chat" strategy="lazyOnload" src={chat.scriptUrl} />;
  return null;
}

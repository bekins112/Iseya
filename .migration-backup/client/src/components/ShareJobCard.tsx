import { forwardRef } from "react";
import { toPng } from "html-to-image";

const TEMPLATE_SRC = "/share-card-template.png";

function getDynamicFontSize(title: string): number {
  const len = title.length;
  if (len <= 14) return 56;
  if (len <= 20) return 46;
  if (len <= 28) return 38;
  if (len <= 38) return 30;
  if (len <= 50) return 24;
  return 20;
}

interface HiddenShareCardProps {
  jobTitle: string;
}

export const HiddenShareCard = forwardRef<HTMLDivElement, HiddenShareCardProps>(
  ({ jobTitle }, ref) => {
    const upperTitle = (jobTitle || "JOB OPPORTUNITY").toUpperCase();
    const fontSize = getDynamicFontSize(upperTitle);

    return (
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: "-99999px",
          width: "1080px",
          height: "1080px",
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <div
          ref={ref}
          className="relative"
          style={{ width: "1080px", height: "1080px", backgroundColor: "#FFC72C" }}
          data-testid="share-card-export"
        >
          <img
            src={TEMPLATE_SRC}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1080px",
              height: "1080px",
              objectFit: "cover",
            }}
            crossOrigin="anonymous"
          />
          <div
            style={{
              position: "absolute",
              top: "39%",
              left: "26%",
              width: "50%",
              minHeight: "12%",
              backgroundColor: "#1a1a1a",
              borderRadius: "20px",
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                fontWeight: 800,
                color: "#ffffff",
                textAlign: "center",
                fontSize: `${fontSize}px`,
                lineHeight: 1.1,
                letterSpacing: "0.02em",
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              data-testid="text-card-job-title"
            >
              {upperTitle}
            </span>
          </div>
        </div>
      </div>
    );
  }
);
HiddenShareCard.displayName = "HiddenShareCard";

export async function generateShareCardBlob(
  el: HTMLElement | null
): Promise<Blob | null> {
  if (!el) return null;
  try {
    const dataUrl = await toPng(el, {
      cacheBust: false,
      pixelRatio: 1,
      width: 1080,
      height: 1080,
      skipFonts: true,
      style: {
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      },
      filter: (node: HTMLElement) => {
        if (node.tagName === "LINK") {
          const rel = node.getAttribute("rel");
          if (rel === "stylesheet") return false;
        }
        return true;
      },
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  } catch (err) {
    console.error("Share card generation failed:", err);
    return null;
  }
}

export function downloadCardBlob(blob: Blob, jobTitle: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeName = jobTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 50);
  link.download = `iseya-job-${safeName || "card"}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

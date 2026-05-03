import { useEffect } from "react";

const BASE_TITLE = "Iṣéyá";

export function usePageTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : `${BASE_TITLE} | Hire Talent, Get Hired`;
    return () => {
      document.title = `${BASE_TITLE} | Hire Talent, Get Hired`;
    };
  }, [pageTitle]);
}

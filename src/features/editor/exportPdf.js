const SERVER_URL = import.meta.env.VITE_PDF_SERVER_URL;

export async function exportCVToPDF(_unused, fileName, html) {
    try {
        const titledHtml = html.replace(
            '<head>',
            `<head><title>${fileName || "CV"}</title>`
        );

        const response = await fetch(`${SERVER_URL}/generate-pdf`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ html: titledHtml, fileName }),
        });

        if (!response.ok) {
            console.error("[exportCVToPDF] Server error:", response.status);
            return false;
        }

        const blob = await response.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `${fileName || "CV"}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;

    } catch (err) {
        console.error("[exportCVToPDF]", err);
        return false;
    }
}
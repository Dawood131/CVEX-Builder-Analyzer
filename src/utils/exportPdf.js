// /* ================================================
//    PDF & PNG Export Utilities
//    Uses html2canvas + jsPDF for high-quality exports.
//    ================================================ */

// /**
//  * Export CV HTML content to a PDF file.
//  * Creates a temporary off-screen container, renders via html2canvas,
//  * then converts to PDF with multi-page support.
//  */
// async function exportCVToPDF(cvHtml, fileName) {
//   const container = document.createElement('div');
//   container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;z-index:-1;';
//   container.innerHTML = '<div id="__exportCV" style="width:210mm;min-height:297mm;background:white;" class="cv-page">' + cvHtml + '</div>';
//   document.body.appendChild(container);

//   await new Promise(resolve => setTimeout(resolve, 600));

//   try {
//     const el = document.getElementById('__exportCV');
//     const canvas = await html2canvas(el, {
//       scale: 2,
//       useCORS: true,
//       allowTaint: true,
//       backgroundColor: '#ffffff',
//       width: el.scrollWidth,
//       height: el.scrollHeight,
//       logging: false,
//     });

//     const { jsPDF } = window.jspdf;
//     const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
//     const imgData = canvas.toDataURL('image/jpeg', 0.95);
//     const pdfW = 210;
//     const pdfH = (canvas.height * pdfW) / canvas.width;
//     const pageH = 297;

//     if (pdfH <= pageH) {
//       pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
//     } else {
//       let remaining = pdfH;
//       let position = 0;
//       while (remaining > 0) {
//         if (position > 0) pdf.addPage();
//         pdf.addImage(imgData, 'JPEG', 0, -position, pdfW, pdfH);
//         remaining -= pageH;
//         position += pageH;
//       }
//     }

//     pdf.save((fileName || 'CVEX_Resume').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf');
//     return true;
//   } catch (err) {
//     console.error('PDF export error:', err);
//     return false;
//   } finally {
//     container.remove();
//   }
// }

// /**
//  * Export CV HTML content to a PNG image file.
//  */
// async function exportCVToPNG(cvHtml, fileName) {
//   const container = document.createElement('div');
//   container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;z-index:-1;';
//   container.innerHTML = '<div id="__exportPNG" style="width:210mm;min-height:297mm;background:white;" class="cv-page">' + cvHtml + '</div>';
//   document.body.appendChild(container);

//   await new Promise(resolve => setTimeout(resolve, 600));

//   try {
//     const el = document.getElementById('__exportPNG');
//     const canvas = await html2canvas(el, {
//       scale: 2,
//       useCORS: true,
//       allowTaint: true,
//       backgroundColor: '#ffffff',
//       logging: false,
//     });

//     const link = document.createElement('a');
//     link.download = (fileName || 'CVEX_Resume').replace(/[^a-zA-Z0-9_-]/g, '_') + '.png';
//     link.href = canvas.toDataURL('image/png');
//     link.click();
//     return true;
//   } catch (err) {
//     console.error('PNG export error:', err);
//     return false;
//   } finally {
//     container.remove();
//   }
// }

// // Expose to global scope for cross-file access (CDN environment)
// window.exportCVToPDF = exportCVToPDF;
// window.exportCVToPNG = exportCVToPNG;



// // /* ================================================
// //    PDF & PNG Export Utilities
// //    Uses html2canvas + jsPDF for high-quality exports.
// //    ================================================ */

// // /**
// //  * Export CV HTML content to a PDF file.
// //  * Creates a temporary off-screen container, renders via html2canvas,
// //  * then converts to PDF with multi-page support.
// //  */
// // async function exportCVToPDF(cvHtml, fileName) {
// //   const container = document.createElement('div');
// //   container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;z-index:-1;';
// //   container.innerHTML = '<div id="__exportCV" style="width:210mm;min-height:297mm;background:white;" class="cv-page">' + cvHtml + '</div>';
// //   document.body.appendChild(container);

// //   await new Promise(resolve => setTimeout(resolve, 600));

// //   try {
// //     const el = document.getElementById('__exportCV');
// //     const canvas = await html2canvas(el, {
// //       scale: 2,
// //       useCORS: true,
// //       allowTaint: true,
// //       backgroundColor: '#ffffff',
// //       width: el.scrollWidth,
// //       height: el.scrollHeight,
// //       logging: false,
// //     });

// //     const { jsPDF } = window.jspdf;
// //     const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
// //     const imgData = canvas.toDataURL('image/jpeg', 0.95);
// //     const pdfW = 210;
// //     const pdfH = (canvas.height * pdfW) / canvas.width;
// //     const pageH = 297;

// //     if (pdfH <= pageH) {
// //       pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
// //     } else {
// //       let remaining = pdfH;
// //       let position = 0;
// //       while (remaining > 0) {
// //         if (position > 0) pdf.addPage();
// //         pdf.addImage(imgData, 'JPEG', 0, -position, pdfW, pdfH);
// //         remaining -= pageH;
// //         position += pageH;
// //       }
// //     }

// //     pdf.save((fileName || 'CVEX_Resume').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf');
// //     return true;
// //   } catch (err) {
// //     console.error('PDF export error:', err);
// //     return false;
// //   } finally {
// //     container.remove();
// //   }
// // }

// // /**
// //  * Export CV HTML content to a PNG image file.
// //  */
// // async function exportCVToPNG(cvHtml, fileName) {
// //   const container = document.createElement('div');
// //   container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;z-index:-1;';
// //   container.innerHTML = '<div id="__exportPNG" style="width:210mm;min-height:297mm;background:white;" class="cv-page">' + cvHtml + '</div>';
// //   document.body.appendChild(container);

// //   await new Promise(resolve => setTimeout(resolve, 600));

// //   try {
// //     const el = document.getElementById('__exportPNG');
// //     const canvas = await html2canvas(el, {
// //       scale: 2,
// //       useCORS: true,
// //       allowTaint: true,
// //       backgroundColor: '#ffffff',
// //       logging: false,
// //     });

// //     const link = document.createElement('a');
// //     link.download = (fileName || 'CVEX_Resume').replace(/[^a-zA-Z0-9_-]/g, '_') + '.png';
// //     link.href = canvas.toDataURL('image/png');
// //     link.click();
// //     return true;
// //   } catch (err) {
// //     console.error('PNG export error:', err);
// //     return false;
// //   } finally {
// //     container.remove();
// //   }
// // }

// // // Expose to global scope for cross-file access (CDN environment)
// // window.exportCVToPDF = exportCVToPDF;
// // window.exportCVToPNG = exportCVToPNG;

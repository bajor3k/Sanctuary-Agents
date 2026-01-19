"use client";

export async function downloadTableExcel(opts: {
  table: HTMLTableElement;
  fileName: string;
  sheetName?: string;
}) {
  const { table, fileName, sheetName = "Report" } = opts;
  const XLSX = await import("xlsx");              // lazy-load
  const wb = XLSX.utils.table_to_book(table, { sheet: sheetName });
  // triggers a browser download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

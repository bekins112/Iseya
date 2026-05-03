type ExportFormat = "csv" | "xlsx" | "json";

function sanitizeForSpreadsheet(val: string): string {
  if (/^[=+\-@\t\r]/.test(val)) {
    return `'${val}`;
  }
  return val;
}

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return "";
  let str = sanitizeForSpreadsheet(String(val));
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCSV).join(",");
  const dataLines = rows.map(row => row.map(escapeCSV).join(","));
  return [headerLine, ...dataLines].join("\n");
}

function toXLSX(headers: string[], rows: string[][], sheetName: string): string {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
  <Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#F2CC0C" ss:Pattern="Solid"/></Style>
</Styles>
<Worksheet ss:Name="${sheetName}">
<Table>`;
  const xmlFooter = `</Table></Worksheet></Workbook>`;

  const headerRow = `<Row>${headers.map(h => `<Cell ss:StyleID="header"><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`).join("")}</Row>`;
  const dataRows = rows.map(row =>
    `<Row>${row.map(cell => {
      const sanitized = sanitizeForSpreadsheet(cell);
      const num = Number(sanitized);
      if (sanitized !== "" && !isNaN(num) && isFinite(num)) {
        return `<Cell><Data ss:Type="Number">${sanitized}</Data></Cell>`;
      }
      return `<Cell><Data ss:Type="String">${xmlEscape(sanitized)}</Data></Cell>`;
    }).join("")}</Row>`
  ).join("\n");

  return `${xmlHeader}\n${headerRow}\n${dataRows}\n${xmlFooter}`;
}

function xmlEscape(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportData(
  data: Record<string, any>[],
  columns: { key: string; label: string; transform?: (val: any, row: Record<string, any>) => string }[],
  filename: string,
  format: ExportFormat
) {
  if (data.length === 0) return;

  const headers = columns.map(c => c.label);
  const rows = data.map(item =>
    columns.map(col => {
      const val = item[col.key];
      if (col.transform) return col.transform(val, item);
      if (val === null || val === undefined) return "";
      return String(val);
    })
  );

  const timestamp = new Date().toISOString().slice(0, 10);
  const fullFilename = `${filename}_${timestamp}`;

  switch (format) {
    case "csv":
      downloadFile(toCSV(headers, rows), `${fullFilename}.csv`, "text/csv;charset=utf-8;");
      break;
    case "xlsx":
      downloadFile(toXLSX(headers, rows, filename), `${fullFilename}.xls`, "application/vnd.ms-excel");
      break;
    case "json":
      const jsonData = data.map(item => {
        const obj: Record<string, string> = {};
        columns.forEach(col => {
          obj[col.label] = col.transform ? col.transform(item[col.key], item) : String(item[col.key] ?? "");
        });
        return obj;
      });
      downloadFile(JSON.stringify(jsonData, null, 2), `${fullFilename}.json`, "application/json");
      break;
  }
}

export type { ExportFormat };

import * as XLSX from 'xlsx-js-style';

/**
 * Utility functions for file operations
 */

/**
 * Exporta um array de objetos como planilha .xlsx com cabeçalho estilizado
 * (fundo colorido, negrito, texto branco) e largura de coluna ajustada ao
 * conteúdo — versão "profissional" do convertToCSV/downloadFile pra telas
 * que precisam de um documento pronto pra abrir no Excel.
 */
export const exportToXLSX = (
  rows: Record<string, string | number | null | undefined>[],
  fileName: string,
  sheetName = 'Dados',
) => {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });

  const headerStyle = {
    fill: { fgColor: { rgb: 'D6336C' } },
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { vertical: 'center', horizontal: 'left' },
  };
  headers.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    if (worksheet[cellRef]) worksheet[cellRef].s = headerStyle;
  });

  worksheet['!cols'] = headers.map((header) => {
    const maxLen = rows.reduce(
      (max, row) => Math.max(max, String(row[header] ?? '').length),
      header.length,
    );
    return { wch: Math.min(Math.max(maxLen + 2, 12), 50) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
};

/**
 * Converts a JSON object array to CSV format
 */
export const convertToCSV = (objArray: any[]) => {
  if (objArray.length === 0) return '';
  const header = Object.keys(objArray[0]).join(',') + '\n';
  const rows = objArray.map(obj => 
    Object.values(obj).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(',')
  ).join('\n');
  return header + rows;
};

/**
 * Downloads content as a file
 */
export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};


/**
 * Utility functions for file operations
 */

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

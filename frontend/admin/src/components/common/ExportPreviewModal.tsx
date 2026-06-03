import { X, Download, FileText, Table } from 'lucide-react';

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'csv' | 'excel' | 'pdf';
  dataPreview: {
    columns: string[];
    rows: any[][];
  };
  totalRows?: number;
}

export function ExportPreviewModal({ isOpen, onClose, title, type, dataPreview, totalRows = 45 }: ExportPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              type === 'pdf' ? 'bg-red-100 text-red-600' : 
              type === 'excel' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {type === 'pdf' ? <FileText size={20} /> : <Table size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Xem trước tệp xuất: {title}</h3>
              <p className="text-xs font-medium text-slate-500">Định dạng: {type.toUpperCase()} • Tổng số dòng: {totalRows}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/30">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {dataPreview.columns.map((col, idx) => (
                      <th key={idx} className="p-3 text-xs font-bold uppercase tracking-wider text-slate-500 border-r border-slate-200 last:border-r-0 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dataPreview.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 text-sm text-slate-600 border-r border-slate-100 last:border-r-0 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Truncated indicator */}
                  {dataPreview.rows.length < totalRows && (
                    <tr>
                      <td colSpan={dataPreview.columns.length} className="p-4 text-center text-sm font-medium text-slate-400 italic bg-slate-50/50">
                        ... và {totalRows - dataPreview.rows.length} dòng dữ liệu khác ...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Dữ liệu được trích xuất dựa trên bộ lọc hiện tại.
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
              Hủy bỏ
            </button>
            <button 
              onClick={() => {
                alert(`Đang tải xuống file ${title}.${type}...`);
                onClose();
              }} 
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-sage-600 hover:bg-sage-700 rounded-xl transition-colors shadow-sm"
            >
              <Download size={16} />
              Xác nhận tải xuống
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

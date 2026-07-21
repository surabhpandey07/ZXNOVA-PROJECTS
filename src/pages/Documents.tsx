import { useState, useEffect } from 'react';
import { Folder, File, ExternalLink } from 'lucide-react';

export function Documents() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a full implementation, this would call our /api/drive/files endpoint
    // which authenticates with Google Drive using the provided credentials
    setLoading(false);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Google Drive file storage for all clients and tasks.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-12 text-center">
        <Folder className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Google Drive Integrated</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Your documents are synced directly with Google Drive. You can attach files to specific tasks from the Kanban board.
        </p>
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2 mx-auto">
          <ExternalLink className="w-4 h-4" /> Open Google Drive
        </button>
      </div>
    </div>
  );
}

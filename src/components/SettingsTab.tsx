import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Database, 
  FileJson, 
  Info,
  AlertTriangle,
  Play
} from 'lucide-react';

interface SettingsTabProps {
  onExportBackup: () => void;
  onImportBackup: (jsonData: string) => void;
  onWipeData: () => void;
  onLoadDemoTemplate: () => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  onExportBackup,
  onImportBackup,
  onWipeData,
  onLoadDemoTemplate,
  showNotification,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Basic syntax check
        JSON.parse(text);
        onImportBackup(text);
      } catch (err) {
        showNotification('Invalid JSON backup file format.', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
      
      {/* Settings Title */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Database size={16} className="text-blue-500" />
          System Settings & Data Control
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          Manage local backups, seed demos, or clear workspace states
        </p>
      </div>

      <div className="space-y-5">
        
        {/* Load Demo Data Block */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">Load Demo Playgrounds</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Installs sample transactions, budgets, and default categorizations to explore.
            </p>
          </div>
          <button
            type="button"
            onClick={onLoadDemoTemplate}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center"
          >
            <Play size={12} /> Seed Template
          </button>
        </div>

        {/* Export Backup JSON Block */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">Download Backup File</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Download your ledger entries, limits, and dynamic settings as a JSON package.
            </p>
          </div>
          <button
            type="button"
            onClick={onExportBackup}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center"
          >
            <Download size={12} /> Export Backup
          </button>
        </div>

        {/* Import Backup JSON Block */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">Restore from Backup</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Restore historic data, configurations, and profiles from an existing JSON file.
            </p>
          </div>
          <div className="shrink-0 self-start sm:self-center">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload size={12} /> Restore Backup
            </button>
          </div>
        </div>

        {/* Wipe Workspace Data Block */}
        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle size={12} /> Danger Zone: Wipe Workspace
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Irreversibly wipe all transactions, custom categories, budgets, and profile states.
            </p>
          </div>
          
          {!showWipeConfirm ? (
            <button
              type="button"
              onClick={() => setShowWipeConfirm(true)}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center"
            >
              <Trash2 size={12} /> Wipe All Data
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold animate-pulse">Are you sure?</span>
              <button
                type="button"
                onClick={() => {
                  onWipeData();
                  setShowWipeConfirm(false);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Yes, Wipe
              </button>
              <button
                type="button"
                onClick={() => setShowWipeConfirm(false)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Information Notice */}
        <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-950/50 rounded-2xl flex gap-2">
          <Info size={14} className="text-blue-500 shrink-0" />
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-normal space-y-1">
            <p>
              This website acts offline-first. Your transaction logs are preserved securely inside your browser's private Sandboxed local storage cache.
            </p>
            <p>
              Clearing browser history or site cookies might wipe database configurations. Download periodic backups to safeguard history records.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsTab;

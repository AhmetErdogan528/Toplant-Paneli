import React, { useState } from "react";
import { Upload, FileCheck, X } from "lucide-react";

export default function EvidenceUpload({ onSubmit }) {
  const [file, setFile] = useState(null); // { name, type, dataUrl }

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () =>
      setFile({ name: f.name, type: f.type, dataUrl: reader.result });
    reader.readAsDataURL(f);
  };

  if (file) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          {file.type.startsWith("image/") ? (
            <img
              src={file.dataUrl}
              alt={file.name}
              className="w-14 h-14 object-cover rounded-md border"
            />
          ) : (
            <FileCheck size={28} className="text-arel-blue" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
          </div>
          <button onClick={() => setFile(null)} className="text-slate-400 hover:text-arel-red">
            <X size={16} />
          </button>
        </div>
        <button
          onClick={() => onSubmit(file)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-md bg-arel-green text-white px-4 py-2.5 text-sm font-medium hover:opacity-90"
        >
          <FileCheck size={16} /> Görevi Tamamlandı Olarak Gönder
        </button>
      </div>
    );
  }

  return (
    <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center cursor-pointer hover:border-arel-blue transition-colors">
      <Upload size={22} className="text-arel-blue" />
      <span className="text-sm font-medium text-slate-800">Kanıt dosyası, belge veya resim yükle</span>
      <span className="text-xs text-slate-500">
        Yüklendikten sonra "Görevi Tamamlandı Olarak Gönder" ile gözetmene iletilir
      </span>
      <input type="file" className="hidden" onChange={handleFile} />
    </label>
  );
}
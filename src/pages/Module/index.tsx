import { Box, FileText, Image, Mic, Video } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "@/components/Card";

interface MaterialItem {
  id: number;
  title: string;
  thumbnail: string;
  description: string;
  fileUrl: string;
  type: string;
}

interface FileIconProps {
  type: string;
}

const FileIcon: React.FC<FileIconProps> = ({ type }) => {
  switch (type) {
    case "pdf":
      return <FileText className="w-4 h-4 text-red-500" />;
    case "video":
      return <Video className="w-4 h-4 text-red-500" />;
    case "3d":
      return <Box className="w-4 h-4 text-orange-500" />;
    case "audio":
      return <Mic className="w-4 h-4 text-purple-500" />;
    default:
      return <Image className="w-4 h-4 text-red-500" />;
  }
};

const Materi: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<MaterialItem | null>(null);

  const listBab = [
    "BAB I",
    "BAB II",
    "BAB III",
    "BAB IV",
    "BAB V",
    "BAB VI",
    "BAB VII",
  ];

  // ----- SAMPLE DATA -----
  const materials: MaterialItem[] = [
    {
      id: 1,
      title: "Pengantar Pemberantasan Terorisme",
      thumbnail:
        "https://images.unsplash.com/photo-1763713382836-e2263bff42b3?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description:
        "Materi ini memberikan pengantar mengenai konsep dasar terorisme, akar penyebabnya, serta strategi awal penanggulangan terorisme.",
      fileUrl:
        "https://images.unsplash.com/photo-1763713382836-e2263bff42b3?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      type: "image",
    },
    {
      id: 2,
      title: "Etika dan Hak Asasi",
      thumbnail:
        "https://images.unsplash.com/photo-1763908161084-6be74390daf2?q=80&w=726&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description:
        "Pembahasan mengenai etika dan HAM dalam konteks penindakan terorisme.",
      fileUrl:
        "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
      type: "pdf",
    },
    {
      id: 3,
      title: "Proses Radikalisasi",
      thumbnail:
        "https://images.unsplash.com/photo-1763396519853-28ca56230bda?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Mengenal proses radikalisasi dan faktor penyebabnya.",
      fileUrl: "https://www.youtube.com/watch?v=Stl_I7U53wA",
      type: "video",
    },
  ];

  // ===== HANDLE SELECT FILE (update right panel only) =====
  const handleSelectMaterial = (item: MaterialItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      {/* LEFT CONTENT */}
      <Card
        className={`${
          selectedItem ? "col-span-8" : "col-span-12"
        } space-y-4 p-6`}
      >
        {/* TABS */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {listBab.map((bab, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveTab(idx);
                setSelectedItem(null); // reset ketika pindah BAB
              }}
              className={`px-6 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeTab === idx
                  ? "bg-gray-900 text-white shadow"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {bab}
            </button>
          ))}
        </div>

        <h2 className="text-lg font-bold mb-4">
          {listBab[activeTab]} - Pengantar Pemberantasan Terorisme
        </h2>

        {/* GRID MATERI */}
        <div className="grid grid-cols-3 gap-4">
          {materials.map((item) => (
            <div
              key={item.id}
              className={`${
                selectedItem?.id === item.id
                  ? "bg-blue-500/20 border-blue-500"
                  : "bg-gray-100 border-transparent"
              } rounded-xl p-4 cursor-pointer hover:shadow transition`}
              onClick={() => handleSelectMaterial(item)}
            >
              <div className="flex gap-2 items-center mb-3">
                <div className="ml-1">
                  <FileIcon type={item.type} />
                </div>
                <div className="text-sm truncate font-semibold">
                  {item.title}
                </div>
              </div>
              <img
                src={item.thumbnail}
                className={`w-full ${
                  selectedItem ? "h-32" : "h-48"
                } object-cover rounded-lg`}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* RIGHT PANEL */}
      {selectedItem && (
        <Card className="col-span-4 p-4">
          <div className="flex gap-4 items-center mb-4">
            <img
              src={selectedItem.thumbnail}
              className="w-32 h-40 object-cover rounded-lg"
            />

            <h3 className="text-xl font-bold">{selectedItem.title}</h3>
          </div>

          <div className="mt-2 mb-4">Module Specifications</div>

          <div className="p-4 rounded-lg border mb-4">
            <p className="text-gray-600 leading-relaxed">
              {selectedItem.description}
            </p>
          </div>

          {selectedItem.type == "image" && (
            <button
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
              onClick={() =>
                navigate(
                  `/image?url=${encodeURIComponent(
                    selectedItem.fileUrl
                  )}&title=${encodeURIComponent(selectedItem.title)}`
                )
              }
            >
              Open Image
            </button>
          )}

          {selectedItem.type == "pdf" && (
            <button
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
              onClick={() =>
                navigate(
                  `/file?url=${encodeURIComponent(
                    selectedItem.fileUrl
                  )}&title=${encodeURIComponent(selectedItem.title)}`
                )
              }
            >
              Open File
            </button>
          )}

          {selectedItem.type == "video" && (
            <button
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
              onClick={() =>
                navigate(
                  `/video?url=${encodeURIComponent(
                    selectedItem.fileUrl
                  )}&title=${encodeURIComponent(selectedItem.title)}`
                )
              }
            >
              Play Video
            </button>
          )}
        </Card>
      )}
    </div>
  );
};

export default Materi;

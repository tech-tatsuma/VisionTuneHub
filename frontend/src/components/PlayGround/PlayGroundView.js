import React, { useState } from "react";
import axios from "axios";
import "./PlayGroundView.css";

const PlayGroundView = () => {
    const [model, setModel] = useState("");
    const [role, setRole] = useState("");
    const [apikey, setApikey] = useState("");
    const [instruction, setInstruction] = useState("");
    const [uploadedImage, setUploadedImage] = useState(null);
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
          setUploadedImage(URL.createObjectURL(file));
        }
      };

    const handleSubmit = async () => {
        if (!model || !role || !instruction || !uploadedImage) {
          alert("Please fill in all fields and upload an image.");
          return;
        }
    
        try {
          setIsLoading(true);
          const formData = new FormData();
          formData.append("model", model);
          formData.append("role", role);
          formData.append("instruction", instruction);
          formData.append("file", document.querySelector("#file-upload").files[0]);
          formData.append("api_key", apikey);
    
          const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
          const res = await axios.post(`${backendUrl}/playground/process_image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
    
          setResponse(res.data.data.response);
        } catch (error) {
          console.error("Error:", error);
          alert("Failed to process image.");
        } finally {
            setIsLoading(false); // ローディングを終了
        }
    };
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#FFFFFF] group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
        {isLoading && (
        <div className="loading-overlay">
          <div className="loader-container">
            <div className="loader">
              <div className="circle">&nbsp;</div>
              <div className="circle">&nbsp;</div>
              <div className="circle">&nbsp;</div>
              <div className="circle">&nbsp;</div>
            </div>
          </div>
        </div>
      )}
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#EEEEEE] px-10 py-3">
          <div className="flex items-center gap-4 text-black">
            <div className="size-4">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-black text-lg font-bold leading-tight tracking-[-0.015em]">
              VisionTuneHub
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
                        <div className="flex items-center gap-9">
                        <a className="text-black text-sm font-medium leading-normal" href="/projects">
                            Projects
                        </a>
                        </div>
                        <div className="flex gap-2">
                        </div>
                    </div>
        </header>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-black text-4xl font-black leading-tight tracking-[-0.033em]">PlayGround</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div
                className="w-full max-w-[480px] aspect-video border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer"
                onClick={() => document.getElementById("file-upload").click()}
                style={{
                  backgroundImage: uploadedImage ? `url(${uploadedImage})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!uploadedImage && <p className="text-gray-500">Drag & Drop or Click to Upload Image</p>}
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </div>

              <div className="flex flex-col gap-4 mt-4 w-full max-w-[480px]">
              <label>
                  <span className="text-black text-base font-bold leading-tight">OpenAI Key</span>
                  <input
                    type="text"
                    placeholder="Enter API key"
                    value={apikey}
                    onChange={(e) => setApikey(e.target.value)}
                    className="border border-[#E0E0E0] p-2 rounded w-full"
                  />
                </label>
                <label>
                  <span className="text-black text-base font-bold leading-tight">Model</span>
                  <input
                    type="text"
                    placeholder="Enter model name"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="border border-[#E0E0E0] p-2 rounded w-full"
                  />
                </label>

                <label>
                  <span className="text-black text-base font-bold leading-tight">Role</span>
                  <textarea
                    placeholder="Enter role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border border-[#E0E0E0] p-2 rounded w-full"
                  />
                </label>

                <label>
                  <span className="text-black text-base font-bold leading-tight">Instruction</span>
                  <textarea
                    placeholder="Enter instruction"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="border border-[#E0E0E0] p-2 rounded w-full"
                  />
                </label>

                <button
                  onClick={handleSubmit}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow-sm hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>

              {response && (
                <div className="mt-4 p-4 border border-gray-300 rounded w-full max-w-[480px] bg-gray-50">
                  <p className="text-black text-base font-bold">Response:</p>
                  <p className="text-gray-700">{response}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayGroundView;
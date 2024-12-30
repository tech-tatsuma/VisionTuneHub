import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PlayGroundView.css";

const PlayGroundView = ({modelname}) => {
    const [model, setModel] = useState(modelname);
    const [role, setRole] = useState("");
    const [apikey, setApikey] = useState("");
    const [instruction, setInstruction] = useState("");
    const [uploadedImage, setUploadedImage] = useState(null);
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false); 

    useEffect(() => {
      // ローカルストレージからAPIキーを読み込み
      const savedKey = localStorage.getItem("api_key");
      if (savedKey) {
          setApikey(savedKey);
      }
    }, []);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
          setUploadedImage(URL.createObjectURL(file));
        }
      };

    const handleSubmit = async () => {

      if (window.confirm("Do you want to save this API key for future use?")) {
        localStorage.setItem("api_key", apikey);
      }
      setApikey(apikey);
      
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

    const toggleMenu = () => {
      setMenuOpen((prev) => !prev);
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
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#EEEEEE] px-4 py-3 md:px-10">
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
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold leading-tight tracking-[-0.015em] text-black">
          VisionTuneHub
        </h2>
      </div>
          <div className="flex items-center gap-8">
                        <button
                            className="lg:hidden text-black text-lg w-12 h-12 flex items-center justify-center"
                            onClick={toggleMenu}
                        >
                            ☰
                        </button>
                        <nav className="hidden lg:flex items-center gap-9">
                            <a
                                className="text-black text-sm font-medium leading-normal"
                                href="/projects"
                                style={{
                                    transition: "color 0.3s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#577399")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
                            >
                                Projects
                            </a>
                        </nav>
                    </div>
    </header>

    <div
                    className={`fixed inset-0 bg-black bg-opacity-40 z-50 transition-opacity duration-300 ${
                        menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                    onClick={toggleMenu}
                >
                    <div
                        className={`absolute top-0 left-0 w-full bg-white shadow-lg p-5 rounded-b-lg max-h-64 overflow-hidden transition-transform duration-300 transform ${
                            menuOpen ? "translate-y-0" : "-translate-y-full"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold mb-4 text-gray-700">Menu</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="/projects"
                                    className="text-gray-700 hover:text-blue-400"
                                >
                                    Projects
                                </a>
                            </li>
                        </ul>
                        <button
                            className="mt-5 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                            onClick={toggleMenu}
                        >
                            Close
                        </button>
                    </div>
                </div>

    <div className="px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col w-full max-w-[960px]">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-0 flex-col gap-3">
            <p className="text-black text-2xl md:text-4xl font-black leading-tight tracking-[-0.033em] hover:text-customHoverColor">
              PlayGround
            </p>
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
            {!uploadedImage && (
              <p className="text-gray-500 text-sm text-center px-2">
                Drag & Drop or Click to Upload Image
              </p>
            )}
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>

          <div className="flex flex-col gap-4 mt-4 w-full max-w-[480px]">
          <label className="flex flex-col gap-1">
    <span className="text-black text-sm md:text-base font-bold leading-tight">
      OpenAI Key
    </span>
    <div className="relative">
      <input
        type={showApiKey ? "text" : "password"}
        placeholder="Enter API key"
        value={apikey}
        onChange={(e) => setApikey(e.target.value)}
        className="border border-[#E0E0E0] p-2 rounded w-full"
      />
      <button
        type="button"
        onClick={() => setShowApiKey(!showApiKey)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
      >
        {showApiKey ? "🙈" : "👁️"}
      </button>
    </div>
  </label>

            <label>
              <span className="text-black text-sm md:text-base font-bold leading-tight">
                Role
              </span>
              <textarea
                placeholder="Enter role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                rows={3}
                style={{
                  resize: "none",
                  overflow: "hidden",
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className="border border-[#E0E0E0] p-2 rounded w-full"
              />
            </label>

            <label>
              <span className="text-black text-sm md:text-base font-bold leading-tight">
                Instruction
              </span>
              <textarea
                placeholder="Enter instruction"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={3}
                style={{
                  resize: "none",
                  overflow: "hidden",
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className="border border-[#E0E0E0] p-2 rounded w-full"
              />
            </label>

            <button
              onClick={handleSubmit}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow-sm hover:bg-blue-400 transition duration-300"
              style={{ background: "#495867" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#577399")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#495867")}
            >
              Submit
            </button>
          </div>

          {response && (
            <div className="mt-4 p-4 border border-gray-300 rounded w-full max-w-[480px] bg-gray-50">
              <p className="text-black text-sm md:text-base font-bold">Response:</p>
              <p className="text-gray-700 text-sm md:text-base">{response}</p>
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
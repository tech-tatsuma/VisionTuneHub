import React, { useState, useEffect, useRef } from "react";
import AnnotationCard from "./AnnotationCard";
import { useNavigate } from "react-router-dom";
import "./../PlayGround/PlayGroundView.css";

const AnnotationList = ({ pid }) => {

  const backendurl = process.env.REACT_APP_BACKEND_URL;

  const [projectName, setProjectName] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [role, setRole] = useState("");
  const [instruction, setInstruction] = useState("");
  const [expectedResponse, setExpectedResponse] = useState("");
  const [data_split, setDataSplit] = useState("train");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("");
  const [projectnameupdate, setProjectNameUpdate] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // 画像のインデックスをリロードせずに保持するためのref
  const imageIndexRef = useRef(currentImageIndex);

  const navigate = useNavigate();

  const fetchAnnotations = async () => {
    try {
      const response = await fetch(
        `${backendurl}/annotation/get_annotations?pid=${pid}`
      );
      const data = await response.json();
      setAnnotations(data.annotations);
      setProjectName(data.project_info.name);
      setDataSplit(data.annotations[currentImageIndex].dataset_split);
      setDescription(data.project_info.description);
      setModel(data.project_info.model);
      setProjectNameUpdate(data.project_info.name);
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    } finally {
      setIsLoading(false); // データ取得終了時にローディングを無効化
    }
  };

  useEffect(() => {
    fetchAnnotations();
  }, [pid, currentImageIndex]);

  useEffect(() => {
    // 現在のアノテーション情報を設定
    if (annotations.length > 0 && annotations[imageIndexRef.current]) {
      const currentAnnotation = annotations[imageIndexRef.current];
      setRole(currentAnnotation.sys || "");
      setInstruction(currentAnnotation.user || "");
      setExpectedResponse(currentAnnotation.label || "");
    }
  }, [currentImageIndex, annotations]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        handleNextImage();
      } else if (event.key === "ArrowLeft") {
        handlePreviousImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [annotations]);

  const handleNextImage = () => {
    if (imageIndexRef.current < annotations.length - 1) {
      imageIndexRef.current += 1;
      setCurrentImageIndex(imageIndexRef.current);
    }
  };

  const handlePreviousImage = () => {
    if (imageIndexRef.current > 0) {
      imageIndexRef.current -= 1;
      setCurrentImageIndex(imageIndexRef.current);
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleConfirm = async () => {
    const currentAnnotation = annotations[imageIndexRef.current];
    const payload = {
      pid,
      image: currentAnnotation.image,
      sys: role,
      user: instruction,
      label: expectedResponse,
      dataset_split: data_split,
    };
    console.log("payload", payload);

    try {
      const response = await fetch(`${backendurl}/annotation/add_annotation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update annotation");
      }

      const result = await response.json();
      console.log("Annotation updated successfully:", result);

      // 再度アノテーションを取得
      setIsLoading(true); // ローディング開始
      const updatedAnnotationsResponse = await fetch(
        `${backendurl}/annotation/get_annotations?pid=${pid}`
      );
      const updatedAnnotationsData = await updatedAnnotationsResponse.json();
      setAnnotations(updatedAnnotationsData.annotations);
      setProjectName(updatedAnnotationsData.projectName);
      handleNextImage();
    } catch (error) {
      if (error.response) {
        console.error("Server response error:", error.response.status, error.response.data);
      } else {
        console.error("Error:", error.message);
      }
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };

  const handleDownloadDataset = async () => {
    try {
      const response = await fetch(`${backendurl}/annotation/generate-jsonl?pid=${pid}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate dataset");
      }

      // Train と Val ファイルのURLを取得
      const result = await response.json();
      const trainFileUrl = `${backendurl}/annotation/download?path=${result.train_file}`;
      const valFileUrl = `${backendurl}/annotation/download?path=${result.val_file}`;

      // Train ファイルのダウンロード
      const trainResponse = await fetch(trainFileUrl);
      if (!trainResponse.ok) {
        throw new Error("Failed to download train dataset");
      }
      const trainBlob = await trainResponse.blob();
      const trainUrl = window.URL.createObjectURL(trainBlob);
      const trainLink = document.createElement("a");
      trainLink.href = trainUrl;
      trainLink.download = `train.jsonl`;
      document.body.appendChild(trainLink);
      trainLink.click();
      trainLink.remove();
      window.URL.revokeObjectURL(trainUrl);

      // Val ファイルのダウンロード
      const valResponse = await fetch(valFileUrl);
      if (!valResponse.ok) {
        throw new Error("Failed to download val dataset");
      }
      const valBlob = await valResponse.blob();
      const valUrl = window.URL.createObjectURL(valBlob);
      const valLink = document.createElement("a");
      valLink.href = valUrl;
      valLink.download = `val.jsonl`;
      document.body.appendChild(valLink);
      valLink.click();
      valLink.remove();
      window.URL.revokeObjectURL(valUrl);

    } catch (error) {
      console.error("Error downloading dataset:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (confirmDelete) {
      try {
        const response = await fetch(`${backendurl}/projects/delete/${projectId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("An error occurred.");
      } finally {
        navigate("/projects");
      }
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("pid", pid);
    formData.append("name", projectnameupdate);
    formData.append("description", description);
    formData.append("model", model);

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(`${backendurl}/projects/add_image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      const result = await response.json();
      console.log("Files uploaded successfully:", result);

      setIsLoading(true);
      await fetchAnnotations();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

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


  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#FFFFFF] overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
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
                className="text-black text-sm font-medium leading-normal hover:text-customHoverColor"
                href="/projects"
                style={{ transition: "color 0.3s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#577399")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
              >
                Projects
              </a>
              <a className="text-black text-sm font-medium leading-normal hover:text-customHoverColor" href="https://platform.openai.com/finetune"
                style={{
                  transition: "color 0.3s ease", // スムーズな変化を追加
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#577399")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
              >
                Finetune
              </a>
              <button
                className="text-black text-sm font-medium leading-normal"
                onClick={handleDownloadDataset}
                style={{
                  transition: "color 0.3s ease", // スムーズな変化を追加
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#577399")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
              >
                Download
              </button>
              <button
                className="text-black text-sm font-medium leading-normal"
                style={{
                  transition: "color 0.3s ease", // スムーズな変化を追加
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#577399")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
                onClick={toggleModal}
              >
                Setting
              </button>
            </nav>
          </div>
        </header>
        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-40 z-50 transition-opacity duration-300 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          onClick={toggleMenu}
          style={{ marginBottom: "16px !important" }}
        >
          <div
            className={`absolute top-0 left-0 w-full bg-white shadow-lg p-5 rounded-b-lg max-h-64 overflow-hidden transition-transform duration-300 transform ${menuOpen ? "translate-y-0" : "-translate-y-full"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4 text-gray-700">Menu</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/projects"
                  className="text-black text-sm font-medium leading-normal hover:text-customHoverColor"
                >
                  Projects
                </a>
              </li>
              <li>
                <a className="text-black text-sm font-medium leading-normal hover:text-customHoverColor" href="https://platform.openai.com/finetune"
                  style={{
                    transition: "color 0.3s ease", // スムーズな変化を追加
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#577399")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "black")}>
                  Finetune
                </a>
              </li>
              <li>
                <button
                  className="text-black text-sm font-medium leading-normal"
                  onClick={handleDownloadDataset}
                  style={{
                    transition: "color 0.3s ease", // スムーズな変化を追加
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#577399")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
                >
                  Download
                </button>
              </li>
              <li>
                <button
                  className="text-black text-sm font-medium leading-normal"
                  style={{
                    transition: "color 0.3s ease", // スムーズな変化を追加
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#577399")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
                  onClick={toggleModal}
                >
                  Setting
                </button>
              </li>
            </ul>
            <button
              className="mt-5 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 mb-4"
              onClick={toggleMenu}
              style={{ marginBottom: "16px !important" }}
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center px-10 py-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-400"
            onClick={handlePreviousImage}
            disabled={imageIndexRef.current === 0}
          >
            Previous
          </button>
          <span className="text-black font-medium">
            Image {imageIndexRef.current + 1} of {annotations.length}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-400"
            onClick={handleNextImage}
            disabled={imageIndexRef.current === annotations.length - 1}
          >
            Next
          </button>
        </div>
        {annotations.length > 0 && annotations[imageIndexRef.current]?.image && (
          <AnnotationCard
            pid={pid}
            projectName={projectName}
            role={role}
            setRole={setRole}
            instruction={instruction}
            setInstruction={setInstruction}
            expectedResponse={expectedResponse}
            setExpectedResponse={setExpectedResponse}
            handleConfirm={handleConfirm}
            imagename={annotations[imageIndexRef.current].image}
            annotation={annotations[imageIndexRef.current]}
            backendurl={backendurl}
            data_split={data_split}
            setDataSplit={setDataSplit}
          />
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white p-6 sm:p-8 rounded shadow-lg w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl"
            style={{ margin: "20px" }} // モバイル画面でのマージン調整
          >
            <h3 className="text-lg font-bold mb-4">Settings</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(); // 保存処理を呼び出す
                toggleModal();
              }}
              onKeyDown={(e) => {
                if (e.target.tagName !== "TEXTAREA" && e.key === "Enter") {
                  e.preventDefault(); // `textarea` 以外では Enter キーのデフォルト動作を無効化
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={projectnameupdate}
                  onChange={(e) => setProjectNameUpdate(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Model Register</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Add Images</label>
                <input
                  type="file"
                  className="w-full px-3 py-2 border rounded"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={(e) => {
                    setSelectedFiles(Array.from(e.target.files));
                  }}
                />
              </div>
              <div className="mb-4">
                <button
                  type="button"
                  className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => navigate(`/testmodel/${model}`)}
                  style={{ background: "#577399" }}
                >
                  Test Model
                </button>
              </div>
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <button
                  className="text-white bg-red-500 px-4 py-2 rounded w-full sm:w-auto"
                  onClick={() => handleDeleteProject(pid)}
                  style={{ background: "#AE445A" }}
                >
                  Delete Project
                </button>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={toggleModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    style={{ background: "#577399" }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotationList;

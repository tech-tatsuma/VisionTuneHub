import React, { useState, useEffect, useRef } from "react";
import AnnotationCard from "./AnnotationCard";
import { useNavigate } from "react-router-dom";
import PlayGroundView from './../PlayGround/PlayGroundView';

const AnnotationList = ({pid}) => {

  const backendurl = process.env.REACT_APP_BACKEND_URL;

  const [projectName, setProjectName] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [role, setRole] = useState("");
  const [instruction, setInstruction] = useState("");
  const [expectedResponse, setExpectedResponse] = useState("");
  const [data_split, setDataSplit] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("");
  const [projectnameupdate, setProjectNameUpdate] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

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
      setDataSplit(data.dataset_split);
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
  }, [pid]);

  useEffect(() => {
    // 現在のアノテーション情報を設定
    if (annotations.length > 0 && annotations[imageIndexRef.current]) {
      const currentAnnotation = annotations[imageIndexRef.current];
      setRole(currentAnnotation.sys || "");
      setInstruction(currentAnnotation.user || "");
      setExpectedResponse(currentAnnotation.label || "");
    }
  }, [currentImageIndex, annotations]);

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
      console.error("Error updating annotation:", error);
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
      const trainFileUrl = result.train_file;
      const valFileUrl = result.val_file;

      // Train ファイルのダウンロード
      const trainResponse = await fetch(trainFileUrl);
      if (!trainResponse.ok) {
        throw new Error("Failed to download train dataset");
      }
      const trainBlob = await trainResponse.blob();
      const trainUrl = window.URL.createObjectURL(trainBlob);
      const trainLink = document.createElement("a");
      trainLink.href = trainUrl;
      trainLink.download = `${pid}_train.jsonl`;
      trainLink.click();
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
      valLink.download = `${pid}_val.jsonl`;
      valLink.click();
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

  if (isLoading) {
    // ローディング中の表示
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-black text-lg font-medium">Loading...</p>
      </div>
    );
  }

  
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#FFFFFF] group/design-root overflow-x-hidden"
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
            <h2 className="text-black text-lg font-bold leading-tight tracking-[-0.015em]">
              VisionTuneHub
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-black text-sm font-medium leading-normal" href="/projects" 
              style={{
                  transition: "color 0.3s ease", // スムーズな変化を追加
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#577399")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "black")}>
                Projects
              </a>
            </div>
            <div className="flex items-center gap-9">
              <a className="text-black text-sm font-medium leading-normal hover:text-customHoverColor" href="https://platform.openai.com/finetune"
              style={{
                transition: "color 0.3s ease", // スムーズな変化を追加
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#577399")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "black")}>
                Finetune
              </a>
            </div>
            <div className="flex items-center gap-9">
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
            </div>
            <div className="flex items-center gap-9">
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
            </div>
            <div className="flex gap-2">
            </div>
          </div>
        </header>
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
            <div className="bg-white p-8 rounded shadow-lg w-1/3">
              <h3 className="text-lg font-bold mb-4">Settings</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave(); // 保存処理を呼び出す
                  toggleModal();
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
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                      setSelectedFiles(Array.from(e.target.files)); // 選択されたファイルを状態に保存
                    }}
                  />
                </div>
                <div className="mb-4">
                  <button
                    type="button"
                    className="text-black text-sm font-medium leading-normal text-white px-4 py-2 rounded"
                    style={{ backgroundColor: "#577399" }}
                    onClick={() => {
                      console.log("Model before navigating:", model);
                      // PlayGroundViewを呼び出す（ここでモデル名を渡す）
                      navigate(`/testmodel/${model}`);
                    }}
                  >
                    Test Model
                  </button>
                </div>
                <div className="flex items-center gap-9">
                  <button
                    className="text-black text-sm font-medium leading-normal text-white px-4 py-2 rounded"
                    style={{ backgroundColor: "#FE5F55" }}
                    onClick={() => handleDeleteProject(pid)}
                  >
                    Delete this projects
                  </button>
                </div>
                <div className="flex justify-end gap-4">
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
                    style={{ backgroundColor: "#495867" }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default AnnotationList;

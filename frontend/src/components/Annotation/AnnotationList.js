import React, { useState, useEffect, useRef } from "react";
import AnnotationCard from "./AnnotationCard";

const AnnotationList = ({pid}) => {

  const backendurl = process.env.REACT_APP_BACKEND_URL;

  const [projectName, setProjectName] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [role, setRole] = useState("");
  const [instruction, setInstruction] = useState("");
  const [expectedResponse, setExpectedResponse] = useState("");
  const [data_split, setDataSplit] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  // 画像のインデックスをリロードせずに保持するためのref
  const imageIndexRef = useRef(currentImageIndex);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const response = await fetch(
          `${backendurl}/annotation/get_annotations?pid=${pid}`
        );
        const data = await response.json();
        setAnnotations(data.annotations);
        setProjectName(data.project_info.name);
        setDataSplit(data.dataset_split)
      } catch (error) {
        console.error("Failed to fetch annotations:", error);
      } finally {
        setIsLoading(false); // データ取得終了時にローディングを無効化
      }
    };
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
        if (response.ok) {
          alert("The project has been deleted.");
          window.location.href = "/projects"; // プロジェクト一覧ページにリダイレクト
        } else {
          alert("Failed to delete the project.");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("An error occurred.");
      }
    }
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
              <a className="text-black text-sm font-medium leading-normal" href="/projects">
                Projects
              </a>
            </div>
            <div className="flex items-center gap-9">
              <a className="text-black text-sm font-medium leading-normal" href="https://platform.openai.com/finetune">
                Finetune
              </a>
            </div>
            <div className="flex items-center gap-9">
              <button
                className="text-black text-sm font-medium leading-normal bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleDownloadDataset}
              >
                Download
              </button>
            </div>
            <div className="flex items-center gap-9">
              <button
                className="text-black text-sm font-medium leading-normal bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => handleDeleteProject(pid)}
              >
                Delete
              </button>
            </div>
            <div className="flex gap-2">
            </div>
          </div>
        </header>
        <div className="flex justify-between items-center px-10 py-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={handlePreviousImage}
            disabled={imageIndexRef.current === 0}
          >
            Previous
          </button>
          <span className="text-black font-medium">
            Image {imageIndexRef.current + 1} of {annotations.length}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 rounded"
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
    </div>
  );
};

export default AnnotationList;

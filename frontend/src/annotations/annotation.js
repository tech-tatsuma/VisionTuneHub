import React, { useState, useEffect, useRef } from "react";
import AnnotationSection from "./annotationcard";

const AnnotationContent = ({pid}) => {

  const backendurl = process.env.REACT_APP_BACKEND_URL;

  const [projectName, setProjectName] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [role, setRole] = useState("");
  const [instruction, setInstruction] = useState("");
  const [expectedResponse, setExpectedResponse] = useState("");

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
        setProjectName(data.projectName);
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

      // ダウンロード用のリンクを作成
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pid}.jsonl`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading dataset:", error);
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
              <button
                className="text-black text-sm font-medium leading-normal bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleDownloadDataset}
              >
                Download
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
          <AnnotationSection
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
          />
        )}
      </div>
    </div>
  );
};

export default AnnotationContent;

import React, { useEffect } from "react";

const AnnotationCard = ({ pid, imagename, projectName, role, setRole, instruction, setInstruction, expectedResponse, setExpectedResponse, handleConfirm, backendurl, annotation, data_split, setDataSplit }) => {
  // console.log("imagename", imagename);
  const encodedImagename = encodeURIComponent(imagename);
  const imageurl = `${backendurl}/images/${pid}/imgs/${encodedImagename.replace(
    "/4ovisionannotator/backend/datas",
    ""
  )}`;
  const handleInputResize = (event) => {
    event.target.style.height = "auto"; // Reset height
    event.target.style.height = `${event.target.scrollHeight}px`; // Adjust height dynamically
  };

  const handleKeyDown = (event) => {
    if (event.shiftKey && event.key === "Enter") {
      event.preventDefault();
      handleConfirm();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  console.log("imageurl", imageurl);
    return (
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <div className="flex min-w-72 flex-col gap-3">
              <p className="text-black text-4xl font-black leading-tight tracking-[-0.033em]">{projectName}</p>
              <p className="text-[#6B6B6B] text-base font-normal leading-normal">
                Please annotate the image being displayed.
              </p>
            </div>
          </div>
  
          <div
            className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
            style={{
              backgroundImage: `url(${imageurl})`,
              width: "480px", // 画像の幅を指定
              height: "270px", // 画像の高さを指定
              margin: "0 auto", // 画像を中央揃え
            }}
          ></div>
  
          <div className="grid grid-cols-[repeat(auto-fit,minmax(228px,1fr))] gap-2.5 px-4 py-3 @3xl:grid-cols-4">
            <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#DEDEDE] bg-[#FFFFFF] p-6">
            <label className="flex flex-col gap-2">
                <span className="text-black text-base font-bold leading-tight">Data Split</span>
                <select
                  value={data_split}
                  onChange={(e) => setDataSplit(e.target.value)}
                  className="form-input w-full resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#1980e6] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                >
                  <option value="train">Train</option>
                  <option value="val">Validation</option>
                </select>
              </label>
            <label className="flex flex-col gap-2">
              <span className="text-black text-base font-bold leading-tight">Role</span>
              <textarea
                placeholder="Enter role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onInput={handleInputResize}
                className="border border-[#E0E0E0] p-2 rounded resize-none overflow-hidden"
                style={{ minHeight: "40px" }}
                defaultValue={annotation.sys}
              />
            </label>
  
            <label className="flex flex-col gap-2">
              <span className="text-black text-base font-bold leading-tight">Instruction</span>
              <textarea
                placeholder="Enter instruction"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onInput={handleInputResize}
                className="border border-[#E0E0E0] p-2 rounded resize-none overflow-hidden"
                style={{ minHeight: "40px" }}
                defaultValue={annotation.user}
              />
            </label>
  
            <label className="flex flex-col gap-2">
              <span className="text-black text-base font-bold leading-tight">Expected Response</span>
              <textarea
                placeholder="Enter expected response"
                value={expectedResponse}
                onChange={(e) => setExpectedResponse(e.target.value)}
                onInput={handleInputResize}
                className="border border-[#E0E0E0] p-2 rounded resize-none overflow-hidden"
                style={{ minHeight: "40px" }}
                defaultValue={annotation.label}
              />
            </label>
            <button
              onClick={handleConfirm}
              className="mt-4 px-4 py-2 bg-gray-300 text-black rounded shadow-sm hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition w-full sm:w-auto"
              style={{ alignSelf: "center" }}
            >
              Register
            </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  

export default AnnotationCard;
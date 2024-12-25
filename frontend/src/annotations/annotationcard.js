import React from "react";

const AnnotationSection = ({ pid, imagename, projectName, role, setRole, instruction, setInstruction, expectedResponse, setExpectedResponse, handleConfirm, backendurl, annotation }) => {
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
            }}
          ></div>
  
          <div className="grid grid-cols-[repeat(auto-fit,minmax(228px,1fr))] gap-2.5 px-4 py-3 @3xl:grid-cols-4">
            <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#DEDEDE] bg-[#FFFFFF] p-6">
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
              className="mt-4 px-4 py-2 bg-gray-300 text-black rounded shadow-sm"
              style={{ width: "50%", alignSelf: "center" }}
            >
              Register
            </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  

export default AnnotationSection;
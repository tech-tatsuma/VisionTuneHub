import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const [projectName, setProjectName] = useState("");
  const [files, setFiles] = useState([]);
  const [defaultRole, setDefaultRole] = useState("");
  const [description, setDescription] = useState("");
  const [trainRatio, setTrainRatio] = useState(0.8);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  const handleInputResize = (event) => {
    event.target.style.height = "auto"; // Reset height to auto
    event.target.style.height = event.target.scrollHeight + "px"; // Adjust height
  };

  const handleSubmit = async () => {
    if (!projectName || files.length === 0) {
      alert("Please enter a project name and upload files.");
      return;
    }

    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("default_role", defaultRole);
    formData.append("description", description);
    formData.append("train_ratio", trainRatio);

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const backendurl = process.env.REACT_APP_BACKEND_URL;
      console.log(`${backendurl}/projects/create`);

      const response = await axios.post(`${backendurl}/projects/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const createdProject = response.data.project;
      const projectId = createdProject.id;
      navigate(`/annotation/${projectId}`);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to create project: " + error.message);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen items-center justify-center bg-white group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col items-center justify-center">
        <div className="gap-1 px-6 flex flex-col items-center justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] w-full">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">Create Project</p>
                <p className="text-[#637588] text-sm font-normal leading-normal">Please enter the information about the project you want to create.</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 px-4 pb-4 items-center w-full">
              <label className="flex flex-col min-w-40 w-full max-w-[480px]">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">Project Name</p>
                <input
                  type="text"
                  placeholder="Input Project Name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="form-input w-full resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#1980e6] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                />
              </label>

              <label className="flex flex-col min-w-40 w-full max-w-[480px]">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">Description</p>
                <textarea
                  placeholder="Input Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onInput={handleInputResize}
                  className="form-input w-full resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#1980e6] placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                  style={{ height: "auto" }}
                />
              </label>

              <label className="flex flex-col min-w-40 w-full max-w-[480px]">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">Upload Image Folder</p>
                <input
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={handleFileChange}
                  className="form-input w-full resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#1980e6] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                />
              </label>

              <label className="flex flex-col min-w-40 w-full max-w-[480px]">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">Default Role</p>
                <textarea
                  placeholder="Input Default Role"
                  value={defaultRole}
                  onChange={(e) => setDefaultRole(e.target.value)}
                  onInput={handleInputResize}
                  className="form-input w-full resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#1980e6] placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                  style={{ height: "auto" }}
                />
              </label>
              <label className="flex flex-col min-w-40 w-full max-w-[480px]">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">Train Ratio</p>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="Input Train Ratio (0-1)"
                  value={trainRatio}
                  onChange={(e) => setTrainRatio(parseFloat(e.target.value))}
                  className="form-input w-full resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#1980e6] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                />
              </label>
            </div>

            <div className="flex px-4 py-3 justify-center w-full">
              <button
                onClick={handleSubmit}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#0074D9] text-white text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Create</span>
              </button>
            </div>
            <div className="flex px-4 py-3 justify-center w-full">
              <button
                onClick={() => navigate('/projects')}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#AAAAAA] text-white text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;

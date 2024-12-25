import React , {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './oneproject';

const Projectlist_content = () => {
    const [projects, setProjects] = useState([]);
    const backendurl = process.env.REACT_APP_BACKEND_URL;
    const navigate = useNavigate();

    useEffect(() => {
        fetch(backendurl+'/projects/list')
            .then(response => response.json())
            .then(data => setProjects(data))
            .catch(error => console.error('Error fetching project list:', error));
    }, []);
    console.log(projects);

    const handleAddProject = () => {
        navigate('/makepro');
    };

    const gridStyles = {
        display: "flex",
        justifyContent: "center",
        gap: "3rem",
        flexWrap: "wrap",
    };

    return (
        <div className="px-40 flex flex-1 justify-center py-5" style={{ width: "100%" }}>
            <div className="layout-content-container flex flex-col flex-1">
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
                            PlayGround
                        </a>
                        </div>
                        <div className="flex gap-2">
                        </div>
                    </div>
                    </header>
                <div className="flex items-center justify-between px-4 pb-2 pt-4">
                    <h3 className="text-[#111318] text-lg font-bold leading-tight tracking-[-0.015em]">
                        Projects
                    </h3>
                    <button
                        onClick={handleAddProject}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-lg"
                        title="Add Project"
                    >
                        +
                    </button>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
                <div style={gridStyles}>
                    {projects.map((project, index) => (
                        <ProductCard
                            key={index}
                            image={project.first_image || 'https://via.placeholder.com/150'}
                            title={project.name}
                            price={project.created_at}
                            pid={project.id}
                        />
                    ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Projectlist_content;
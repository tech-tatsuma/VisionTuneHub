import React , {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectDetails from './ProjectDetails';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [projectsPerPage] = useState(10);
    const [visiblePages, setVisiblePages] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false); 
    const backendurl = process.env.REACT_APP_BACKEND_URL;
    const navigate = useNavigate();

    useEffect(() => {
        fetch(backendurl+'/projects/list')
            .then(response => response.json())
            .then(data => setProjects(data))
            .catch(error => console.error('Error fetching project list:', error));
    }, []);

    useEffect(() => {
        const calculateVisiblePages = () => {
            const totalPages = Math.ceil(projects.length / projectsPerPage);
            const range = 2; // Number of pages to show before and after the current page
            const startPage = Math.max(1, currentPage - range);
            const endPage = Math.min(totalPages, currentPage + range);

            let pages = [];
            if (startPage > 1) pages.push(1);
            if (startPage > 2) pages.push('...');

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            if (endPage < totalPages - 1) pages.push('...');
            if (endPage < totalPages) pages.push(totalPages);

            setVisiblePages(pages);
        };

        calculateVisiblePages();
    }, [projects.length, currentPage, projectsPerPage]);

    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(projects.length / projectsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleAddProject = () => {
        navigate('/makepro');
    };

    const gridStyles = {
        display: "flex",
        justifyContent: "center",
        gap: "3rem",
        flexWrap: "wrap",
    };
    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    return (
        <div className="sm:px-20 px-4 flex flex-1 justify-center py-5" style={{ width: "100%" }}>
            <div className="layout-content-container flex flex-col flex-1">
                    {/* Header */}
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
                                className="text-black text-sm font-medium leading-normal"
                                href="/playground"
                                style={{
                                    transition: "color 0.3s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#577399")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
                            >
                                PlayGround
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
                                    href="/playground"
                                    className="text-gray-700 hover:text-blue-400"
                                >
                                    PlayGround
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
                <div className="flex items-center justify-between px-4 pb-2 pt-4">
                    <h3 className="text-[#111318] text-lg font-bold leading-tight tracking-[-0.015em]">
                        Projects
                    </h3>
                    <button
                        onClick={handleAddProject}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-lg"
                        title="Add Project"
                        style={{ background: "#577399" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#495867")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#577399")}
                    >
                        +
                    </button>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
                <div style={gridStyles}>
                {currentProjects.map((project, index) => (
                            <ProjectDetails
                                key={index}
                                image={project.first_image || 'https://via.placeholder.com/150'}
                                title={project.name}
                                price={project.created_at}
                                pid={project.id}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex justify-center mt-4">
                    {visiblePages.map((pageNumber, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`mx-1 px-3 py-1 rounded-full ${
                                currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                            } hover:bg-blue-400 focus:outline-none ${pageNumber === '...' ? 'cursor-default' : ''}`}
                            disabled={pageNumber === '...'}
                            style={{ background: "#577399"}}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#495867")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#577399")}
                        >
                            {pageNumber}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ProjectList;
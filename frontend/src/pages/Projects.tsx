import React from "react";

import ProjectList from "../components/ProjectList";
import { useAppContext } from "../contexts/useAppContext";

const Projects: React.FC = () => {
  const { projects } = useAppContext();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="relative">
        <ProjectList projects={projects} />
      </div>
    </div>
  );
};

export default Projects;

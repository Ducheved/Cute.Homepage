import React from "react";

import { useAppContext } from "../contexts/useAppContext";
import { Project } from "../types";

interface ProjectItemProps {
  project: Project;
  isLastInMonth: boolean;
  isLastMonthInYear: boolean;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  isLastInMonth,
  isLastMonthInYear,
}) => {
  const { handleReadMore } = useAppContext();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      handleReadMore(project);
    }
  };

  return (
    <button
      className={`project-item mb-8 w-full text-left ${
        isLastInMonth && !isLastMonthInYear ? "continuous-line" : ""
      }`}
      onClick={() => handleReadMore(project)}
      onKeyDown={handleKeyDown}
    >
      <div className="project-content relative overflow-hidden rounded-xl border border-accent-purple bg-dark-200 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${project.imageUrl})` }}
        ></div>

        <h3 className="relative mb-3 text-2xl font-bold text-accent-blue">
          {project.title}
        </h3>

        <div className="relative mb-4 flex items-center space-x-4">
          {Array.isArray(project.stack)
            ? project.stack.map((icon, iconIndex) => (
                <span
                  key={iconIndex}
                  className="text-3xl text-gray-400 transition-transform duration-200 hover:scale-125"
                >
                  {icon}
                </span>
              ))
            : null}
        </div>

        <p className="relative mb-4 text-sm text-gray-300">
          {project.description}
        </p>

        <div className="absolute top-2 right-2 flex flex-wrap gap-2 max-w-[150px]">
          {Array.isArray(project.tags)
            ? project.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="rounded-full bg-accent-purple bg-opacity-20 px-3 py-1 text-xs font-semibold text-gray-200 shadow-sm transform rotate-3 hover:rotate-0 transition-transform duration-200"
                >
                  {tag}
                </span>
              ))
            : null}
        </div>
      </div>
    </button>
  );
};
export default ProjectItem;

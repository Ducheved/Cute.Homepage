import React from "react";

import { ProjectGroup } from "../types";

import ProjectItem from "./ProjectItem";

interface ProjectListProps {
  projects: ProjectGroup[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  const sortedProjects = [...projects].sort(
    (a, b) => parseInt(b.year) - parseInt(a.year),
  );
  return (
    <div className="roadmap-container w-full max-w-6xl">
      {sortedProjects.map((projectGroup, groupIndex) => (
        <div key={groupIndex} className="year-group mb-16">
          <div className="year-title">{projectGroup.year}</div>
          {projectGroup.months.map((month, monthIndex) => (
            <div key={monthIndex} className="month-group mb-12">
              <div className="month-title">{month.month}</div>
              <div className="project-items">
                {month.items.map((project, projectIndex) => (
                  <ProjectItem
                    key={projectIndex}
                    project={project}
                    isLastInMonth={projectIndex === month.items.length - 1}
                    isLastMonthInYear={
                      monthIndex === projectGroup.months.length - 1
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ProjectList;

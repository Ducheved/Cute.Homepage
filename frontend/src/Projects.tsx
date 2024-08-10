import { useState, useEffect } from "react";
import { FaReact, FaNodeJs, FaPython, FaJava, FaDocker } from "react-icons/fa";
import {
  SiTypescript,
  SiJavascript,
  SiMongodb,
  SiPostgresql,
  SiTailwindcss,
  SiFastify,
  SiVite,
} from "react-icons/si";

import env from "./env";
import { FormattedProjectGroup, BaseProjectGroup } from "./types";

const iconMap = {
  react: <FaReact />,
  nodejs: <FaNodeJs />,
  python: <FaPython />,
  java: <FaJava />,
  docker: <FaDocker />,
  typescript: <SiTypescript />,
  javascript: <SiJavascript />,
  mongodb: <SiMongodb />,
  postgresq: <SiPostgresql />,
  tailwindcss: <SiTailwindcss />,
  ts: <SiTypescript />,
  js: <SiJavascript />,
  fastify: <SiFastify />,
  vite: <SiVite />,
};

type IconKey = keyof typeof iconMap;

function App() {
  const [projects, setProjects] = useState<FormattedProjectGroup[]>([]);
  const [modalContent, setModalContent] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${env.VITE_API_URL}/api/projects`)
      .then((response) => response.json())
      .then((data: BaseProjectGroup[]) => {
        const formattedProjects: FormattedProjectGroup[] = data.map(
          (group) => ({
            ...group,
            months: group.months.map((month) => ({
              ...month,
              items: month.items.map((item) => ({
                ...item,
                stack: Array.isArray(item.stack)
                  ? (item.stack as string[])
                      .map((tech) => {
                        const key = tech.toLowerCase() as IconKey;
                        return key in iconMap ? iconMap[key] : null;
                      })
                      .filter((icon): icon is JSX.Element => icon !== null)
                  : item.stack,
              })),
            })),
          }),
        );
        setProjects(formattedProjects);
      })
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  const handleReadMore = (content: string) => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-10 px-4">
      <div className="roadmap-container w-full max-w-6xl">
        {projects.map((projectGroup, groupIndex) => (
          <div
            key={groupIndex}
            className={`year-group mb-16 ${groupIndex > 0 ? "year-gap" : ""}`}
          >
            <div className="year-title">{projectGroup.year}</div>
            {projectGroup.months.map((month, monthIndex) => {
              const nextMonth = projectGroup.months[monthIndex + 1];
              const isLastMonthInYear =
                monthIndex === projectGroup.months.length - 1;
              const hasGap =
                nextMonth &&
                parseInt(nextMonth.month) - parseInt(month.month) > 1;

              return (
                <div
                  key={monthIndex}
                  className={`month-group mb-12 ${
                    monthIndex > 0 ? "month-gap" : ""
                  } ${hasGap ? "dashed-line" : ""} ${
                    isLastMonthInYear ? "last-month" : ""
                  }`}
                >
                  <div className="month-title">{month.month}</div>
                  <div className="project-items">
                    {Array.isArray(month.items) &&
                      month.items.map((project, projectIndex) => (
                        <div
                          key={projectIndex}
                          className={`project-item mb-8 ${
                            projectIndex === month.items.length - 1 &&
                            !isLastMonthInYear
                              ? "continuous-line"
                              : ""
                          }`}
                        >
                          <div
                            className="project-content border-2 rounded-lg"
                            style={{
                              backgroundImage: `url(${project.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              position: "relative",
                              overflow: "hidden",
                              borderColor: "#2d3748",
                              backgroundBlendMode: "multiply",
                              backdropFilter: "blur(25px)",
                            }}
                          >
                            <h3 className="text-xl font-medium text-blue-300 mb-2">
                              {project.title}
                            </h3>
                            <div className="flex items-center space-x-2 mb-4">
                              {Array.isArray(project.stack) &&
                                project.stack.map((icon, iconIndex) => (
                                  <span
                                    key={iconIndex}
                                    className="text-xl text-gray-400"
                                  >
                                    {icon}
                                  </span>
                                ))}
                            </div>
                            <p className="text-base text-gray-300 mb-4">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {Array.isArray(project.tags) &&
                                project.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="bg-blue-500 bg-opacity-50 text-white px-2 py-1 rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>
                            <a
                              href={project.link}
                              className="text-blue-300 text-sm underline mb-4 block hover:text-blue-200"
                            >
                              Project Link
                            </a>
                            <button
                              className="bg-blue-500 text-white py-1 px-3 rounded text-sm shadow hover:bg-blue-400 transition duration-300"
                              onClick={() =>
                                handleReadMore(project.fullDescription)
                              }
                            >
                              Read More
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {modalContent && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-blue-300">
              Full Description
            </h2>
            <p className="text-base text-gray-300 mb-4">{modalContent}</p>
            <button
              className="bg-blue-500 text-white py-1 px-3 rounded text-sm shadow hover:bg-blue-400 transition duration-300"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import React from "react";

import { useAppContext } from "../contexts/useAppContext";
import { Project } from "../types";

const Modal: React.FC = () => {
  const { modalContent, closeModal } = useAppContext();

  if (!modalContent) return null;

  const project = modalContent as unknown as Project;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-dark-200 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-accent-purple opacity-5"></div>

        <h2 className="relative mb-6 text-3xl font-bold text-accent-blue">
          {project.title}
        </h2>

        <div className="relative mb-8 flex">
          <div className="w-1/2 pr-4">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-auto rounded-lg mb-4"
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="rounded-full bg-accent-purple bg-opacity-20 px-3 py-1 text-xs font-semibold text-gray-200 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-4 mb-4">
              {project.stack.map((icon, iconIndex) => (
                <span key={iconIndex} className="text-3xl text-gray-400">
                  {icon}
                </span>
              ))}
            </div>
            <a
              href={project.link}
              className="inline-block rounded bg-accent-blue px-6 py-3 text-sm font-semibold text-dark-300 shadow-md transition-all duration-200 hover:bg-accent-purple hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-opacity-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Project
            </a>
          </div>
          <div className="w-1/2 pl-4">
            <div className="max-h-96 overflow-y-auto pr-4 text-gray-300 scrollbar-thin scrollbar-thumb-accent-purple scrollbar-track-dark-100">
              <p className="text-base leading-relaxed">
                {project.fullDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex justify-end">
          <button
            className="rounded-lg bg-accent-blue px-6 py-3 text-sm font-semibold text-dark-300 shadow-md transition-all duration-200 hover:bg-accent-purple hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-opacity-50"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
